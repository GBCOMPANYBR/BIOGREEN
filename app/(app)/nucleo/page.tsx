import Link from "next/link";
import { Building2, Package, Users as UsersIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrencyBRL } from "@/lib/format";

const SEGMENTO_LABEL: Record<string, string> = {
  PAPEL_CARTAO: "Papel e Cartão",
  CELULOSE: "Celulose",
  TRATAMENTO_AGUA: "Tratamento de Água",
};

const ABAS = [
  { key: "clientes", label: "Clientes", icon: Building2 },
  { key: "produtos", label: "Produtos", icon: Package },
  { key: "usuarios", label: "Usuários", icon: UsersIcon },
] as const;

async function ClientesTable() {
  const clientes = await prisma.cliente.findMany({
    where: { deletedAt: null },
    orderBy: { razaoSocial: "asc" },
    include: { vendedor: { select: { nome: true } }, tecnico: { select: { nome: true } } },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Razão social</TableHead>
          <TableHead>Segmento</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Vendedor</TableHead>
          <TableHead>Técnico</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((c) => (
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
        ))}
      </TableBody>
    </Table>
  );
}

async function ProdutosTable() {
  const produtos = await prisma.produto.findMany({
    where: { deletedAt: null },
    orderBy: { nomeComercial: "asc" },
    include: { unidadeMedida: { select: { sigla: true } } },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Produto</TableHead>
          <TableHead>Família</TableHead>
          <TableHead>Segmento</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Preço base</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {produtos.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs text-muted-foreground">{p.codigoInterno}</TableCell>
            <TableCell className="font-medium">{p.nomeComercial}</TableCell>
            <TableCell>{p.familia ?? "—"}</TableCell>
            <TableCell>{SEGMENTO_LABEL[p.segmento] ?? p.segmento}</TableCell>
            <TableCell>
              <Badge variant="secondary">{p.origem.replace(/_/g, " ").toLowerCase()}</Badge>
            </TableCell>
            <TableCell>
              {p.precoBase ? `${formatCurrencyBRL(Number(p.precoBase))} / ${p.unidadeMedida.sigla}` : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

async function UsuariosTable() {
  const usuarios = await prisma.usuario.findMany({
    where: { deletedAt: null },
    orderBy: { nome: "asc" },
    include: { cargo: { include: { setor: true } } },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Setor</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Acesso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-medium">{u.nome}</TableCell>
            <TableCell className="text-muted-foreground">{u.username}</TableCell>
            <TableCell>{u.cargo?.setor.nome ?? "—"}</TableCell>
            <TableCell>{u.cargo?.nome ?? "—"}</TableCell>
            <TableCell>
              {u.superAdmin ? <Badge variant="accent">Acesso total</Badge> : <Badge variant="outline">Por permissão</Badge>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function NucleoPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  await requireModuleAccess("nucleo.cadastros");
  const { aba: abaParam } = await searchParams;
  const aba = ABAS.some((a) => a.key === abaParam) ? abaParam! : "clientes";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Núcleo — Cadastros e Usuários</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastros mestres da Biogreen — a base que alimenta todos os outros módulos.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {ABAS.map((a) => (
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

      <Card>
        <CardContent className="p-0">
          {aba === "clientes" && <ClientesTable />}
          {aba === "produtos" && <ProdutosTable />}
          {aba === "usuarios" && <UsuariosTable />}
        </CardContent>
      </Card>
    </div>
  );
}
