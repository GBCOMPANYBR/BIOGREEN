import Image from "next/image";

export function SiteFooter() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900/5 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <Image src="/logo-biogreen.png" alt="Biogreen Chemicals" width={140} height={68} className="h-8 w-auto opacity-80" />
        <p className="text-center text-xs text-slate-500 sm:text-right">
          © {ano} Biogreen Indústria Química Ltda. Todos os direitos reservados.
          {" · "}
          <a href="https://gbcompanybr.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
            BY GBCOMPANYBR
          </a>
        </p>
      </div>
    </footer>
  );
}
