/**
 * Importação única da lista de fornecedores exportada do sistema anterior (CSV "Pessoas").
 * Por instrução do Elton (2026-09-18): importa só as linhas com CNPJ ou CPF válido — o
 * arquivo é uma exportação genérica de "Pessoas" e mistura fornecedores reais sem documento
 * com lançamentos que não são fornecedor nenhum (ex.: "13º Salário", "Bonificação").
 *
 * Roda uma vez: `npx tsx scripts/importar-fornecedores.ts "<caminho do csv>"`
 *
 * O que faz:
 * - Deduplica por CNPJ/CPF (mantém a primeira ocorrência).
 * - Cria o fornecedor se o documento ainda não existe, ou atualiza os dados cadastrais se já
 *   existe (upsert por cnpjCpf).
 * - Não tenta casar por nome com os fornecedores já importados via
 *   importar-entradas-materia-prima.ts (que usam placeholder IMPORTADO-000N) — pode haver
 *   duplicidade de empresa sob CNPJ real vs. placeholder; revisão manual fica pra depois,
 *   em Núcleo.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

function onlyDigits(s: string | undefined): string {
  return (s ?? "").replace(/\D/g, "");
}

function formatCnpj(digits: string): string {
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatCpf(digits: string): string {
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/** Parser mínimo de CSV com ; como delimitador e suporte a campos entre "aspas" (que podem
 * conter o próprio delimitador). Suficiente pro arquivo em questão — sem trazer dependência nova. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const clean = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");

  while (i < clean.length) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ";") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error("Uso: npx tsx scripts/importar-fornecedores.ts <caminho do csv>");

  const raw = readFileSync(path, "utf-8");
  const parsed = parseCsv(raw).filter((r) => r.some((c) => c.trim().length > 0));
  const header = parsed[0];
  const rows = parsed.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => (obj[h] = r[idx] ?? ""));
    return obj;
  });

  const empresa = await prisma.empresa.findFirstOrThrow();

  const porDocumento = new Map<string, Record<string, string>>();
  let semDocumento = 0;
  let duplicados = 0;

  for (const r of rows) {
    const cnpjDigits = onlyDigits(r["CNPJ"]);
    const cpfDigits = onlyDigits(r["CPF"]);
    let doc: string | null = null;
    if (cnpjDigits.length === 14) doc = formatCnpj(cnpjDigits);
    else if (cpfDigits.length === 11) doc = formatCpf(cpfDigits);

    if (!doc) {
      semDocumento++;
      continue;
    }
    if (porDocumento.has(doc)) {
      duplicados++;
      continue;
    }
    porDocumento.set(doc, r);
  }

  console.log(`Linhas totais: ${rows.length}`);
  console.log(`Sem CNPJ/CPF (ignoradas): ${semDocumento}`);
  console.log(`Duplicadas por documento (ignoradas): ${duplicados}`);
  console.log(`A importar: ${porDocumento.size}`);

  let criados = 0;
  let atualizados = 0;

  for (const [doc, r] of porDocumento) {
    const nome = (r["Nome"] || "").trim();
    const razaoSocialRaw = (r["Razão social"] || "").trim();
    const razaoSocial = razaoSocialRaw || nome;
    const nomeFantasia = razaoSocialRaw && razaoSocialRaw !== nome ? nome : null;

    const data = {
      razaoSocial,
      nomeFantasia,
      inscricaoEstadual: r["Inscrição estadual"]?.trim() || null,
      email: r["E-mail principal"]?.trim() || null,
      telefone: r["Telefone principal"]?.trim() || null,
      endereco: r["Endereço"]?.trim()
        ? `${r["Endereço"].trim()}${r["Número"]?.trim() ? `, ${r["Número"].trim()}` : ""}`
        : null,
      bairro: r["Bairro"]?.trim() || null,
      cidade: r["Cidade"]?.trim() || null,
      uf: r["UF"]?.trim() || null,
      cep: r["CEP"]?.trim() || null,
    };

    const existente = await prisma.fornecedor.findUnique({ where: { cnpjCpf: doc } });
    if (existente) {
      await prisma.fornecedor.update({ where: { cnpjCpf: doc }, data });
      atualizados++;
    } else {
      await prisma.fornecedor.create({ data: { ...data, cnpjCpf: doc, empresaId: empresa.id } });
      criados++;
    }
  }

  console.log(`Criados: ${criados}`);
  console.log(`Atualizados (já existiam): ${atualizados}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
