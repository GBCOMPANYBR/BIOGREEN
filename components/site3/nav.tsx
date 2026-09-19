"use client";

import { useState } from "react";

const LINKS = [
  { href: "#sobre", label: "SOBRE" },
  { href: "#produtos", label: "PRODUTOS" },
  { href: "#diferenciais", label: "DIFERENCIAIS" },
  { href: "#contato", label: "CONTATO" },
];

const LIME = "#C8F94A";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b" style={{ backgroundColor: "#0B0D0A", borderColor: "rgba(233,235,228,0.15)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#topo" className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest">
          Biogreen <span style={{ color: LIME }}>/</span> Dossiê Nº 2026-03
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-[family-name:var(--font-mono)] text-[11px] tracking-widest text-[#E9EBE4]/60 transition-colors hover:text-[#C8F94A]"
            >
              [ {l.label} ]
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="font-[family-name:var(--font-mono)] text-[11px] tracking-widest md:hidden"
          style={{ color: LIME }}
        >
          [ {open ? "FECHAR" : "MENU"} ]
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t px-6 py-4 md:hidden" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2 font-[family-name:var(--font-mono)] text-xs tracking-widest text-[#E9EBE4]/70"
            >
              [ {l.label} ]
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
