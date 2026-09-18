import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate, formatNumber } from "@/lib/format";
import { PrintButton } from "@/components/laudo/print-button";

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-foreground/20 px-2 py-1">
      <span className="shrink-0 text-xs font-bold uppercase">{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default async function LaudoPage({ params }: { params: Promise<{ loteId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { loteId } = await params;
  const lote = await prisma.lote.findUnique({
    where: { id: Number(loteId) },
    include: {
      produto: true,
      coaDocumentos: { orderBy: { geradoEm: "desc" }, take: 1, include: { cliente: true, emitidoPor: true } },
      analises: { include: { especificacao: true }, orderBy: { id: "asc" } },
    },
  });
  if (!lote || lote.coaDocumentos.length === 0) notFound();

  const coa = lote.coaDocumentos[0];
  const empresa = await prisma.empresa.findFirstOrThrow();
  const reprovado = lote.analises.some((a) => !a.aprovado);

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-black print:p-0">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="border border-foreground/40 p-6 print:border-0">
        <div className="flex items-start justify-between">
          <Image src="/logo-biogreen.jpg" alt="Biogreen" width={140} height={68} className="h-auto w-32" />
          <span className="text-right text-[10px] leading-tight">
            FRM-004
            <br />
            REV: 00
          </span>
        </div>

        <h1 className="mt-2 text-center text-xl font-bold tracking-wide">CERTIFICADO DE ANÁLISE</h1>

        <div className="mt-6 border border-foreground/40">
          <div className="bg-foreground/10 px-2 py-1 text-xs font-bold uppercase">Identificação do cliente</div>
          <Campo label="Nome / Razão social" value={coa.cliente?.razaoSocial ?? "—"} />
          <Campo label="Endereço" value={coa.cliente?.endereco ?? "—"} />
          <div className="grid grid-cols-3">
            <Campo label="Bairro" value={coa.cliente?.bairro ?? "—"} />
            <Campo label="Cidade" value={coa.cliente?.cidade ? `${coa.cliente.cidade}${coa.cliente.uf ? `/${coa.cliente.uf}` : ""}` : "—"} />
            <Campo label="CEP" value={coa.cliente?.cep ?? "—"} />
          </div>
        </div>

        <div className="mt-4 border border-foreground/40">
          <div className="bg-foreground/10 px-2 py-1 text-xs font-bold uppercase">Identificação do produto</div>
          <div className="grid grid-cols-2">
            <Campo label="Emissão" value={formatDate(coa.geradoEm)} />
            <Campo label="Embalagem" value="—" />
          </div>
          <div className="grid grid-cols-2">
            <Campo label="Nome do produto" value={lote.produto.nomeComercial} />
            <Campo label="Lote" value={lote.numeroLote} />
          </div>
          <div className="grid grid-cols-2">
            <Campo label="Data de fabricação" value={lote.dataFabricacao ? formatDate(lote.dataFabricacao) : "—"} />
            <Campo label="Validade" value={lote.dataValidade ? formatDate(lote.dataValidade) : "—"} />
          </div>
        </div>

        <div className="mt-4 border border-foreground/40">
          <div className="bg-foreground/10 px-2 py-1 text-xs font-bold uppercase">Propriedades físico-químicas</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-foreground/40 [&_th]:border-r [&_th]:border-foreground/40 [&_th]:px-2 [&_th]:py-1 [&_th:last-child]:border-r-0">
                <th className="text-left">Parâmetro</th>
                <th>Unidade</th>
                <th>Especificação</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {lote.analises.map((a) => {
                const esp = a.especificacao;
                const isTexto = esp.minimo === null && esp.maximo === null;
                const especTexto = isTexto
                  ? "—"
                  : `${esp.minimo !== null ? formatNumber(esp.minimo, 2) : "—"} - ${esp.maximo !== null ? formatNumber(esp.maximo, 2) : "—"}`;
                return (
                  <tr key={a.id} className="border-b border-foreground/20 [&_td]:border-r [&_td]:border-foreground/20 [&_td]:px-2 [&_td]:py-1 [&_td:last-child]:border-r-0">
                    <td>{esp.parametro}</td>
                    <td className="text-center">{esp.unidade ?? "—"}</td>
                    <td className="text-center">{especTexto}</td>
                    <td className="text-center font-semibold">
                      {a.resultadoTexto ?? (a.valorMedido !== null ? formatNumber(a.valorMedido, 2) : "—")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border border-foreground/40">
          <div className="bg-foreground/10 px-2 py-1 text-xs font-bold uppercase">Conclusão</div>
          <p className="px-2 py-3 text-sm">
            {reprovado
              ? "Produto REPROVADO — um ou mais parâmetros medidos ficaram fora da especificação indicada acima."
              : "Produto aprovado de acordo com os resultados acima, sem qualquer restrição de uso para a aplicação indicada."}
          </p>
        </div>

        <div className="mt-4 border border-foreground/40">
          <div className="bg-foreground/10 px-2 py-1 text-xs font-bold uppercase">Observações</div>
          <p className="px-2 py-3 text-xs text-foreground/70">
            {coa.emitidoPor ? `Laudo emitido por ${coa.emitidoPor.nome}. ` : ""}
            Laudo emitido eletronicamente, dispensa assinatura.
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-foreground/70">
          Endereço: {empresa.endereco ?? "—"}
          {empresa.cidade ? ` - ${empresa.cidade}${empresa.uf ? `/${empresa.uf}` : ""}` : ""}
          {empresa.cep ? ` CEP ${empresa.cep}` : ""}
        </p>
      </div>
    </div>
  );
}
