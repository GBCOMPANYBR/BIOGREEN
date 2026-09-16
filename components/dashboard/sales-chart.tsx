"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDarkMode } from "@/lib/use-dark-mode";
import { CHART_COLORS } from "@/lib/chart-colors";
import { formatCurrencyBRL } from "@/lib/format";
import type { PontoVendas } from "@/lib/financeiro";

export function SalesChart({ dados }: { dados: PontoVendas[] }) {
  const isDark = useDarkMode();
  const cor = isDark ? CHART_COLORS.dark.in : CHART_COLORS.light.in;

  const formatado = dados.map((p) => {
    const [ano, mes] = p.label.split("-");
    return { ...p, rotulo: new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }) };
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-muted-foreground">Vendas faturadas por mês</p>
      {formatado.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma nota fiscal emitida ainda.</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={formatado} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
            <Bar dataKey="valor" name="Vendas" fill={cor} radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
