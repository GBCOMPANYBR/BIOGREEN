-- AlterTable
ALTER TABLE "ContaPagar" ADD COLUMN     "notaFiscalEntradaId" INTEGER;

-- AlterTable
ALTER TABLE "NotaFiscalEntrada" ADD COLUMN     "dataEmissao" TIMESTAMP(3),
ADD COLUMN     "serie" TEXT,
ADD COLUMN     "valorTotal" DECIMAL(18,2);

-- CreateIndex
CREATE UNIQUE INDEX "ContaPagar_notaFiscalEntradaId_key" ON "ContaPagar"("notaFiscalEntradaId");

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_notaFiscalEntradaId_fkey" FOREIGN KEY ("notaFiscalEntradaId") REFERENCES "NotaFiscalEntrada"("id") ON DELETE SET NULL ON UPDATE CASCADE;
