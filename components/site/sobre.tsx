import { Target, Eye, Users2 } from "lucide-react";

export function Sobre() {
  return (
    <section id="sobre" className="relative bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Quem somos</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Um grupo 100% familiar, independente e presente na operação
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Por sermos independentes, gerenciamos diretamente os problemas operacionais locais —
            com a estrutura e a experiência de um grupo internacional, mas com a agilidade de
            quem está perto do cliente todos os dias.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-900/5 bg-slate-50/60 p-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">Missão</h3>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
              <li>Ambientes seguros e uma equipe valorizada.</li>
              <li>Conduzir os negócios garantindo crescimento ético e eco-compatível.</li>
              <li>Minimizar o impacto ambiental de forma contínua.</li>
              <li>Entregar soluções inovadoras que preservam o meio ambiente.</li>
              <li>Compartilhar experiência com fornecedores e clientes.</li>
              <li>Gerar mudanças positivas nas comunidades onde atuamos.</li>
              <li>Ser, de fato, uma empresa sustentável.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-900/5 bg-slate-50/60 p-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">Visão</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Nos tornarmos uma empresa de referência na comercialização de produtos químicos com
              especificações exclusivas, oferecendo atendimento especializado e assistência
              técnica real — do primeiro contato à planta em operação.
            </p>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-white p-4">
              <Users2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-slate-600">
                Sustentabilidade alinhada à <strong className="text-slate-800">Agenda ONU 2030</strong>,
                conformidade legal ambiental e um código de conduta claro para fornecedores e parceiros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
