import { Wallet } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function FinanceiroPage() {
  await requireModuleAccess("financeiro.contasReceber");
  return (
    <PlaceholderModule
      titulo="Financeiro"
      icon={Wallet}
      fase={2}
      descricao="Caixa, contas e margem — visíveis em tempo real, sem esperar o fim do mês. Substitui o Conta Azul."
      funcionalidades={[
        "Contas a receber e a pagar geradas automaticamente pelos outros módulos",
        "Conciliação bancária por importação de OFX",
        "Boletos e PIX via API bancária, com régua de cobrança automática",
        "Fluxo de caixa realizado e projetado (30/60/90 dias) e DRE gerencial por segmento e por cliente",
        "Margem por produto e por lote, curva ABC de clientes e produtos",
        "Aprovação por alçada para pagamentos acima de um valor configurável",
        "Importador de clientes, fornecedores, títulos e plano de contas vindos do Conta Azul",
      ]}
    />
  );
}
