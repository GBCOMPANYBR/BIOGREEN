/**
 * Importação única da lista de clientes exportada do sistema anterior (CSV "Pessoas").
 * Mesmo critério usado em importar-fornecedores.ts (instrução do Elton, 2026-09-18): importa só
 * as linhas com CNPJ ou CPF válido — o arquivo é uma exportação genérica de "Pessoas" e mistura
 * clientes reais com pessoas físicas, associações e lançamentos sem documento.
 *
 * Roda uma vez: `npx tsx scripts/importar-clientes.ts "<caminho do csv>"`
 *
 * O que faz:
 * - Deduplica por CNPJ/CPF (mantém a primeira ocorrência).
 * - Cria o cliente se o documento ainda não existe, ou atualiza os dados cadastrais se já existe
 *   (upsert por cnpjCpf).
 * - Segmento é obrigatório no schema e o CSV não traz essa informação — infere por palavra-chave
 *   no nome/razão social (celulose/papel/tratamento de água) e cai em NAO_CLASSIFICADO quando não
 *   dá pra saber, pra revisão manual em Núcleo.
 * - E-mail e telefone do CSV não são importados: Cliente não tem esses campos (só existem em
 *   ClienteContato, que exige o nome de uma pessoa de contato, e o CSV só tem contato genérico da
 *   empresa) — ficam pra cadastro manual se algum dia forem necessários.
 */
import { PrismaClient, Segmento } from "@prisma/client";
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

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase();
}

function inferSegmento(nome: string): Segmento {
  const n = normalize(nome);
  if (n.includes("CELULOSE")) return "CELULOSE";
  if (n.includes("PAPEL") || n.includes("PAPEIS") || n.includes("PAPER")) return "PAPEL_CARTAO";
  if (n.includes("SANEAMENTO") || n.includes("TRATAMENTO DE AGUA") || /\bAGUAS?\b/.test(n)) {
    return "TRATAMENTO_AGUA";
  }
  return "NAO_CLASSIFICADO";
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
  if (!path) throw new Error("Uso: npx tsx scripts/importar-clientes.ts <caminho do csv>");

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
    const digits = onlyDigits(r["CNPJ"]);
    let doc: string | null = null;
    if (digits.length === 14) doc = formatCnpj(digits);
    else if (digits.length === 11) doc = formatCpf(digits);

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
  let naoClassificados = 0;

  for (const [doc, r] of porDocumento) {
    const nome = (r["Nome"] || "").trim();
    const razaoSocialRaw = (r["Razão social"] || "").trim();
    const razaoSocial = razaoSocialRaw || nome;
    const nomeFantasia = razaoSocialRaw && razaoSocialRaw !== nome ? nome : null;
    const segmento = inferSegmento(`${razaoSocial} ${nomeFantasia ?? ""}`);
    if (segmento === "NAO_CLASSIFICADO") naoClassificados++;

    const data = {
      razaoSocial,
      nomeFantasia,
      segmento,
      inscricaoEstadual: r["Inscrição estadual"]?.trim() || null,
      endereco: r["Endereço"]?.trim()
        ? `${r["Endereço"].trim()}${r["Número"]?.trim() ? `, ${r["Número"].trim()}` : ""}`
        : null,
      bairro: r["Bairro"]?.trim() || null,
      cidade: r["Cidade"]?.trim() || null,
      uf: r["UF"]?.trim() || null,
      cep: r["CEP"]?.trim() || null,
    };

    const existente = await prisma.cliente.findUnique({ where: { cnpjCpf: doc } });
    if (existente) {
      await prisma.cliente.update({ where: { cnpjCpf: doc }, data });
      atualizados++;
    } else {
      await prisma.cliente.create({ data: { ...data, cnpjCpf: doc, empresaId: empresa.id } });
      criados++;
    }
  }

  console.log(`Criados: ${criados}`);
  console.log(`Atualizados (já existiam): ${atualizados}`);
  console.log(`Segmento NAO_CLASSIFICADO (revisar em Núcleo): ${naoClassificados}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
