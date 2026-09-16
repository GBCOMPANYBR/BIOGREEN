import { prisma } from "@/lib/prisma";

/** Saldo atual (entradas - saídas) de cada matéria-prima pedida, num único round-trip ao banco. */
export async function saldosMateriaPrima(materiaPrimaIds: number[]): Promise<Map<number, number>> {
  if (materiaPrimaIds.length === 0) return new Map();

  const movimentos = await prisma.estoqueMovimento.groupBy({
    by: ["materiaPrimaId", "tipo"],
    where: { materiaPrimaId: { in: materiaPrimaIds } },
    _sum: { quantidade: true },
  });

  const saldos = new Map<number, number>();
  for (const m of movimentos) {
    if (m.materiaPrimaId === null) continue;
    const atual = saldos.get(m.materiaPrimaId) ?? 0;
    const valor = Number(m._sum.quantidade ?? 0);
    const delta = m.tipo === "ENTRADA" ? valor : m.tipo === "SAIDA" ? -valor : 0;
    saldos.set(m.materiaPrimaId, atual + delta);
  }
  return saldos;
}

export interface DisponibilidadeItem {
  materiaPrimaId: number;
  materiaPrima: string;
  necessario: number;
  saldo: number;
  suficiente: boolean;
}

/**
 * Quanto de cada matéria-prima a fórmula ativa de um produto exigiria para produzir
 * `quantidade`, comparado ao saldo atual em estoque. Usada no Comercial (aviso antes de
 * aprovar) e no PCP (decisão final antes de liberar a produção).
 */
export async function verificarDisponibilidade(produtoId: number, quantidade: number): Promise<DisponibilidadeItem[]> {
  const formula = await prisma.formula.findFirst({
    where: { produtoId, ativa: true },
    include: { itens: { include: { materiaPrima: true } } },
    orderBy: { versao: "desc" },
  });
  if (!formula || formula.itens.length === 0) return [];

  const rendimento = Number(formula.rendimento ?? 0);
  const fator = rendimento > 0 ? quantidade / rendimento : 1;

  const saldos = await saldosMateriaPrima(formula.itens.map((i) => i.materiaPrimaId));

  return formula.itens.map((item) => {
    const necessario = Number(item.quantidade) * fator;
    const saldo = saldos.get(item.materiaPrimaId) ?? 0;
    return {
      materiaPrimaId: item.materiaPrimaId,
      materiaPrima: item.materiaPrima.nome,
      necessario,
      saldo,
      suficiente: saldo >= necessario,
    };
  });
}
