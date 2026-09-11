import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PlaceholderModule({
  titulo,
  descricao,
  fase,
}: {
  titulo: string;
  descricao: string;
  fase: 0 | 1 | 2 | 3 | 4;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{titulo}</h1>
        <Badge variant="secondary">Fase {fase}</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Módulo em construção</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>{descricao}</p>
          <p>
            O banco de dados para este módulo já está modelado por completo (ver{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">prisma/schema.prisma</code>); a interface entra
            na Fase {fase}, conforme <code className="rounded bg-muted px-1 py-0.5 text-xs">docs/PLANO.md</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
