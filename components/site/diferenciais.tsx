import { ShieldCheck, Leaf, HeartHandshake, FlaskConical } from "lucide-react";

const ITENS = [
  {
    icon: FlaskConical,
    titulo: "Assistência técnica de verdade",
    descricao: "Acompanhamento em campo, do teste industrial ao ajuste fino em operação contínua.",
  },
  {
    icon: Leaf,
    titulo: "Sustentabilidade na prática",
    descricao: "Compromissos alinhados à Agenda ONU 2030 e conformidade legal ambiental em cada etapa.",
  },
  {
    icon: ShieldCheck,
    titulo: "Ética e transparência",
    descricao: "Código de conduta claro para fornecedores, integridade e respeito aos direitos humanos.",
  },
  {
    icon: HeartHandshake,
    titulo: "Saúde e segurança em primeiro lugar",
    descricao: "Ambientes seguros e uma equipe valorizada — a base de tudo o que entregamos.",
  },
];

export function Diferenciais() {
  return (
    <section id="diferenciais" className="relative bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Por que Biogreen</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Diferenciais que sustentam a parceria
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {ITENS.map((item) => (
            <div key={item.titulo}>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-heading text-base font-bold text-slate-900">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
