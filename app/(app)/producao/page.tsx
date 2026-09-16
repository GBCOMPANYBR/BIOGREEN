import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { concluirProducao } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  PLANEJADA: "Planejada",
  EM_PRODUCAO: "Em produção",
  CONTROLE_QUALIDADE: "Controle de qualidade",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  CONCLUIDA: "Concluída",
};

export default async function ProducaoPage() {
  await requireModuleAccess("producao.ordens");

  const ordens = await prisma.ordemProducao.findMany({
    where: { status: { in: ["EM_PRODUCAO", "CONTROLE_QUALIDADE", "APROVADA", "REPROVADA", "CONCLUIDA"] } },
    orderBy: { createdAt: "desc" },
    include: {
      formula: { include: { produto: true, itens: { include: { materiaPrima: true } } } },
      lotes: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Produção — Ordens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O PCP já liberou essas ordens com a fórmula final travada, e já baixou a matéria-prima — o Anderson só confirma quando o lote sai pronto.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade planejada</TableHead>
                <TableHead>Matérias-primas consumidas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lote gerado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordens.map((op) => {
                const rendimento = Number(op.formula.rendimento ?? 0);
                const fator = rendimento > 0 ? Number(op.quantidadePlanejada) / rendimento : 1;
                return (
                  <TableRow key={op.id}>
                    <TableCell className="font-mono text-xs">{op.numero}</TableCell>
                    <TableCell className="font-medium">{op.formula.produto.nomeComercial}</TableCell>
                    <TableCell>{formatNumber(op.quantidadePlanejada, 0)} kg</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {op.formula.itens.length === 0
                        ? "—"
                        : op.formula.itens
                            .map((i) => `${i.materiaPrima.nome}: ${formatNumber(Number(i.quantidade) * fator, 1)} kg`)
                            .join(" · ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={op.status === "CONCLUIDA" ? "default" : "accent"}>{STATUS_LABEL[op.status]}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{op.lotes[0]?.numeroLote ?? "—"}</TableCell>
                    <TableCell>
                      {op.status !== "CONCLUIDA" && (
                        <form action={concluirProducao.bind(null, op.id)}>
                          <Button type="submit" size="sm">
                            Concluir produção
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {ordens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma ordem de produção ainda — aprove um pedido em Comercial pra gerar a primeira.
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
