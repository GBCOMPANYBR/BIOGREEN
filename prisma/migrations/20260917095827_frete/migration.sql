-- AlterTable
ALTER TABLE "NotaFiscalEntrada" ADD COLUMN "tipoFrete" TEXT;

-- CreateTable
CREATE TABLE "Frete" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "pedidoVendaId" INTEGER,
    "notaFiscalEntradaId" INTEGER,
    "local" TEXT,
    "transportadora" TEXT,
    "tipoCarroceria" TEXT,
    "quantidadeKg" DECIMAL(18,3),
    "descricaoItens" TEXT,
    "notasFiscais" TEXT,
    "dataFrete" TIMESTAMP(3),
    "valorFrete" DECIMAL(18,2),
    "centroCusto" TEXT,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AGUARDANDO_COTACAO',
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Frete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Frete_pedidoVendaId_idx" ON "Frete"("pedidoVendaId");

-- CreateIndex
CREATE INDEX "Frete_notaFiscalEntradaId_idx" ON "Frete"("notaFiscalEntradaId");

-- AddForeignKey
ALTER TABLE "Frete" ADD CONSTRAINT "Frete_pedidoVendaId_fkey" FOREIGN KEY ("pedidoVendaId") REFERENCES "PedidoVenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frete" ADD CONSTRAINT "Frete_notaFiscalEntradaId_fkey" FOREIGN KEY ("notaFiscalEntradaId") REFERENCES "NotaFiscalEntrada"("id") ON DELETE SET NULL ON UPDATE CASCADE;
