import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { importarNfeEntrada, categorizarNotaFiscalEntrada, darEntradaItemComoMateriaPrima } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyBRL, formatNumber, formatDate } from "@/lib/format";
import { chaveNome } from "@/lib/utils";

interface ItemNfArmazenado {
  descricao: string;
  ncm?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  lancadoComoMateriaPrima: boolean;
  materiaPrimaId: number | null;
}

export default async function ComprasPage() {
  await requireModuleAccess("compras.pedidos");

  const [notas, planosContas, materiasPrimas] = await Promise.all([
    prisma.notaFiscalEntrada.findMany({
      orderBy: { createdAt: "desc" },
      include: { fornecedor: true, contaPagar: { include: { planoContas: true } } },
    }),
    prisma.planoContas.findMany({ where: { tipo: "DESPESA" }, orderBy: { nome: "asc" } }),
    prisma.materiaPrima.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          José Higor importa o XML da NF-e — fornecedor, itens e valor vêm sozinhos, igual o Conta Azul puxa do
          DANFE hoje. Cada item só vira estoque se for marcado como matéria-prima; o resto é só a despesa
          categorizada por centro de custo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importar NF-e (XML)</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={importarNfeEntrada} className="flex flex-col gap-3 sm:flex-row sm:items-end" encType="multipart/form-data">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="xml">Arquivo XML da nota</Label>
              <input
                id="xml"
                name="xml"
                type="file"
                accept=".xml,text/xml"
                required
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-secondary-foreground"
              />
            </div>
            <Button type="submit" variant="accent">
              Importar
            </Button>
          </form>
        </CardContent>
      </Card>

      {notas.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhuma NF importada ainda.</CardContent>
        </Card>
      )}

      {notas.map((nf) => {
        const itens = (nf.itensJson as unknown as ItemNfArmazenado[]) ?? [];
        return (
          <Card key={nf.id}>
            <CardHeader className="flex-row items-center justify-between gap-4 sm:flex">
              <div>
                <CardTitle className="text-base text-foreground">
                  NF {nf.numero}
                  {nf.serie && `/${nf.serie}`} — {nf.fornecedor.razaoSocial}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nf.dataEmissao ? formatDate(nf.dataEmissao) : "—"} · {formatCurrencyBRL(Number(nf.valorTotal ?? 0))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {nf.tipoFrete && <Badge variant="outline">{nf.tipoFrete}</Badge>}
                {nf.contaPagar ? (
                  <Badge>{nf.contaPagar.planoContas?.nome.replace("Despesas — ", "") ?? "Categorizada"}</Badge>
                ) : (
                  <Badge variant="secondary">Aguardando categorização</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {itens.length > 0 && (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Item</th>
                        <th className="px-3 py-2 text-left font-medium">Qtd.</th>
                        <th className="px-3 py-2 text-left font-medium">Valor</th>
                        <th className="px-3 py-2 text-left font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, i) => {
                        const chaveItem = chaveNome(item.descricao);
                        const sugestao = materiasPrimas.find((m) => chaveNome(m.nome) === chaveItem);
                        return (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-3 py-2">{item.descricao}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {formatNumber(item.quantidade, 2)} {item.unidade}
                            </td>
                            <td className="px-3 py-2">{formatCurrencyBRL(item.valorTotal)}</td>
                            <td className="px-3 py-2">
                              {item.lancadoComoMateriaPrima ? (
                                <span className="text-xs text-muted-foreground">Entrada de estoque registrada</span>
                              ) : (
                                <form action={darEntradaItemComoMateriaPrima} className="flex items-center gap-2">
                                  <input type="hidden" name="notaFiscalEntradaId" value={nf.id} />
                                  <input type="hidden" name="itemIndex" value={i} />
                                  <select
                                    name="materiaPrimaId"
                                    defaultValue={sugestao ? String(sugestao.id) : ""}
                                    className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
                                  >
                                    <option value="">Não é matéria-prima</option>
                                    <option value="nova">Cadastrar nova: &ldquo;{item.descricao}&rdquo;</option>
                                    {materiasPrimas.map((m) => (
                                      <option key={m.id} value={m.id}>
                                        {m.nome === sugestao?.nome ? `${m.nome} (sugerido)` : m.nome}
                                      </option>
                                    ))}
                                  </select>
                                  <Button type="submit" size="sm" variant="outline">
                                    Confirmar
                                  </Button>
                                </form>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!nf.contaPagar && (
                <form action={categorizarNotaFiscalEntrada} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <input type="hidden" name="notaFiscalEntradaId" value={nf.id} />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Centro de custo</Label>
                    <select name="planoContasId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Selecione</option>
                      {planosContas.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome.replace("Despesas — ", "")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Vencimento</Label>
                    <Input name="vencimento" type="date" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">Frete</Label>
                    <select name="tipoFrete" className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                      <option value="">—</option>
                      <option value="CIF">CIF — fornecedor entrega</option>
                      <option value="FOB">FOB — Biogreen busca</option>
                    </select>
                  </div>
                  <Button type="submit" variant="accent">
                    Lançar conta a pagar
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
