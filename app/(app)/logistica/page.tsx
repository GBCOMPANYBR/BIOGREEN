import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { gerarExpedicao } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export default async function LogisticaPage() {
  await requireModuleAccess("logistica.expedicao");

  const [pedidosFaturados, expedicoes] = await Promise.all([
    prisma.pedidoVenda.findMany({
      where: { deletedAt: null, status: "FATURADO" },
      orderBy: { createdAt: "asc" },
      include: { cliente: true, notasFiscais: true },
    }),
    prisma.expedicao.findMany({
      orderBy: { createdAt: "desc" },
      include: { pedidoVenda: { include: { cliente: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Logística / Expedição</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A Larissa programa a saída aqui — a baixa do produto acabado no estoque sai sozinha, junto com a expedição.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturados, aguardando saída</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Nota fiscal</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFaturados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.numero}</TableCell>
                  <TableCell className="font-medium">{p.cliente.razaoSocial}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.notasFiscais[0] ? `${p.notasFiscais[0].numero}/${p.notasFiscais[0].serie}` : "—"}
                  </TableCell>
                  <TableCell>
                    <form action={gerarExpedicao.bind(null, p.id)}>
                      <Button type="submit" size="sm" variant="accent">
                        Programar saída
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {pedidosFaturados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum pedido faturado aguardando saída.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expedições programadas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Programada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expedicoes.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.pedidoVenda.numero}</TableCell>
                  <TableCell className="font-medium">{e.pedidoVenda.cliente.razaoSocial}</TableCell>
                  <TableCell>
                    <Badge>{e.status === "EXPEDIDO" ? "Expedido" : e.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.dataAgendamento ? formatDateTime(e.dataAgendamento) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {expedicoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma expedição programada ainda.
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
