"use client";

import { useState, useTransition } from "react";
import { Copy, KeyRound } from "lucide-react";
import { redefinirSenhaUsuario } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function RedefinirSenhaButton({ usuarioId, usuarioNome }: { usuarioId: number; usuarioNome: string }) {
  const [gerado, setGerado] = useState<{ usuarioNome: string; senhaGerada: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Gerar uma senha nova pra ${usuarioNome}? A senha atual dela deixa de funcionar.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        const resultado = await redefinirSenhaUsuario(usuarioId);
        setGerado(resultado);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
      }
    });
  }

  if (gerado) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <KeyRound className="h-3.5 w-3.5 text-accent" />
          Nova senha de {gerado.usuarioNome}
        </div>
        <div className="flex items-center gap-2">
          <code className="rounded border border-input bg-background px-2 py-1 font-mono tracking-wider">{gerado.senhaGerada}</code>
          <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(gerado.senhaGerada)}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={() => setGerado(null)}>
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={handleClick}>
        {pending ? "Gerando..." : "Redefinir senha"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
