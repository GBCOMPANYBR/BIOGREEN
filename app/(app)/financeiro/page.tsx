import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { fluxoDeCaixa, vendasMensais } from "@/lib/financeiro";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Wallet } from "lucide-react";
import { formatCurrencyBRL, formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  ABERTO: "Aberto",
  PARCIAL: "Parcial",
  PAGO: "Pago",
  VENCIDO: "Vencido",
  CANCELADO: "Cancelado",
};

export default async function FinanceiroPage() {
  await requireModuleAccess("financeiro.contasReceber");

  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);

  const [contas, fluxo, vendas, vencidos, venceHoje, emAberto] = await Promise.all([
    prisma.contaReceber.findMany({ orderBy: { vencimento: "asc" }, include: { cliente: true } }),
    fluxoDeCaixa(),
    vendasMensais(),
    prisma.contaReceber.aggregate({
      where: { status: { in: ["ABERTO", "PARCIAL"] }, vencimento: { lt: inicioHoje } },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.contaReceber.aggregate({
      where: { status: { in: ["ABERTO", "PARCIAL"] }, vencimento: { gte: inicioHoje, lt: fimHoje } },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.contaReceber.aggregate({
      where: { status: { in: ["ABERTO", "PARCIAL"] } },
      _sum: { valor: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro — Contas a Receber</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada título aqui nasceu sozinho quando uma nota fiscal foi emitida em Fiscal — inclusive as parcelas, de
          acordo com a condição de pagamento do pedido.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Vencidos"
          value={formatCurrencyBRL(Number(vencidos._sum.valor ?? 0))}
          icon={AlertTriangle}
          tone={vencidos._count > 0 ? "warn" : "good"}
          hint={`${vencidos._count} título(s)`}
        />
        <StatCard
          label="Vencem hoje"
          value={formatCurrencyBRL(Number(venceHoje._sum.valor ?? 0))}
          icon={Clock}
          tone={venceHoje._count > 0 ? "warn" : "neutral"}
          hint={`${venceHoje._count} título(s)`}
        />
        <StatCard label="Em aberto (total)" value={formatCurrencyBRL(Number(emAberto._sum.valor ?? 0))} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <CashFlowChart diario={fluxo.diario} mensal={fluxo.mensal} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <SalesChart dados={vendas} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas a receber</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.cliente.razaoSocial}</TableCell>
                  <TableCell>{formatCurrencyBRL(Number(c.valor))}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(c.vencimento)}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "PAGO" ? "default" : c.status === "VENCIDO" ? "destructive" : "outline"}>
                      {STATUS_LABEL[c.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {contas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum título gerado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
