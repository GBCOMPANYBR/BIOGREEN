import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, AlertTriangle, Factory, FlaskConical, Stethoscope, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
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

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[partes.length - 1]?.[0] ?? "")).toUpperCase();
}

export default async function PainelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const visibleModules = getVisibleNavItems(user).filter((item) => item.slug !== "");
  const data = await getHealthData();
  const primeiroNome = user.nome.split(" ")[0];
  const hoje = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Olá, {primeiroNome}</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{hoje} · visão geral da Biogreen em tempo real</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Caixa do dia"
          value={formatCurrencyBRL(data.caixaDoDia)}
          icon={Wallet}
          tone={data.caixaDoDia >= 0 ? "good" : "warn"}
        />
        <StatCard
          label="Contas vencendo"
          value={String(data.contasVencendo)}
          icon={AlertTriangle}
          tone={data.contasVencendo > 0 ? "warn" : "neutral"}
          hint="próximos 7 dias"
        />
        <StatCard label="Pedidos em produção" value={String(data.pedidosEmProducao)} icon={Factory} />
        <StatCard
          label="Lotes com laudo pendente"
          value={String(data.lotesSemCoa)}
          icon={FlaskConical}
          tone={data.lotesSemCoa > 0 ? "warn" : "good"}
        />
        <StatCard
          label="Visitas técnicas"
          value={String(data.visitasSemana)}
          icon={Stethoscope}
          hint="próximos 7 dias"
        />
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
              <ul className="flex flex-col">
                {data.atividades.map((a, i) => (
                  <li
                    key={a.id}
                    className={`flex items-center gap-3 py-3 text-sm ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {iniciais(a.usuario.nome)}
                    </span>
                    <span className="flex-1">
                      <span className="font-medium">{a.usuario.nome}</span>{" "}
                      <span className="text-muted-foreground">
                        {a.acao} — {a.entidade} #{a.entidadeId}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
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
            <div className="grid grid-cols-2 gap-2">
              {visibleModules.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="group flex flex-col gap-2 rounded-md border border-border p-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <item.icon className="h-4 w-4 text-primary" />
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <span className="leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
