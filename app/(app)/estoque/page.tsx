import { Warehouse } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function EstoquePage() {
  await requireModuleAccess("estoque.movimentos");
  return (
    <PlaceholderModule
      titulo="Estoque"
      icon={Warehouse}
      fase={3}
      descricao="Saber exatamente o que tem, onde tem e até quando serve — sem contagem manual de última hora."
      funcionalidades={[
        "Estoque por local (matéria-prima, produção, produto acabado, quarentena, consignação) e por lote",
        "Controle de validade com FIFO/FEFO automático",
        "Entradas por XML de nota fiscal, saídas por venda/produção, transferências e perdas",
        "Inventário cíclico com leitor de código de barras/QR e etiquetas geradas pelo próprio sistema",
        "Estoque mínimo e ponto de pedido calculados pelo consumo real, com sugestão automática de compra",
      ]}
    />
  );
}
