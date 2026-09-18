import { LeafBranch } from "./illustrations";
import { Reveal } from "./reveal";

export function Abertura() {
  return (
    <section id="abertura" className="relative overflow-hidden px-6 pb-20 pt-14">
      <div className="mx-auto max-w-5xl">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em]" style={{ color: "#4B6A45" }}>
          Caderno de especialidades · Suzano, SP · Edição 2026
        </p>

        <Reveal className="mt-8 grid gap-10 lg:grid-cols-[1fr_auto]">
          <h1 className="font-[family-name:var(--font-display)] text-[2.6rem] leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.2rem]">
            Química de performance,
            <br />
            escrita com a
            <br />
            <span className="italic" style={{ color: "#4B6A45" }}>paciência de quem observa</span> a
            <br />
            planta funcionar.
          </h1>

          <div className="hidden shrink-0 self-end lg:block" style={{ color: "#4B6A45" }}>
            <LeafBranch className="h-64 w-56" />
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 border-t pt-10 sm:grid-cols-[2fr_1fr]" style={{ borderColor: "rgba(34,29,20,0.15)" }}>
          <p className="max-w-xl font-[family-name:var(--font-serif)] text-lg leading-relaxed" style={{ color: "#3A3323" }}>
            Um parceiro local, internacional, independente e competente à sua disposição — soluções
            técnicas sob medida para Papel e Cartão, Celulose e Tratamento de Água, com assistência de
            verdade do laboratório à planta.
          </p>

          <dl className="space-y-4">
            <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: "rgba(34,29,20,0.15)" }}>
              <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide opacity-60">Grupo</dt>
              <dd className="font-[family-name:var(--font-display)] text-xl">100% familiar</dd>
            </div>
            <div className="flex items-baseline justify-between border-b pb-2" style={{ borderColor: "rgba(34,29,20,0.15)" }}>
              <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide opacity-60">Segmentos</dt>
              <dd className="font-[family-name:var(--font-display)] text-xl">03 especialidades</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide opacity-60">Resposta</dt>
              <dd className="font-[family-name:var(--font-display)] text-xl">em até 24h</dd>
            </div>
          </dl>
        </div>

        <a
          href="#contato"
          className="mt-14 inline-flex items-baseline gap-2 font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.2em]"
          style={{ color: "#221D14" }}
        >
          Falar com um especialista
          <span aria-hidden style={{ color: "#4B6A45" }}>→</span>
        </a>
      </div>
    </section>
  );
}
