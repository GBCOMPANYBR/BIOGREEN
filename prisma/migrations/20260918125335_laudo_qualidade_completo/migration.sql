-- AlterTable
ALTER TABLE "AnaliseLote" ADD COLUMN     "resultadoTexto" TEXT,
ALTER COLUMN "valorMedido" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "uf" TEXT;

-- AlterTable
ALTER TABLE "CoaDocumento" ADD COLUMN     "clienteId" INTEGER,
ADD COLUMN     "emitidoPorId" INTEGER;

-- AlterTable
ALTER TABLE "Especificacao" ADD COLUMN     "unidade" TEXT;

-- AddForeignKey
ALTER TABLE "CoaDocumento" ADD CONSTRAINT "CoaDocumento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoaDocumento" ADD CONSTRAINT "CoaDocumento_emitidoPorId_fkey" FOREIGN KEY ("emitidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
