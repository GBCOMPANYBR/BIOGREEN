import { redirect } from "next/navigation";
import { NAV_ITEMS, type NavItem } from "@/lib/nav-config";
import { can, getCurrentUser, type AuthedUser } from "@/lib/permissions";

/**
 * Único lugar que decide quais módulos um usuário vê — usado tanto pela sidebar/⌘K
 * quanto pelos atalhos do Painel, pra não haver dois filtros de RBAC divergentes.
 * Server-only (importa lib/permissions, que usa cookies()/prisma) — nunca importe
 * este arquivo de um Client Component; componentes client filtram NAV_ITEMS
 * diretamente a partir de uma lista de slugs já calculada no servidor.
 */
export function getVisibleNavItems(user: AuthedUser): NavItem[] {
  return NAV_ITEMS.filter(
    (item) =>
      item.slug === "" ||
      can(user, item.recurso, "podeVer") ||
      (item.recursoAlt && can(user, item.recursoAlt, "podeVer"))
  );
}

export function getVisibleSlugs(user: AuthedUser): string[] {
  return getVisibleNavItems(user).map((item) => item.slug);
}

/**
 * Guarda de página para os módulos: garante sessão + "podeVer" no recurso antes de renderizar.
 * Hoje os módulos ainda são placeholders sem dado sensível, mas a checagem já entra por
 * padrão — evita que o acesso direto pela URL contorne o que a sidebar esconde, e é o
 * mesmo guard que as páginas reais de cada módulo vão reusar a partir da Fase 1.
 */
export async function requireModuleAccess(recurso: string): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user, recurso, "podeVer")) redirect("/");
  return user;
}

/** Igual a requireModuleAccess, mas passa se o usuário tiver "podeVer" em QUALQUER um dos
 * recursos — usado quando uma página tem abas cobertas por permissões diferentes (ex.:
 * Estoque tem "movimentos" e "cadastro de matérias-primas", e nem todo mundo vê as duas). */
export async function requireAnyModuleAccess(recursos: string[]): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!recursos.some((r) => can(user, r, "podeVer"))) redirect("/");
  return user;
}
