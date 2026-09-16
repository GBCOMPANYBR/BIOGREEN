import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { criarAtivo, baixarAtivo } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyBRL, formatDate } from "@/lib/format";

const CATEGORIAS = ["Equipamento de Produção", "Veículo", "Informática", "Mobiliário", "Outro"];

export default async function AtivosPage() {
  await requireModuleAccess("patrimonio.ativos");

  const [ativos, fornecedores] = await Promise.all([
    prisma.ativo.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, include: { fornecedor: true } }),
    prisma.fornecedor.findMany({ where: { deletedAt: null, ativo: true }, orderBy: { razaoSocial: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ativos (CAPEX)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Equipamentos e outros bens comprados pela empresa — rastreados por aqui, não mais "no nome do fornecedor".
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarAtivo} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <select
                id="categoria"
                name="categoria"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fornecedorId">Fornecedor</Label>
              <select
                id="fornecedorId"
                name="fornecedorId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="numeroSerie">Número de série</Label>
              <Input id="numeroSerie" name="numeroSerie" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataAquisicao">Data de aquisição</Label>
              <Input id="dataAquisicao" name="dataAquisicao" type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valorAquisicao">Valor (R$)</Label>
              <Input id="valorAquisicao" name="valorAquisicao" type="number" step="0.01" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="localizacao">Localização</Label>
              <Input id="localizacao" name="localizacao" placeholder="ex.: Galpão 2 — Suzano" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vidaUtilAnos">Vida útil (anos)</Label>
              <Input id="vidaUtilAnos" name="vidaUtilAnos" type="number" step="1" min="0" />
            </div>
            <div className="flex items-end lg:col-span-1">
              <Button type="submit">Cadastrar ativo</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Aquisição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ativos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.categoria}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.fornecedor?.razaoSocial ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {a.dataAquisicao ? formatDate(a.dataAquisicao) : "—"}
                  </TableCell>
                  <TableCell>{a.valorAquisicao ? formatCurrencyBRL(Number(a.valorAquisicao)) : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.localizacao ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "ATIVO" ? "default" : "outline"}>
                      {a.status === "ATIVO" ? "Ativo" : "Baixado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.status === "ATIVO" && (
                      <form action={baixarAtivo.bind(null, a.id)}>
                        <Button type="submit" size="sm" variant="outline">
                          Dar baixa
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {ativos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum ativo cadastrado ainda.
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
