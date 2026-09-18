export function Footer() {
  const ano = new Date().getFullYear();
  return (
    <footer className="px-6 py-8" style={{ backgroundColor: "#221D14", color: "rgba(246,241,231,0.5)" }}>
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest">
          Biogreen Indústria Química Ltda.
        </span>
        <span className="font-[family-name:var(--font-mono)] text-xs">© {ano} — Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
