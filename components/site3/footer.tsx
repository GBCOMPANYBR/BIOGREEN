export function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer className="border-t px-6 py-6" style={{ borderColor: "rgba(233,235,228,0.15)" }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#E9EBE4]/40 sm:flex-row">
        <span>Biogreen Indústria Química Ltda. — Doc. BG-2026-03</span>
        <span>© {ano} — Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
