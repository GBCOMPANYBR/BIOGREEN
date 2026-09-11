import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function ProducaoPage() {
  await requireModuleAccess("producao.ordens");
  return (
    <PlaceholderModule
      titulo="Produção (PCP)"
      descricao="Fórmulas (BOM) versionadas, ordens de produção, lotes com rastreabilidade total, custo real por lote e agenda de equipamentos."
      fase={3}
    />
  );
}
