import Link from "next/link";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { criarVisita } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";

export default async function TecnicaPage() {
  const user = await requireModuleAccess("tecnica.visitas");

  const [clientes, tecnicos, visitas] = await Promise.all([
    prisma.cliente.findMany({ where: { deletedAt: null, ativo: true }, orderBy: { razaoSocial: "asc" } }),
    prisma.usuario.findMany({ where: { ativo: true, deletedAt: null }, orderBy: { nome: "asc" } }),
    prisma.visitaTecnica.findMany({
      orderBy: { dataAgendada: "desc" },
      take: 60,
      include: { cliente: true, tecnico: true, relatorio: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assistência Técnica</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada visita vira uma linha aqui — o relatório mensal (o mesmo que hoje sai em PowerPoint) é montado
          sozinho a partir das visitas registradas no mês.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova visita</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarVisita} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clienteId">Cliente</Label>
              <select id="clienteId" name="clienteId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Selecione</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tecnicoId">Técnico</Label>
              <select id="tecnicoId" name="tecnicoId" required defaultValue={user.id} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataAgendada">Data</Label>
              <Input id="dataAgendada" name="dataAgendada" type="date" required />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <Label htmlFor="roteiro">Roteiro / observação</Label>
              <Input id="roteiro" name="roteiro" placeholder="ex.: Acompanhamento ETA, controle de cloro" />
            </div>
            <div className="lg:col-span-5">
              <Button type="submit">Agendar visita</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ver relatório mensal de um cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/tecnica/relatorio" className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="clienteRelatorio">Cliente</Label>
              <select id="clienteRelatorio" name="cliente" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mesRelatorio">Mês</Label>
              <Input id="mesRelatorio" name="mes" type="month" required defaultValue={new Date().toISOString().slice(0, 7)} />
            </div>
            <Button type="submit" variant="accent">
              Gerar relatório
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitas.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(v.dataAgendada)}</TableCell>
                  <TableCell className="font-medium">{v.cliente.razaoSocial}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.tecnico.nome}</TableCell>
                  <TableCell>
                    <Badge variant={v.status === "REALIZADA" ? "default" : v.status === "CANCELADA" ? "destructive" : "secondary"}>
                      {v.status === "AGENDADA" ? "Agendada" : v.status === "REALIZADA" ? "Realizada" : "Não realizada"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/tecnica/visita/${v.id}`}>
                      <Button size="sm" variant="outline">
                        {v.status === "AGENDADA" ? "Registrar" : "Ver"}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {visitas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma visita agendada ainda.
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
