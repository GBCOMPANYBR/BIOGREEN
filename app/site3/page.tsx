import { Nav } from "@/components/site3/nav";
import { Capa } from "@/components/site3/capa";
import { Sobre } from "@/components/site3/sobre";
import { Segmentos } from "@/components/site3/segmentos";
import { Diferenciais } from "@/components/site3/diferenciais";
import { Contato } from "@/components/site3/contato";
import { Footer } from "@/components/site3/footer";

export default function Site3Page() {
  return (
    <>
      <Nav />
      <main>
        <Capa />
        <Sobre />
        <Segmentos />
        <Diferenciais />
        <Contato />
      </main>
      <Footer />
    </>
  );
}
