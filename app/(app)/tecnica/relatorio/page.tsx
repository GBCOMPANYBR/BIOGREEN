import Image from "next/image";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/tecnica/print-button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { ParametrosMedidos } from "@/lib/relatorio-visita";

function nomeMes(mes: string): string {
  const [ano, m] = mes.split("-").map(Number);
  return new Date(ano, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default async function RelatorioMensalPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; mes?: string }>;
}) {
  await requireModuleAccess("tecnica.visitas");
  const { cliente: clienteIdRaw, mes } = await searchParams;
  const clienteId = Number(clienteIdRaw);

  if (!clienteId || !mes) {
    return <p className="text-sm text-muted-foreground">Selecione um cliente e um mês em Assistência Técnica.</p>;
  }

  const [ano, mesNum] = mes.split("-").map(Number);
  const inicio = new Date(ano, mesNum - 1, 1);
  const fim = new Date(ano, mesNum, 1);

  const [cliente, visitas] = await Promise.all([
    prisma.cliente.findUniqueOrThrow({ where: { id: clienteId } }),
    prisma.visitaTecnica.findMany({
      where: { clienteId, dataAgendada: { gte: inicio, lt: fim } },
      orderBy: { dataAgendada: "asc" },
      include: { tecnico: true, relatorio: true },
    }),
  ]);

  const visitaIds = visitas.map((v) => v.id);
  const anexos = visitaIds.length
    ? await prisma.anexo.findMany({ where: { entidadeTipo: "VisitaTecnica", entidadeId: { in: visitaIds } }, orderBy: { createdAt: "asc" } })
    : [];
  const anexosPorVisita = new Map<number, typeof anexos>();
  for (const a of anexos) {
    const lista = anexosPorVisita.get(a.entidadeId) ?? [];
    lista.push(a);
    anexosPorVisita.set(a.entidadeId, lista);
  }

  const realizadas = visitas.filter((v) => v.status === "REALIZADA");
  const naoRealizadas = visitas.filter((v) => v.status === "CANCELADA");

  // Média por ponto de medição, ao longo do mês.
  const somaPorLocal = new Map<string, { cloro: number[]; ph: number[]; turbidez: number[] }>();
  for (const v of realizadas) {
    const params = (v.relatorio?.parametrosMedidos as unknown as ParametrosMedidos | null) ?? { pontos: [], hidrometros: [] };
    for (const p of params.pontos ?? []) {
      const atual = somaPorLocal.get(p.local) ?? { cloro: [], ph: [], turbidez: [] };
      if (p.cloro != null) atual.cloro.push(p.cloro);
      if (p.ph != null) atual.ph.push(p.ph);
      if (p.turbidez != null) atual.turbidez.push(p.turbidez);
      somaPorLocal.set(p.local, atual);
    }
  }
  const media = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold tracking-tight">Relatório de acompanhamento</h1>
        <PrintButton />
      </div>

      <header className="flex items-center justify-between rounded-lg border border-border bg-card p-6 print:border-0 print:p-0">
        <div>
          <Image src="/logo-biogreen.jpg" alt="Biogreen" width={120} height={58} />
          <h2 className="mt-4 text-xl font-semibold">Relatório de Acompanhamento — {cliente.razaoSocial}</h2>
          <p className="text-sm text-muted-foreground capitalize">{nomeMes(mes)}</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>{realizadas.length} visita(s) realizada(s)</p>
          <p>{naoRealizadas.length} não realizada(s)</p>
        </div>
      </header>

      {somaPorLocal.size > 0 && (
        <section className="flex flex-col gap-3 break-inside-avoid">
          <h3 className="text-lg font-semibold">Dados do processo — médias do mês</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Ponto</th>
                  <th className="px-3 py-2 text-left font-medium">Cloro residual (méd.)</th>
                  <th className="px-3 py-2 text-left font-medium">pH (méd.)</th>
                  <th className="px-3 py-2 text-left font-medium">Turbidez (méd.)</th>
                </tr>
              </thead>
              <tbody>
                {[...somaPorLocal.entries()].map(([local, v]) => (
                  <tr key={local} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium">{local}</td>
                    <td className="px-3 py-2">{media(v.cloro)?.toFixed(2) ?? "—"}</td>
                    <td className="px-3 py-2">{media(v.ph)?.toFixed(2) ?? "—"}</td>
                    <td className="px-3 py-2">{media(v.turbidez)?.toFixed(2) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <h3 className="text-lg font-semibold">Evidências por visita</h3>
        {realizadas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma visita realizada neste mês.</p>}
        {realizadas.map((v) => {
          const params = (v.relatorio?.parametrosMedidos as unknown as ParametrosMedidos | null) ?? { pontos: [], hidrometros: [] };
          const fotos = anexosPorVisita.get(v.id) ?? [];
          return (
            <div key={v.id} className="flex flex-col gap-3 break-inside-avoid rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{formatDate(v.dataAgendada)}</p>
                <span className="text-xs text-muted-foreground">Técnico: {v.tecnico.nome}</span>
              </div>

              {(params.pontos?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-4 text-sm">
                  {params.pontos.map((p, i) => (
                    <div key={i} className="rounded-md bg-muted/40 px-3 py-2">
                      <p className="font-medium">{p.local}</p>
                      <p className="text-xs text-muted-foreground">
                        Cloro: {p.cloro ?? "—"} · pH: {p.ph ?? "—"} · Turbidez: {p.turbidez ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {v.relatorio?.recomendacoes && <p className="text-sm text-muted-foreground">Recomendações: {v.relatorio.recomendacoes}</p>}

              {fotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {fotos.map((f) =>
                    f.url.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={f.id} src={f.url} alt={f.nome} className="aspect-square w-full rounded-md object-cover" />
                    ) : (
                      <div key={f.id} className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                        {f.nome}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {naoRealizadas.length > 0 && (
        <section className="flex flex-col gap-3 break-inside-avoid">
          <h3 className="text-lg font-semibold">Visita não realizada</h3>
          <ul className="flex flex-col gap-2">
            {naoRealizadas.map((v) => (
              <li key={v.id} className="text-sm">
                <span className="font-medium">{formatDate(v.dataAgendada)}</span> — {v.justificativa}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        Biogreen Indústria Química Ltda · desenvolvido por GB Company
      </footer>
    </div>
  );
}
