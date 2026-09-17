import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { aprovarPedido } from "@/lib/actions";
import { verificarDisponibilidade } from "@/lib/estoque";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NovoPedidoForm } from "@/components/comercial/novo-pedido-form";
import { formatCurrencyBRL, formatNumber, formatDateTime, STATUS_PEDIDO_LABEL, STATUS_PEDIDO_BADGE } from "@/lib/format";

export default async function ComercialPage() {
  await requireModuleAccess("comercial.pedidos");

  const [clientes, produtos, pedidos] = await Promise.all([
    // select explícito (não o registro Prisma inteiro): NovoPedidoForm é Client Component, e
    // campos Decimal (ex.: precoBase do Produto) não atravessam a fronteira server->client.
    prisma.cliente.findMany({ where: { deletedAt: null, ativo: true }, orderBy: { razaoSocial: "asc" }, select: { id: true, razaoSocial: true } }),
    prisma.produto.findMany({ where: { deletedAt: null, ativo: true }, orderBy: { nomeComercial: "asc" }, select: { id: true, nomeComercial: true } }),
    prisma.pedidoVenda.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { cliente: true, itens: { include: { produto: true } } },
    }),
  ]);

  // Só checa disponibilidade pra quem ainda não foi produzido — depois de EM_PRODUCAO
  // em diante a matéria-prima já foi baixada (ou já era suficiente).
  const disponibilidadePorPedido = new Map<number, boolean>();
  for (const p of pedidos) {
    if (p.status !== "PENDENTE" && p.status !== "APROVADO") continue;
    let faltaAlgo = false;
    for (const item of p.itens) {
      const disponibilidade = await verificarDisponibilidade(item.produtoId, Number(item.quantidade));
      if (disponibilidade.some((d) => !d.suficiente)) {
        faltaAlgo = true;
        break;
      }
    }
    disponibilidadePorPedido.set(p.id, faltaAlgo);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Comercial — Pedidos de Venda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Um pedido chega (hoje por e-mail, com José Higor) → aprovar envia pro PCP revisar a fórmula.
        </p>
      </div>

      <NovoPedidoForm clientes={clientes} produtos={produtos} />

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Frete / Saída</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((p) => {
                const valor = p.itens.reduce((acc, i) => acc + Number(i.quantidade) * Number(i.precoUnitario), 0);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.numero}</TableCell>
                    <TableCell className="font-medium">{p.cliente.razaoSocial}</TableCell>
                    <TableCell>
                      {p.itens.map((i) => `${i.produto.nomeComercial} (${formatNumber(i.quantidade, 0)} kg)`).join(", ")}
                    </TableCell>
                    <TableCell>{formatCurrencyBRL(valor)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {p.freteTipo && <Badge variant={p.freteTipo === "CIF" ? "default" : "outline"}>{p.freteTipo}</Badge>}
                        {p.dataPrometida && <span className="text-muted-foreground">saída {formatDateTime(p.dataPrometida).split(" ")[0]}</span>}
                        {!p.freteTipo && !p.dataPrometida && <span className="text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={STATUS_PEDIDO_BADGE[p.status]}>{STATUS_PEDIDO_LABEL[p.status]}</Badge>
                        {disponibilidadePorPedido.get(p.id) && (
                          <span className="text-xs font-medium text-destructive">Falta matéria-prima</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(p.createdAt)}</TableCell>
                    <TableCell>
                      {p.status === "PENDENTE" && (
                        <form action={aprovarPedido.bind(null, p.id)}>
                          <Button type="submit" size="sm" variant="accent">
                            Aprovar → PCP
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {pedidos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum pedido registrado ainda.
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
