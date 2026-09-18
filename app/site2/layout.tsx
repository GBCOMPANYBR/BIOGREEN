import type { Metadata } from "next";
import { Fraunces, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
});
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", weight: ["400", "500", "600"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Biogreen Chemicals — Caderno de especialidades químicas",
  description:
    "Um caderno de campo sobre a Biogreen: especialidades químicas para Papel e Cartão, Celulose e Tratamento de Água, e a forma como trabalhamos.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Biogreen Chemicals",
    description: "Especialidades químicas para Papel e Cartão, Celulose e Tratamento de Água.",
    url: "https://biogreen-sistema.vercel.app/site2",
    siteName: "Biogreen Chemicals",
    locale: "pt_BR",
    type: "website",
  },
};

export default function Site2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${serif.variable} ${mono.variable} font-serif antialiased`}
      style={{ backgroundColor: "#F6F1E7", color: "#221D14" }}
    >
      {children}
    </div>
  );
}
