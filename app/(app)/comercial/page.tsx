import { Handshake } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function ComercialPage() {
  await requireModuleAccess("comercial.pedidos");
  return (
    <PlaceholderModule
      titulo="Comercial / CRM"
      icon={Handshake}
      fase={1}
      descricao="Do primeiro contato ao pedido faturado — funil, propostas e comissões num só fluxo."
      funcionalidades={[
        "Funil de oportunidades em kanban (lead → visita técnica → teste industrial → proposta → ganho/perdido)",
        "Propostas e orçamentos com versionamento, PDF com a marca Biogreen e aprovação por alçada",
        "Pedidos de venda que já disparam produção, previsão financeira e expedição automaticamente",
        "Contratos de fornecimento recorrente com alerta de reposição por cliente",
        "Tabela de preços por cliente/segmento e margem mínima com bloqueio automático",
        "Comissões configuráveis por vendedor e metas comerciais com dashboard de conversão",
      ]}
    />
  );
}
