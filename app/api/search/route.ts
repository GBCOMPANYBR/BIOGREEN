import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, can } from "@/lib/permissions";

interface SearchResult {
  tipo: string;
  label: string;
  sublabel?: string;
  href: string;
}

/**
 * Busca global (⌘K). Cada categoria só é consultada se o usuário tiver "podeVer" no recurso
 * correspondente — evita vazar nome de cliente/produto/lote pra quem não tem acesso ao módulo.
 */
export async function GET(req: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  const results: SearchResult[] = [];
  const contains = { contains: q, mode: "insensitive" as const };

  if (can(user, "nucleo.cadastros", "podeVer")) {
    const clientes = await prisma.cliente.findMany({
      where: { deletedAt: null, OR: [{ razaoSocial: contains }, { nomeFantasia: contains }, { cnpjCpf: contains }] },
      take: 5,
      select: { id: true, razaoSocial: true, segmento: true },
    });
    results.push(
      ...clientes.map((c) => ({
        tipo: "Cliente",
        label: c.razaoSocial,
        sublabel: c.segmento,
        href: `/nucleo?cliente=${c.id}`,
      }))
    );

    const produtos = await prisma.produto.findMany({
      where: { deletedAt: null, OR: [{ nomeComercial: contains }, { codigoInterno: contains }] },
      take: 5,
      select: { id: true, nomeComercial: true, codigoInterno: true },
    });
    results.push(
      ...produtos.map((p) => ({
        tipo: "Produto",
        label: p.nomeComercial,
        sublabel: p.codigoInterno,
        href: `/nucleo?produto=${p.id}`,
      }))
    );
  }

  if (can(user, "producao.lotes", "podeVer")) {
    const lotes = await prisma.lote.findMany({
      where: { numeroLote: contains },
      take: 5,
      select: { id: true, numeroLote: true, produto: { select: { nomeComercial: true } } },
    });
    results.push(
      ...lotes.map((l) => ({
        tipo: "Lote",
        label: l.numeroLote,
        sublabel: l.produto.nomeComercial,
        href: `/producao?lote=${l.id}`,
      }))
    );
  }

  if (can(user, "fiscal.notas", "podeVer")) {
    const notas = await prisma.notaFiscal.findMany({
      where: { numero: contains },
      take: 5,
      select: { id: true, numero: true, serie: true },
    });
    results.push(
      ...notas.map((n) => ({
        tipo: "Nota Fiscal",
        label: `NF ${n.numero}`,
        sublabel: `série ${n.serie}`,
        href: `/fiscal?nota=${n.id}`,
      }))
    );
  }

  if (can(user, "comercial.pedidos", "podeVer")) {
    const pedidos = await prisma.pedidoVenda.findMany({
      where: { deletedAt: null, numero: contains },
      take: 5,
      select: { id: true, numero: true, cliente: { select: { razaoSocial: true } } },
    });
    results.push(
      ...pedidos.map((p) => ({
        tipo: "Pedido de Venda",
        label: p.numero,
        sublabel: p.cliente.razaoSocial,
        href: `/comercial?pedido=${p.id}`,
      }))
    );
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
