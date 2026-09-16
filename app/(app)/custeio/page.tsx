import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrencyBRL, formatNumber, formatDate } from "@/lib/format";

export default async function CusteioPage() {
  await requireModuleAccess("producao.custeio");

  const custos = await prisma.custoLote.findMany({
    orderBy: { id: "desc" },
    include: { lote: { include: { produto: true } } },
  });

  const porProduto = new Map<string, { totalCusto: number; totalKg: number }>();
  for (const c of custos) {
    const nome = c.lote.produto.nomeComercial;
    const atual = porProduto.get(nome) ?? { totalCusto: 0, totalKg: 0 };
    atual.totalCusto += Number(c.custoTotal);
    atual.totalKg += Number(c.lote.quantidade);
    porProduto.set(nome, atual);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Centro de Custo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Calculado automaticamente a cada lote concluído — matéria-prima pelo custo médio cadastrado, mão de obra
          pelo tempo da fórmula, embalagem e energia rateadas por kg. As taxas de mão de obra/embalagem/energia são
          estimativas até a Biogreen confirmar os valores reais (ver docs/PERGUNTAS.md).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custo médio por kg, por produto</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Produzido</TableHead>
                <TableHead>Custo total</TableHead>
                <TableHead>Custo médio / kg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...porProduto.entries()].map(([nome, v]) => (
                <TableRow key={nome}>
                  <TableCell className="font-medium">{nome}</TableCell>
                  <TableCell>{formatNumber(v.totalKg, 0)} kg</TableCell>
                  <TableCell>{formatCurrencyBRL(v.totalCusto)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrencyBRL(v.totalKg > 0 ? v.totalCusto / v.totalKg : 0)}
                  </TableCell>
                </TableRow>
              ))}
              {porProduto.size === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum lote concluído ainda — o custo nasce sozinho quando a Produção conclui uma ordem.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhe por lote</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Matéria-prima</TableHead>
                <TableHead>Mão de obra</TableHead>
                <TableHead>Embalagem</TableHead>
                <TableHead>Energia</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fabricado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {custos.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.lote.numeroLote}</TableCell>
                  <TableCell className="font-medium">{c.lote.produto.nomeComercial}</TableCell>
                  <TableCell>{formatCurrencyBRL(Number(c.custoMateriaPrima))}</TableCell>
                  <TableCell>{formatCurrencyBRL(Number(c.custoMaoObra))}</TableCell>
                  <TableCell>{formatCurrencyBRL(Number(c.custoEmbalagem))}</TableCell>
                  <TableCell>{formatCurrencyBRL(Number(c.custoEnergiaRateada))}</TableCell>
                  <TableCell className="font-medium">{formatCurrencyBRL(Number(c.custoTotal))}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.lote.dataFabricacao ? formatDate(c.lote.dataFabricacao) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {custos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum custo calculado ainda.
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
