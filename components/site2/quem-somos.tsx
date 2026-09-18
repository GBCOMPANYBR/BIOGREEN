import { Reveal } from "./reveal";

const MISSAO = [
  "Ambientes seguros e uma equipe valorizada.",
  "Crescimento conduzido de forma ética e eco-compatível.",
  "Minimização contínua do impacto ambiental.",
  "Soluções inovadoras que preservam o meio ambiente.",
  "Experiência compartilhada com fornecedores e clientes.",
  "Mudanças positivas nas comunidades onde atuamos.",
  "Ser, de fato, uma empresa sustentável.",
];

export function QuemSomos() {
  return (
    <section id="quem-somos" className="px-6 py-24" style={{ backgroundColor: "#EFE8D8" }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex items-baseline gap-4">
          <span className="font-[family-name:var(--font-mono)] text-sm" style={{ color: "#4B6A45" }}>02</span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">Quem somos</h2>
        </div>

        <Reveal className="mt-10 grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <blockquote
            className="font-[family-name:var(--font-display)] text-2xl italic leading-snug sm:text-3xl"
            style={{ color: "#2E2A1E" }}
          >
            “Por sermos independentes, gerenciamos diretamente os problemas operacionais locais — com a
            estrutura de um grupo internacional e a agilidade de quem está perto do cliente todos os dias.”
            <footer className="mt-6 font-[family-name:var(--font-mono)] text-xs not-italic uppercase tracking-wide opacity-60">
              — Visão Biogreen
            </footer>
          </blockquote>

          <div>
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] opacity-60">Missão</p>
            <ol className="mt-4 space-y-3">
              {MISSAO.map((item, i) => (
                <li key={item} className="flex gap-4 border-b pb-3 text-sm leading-relaxed" style={{ borderColor: "rgba(34,29,20,0.12)" }}>
                  <span className="font-[family-name:var(--font-mono)] shrink-0 opacity-50">{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ color: "#3A3323" }}>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <p className="mt-14 max-w-2xl border-l-2 pl-6 text-sm leading-relaxed" style={{ borderColor: "#4B6A45", color: "#3A3323" }}>
          Sustentabilidade alinhada à <strong>Agenda ONU 2030</strong>, conformidade legal ambiental e um
          código de conduta claro para fornecedores e parceiros.
        </p>
      </div>
    </section>
  );
}
