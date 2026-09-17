"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Copy, KeyRound } from "lucide-react";
import { criarUsuario } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CargoOption {
  id: number;
  nome: string;
  setorNome: string;
}

export function CriarUsuarioForm({ cargos }: { cargos: CargoOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [gerado, setGerado] = useState<{ usuarioNome: string; senhaGerada: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const setorNomes = [...new Set(cargos.map((c) => c.setorNome))];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const resultado = await criarUsuario(formData);
        setGerado(resultado);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível cadastrar o usuário.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" name="nome" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">Usuário (login)</Label>
          <Input id="username" name="username" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cargoId">Cargo</Label>
          <select id="cargoId" name="cargoId" className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm">
            <option value="">Sem cargo</option>
            {setorNomes.map((setorNome) => (
              <optgroup key={setorNome} label={setorNome}>
                {cargos
                  .filter((c) => c.setorNome === setorNome)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex items-end lg:col-span-5">
          <Button type="submit" disabled={pending}>
            {pending ? "Cadastrando..." : "Cadastrar usuário"}
          </Button>
        </div>
      </form>

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      {gerado && (
        <div className="flex flex-col gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <KeyRound className="h-4 w-4 text-accent" />
            Senha gerada para {gerado.usuarioNome}
          </div>
          <p className="text-muted-foreground">
            Anote e repasse pra pessoa agora — essa senha não fica salva em nenhum lugar visível depois que você sair
            desta tela. No primeiro login, o sistema vai pedir pra trocar.
          </p>
          <div className="flex items-center gap-2">
            <code className="rounded-md border border-input bg-background px-3 py-1.5 font-mono text-base tracking-wider">
              {gerado.senhaGerada}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard?.writeText(gerado.senhaGerada)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </Button>
            <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={() => setGerado(null)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
