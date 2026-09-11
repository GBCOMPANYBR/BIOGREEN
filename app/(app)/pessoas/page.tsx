import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function PessoasPage() {
  await requireModuleAccess("pessoas.tarefas");
  return (
    <PlaceholderModule
      titulo="Pessoas e Tarefas"
      descricao="Colaboradores, EPIs, treinamentos com validade (NR-20, NR-35...) e tarefas vinculáveis a qualquer registro do sistema."
      fase={4}
    />
  );
}
