/**
 * Cores dos gráficos financeiros — validadas com scripts/validate_palette.js da skill
 * dataviz (par verde/azul passa CVD + contraste em ambos os modos; roxo só entra na
 * 3ª série, saldo acumulado). Hardcoded (não via CSS var) porque o Recharts precisa do
 * valor resolvido na hora de desenhar o SVG — ver hook useDarkMode.
 */
export const CHART_COLORS = {
  light: { in: "#1baf7a", out: "#2a78d6", trend: "#4a3aa7" },
  dark: { in: "#199e70", out: "#3987e5", trend: "#9085e9" },
};
