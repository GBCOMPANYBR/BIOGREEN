import { Brain } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function CerebroPage() {
  await requireModuleAccess("cerebro.chat");
  return (
    <PlaceholderModule
      titulo="Cérebro (IA)"
      icon={Brain}
      fase={4}
      descricao="Uma pergunta em português, uma resposta com base nos dados reais da empresa — com a permissão de quem pergunta."
      funcionalidades={[
        'Chat interno: "quanto vendemos de PAC para o cliente X em 2026?", "quais lotes vencem em 30 dias?"',
        "Respostas sempre respeitando a permissão de quem está perguntando",
        "Resumo diário automático por setor",
        "Sugestões proativas (cliente que reduziu consumo, matéria-prima a repor, título vencendo, laudo pendente)",
        "Toda ação que altera dados exige confirmação humana e fica registrada na auditoria",
      ]}
    />
  );
}
