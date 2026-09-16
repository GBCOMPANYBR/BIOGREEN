"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, can } from "@/lib/permissions";
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

  const almoxarifadoMp = await prisma.localEstoque.findFirst({ where: { tipo: "ALMOXARIFADO_MP" } });

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

    const op = await prisma.ordemProducao.create({
      data: {
        numero,
        pedidoVendaId: pedido.id,
        pedidoVendaItemId: item.id,
        formulaId: formula.id,
        status: "EM_PRODUCAO",
        quantidadePlanejada: item.quantidade,
        dataInicio: new Date(),
        createdById: user.id,
      },
    });

    // Baixa automática das matérias-primas assim que a produção inicia — proporcional à
    // fórmula (ex.: Biopac = 80% soda + 20% enxofre), sem ninguém precisar digitar percentual.
    if (formula.itens.length > 0 && almoxarifadoMp) {
      const rendimento = Number(formula.rendimento ?? 0);
      const fator = rendimento > 0 ? Number(item.quantidade) / rendimento : 1;

      for (const formulaItem of formula.itens) {
        const quantidadeConsumida = Number(formulaItem.quantidade) * fator;
        await prisma.estoqueMovimento.create({
          data: {
            localEstoqueId: almoxarifadoMp.id,
            materiaPrimaId: formulaItem.materiaPrimaId,
            tipo: "SAIDA",
            quantidade: quantidadeConsumida,
            motivo: `Consumo automático (fórmula) — ${op.numero}`,
            createdById: user.id,
          },
        });
      }
    }
  }

  await prisma.pedidoVenda.update({
    where: { id: pedido.id },
    data: { status: "EM_PRODUCAO", updatedById: user.id },
  });

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "PedidoVenda", entidadeId: pedido.id, acao: "aprovou e enviou à produção" },
  });

  revalidatePath("/comercial");
  revalidatePath("/producao");
  revalidatePath("/");
}

export async function concluirProducao(ordemId: number) {
  const user = await requireAction("producao.ordens", "podeEditar");

  const op = await prisma.ordemProducao.findUniqueOrThrow({
    where: { id: ordemId },
    include: { formula: true },
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

  await prisma.auditLog.create({
    data: { usuarioId: user.id, entidade: "OrdemProducao", entidadeId: op.id, acao: "concluiu produção de" },
  });

  revalidatePath("/producao");
  revalidatePath("/estoque");
  revalidatePath("/comercial");
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
