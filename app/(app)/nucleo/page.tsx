import Link from "next/link";
import { Building2, Package, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { can, type AuthedUser } from "@/lib/permissions";
import { RECURSOS, type Acao } from "@/lib/recursos";
import {
  criarCliente,
  atualizarCliente,
  excluirCliente,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  atualizarUsuario,
  excluirUsuario,
  criarCargo,
  salvarPermissoesCargo,
} from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CriarUsuarioForm } from "@/components/nucleo/criar-usuario-form";
import { RedefinirSenhaButton } from "@/components/nucleo/redefinir-senha-button";
import { cn } from "@/lib/utils";
import { formatCurrencyBRL } from "@/lib/format";

const ACOES: { chave: Acao; label: string }[] = [
  { chave: "podeVer", label: "Ver" },
  { chave: "podeCriar", label: "Criar" },
  { chave: "podeEditar", label: "Editar" },
  { chave: "podeAprovar", label: "Aprovar" },
  { chave: "podeExcluir", label: "Excluir" },
];

const SEGMENTO_LABEL: Record<string, string> = {
  PAPEL_CARTAO: "Papel e Cartão",
  CELULOSE: "Celulose",
  TRATAMENTO_AGUA: "Tratamento de Água",
};
const FORMA_LABEL: Record<string, string> = {
  PO: "Pó",
  EMULSAO: "Emulsão",
  LIQUIDO: "Líquido",
  GEL: "Gel",
  OUTRO: "Outro",
};
const ORIGEM_LABEL: Record<string, string> = {
  FABRICADO: "Fabricado",
  REVENDIDO: "Revendido",
  MISTURA_CUSTOMIZADA: "Mistura customizada",
};

function SelectField({
  name,
  defaultValue,
  options,
  required,
}: {
  name: string;
  defaultValue?: string;
  options: Record<string, string>;
  required?: boolean;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      required={required}
      className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
    >
      {!required && <option value="">—</option>}
      {Object.entries(options).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

async function ClientesTab({ podeCriar, podeEditar, podeExcluir }: { podeCriar: boolean; podeEditar: boolean; podeExcluir: boolean }) {
  const [clientes, usuarios] = await Promise.all([
    prisma.cliente.findMany({
      where: { deletedAt: null },
      orderBy: { razaoSocial: "asc" },
      include: { vendedor: { select: { nome: true } }, tecnico: { select: { nome: true } } },
    }),
    prisma.usuario.findMany({ where: { deletedAt: null, ativo: true }, orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);

  const colSpan = podeExcluir ? 7 : 6;

  return (
    <div className="flex flex-col gap-6">
      {podeCriar && (
        <Card>
          <CardHeader>
            <CardTitle>Novo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={criarCliente} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="razaoSocial">Razão social</Label>
                <Input id="razaoSocial" name="razaoSocial" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nomeFantasia">Nome fantasia</Label>
                <Input id="nomeFantasia" name="nomeFantasia" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cnpjCpf">CNPJ/CPF</Label>
                <Input id="cnpjCpf" name="cnpjCpf" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="segmento">Segmento</Label>
                <SelectField name="segmento" options={SEGMENTO_LABEL} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vendedorId">Vendedor</Label>
                <select id="vendedorId" name="vendedorId" className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option value="">—</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tecnicoId">Técnico responsável</Label>
                <select id="tecnicoId" name="tecnicoId" className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option value="">—</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="condicoesComerciais">Condições comerciais</Label>
                <Input id="condicoesComerciais" name="condicoesComerciais" placeholder="Ex.: 30/60/90 dias, frete CIF..." />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" name="endereco" placeholder="Rua, número" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" name="bairro" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" name="cidade" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" name="uf" maxLength={2} className="uppercase" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" name="cep" />
              </div>
              <div className="flex items-end">
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão social</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Status</TableHead>
                {podeExcluir && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((c) => {
                if (!podeEditar) {
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.razaoSocial}</TableCell>
                      <TableCell>{SEGMENTO_LABEL[c.segmento] ?? c.segmento}</TableCell>
                      <TableCell className="text-muted-foreground">{c.cnpjCpf}</TableCell>
                      <TableCell>{c.vendedor?.nome ?? "—"}</TableCell>
                      <TableCell>{c.tecnico?.nome ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={c.ativo ? "default" : "outline"}>{c.ativo ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow key={c.id}>
                    <TableCell colSpan={colSpan} className="p-3">
                      <form id={`cliente-form-${c.id}`} action={atualizarCliente} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-6">
                        <input type="hidden" name="clienteId" value={c.id} />
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Razão social</Label>
                          <Input name="razaoSocial" defaultValue={c.razaoSocial} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Fantasia</Label>
                          <Input name="nomeFantasia" defaultValue={c.nomeFantasia ?? ""} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">CNPJ/CPF</Label>
                          <Input name="cnpjCpf" defaultValue={c.cnpjCpf} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Segmento</Label>
                          <SelectField name="segmento" defaultValue={c.segmento} options={SEGMENTO_LABEL} required />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Vendedor</Label>
                          <select name="vendedorId" defaultValue={c.vendedorId ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                            <option value="">—</option>
                            {usuarios.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Técnico</Label>
                          <select name="tecnicoId" defaultValue={c.tecnicoId ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                            <option value="">—</option>
                            {usuarios.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Condições comerciais</Label>
                          <Input name="condicoesComerciais" defaultValue={c.condicoesComerciais ?? ""} />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Endereço</Label>
                          <Input name="endereco" defaultValue={c.endereco ?? ""} placeholder="Rua, número" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Bairro</Label>
                          <Input name="bairro" defaultValue={c.bairro ?? ""} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Cidade</Label>
                          <Input name="cidade" defaultValue={c.cidade ?? ""} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">UF</Label>
                          <Input name="uf" defaultValue={c.uf ?? ""} maxLength={2} className="uppercase" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">CEP</Label>
                          <Input name="cep" defaultValue={c.cep ?? ""} />
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <input type="checkbox" name="ativo" defaultChecked={c.ativo} className="h-4 w-4 rounded border-input" />
                          Ativo
                        </label>
                      </form>
                      <div className="mt-2 flex items-center gap-2">
                        <Button type="submit" form={`cliente-form-${c.id}`} size="sm" variant="outline" className="ml-auto">
                          Salvar
                        </Button>
                        {podeExcluir && (
                          <form action={excluirCliente.bind(null, c.id)}>
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
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum cliente cadastrado ainda.
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

async function ProdutosTab({ podeCriar, podeEditar, podeExcluir }: { podeCriar: boolean; podeEditar: boolean; podeExcluir: boolean }) {
  const [produtos, unidades] = await Promise.all([
    prisma.produto.findMany({ where: { deletedAt: null }, orderBy: { nomeComercial: "asc" }, include: { unidadeMedida: true } }),
    prisma.unidadeMedida.findMany({ orderBy: { sigla: "asc" } }),
  ]);

  const colSpan = podeExcluir ? 7 : 6;

  return (
    <div className="flex flex-col gap-6">
      {podeCriar && (
        <Card>
          <CardHeader>
            <CardTitle>Novo produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={criarProduto} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="codigoInterno">Código interno</Label>
                <Input id="codigoInterno" name="codigoInterno" required />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="nomeComercial">Nome comercial</Label>
                <Input id="nomeComercial" name="nomeComercial" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="familia">Família</Label>
                <Input id="familia" name="familia" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="segmento">Segmento</Label>
                <SelectField name="segmento" options={SEGMENTO_LABEL} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forma">Forma</Label>
                <SelectField name="forma" defaultValue="LIQUIDO" options={FORMA_LABEL} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="origem">Origem</Label>
                <SelectField name="origem" defaultValue="FABRICADO" options={ORIGEM_LABEL} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unidadeMedidaId">Unidade</Label>
                <select id="unidadeMedidaId" name="unidadeMedidaId" required className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.sigla}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="precoBase">Preço base (R$)</Label>
                <Input id="precoBase" name="precoBase" type="number" step="0.01" min="0" />
              </div>
              <div className="flex items-end">
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Família</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Preço base</TableHead>
                {podeExcluir && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((p) => {
                if (!podeEditar) {
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.codigoInterno}</TableCell>
                      <TableCell className="font-medium">{p.nomeComercial}</TableCell>
                      <TableCell>{p.familia ?? "—"}</TableCell>
                      <TableCell>{SEGMENTO_LABEL[p.segmento] ?? p.segmento}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ORIGEM_LABEL[p.origem] ?? p.origem}</Badge>
                      </TableCell>
                      <TableCell>{p.precoBase ? `${formatCurrencyBRL(Number(p.precoBase))} / ${p.unidadeMedida.sigla}` : "—"}</TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow key={p.id}>
                    <TableCell colSpan={colSpan} className="p-3">
                      <form id={`produto-form-${p.id}`} action={atualizarProduto} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-7">
                        <input type="hidden" name="produtoId" value={p.id} />
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Código</Label>
                          <Input name="codigoInterno" defaultValue={p.codigoInterno} />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <Label className="text-xs text-muted-foreground">Nome comercial</Label>
                          <Input name="nomeComercial" defaultValue={p.nomeComercial} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Família</Label>
                          <Input name="familia" defaultValue={p.familia ?? ""} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Segmento</Label>
                          <SelectField name="segmento" defaultValue={p.segmento} options={SEGMENTO_LABEL} required />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Forma</Label>
                          <SelectField name="forma" defaultValue={p.forma} options={FORMA_LABEL} required />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Origem</Label>
                          <SelectField name="origem" defaultValue={p.origem} options={ORIGEM_LABEL} required />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Unidade</Label>
                          <select name="unidadeMedidaId" defaultValue={p.unidadeMedidaId} className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                            {unidades.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.sigla}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Preço base</Label>
                          <Input name="precoBase" type="number" step="0.01" min="0" defaultValue={p.precoBase ? Number(p.precoBase) : undefined} />
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <input type="checkbox" name="ativo" defaultChecked={p.ativo} className="h-4 w-4 rounded border-input" />
                          Ativo
                        </label>
                      </form>
                      <div className="mt-2 flex items-center gap-2">
                        <Button type="submit" form={`produto-form-${p.id}`} size="sm" variant="outline" className="ml-auto">
                          Salvar
                        </Button>
                        {podeExcluir && (
                          <form action={excluirProduto.bind(null, p.id)}>
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
              {produtos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum produto cadastrado ainda.
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

async function UsuariosTab({
  podeCriar,
  podeEditar,
  podeExcluir,
  usuarioLogadoId,
}: {
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
  usuarioLogadoId: number;
}) {
  const [usuarios, cargos] = await Promise.all([
    prisma.usuario.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" }, include: { cargo: { include: { setor: true } } } }),
    prisma.cargo.findMany({ orderBy: [{ setor: { nome: "asc" } }, { nome: "asc" }], include: { setor: true } }),
  ]);

  const cargoOptions = cargos.map((c) => ({ id: c.id, nome: c.nome, setorNome: c.setor.nome }));
  const colSpan = podeExcluir ? 6 : 5;

  return (
    <div className="flex flex-col gap-6">
      {podeCriar && (
        <Card>
          <CardHeader>
            <CardTitle>Novo usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <CriarUsuarioForm cargos={cargoOptions} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Acesso</TableHead>
                {podeExcluir && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => {
                if (!podeEditar) {
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{u.username}</TableCell>
                      <TableCell>{u.cargo?.setor.nome ?? "—"}</TableCell>
                      <TableCell>{u.cargo?.nome ?? "—"}</TableCell>
                      <TableCell>
                        {u.superAdmin ? <Badge variant="accent">Acesso total</Badge> : <Badge variant="outline">Por permissão</Badge>}
                      </TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow key={u.id}>
                    <TableCell colSpan={colSpan} className="p-3">
                      <form id={`usuario-form-${u.id}`} action={atualizarUsuario} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-5">
                        <input type="hidden" name="usuarioId" value={u.id} />
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Nome</Label>
                          <Input name="nome" defaultValue={u.nome} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Usuário</Label>
                          <Input name="username" defaultValue={u.username} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">E-mail</Label>
                          <Input name="email" type="email" defaultValue={u.email} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Cargo</Label>
                          <select name="cargoId" defaultValue={u.cargoId ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                            <option value="">Sem cargo</option>
                            {cargos.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.setor.nome} — {c.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            name="ativo"
                            defaultChecked={u.ativo}
                            disabled={u.id === usuarioLogadoId}
                            className="h-4 w-4 rounded border-input"
                          />
                          Ativo
                        </label>
                      </form>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {u.superAdmin && <Badge variant="accent">Acesso total</Badge>}
                        <Button type="submit" form={`usuario-form-${u.id}`} size="sm" variant="outline" className="ml-auto">
                          Salvar
                        </Button>
                        <RedefinirSenhaButton usuarioId={u.id} usuarioNome={u.nome} />
                        {podeExcluir && u.id !== usuarioLogadoId && (
                          <form action={excluirUsuario.bind(null, u.id)}>
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
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum usuário cadastrado ainda.
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

async function PermissoesTab({ cargoIdParam, podeEditar }: { cargoIdParam?: string; podeEditar: boolean }) {
  const [cargos, setores] = await Promise.all([
    prisma.cargo.findMany({ orderBy: [{ setor: { nome: "asc" } }, { nome: "asc" }], include: { setor: true } }),
    prisma.setor.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const cargoIdSelecionado = cargoIdParam ? Number(cargoIdParam) : cargos[0]?.id;
  const cargoAtual = cargos.find((c) => c.id === cargoIdSelecionado);
  const permissoesAtuais = cargoAtual ? await prisma.permissao.findMany({ where: { cargoId: cargoAtual.id } }) : [];
  const permissaoPorRecurso = new Map(permissoesAtuais.map((p) => [p.recurso, p]));
  const modulos = [...new Set(RECURSOS.map((r) => r.modulo))];
  const setorNomes = [...new Set(cargos.map((c) => c.setor.nome))];

  return (
    <div className="flex flex-col gap-6">
      {podeEditar && (
        <Card>
          <CardHeader>
            <CardTitle>Novo cargo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={criarCargo} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="nomeCargo">Nome do cargo</Label>
                <Input id="nomeCargo" name="nome" required />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="setorId">Setor</Label>
                <select id="setorId" name="setorId" required className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                  <option value="">Selecione</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Criar cargo</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Permissões por cargo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form method="GET" className="flex items-end gap-2">
            <input type="hidden" name="aba" value="permissoes" />
            <div className="flex flex-1 flex-col gap-1.5 sm:max-w-xs">
              <Label htmlFor="cargoIdSelect">Cargo</Label>
              <select
                id="cargoIdSelect"
                name="cargoId"
                defaultValue={cargoAtual?.id ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                {setorNomes.map((setorNome) => (
                  <optgroup key={setorNome} label={setorNome}>
                    {cargos
                      .filter((c) => c.setor.nome === setorNome)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <Button type="submit" variant="outline">
              Ver
            </Button>
          </form>

          {!cargoAtual && <p className="text-sm text-muted-foreground">Nenhum cargo cadastrado ainda.</p>}

          {cargoAtual && (
            <form action={salvarPermissoesCargo} className="flex flex-col gap-4">
              <input type="hidden" name="cargoId" value={cargoAtual.id} />
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Recurso</th>
                      {ACOES.map((a) => (
                        <th key={a.chave} className="px-3 py-2 text-center font-medium">
                          {a.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {modulos.map((modulo) => (
                    <tbody key={modulo}>
                      <tr className="bg-muted/20">
                        <td colSpan={ACOES.length + 1} className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {modulo}
                        </td>
                      </tr>
                      {RECURSOS.filter((r) => r.modulo === modulo).map((r) => {
                        const p = permissaoPorRecurso.get(r.chave);
                        return (
                          <tr key={r.chave} className="border-b border-border last:border-0">
                            <td className="px-3 py-2">{r.label}</td>
                            {ACOES.map((a) => (
                              <td key={a.chave} className="px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  name={`${r.chave}__${a.chave}`}
                                  defaultChecked={p?.[a.chave] ?? false}
                                  disabled={!podeEditar}
                                  className="h-4 w-4 rounded border-input"
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  ))}
                </table>
              </div>
              {podeEditar && (
                <Button type="submit" className="self-start">
                  Salvar permissões — {cargoAtual.nome}
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function abasVisiveis(user: AuthedUser) {
  return [
    { key: "clientes", label: "Clientes", icon: Building2, visivel: can(user, "nucleo.cadastros", "podeVer") },
    { key: "produtos", label: "Produtos", icon: Package, visivel: can(user, "nucleo.cadastros", "podeVer") },
    { key: "usuarios", label: "Usuários", icon: UsersIcon, visivel: can(user, "nucleo.usuarios", "podeVer") || user.superAdmin },
    { key: "permissoes", label: "Permissões", icon: ShieldCheck, visivel: can(user, "nucleo.usuarios", "podeVer") || user.superAdmin },
  ].filter((a) => a.visivel);
}

export default async function NucleoPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; cargoId?: string }>;
}) {
  const user = await requireModuleAccess("nucleo.cadastros");
  const { aba: abaParam, cargoId: cargoIdParam } = await searchParams;

  const abas = abasVisiveis(user);
  const aba = abas.some((a) => a.key === abaParam) ? abaParam! : abas[0]?.key ?? "clientes";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Núcleo — Cadastros e Usuários</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastros mestres da Biogreen — a base que alimenta todos os outros módulos.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {abas.map((a) => (
          <Link
            key={a.key}
            href={`/nucleo?aba=${a.key}`}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              aba === a.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <a.icon className="h-4 w-4" />
            {a.label}
          </Link>
        ))}
      </div>

      {aba === "clientes" && (
        <ClientesTab
          podeCriar={can(user, "nucleo.cadastros", "podeCriar")}
          podeEditar={can(user, "nucleo.cadastros", "podeEditar")}
          podeExcluir={can(user, "nucleo.cadastros", "podeExcluir")}
        />
      )}
      {aba === "produtos" && (
        <ProdutosTab
          podeCriar={can(user, "nucleo.cadastros", "podeCriar")}
          podeEditar={can(user, "nucleo.cadastros", "podeEditar")}
          podeExcluir={can(user, "nucleo.cadastros", "podeExcluir")}
        />
      )}
      {aba === "usuarios" && (
        <UsuariosTab
          podeCriar={can(user, "nucleo.usuarios", "podeCriar") || user.superAdmin}
          podeEditar={can(user, "nucleo.usuarios", "podeEditar") || user.superAdmin}
          podeExcluir={can(user, "nucleo.usuarios", "podeExcluir") || user.superAdmin}
          usuarioLogadoId={user.id}
        />
      )}
      {aba === "permissoes" && (
        <PermissoesTab cargoIdParam={cargoIdParam} podeEditar={can(user, "nucleo.usuarios", "podeEditar") || user.superAdmin} />
      )}
    </div>
  );
}
