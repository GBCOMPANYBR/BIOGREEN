import { prisma } from "@/lib/prisma";

export interface PontoFluxo {
  label: string;
  recebido: number;
  pago: number;
  saldo: number;
}

function chaveData(data: Date, porMes: boolean): string {
  const d = new Date(data);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  if (porMes) return `${ano}-${mes}`;
  return `${ano}-${mes}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Recebimentos, pagamentos e saldo acumulado, agrupados por dia e por mês num só passe. */
export async function fluxoDeCaixa(): Promise<{ diario: PontoFluxo[]; mensal: PontoFluxo[] }> {
  const [recebidos, pagos] = await Promise.all([
    prisma.contaReceber.findMany({ where: { dataBaixa: { not: null } }, select: { dataBaixa: true, valorPago: true } }),
    prisma.contaPagar.findMany({ where: { dataBaixa: { not: null } }, select: { dataBaixa: true, valorPago: true } }),
  ]);

  function agrupar(porMes: boolean): PontoFluxo[] {
    const mapa = new Map<string, { recebido: number; pago: number }>();
    for (const r of recebidos) {
      const key = chaveData(r.dataBaixa!, porMes);
      const atual = mapa.get(key) ?? { recebido: 0, pago: 0 };
      atual.recebido += Number(r.valorPago);
      mapa.set(key, atual);
    }
    for (const p of pagos) {
      const key = chaveData(p.dataBaixa!, porMes);
      const atual = mapa.get(key) ?? { recebido: 0, pago: 0 };
      atual.pago += Number(p.valorPago);
      mapa.set(key, atual);
    }
    const chaves = [...mapa.keys()].sort();
    let saldoAcum = 0;
    return chaves.map((k) => {
      const v = mapa.get(k)!;
      saldoAcum += v.recebido - v.pago;
      return { label: k, recebido: v.recebido, pago: v.pago, saldo: saldoAcum };
    });
  }

  return { diario: agrupar(false), mensal: agrupar(true) };
}

export interface PontoVendas {
  label: string;
  valor: number;
}

/** Total faturado (NF autorizada) por mês. */
export async function vendasMensais(): Promise<PontoVendas[]> {
  const notas = await prisma.notaFiscal.findMany({
    where: { emitidaEm: { not: null } },
    select: { emitidaEm: true, valorTotal: true },
  });

  const mapa = new Map<string, number>();
  for (const n of notas) {
    const key = chaveData(n.emitidaEm!, true);
    mapa.set(key, (mapa.get(key) ?? 0) + Number(n.valorTotal));
  }

  return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, valor]) => ({ label, valor }));
}
