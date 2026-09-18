import { Reveal } from "./reveal";

const NOTAS = [
  {
    n: "i",
    titulo: "Assistência técnica de verdade",
    texto: "Acompanhamento em campo, do teste industrial ao ajuste fino em operação contínua.",
  },
  {
    n: "ii",
    titulo: "Sustentabilidade na prática",
    texto: "Compromissos alinhados à Agenda ONU 2030 e conformidade legal ambiental em cada etapa.",
  },
  {
    n: "iii",
    titulo: "Ética e transparência",
    texto: "Código de conduta claro para fornecedores, integridade e respeito aos direitos humanos.",
  },
  {
    n: "iv",
    titulo: "Saúde e segurança em primeiro lugar",
    texto: "Ambientes seguros e uma equipe valorizada — a base de tudo o que entregamos.",
  },
];

export function Diferenciais() {
  return (
    <section id="diferenciais" className="px-6 py-24" style={{ backgroundColor: "#EFE8D8" }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex items-baseline gap-4">
          <span className="font-[family-name:var(--font-mono)] text-sm" style={{ color: "#4B6A45" }}>04</span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">Notas de campo</h2>
        </div>

        <Reveal className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {NOTAS.map((nota) => (
            <div key={nota.n} className="flex gap-5">
              <span className="font-[family-name:var(--font-display)] shrink-0 text-2xl italic opacity-40">{nota.n}.</span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg">{nota.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#3A3323" }}>
                  {nota.texto}
                </p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
