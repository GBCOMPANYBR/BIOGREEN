import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";
import type { Acao } from "@/lib/recursos";

export interface AuthedUser {
  id: number;
  empresaId: number;
  nome: string;
  email: string;
  username: string;
  superAdmin: boolean;
  ativo: boolean;
  deveTrocarSenha: boolean;
  cargoId: number | null;
  /** recurso -> ações permitidas, já resolvido (vazio para superAdmin, que passa em tudo). */
  permissoes: Map<string, Set<Acao>>;
}

/**
 * Carrega o usuário logado (com cargo + permissões) a cada chamada — igual ao padrão do
 * Imetal: uma mudança de permissão feita por um admin vale imediatamente, sem exigir novo login.
 */
export async function getCurrentUser(): Promise<AuthedUser | null> {
  const session = await getSessionPayload();
  if (!session) return null;

  const record = await prisma.usuario.findUnique({
    where: { id: session.userId },
    include: { cargo: { include: { permissoes: true } } },
  });
  if (!record || !record.ativo) return null;

  const permissoes = new Map<string, Set<Acao>>();
  for (const p of record.cargo?.permissoes ?? []) {
    const acoes = new Set<Acao>();
    if (p.podeVer) acoes.add("podeVer");
    if (p.podeCriar) acoes.add("podeCriar");
    if (p.podeEditar) acoes.add("podeEditar");
    if (p.podeAprovar) acoes.add("podeAprovar");
    if (p.podeExcluir) acoes.add("podeExcluir");
    permissoes.set(p.recurso, acoes);
  }

  return {
    id: record.id,
    empresaId: record.empresaId,
    nome: record.nome,
    email: record.email,
    username: record.username,
    superAdmin: record.superAdmin,
    ativo: record.ativo,
    deveTrocarSenha: record.deveTrocarSenha,
    cargoId: record.cargoId,
    permissoes,
  };
}

export function can(user: AuthedUser, recurso: string, acao: Acao): boolean {
  if (user.superAdmin) return true;
  return user.permissoes.get(recurso)?.has(acao) ?? false;
}

export async function requireAuth(): Promise<{ user: AuthedUser } | { error: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  }
  return { user };
}

export async function requirePermission(
  recurso: string,
  acao: Acao
): Promise<{ user: AuthedUser } | { error: NextResponse }> {
  const result = await requireAuth();
  if ("error" in result) return result;
  if (!can(result.user, recurso, acao)) {
    return {
      error: NextResponse.json({ error: "Você não tem permissão para esta ação." }, { status: 403 }),
    };
  }
  return result;
}
