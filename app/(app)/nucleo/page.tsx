import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function NucleoPage() {
  await requireModuleAccess("nucleo.cadastros");
  return (
    <PlaceholderModule
      titulo="Núcleo — Cadastros e Usuários"
      descricao="Cadastros mestres (clientes, fornecedores, produtos, matérias-primas, embalagens, unidades de medida) e gestão de usuários, cargos e permissões granulares."
      fase={0}
    />
  );
}
