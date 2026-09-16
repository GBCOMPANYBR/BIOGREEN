import { ShieldCheck } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function GovernancaPage() {
  await requireModuleAccess("governanca.fechamento");
  return (
    <PlaceholderModule
      titulo="Prestação de Contas / Governança"
      icon={ShieldCheck}
      fase={4}
      descricao="A visão que a diretoria precisa, pronta sem precisar pedir pra ninguém montar."
      funcionalidades={[
        "Fechamento mensal com checklist por setor e travamento do período",
        "Relatório de prestação de contas para os sócios: resultado, caixa, estoque valorizado, carteira, produção e inadimplência",
        "Tela executiva com comparativo mês a mês, em PDF ou na tela",
        "Indicadores (KPIs) por setor, com metas e semáforos",
        "Trilha de auditoria consultável — quem alterou o quê e quando, em qualquer registro sensível",
      ]}
    />
  );
}
