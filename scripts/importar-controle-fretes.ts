/**
 * Importação única do histórico real de fretes que a Larissa controla —
 * "CONTROLES DE FRETES.xlsx", aba "Frete". Por instrução do Elton (2026-09-17).
 *
 * Roda uma vez: `npx tsx scripts/importar-controle-fretes.ts`
 *
 * Vira registro de referência (histórico) no model Frete — nenhuma linha é vinculada a um
 * PedidoVenda/NotaFiscalEntrada do sistema (são fretes reais de antes do sistema existir).
 * Todas entram com status "ENTREGUE" (já aconteceram).
 */
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

const ARQUIVO = path.resolve(__dirname, "../CONTROLES DE FRETES.xlsx");
const ABA = "Frete";

function limparValor(v: unknown): number | null {
  const n = Number(String(v ?? "").replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function limparQtd(v: unknown): number | null {
  const m = String(v ?? "")
    .replace(/,/g, "")
    .match(/[\d.]+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function limparTexto(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s && s !== "-" ? s : null;
}

function parseData(v: unknown): Date | null {
  const m = String(v ?? "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const mes = Number(m[1]);
  const dia = Number(m[2]);
  let ano = Number(m[3]);
  if (ano < 100) ano += 2000;
  const data = new Date(ano, mes - 1, dia);
  return Number.isNaN(data.getTime()) ? null : data;
}

/** A planilha tem bastante inconsistência de digitação ("ENTTREGA", "ENGTEGA", espaços
 * sobrando, "SAIDA"/"ENTRADA" em vez de ENTREGA/COLETA) — normaliza pelo que a palavra contém. */
function normalizarTipo(v: unknown): "COLETA" | "ENTREGA" | "OUTRO" {
  const t = String(v ?? "").trim().toUpperCase();
  if (t.includes("COLETA") || t === "ENTRADA") return "COLETA";
  if (t.includes("ENTREGA") || t.includes("ENTTREGA") || t.includes("ENGTEGA") || t.includes("EXPEDI") || t === "SAIDA") return "ENTREGA";
  return "OUTRO";
}

async function main() {
  console.log(`Lendo ${ARQUIVO} (aba "${ABA}")...`);
  const wb = XLSX.readFile(ARQUIVO);
  const sheet = wb.Sheets[ABA];
  if (!sheet) throw new Error(`Aba "${ABA}" não encontrada. Abas disponíveis: ${wb.SheetNames.join(", ")}`);

  const linhas: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
  // Colunas: TIPO | TIPO DE CARROCERIA | QTD (KG) | DESCRIÇÃO DOS ITENS | NF's | LOCAL |
  //          PARCEIRO | DATA DO FRETE | VALOR DO FRETE | CENTRO DE CUSTO | OBS
  const dados = linhas.slice(1).filter((r) => parseData(r[7]) !== null);
  console.log(`${dados.length} linhas com data válida encontradas.`);

  const admin = await prisma.usuario.findFirstOrThrow({ where: { superAdmin: true } });

  let criados = 0;
  for (const r of dados) {
    await prisma.frete.create({
      data: {
        tipo: normalizarTipo(r[0]),
        tipoCarroceria: limparTexto(r[1]),
        quantidadeKg: limparQtd(r[2]),
        descricaoItens: limparTexto(r[3]),
        notasFiscais: limparTexto(r[4]),
        local: limparTexto(r[5]),
        transportadora: limparTexto(r[6]),
        dataFrete: parseData(r[7]),
        valorFrete: limparValor(r[8]),
        centroCusto: limparTexto(r[9]),
        observacoes: limparTexto(r[10]),
        status: "ENTREGUE",
        createdById: admin.id,
      },
    });
    criados++;
  }

  console.log("Importação concluída:", { linhasProcessadas: dados.length, fretesCriados: criados });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
