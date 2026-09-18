"use client";

import { useState } from "react";

const INDICE = [
  { n: "01", href: "#abertura", label: "Abertura" },
  { n: "02", href: "#quem-somos", label: "Quem somos" },
  { n: "03", href: "#produtos", label: "Produtos" },
  { n: "04", href: "#diferenciais", label: "Diferenciais" },
  { n: "05", href: "#contato", label: "Contato" },
];

export function Masthead() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50" style={{ backgroundColor: "#F6F1E7" }}>
        <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-5">
          <a href="#abertura" className="font-[family-name:var(--font-display)] text-lg tracking-tight">
            Biogreen <span className="italic" style={{ color: "#4B6A45" }}>Chemicals</span>
          </a>
          <button
            onClick={() => setOpen(true)}
            className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em]"
            style={{ color: "#4B6A45" }}
          >
            Índice ↗
          </button>
        </div>
        <div className="mx-auto max-w-5xl px-6">
          <div className="h-px w-full" style={{ backgroundColor: "#221D14", opacity: 0.15 }} />
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: "#221D14" }}>
          <div className="mx-auto flex w-full max-w-5xl items-baseline justify-between px-6 py-5">
            <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-white/50">
              Caderno Biogreen
            </span>
            <button
              onClick={() => setOpen(false)}
              className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-white/70"
            >
              Fechar ✕
            </button>
          </div>

          <nav className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-2 px-6">
            {INDICE.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-baseline gap-6 border-b border-white/10 py-4 text-white transition-opacity hover:opacity-70"
              >
                <span className="font-[family-name:var(--font-mono)] text-sm" style={{ color: "#8FAE83" }}>
                  {item.n}
                </span>
                <span className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
