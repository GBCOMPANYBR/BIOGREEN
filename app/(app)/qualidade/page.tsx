import { FlaskConical } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function QualidadePage() {
  await requireModuleAccess("qualidade.especificacoes");
  return (
    <PlaceholderModule
      titulo="Qualidade / Laboratório"
      icon={FlaskConical}
      fase={3}
      descricao="Cada lote com laudo, cada não conformidade com dono e prazo — sem depender de planilha solta."
      funcionalidades={[
        "Especificações por produto (parâmetro, mínimo/máximo, método) e análises por lote",
        "Certificado de Análise (COA) em PDF com a marca, anexado automaticamente ao lote e à nota fiscal",
        "Inspeção de recebimento de matéria-prima, com aprovação ou bloqueio de lote do fornecedor",
        "Não conformidades e reclamações de cliente com fluxo de ação corretiva (8D)",
        "Controle de vencimento de FISPQ e documentos técnicos, com alerta automático",
      ]}
    />
  );
}
