import { ShoppingCart } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function ComprasPage() {
  await requireModuleAccess("compras.pedidos");
  return (
    <PlaceholderModule
      titulo="Compras"
      icon={ShoppingCart}
      fase={3}
      descricao="Da requisição ao pagamento, incluindo o que entra de fora — câmbio e nacionalização inclusos."
      funcionalidades={[
        "Requisição de compra → cotação com fornecedores → pedido → recebimento → conferência",
        "Geração automática de contas a pagar a partir do pedido de compra recebido",
        "Compras internacionais com moeda, câmbio do dia e custos de nacionalização",
        "Histórico de preço e desempenho por fornecedor",
      ]}
    />
  );
}
