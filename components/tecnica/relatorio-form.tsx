"use client";

import { useState } from "react";
import { registrarRelatorioVisita } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { PontoMedicao, LeituraHidrometro } from "@/lib/relatorio-visita";

export function RelatorioForm({
  visitaTecnicaId,
  pontosIniciais,
  hidrometrosIniciais,
  recomendacoesIniciais,
  proximaAcaoInicial,
}: {
  visitaTecnicaId: number;
  pontosIniciais: PontoMedicao[];
  hidrometrosIniciais: LeituraHidrometro[];
  recomendacoesIniciais: string;
  proximaAcaoInicial: string;
}) {
  const [pontos, setPontos] = useState<PontoMedicao[]>(pontosIniciais.length > 0 ? pontosIniciais : [{ local: "" }]);
  const [hidrometros, setHidrometros] = useState<LeituraHidrometro[]>(hidrometrosIniciais);

  return (
    <form action={registrarRelatorioVisita} className="flex flex-col gap-6" encType="multipart/form-data">
      <input type="hidden" name="visitaTecnicaId" value={visitaTecnicaId} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Pontos de medição (cloro / pH / turbidez)</p>
          <Button type="button" size="sm" variant="outline" onClick={() => setPontos((p) => [...p, { local: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Adicionar ponto
          </Button>
        </div>
        {pontos.map((p, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:items-end">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Local</Label>
              <Input name={`ponto_local_${i}`} defaultValue={p.local} placeholder="ex.: ETA, Refeitório" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Cloro residual</Label>
              <Input name={`ponto_cloro_${i}`} type="number" step="0.01" defaultValue={p.cloro} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">pH</Label>
              <Input name={`ponto_ph_${i}`} type="number" step="0.1" defaultValue={p.ph} />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Turbidez</Label>
                <Input name={`ponto_turbidez_${i}`} type="number" step="0.01" defaultValue={p.turbidez} />
              </div>
              {pontos.length > 1 && (
                <Button type="button" size="icon" variant="ghost" onClick={() => setPontos((arr) => arr.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Hidrômetros (opcional)</p>
          <Button type="button" size="sm" variant="outline" onClick={() => setHidrometros((h) => [...h, { local: "", leitura: 0 }])}>
            <Plus className="h-3.5 w-3.5" /> Adicionar hidrômetro
          </Button>
        </div>
        {hidrometros.map((h, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:items-end">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Local</Label>
              <Input name={`hidro_local_${i}`} defaultValue={h.local} placeholder="ex.: Lago, Pier" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Leitura</Label>
                <Input name={`hidro_leitura_${i}`} type="number" step="0.1" defaultValue={h.leitura} />
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => setHidrometros((arr) => arr.filter((_, idx) => idx !== i))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recomendacoes">Recomendações</Label>
          <textarea
            id="recomendacoes"
            name="recomendacoes"
            defaultValue={recomendacoesIniciais}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="proximaAcao">Próxima ação</Label>
          <textarea
            id="proximaAcao"
            name="proximaAcao"
            defaultValue={proximaAcaoInicial}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fotos">Fotos da visita (evidências)</Label>
        <input
          id="fotos"
          name="fotos"
          type="file"
          accept="image/*"
          multiple
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:text-secondary-foreground"
        />
      </div>

      <div>
        <Button type="submit" variant="accent">
          Salvar relatório da visita
        </Button>
      </div>
    </form>
  );
}
