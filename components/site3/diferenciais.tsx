const LIME = "#C8F94A";

const ITENS = [
  { codigo: "CHK-01", titulo: "Assistência técnica de verdade", texto: "Acompanhamento em campo, do teste industrial ao ajuste fino em operação contínua." },
  { codigo: "CHK-02", titulo: "Sustentabilidade na prática", texto: "Compromissos alinhados à Agenda ONU 2030 e conformidade legal ambiental em cada etapa." },
  { codigo: "CHK-03", titulo: "Ética e transparência", texto: "Código de conduta claro para fornecedores, integridade e respeito aos direitos humanos." },
  { codigo: "CHK-04", titulo: "Saúde e segurança em primeiro lugar", texto: "Ambientes seguros e uma equipe valorizada — a base de tudo o que entregamos." },
];

export function Diferenciais() {
  return (
    <section id="diferenciais" className="border-t px-6 py-24" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
          <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase tracking-tight">Diferenciais / 03</h2>
          <span className="hidden font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40 sm:block">
            Checklist de conformidade
          </span>
        </div>

        <div className="mt-6 grid gap-px sm:grid-cols-2" style={{ backgroundColor: "rgba(233,235,228,0.15)" }}>
          {ITENS.map((item) => (
            <div key={item.codigo} className="p-6" style={{ backgroundColor: "#0B0D0A" }}>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border text-[10px]" style={{ borderColor: LIME, color: LIME }}>
                  ✓
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40">
                  {item.codigo}
                </span>
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl uppercase tracking-tight">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#E9EBE4]/70">{item.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
