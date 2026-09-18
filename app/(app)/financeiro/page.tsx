import Link from "next/link";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { fluxoDeCaixa, vendasMensais } from "@/lib/financeiro";
import { darBaixaContaReceber, darBaixaContaPagar } from "@/lib/actions";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, Wallet } from "lucide-react";
import { formatCurrencyBRL, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  ABERTO: "Aberto",
  PARCIAL: "Parcial",
  PAGO: "Pago",
  VENCIDO: "Vencido",
  CANCELADO: "Cancelado",
};

const ABAS = [
  { key: "receber", label: "Contas a Receber" },
  { key: "pagar", label: "Contas a Pagar" },
] as const;

function statusEfetivo(status: string, vencimento: Date): string {
  if (status === "ABERTO" || status === "PARCIAL") {
    if (new Date(vencimento) < new Date(new Date().setHours(0, 0, 0, 0))) return "VENCIDO";
  }
  return status;
}

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function BaixaForm({
  contaId,
  saldoRestante,
  action,
}: {
  contaId: number;
  saldoRestante: number;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">Dar baixa</summary>
      <form action={action} className="mt-2 flex flex-wrap items-end gap-2 rounded-md border border-border bg-muted/40 p-3">
        <input type="hidden" name="contaId" value={contaId} />
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Valor</Label>
          <Input
            name="valor"
            type="number"
            step="0.01"
            min="0.01"
            max={saldoRestante}
            defaultValue={saldoRestante.toFixed(2)}
            className="h-8 w-32"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Data</Label>
          <Input name="dataBaixa" type="date" defaultValue={hojeISO()} className="h-8 w-36" required />
        </div>
        <Button type="submit" size="sm" className="h-8">
          Confirmar
        </Button>
      </form>
    </details>
  );
}

async function ContasReceberTab() {
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
                <TableHead>Pago</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((c) => {
                const status = statusEfetivo(c.status, c.vencimento);
                const saldoRestante = Number(c.valor) - Number(c.valorPago);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.cliente.razaoSocial}</TableCell>
                    <TableCell>{formatCurrencyBRL(Number(c.valor))}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatCurrencyBRL(Number(c.valorPago))}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(c.vencimento)}</TableCell>
                    <TableCell>
                      <Badge variant={status === "PAGO" ? "default" : status === "VENCIDO" ? "destructive" : "outline"}>
                        {STATUS_LABEL[status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.status !== "PAGO" && c.status !== "CANCELADO" && (
                        <BaixaForm contaId={c.id} saldoRestante={saldoRestante} action={darBaixaContaReceber} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {contas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
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

async function ContasPagarTab() {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);

  const [contas, vencidos, venceHoje, emAberto] = await Promise.all([
    prisma.contaPagar.findMany({ orderBy: { vencimento: "asc" }, include: { fornecedor: true } }),
    prisma.contaPagar.aggregate({
      where: { status: { in: ["ABERTO", "PARCIAL"] }, vencimento: { lt: inicioHoje } },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.contaPagar.aggregate({
      where: { status: { in: ["ABERTO", "PARCIAL"] }, vencimento: { gte: inicioHoje, lt: fimHoje } },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.contaPagar.aggregate({
      where: { status: { in: ["ABERTO", "PARCIAL"] } },
      _sum: { valor: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Contas a pagar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((c) => {
                const status = statusEfetivo(c.status, c.vencimento);
                const saldoRestante = Number(c.valor) - Number(c.valorPago);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.fornecedor.razaoSocial}</TableCell>
                    <TableCell>{formatCurrencyBRL(Number(c.valor))}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatCurrencyBRL(Number(c.valorPago))}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(c.vencimento)}</TableCell>
                    <TableCell>
                      <Badge variant={status === "PAGO" ? "default" : status === "VENCIDO" ? "destructive" : "outline"}>
                        {STATUS_LABEL[status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.status !== "PAGO" && c.status !== "CANCELADO" && (
                        <BaixaForm contaId={c.id} saldoRestante={saldoRestante} action={darBaixaContaPagar} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {contas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
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

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  await requireModuleAccess("financeiro.contasReceber");
  const { aba: abaParam } = await searchParams;
  const aba = ABAS.some((a) => a.key === abaParam) ? abaParam! : "receber";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada título aqui nasceu sozinho quando uma nota fiscal foi emitida (Fiscal) ou uma compra foi categorizada
          (Compras) — inclusive as parcelas, de acordo com a condição de pagamento.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {ABAS.map((a) => (
          <Link
            key={a.key}
            href={`/financeiro?aba=${a.key}`}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              aba === a.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {a.label}
          </Link>
        ))}
      </div>

      {aba === "receber" && <ContasReceberTab />}
      {aba === "pagar" && <ContasPagarTab />}
    </div>
  );
}
