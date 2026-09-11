import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function TecnicaPage() {
  await requireModuleAccess("tecnica.visitas");
  return (
    <PlaceholderModule
      titulo="Assistência Técnica"
      descricao="Agenda de visitas técnicas com check-in por foto/geolocalização, relatórios de visita, testes industriais e base de conhecimento técnica."
      fase={1}
    />
  );
}
