import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function ComprasPage() {
  await requireModuleAccess("compras.pedidos");
  return (
    <PlaceholderModule
      titulo="Compras"
      descricao="Requisição, cotação com fornecedores, pedido de compra, recebimento e conferência — incluindo custos de importação e câmbio."
      fase={3}
    />
  );
}
