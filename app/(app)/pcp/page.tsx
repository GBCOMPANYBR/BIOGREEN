import { requireModuleAccess } from "@/lib/nav-visibility";
import { prisma } from "@/lib/prisma";
import { aprovarPCP } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";

export default async function PcpPage() {
  await requireModuleAccess("producao.formulas");

  const ordens = await prisma.ordemProducao.findMany({
    where: { status: "PLANEJADA" },
    orderBy: { createdAt: "asc" },
    include: {
      pedidoVenda: { include: { cliente: true } },
      formula: { include: { produto: true, itens: { include: { materiaPrima: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">PCP — Planejamento e Controle de Produção</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toda ordem aprovada pelo Comercial passa por aqui antes de chegar no chão de fábrica. A fórmula que sai
          daqui — original ou ajustada — é a que o Anderson vai executar, e é só nesse momento que a matéria-prima é
          baixada do estoque.
        </p>
      </div>

      {ordens.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma ordem aguardando o PCP no momento.
          </CardContent>
        </Card>
      )}

      {ordens.map((op) => {
        const rendimento = Number(op.formula.rendimento ?? 0);
        const fator = rendimento > 0 ? Number(op.quantidadePlanejada) / rendimento : 1;
        return (
          <Card key={op.id}>
            <CardHeader className="flex-row items-center justify-between gap-4 sm:flex">
              <div>
                <CardTitle className="text-base text-foreground">
                  {op.numero} — {op.formula.produto.nomeComercial}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pedido {op.pedidoVenda?.numero} · {op.pedidoVenda?.cliente.razaoSocial} ·{" "}
                  {formatNumber(op.quantidadePlanejada, 0)} kg planejados
                </p>
              </div>
              <Badge variant="secondary">Aguardando PCP</Badge>
            </CardHeader>
            <CardContent>
              {op.formula.itens.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este produto ainda não tem fórmula com matéria-prima cadastrada — pode liberar direto.
                </p>
              ) : (
                <form action={aprovarPCP} className="flex flex-col gap-4">
                  <input type="hidden" name="opId" value={op.id} />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Fórmula (rendimento base: {formatNumber(rendimento, 0)} kg — ajuste se precisar)
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {op.formula.itens.map((item) => (
                      <div key={item.id} className="flex flex-col gap-1.5">
                        <label className="text-sm">
                          {item.materiaPrima.nome}{" "}
                          <span className="text-xs text-muted-foreground">
                            (calculado: {formatNumber(Number(item.quantidade) * fator, 1)} kg)
                          </span>
                        </label>
                        <Input
                          type="number"
                          step="0.001"
                          name={`qtd_${item.id}`}
                          defaultValue={Number(item.quantidade)}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <Button type="submit" variant="accent">
                      Aprovar fórmula e liberar produção
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
