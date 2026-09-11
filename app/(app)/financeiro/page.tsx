import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function FinanceiroPage() {
  await requireModuleAccess("financeiro.contasReceber");
  return (
    <PlaceholderModule
      titulo="Financeiro"
      descricao="Contas a receber e a pagar, conciliação bancária (OFX), fluxo de caixa, DRE gerencial e curva ABC de clientes e produtos."
      fase={2}
    />
  );
}
