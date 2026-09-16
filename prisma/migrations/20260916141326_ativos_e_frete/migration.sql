-- AlterTable
ALTER TABLE "Expedicao" ADD COLUMN     "valorFrete" DECIMAL(18,2);

-- CreateTable
CREATE TABLE "Ativo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "fornecedorId" INTEGER,
    "numeroSerie" TEXT,
    "dataAquisicao" TIMESTAMP(3),
    "valorAquisicao" DECIMAL(18,2),
    "localizacao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "vidaUtilAnos" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Ativo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ativo" ADD CONSTRAINT "Ativo_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
