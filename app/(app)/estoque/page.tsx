import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDateTime } from "@/lib/format";

export default async function EstoquePage() {
  await requireModuleAccess("estoque.movimentos");

  const movimentos = await prisma.estoqueMovimento.findMany({
    orderBy: { dataMovimento: "desc" },
    take: 100,
    include: { localEstoque: true, produto: true, materiaPrima: true, lote: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada entrada e saída aqui embaixo saiu de uma ação real em outro módulo — produção, expedição ou compra. Ninguém digita isso à mão.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Quando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.produto?.nomeComercial ?? m.materiaPrima?.nome ?? "—"}
                    {m.lote && <span className="ml-1 font-mono text-xs text-muted-foreground">({m.lote.numeroLote})</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.localEstoque.nome}</TableCell>
                  <TableCell>
                    <Badge variant={m.tipo === "ENTRADA" ? "default" : m.tipo === "SAIDA" ? "secondary" : "outline"}>
                      {m.tipo === "ENTRADA" ? "Entrada" : m.tipo === "SAIDA" ? "Saída" : m.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatNumber(m.quantidade, 1)} kg</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.motivo ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(m.dataMovimento)}</TableCell>
                </TableRow>
              ))}
              {movimentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma movimentação registrada ainda.
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
