import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/permissions";
import { getVisibleNavItems } from "@/lib/nav-visibility";
import { formatCurrencyBRL, formatDateTime } from "@/lib/format";

async function getHealthData() {
  const now = new Date();
  const inicioDia = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);
  const em7dias = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    recebidoHoje,
    pagoHoje,
    contasReceberVencendo,
    contasPagarVencendo,
    pedidosEmProducao,
    lotesSemCoa,
    visitasSemana,
    atividades,
  ] = await Promise.all([
    prisma.contaReceber.aggregate({
      _sum: { valorPago: true },
      where: { dataBaixa: { gte: inicioDia, lt: fimDia } },
    }),
    prisma.contaPagar.aggregate({
      _sum: { valorPago: true },
      where: { dataBaixa: { gte: inicioDia, lt: fimDia } },
    }),
    prisma.contaReceber.count({
      where: { status: { in: ["ABERTO", "PARCIAL"] }, vencimento: { lte: em7dias } },
    }),
    prisma.contaPagar.count({
      where: { status: { in: ["ABERTO", "PARCIAL"] }, vencimento: { lte: em7dias } },
    }),
    prisma.pedidoVenda.count({ where: { status: "EM_PRODUCAO" } }),
    prisma.lote.count({ where: { coaDocumentos: { none: {} } } }),
    prisma.visitaTecnica.count({
      where: { status: "AGENDADA", dataAgendada: { gte: now, lte: em7dias } },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { usuario: { select: { nome: true } } },
    }),
  ]);

  const caixaDoDia =
    Number(recebidoHoje._sum.valorPago ?? 0) - Number(pagoHoje._sum.valorPago ?? 0);

  return {
    caixaDoDia,
    contasVencendo: contasReceberVencendo + contasPagarVencendo,
    pedidosEmProducao,
    lotesSemCoa,
    visitasSemana,
    atividades,
  };
}

export default async function PainelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const visibleModules = getVisibleNavItems(user).filter((item) => item.slug !== "");
  const data = await getHealthData();

  const cards = [
    { label: "Caixa do dia", value: formatCurrencyBRL(data.caixaDoDia) },
    { label: "Contas vencendo (7 dias)", value: String(data.contasVencendo) },
    { label: "Pedidos em produção", value: String(data.pedidosEmProducao) },
    { label: "Lotes com laudo pendente", value: String(data.lotesSemCoa) },
    { label: "Visitas técnicas da semana", value: String(data.visitasSemana) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel da Empresa</h1>
        <p className="text-sm text-muted-foreground">Visão geral da Biogreen — dados em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardTitle>{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <CardContent>
            {data.atividades.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.atividades.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className="font-medium">{a.usuario.nome}</span>{" "}
                    <span className="text-muted-foreground">
                      {a.acao} — {a.entidade} #{a.entidadeId} · {formatDateTime(a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos por setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {visibleModules.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
