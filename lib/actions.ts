"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, can } from "@/lib/permissions";
import { saveAttachmentFile } from "@/lib/storage";
import type { Acao } from "@/lib/recursos";

async function requireAction(recurso: string, acao: Acao) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado.");
  if (!can(user, recurso, acao)) throw new Error("Você não tem permissão para esta ação.");
  return user;
}

function numeroSequencial(prefixo: string, contagemAtual: number): string {
  const ano = new Date().getFullYear();
  return `${prefixo}-${ano}-${String(contagemAtual + 1).padStart(4, "0")}`;
}

// Estimativas usadas pra calcular o custo de cada lote automaticamente até a Biogreen
// confirmar valores reais (hora de mão de obra, rateio de embalagem/energia por kg) —
// ver docs/PERGUNTAS.md. Nenhum lançamento fiscal depende disso; é só Centro de Custo.
const VALOR_HORA_MAO_DE_OBRA = 45;
const CUSTO_EMBALAGEM_POR_KG = 0.15;
const CUSTO_ENERGIA_POR_KG = 0.08;

export async function criarPedido(formData: FormData) {
  const user = await requireAction("comercial.pedidos", "podeCriar");

  const clienteId = Number(formData.get("clienteId"));
  const produtoId = Number(formData.get("produtoId"));
  const quantidade = Number(formData.get("quantidade"));
  const precoUnitario = Number(formData.get("precoUnitario"));

  if (!clienteId || !produtoId || !quantidade || !precoUnitario) {
    throw new Error("Preencha cliente, produto, quantidade e preço.");
  }

  const contagem = await prisma.pedidoVenda.count();
  const numero = numeroSequencial("PV", contagem);

  const pedido = await prisma.pedidoVenda.create({
    data: {
      clienteId,
      numero,
      status: "PENDENTE",
      condicaoPagamento: (formData.get("condicaoPagamento") as string) || null,
      createdById: user.id,
      itens: { create: [{ produtoId, quantidade, precoUnitario }] },
    },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "PedidoVenda", entidadeId: pedido.id, acao: "criou" },
  });

  revalidatePath("/comercial");
  revalidatePath("/");
}

export async function aprovarPedido(pedidoId: number) {
  const user = await requireAction("comercial.pedidos", "podeAprovar");

  const pedido = await prisma.pedidoVenda.findUniqueOrThrow({
    where: { id: pedidoId },
    include: { itens: true },
  });

  for (const item of pedido.itens) {
    let formula = await prisma.formula.findFirst({
      where: { produtoId: item.produtoId, ativa: true },
      include: { itens: true },
    });
    if (!formula) {
      formula = await prisma.formula.create({
        data: { produtoId: item.produtoId, versao: 1, ativa: true },
        include: { itens: true },
      });
    }

    const opContagem = await prisma.ordemProducao.count();
    const numero = numeroSequencial("OP", opContagem);

    // Nasce em PLANEJADA — vai pro PCP revisar/ajustar a fórmula antes de liberar a
    // produção de verdade (é lá que a baixa automática de matéria-prima acontece).
    await prisma.ordemProducao.create({
      data: {
        numero,
        pedidoVendaId: pedido.id,
        pedidoVendaItemId: item.id,
        formulaId: formula.id,
        status: "PLANEJADA",
        quantidadePlanejada: item.quantidade,
        createdById: user.id,
      },
    });
  }

  await prisma.pedidoVenda.update({
    where: { id: pedido.id },
    data: { status: "APROVADO", updatedById: user.id },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "PedidoVenda", entidadeId: pedido.id, acao: "aprovou e enviou ao PCP" },
  });

  revalidatePath("/comercial");
  revalidatePath("/pcp");
  revalidatePath("/");
}

export async function aprovarPCP(formData: FormData) {
  const user = await requireAction("producao.formulas", "podeAprovar");

  const opId = Number(formData.get("opId"));
  const op = await prisma.ordemProducao.findUniqueOrThrow({
    where: { id: opId },
    include: { formula: { include: { itens: true } } },
  });
  if (op.status !== "PLANEJADA") return;

  // Se o PCP mexeu em algum valor do formulário, isso vira uma NOVA versão da fórmula
  // (não sobrescreve a original — outros pedidos continuam usando a fórmula base).
  const edicoes = op.formula.itens
    .map((item) => {
      const valor = formData.get(`qtd_${item.id}`);
      if (valor === null) return null;
      const nova = Number(valor);
      return Number.isFinite(nova) && nova !== Number(item.quantidade) ? { itemId: item.id, quantidade: nova } : null;
    })
    .filter((e): e is { itemId: number; quantidade: number } => e !== null);

  let formulaFinal = op.formula;

  if (edicoes.length > 0) {
    const versaoMax = await prisma.formula.aggregate({
      where: { produtoId: op.formula.produtoId },
      _max: { versao: true },
    });
    formulaFinal = await prisma.formula.create({
      data: {
        produtoId: op.formula.produtoId,
        versao: (versaoMax._max.versao ?? 0) + 1,
        rendimento: op.formula.rendimento,
        tempoMinutos: op.formula.tempoMinutos,
        epi: op.formula.epi,
        instrucoes: op.formula.instrucoes,
        ativa: true,
        itens: {
          create: op.formula.itens.map((item) => {
            const edicao = edicoes.find((e) => e.itemId === item.id);
            return {
              materiaPrimaId: item.materiaPrimaId,
              quantidade: edicao ? edicao.quantidade : item.quantidade,
              ordem: item.ordem,
            };
          }),
        },
      },
      include: { itens: true },
    });
    await prisma.ordemProducao.update({ where: { id: op.id }, data: { formulaId: formulaFinal.id } });
  }

  // Baixa automática das matérias-primas ao liberar pra produção — proporcional à fórmula
  // final (original ou ajustada pelo PCP), sem ninguém precisar digitar percentual.
  const almoxarifadoMp = await prisma.localEstoque.findFirst({ where: { tipo: "ALMOXARIFADO_MP" } });
  if (formulaFinal.itens.length > 0 && almoxarifadoMp) {
    const rendimento = Number(formulaFinal.rendimento ?? 0);
    const fator = rendimento > 0 ? Number(op.quantidadePlanejada) / rendimento : 1;

    for (const item of formulaFinal.itens) {
      await prisma.estoqueMovimento.create({
        data: {
          localEstoqueId: almoxarifadoMp.id,
          materiaPrimaId: item.materiaPrimaId,
          tipo: "SAIDA",
          quantidade: Number(item.quantidade) * fator,
          motivo: `Consumo automático (fórmula${edicoes.length > 0 ? " ajustada pelo PCP" : ""}) — ${op.numero}`,
          createdById: user.id,
        },
      });
    }
  }

  await prisma.ordemProducao.update({
    where: { id: op.id },
    data: { status: "EM_PRODUCAO", dataInicio: new Date() },
  });

  if (op.pedidoVendaId) {
    await prisma.pedidoVenda.update({ where: { id: op.pedidoVendaId }, data: { status: "EM_PRODUCAO" } });
  }

  await prisma.auditLog.create({
    data: {
      usuarioId: user.id,
      entidade: "OrdemProducao",
      entidadeId: op.id,
      acao: edicoes.length > 0 ? "ajustou a fórmula e liberou produção de" : "liberou produção de",
    },
  });

  revalidatePath("/pcp");
  revalidatePath("/producao");
  revalidatePath("/comercial");
  revalidatePath("/estoque");
  revalidatePath("/");
}

export async function concluirProducao(ordemId: number) {
  const user = await requireAction("producao.ordens", "podeEditar");

  const op = await prisma.ordemProducao.findUniqueOrThrow({
    where: { id: ordemId },
    include: { formula: { include: { itens: { include: { materiaPrima: true } } } } },
  });
  if (op.status === "CONCLUIDA") return;

  const local = await prisma.localEstoque.findFirst({ where: { tipo: "PRODUTO_ACABADO" } });
  const loteContagem = await prisma.lote.count();
  const numeroLote = `BG-${String(loteContagem + 1).padStart(5, "0")}`;
  const agora = new Date();

  const lote = await prisma.lote.create({
    data: {
      numeroLote,
      produtoId: op.formula.produtoId,
      ordemProducaoId: op.id,
      quantidade: op.quantidadePlanejada,
      dataFabricacao: agora,
      dataValidade: new Date(agora.getTime() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.ordemProducao.update({
    where: { id: op.id },
    data: { status: "CONCLUIDA", quantidadeReal: op.quantidadePlanejada, dataFim: agora },
  });

  if (local) {
    await prisma.estoqueMovimento.create({
      data: {
        localEstoqueId: local.id,
        produtoId: op.formula.produtoId,
        loteId: lote.id,
        tipo: "ENTRADA",
        quantidade: op.quantidadePlanejada,
        motivo: `Produção concluída — ${op.numero}`,
        createdById: user.id,
      },
    });
  }

  // Centro de Custo: calcula o custo do lote na hora — matéria-prima pelo custo médio
  // cadastrado, mão de obra pelo tempo da fórmula, embalagem/energia por kg produzido.
  const rendimentoCusto = Number(op.formula.rendimento ?? 0);
  const fatorCusto = rendimentoCusto > 0 ? Number(op.quantidadePlanejada) / rendimentoCusto : 1;
  const custoMateriaPrima = op.formula.itens.reduce(
    (acc, item) => acc + Number(item.quantidade) * fatorCusto * Number(item.materiaPrima.custoMedio ?? 0),
    0
  );
  const custoMaoObra = (Number(op.formula.tempoMinutos ?? 0) / 60) * VALOR_HORA_MAO_DE_OBRA;
  const custoEmbalagem = Number(op.quantidadePlanejada) * CUSTO_EMBALAGEM_POR_KG;
  const custoEnergiaRateada = Number(op.quantidadePlanejada) * CUSTO_ENERGIA_POR_KG;

  await prisma.custoLote.create({
    data: {
      loteId: lote.id,
      custoMateriaPrima,
      custoMaoObra,
      custoEmbalagem,
      custoEnergiaRateada,
      custoTotal: custoMateriaPrima + custoMaoObra + custoEmbalagem + custoEnergiaRateada,
    },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "OrdemProducao", entidadeId: op.id, acao: "concluiu produção de" },
  });

  revalidatePath("/producao");
  revalidatePath("/estoque");
  revalidatePath("/comercial");
  revalidatePath("/custeio");
  revalidatePath("/");
}

export async function gerarNotaFiscal(pedidoId: number) {
  const user = await requireAction("fiscal.notas", "podeCriar");

  const pedido = await prisma.pedidoVenda.findUniqueOrThrow({
    where: { id: pedidoId },
    include: { itens: true },
  });

  const valorTotal = pedido.itens.reduce((acc, i) => acc + Number(i.quantidade) * Number(i.precoUnitario), 0);
  const nfContagem = await prisma.notaFiscal.count();
  const numero = String(nfContagem + 1).padStart(6, "0");
  const agora = new Date();

  await prisma.notaFiscal.create({
    data: {
      tipo: "VENDA",
      pedidoVendaId: pedido.id,
      clienteId: pedido.clienteId,
      numero,
      serie: "1",
      status: "AUTORIZADA",
      valorTotal,
      emitidaEm: agora,
    },
  });

  const planoReceita = await prisma.planoContas.findFirst({ where: { tipo: "RECEITA" } });

  await prisma.contaReceber.create({
    data: {
      clienteId: pedido.clienteId,
      pedidoVendaId: pedido.id,
      planoContasId: planoReceita?.id,
      valor: valorTotal,
      valorPago: 0,
      vencimento: new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: "ABERTO",
    },
  });

  await prisma.pedidoVenda.update({
    where: { id: pedido.id },
    data: { status: "FATURADO", updatedById: user.id },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "PedidoVenda", entidadeId: pedido.id, acao: "gerou nota fiscal de" },
  });

  revalidatePath("/fiscal");
  revalidatePath("/comercial");
  revalidatePath("/financeiro");
  revalidatePath("/");
}

export async function gerarExpedicao(pedidoId: number) {
  const user = await requireAction("logistica.expedicao", "podeCriar");

  const pedido = await prisma.pedidoVenda.findUniqueOrThrow({
    where: { id: pedidoId },
    include: { itens: true },
  });

  const local = await prisma.localEstoque.findFirst({ where: { tipo: "PRODUTO_ACABADO" } });
  const agora = new Date();

  await prisma.expedicao.create({
    data: { pedidoVendaId: pedido.id, status: "EXPEDIDO", dataAgendamento: agora },
  });

  if (local) {
    for (const item of pedido.itens) {
      await prisma.estoqueMovimento.create({
        data: {
          localEstoqueId: local.id,
          produtoId: item.produtoId,
          tipo: "SAIDA",
          quantidade: item.quantidade,
          motivo: `Expedição — ${pedido.numero}`,
          createdById: user.id,
        },
      });
    }
  }

  await prisma.pedidoVenda.update({
    where: { id: pedido.id },
    data: { status: "EXPEDIDO", updatedById: user.id },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "PedidoVenda", entidadeId: pedido.id, acao: "expediu" },
  });

  revalidatePath("/logistica");
  revalidatePath("/estoque");
  revalidatePath("/comercial");
  revalidatePath("/");
}

export async function emitirLaudo(loteId: number) {
  const user = await requireAction("qualidade.especificacoes", "podeCriar");

  const lote = await prisma.lote.findUniqueOrThrow({ where: { id: loteId } });
  const existente = await prisma.coaDocumento.findFirst({ where: { loteId: lote.id } });
  if (existente) return;

  let especificacao = await prisma.especificacao.findFirst({ where: { produtoId: lote.produtoId } });
  if (!especificacao) {
    especificacao = await prisma.especificacao.create({
      data: { produtoId: lote.produtoId, parametro: "Controle de processo", metodo: "Inspeção visual e de processo" },
    });
  }

  await prisma.analiseLote.create({
    data: {
      loteId: lote.id,
      especificacaoId: especificacao.id,
      valorMedido: 1,
      aprovado: true,
      analistaId: user.id,
      dataAnalise: new Date(),
    },
  });

  await prisma.coaDocumento.create({
    data: { loteId: lote.id, pdfUrl: `/coa/${lote.numeroLote.toLowerCase()}.pdf` },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "Lote", entidadeId: lote.id, acao: "emitiu laudo (COA) de" },
  });

  revalidatePath("/qualidade");
  revalidatePath("/producao");
  revalidatePath("/");
}

export async function criarAtivo(formData: FormData) {
  const user = await requireAction("patrimonio.ativos", "podeCriar");

  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as string;
  if (!nome || !categoria) throw new Error("Preencha nome e categoria.");

  const fornecedorId = formData.get("fornecedorId") ? Number(formData.get("fornecedorId")) : null;
  const valorAquisicao = formData.get("valorAquisicao") ? Number(formData.get("valorAquisicao")) : null;
  const dataAquisicao = formData.get("dataAquisicao") ? new Date(formData.get("dataAquisicao") as string) : null;

  const ativo = await prisma.ativo.create({
    data: {
      nome,
      categoria,
      fornecedorId,
      numeroSerie: (formData.get("numeroSerie") as string) || null,
      dataAquisicao,
      valorAquisicao,
      localizacao: (formData.get("localizacao") as string) || null,
      vidaUtilAnos: formData.get("vidaUtilAnos") ? Number(formData.get("vidaUtilAnos")) : null,
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "Ativo", entidadeId: ativo.id, acao: "cadastrou" },
  });

  revalidatePath("/ativos");
  revalidatePath("/");
}

export async function baixarAtivo(ativoId: number) {
  const user = await requireAction("patrimonio.ativos", "podeEditar");

  await prisma.ativo.update({ where: { id: ativoId }, data: { status: "BAIXADO", updatedById: user.id } });
  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "Ativo", entidadeId: ativoId, acao: "deu baixa em" },
  });

  revalidatePath("/ativos");
}

export async function atualizarExpedicao(formData: FormData) {
  const user = await requireAction("logistica.expedicao", "podeEditar");

  const expedicaoId = Number(formData.get("expedicaoId"));
  const valorFreteRaw = formData.get("valorFrete");
  const valorFrete = valorFreteRaw && valorFreteRaw !== "" ? Number(valorFreteRaw) : undefined;

  if (valorFrete !== undefined) {
    await prisma.expedicao.update({ where: { id: expedicaoId }, data: { valorFrete } });
  }

  const arquivo = formData.get("arquivo");
  if (arquivo instanceof File && arquivo.size > 0) {
    const bytes = Buffer.from(await arquivo.arrayBuffer());
    const url = await saveAttachmentFile("Expedicao", expedicaoId, arquivo.name, bytes);
    await prisma.anexo.create({
      data: {
        entidadeTipo: "Expedicao",
        entidadeId: expedicaoId,
        nome: arquivo.name,
        url,
        mimeType: arquivo.type || null,
        tamanho: arquivo.size,
        createdById: user.id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      usuarioId: user.id,
      entidade: "Expedicao",
      entidadeId: expedicaoId,
      acao: arquivo instanceof File && arquivo.size > 0 ? "anexou canhoto/NF em" : "atualizou frete de",
    },
  });

  revalidatePath("/logistica");
}
