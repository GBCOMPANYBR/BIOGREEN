import { Compass } from "./illustrations";
import { Reveal } from "./reveal";

export function Contato() {
  return (
    <section id="contato" className="px-6 py-24" style={{ backgroundColor: "#221D14", color: "#F6F1E7" }}>
      <div className="mx-auto max-w-5xl">
        <div className="flex items-baseline gap-4">
          <span className="font-[family-name:var(--font-mono)] text-sm" style={{ color: "#8FAE83" }}>05</span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">Colofão</h2>
        </div>

        <Reveal className="mt-10 grid gap-14 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="max-w-lg font-[family-name:var(--font-display)] text-2xl italic leading-snug sm:text-3xl">
              Procurando a solução química adequada para a sua empresa? Respondemos em até 24 horas.
            </p>

            <dl className="mt-10 space-y-5 font-[family-name:var(--font-serif)] text-base">
              <div>
                <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-white/40">WhatsApp</dt>
                <dd>
                  <a href="https://wa.me/5511964694466" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:decoration-white">
                    (11) 96469-4466
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-white/40">Telefone</dt>
                <dd>
                  <a href="tel:+5511981471920" className="underline decoration-white/30 hover:decoration-white">
                    (11) 98147-1920
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-white/40">E-mail</dt>
                <dd>
                  <a href="mailto:contato@biogreenquimica.com.br" className="underline decoration-white/30 hover:decoration-white">
                    contato@biogreenquimica.com.br
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-white/40">Endereço</dt>
                <dd className="text-white/80">
                  Av. Jorge Bei Maluf, 843 — Galpão 2, Vila Theodoro, Suzano/SP, CEP 08686-000
                </dd>
              </div>
            </dl>
          </div>

          <div className="hidden shrink-0 self-start lg:block" style={{ color: "#8FAE83" }}>
            <Compass className="h-28 w-28" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
