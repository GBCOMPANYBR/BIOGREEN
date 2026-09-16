/**
 * Importação única da planilha real que o Igor mandou — "ESTOQUE ENTRADAS E SAIDAS 2026.xlsx",
 * aba "ENTRADAS ". Por instrução do Elton (2026-09-16): considera só as entradas, ignora as
 * saídas da planilha (estão desatualizadas).
 *
 * Roda uma vez: `npx tsx scripts/importar-entradas-materia-prima.ts`
 *
 * O que faz:
 * - Cadastra cada matéria-prima distinta (normalizando variação de digitação — "SIDERCEL52AT",
 *   "SIDERCEL 52 AT" e "SIDERCEL 52AT" viram um cadastro só).
 * - Reaproveita as matérias-primas fictícias já existentes quando o nome bate (Soda/Ácido
 *   Sulfâmico), em vez de duplicar.
 * - Cadastra cada fornecedor distinto (só normaliza espaço/maiúscula — não tenta adivinhar se
 *   "INGER", "INGER DO BRASIL" e "INGER QUIMICA" são a mesma empresa; fica para revisão manual
 *   depois em Núcleo). CNPJ real não veio na planilha — usa um placeholder `IMPORTADO-000N`.
 * - Cria um EstoqueMovimento ENTRADA por linha, na data e quantidade da planilha.
 */
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

const ARQUIVO = path.resolve(__dirname, "../ESTOQUE ENTRADAS E SAIDAS 2026.xlsx");
const ABA = "ENTRADAS ";

function limparValor(v: unknown): number {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
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

/** Chave de casamento: maiúsculo, sem acento, sem espaço/hífen — junta variações de digitação. */
function chave(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[\s\-]+/g, "");
}

// Sinônimos conhecidos entre o nome real da planilha e o que já estava cadastrado como fictício.
const SINONIMOS: Record<string, string> = {
  [chave("SODA CAUSTICA")]: chave("Soda"),
  [chave("ACIDO SULFAMICO")]: chave("Ácido Sulfâmico"),
};

async function main() {
  console.log(`Lendo ${ARQUIVO} (aba "${ABA}")...`);
  const wb = XLSX.readFile(ARQUIVO);
  const sheet = wb.Sheets[ABA];
  if (!sheet) throw new Error(`Aba "${ABA}" não encontrada. Abas disponíveis: ${wb.SheetNames.join(", ")}`);

  const linhas: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
  const dados = linhas.slice(2).filter((r) => r[2] && String(r[2]).trim() !== "");
  console.log(`${dados.length} linhas com dado real encontradas.`);

  const empresa = await prisma.empresa.findFirstOrThrow();
  const admin = await prisma.usuario.findFirstOrThrow({ where: { superAdmin: true } });
  const kg = await prisma.unidadeMedida.findUniqueOrThrow({ where: { sigla: "kg" } });
  const almoxarifado = await prisma.localEstoque.findFirstOrThrow({ where: { tipo: "ALMOXARIFADO_MP" } });

  const materiaPorChave = new Map<string, number>();
  for (const m of await prisma.materiaPrima.findMany()) {
    materiaPorChave.set(chave(m.nome), m.id);
  }
  for (const [origem, destino] of Object.entries(SINONIMOS)) {
    const id = materiaPorChave.get(destino);
    if (id) materiaPorChave.set(origem, id);
  }

  const fornecedorPorNome = new Map<string, number>();
  for (const f of await prisma.fornecedor.findMany()) {
    fornecedorPorNome.set(f.razaoSocial.trim().toUpperCase(), f.id);
  }

  let mpContador = await prisma.materiaPrima.count();
  let fornContador = await prisma.fornecedor.count();
  let criadasMP = 0;
  let criadosForn = 0;
  let movimentos = 0;
  let ignoradas = 0;

  for (const r of dados) {
    const empresaNome = String(r[3] ?? "").trim();
    const nomeProduto = String(r[6] ?? "").trim() || String(r[7] ?? "").trim();
    const quantidade = limparValor(r[8]);
    const precoNet = limparValor(r[11]);
    const data = parseData(r[2]);
    const notaFiscal = String(r[4] ?? "").trim();

    if (!nomeProduto || quantidade <= 0 || !data) {
      ignoradas++;
      continue;
    }

    let fornecedorId: number | undefined;
    if (empresaNome) {
      const chaveForn = empresaNome.toUpperCase();
      if (!fornecedorPorNome.has(chaveForn)) {
        fornContador++;
        const f = await prisma.fornecedor.create({
          data: {
            empresaId: empresa.id,
            razaoSocial: empresaNome,
            cnpjCpf: `IMPORTADO-${String(fornContador).padStart(4, "0")}`,
            pais: "Brasil",
            createdById: admin.id,
          },
        });
        fornecedorPorNome.set(chaveForn, f.id);
        criadosForn++;
      }
      fornecedorId = fornecedorPorNome.get(chaveForn);
    }

    const chaveProduto = chave(nomeProduto);
    if (!materiaPorChave.has(chaveProduto)) {
      mpContador++;
      const mp = await prisma.materiaPrima.create({
        data: {
          codigo: `MP-IMP-${String(mpContador).padStart(4, "0")}`,
          nome: nomeProduto,
          unidadeMedidaId: kg.id,
          fornecedorPadraoId: fornecedorId,
          custoMedio: precoNet > 0 ? precoNet : null,
        },
      });
      materiaPorChave.set(chaveProduto, mp.id);
      criadasMP++;
    }
    const materiaPrimaId = materiaPorChave.get(chaveProduto)!;

    await prisma.estoqueMovimento.create({
      data: {
        localEstoqueId: almoxarifado.id,
        materiaPrimaId,
        tipo: "ENTRADA",
        quantidade,
        motivo: notaFiscal ? `NF ${notaFiscal}${empresaNome ? ` — ${empresaNome}` : ""}` : empresaNome || "Entrada importada da planilha",
        dataMovimento: data,
        createdById: admin.id,
      },
    });
    movimentos++;
  }

  console.log("Importação concluída:");
  console.log({ linhasProcessadas: dados.length, materiasPrimasNovas: criadasMP, fornecedoresNovos: criadosForn, movimentosCriados: movimentos, linhasIgnoradas: ignoradas });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
