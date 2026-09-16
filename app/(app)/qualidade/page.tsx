import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { emitirLaudo } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatDate } from "@/lib/format";

export default async function QualidadePage() {
  await requireModuleAccess("qualidade.especificacoes");

  const lotes = await prisma.lote.findMany({
    orderBy: { dataFabricacao: "desc" },
    include: { produto: true, coaDocumentos: true },
  });

  const pendentes = lotes.filter((l) => l.coaDocumentos.length === 0);
  const laudados = lotes.filter((l) => l.coaDocumentos.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Qualidade / Laboratório</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nenhum lote sai sem laudo — a Beatriz emite o COA direto aqui, e ele já fica anexado ao lote.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aguardando laudo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Fabricado em</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.numeroLote}</TableCell>
                  <TableCell className="font-medium">{l.produto.nomeComercial}</TableCell>
                  <TableCell>{formatNumber(l.quantidade, 0)} kg</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.dataFabricacao ? formatDate(l.dataFabricacao) : "—"}
                  </TableCell>
                  <TableCell>
                    <form action={emitirLaudo.bind(null, l.id)}>
                      <Button type="submit" size="sm" variant="accent">
                        Emitir laudo (COA)
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {pendentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum lote pendente de laudo no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Laudos emitidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laudados.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.numeroLote}</TableCell>
                  <TableCell className="font-medium">{l.produto.nomeComercial}</TableCell>
                  <TableCell>
                    <Badge>Aprovado</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {laudados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum laudo emitido ainda.
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
