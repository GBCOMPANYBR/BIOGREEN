import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BIOGREEN SYSTEM",
  description: "Sistema de gestão integrado da Biogreen Indústria Química",
  // ferramenta interna com dados reais de clientes/produção/financeiro — nunca deve aparecer em busca
  robots: { index: false, follow: false, nocache: true },
};

// Aplica o tema salvo antes do primeiro paint, para não piscar claro->escuro no load.
const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem("biogreen-theme");
      var theme = stored || "system";
      var isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
