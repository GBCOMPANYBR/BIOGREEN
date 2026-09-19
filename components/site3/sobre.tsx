const LIME = "#C8F94A";

const CLAUSULAS = [
  "Ambientes seguros e uma equipe valorizada.",
  "Crescimento conduzido de forma ética e eco-compatível.",
  "Minimização contínua do impacto ambiental.",
  "Soluções inovadoras que preservam o meio ambiente.",
  "Experiência compartilhada com fornecedores e clientes.",
  "Mudanças positivas nas comunidades onde atuamos.",
  "Ser, de fato, uma empresa sustentável.",
];

export function Sobre() {
  return (
    <section id="sobre" className="border-t px-6 py-24" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
          <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase tracking-tight">Sobre / 01</h2>
          <span className="hidden font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40 sm:block">
            Identificação da empresa
          </span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40">
              Especificação — missão
            </p>
            <ol className="mt-4 divide-y" style={{ borderColor: "rgba(233,235,228,0.1)" }}>
              {CLAUSULAS.map((c, i) => (
                <li key={c} className="flex gap-4 py-3 text-sm leading-relaxed text-[#E9EBE4]/80" style={{ borderColor: "rgba(233,235,228,0.1)" }}>
                  <span className="font-[family-name:var(--font-mono)] shrink-0 text-[#E9EBE4]/40">
                    §{String(i + 1).padStart(2, "0")}
                  </span>
                  {c}
                </li>
              ))}
            </ol>
          </div>

          <div className="border p-6" style={{ borderColor: LIME }}>
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest" style={{ color: LIME }}>
              Declaração de visão
            </p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-2xl uppercase leading-tight tracking-tight sm:text-3xl">
              Referência na comercialização de produtos químicos com especificações exclusivas.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#E9EBE4]/70">
              Atendimento especializado e assistência técnica real — do primeiro contato à planta em
              operação. Grupo 100% familiar e independente: gerenciamos diretamente os problemas
              operacionais locais.
            </p>
            <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-[#E9EBE4]/50" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
              Conformidade: Agenda ONU 2030 · legislação ambiental vigente · código de conduta para
              fornecedores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
