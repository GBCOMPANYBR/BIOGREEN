"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-config";

interface SearchResult {
  tipo: string;
  label: string;
  sublabel?: string;
  href: string;
}

export function CommandPalette({ visibleSlugs }: { visibleSlugs: string[] }) {
  const navItems = NAV_ITEMS.filter((item) => visibleSlugs.includes(item.slug));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const navMatches = navItems.filter((n) => n.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar cliente, produto, lote, NF...</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 rounded-lg border border-border bg-card shadow-lg">
          <Dialog.Title className="sr-only">Busca global</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite para buscar em todo o sistema..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {navMatches.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Módulos</p>
                {navMatches.map((n) => (
                  <button
                    key={n.slug}
                    onClick={() => goTo(`/${n.slug}`)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  >
                    <n.icon className="h-4 w-4 text-muted-foreground" />
                    {n.label}
                  </button>
                ))}
              </div>
            )}

            {loading && <p className="px-2 py-2 text-sm text-muted-foreground">Buscando...</p>}

            {!loading && results.length > 0 && (
              <div>
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Resultados</p>
                {results.map((r, i) => (
                  <button
                    key={`${r.tipo}-${i}`}
                    onClick={() => goTo(r.href)}
                    className="flex w-full flex-col rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>{r.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.tipo}
                      {r.sublabel ? ` · ${r.sublabel}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!loading && query.trim() && results.length === 0 && navMatches.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">Nada encontrado para &ldquo;{query}&rdquo;.</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
