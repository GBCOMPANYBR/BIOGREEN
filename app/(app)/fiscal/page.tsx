import { Receipt } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function FiscalPage() {
  await requireModuleAccess("fiscal.notas");
  return (
    <PlaceholderModule
      titulo="Fiscal"
      icon={Receipt}
      fase={2}
      descricao="Emissão e controle fiscal integrado ao resto da operação — substitui o MAXCONT."
      funcionalidades={[
        "Emissão de NF-e e NFS-e via provedor de API (Focus NFe, NFe.io ou similar, plugável)",
        "NF de venda, remessa, devolução, complementar e transferência",
        "Cálculo de impostos por NCM/UF/regime, parametrizável pelo contador",
        "Importação de NF de entrada por XML e manifestação do destinatário",
        "Relatórios para contabilidade e portal do contador com acesso somente-leitura",
      ]}
    />
  );
}
