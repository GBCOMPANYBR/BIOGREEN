import Link from "next/link";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { emitirLaudo } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, formatDate } from "@/lib/format";

export default async function QualidadePage() {
  await requireModuleAccess("qualidade.especificacoes");

  const [lotes, clientes] = await Promise.all([
    prisma.lote.findMany({
      orderBy: { dataFabricacao: "desc" },
      include: {
        produto: { include: { especificacoes: true } },
        coaDocumentos: true,
        ordemProducao: { include: { pedidoVenda: true } },
        analises: { include: { especificacao: true } },
      },
    }),
    prisma.cliente.findMany({ where: { ativo: true }, orderBy: { razaoSocial: "asc" } }),
  ]);

  const pendentes = lotes.filter((l) => l.coaDocumentos.length === 0);
  const laudados = lotes.filter((l) => l.coaDocumentos.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Qualidade / Laboratório</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nenhum lote sai sem laudo — a Beatriz mede cada parâmetro contra a especificação do produto, e o COA já sai
          pronto para imprimir.
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
              {pendentes.map((l) => {
                const clienteDerivado = l.ordemProducao?.pedidoVenda?.clienteId ?? null;
                return (
                  <TableRow key={l.id}>
                    <TableCell colSpan={5} className="p-3">
                      <details>
                        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                          <span className="flex flex-wrap items-center gap-4">
                            <span className="font-mono text-xs">{l.numeroLote}</span>
                            <span className="font-medium">{l.produto.nomeComercial}</span>
                            <span className="text-sm text-muted-foreground">{formatNumber(l.quantidade, 0)} kg</span>
                            <span className="text-xs text-muted-foreground">
                              {l.dataFabricacao ? formatDate(l.dataFabricacao) : "—"}
                            </span>
                          </span>
                          <span className="text-xs font-medium text-primary">Analisar e emitir laudo ▾</span>
                        </summary>

                        <form
                          action={emitirLaudo}
                          className="mt-4 flex flex-col gap-4 rounded-md border border-border bg-muted/40 p-4"
                        >
                          <input type="hidden" name="loteId" value={l.id} />

                          <div className="flex flex-col gap-1.5 sm:max-w-xs">
                            <Label className="text-xs">Cliente (aparece no laudo)</Label>
                            <select
                              name="clienteId"
                              defaultValue={clienteDerivado ?? ""}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                            >
                              <option value="">— sem cliente definido —</option>
                              {clientes.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.razaoSocial}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                  <th className="py-1.5 pr-3">Parâmetro</th>
                                  <th className="py-1.5 pr-3">Especificação</th>
                                  <th className="py-1.5">Resultado medido</th>
                                </tr>
                              </thead>
                              <tbody>
                                {l.produto.especificacoes.map((esp) => {
                                  const isTexto = esp.minimo === null && esp.maximo === null;
                                  const faixa = isTexto
                                    ? "descritivo"
                                    : `${esp.minimo ?? "—"} a ${esp.maximo ?? "—"}${esp.unidade ? ` ${esp.unidade}` : ""}`;
                                  return (
                                    <tr key={esp.id} className="border-b border-border/50 last:border-0">
                                      <td className="py-1.5 pr-3 font-medium">{esp.parametro}</td>
                                      <td className="py-1.5 pr-3 text-xs text-muted-foreground">{faixa}</td>
                                      <td className="py-1.5">
                                        <Input
                                          name={`resultado_${esp.id}`}
                                          required
                                          className="h-8 max-w-[220px]"
                                          placeholder={isTexto ? "Ex.: Líquido amarelo pálido" : "Valor medido"}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <Button type="submit" variant="accent" className="self-start">
                            Emitir laudo (COA)
                          </Button>
                        </form>
                      </details>
                    </TableCell>
                  </TableRow>
                );
              })}
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
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {laudados.map((l) => {
                const reprovado = l.analises.some((a) => !a.aprovado);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.numeroLote}</TableCell>
                    <TableCell className="font-medium">{l.produto.nomeComercial}</TableCell>
                    <TableCell>
                      <Badge variant={reprovado ? "destructive" : "default"}>{reprovado ? "Reprovado" : "Aprovado"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/laudo/${l.id}`} target="_blank">
                          Ver / imprimir
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {laudados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
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
