import { notFound } from "next/navigation";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { marcarVisitaNaoRealizada } from "@/lib/actions";
import { RelatorioForm } from "@/components/tecnica/relatorio-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { ParametrosMedidos } from "@/lib/relatorio-visita";

export default async function VisitaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  await requireModuleAccess("tecnica.visitas");
  const { id } = await params;
  const visitaId = Number(id);

  const visita = await prisma.visitaTecnica.findUnique({
    where: { id: visitaId },
    include: { cliente: true, tecnico: true, relatorio: true },
  });
  if (!visita) notFound();

  const anexos = await prisma.anexo.findMany({
    where: { entidadeTipo: "VisitaTecnica", entidadeId: visitaId },
    orderBy: { createdAt: "desc" },
  });

  const parametros = (visita.relatorio?.parametrosMedidos as unknown as ParametrosMedidos | null) ?? { pontos: [], hidrometros: [] };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Visita — {visita.cliente.razaoSocial}
        </h1>
        <Badge variant={visita.status === "REALIZADA" ? "default" : visita.status === "CANCELADA" ? "destructive" : "secondary"}>
          {visita.status === "AGENDADA" ? "Agendada" : visita.status === "REALIZADA" ? "Realizada" : "Não realizada"}
        </Badge>
      </div>
      <p className="-mt-4 text-sm text-muted-foreground">
        {formatDate(visita.dataAgendada)} · Técnico: {visita.tecnico.nome}
        {visita.roteiro && ` · ${visita.roteiro}`}
      </p>

      {visita.status === "CANCELADA" && visita.justificativa && (
        <Card>
          <CardHeader>
            <CardTitle>Motivo da visita não realizada</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{visita.justificativa}</CardContent>
        </Card>
      )}

      {visita.status === "AGENDADA" && (
        <Card>
          <CardHeader>
            <CardTitle>Visita não aconteceu?</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={marcarVisitaNaoRealizada} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="visitaId" value={visita.id} />
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">Motivo (feriado, emergência, visita a outro cliente...)</label>
                <input
                  name="justificativa"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="ex.: Feriado (Independência da Bahia)"
                />
              </div>
              <Button type="submit" variant="outline">
                Marcar não realizada
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {visita.status !== "CANCELADA" && (
        <Card>
          <CardHeader>
            <CardTitle>{visita.relatorio ? "Editar relatório da visita" : "Registrar relatório da visita"}</CardTitle>
          </CardHeader>
          <CardContent>
            <RelatorioForm
              visitaTecnicaId={visita.id}
              pontosIniciais={parametros.pontos ?? []}
              hidrometrosIniciais={parametros.hidrometros ?? []}
              recomendacoesIniciais={visita.relatorio?.recomendacoes ?? ""}
              proximaAcaoInicial={visita.relatorio?.proximaAcao ?? ""}
            />
          </CardContent>
        </Card>
      )}

      {anexos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fotos já enviadas ({anexos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {anexos.map((a) => (
                <div key={a.id} className="flex flex-col gap-1">
                  {a.url.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.nome} className="aspect-square w-full rounded-md border border-border object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-md border border-border bg-muted text-xs text-muted-foreground">
                      {a.nome}
                    </div>
                  )}
                  <span className="truncate text-xs text-muted-foreground">{a.nome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
