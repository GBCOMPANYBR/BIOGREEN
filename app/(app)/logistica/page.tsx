import { Truck } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function LogisticaPage() {
  await requireModuleAccess("logistica.expedicao");
  return (
    <PlaceholderModule
      titulo="Logística / Expedição"
      icon={Truck}
      fase={4}
      descricao="Do pedido separado à entrega confirmada, com todo o cuidado que produto químico exige."
      funcionalidades={[
        "Separação de pedido com conferência por QR code",
        "Romaneio e etiquetas de volume com dados de risco/ONU",
        "Agendamento de coleta e rastreio por transportadora",
        "Comprovante de entrega com foto e assinatura do recebedor",
      ]}
    />
  );
}
