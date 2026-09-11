import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function EstoquePage() {
  await requireModuleAccess("estoque.movimentos");
  return (
    <PlaceholderModule
      titulo="Estoque"
      descricao="Estoque por local e lote com FIFO/FEFO, inventário cíclico por leitor de código de barras/QR e sugestão automática de compra por ponto de pedido."
      fase={3}
    />
  );
}
