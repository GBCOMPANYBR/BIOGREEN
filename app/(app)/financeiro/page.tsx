import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

  const contas = await prisma.contaReceber.findMany({
    orderBy: { vencimento: "asc" },
    include: { cliente: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro — Contas a Receber</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada título aqui nasceu sozinho quando uma nota fiscal foi emitida em Fiscal — ninguém lançou à mão.
        </p>
      </div>

      <Card>
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
