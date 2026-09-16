"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDarkMode } from "@/lib/use-dark-mode";
import { CHART_COLORS } from "@/lib/chart-colors";
import { formatCurrencyBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PontoFluxo } from "@/lib/financeiro";

function formatLabel(label: string, porMes: boolean): string {
  const [ano, mes, dia] = label.split("-");
  if (porMes) return new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  return new Date(Number(ano), Number(mes) - 1, Number(dia)).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function CashFlowChart({ diario, mensal }: { diario: PontoFluxo[]; mensal: PontoFluxo[] }) {
  const [modo, setModo] = useState<"diario" | "mensal">("mensal");
  const isDark = useDarkMode();
  const cores = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const dados = (modo === "diario" ? diario : mensal).map((p) => ({ ...p, rotulo: formatLabel(p.label, modo === "mensal") }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Recebimentos, pagamentos e saldo</p>
        <div className="flex gap-1 rounded-md border border-border p-0.5 text-xs">
          {(["diario", "mensal"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={cn(
                "rounded px-2.5 py-1 font-medium transition-colors",
                modo === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "diario" ? "Diário" : "Mensal"}
            </button>
          ))}
        </div>
      </div>

      {dados.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Sem movimentação registrada ainda.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis dataKey="rotulo" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => new Intl.NumberFormat("pt-BR", { notation: "compact", compactDisplay: "short" }).format(v)}
              width={48}
            />
            <Tooltip
              formatter={(value: number) => formatCurrencyBRL(value)}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => <span className="text-muted-foreground">{value}</span>}
            />
            <Bar dataKey="recebido" name="Recebido" fill={cores.in} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="pago" name="Pago" fill={cores.out} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Line
              dataKey="saldo"
              name="Saldo acumulado"
              stroke={cores.trend}
              strokeWidth={2}
              dot={{ r: 4, fill: cores.trend, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
