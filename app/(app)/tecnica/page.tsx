import { Stethoscope } from "lucide-react";
import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function TecnicaPage() {
  await requireModuleAccess("tecnica.visitas");
  return (
    <PlaceholderModule
      titulo="Assistência Técnica"
      icon={Stethoscope}
      fase={1}
      descricao="O diferencial da Biogreen, registrado e mensurável — não mais em planilha ou na memória do técnico."
      funcionalidades={[
        "Agenda de visitas técnicas por cliente e técnico, com roteiro",
        "Check-in por foto e geolocalização direto do celular/tablet em campo",
        "Relatório de visita com parâmetros medidos (pH, dosagem, retenção...) e recomendações, gerando PDF para o cliente",
        "Testes industriais com planejamento, resultado e decisão — aprovado vira proposta automaticamente",
        "Base de conhecimento técnica por aplicação (papel, celulose, água)",
        "Histórico técnico completo por cliente, acessível em qualquer visita futura",
      ]}
    />
  );
}
