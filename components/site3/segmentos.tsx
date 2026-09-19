import { SchematicStack, SchematicMolecule, SchematicDroplet } from "./schematics";

const LIME = "#C8F94A";

const SEGMENTOS = [
  {
    codigo: "SEG-01",
    nome: "Papel e Cartão",
    resumo: "Química de processo para ganho de resistência, retenção e drenagem.",
    solucoes: ["Resistência a seco", "Retenção e drenagem", "Coagulantes", "Resinas PAE/PAAE", "Biocidas e enzimas", "Antiespumantes", "Dióxido de titânio"],
    Diagrama: SchematicStack,
  },
  {
    codigo: "SEG-02",
    nome: "Celulose",
    resumo: "Soluções para aumento de produção e controle de depósitos na linha.",
    solucoes: ["Aumento de produção", "Redução de álcali", "Controle de depósitos", "Dispersantes", "Antiespumantes", "Redução de extrativos"],
    Diagrama: SchematicMolecule,
  },
  {
    codigo: "SEG-03",
    nome: "Tratamento de Água",
    resumo: "Coagulação, floculação e controle biológico para água de processo e efluente.",
    solucoes: ["Coagulantes orgânicos e minerais", "Polímeros", "Sequestrantes", "Antiespumantes", "Remoção de bactérias filamentosas"],
    Diagrama: SchematicDroplet,
  },
];

export function Segmentos() {
  return (
    <section id="produtos" className="border-t px-6 py-24" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
          <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase tracking-tight">Produtos / 02</h2>
          <span className="hidden font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40 sm:block">
            Segmentos de atuação
          </span>
        </div>

        <div className="mt-6 divide-y" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
          {SEGMENTOS.map((s) => (
            <div key={s.codigo} className="grid gap-8 py-10 lg:grid-cols-[140px_1fr_1.2fr] lg:items-center">
              <div className="text-[#E9EBE4]/60">
                <s.Diagrama className="h-24 w-32" />
              </div>

              <div>
                <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest" style={{ color: LIME }}>
                  {s.codigo}
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl uppercase tracking-tight sm:text-3xl">
                  {s.nome}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#E9EBE4]/70">{s.resumo}</p>
              </div>

              <table className="w-full border-collapse text-xs">
                <tbody>
                  {s.solucoes.map((item, i) => (
                    <tr key={item} className="border-t" style={{ borderColor: "rgba(233,235,228,0.1)" }}>
                      <td className="w-10 py-1.5 font-[family-name:var(--font-mono)] text-[#E9EBE4]/40">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="py-1.5 text-[#E9EBE4]/80">{item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
