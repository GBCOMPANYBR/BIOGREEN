import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Contato() {
  return (
    <section id="contato" className="relative overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-accent py-24">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-white/70">Vamos conversar</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Procurando a solução química adequada para a sua empresa?
          </h2>
          <p className="mt-4 text-lg text-white/80">Respondemos em até 24 horas.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild size="lg" className="h-auto flex-col items-start gap-1 bg-white/10 px-5 py-4 text-white hover:bg-white/20">
            <a href="https://wa.me/5511964694466" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              <span className="mt-2 text-sm font-semibold">WhatsApp</span>
              <span className="text-xs text-white/70">(11) 96469-4466</span>
            </a>
          </Button>

          <Button asChild size="lg" className="h-auto flex-col items-start gap-1 bg-white/10 px-5 py-4 text-white hover:bg-white/20">
            <a href="tel:+5511981471920">
              <Phone className="h-5 w-5" />
              <span className="mt-2 text-sm font-semibold">Telefone</span>
              <span className="text-xs text-white/70">(11) 98147-1920</span>
            </a>
          </Button>

          <Button asChild size="lg" className="h-auto flex-col items-start gap-1 bg-white/10 px-5 py-4 text-white hover:bg-white/20">
            <a href="mailto:contato@biogreenquimica.com.br">
              <Mail className="h-5 w-5" />
              <span className="mt-2 text-sm font-semibold">E-mail</span>
              <span className="text-xs text-white/70">contato@biogreenquimica.com.br</span>
            </a>
          </Button>

          <div className="flex flex-col items-start gap-1 rounded-md bg-white/10 px-5 py-4 text-white">
            <MapPin className="h-5 w-5" />
            <span className="mt-2 text-sm font-semibold">Endereço</span>
            <span className="text-xs leading-relaxed text-white/70">
              Av. Jorge Bei Maluf, 843 — Galpão 2, Vila Theodoro, Suzano/SP, CEP 08686-000
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
