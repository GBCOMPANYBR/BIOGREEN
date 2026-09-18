"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#produtos", label: "Produtos" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-900/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="#topo" className="flex items-center gap-2">
          <Image src="/logo-biogreen.png" alt="Biogreen Chemicals" width={140} height={68} className="h-9 w-auto" priority />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-primary">
              {l.label}
            </a>
          ))}
          <Button asChild size="sm" variant="accent">
            <a href="#contato">Fale com um especialista</a>
          </Button>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 md:hidden"
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-900/5 bg-white px-6 py-4 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {l.label}
            </a>
          ))}
          <Button asChild variant="accent" className="mt-2">
            <a href="#contato" onClick={() => setOpen(false)}>
              Fale com um especialista
            </a>
          </Button>
        </nav>
      )}
    </header>
  );
}
