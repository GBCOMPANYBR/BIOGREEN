"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, can } from "@/lib/permissions";
import { saveAttachmentFile } from "@/lib/storage";
import { calcularParcelas } from "@/lib/parcelas";
import { lerPontosDoFormData, lerHidrometrosDoFormData } from "@/lib/relatorio-visita";
import { parseNfeXml } from "@/lib/nfe-parser";
import { gerarSenhaAleatoria, hashPassword, verifyPassword } from "@/lib/auth";
import { RECURSOS, type Acao } from "@/lib/recursos";
import { saldosMateriaPrima, verificarDisponibilidade } from "@/lib/estoque";

function mensagemFaltaMateriaPrima(faltas: { materiaPrima: string; necessario: number; saldo: number }[]): string {
  const linhas = faltas.map(
    (f) => `${f.materiaPrima} (necessário ${f.necessario.toFixed(2)}, saldo ${f.saldo.toFixed(2)})`
  );
  return `Matéria-prima insuficiente para produzir: ${linhas.join("; ")}.`;
}

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
  if (!clienteId) throw new Error("Selecione o cliente.");

  // Um pedido pode ter mais de um produto — José Higor adiciona linhas com "Adicionar
  // produto" antes de registrar; os 3 campos de cada linha compartilham o mesmo `name`,
  // então getAll() devolve um array por campo, na mesma ordem em que as linhas aparecem no DOM.
  const produtoIds = formData.getAll("produtoId").map(Number);
  const quantidades = formData.getAll("quantidade").map(Number);
  const precos = formData.getAll("precoUnitario").map(Number);

  if (produtoIds.length === 0) throw new Error("Adicione ao menos um produto ao pedido.");
  const itens = produtoIds.map((produtoId, i) => ({ produtoId, quantidade: quantidades[i], precoUnitario: precos[i] }));
  if (itens.some((it) => !it.produtoId || !it.quantidade || !it.precoUnitario)) {
    throw new Error("Preencha produto, quantidade e preço em todas as linhas do pedido.");
  }

  // CIF/FOB (quem entrega) e data de saída — sinalizam pra Larissa (Logística) se ela precisa
  // cotar frete e até quando. Só "CIF" (Biogreen entrega) aparece na fila de fretes a cotar;
  // "FOB" é o cliente retirando, não tem frete da Biogreen.
  const freteTipo = (formData.get("freteTipo") as string) || null;
  const dataPrometidaRaw = formData.get("dataPrometida") as string;
  const dataPrometida = dataPrometidaRaw ? new Date(`${dataPrometidaRaw}T12:00:00`) : null;

  const contagem = await prisma.pedidoVenda.count();
  const numero = numeroSequencial("PV", contagem);

  const pedido = await prisma.pedidoVenda.create({
    data: {
      clienteId,
      numero,
      status: "PENDENTE",
      condicaoPagamento: (formData.get("condicaoPagamento") as string) || null,
      freteTipo,
      dataPrometida,
      createdById: user.id,
      itens: { create: itens },
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
  if (pedido.status !== "PENDENTE") return;

  // Antes de comprometer o pedido com o PCP, confere se há matéria-prima pra produzir
  // TODOS os itens — não adianta aprovar e travar na etapa seguinte.
  const faltas: { materiaPrima: string; necessario: number; saldo: number }[] = [];
  for (const item of pedido.itens) {
    const disponibilidade = await verificarDisponibilidade(item.produtoId, Number(item.quantidade));
    for (const d of disponibilidade) {
      if (!d.suficiente) faltas.push({ materiaPrima: d.materiaPrima, necessario: d.necessario, saldo: d.saldo });
    }
  }
  if (faltas.length > 0) throw new Error(mensagemFaltaMateriaPrima(faltas));

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
    include: { formula: { include: { itens: { include: { materiaPrima: true } } } } },
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
      include: { itens: { include: { materiaPrima: true } } },
    });
    await prisma.ordemProducao.update({ where: { id: op.id }, data: { formulaId: formulaFinal.id } });
  }

  // Baixa automática das matérias-primas ao liberar pra produção — proporcional à fórmula
  // final (original ou ajustada pelo PCP), sem ninguém precisar digitar percentual.
  const almoxarifadoMp = await prisma.localEstoque.findFirst({ where: { tipo: "ALMOXARIFADO_MP" } });
  if (!almoxarifadoMp) throw new Error("Almoxarifado de matéria-prima não cadastrado — avise o TI.");

  if (formulaFinal.itens.length > 0) {
    const rendimento = Number(formulaFinal.rendimento ?? 0);
    const fator = rendimento > 0 ? Number(op.quantidadePlanejada) / rendimento : 1;

    // Revalida com a fórmula FINAL (o PCP pode ter alterado quantidades acima) — é a
    // última linha de defesa antes de baixar estoque de verdade, então bloqueia aqui
    // mesmo que o Comercial já tenha validado na aprovação do pedido.
    const saldos = await saldosMateriaPrima(formulaFinal.itens.map((i) => i.materiaPrimaId));
    const faltas = formulaFinal.itens
      .map((item) => {
        const necessario = Number(item.quantidade) * fator;
        const saldo = saldos.get(item.materiaPrimaId) ?? 0;
        return { materiaPrima: item.materiaPrima.nome, necessario, saldo, suficiente: saldo >= necessario };
      })
      .filter((f) => !f.suficiente);
    if (faltas.length > 0) throw new Error(mensagemFaltaMateriaPrima(faltas));

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
  if (pedido.status !== "EM_PRODUCAO") return;

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

  // Uma parcela por prazo na condição de pagamento do pedido (ex.: "30/60/90 dias" -> 3
  // parcelas) — antes gerava sempre uma parcela única fixa em 30 dias.
  const parcelas = calcularParcelas(pedido.condicaoPagamento, valorTotal, agora);
  await prisma.contaReceber.createMany({
    data: parcelas.map((p) => ({
      clienteId: pedido.clienteId,
      pedidoVendaId: pedido.id,
      planoContasId: planoReceita?.id,
      valor: p.valor,
      valorPago: 0,
      vencimento: p.vencimento,
      status: "ABERTO",
    })),
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

export async function darBaixaContaReceber(formData: FormData) {
  const user = await requireAction("financeiro.contasReceber", "podeEditar");

  const contaId = Number(formData.get("contaId"));
  const valorPagoAgora = Number(formData.get("valor"));
  const dataBaixaRaw = formData.get("dataBaixa") as string;
  if (!contaId || !valorPagoAgora || valorPagoAgora <= 0) throw new Error("Informe um valor de baixa válido.");

  const conta = await prisma.contaReceber.findUniqueOrThrow({ where: { id: contaId } });
  if (conta.status === "PAGO" || conta.status === "CANCELADO") throw new Error("Este título já está encerrado.");

  const novoValorPago = Number(conta.valorPago) + valorPagoAgora;
  if (novoValorPago > Number(conta.valor) + 0.01) {
    throw new Error("O valor da baixa não pode ser maior que o saldo em aberto do título.");
  }

  await prisma.contaReceber.update({
    where: { id: contaId },
    data: {
      valorPago: novoValorPago,
      dataBaixa: dataBaixaRaw ? new Date(`${dataBaixaRaw}T12:00:00`) : new Date(),
      status: novoValorPago >= Number(conta.valor) - 0.01 ? "PAGO" : "PARCIAL",
    },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "ContaReceber", entidadeId: contaId, acao: "deu baixa em" },
  });

  revalidatePath("/financeiro");
  revalidatePath("/");
}

export async function darBaixaContaPagar(formData: FormData) {
  const user = await requireAction("financeiro.contasPagar", "podeEditar");

  const contaId = Number(formData.get("contaId"));
  const valorPagoAgora = Number(formData.get("valor"));
  const dataBaixaRaw = formData.get("dataBaixa") as string;
  if (!contaId || !valorPagoAgora || valorPagoAgora <= 0) throw new Error("Informe um valor de baixa válido.");

  const conta = await prisma.contaPagar.findUniqueOrThrow({ where: { id: contaId } });
  if (conta.status === "PAGO" || conta.status === "CANCELADO") throw new Error("Este título já está encerrado.");

  const novoValorPago = Number(conta.valorPago) + valorPagoAgora;
  if (novoValorPago > Number(conta.valor) + 0.01) {
    throw new Error("O valor da baixa não pode ser maior que o saldo em aberto do título.");
  }

  await prisma.contaPagar.update({
    where: { id: contaId },
    data: {
      valorPago: novoValorPago,
      dataBaixa: dataBaixaRaw ? new Date(`${dataBaixaRaw}T12:00:00`) : new Date(),
      status: novoValorPago >= Number(conta.valor) - 0.01 ? "PAGO" : "PARCIAL",
    },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "ContaPagar", entidadeId: contaId, acao: "deu baixa em" },
  });

  revalidatePath("/financeiro");
  revalidatePath("/compras");
  revalidatePath("/");
}

export async function gerarExpedicao(pedidoId: number) {
  const user = await requireAction("logistica.expedicao", "podeCriar");

  const pedido = await prisma.pedidoVenda.findUniqueOrThrow({
    where: { id: pedidoId },
    include: { itens: true },
  });
  if (pedido.status !== "FATURADO") return;

  const local = await prisma.localEstoque.findFirst({ where: { tipo: "PRODUTO_ACABADO" } });
  const agora = new Date();

  await prisma.expedicao.create({
    data: { pedidoVendaId: pedido.id, status: "SEPARACAO", dataAgendamento: agora },
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

const STATUS_EXPEDICAO_VALIDOS = ["SEPARACAO", "CONFERIDO", "EXPEDIDO", "ENTREGUE"] as const;

export async function atualizarExpedicao(formData: FormData) {
  const user = await requireAction("logistica.expedicao", "podeEditar");

  const expedicaoId = Number(formData.get("expedicaoId"));
  const valorFreteRaw = formData.get("valorFrete");
  const valorFrete = valorFreteRaw && valorFreteRaw !== "" ? Number(valorFreteRaw) : undefined;
  const statusRaw = formData.get("status");
  const status = STATUS_EXPEDICAO_VALIDOS.includes(statusRaw as (typeof STATUS_EXPEDICAO_VALIDOS)[number])
    ? (statusRaw as (typeof STATUS_EXPEDICAO_VALIDOS)[number])
    : undefined;

  if (valorFrete !== undefined || status !== undefined) {
    await prisma.expedicao.update({ where: { id: expedicaoId }, data: { ...(valorFrete !== undefined && { valorFrete }), ...(status && { status }) } });
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
      acao:
        arquivo instanceof File && arquivo.size > 0
          ? "anexou canhoto/NF em"
          : status
            ? `avançou status para ${status} de`
            : "atualizou frete de",
    },
  });

  revalidatePath("/logistica");
}

export async function criarMateriaPrima(formData: FormData) {
  const user = await requireAction("estoque.materiasPrimas", "podeCriar");

  const nome = (formData.get("nome") as string)?.trim();
  const unidadeMedidaId = Number(formData.get("unidadeMedidaId"));
  if (!nome || !unidadeMedidaId) throw new Error("Preencha nome e unidade de medida.");

  const fornecedorPadraoId = formData.get("fornecedorPadraoId") ? Number(formData.get("fornecedorPadraoId")) : null;
  const custoMedio = formData.get("custoMedio") ? Number(formData.get("custoMedio")) : null;
  const estoqueMinimo = formData.get("estoqueMinimo") ? Number(formData.get("estoqueMinimo")) : null;

  const contagem = await prisma.materiaPrima.count();
  const codigo = `MP-${String(contagem + 1).padStart(4, "0")}`;

  const mp = await prisma.materiaPrima.create({
    data: { codigo, nome, unidadeMedidaId, fornecedorPadraoId, custoMedio, estoqueMinimo },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "MateriaPrima", entidadeId: mp.id, acao: "cadastrou" },
  });

  revalidatePath("/estoque");
}

export async function atualizarMateriaPrima(formData: FormData) {
  const user = await requireAction("estoque.materiasPrimas", "podeEditar");

  const id = Number(formData.get("materiaPrimaId"));
  const nome = (formData.get("nome") as string)?.trim();
  const unidadeMedidaId = Number(formData.get("unidadeMedidaId"));
  if (!nome || !unidadeMedidaId) throw new Error("Preencha nome e unidade de medida.");

  const fornecedorPadraoId = formData.get("fornecedorPadraoId") ? Number(formData.get("fornecedorPadraoId")) : null;
  const custoMedio = formData.get("custoMedio") ? Number(formData.get("custoMedio")) : null;
  const estoqueMinimo = formData.get("estoqueMinimo") ? Number(formData.get("estoqueMinimo")) : null;

  await prisma.materiaPrima.update({
    where: { id },
    data: { nome, unidadeMedidaId, fornecedorPadraoId, custoMedio, estoqueMinimo },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "MateriaPrima", entidadeId: id, acao: "editou" },
  });

  revalidatePath("/estoque");
}

export async function excluirMateriaPrima(materiaPrimaId: number) {
  const user = await requireAction("estoque.materiasPrimas", "podeExcluir");

  await prisma.materiaPrima.update({
    where: { id: materiaPrimaId },
    data: { deletedAt: new Date(), ativo: false },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "MateriaPrima", entidadeId: materiaPrimaId, acao: "excluiu" },
  });

  revalidatePath("/estoque");
}

export async function criarVisita(formData: FormData) {
  const user = await requireAction("tecnica.visitas", "podeCriar");

  const clienteId = Number(formData.get("clienteId"));
  const tecnicoId = Number(formData.get("tecnicoId"));
  const dataAgendadaRaw = formData.get("dataAgendada") as string;
  if (!clienteId || !tecnicoId || !dataAgendadaRaw) throw new Error("Preencha cliente, técnico e data.");

  const visita = await prisma.visitaTecnica.create({
    data: {
      clienteId,
      tecnicoId,
      dataAgendada: new Date(`${dataAgendadaRaw}T12:00:00`),
      roteiro: (formData.get("roteiro") as string) || null,
      status: "AGENDADA",
    },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "VisitaTecnica", entidadeId: visita.id, acao: "agendou" },
  });

  revalidatePath("/tecnica");
  revalidatePath("/");
}

export async function marcarVisitaNaoRealizada(formData: FormData) {
  const user = await requireAction("tecnica.visitas", "podeEditar");

  const visitaId = Number(formData.get("visitaId"));
  const justificativa = (formData.get("justificativa") as string)?.trim();
  if (!justificativa) throw new Error("Descreva o motivo da visita não realizada.");

  await prisma.visitaTecnica.update({
    where: { id: visitaId },
    data: { status: "CANCELADA", justificativa },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "VisitaTecnica", entidadeId: visitaId, acao: "marcou como não realizada" },
  });

  revalidatePath("/tecnica");
}

export async function registrarRelatorioVisita(formData: FormData) {
  const user = await requireAction("tecnica.visitas", "podeCriar");

  const visitaTecnicaId = Number(formData.get("visitaTecnicaId"));
  const visita = await prisma.visitaTecnica.findUniqueOrThrow({ where: { id: visitaTecnicaId } });

  const pontos = lerPontosDoFormData(formData);
  const hidrometros = lerHidrometrosDoFormData(formData);
  const recomendacoes = (formData.get("recomendacoes") as string) || null;
  const proximaAcao = (formData.get("proximaAcao") as string) || null;
  const parametrosMedidos = JSON.parse(JSON.stringify({ pontos, hidrometros }));

  await prisma.relatorioVisita.upsert({
    where: { visitaTecnicaId },
    update: { parametrosMedidos, produtosAplicados: [], recomendacoes, proximaAcao },
    create: {
      visitaTecnicaId,
      parametrosMedidos,
      produtosAplicados: [],
      recomendacoes,
      proximaAcao,
    },
  });

  const fotos = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  for (const foto of fotos) {
    const bytes = Buffer.from(await foto.arrayBuffer());
    const url = await saveAttachmentFile("VisitaTecnica", visitaTecnicaId, foto.name, bytes);
    await prisma.anexo.create({
      data: {
        entidadeTipo: "VisitaTecnica",
        entidadeId: visitaTecnicaId,
        nome: foto.name,
        url,
        mimeType: foto.type || null,
        tamanho: foto.size,
        createdById: user.id,
      },
    });
  }

  await prisma.visitaTecnica.update({ where: { id: visita.id }, data: { status: "REALIZADA" } });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "VisitaTecnica", entidadeId: visita.id, acao: "registrou relatório de" },
  });

  revalidatePath("/tecnica");
  revalidatePath("/");
}

export async function importarNfeEntrada(formData: FormData) {
  const user = await requireAction("compras.pedidos", "podeCriar");

  const arquivo = formData.get("xml");
  if (!(arquivo instanceof File) || arquivo.size === 0) throw new Error("Selecione o arquivo XML da NF-e.");

  const xmlTexto = await arquivo.text();
  const nfe = parseNfeXml(xmlTexto);
  if (!nfe.fornecedorCnpj || !nfe.numero) throw new Error("Não consegui ler fornecedor/número da NF-e nesse XML.");

  let fornecedor = await prisma.fornecedor.findUnique({ where: { cnpjCpf: nfe.fornecedorCnpj } });
  if (!fornecedor) {
    fornecedor = await prisma.fornecedor.create({
      data: {
        empresaId: (await prisma.empresa.findFirstOrThrow()).id,
        razaoSocial: nfe.fornecedorNome || nfe.fornecedorCnpj,
        cnpjCpf: nfe.fornecedorCnpj,
        pais: "Brasil",
        createdById: user.id,
      },
    });
  }

  const itensJson = nfe.itens.map((i) => ({ ...i, lancadoComoMateriaPrima: false, materiaPrimaId: null }));

  const nfEntrada = await prisma.notaFiscalEntrada.create({
    data: {
      fornecedorId: fornecedor.id,
      numero: nfe.numero,
      serie: nfe.serie || null,
      chaveAcesso: nfe.chaveAcesso,
      dataEmissao: nfe.dataEmissao,
      valorTotal: nfe.valorTotal,
      itensJson,
    },
  });

  const bytes = Buffer.from(xmlTexto, "utf-8");
  const xmlUrl = await saveAttachmentFile("NotaFiscalEntrada", nfEntrada.id, arquivo.name, bytes);
  await prisma.notaFiscalEntrada.update({ where: { id: nfEntrada.id }, data: { xmlUrl } });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "NotaFiscalEntrada", entidadeId: nfEntrada.id, acao: "importou XML de" },
  });

  revalidatePath("/compras");
}

export async function categorizarNotaFiscalEntrada(formData: FormData) {
  const user = await requireAction("compras.pedidos", "podeCriar");

  const notaFiscalEntradaId = Number(formData.get("notaFiscalEntradaId"));
  const planoContasId = Number(formData.get("planoContasId"));
  const vencimentoRaw = formData.get("vencimento") as string;
  if (!planoContasId || !vencimentoRaw) throw new Error("Escolha o centro de custo e o vencimento.");

  const nf = await prisma.notaFiscalEntrada.findUniqueOrThrow({ where: { id: notaFiscalEntradaId }, include: { contaPagar: true } });
  if (nf.contaPagar) return;

  // CIF (fornecedor entrega) ou FOB (Biogreen busca) — só "FOB" entra na fila de coletas da
  // Larissa; sinalizado aqui porque é o momento em que José Higor "lança" a compra de verdade.
  const tipoFrete = (formData.get("tipoFrete") as string) || null;

  await prisma.contaPagar.create({
    data: {
      fornecedorId: nf.fornecedorId,
      notaFiscalEntradaId: nf.id,
      planoContasId,
      valor: nf.valorTotal ?? 0,
      valorPago: 0,
      vencimento: new Date(`${vencimentoRaw}T12:00:00`),
      status: "ABERTO",
    },
  });

  await prisma.notaFiscalEntrada.update({ where: { id: nf.id }, data: { tipoFrete } });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "NotaFiscalEntrada", entidadeId: nf.id, acao: "categorizou e lançou conta a pagar de" },
  });

  revalidatePath("/compras");
  revalidatePath("/financeiro");
  revalidatePath("/logistica");
}

interface ItemNfArmazenado {
  descricao: string;
  ncm?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  lancadoComoMateriaPrima: boolean;
  materiaPrimaId: number | null;
}

export async function darEntradaItemComoMateriaPrima(formData: FormData) {
  const user = await requireAction("estoque.materiasPrimas", "podeCriar");

  const notaFiscalEntradaId = Number(formData.get("notaFiscalEntradaId"));
  const itemIndex = Number(formData.get("itemIndex"));
  // "nova" cadastra uma matéria-prima nova com o nome exato da nota; qualquer outro valor é o
  // id de uma matéria-prima JÁ cadastrada — nunca casamos por nome sozinhos: é sempre o Igor
  // quem escolhe, pra "SODA CAUSTICA" da nota sempre virar a mesma "Soda" do cadastro, não uma
  // segunda entrada (era exatamente esse o problema que a Karol descreveu no Conta Azul).
  const escolha = formData.get("materiaPrimaId") as string;

  const nf = await prisma.notaFiscalEntrada.findUniqueOrThrow({ where: { id: notaFiscalEntradaId } });
  const itens = (nf.itensJson as unknown as ItemNfArmazenado[]) ?? [];
  const item = itens[itemIndex];
  if (!item || item.lancadoComoMateriaPrima || !escolha) return;

  let materiaPrima;
  if (escolha === "nova") {
    const siglaUnidade = item.unidade.toUpperCase() === "KG" ? "kg" : item.unidade.toLowerCase();
    let unidade = await prisma.unidadeMedida.findUnique({ where: { sigla: siglaUnidade } });
    if (!unidade) {
      unidade = await prisma.unidadeMedida.create({ data: { sigla: siglaUnidade, nome: item.unidade } });
    }
    const contagem = await prisma.materiaPrima.count();
    materiaPrima = await prisma.materiaPrima.create({
      data: {
        codigo: `MP-${String(contagem + 1).padStart(4, "0")}`,
        nome: item.descricao,
        unidadeMedidaId: unidade.id,
        fornecedorPadraoId: nf.fornecedorId,
      },
    });
  } else {
    materiaPrima = await prisma.materiaPrima.findUniqueOrThrow({ where: { id: Number(escolha) } });
  }

  const almoxarifado = await prisma.localEstoque.findFirst({ where: { tipo: "ALMOXARIFADO_MP" } });
  if (almoxarifado) {
    await prisma.estoqueMovimento.create({
      data: {
        localEstoqueId: almoxarifado.id,
        materiaPrimaId: materiaPrima.id,
        tipo: "ENTRADA",
        quantidade: item.quantidade,
        motivo: `NF ${nf.numero} — entrada de item`,
        createdById: user.id,
      },
    });
  }

  itens[itemIndex] = { ...item, lancadoComoMateriaPrima: true, materiaPrimaId: materiaPrima.id };
  await prisma.notaFiscalEntrada.update({ where: { id: nf.id }, data: { itensJson: JSON.parse(JSON.stringify(itens)) } });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "MateriaPrima", entidadeId: materiaPrima.id, acao: `deu entrada via NF ${nf.numero} de` },
  });

  revalidatePath("/compras");
  revalidatePath("/estoque");
}

// ============================================================
// NÚCLEO — Cadastros mestres (Clientes, Produtos) e Usuários
// ============================================================

const SEGMENTOS = ["PAPEL_CARTAO", "CELULOSE", "TRATAMENTO_AGUA"] as const;
const FORMAS_PRODUTO = ["PO", "EMULSAO", "LIQUIDO", "GEL", "OUTRO"] as const;
const ORIGENS_PRODUTO = ["FABRICADO", "REVENDIDO", "MISTURA_CUSTOMIZADA"] as const;

function validarEnum<T extends string>(valores: readonly T[], valor: FormDataEntryValue | null, campo: string): T {
  if (typeof valor !== "string" || !valores.includes(valor as T)) throw new Error(`Valor inválido para ${campo}.`);
  return valor as T;
}

export async function criarCliente(formData: FormData) {
  const user = await requireAction("nucleo.cadastros", "podeCriar");

  const razaoSocial = (formData.get("razaoSocial") as string)?.trim();
  const cnpjCpf = (formData.get("cnpjCpf") as string)?.trim();
  if (!razaoSocial || !cnpjCpf) throw new Error("Preencha razão social e CNPJ/CPF.");
  const segmento = validarEnum(SEGMENTOS, formData.get("segmento"), "segmento");

  const existente = await prisma.cliente.findUnique({ where: { cnpjCpf } });
  if (existente) throw new Error("Já existe um cliente cadastrado com esse CNPJ/CPF.");

  const vendedorId = formData.get("vendedorId") ? Number(formData.get("vendedorId")) : null;
  const tecnicoId = formData.get("tecnicoId") ? Number(formData.get("tecnicoId")) : null;
  const empresa = await prisma.empresa.findFirstOrThrow();

  const cliente = await prisma.cliente.create({
    data: {
      empresaId: empresa.id,
      razaoSocial,
      nomeFantasia: (formData.get("nomeFantasia") as string) || null,
      cnpjCpf,
      segmento,
      condicoesComerciais: (formData.get("condicoesComerciais") as string) || null,
      vendedorId,
      tecnicoId,
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Cliente", entidadeId: cliente.id, acao: "cadastrou" } });
  revalidatePath("/nucleo");
}

export async function atualizarCliente(formData: FormData) {
  const user = await requireAction("nucleo.cadastros", "podeEditar");

  const id = Number(formData.get("clienteId"));
  const razaoSocial = (formData.get("razaoSocial") as string)?.trim();
  const cnpjCpf = (formData.get("cnpjCpf") as string)?.trim();
  if (!razaoSocial || !cnpjCpf) throw new Error("Preencha razão social e CNPJ/CPF.");
  const segmento = validarEnum(SEGMENTOS, formData.get("segmento"), "segmento");

  const duplicado = await prisma.cliente.findUnique({ where: { cnpjCpf } });
  if (duplicado && duplicado.id !== id) throw new Error("Já existe outro cliente cadastrado com esse CNPJ/CPF.");

  const vendedorId = formData.get("vendedorId") ? Number(formData.get("vendedorId")) : null;
  const tecnicoId = formData.get("tecnicoId") ? Number(formData.get("tecnicoId")) : null;

  await prisma.cliente.update({
    where: { id },
    data: {
      razaoSocial,
      nomeFantasia: (formData.get("nomeFantasia") as string) || null,
      cnpjCpf,
      segmento,
      condicoesComerciais: (formData.get("condicoesComerciais") as string) || null,
      vendedorId,
      tecnicoId,
      ativo: formData.get("ativo") === "on",
      updatedById: user.id,
    },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Cliente", entidadeId: id, acao: "editou" } });
  revalidatePath("/nucleo");
}

export async function excluirCliente(clienteId: number) {
  const user = await requireAction("nucleo.cadastros", "podeExcluir");

  await prisma.cliente.update({ where: { id: clienteId }, data: { deletedAt: new Date(), ativo: false } });
  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Cliente", entidadeId: clienteId, acao: "excluiu" } });
  revalidatePath("/nucleo");
}

export async function criarProduto(formData: FormData) {
  const user = await requireAction("nucleo.cadastros", "podeCriar");

  const codigoInterno = (formData.get("codigoInterno") as string)?.trim();
  const nomeComercial = (formData.get("nomeComercial") as string)?.trim();
  const unidadeMedidaId = Number(formData.get("unidadeMedidaId"));
  if (!codigoInterno || !nomeComercial || !unidadeMedidaId) throw new Error("Preencha código, nome comercial e unidade de medida.");
  const segmento = validarEnum(SEGMENTOS, formData.get("segmento"), "segmento");
  const forma = validarEnum(FORMAS_PRODUTO, formData.get("forma"), "forma");
  const origem = validarEnum(ORIGENS_PRODUTO, formData.get("origem"), "origem");

  const existente = await prisma.produto.findUnique({ where: { codigoInterno } });
  if (existente) throw new Error("Já existe um produto cadastrado com esse código interno.");

  const precoBase = formData.get("precoBase") ? Number(formData.get("precoBase")) : null;
  const empresa = await prisma.empresa.findFirstOrThrow();

  const produto = await prisma.produto.create({
    data: {
      empresaId: empresa.id,
      codigoInterno,
      nomeComercial,
      familia: (formData.get("familia") as string) || null,
      forma,
      origem,
      segmento,
      unidadeMedidaId,
      precoBase,
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Produto", entidadeId: produto.id, acao: "cadastrou" } });
  revalidatePath("/nucleo");
}

export async function atualizarProduto(formData: FormData) {
  const user = await requireAction("nucleo.cadastros", "podeEditar");

  const id = Number(formData.get("produtoId"));
  const codigoInterno = (formData.get("codigoInterno") as string)?.trim();
  const nomeComercial = (formData.get("nomeComercial") as string)?.trim();
  const unidadeMedidaId = Number(formData.get("unidadeMedidaId"));
  if (!codigoInterno || !nomeComercial || !unidadeMedidaId) throw new Error("Preencha código, nome comercial e unidade de medida.");
  const segmento = validarEnum(SEGMENTOS, formData.get("segmento"), "segmento");
  const forma = validarEnum(FORMAS_PRODUTO, formData.get("forma"), "forma");
  const origem = validarEnum(ORIGENS_PRODUTO, formData.get("origem"), "origem");

  const duplicado = await prisma.produto.findUnique({ where: { codigoInterno } });
  if (duplicado && duplicado.id !== id) throw new Error("Já existe outro produto cadastrado com esse código interno.");

  const precoBase = formData.get("precoBase") ? Number(formData.get("precoBase")) : null;

  await prisma.produto.update({
    where: { id },
    data: {
      codigoInterno,
      nomeComercial,
      familia: (formData.get("familia") as string) || null,
      forma,
      origem,
      segmento,
      unidadeMedidaId,
      precoBase,
      ativo: formData.get("ativo") === "on",
      updatedById: user.id,
    },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Produto", entidadeId: id, acao: "editou" } });
  revalidatePath("/nucleo");
}

export async function excluirProduto(produtoId: number) {
  const user = await requireAction("nucleo.cadastros", "podeExcluir");

  await prisma.produto.update({ where: { id: produtoId }, data: { deletedAt: new Date(), ativo: false } });
  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Produto", entidadeId: produtoId, acao: "excluiu" } });
  revalidatePath("/nucleo");
}

export interface ResultadoSenhaGerada {
  senhaGerada: string;
  usuarioNome: string;
}

/** Chamada direto do client (não via `<form action>`) pra poder devolver a senha gerada
 * pra tela — este projeto está em React 18, sem useActionState, então o componente client
 * invoca esta função com `await` dentro de um `startTransition` e mostra o retorno. */
export async function criarUsuario(formData: FormData): Promise<ResultadoSenhaGerada> {
  const user = await requireAction("nucleo.usuarios", "podeCriar");

  const nome = (formData.get("nome") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  if (!nome || !email || !username) throw new Error("Preencha nome, e-mail e usuário.");

  const existente = await prisma.usuario.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existente) throw new Error("Já existe um usuário com esse e-mail ou nome de usuário.");

  const cargoId = formData.get("cargoId") ? Number(formData.get("cargoId")) : null;
  const empresa = await prisma.empresa.findFirstOrThrow();
  const senhaGerada = gerarSenhaAleatoria();
  const passwordHash = await hashPassword(senhaGerada);

  const novoUsuario = await prisma.usuario.create({
    data: { empresaId: empresa.id, nome, email, username, passwordHash, cargoId, deveTrocarSenha: true },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Usuario", entidadeId: novoUsuario.id, acao: "cadastrou" } });
  revalidatePath("/nucleo");

  return { senhaGerada, usuarioNome: novoUsuario.nome };
}

export async function atualizarUsuario(formData: FormData) {
  const user = await requireAction("nucleo.usuarios", "podeEditar");

  const id = Number(formData.get("usuarioId"));
  const nome = (formData.get("nome") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  if (!nome || !email || !username) throw new Error("Preencha nome, e-mail e usuário.");

  const duplicado = await prisma.usuario.findFirst({ where: { OR: [{ email }, { username }], NOT: { id } } });
  if (duplicado) throw new Error("Já existe outro usuário com esse e-mail ou nome de usuário.");

  const cargoId = formData.get("cargoId") ? Number(formData.get("cargoId")) : null;

  await prisma.usuario.update({
    where: { id },
    data: { nome, email, username, cargoId, ativo: formData.get("ativo") === "on" },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Usuario", entidadeId: id, acao: "editou" } });
  revalidatePath("/nucleo");
}

export async function excluirUsuario(usuarioId: number) {
  const user = await requireAction("nucleo.usuarios", "podeExcluir");
  if (usuarioId === user.id) throw new Error("Você não pode excluir o seu próprio usuário.");

  await prisma.usuario.update({ where: { id: usuarioId }, data: { deletedAt: new Date(), ativo: false } });
  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Usuario", entidadeId: usuarioId, acao: "excluiu" } });
  revalidatePath("/nucleo");
}

export async function criarCargo(formData: FormData) {
  const user = await requireAction("nucleo.usuarios", "podeCriar");

  const nome = (formData.get("nome") as string)?.trim();
  const setorId = Number(formData.get("setorId"));
  if (!nome || !setorId) throw new Error("Preencha o nome do cargo e o setor.");

  const existente = await prisma.cargo.findUnique({ where: { setorId_nome: { setorId, nome } } });
  if (existente) throw new Error("Já existe um cargo com esse nome nesse setor.");

  const cargo = await prisma.cargo.create({ data: { setorId, nome } });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Cargo", entidadeId: cargo.id, acao: "cadastrou" } });
  revalidatePath("/nucleo");
}

const ACOES: Acao[] = ["podeVer", "podeCriar", "podeEditar", "podeAprovar", "podeExcluir"];

/** Salva a matriz inteira de permissões de um cargo de uma vez — um checkbox por
 * recurso × ação (nome `${recurso}__${acao}`). Ausente no FormData = desmarcado = false;
 * cada recurso sempre grava as 5 ações explicitamente, então a matriz enviada é sempre
 * o estado final completo do cargo, não um diff. */
export async function salvarPermissoesCargo(formData: FormData) {
  const user = await requireAction("nucleo.usuarios", "podeEditar");

  const cargoId = Number(formData.get("cargoId"));
  if (!cargoId) throw new Error("Selecione um cargo.");
  await prisma.cargo.findUniqueOrThrow({ where: { id: cargoId } });

  await prisma.$transaction(
    RECURSOS.map((r) => {
      const valores = Object.fromEntries(ACOES.map((acao) => [acao, formData.get(`${r.chave}__${acao}`) === "on"])) as Record<Acao, boolean>;
      return prisma.permissao.upsert({
        where: { cargoId_recurso: { cargoId, recurso: r.chave } },
        update: valores,
        create: { cargoId, recurso: r.chave, ...valores },
      });
    })
  );

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Cargo", entidadeId: cargoId, acao: "atualizou permissões de" } });
  revalidatePath("/nucleo");
}

/** Reset administrativo — gera senha nova e força troca no próximo login. Mesma lógica de
 * retorno de criarUsuario: chamada direto do client pra poder mostrar a senha uma vez. */
export async function redefinirSenhaUsuario(usuarioId: number): Promise<ResultadoSenhaGerada> {
  const user = await requireAction("nucleo.usuarios", "podeEditar");

  const senhaGerada = gerarSenhaAleatoria();
  const passwordHash = await hashPassword(senhaGerada);
  const alvo = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { passwordHash, deveTrocarSenha: true },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Usuario", entidadeId: usuarioId, acao: "redefiniu a senha de" } });
  revalidatePath("/nucleo");

  return { senhaGerada, usuarioNome: alvo.nome };
}

/** Autoatendimento — usado tanto na troca forçada (deveTrocarSenha) quanto por qualquer
 * usuário trocando a senha por vontade própria. Não chama redirect() aqui de propósito: quem
 * chama é um Client Component via `await` direto (não `<form action>`), e misturar redirect()
 * com essa forma de chamada arrisca o navigator engolir o sinal de redirect como erro comum —
 * a navegação pra "/" fica por conta do client, depois de um retorno sem erro. */
export async function trocarSenha(formData: FormData): Promise<void> {
  const authUser = await getCurrentUser();
  if (!authUser) throw new Error("Não autenticado.");

  const senhaAtual = formData.get("senhaAtual") as string;
  const novaSenha = formData.get("novaSenha") as string;
  const confirmarSenha = formData.get("confirmarSenha") as string;
  if (!senhaAtual || !novaSenha || !confirmarSenha) throw new Error("Preencha todos os campos.");
  if (novaSenha.length < 8) throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
  if (novaSenha !== confirmarSenha) throw new Error("A confirmação não bate com a nova senha.");

  const registro = await prisma.usuario.findUniqueOrThrow({ where: { id: authUser.id } });
  const valido = await verifyPassword(senhaAtual, registro.passwordHash);
  if (!valido) throw new Error("Senha atual incorreta.");

  const passwordHash = await hashPassword(novaSenha);
  await prisma.usuario.update({ where: { id: authUser.id }, data: { passwordHash, deveTrocarSenha: false } });
}

// ============================================================
// LOGÍSTICA — Cotação e acompanhamento de frete (Larissa)
// ============================================================

/** Primeira cotação de um frete — nasce vinculado a um PedidoVenda (ENTREGA, Biogreen até o
 * cliente, freteTipo "CIF") ou a uma NotaFiscalEntrada (COLETA, fornecedor até a Biogreen,
 * tipoFrete "FOB"). Sempre cria uma linha nova: recotar é um evento novo, não um overwrite. */
export async function cotarFrete(formData: FormData) {
  const user = await requireAction("logistica.expedicao", "podeCriar");

  const pedidoVendaId = formData.get("pedidoVendaId") ? Number(formData.get("pedidoVendaId")) : null;
  const notaFiscalEntradaId = formData.get("notaFiscalEntradaId") ? Number(formData.get("notaFiscalEntradaId")) : null;
  if (!pedidoVendaId && !notaFiscalEntradaId) throw new Error("Frete precisa estar vinculado a um pedido ou a uma compra.");

  const transportadora = (formData.get("transportadora") as string)?.trim();
  if (!transportadora) throw new Error("Informe a transportadora.");

  const valorFrete = formData.get("valorFrete") ? Number(formData.get("valorFrete")) : null;
  const dataFreteRaw = formData.get("dataFrete") as string;
  const dataFrete = dataFreteRaw ? new Date(`${dataFreteRaw}T12:00:00`) : null;

  await prisma.frete.create({
    data: {
      tipo: pedidoVendaId ? "ENTREGA" : "COLETA",
      pedidoVendaId,
      notaFiscalEntradaId,
      transportadora,
      valorFrete,
      dataFrete,
      observacoes: (formData.get("observacoes") as string) || null,
      status: "COTADO",
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      usuarioId: user.id,
      entidade: pedidoVendaId ? "PedidoVenda" : "NotaFiscalEntrada",
      entidadeId: (pedidoVendaId ?? notaFiscalEntradaId)!,
      acao: "cotou frete de",
    },
  });

  revalidatePath("/logistica");
}

/** Ajusta uma cotação existente e/ou avança o status até a entrega (COTADO -> EM_TRANSITO -> ENTREGUE). */
export async function atualizarFrete(formData: FormData) {
  const user = await requireAction("logistica.expedicao", "podeEditar");

  const id = Number(formData.get("freteId"));
  const transportadora = (formData.get("transportadora") as string)?.trim();
  if (!transportadora) throw new Error("Informe a transportadora.");

  const valorFrete = formData.get("valorFrete") ? Number(formData.get("valorFrete")) : null;
  const dataFreteRaw = formData.get("dataFrete") as string;
  const dataFrete = dataFreteRaw ? new Date(`${dataFreteRaw}T12:00:00`) : null;
  const status = (formData.get("status") as string) || "COTADO";

  await prisma.frete.update({
    where: { id },
    data: { transportadora, valorFrete, dataFrete, observacoes: (formData.get("observacoes") as string) || null, status },
  });

  await prisma.auditLog.create({ data: { usuarioId: user.id, entidade: "Frete", entidadeId: id, acao: "atualizou frete" } });
  revalidatePath("/logistica");
}
