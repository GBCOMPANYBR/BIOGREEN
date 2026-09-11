import { requireModuleAccess } from "@/lib/nav-visibility";
import { PlaceholderModule } from "@/components/layout/placeholder-module";

export default async function FiscalPage() {
  await requireModuleAccess("fiscal.notas");
  return (
    <PlaceholderModule
      titulo="Fiscal"
      descricao="Emissão de NF-e/NFS-e via adapter de provedor, cálculo de impostos parametrizável e portal do contador."
      fase={2}
    />
  );
}
