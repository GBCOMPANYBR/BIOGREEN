import { Users } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function PessoasPage() {
  await requireModuleAccess("pessoas.tarefas");
  return (
    <PlaceholderModule
      titulo="Pessoas e Tarefas"
      icon={Users}
      fase={4}
      descricao="Quem faz o quê, com que treinamento e até quando — e tarefas que não se perdem em grupo de WhatsApp."
      funcionalidades={[
        "Cadastro de colaboradores por setor, escala e EPIs entregues",
        "Treinamentos e certificados com validade (NR-20, NR-35...) e alerta de vencimento",
        "Tarefas e projetos internos em kanban, vinculáveis a qualquer registro do sistema (cliente, lote, NF, pedido)",
      ]}
    />
  );
}
