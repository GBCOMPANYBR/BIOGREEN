import { LeafBranch, MoleculeChain, WaterRipple } from "./illustrations";
import { Reveal } from "./reveal";

const SEGMENTOS = [
  {
    n: "01",
    nome: "Papel e Cartão",
    resumo: "Química de processo para ganho de resistência, retenção e drenagem.",
    solucoes: "Resistência a seco · Retenção e drenagem · Coagulantes · Resinas PAE/PAAE · Biocidas e enzimas · Antiespumantes · Dióxido de titânio",
    Ilustracao: LeafBranch,
  },
  {
    n: "02",
    nome: "Celulose",
    resumo: "Soluções para aumento de produção e controle de depósitos na linha.",
    solucoes: "Aumento de produção · Redução de álcali · Controle de depósitos · Dispersantes · Antiespumantes · Redução de extrativos",
    Ilustracao: MoleculeChain,
  },
  {
    n: "03",
    nome: "Tratamento de Água",
    resumo: "Coagulação, floculação e controle biológico para água de processo e efluente.",
    solucoes: "Coagulantes orgânicos e minerais · Polímeros · Sequestrantes · Antiespumantes · Remoção de bactérias filamentosas",
    Ilustracao: WaterRipple,
  },
];

export function Segmentos() {
  return (
    <section id="produtos" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-baseline gap-4">
          <span className="font-[family-name:var(--font-mono)] text-sm" style={{ color: "#4B6A45" }}>03</span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">Onde atuamos</h2>
        </div>

        <div className="mt-8 divide-y" style={{ borderColor: "rgba(34,29,20,0.15)" }}>
          {SEGMENTOS.map((s, i) => (
            <Reveal key={s.nome} className="py-14">
              <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
                <div className={`shrink-0 ${i % 2 === 1 ? "lg:order-2" : "lg:order-1"}`} style={{ color: "#4B6A45" }}>
                  <s.Ilustracao className="h-40 w-44 sm:h-48 sm:w-52" />
                </div>

                <div className={i % 2 === 1 ? "lg:order-1" : "lg:order-2"}>
                  <span className="font-[family-name:var(--font-mono)] text-xs opacity-50">{s.n}</span>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl sm:text-3xl">{s.nome}</h3>
                  <p className="mt-3 max-w-lg font-[family-name:var(--font-serif)] text-base leading-relaxed" style={{ color: "#3A3323" }}>
                    {s.resumo}
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-70">{s.solucoes}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
