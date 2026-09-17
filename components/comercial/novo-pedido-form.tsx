"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { criarPedido } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClienteOption {
  id: number;
  razaoSocial: string;
}
interface ProdutoOption {
  id: number;
  nomeComercial: string;
}

export function NovoPedidoForm({ clientes, produtos }: { clientes: ClienteOption[]; produtos: ProdutoOption[] }) {
  const [linhas, setLinhas] = useState<number[]>([0]);
  const proximoIdRef = useRef(1);

  function adicionarLinha() {
    setLinhas((atual) => [...atual, proximoIdRef.current++]);
  }

  function removerLinha(id: number) {
    setLinhas((atual) => (atual.length > 1 ? atual.filter((l) => l !== id) : atual));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>Novo pedido</CardTitle>
        <Button type="button" size="sm" variant="accent" onClick={adicionarLinha}>
          <Plus className="h-3.5 w-3.5" />
          Adicionar produto
        </Button>
      </CardHeader>
      <CardContent>
        <form action={criarPedido} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clienteId">Cliente</Label>
              <select
                id="clienteId"
                name="clienteId"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razaoSocial}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="condicaoPagamento">Condição de pagamento</Label>
              <Input id="condicaoPagamento" name="condicaoPagamento" placeholder="ex.: 30/60 dias" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataPrometida">Data de saída</Label>
              <Input id="dataPrometida" name="dataPrometida" type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="freteTipo">Frete</Label>
              <select
                id="freteTipo"
                name="freteTipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="">—</option>
                <option value="CIF">CIF — Biogreen entrega</option>
                <option value="FOB">FOB — cliente retira</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {linhas.map((linhaId, idx) => (
              <div key={linhaId} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
                <div className="flex flex-col gap-1.5">
                  <Label className={idx > 0 ? "sm:hidden lg:block" : undefined}>Produto</Label>
                  <select
                    name="produtoId"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nomeComercial}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={idx > 0 ? "sm:hidden lg:block" : undefined}>Quantidade (kg)</Label>
                  <Input name="quantidade" type="number" step="0.001" min="0.001" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={idx > 0 ? "sm:hidden lg:block" : undefined}>Preço unitário (R$)</Label>
                  <Input name="precoUnitario" type="number" step="0.01" min="0.01" required />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removerLinha(linhaId)}
                  disabled={linhas.length === 1}
                  className="text-muted-foreground hover:text-destructive disabled:invisible"
                  aria-label="Remover produto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="self-start">
            Registrar pedido
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
