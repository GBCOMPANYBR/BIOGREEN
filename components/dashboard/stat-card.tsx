import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "good" | "warn";
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            tone === "good" && "bg-primary/10 text-primary",
            tone === "warn" && "bg-destructive/10 text-destructive",
            tone === "neutral" && "bg-accent/10 text-accent"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
