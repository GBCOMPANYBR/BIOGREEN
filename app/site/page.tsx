import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Sobre } from "@/components/site/sobre";
import { Segmentos } from "@/components/site/segmentos";
import { Diferenciais } from "@/components/site/diferenciais";
import { Contato } from "@/components/site/contato";
import { SiteFooter } from "@/components/site/footer";

export default function SitePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Sobre />
        <Segmentos />
        <Diferenciais />
        <Contato />
      </main>
      <SiteFooter />
    </>
  );
}
