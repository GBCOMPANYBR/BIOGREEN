import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-heading", weight: ["500", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Biogreen Chemicals — Química de performance para Papel, Celulose e Tratamento de Água",
  description:
    "Especialidades químicas e assistência técnica para as indústrias de Papel e Cartão, Celulose e Tratamento de Água. Grupo familiar, independente, com atendimento local.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Biogreen Chemicals",
    description:
      "Especialidades químicas e assistência técnica para Papel e Cartão, Celulose e Tratamento de Água.",
    url: "https://biogreen-sistema.vercel.app/site",
    siteName: "Biogreen Chemicals",
    locale: "pt_BR",
    type: "website",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${manrope.variable} ${inter.variable} font-body bg-white text-slate-900 antialiased`}>
      {children}
    </div>
  );
}
