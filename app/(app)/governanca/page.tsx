import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function GovernancaPage() {
  await requireModuleAccess("governanca.fechamento");
  return (
    <PlaceholderModule
      titulo="Prestação de Contas / Governança"
      descricao="Fechamento mensal por setor, relatório de prestação de contas para a diretoria e indicadores (KPIs) com semáforo."
      fase={4}
    />
  );
}
