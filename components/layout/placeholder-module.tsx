import { CheckCircle2, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PlaceholderModule({
  titulo,
  descricao,
  fase,
  icon: Icon,
  funcionalidades,
}: {
  titulo: string;
  descricao: string;
  fase: 1 | 2 | 3 | 4;
  icon: LucideIcon;
  funcionalidades: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        <Badge variant="secondary">Entra na Fase {fase}</Badge>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/40 p-6 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-6 sm:grid-cols-2">
          {funcionalidades.map((f) => (
            <div key={f} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
          O banco de dados deste módulo já está modelado por completo em{" "}
          <code className="rounded bg-muted px-1 py-0.5">prisma/schema.prisma</code> — falta só a tela.
        </div>
      </div>
    </div>
  );
}
