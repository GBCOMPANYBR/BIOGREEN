const LIME = "#C8F94A";

export function Contato() {
  return (
    <section id="contato" className="border-t px-6 py-24" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
          <h2 className="font-[family-name:var(--font-display)] text-4xl uppercase tracking-tight">Contato / 04</h2>
          <span className="hidden font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40 sm:block">
            Solicitação de atendimento
          </span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <p className="font-[family-name:var(--font-display)] text-3xl uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Procurando a solução química
            <br />
            adequada pra sua empresa?
            <br />
            <span style={{ color: LIME }}>Resposta em até 24h.</span>
          </p>

          <div className="space-y-0 border" style={{ borderColor: "rgba(233,235,228,0.2)" }}>
            {[
              { label: "WhatsApp", value: "(11) 96469-4466", href: "https://wa.me/5511964694466" },
              { label: "Telefone", value: "(11) 98147-1920", href: "tel:+5511981471920" },
              { label: "E-mail", value: "contato@biogreenquimica.com.br", href: "mailto:contato@biogreenquimica.com.br" },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center justify-between border-b px-5 py-4 text-sm transition-colors hover:bg-[#C8F94A]/10"
                style={{ borderColor: "rgba(233,235,228,0.15)" }}
              >
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40">
                  {c.label}
                </span>
                <span>{c.value}</span>
              </a>
            ))}
            <div className="px-5 py-4">
              <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40">
                Endereço
              </span>
              <p className="mt-1 text-sm text-[#E9EBE4]/80">
                Av. Jorge Bei Maluf, 843 — Galpão 2, Vila Theodoro, Suzano/SP, CEP 08686-000
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
