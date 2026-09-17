export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(date));
}

export function formatNumber(value: number | string | { toString(): string }, casas = 0): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(
    Number(value.toString())
  );
}

export const STATUS_PEDIDO_LABEL: Record<string, string> = {
  PENDENTE: "Aguardando aprovação",
  APROVADO: "Aprovado",
  EM_PRODUCAO: "Em produção",
  FATURADO: "Faturado",
  EXPEDIDO: "Expedido",
  CANCELADO: "Cancelado",
};

export const STATUS_PEDIDO_BADGE: Record<string, "default" | "secondary" | "accent" | "outline" | "destructive"> = {
  PENDENTE: "outline",
  APROVADO: "secondary",
  EM_PRODUCAO: "accent",
  FATURADO: "secondary",
  EXPEDIDO: "default",
  CANCELADO: "destructive",
};

export const STATUS_EXPEDICAO_LABEL: Record<string, string> = {
  SEPARACAO: "Separação",
  CONFERIDO: "Conferido",
  EXPEDIDO: "Expedido",
  ENTREGUE: "Entregue",
};

export const STATUS_EXPEDICAO_BADGE: Record<string, "default" | "secondary" | "accent" | "outline" | "destructive"> = {
  SEPARACAO: "outline",
  CONFERIDO: "secondary",
  EXPEDIDO: "accent",
  ENTREGUE: "default",
};
