import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { gerarNotaFiscal } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL, formatDateTime } from "@/lib/format";

export default async function FiscalPage() {
  await requireModuleAccess("fiscal.notas");

  const [pedidosParaFaturar, notas] = await Promise.all([
    prisma.pedidoVenda.findMany({
      where: { deletedAt: null, status: "EM_PRODUCAO" },
      orderBy: { createdAt: "asc" },
      include: { cliente: true, itens: true, ordensProducao: { include: { lotes: { include: { coaDocumentos: true } } } } },
    }),
    prisma.notaFiscal.findMany({
      orderBy: { emitidaEm: "desc" },
      include: { cliente: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fiscal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A Karoline emite a nota aqui — e ela sai antes do caminhão, como manda a lei. Emitir já gera o título em Financeiro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prontos para faturar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Laudo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosParaFaturar.map((p) => {
                const valor = p.itens.reduce((acc, i) => acc + Number(i.quantidade) * Number(i.precoUnitario), 0);
                const todosLotes = p.ordensProducao.flatMap((op) => op.lotes);
                const comLaudo = todosLotes.length > 0 && todosLotes.every((l) => l.coaDocumentos.length > 0);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.numero}</TableCell>
                    <TableCell className="font-medium">{p.cliente.razaoSocial}</TableCell>
                    <TableCell>{formatCurrencyBRL(valor)}</TableCell>
                    <TableCell>
                      {todosLotes.length === 0 ? (
                        <Badge variant="outline">Em produção</Badge>
                      ) : comLaudo ? (
                        <Badge>Aprovado</Badge>
                      ) : (
                        <Badge variant="secondary">Aguardando laboratório</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <form action={gerarNotaFiscal.bind(null, p.id)}>
                        <Button type="submit" size="sm" variant="accent">
                          Gerar nota fiscal
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pedidosParaFaturar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum pedido em produção aguardando faturamento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas emitidas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Emitida em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-mono text-xs">
                    {n.numero}/{n.serie}
                  </TableCell>
                  <TableCell className="font-medium">{n.cliente.razaoSocial}</TableCell>
                  <TableCell>{formatCurrencyBRL(Number(n.valorTotal))}</TableCell>
                  <TableCell>
                    <Badge>{n.status === "AUTORIZADA" ? "Autorizada" : n.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {n.emitidaEm ? formatDateTime(n.emitidaEm) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {notas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma nota emitida ainda.
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
