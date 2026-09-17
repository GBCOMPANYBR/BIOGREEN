import { XMLParser } from "fast-xml-parser";

export interface NfeItem {
  descricao: string;
  ncm?: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NfeParseada {
  numero: string;
  serie: string;
  chaveAcesso: string | null;
  dataEmissao: Date | null;
  fornecedorCnpj: string;
  fornecedorNome: string;
  valorTotal: number;
  itens: NfeItem[];
}

function paraArray<T>(v: T | T[] | undefined | null): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Lê o XML padrão de uma NF-e (modelo 55) e extrai o essencial pra lançar a compra —
 * mesma informação que o Conta Azul hoje puxa sozinho do DANFE (que é só a versão
 * "pra humano ler" do mesmo XML). Aceita tanto o XML de distribuição completo
 * (nfeProc, com o protocolo de autorização) quanto o NFe isolado.
 */
export function parseNfeXml(xml: string): NfeParseada {
  // parseTagValue/parseAttributeValue desligados de propósito: a chave de acesso tem 44
  // dígitos, muito além do que um número em JS representa com precisão (viraria notação
  // científica e perderia dígitos) — tudo entra como string, e a gente converte pra
  // número só onde precisa (quantidade, valores), explicitamente, abaixo.
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
    parseTagValue: false,
    parseAttributeValue: false,
  });
  const doc = parser.parse(xml);

  const nfeRoot = doc.nfeProc?.NFe ?? doc.NFe;
  if (!nfeRoot?.infNFe) {
    throw new Error("XML não parece ser uma NF-e válida (elemento <NFe><infNFe> não encontrado).");
  }

  const infNFe = nfeRoot.infNFe;
  const ide = infNFe.ide ?? {};
  const emit = infNFe.emit ?? {};
  const dets = paraArray(infNFe.det);
  const total = infNFe.total?.ICMSTot;

  const idAttr = typeof infNFe["@_Id"] === "string" ? infNFe["@_Id"] : "";
  const chaveAcesso = doc.nfeProc?.protNFe?.infProt?.chNFe ?? (idAttr ? idAttr.replace(/^NFe/, "") : null);

  const itens: NfeItem[] = dets.map((d) => {
    const p = d.prod ?? {};
    return {
      descricao: String(p.xProd ?? "").trim(),
      ncm: p.NCM ? String(p.NCM).trim() : undefined,
      unidade: String(p.uCom ?? "UN").trim(),
      quantidade: Number(p.qCom ?? 0),
      valorUnitario: Number(p.vUnCom ?? 0),
      valorTotal: Number(p.vProd ?? 0),
    };
  });

  const valorTotalNF = total?.vNF != null ? Number(total.vNF) : itens.reduce((acc, i) => acc + i.valorTotal, 0);
  const dataEmissaoRaw = ide.dhEmi ?? ide.dEmi;

  return {
    numero: String(ide.nNF ?? "").trim(),
    serie: String(ide.serie ?? "").trim(),
    chaveAcesso,
    dataEmissao: dataEmissaoRaw ? new Date(String(dataEmissaoRaw)) : null,
    fornecedorCnpj: String(emit.CNPJ ?? emit.CPF ?? "").trim(),
    fornecedorNome: String(emit.xNome ?? "").trim(),
    valorTotal: valorTotalNF,
    itens,
  };
}
