import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function LogisticaPage() {
  await requireModuleAccess("logistica.expedicao");
  return (
    <PlaceholderModule
      titulo="Logística / Expedição"
      descricao="Separação, conferência com QR, romaneio, etiquetas de risco/ONU, rastreio de transportadora e comprovante de entrega."
      fase={4}
    />
  );
}
