import type { Metadata } from "next";
import { Big_Shoulders, Space_Grotesk, JetBrains_Mono } from "next/font/google";

const display = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "variable",
  axes: ["opsz"],
});
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Biogreen Chemicals — Dossiê técnico",
  description:
    "Especialidades químicas para Papel e Cartão, Celulose e Tratamento de Água — ficha técnica da Biogreen.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Biogreen Chemicals — Dossiê técnico",
    description: "Especialidades químicas para Papel e Cartão, Celulose e Tratamento de Água.",
    url: "https://biogreen-sistema.vercel.app/site3",
    siteName: "Biogreen Chemicals",
    locale: "pt_BR",
    type: "website",
  },
};

export default function Site3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${grotesk.variable} ${mono.variable} font-[family-name:var(--font-body)] antialiased`}
      style={{ backgroundColor: "#0B0D0A", color: "#E9EBE4" }}
    >
      {children}
    </div>
  );
}
