import { CornerFrame, ProcessFlow } from "./schematics";

const LIME = "#C8F94A";
const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(233,235,228,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(233,235,228,0.06) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
};

export function Capa() {
  return (
    <section id="topo" className="relative px-6 pb-20 pt-32" style={GRID_BG}>
      <div className="mx-auto max-w-6xl">
        <div className="relative border p-6 sm:p-10" style={{ borderColor: "rgba(233,235,228,0.2)" }}>
          <CornerFrame className="pointer-events-none absolute -left-px -top-px h-6 w-6 text-[#C8F94A]" />
          <CornerFrame className="pointer-events-none absolute -right-px -top-px h-6 w-6 rotate-90 text-[#C8F94A]" />
          <CornerFrame className="pointer-events-none absolute -bottom-px -left-px h-6 w-6 -rotate-90 text-[#C8F94A]" />
          <CornerFrame className="pointer-events-none absolute -bottom-px -right-px h-6 w-6 rotate-180 text-[#C8F94A]" />

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/50 sm:grid-cols-4">
            <span>Doc. Nº BG-2026-03</span>
            <span>Rev. 00</span>
            <span>Classificação: uso geral</span>
            <span>Emissão: 2026</span>
          </div>

          <h1
            className="mt-8 font-[family-name:var(--font-display)] uppercase leading-[0.86] tracking-tight"
            style={{ fontSize: "clamp(3rem, 10vw, 8rem)", fontWeight: 700 }}
          >
            Química de
            <br />
            <span style={{ color: LIME }}>performance</span>
            <br />
            industrial
          </h1>

          <div className="mt-10 grid gap-8 border-t pt-8 lg:grid-cols-[1fr_auto]" style={{ borderColor: "rgba(233,235,228,0.2)" }}>
            <p className="max-w-xl text-base leading-relaxed text-[#E9EBE4]/70">
              Especialidades químicas e assistência técnica para Papel e Cartão, Celulose e Tratamento
              de Água. Um parceiro local, internacional, independente — do laboratório à planta.
            </p>
            <div className="text-[#E9EBE4]/50">
              <ProcessFlow className="h-16 w-full max-w-[280px]" />
              <p className="mt-1 text-center font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-widest">
                fluxo de atendimento
              </p>
            </div>
          </div>

          <a
            href="#contato"
            className="mt-10 inline-flex items-center gap-2 border px-5 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest transition-colors hover:bg-[#C8F94A] hover:text-[#0B0D0A]"
            style={{ borderColor: LIME, color: LIME }}
          >
            Solicitar ficha técnica →
          </a>
        </div>
      </div>
    </section>
  );
}
