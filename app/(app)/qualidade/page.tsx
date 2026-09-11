import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function QualidadePage() {
  await requireModuleAccess("qualidade.especificacoes");
  return (
    <PlaceholderModule
      titulo="Qualidade / Laboratório"
      descricao="Especificações por produto, análises por lote, Certificado de Análise (COA), inspeção de recebimento e não conformidades (8D)."
      fase={3}
    />
  );
}
