"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DESTAQUES = [
  "Comercial, Produção, Qualidade, Estoque e Financeiro num só lugar",
  "Rastreabilidade completa de lote — da matéria-prima à nota fiscal",
  "Um chat que responde perguntas sobre os dados da sua empresa",
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Painel de marca — some em telas estreitas */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,hsl(152_45%_18%),hsl(198_55%_16%))] p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, white 0, transparent 35%), radial-gradient(circle at 85% 75%, white 0, transparent 40%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <Image
            src="/logo-biogreen.png"
            alt="Biogreen"
            width={140}
            height={68}
            priority
            className="h-auto w-full max-w-[140px]"
          />
        </div>

        <div className="relative flex flex-col gap-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-white/60">BIOGREEN SYSTEM</p>
            <h1 className="mt-2 max-w-md text-3xl font-semibold leading-tight">
              O segundo cérebro da Biogreen — tudo o que a empresa faz, num só lugar.
            </h1>
          </div>

          <ul className="flex flex-col gap-3">
            {DESTAQUES.map((d) => (
              <li key={d} className="flex items-start gap-3 text-sm text-white/85">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Biogreen Indústria Química Ltda · Suzano/SP
          <br />
          desenvolvido por GB Company
        </p>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-1 lg:hidden">
            <Image src="/logo-biogreen.png" alt="Biogreen" width={130} height={63} priority className="mb-3 h-auto w-full max-w-[130px]" />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold">Entrar</h2>
            <p className="mt-1 text-sm text-muted-foreground">Acesse com seu usuário e senha da Biogreen.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={mostrarSenha ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="mt-1 h-11">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-muted-foreground lg:hidden">desenvolvido por GB Company</p>
        </div>
      </div>
    </div>
  );
}
