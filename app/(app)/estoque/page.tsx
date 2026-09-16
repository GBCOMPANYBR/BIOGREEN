import Link from "next/link";
import { requireAnyModuleAccess } from "@/lib/nav-visibility";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { criarMateriaPrima, atualizarMateriaPrima, excluirMateriaPrima } from "@/lib/actions";
import { saldosMateriaPrima } from "@/lib/estoque";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ABAS = [
  { key: "movimentos", label: "Movimentações", recurso: "estoque.movimentos" },
  { key: "materias-primas", label: "Matérias-primas", recurso: "estoque.materiasPrimas" },
] as const;

async function MovimentosTab() {
  const movimentos = await prisma.estoqueMovimento.findMany({
    orderBy: { dataMovimento: "desc" },
    take: 100,
    include: { localEstoque: true, produto: true, materiaPrima: true, lote: true },
  });

  return (
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
                  <Badge variant={m.tipo === "ENTRADA" ? "default" : m.tipo === "SAIDA" ? "destructive" : "outline"}>
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
  );
}

async function MateriasPrimasTab({ podeEditar, podeExcluir }: { podeEditar: boolean; podeExcluir: boolean }) {
  const [materias, unidades, fornecedores] = await Promise.all([
    prisma.materiaPrima.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" }, include: { unidadeMedida: true, fornecedorPadrao: true } }),
    prisma.unidadeMedida.findMany({ orderBy: { sigla: "asc" } }),
    prisma.fornecedor.findMany({ where: { deletedAt: null, ativo: true }, orderBy: { razaoSocial: "asc" } }),
  ]);
  const saldos = await saldosMateriaPrima(materias.map((m) => m.id));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova matéria-prima</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarMateriaPrima} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unidadeMedidaId">Unidade</Label>
              <select id="unidadeMedidaId" name="unidadeMedidaId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.sigla}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fornecedorPadraoId">Fornecedor padrão</Label>
              <select id="fornecedorPadraoId" name="fornecedorPadraoId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">—</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custoMedio">Custo médio (R$/un.)</Label>
              <Input id="custoMedio" name="custoMedio" type="number" step="0.01" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estoqueMinimo">Estoque mínimo</Label>
              <Input id="estoqueMinimo" name="estoqueMinimo" type="number" step="0.001" min="0" />
            </div>
            <div className="flex items-end">
              <Button type="submit">Cadastrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Fornecedor padrão</TableHead>
                <TableHead>Custo médio</TableHead>
                <TableHead>Estoque mínimo</TableHead>
                <TableHead>Saldo atual</TableHead>
                {(podeEditar || podeExcluir) && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {materias.map((m) => {
                const saldo = saldos.get(m.id) ?? 0;
                const abaixoDoMinimo = m.estoqueMinimo != null && saldo < Number(m.estoqueMinimo);
                if (!podeEditar) {
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.codigo}</TableCell>
                      <TableCell className="font-medium">{m.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.unidadeMedida.sigla}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.fornecedorPadrao?.razaoSocial ?? "—"}</TableCell>
                      <TableCell>{m.custoMedio ? `R$ ${formatNumber(m.custoMedio, 2)}` : "—"}</TableCell>
                      <TableCell>{m.estoqueMinimo ? formatNumber(m.estoqueMinimo, 1) : "—"}</TableCell>
                      <TableCell>
                        <span className={cn(abaixoDoMinimo && "font-medium text-destructive")}>{formatNumber(saldo, 1)}</span>
                      </TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow key={m.id}>
                    <TableCell colSpan={podeExcluir ? 8 : 7} className="p-3">
                      <form id={`mp-form-${m.id}`} action={atualizarMateriaPrima} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-6">
                        <input type="hidden" name="materiaPrimaId" value={m.id} />
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">{m.codigo}</Label>
                          <Input name="nome" defaultValue={m.nome} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Unidade</Label>
                          <select name="unidadeMedidaId" defaultValue={m.unidadeMedidaId} className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                            {unidades.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.sigla}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Fornecedor</Label>
                          <select name="fornecedorPadraoId" defaultValue={m.fornecedorPadraoId ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                            <option value="">—</option>
                            {fornecedores.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.razaoSocial}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Custo médio</Label>
                          <Input name="custoMedio" type="number" step="0.01" min="0" defaultValue={m.custoMedio ? Number(m.custoMedio) : undefined} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Estoque mín.</Label>
                          <Input name="estoqueMinimo" type="number" step="0.001" min="0" defaultValue={m.estoqueMinimo ? Number(m.estoqueMinimo) : undefined} />
                        </div>
                      </form>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Saldo atual:{" "}
                          <span className={cn("font-medium", abaixoDoMinimo ? "text-destructive" : "text-foreground")}>{formatNumber(saldo, 1)}</span>
                        </span>
                        <Button type="submit" form={`mp-form-${m.id}`} size="sm" variant="outline" className="ml-auto">
                          Salvar
                        </Button>
                        {podeExcluir && (
                          <form action={excluirMateriaPrima.bind(null, m.id)}>
                            <Button type="submit" size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              Excluir
                            </Button>
                          </form>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {materias.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma matéria-prima cadastrada ainda.
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

export default async function EstoquePage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const user = await requireAnyModuleAccess(["estoque.movimentos", "estoque.materiasPrimas"]);
  const { aba: abaParam } = await searchParams;

  const abasVisiveis = ABAS.filter((a) => can(user, a.recurso, "podeVer"));
  const aba = abasVisiveis.some((a) => a.key === abaParam) ? abaParam! : abasVisiveis[0]?.key;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estoque</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada entrada e saída de movimento sai de uma ação real em outro módulo — produção, expedição ou compra.
          O cadastro de matérias-primas é a única parte editada à mão aqui.
        </p>
      </div>

      {abasVisiveis.length > 1 && (
        <div className="flex gap-1 border-b border-border">
          {abasVisiveis.map((a) => (
            <Link
              key={a.key}
              href={`/estoque?aba=${a.key}`}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                aba === a.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}

      {aba === "movimentos" && <MovimentosTab />}
      {aba === "materias-primas" && (
        <MateriasPrimasTab podeEditar={can(user, "estoque.materiasPrimas", "podeEditar")} podeExcluir={can(user, "estoque.materiasPrimas", "podeExcluir")} />
      )}
    </div>
  );
}
