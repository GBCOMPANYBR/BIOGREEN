import Link from "next/link";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { gerarExpedicao, atualizarExpedicao, cotarFrete, atualizarFrete } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Paperclip } from "lucide-react";
import { formatCurrencyBRL, formatDate, formatDateTime, formatNumber, STATUS_EXPEDICAO_LABEL, STATUS_EXPEDICAO_BADGE } from "@/lib/format";
import { cn } from "@/lib/utils";

const ABAS = [
  { key: "cotar", label: "Fretes a cotar" },
  { key: "expedicao", label: "Expedição" },
  { key: "historico", label: "Histórico" },
] as const;

const STATUS_FRETE_LABEL: Record<string, string> = {
  AGUARDANDO_COTACAO: "Aguardando cotação",
  COTADO: "Cotado",
  EM_TRANSITO: "Em trânsito",
  ENTREGUE: "Entregue",
};

async function FretesACotarTab() {
  const [saidasCif, coletasFob, emAndamento] = await Promise.all([
    prisma.pedidoVenda.findMany({
      where: { deletedAt: null, freteTipo: "CIF", status: { in: ["APROVADO", "EM_PRODUCAO", "FATURADO"] }, fretes: { none: {} } },
      orderBy: { dataPrometida: "asc" },
      include: { cliente: true, itens: { include: { produto: true } } },
    }),
    prisma.notaFiscalEntrada.findMany({
      where: { tipoFrete: "FOB", fretes: { none: {} } },
      orderBy: { dataEmissao: "asc" },
      include: { fornecedor: true },
    }),
    prisma.frete.findMany({
      where: { status: { not: "ENTREGUE" }, OR: [{ pedidoVendaId: { not: null } }, { notaFiscalEntradaId: { not: null } }] },
      orderBy: { createdAt: "desc" },
      include: { pedidoVenda: { include: { cliente: true } }, notaFiscalEntrada: { include: { fornecedor: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Saídas — Biogreen entrega (CIF)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {saidasCif.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma saída aguardando cotação.</p>}
          {saidasCif.map((p) => (
            <div key={p.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {p.numero} — {p.cliente.razaoSocial}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.itens.map((i) => `${i.produto.nomeComercial} (${formatNumber(i.quantidade, 0)} kg)`).join(", ")}
                    {p.dataPrometida && ` · saída prevista ${formatDate(p.dataPrometida)}`}
                  </p>
                </div>
                <Badge variant="outline">CIF</Badge>
              </div>
              <form action={cotarFrete} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:items-end">
                <input type="hidden" name="pedidoVendaId" value={p.id} />
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Transportadora</Label>
                  <Input name="transportadora" required />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                  <Input name="valorFrete" type="number" step="0.01" min="0" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Data prevista</Label>
                  <Input name="dataFrete" type="date" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Obs.</Label>
                  <Input name="observacoes" />
                </div>
                <Button type="submit" size="sm" variant="accent">
                  Cotar
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coletas — Biogreen busca no fornecedor (FOB)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {coletasFob.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma coleta aguardando cotação.</p>}
          {coletasFob.map((nf) => (
            <div key={nf.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    NF {nf.numero} — {nf.fornecedor.razaoSocial}
                  </p>
                  <p className="text-xs text-muted-foreground">{nf.dataEmissao ? formatDate(nf.dataEmissao) : "—"}</p>
                </div>
                <Badge variant="outline">FOB</Badge>
              </div>
              <form action={cotarFrete} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:items-end">
                <input type="hidden" name="notaFiscalEntradaId" value={nf.id} />
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Transportadora</Label>
                  <Input name="transportadora" required />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                  <Input name="valorFrete" type="number" step="0.01" min="0" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Data prevista</Label>
                  <Input name="dataFrete" type="date" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">Obs.</Label>
                  <Input name="observacoes" />
                </div>
                <Button type="submit" size="sm" variant="accent">
                  Cotar
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Em andamento</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {emAndamento.length === 0 && <p className="text-sm text-muted-foreground">Nenhum frete cotado aguardando conclusão.</p>}
          {emAndamento.map((f) => {
            const destino = f.pedidoVenda ? `${f.pedidoVenda.numero} — ${f.pedidoVenda.cliente.razaoSocial}` : f.notaFiscalEntrada ? `NF ${f.notaFiscalEntrada.numero} — ${f.notaFiscalEntrada.fornecedor.razaoSocial}` : "—";
            return (
              <div key={f.id} className="rounded-md border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {f.tipo === "ENTREGA" ? "Entrega" : "Coleta"} · {destino}
                  </p>
                  <Badge variant={f.status === "EM_TRANSITO" ? "accent" : "secondary"}>{STATUS_FRETE_LABEL[f.status] ?? f.status}</Badge>
                </div>
                <form action={atualizarFrete} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6 sm:items-end">
                  <input type="hidden" name="freteId" value={f.id} />
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Transportadora</Label>
                    <Input name="transportadora" defaultValue={f.transportadora ?? ""} required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                    <Input name="valorFrete" type="number" step="0.01" min="0" defaultValue={f.valorFrete ? Number(f.valorFrete) : undefined} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <Input name="dataFrete" type="date" defaultValue={f.dataFrete ? new Date(f.dataFrete).toISOString().slice(0, 10) : undefined} />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Obs.</Label>
                    <Input name="observacoes" defaultValue={f.observacoes ?? ""} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <select name="status" defaultValue={f.status} className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
                      <option value="COTADO">Cotado</option>
                      <option value="EM_TRANSITO">Em trânsito</option>
                      <option value="ENTREGUE">Entregue</option>
                    </select>
                  </div>
                  <div className="sm:col-span-6">
                    <Button type="submit" size="sm" variant="outline">
                      Salvar
                    </Button>
                  </div>
                </form>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

async function ExpedicaoTab() {
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
                <Badge variant={STATUS_EXPEDICAO_BADGE[e.status] ?? "outline"}>{STATUS_EXPEDICAO_LABEL[e.status] ?? e.status}</Badge>
              </CardHeader>
              <CardContent>
                <form action={atualizarExpedicao} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                  <input type="hidden" name="expedicaoId" value={e.id} />
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`status-${e.id}`}>Status</Label>
                    <select
                      id={`status-${e.id}`}
                      name="status"
                      defaultValue={e.status}
                      className="flex h-10 w-40 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="SEPARACAO">Separação</option>
                      <option value="CONFERIDO">Conferido</option>
                      <option value="EXPEDIDO">Expedido</option>
                      <option value="ENTREGUE">Entregue</option>
                    </select>
                  </div>
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

async function HistoricoFreteTab() {
  const fretes = await prisma.frete.findMany({ orderBy: { dataFrete: "desc" }, take: 80 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de fretes</CardTitle>
        <p className="text-xs text-muted-foreground">
          Últimos 80 lançamentos — inclui o controle importado e o que for cotado por aqui. Use como referência de valor por rota/transportadora.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Tipo</th>
                <th className="px-3 py-2 text-left font-medium">Local</th>
                <th className="px-3 py-2 text-left font-medium">Transportadora</th>
                <th className="px-3 py-2 text-left font-medium">Qtd. (kg)</th>
                <th className="px-3 py-2 text-left font-medium">Valor</th>
                <th className="px-3 py-2 text-left font-medium">Data</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fretes.map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <Badge variant={f.tipo === "ENTREGA" ? "default" : f.tipo === "COLETA" ? "outline" : "secondary"}>{f.tipo}</Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{f.local ?? "—"}</td>
                  <td className="px-3 py-2">{f.transportadora ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{f.quantidadeKg ? formatNumber(f.quantidadeKg, 0) : "—"}</td>
                  <td className="px-3 py-2">{f.valorFrete ? formatCurrencyBRL(Number(f.valorFrete)) : "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{f.dataFrete ? formatDate(f.dataFrete) : "—"}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{STATUS_FRETE_LABEL[f.status] ?? f.status}</td>
                </tr>
              ))}
              {fretes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum frete registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function LogisticaPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  await requireModuleAccess("logistica.expedicao");
  const { aba: abaParam } = await searchParams;
  const aba = ABAS.some((a) => a.key === abaParam) ? abaParam! : "cotar";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Logística / Expedição</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fretes a cotar aparecem assim que o Comercial aprova (saída CIF) ou o Compras lança a compra (coleta FOB) — sem
          esperar o grupo do WhatsApp.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {ABAS.map((a) => (
          <Link
            key={a.key}
            href={`/logistica?aba=${a.key}`}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              aba === a.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {a.label}
          </Link>
        ))}
      </div>

      {aba === "cotar" && <FretesACotarTab />}
      {aba === "expedicao" && <ExpedicaoTab />}
      {aba === "historico" && <HistoricoFreteTab />}
    </div>
  );
}
