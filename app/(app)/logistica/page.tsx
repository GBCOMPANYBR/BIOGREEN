import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { gerarExpedicao, atualizarExpedicao } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip } from "lucide-react";
import { formatCurrencyBRL, formatDateTime } from "@/lib/format";

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
      include: { pedidoVenda: { include: { cliente: true } }, transportadora: true },
    }),
  ]);

  const anexosPorExpedicao = new Map<number, { id: number; nome: string }[]>();
  if (expedicoes.length > 0) {
    const anexos = await prisma.anexo.findMany({
      where: { entidadeTipo: "Expedicao", entidadeId: { in: expedicoes.map((e) => e.id) } },
      orderBy: { createdAt: "desc" },
    });
    for (const a of anexos) {
      const lista = anexosPorExpedicao.get(a.entidadeId) ?? [];
      lista.push({ id: a.id, nome: a.nome });
      anexosPorExpedicao.set(a.entidadeId, lista);
    }
  }

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

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Expedições programadas</h2>

        {expedicoes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma expedição programada ainda.
            </CardContent>
          </Card>
        )}

        {expedicoes.map((e) => {
          const anexos = anexosPorExpedicao.get(e.id) ?? [];
          return (
            <Card key={e.id}>
              <CardHeader className="flex-row items-center justify-between gap-4 sm:flex">
                <div>
                  <CardTitle className="text-base text-foreground">
                    {e.pedidoVenda.numero} — {e.pedidoVenda.cliente.razaoSocial}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Programada em {e.dataAgendamento ? formatDateTime(e.dataAgendamento) : "—"}
                  </p>
                </div>
                <Badge>{e.status === "EXPEDIDO" ? "Expedido" : e.status}</Badge>
              </CardHeader>
              <CardContent>
                <form action={atualizarExpedicao} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                  <input type="hidden" name="expedicaoId" value={e.id} />
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`frete-${e.id}`}>Valor do frete (R$)</Label>
                    <Input
                      id={`frete-${e.id}`}
                      name="valorFrete"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={e.valorFrete ? Number(e.valorFrete) : undefined}
                      className="w-40"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`arquivo-${e.id}`}>Anexar canhoto/NF</Label>
                    <input
                      id={`arquivo-${e.id}`}
                      name="arquivo"
                      type="file"
                      className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-secondary-foreground"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="outline">
                    Salvar
                  </Button>
                </form>

                <div className="mt-4 flex flex-col gap-2 text-sm">
                  {e.valorFrete && (
                    <p className="text-muted-foreground">
                      Frete atual: <span className="font-medium text-foreground">{formatCurrencyBRL(Number(e.valorFrete))}</span>
                    </p>
                  )}
                  {anexos.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {anexos.map((a) => (
                        <span key={a.id} className="flex items-center gap-1.5 text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5" />
                          {a.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
