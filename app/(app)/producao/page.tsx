import { Factory } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function ProducaoPage() {
  await requireModuleAccess("producao.ordens");
  return (
    <PlaceholderModule
      titulo="Produção (PCP)"
      icon={Factory}
      fase={3}
      descricao="Da fórmula ao lote pronto, com custo real e rastreabilidade de ponta a ponta."
      funcionalidades={[
        "Fórmulas (BOM) versionadas, com ordem de adição, tempo, temperatura e EPI — inclusive customizadas por cliente",
        "Ordens de produção: planejada → em produção → controle de qualidade → concluída",
        "Consumo real vs. teórico de matéria-prima, apontamento direto por tablet no chão de fábrica",
        "Lotes com rastreabilidade total — do lote de matéria-prima ao cliente final, nos dois sentidos",
        "Custo real por lote (matéria-prima + embalagem + mão de obra + energia) alimentando a margem comercial",
        "Agenda de reatores/misturadores e manutenção preventiva de equipamentos",
      ]}
    />
  );
}
