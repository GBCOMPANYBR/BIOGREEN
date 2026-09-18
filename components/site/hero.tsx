import { ArrowRight, Factory, Droplets, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white pt-32 pb-24">
      <div
        aria-hidden
        className="absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-primary/25 to-emerald-200/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-40 top-40 h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-accent/20 to-cyan-200/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Especialidades químicas desde a origem
          </span>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
            Química de performance para{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Papel, Celulose e Tratamento de Água
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Um parceiro local, internacional, independente e competente à sua disposição —
            soluções técnicas sob medida e assistência de verdade, do laboratório à planta.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" variant="accent" className="gap-2">
              <a href="#contato">
                Fale com um especialista <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#produtos">Ver segmentos de atuação</a>
            </Button>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-slate-900/10 pt-8">
            <div>
              <dt className="sr-only">Grupo</dt>
              <dd className="font-heading text-2xl font-bold text-slate-900">100%</dd>
              <p className="text-sm text-slate-500">Grupo familiar e independente</p>
            </div>
            <div>
              <dt className="sr-only">Segmentos</dt>
              <dd className="font-heading text-2xl font-bold text-slate-900">3</dd>
              <p className="text-sm text-slate-500">Segmentos de especialização</p>
            </div>
            <div>
              <dt className="sr-only">Atendimento</dt>
              <dd className="font-heading text-2xl font-bold text-slate-900">24h</dd>
              <p className="text-sm text-slate-500">Prazo de resposta ao contato</p>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary via-emerald-500 to-accent opacity-95" />
          <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
          <div className="absolute inset-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
              <Factory className="h-8 w-8 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Papel e Cartão</p>
                <p className="text-xs text-slate-500">Resistência, retenção e drenagem</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
              <Recycle className="h-7 w-7 text-primary" />
              <p className="text-sm font-semibold text-slate-900">Celulose</p>
              <p className="text-xs text-slate-500">Produção e controle de depósitos</p>
            </div>
            <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
              <Droplets className="h-7 w-7 text-accent" />
              <p className="text-sm font-semibold text-slate-900">Tratamento de Água</p>
              <p className="text-xs text-slate-500">Coagulantes e polímeros</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
