export interface Parcela {
  numero: number;
  valor: number;
  vencimento: Date;
}

/**
 * Lê a condição de pagamento do pedido (ex.: "30/60/90 dias", "45 dias") e devolve uma
 * parcela por prazo encontrado, com o valor dividido igualmente (a última parcela absorve
 * o arredondamento pra bater exatamente o total). Sem condição reconhecível, cai numa
 * parcela única em 30 dias — mesmo padrão de antes.
 */
export function calcularParcelas(condicaoPagamento: string | null | undefined, valorTotal: number, dataBase: Date): Parcela[] {
  const prazos = condicaoPagamento?.match(/\d+/g)?.map(Number) ?? [30];
  const n = prazos.length;
  const valorParcela = Math.round((valorTotal / n) * 100) / 100;

  return prazos.map((dias, i) => ({
    numero: i + 1,
    valor: i === n - 1 ? Math.round((valorTotal - valorParcela * (n - 1)) * 100) / 100 : valorParcela,
    vencimento: new Date(dataBase.getTime() + dias * 24 * 60 * 60 * 1000),
  }));
}
