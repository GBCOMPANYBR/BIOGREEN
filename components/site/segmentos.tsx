import { FileStack, Recycle, Droplets, type LucideIcon } from "lucide-react";

type Segmento = {
  icon: LucideIcon;
  nome: string;
  resumo: string;
  solucoes: string[];
  gradiente: string;
};

const SEGMENTOS: Segmento[] = [
  {
    icon: FileStack,
    nome: "Papel e Cartão",
    resumo: "Química de processo para ganho de resistência, retenção e drenagem.",
    solucoes: [
      "Resistência a seco",
      "Controle de retenção e drenagem",
      "Coagulantes",
      "Resinas PAE / PAAE",
      "Biocidas e enzimas",
      "Antiespumantes",
      "Dióxido de titânio",
    ],
    gradiente: "from-primary to-emerald-500",
  },
  {
    icon: Recycle,
    nome: "Celulose",
    resumo: "Soluções para aumento de produção e controle de depósitos na linha.",
    solucoes: [
      "Aumento de produção",
      "Redução de álcali",
      "Controle de depósitos",
      "Dispersantes",
      "Antiespumantes",
      "Redução de extrativos",
    ],
    gradiente: "from-emerald-500 to-accent",
  },
  {
    icon: Droplets,
    nome: "Tratamento de Água",
    resumo: "Coagulação, floculação e controle biológico para água de processo e efluente.",
    solucoes: [
      "Coagulantes orgânicos e minerais",
      "Polímeros",
      "Sequestrantes",
      "Antiespumantes",
      "Remoção de bactérias filamentosas",
    ],
    gradiente: "from-accent to-cyan-500",
  },
];

export function Segmentos() {
  return (
    <section id="produtos" className="relative bg-slate-50/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Onde atuamos</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Três segmentos, um único compromisso com performance
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {SEGMENTOS.map((s) => (
            <div key={s.nome} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.gradiente} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`} />

              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradiente} text-white`}>
                <s.icon className="h-6 w-6" />
              </div>

              <h3 className="mt-6 font-heading text-xl font-bold text-slate-900">{s.nome}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.resumo}</p>

              <ul className="mt-6 space-y-2 border-t border-slate-900/5 pt-6">
                {s.solucoes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${s.gradiente}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
