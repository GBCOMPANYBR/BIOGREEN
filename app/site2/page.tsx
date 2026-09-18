import { Masthead } from "@/components/site2/masthead";
import { Abertura } from "@/components/site2/abertura";
import { QuemSomos } from "@/components/site2/quem-somos";
import { Segmentos } from "@/components/site2/segmentos";
import { Diferenciais } from "@/components/site2/diferenciais";
import { Contato } from "@/components/site2/contato";
import { Footer } from "@/components/site2/footer";

export default function Site2Page() {
  return (
    <>
      <Masthead />
      <main>
        <Abertura />
        <QuemSomos />
        <Segmentos />
        <Diferenciais />
        <Contato />
      </main>
      <Footer />
    </>
  );
}
