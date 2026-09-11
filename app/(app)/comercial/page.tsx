import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function ComercialPage() {
  await requireModuleAccess("comercial.pedidos");
  return (
    <PlaceholderModule
      titulo="Comercial / CRM"
      descricao="Funil de oportunidades, propostas e orçamentos, pedidos de venda, contratos recorrentes, tabela de preços, comissões e metas comerciais."
      fase={1}
    />
  );
}
