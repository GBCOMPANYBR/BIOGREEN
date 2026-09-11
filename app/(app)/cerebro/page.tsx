import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function CerebroPage() {
  await requireModuleAccess("cerebro.chat");
  return (
    <PlaceholderModule
      titulo="Cérebro (IA)"
      descricao="Chat interno conectado aos dados da empresa, com permissão do usuário, resumo diário automático por setor e sugestões proativas."
      fase={4}
    />
  );
}
