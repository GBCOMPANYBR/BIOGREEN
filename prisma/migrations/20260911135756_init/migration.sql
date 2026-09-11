-- CreateEnum
CREATE TYPE "Segmento" AS ENUM ('PAPEL_CARTAO', 'CELULOSE', 'TRATAMENTO_AGUA');

-- CreateEnum
CREATE TYPE "FormaProduto" AS ENUM ('PO', 'EMULSAO', 'LIQUIDO', 'GEL', 'OUTRO');

-- CreateEnum
CREATE TYPE "OrigemProduto" AS ENUM ('FABRICADO', 'REVENDIDO', 'MISTURA_CUSTOMIZADA');

-- CreateEnum
CREATE TYPE "EtapaOportunidade" AS ENUM ('LEAD', 'VISITA_TECNICA', 'TESTE_INDUSTRIAL', 'PROPOSTA', 'NEGOCIACAO', 'GANHO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "StatusProposta" AS ENUM ('RASCUNHO', 'AGUARDANDO_APROVACAO', 'APROVADA', 'ENVIADA', 'ACEITA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "StatusPedidoVenda" AS ENUM ('PENDENTE', 'APROVADO', 'EM_PRODUCAO', 'FATURADO', 'EXPEDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "BaseComissao" AS ENUM ('FATURADO', 'RECEBIDO');

-- CreateEnum
CREATE TYPE "StatusComissao" AS ENUM ('PENDENTE', 'PAGA');

-- CreateEnum
CREATE TYPE "StatusVisita" AS ENUM ('AGENDADA', 'REALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "DecisaoTeste" AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "AplicacaoConhecimento" AS ENUM ('PAPEL', 'CELULOSE', 'AGUA');

-- CreateEnum
CREATE TYPE "TipoEquipamento" AS ENUM ('REATOR', 'MISTURADOR', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusOrdemProducao" AS ENUM ('PLANEJADA', 'EM_PRODUCAO', 'CONTROLE_QUALIDADE', 'APROVADA', 'REPROVADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "StatusInspecao" AS ENUM ('APROVADO', 'BLOQUEADO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "OrigemNaoConformidade" AS ENUM ('CLIENTE', 'INTERNA');

-- CreateEnum
CREATE TYPE "StatusNaoConformidade" AS ENUM ('ABERTA', 'EM_ANALISE', 'ACAO_CORRETIVA', 'FECHADA');

-- CreateEnum
CREATE TYPE "TipoLocalEstoque" AS ENUM ('ALMOXARIFADO_MP', 'PRODUCAO', 'PRODUTO_ACABADO', 'QUARENTENA', 'CLIENTE_CONSIGNACAO');

-- CreateEnum
CREATE TYPE "TipoMovimentoEstoque" AS ENUM ('ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'PERDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "StatusPedidoCompra" AS ENUM ('RASCUNHO', 'ENVIADO', 'CONFIRMADO', 'RECEBIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoNotaFiscal" AS ENUM ('VENDA', 'REMESSA', 'DEVOLUCAO', 'COMPLEMENTAR', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "StatusNotaFiscal" AS ENUM ('RASCUNHO', 'AUTORIZADA', 'CANCELADA', 'INUTILIZADA');

-- CreateEnum
CREATE TYPE "TipoPlanoContas" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "StatusTitulo" AS ENUM ('ABERTO', 'PARCIAL', 'PAGO', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoAlcada" AS ENUM ('PAGAMENTO', 'PROPOSTA', 'COMPRA');

-- CreateEnum
CREATE TYPE "StatusAlcada" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "StatusFechamento" AS ENUM ('ABERTO', 'FECHADO');

-- CreateEnum
CREATE TYPE "StatusExpedicao" AS ENUM ('SEPARACAO', 'CONFERIDO', 'EXPEDIDO', 'ENTREGUE');

-- CreateEnum
CREATE TYPE "StatusTarefa" AS ENUM ('A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "RoleChat" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "StatusSugestao" AS ENUM ('NOVA', 'VISTA', 'DESCARTADA');

-- CreateEnum
CREATE TYPE "StatusJob" AS ENUM ('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'FALHOU');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "site" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidade" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setor" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cargo" (
    "id" SERIAL NOT NULL,
    "setorId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissao" (
    "id" SERIAL NOT NULL,
    "cargoId" INTEGER NOT NULL,
    "recurso" TEXT NOT NULL,
    "podeVer" BOOLEAN NOT NULL DEFAULT false,
    "podeCriar" BOOLEAN NOT NULL DEFAULT false,
    "podeEditar" BOOLEAN NOT NULL DEFAULT false,
    "podeAprovar" BOOLEAN NOT NULL DEFAULT false,
    "podeExcluir" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "cargoId" INTEGER,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "ultimoLoginEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadeMedida" (
    "id" SERIAL NOT NULL,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeBaseId" INTEGER,
    "fatorConversaoBase" DECIMAL(18,6),

    CONSTRAINT "UnidadeMedida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Embalagem" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeMedidaId" INTEGER NOT NULL,
    "capacidade" DECIMAL(18,3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Embalagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "clienteMatrizId" INTEGER,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpjCpf" TEXT NOT NULL,
    "segmento" "Segmento" NOT NULL,
    "condicoesComerciais" TEXT,
    "vendedorId" INTEGER,
    "tecnicoId" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteContato" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ClienteContato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpjCpf" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Brasil',
    "contato" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transportadora" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Transportadora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MateriaPrima" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeMedidaId" INTEGER NOT NULL,
    "fornecedorPadraoId" INTEGER,
    "custoMedio" DECIMAL(18,4),
    "estoqueMinimo" DECIMAL(18,3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MateriaPrima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "nomeComercial" TEXT NOT NULL,
    "familia" TEXT,
    "forma" "FormaProduto" NOT NULL DEFAULT 'LIQUIDO',
    "densidade" DECIMAL(10,4),
    "concentracao" DECIMAL(6,3),
    "ncm" TEXT,
    "cest" TEXT,
    "classificacaoOnu" TEXT,
    "fispqUrl" TEXT,
    "fispqValidade" TIMESTAMP(3),
    "fichaTecnicaUrl" TEXT,
    "produtoControlado" BOOLEAN NOT NULL DEFAULT false,
    "numeroLicenca" TEXT,
    "licencaVencimento" TIMESTAMP(3),
    "shelfLifeDias" INTEGER,
    "condicoesArmazenagem" TEXT,
    "origem" "OrigemProduto" NOT NULL DEFAULT 'FABRICADO',
    "segmento" "Segmento" NOT NULL,
    "unidadeMedidaId" INTEGER NOT NULL,
    "clienteExclusivoId" INTEGER,
    "precoBase" DECIMAL(18,4),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TabelaPreco" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER,
    "segmento" "Segmento",
    "produtoId" INTEGER NOT NULL,
    "preco" DECIMAL(18,4) NOT NULL,
    "vigenciaInicio" TIMESTAMP(3) NOT NULL,
    "vigenciaFim" TIMESTAMP(3),

    CONSTRAINT "TabelaPreco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oportunidade" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "etapa" "EtapaOportunidade" NOT NULL DEFAULT 'LEAD',
    "motivoPerda" TEXT,
    "valorEstimado" DECIMAL(18,2),
    "dataAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFechamento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Oportunidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposta" (
    "id" SERIAL NOT NULL,
    "oportunidadeId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "status" "StatusProposta" NOT NULL DEFAULT 'RASCUNHO',
    "validadeAte" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "aprovadoPorId" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropostaItem" (
    "id" SERIAL NOT NULL,
    "propostaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" DECIMAL(18,3) NOT NULL,
    "precoUnitario" DECIMAL(18,4) NOT NULL,
    "margemPercentual" DECIMAL(6,3),

    CONSTRAINT "PropostaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoVenda" (
    "id" SERIAL NOT NULL,
    "propostaId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "StatusPedidoVenda" NOT NULL DEFAULT 'PENDENTE',
    "condicaoPagamento" TEXT,
    "freteTipo" TEXT,
    "dataPrometida" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PedidoVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoVendaItem" (
    "id" SERIAL NOT NULL,
    "pedidoVendaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" DECIMAL(18,3) NOT NULL,
    "precoUnitario" DECIMAL(18,4) NOT NULL,
    "loteId" INTEGER,

    CONSTRAINT "PedidoVendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoFornecimento" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "consumoMensalPrevisto" DECIMAL(18,3) NOT NULL,
    "alertaReposicaoDias" INTEGER NOT NULL DEFAULT 7,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContratoFornecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" SERIAL NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "pedidoVendaId" INTEGER NOT NULL,
    "percentual" DECIMAL(6,3) NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,
    "baseCalculo" "BaseComissao" NOT NULL DEFAULT 'FATURADO',
    "status" "StatusComissao" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaComercial" (
    "id" SERIAL NOT NULL,
    "vendedorId" INTEGER,
    "segmento" "Segmento",
    "periodo" TEXT NOT NULL,
    "valorMeta" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "MetaComercial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitaTecnica" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,
    "dataAgendada" TIMESTAMP(3) NOT NULL,
    "status" "StatusVisita" NOT NULL DEFAULT 'AGENDADA',
    "roteiro" TEXT,
    "checkinLat" DECIMAL(10,7),
    "checkinLng" DECIMAL(10,7),
    "checkinFotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitaTecnica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatorioVisita" (
    "id" SERIAL NOT NULL,
    "visitaTecnicaId" INTEGER NOT NULL,
    "parametrosMedidos" JSONB NOT NULL,
    "produtosAplicados" JSONB NOT NULL,
    "recomendacoes" TEXT,
    "proximaAcao" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatorioVisita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TesteIndustrial" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "oportunidadeId" INTEGER,
    "planejamento" TEXT,
    "resultado" TEXT,
    "decisao" "DecisaoTeste" NOT NULL DEFAULT 'PENDENTE',
    "dataPlanejada" TIMESTAMP(3),
    "dataResultado" TIMESTAMP(3),

    CONSTRAINT "TesteIndustrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtigoConhecimento" (
    "id" SERIAL NOT NULL,
    "aplicacao" "AplicacaoConhecimento" NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtigoConhecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formula" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "rendimento" DECIMAL(18,3),
    "ordemAdicao" JSONB,
    "tempoMinutos" INTEGER,
    "temperatura" DECIMAL(6,2),
    "epi" TEXT,
    "instrucoes" TEXT,
    "clienteId" INTEGER,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaItem" (
    "id" SERIAL NOT NULL,
    "formulaId" INTEGER NOT NULL,
    "materiaPrimaId" INTEGER NOT NULL,
    "quantidade" DECIMAL(18,4) NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FormulaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoEquipamento" NOT NULL,
    "capacidade" DECIMAL(18,3),
    "proximaManutencao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManutencaoEquipamento" (
    "id" SERIAL NOT NULL,
    "equipamentoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataRealizada" TIMESTAMP(3),
    "dataProxima" TIMESTAMP(3),
    "observacoes" TEXT,

    CONSTRAINT "ManutencaoEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemProducao" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "pedidoVendaId" INTEGER,
    "pedidoVendaItemId" INTEGER,
    "formulaId" INTEGER NOT NULL,
    "equipamentoId" INTEGER,
    "status" "StatusOrdemProducao" NOT NULL DEFAULT 'PLANEJADA',
    "quantidadePlanejada" DECIMAL(18,3) NOT NULL,
    "quantidadeReal" DECIMAL(18,3),
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdemProducao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" SERIAL NOT NULL,
    "numeroLote" TEXT NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "ordemProducaoId" INTEGER,
    "quantidade" DECIMAL(18,3) NOT NULL,
    "dataFabricacao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoteConsumo" (
    "id" SERIAL NOT NULL,
    "loteProduzidoId" INTEGER NOT NULL,
    "loteMateriaPrimaId" INTEGER NOT NULL,
    "quantidade" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "LoteConsumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustoLote" (
    "id" SERIAL NOT NULL,
    "loteId" INTEGER NOT NULL,
    "custoMateriaPrima" DECIMAL(18,2) NOT NULL,
    "custoEmbalagem" DECIMAL(18,2) NOT NULL,
    "custoMaoObra" DECIMAL(18,2) NOT NULL,
    "custoEnergiaRateada" DECIMAL(18,2) NOT NULL,
    "custoTotal" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "CustoLote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especificacao" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "parametro" TEXT NOT NULL,
    "minimo" DECIMAL(18,4),
    "maximo" DECIMAL(18,4),
    "metodo" TEXT,

    CONSTRAINT "Especificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnaliseLote" (
    "id" SERIAL NOT NULL,
    "loteId" INTEGER NOT NULL,
    "especificacaoId" INTEGER NOT NULL,
    "valorMedido" DECIMAL(18,4) NOT NULL,
    "aprovado" BOOLEAN NOT NULL,
    "analistaId" INTEGER,
    "dataAnalise" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnaliseLote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoaDocumento" (
    "id" SERIAL NOT NULL,
    "loteId" INTEGER NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoaDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspecaoRecebimento" (
    "id" SERIAL NOT NULL,
    "materiaPrimaId" INTEGER NOT NULL,
    "fornecedorId" INTEGER NOT NULL,
    "numeroLoteFornecedor" TEXT,
    "status" "StatusInspecao" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspecaoRecebimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NaoConformidade" (
    "id" SERIAL NOT NULL,
    "origem" "OrigemNaoConformidade" NOT NULL,
    "descricao" TEXT NOT NULL,
    "loteId" INTEGER,
    "clienteId" INTEGER,
    "status" "StatusNaoConformidade" NOT NULL DEFAULT 'ABERTA',
    "acao8D" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NaoConformidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalEstoque" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoLocalEstoque" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LocalEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstoqueMovimento" (
    "id" SERIAL NOT NULL,
    "localEstoqueId" INTEGER NOT NULL,
    "produtoId" INTEGER,
    "materiaPrimaId" INTEGER,
    "loteId" INTEGER,
    "tipo" "TipoMovimentoEstoque" NOT NULL,
    "quantidade" DECIMAL(18,3) NOT NULL,
    "motivo" TEXT,
    "referenciaTipo" TEXT,
    "referenciaId" INTEGER,
    "createdById" INTEGER,
    "dataMovimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstoqueMovimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventarioCiclico" (
    "id" SERIAL NOT NULL,
    "localEstoqueId" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',

    CONSTRAINT "InventarioCiclico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoCompra" (
    "id" SERIAL NOT NULL,
    "fornecedorId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "StatusPedidoCompra" NOT NULL DEFAULT 'RASCUNHO',
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "cambio" DECIMAL(12,6),
    "custosNacionalizacao" DECIMAL(18,2),
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoCompraItem" (
    "id" SERIAL NOT NULL,
    "pedidoCompraId" INTEGER NOT NULL,
    "materiaPrimaId" INTEGER NOT NULL,
    "quantidade" DECIMAL(18,3) NOT NULL,
    "precoUnitario" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "PedidoCompraItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoNotaFiscal" NOT NULL,
    "pedidoVendaId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "loteId" INTEGER,
    "numero" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "chaveAcesso" TEXT,
    "xmlUrl" TEXT,
    "danfeUrl" TEXT,
    "status" "StatusNotaFiscal" NOT NULL DEFAULT 'RASCUNHO',
    "valorTotal" DECIMAL(18,2) NOT NULL,
    "impostos" JSONB,
    "emitidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscalEntrada" (
    "id" SERIAL NOT NULL,
    "pedidoCompraId" INTEGER,
    "fornecedorId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "chaveAcesso" TEXT,
    "xmlUrl" TEXT,
    "manifestacao" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaFiscalEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoFiscal" (
    "id" SERIAL NOT NULL,
    "ncm" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "regime" TEXT NOT NULL,
    "aliquota" DECIMAL(6,3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaBancaria" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    "saldoInicial" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CentroCusto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "setorId" INTEGER,

    CONSTRAINT "CentroCusto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoContas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoPlanoContas" NOT NULL,
    "centroCustoId" INTEGER,

    CONSTRAINT "PlanoContas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "pedidoVendaId" INTEGER,
    "notaFiscalId" INTEGER,
    "planoContasId" INTEGER,
    "valor" DECIMAL(18,2) NOT NULL,
    "valorPago" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusTitulo" NOT NULL DEFAULT 'ABERTO',
    "dataBaixa" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" SERIAL NOT NULL,
    "fornecedorId" INTEGER NOT NULL,
    "pedidoCompraId" INTEGER,
    "planoContasId" INTEGER,
    "valor" DECIMAL(18,2) NOT NULL,
    "valorPago" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "StatusTitulo" NOT NULL DEFAULT 'ABERTO',
    "dataBaixa" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaPagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConciliacaoBancaria" (
    "id" SERIAL NOT NULL,
    "contaBancariaId" INTEGER NOT NULL,
    "ofxImportadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itens" JSONB NOT NULL,

    CONSTRAINT "ConciliacaoBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AprovacaoAlcada" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoAlcada" NOT NULL,
    "contaPagarId" INTEGER,
    "referenciaId" INTEGER NOT NULL,
    "valorLimite" DECIMAL(18,2) NOT NULL,
    "aprovadorId" INTEGER,
    "status" "StatusAlcada" NOT NULL DEFAULT 'PENDENTE',
    "aprovadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AprovacaoAlcada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FechamentoMensal" (
    "id" SERIAL NOT NULL,
    "periodo" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "status" "StatusFechamento" NOT NULL DEFAULT 'ABERTO',
    "fechadoPorId" INTEGER,
    "fechadoEm" TIMESTAMP(3),

    CONSTRAINT "FechamentoMensal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kpi" (
    "id" SERIAL NOT NULL,
    "setor" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "meta" DECIMAL(18,3) NOT NULL,
    "realizado" DECIMAL(18,3) NOT NULL,
    "periodo" TEXT NOT NULL,
    "semaforo" TEXT NOT NULL DEFAULT 'VERDE',

    CONSTRAINT "Kpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expedicao" (
    "id" SERIAL NOT NULL,
    "pedidoVendaId" INTEGER NOT NULL,
    "status" "StatusExpedicao" NOT NULL DEFAULT 'SEPARACAO',
    "transportadoraId" INTEGER,
    "romaneioUrl" TEXT,
    "dataAgendamento" TIMESTAMP(3),
    "comprovanteUrl" TEXT,
    "assinaturaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expedicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpedicaoVolume" (
    "id" SERIAL NOT NULL,
    "expedicaoId" INTEGER NOT NULL,
    "etiquetaCodigo" TEXT NOT NULL,
    "classificacaoOnu" TEXT,
    "pesoKg" DECIMAL(10,3),

    CONSTRAINT "ExpedicaoVolume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "nome" TEXT NOT NULL,
    "setorId" INTEGER,
    "cargoTexto" TEXT,
    "escala" TEXT,
    "epis" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treinamento" (
    "id" SERIAL NOT NULL,
    "colaboradorId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "dataRealizado" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3),
    "certificadoUrl" TEXT,

    CONSTRAINT "Treinamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavelId" INTEGER NOT NULL,
    "status" "StatusTarefa" NOT NULL DEFAULT 'A_FAZER',
    "prazo" TIMESTAMP(3),
    "entidadeTipo" TEXT,
    "entidadeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversa" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "titulo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatConversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMensagem" (
    "id" SERIAL NOT NULL,
    "conversaId" INTEGER NOT NULL,
    "role" "RoleChat" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "toolCalls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SugestaoProativa" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "entidadeTipo" TEXT,
    "entidadeId" INTEGER,
    "status" "StatusSugestao" NOT NULL DEFAULT 'NOVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SugestaoProativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" SERIAL NOT NULL,
    "entidadeTipo" TEXT NOT NULL,
    "entidadeId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "tamanho" INTEGER,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "StatusJob" NOT NULL DEFAULT 'PENDENTE',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Setor_empresaId_nome_key" ON "Setor"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Cargo_setorId_nome_key" ON "Cargo"("setorId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "Permissao_cargoId_recurso_key" ON "Permissao"("cargoId", "recurso");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE INDEX "AuditLog_entidade_entidadeId_idx" ON "AuditLog"("entidade", "entidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadeMedida_sigla_key" ON "UnidadeMedida"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cnpjCpf_key" ON "Cliente"("cnpjCpf");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpjCpf_key" ON "Fornecedor"("cnpjCpf");

-- CreateIndex
CREATE UNIQUE INDEX "Transportadora_cnpj_key" ON "Transportadora"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "MateriaPrima_codigo_key" ON "MateriaPrima"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_codigoInterno_key" ON "Produto"("codigoInterno");

-- CreateIndex
CREATE UNIQUE INDEX "Proposta_numero_key" ON "Proposta"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoVenda_propostaId_key" ON "PedidoVenda"("propostaId");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoVenda_numero_key" ON "PedidoVenda"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "RelatorioVisita_visitaTecnicaId_key" ON "RelatorioVisita"("visitaTecnicaId");

-- CreateIndex
CREATE UNIQUE INDEX "OrdemProducao_numero_key" ON "OrdemProducao"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_numeroLote_key" ON "Lote"("numeroLote");

-- CreateIndex
CREATE UNIQUE INDEX "CustoLote_loteId_key" ON "CustoLote"("loteId");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoCompra_numero_key" ON "PedidoCompra"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "NotaFiscal_chaveAcesso_key" ON "NotaFiscal"("chaveAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "NotaFiscal_numero_serie_key" ON "NotaFiscal"("numero", "serie");

-- CreateIndex
CREATE UNIQUE INDEX "NotaFiscalEntrada_chaveAcesso_key" ON "NotaFiscalEntrada"("chaveAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoFiscal_ncm_uf_regime_key" ON "ConfiguracaoFiscal"("ncm", "uf", "regime");

-- CreateIndex
CREATE UNIQUE INDEX "PlanoContas_codigo_key" ON "PlanoContas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "FechamentoMensal_periodo_setor_key" ON "FechamentoMensal"("periodo", "setor");

-- CreateIndex
CREATE UNIQUE INDEX "Expedicao_pedidoVendaId_key" ON "Expedicao"("pedidoVendaId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpedicaoVolume_etiquetaCodigo_key" ON "ExpedicaoVolume"("etiquetaCodigo");

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_usuarioId_key" ON "Colaborador"("usuarioId");

-- CreateIndex
CREATE INDEX "Anexo_entidadeTipo_entidadeId_idx" ON "Anexo"("entidadeTipo", "entidadeId");

-- AddForeignKey
ALTER TABLE "Unidade" ADD CONSTRAINT "Unidade_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setor" ADD CONSTRAINT "Setor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cargo" ADD CONSTRAINT "Cargo_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permissao" ADD CONSTRAINT "Permissao_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeMedida" ADD CONSTRAINT "UnidadeMedida_unidadeBaseId_fkey" FOREIGN KEY ("unidadeBaseId") REFERENCES "UnidadeMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Embalagem" ADD CONSTRAINT "Embalagem_unidadeMedidaId_fkey" FOREIGN KEY ("unidadeMedidaId") REFERENCES "UnidadeMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_clienteMatrizId_fkey" FOREIGN KEY ("clienteMatrizId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteContato" ADD CONSTRAINT "ClienteContato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriaPrima" ADD CONSTRAINT "MateriaPrima_unidadeMedidaId_fkey" FOREIGN KEY ("unidadeMedidaId") REFERENCES "UnidadeMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MateriaPrima" ADD CONSTRAINT "MateriaPrima_fornecedorPadraoId_fkey" FOREIGN KEY ("fornecedorPadraoId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_unidadeMedidaId_fkey" FOREIGN KEY ("unidadeMedidaId") REFERENCES "UnidadeMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_clienteExclusivoId_fkey" FOREIGN KEY ("clienteExclusivoId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TabelaPreco" ADD CONSTRAINT "TabelaPreco_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TabelaPreco" ADD CONSTRAINT "TabelaPreco_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oportunidade" ADD CONSTRAINT "Oportunidade_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropostaItem" ADD CONSTRAINT "PropostaItem_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropostaItem" ADD CONSTRAINT "PropostaItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVenda" ADD CONSTRAINT "PedidoVenda_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVenda" ADD CONSTRAINT "PedidoVenda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVendaItem" ADD CONSTRAINT "PedidoVendaItem_pedidoVendaId_fkey" FOREIGN KEY ("pedidoVendaId") REFERENCES "PedidoVenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVendaItem" ADD CONSTRAINT "PedidoVendaItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoVendaItem" ADD CONSTRAINT "PedidoVendaItem_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoFornecimento" ADD CONSTRAINT "ContratoFornecimento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoFornecimento" ADD CONSTRAINT "ContratoFornecimento_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_pedidoVendaId_fkey" FOREIGN KEY ("pedidoVendaId") REFERENCES "PedidoVenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitaTecnica" ADD CONSTRAINT "VisitaTecnica_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitaTecnica" ADD CONSTRAINT "VisitaTecnica_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatorioVisita" ADD CONSTRAINT "RelatorioVisita_visitaTecnicaId_fkey" FOREIGN KEY ("visitaTecnicaId") REFERENCES "VisitaTecnica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesteIndustrial" ADD CONSTRAINT "TesteIndustrial_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TesteIndustrial" ADD CONSTRAINT "TesteIndustrial_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formula" ADD CONSTRAINT "Formula_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formula" ADD CONSTRAINT "Formula_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaItem" ADD CONSTRAINT "FormulaItem_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaItem" ADD CONSTRAINT "FormulaItem_materiaPrimaId_fkey" FOREIGN KEY ("materiaPrimaId") REFERENCES "MateriaPrima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManutencaoEquipamento" ADD CONSTRAINT "ManutencaoEquipamento_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemProducao" ADD CONSTRAINT "OrdemProducao_pedidoVendaId_fkey" FOREIGN KEY ("pedidoVendaId") REFERENCES "PedidoVenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemProducao" ADD CONSTRAINT "OrdemProducao_pedidoVendaItemId_fkey" FOREIGN KEY ("pedidoVendaItemId") REFERENCES "PedidoVendaItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemProducao" ADD CONSTRAINT "OrdemProducao_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemProducao" ADD CONSTRAINT "OrdemProducao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_ordemProducaoId_fkey" FOREIGN KEY ("ordemProducaoId") REFERENCES "OrdemProducao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteConsumo" ADD CONSTRAINT "LoteConsumo_loteProduzidoId_fkey" FOREIGN KEY ("loteProduzidoId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteConsumo" ADD CONSTRAINT "LoteConsumo_loteMateriaPrimaId_fkey" FOREIGN KEY ("loteMateriaPrimaId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustoLote" ADD CONSTRAINT "CustoLote_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Especificacao" ADD CONSTRAINT "Especificacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnaliseLote" ADD CONSTRAINT "AnaliseLote_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnaliseLote" ADD CONSTRAINT "AnaliseLote_especificacaoId_fkey" FOREIGN KEY ("especificacaoId") REFERENCES "Especificacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoaDocumento" ADD CONSTRAINT "CoaDocumento_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspecaoRecebimento" ADD CONSTRAINT "InspecaoRecebimento_materiaPrimaId_fkey" FOREIGN KEY ("materiaPrimaId") REFERENCES "MateriaPrima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspecaoRecebimento" ADD CONSTRAINT "InspecaoRecebimento_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NaoConformidade" ADD CONSTRAINT "NaoConformidade_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NaoConformidade" ADD CONSTRAINT "NaoConformidade_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueMovimento" ADD CONSTRAINT "EstoqueMovimento_localEstoqueId_fkey" FOREIGN KEY ("localEstoqueId") REFERENCES "LocalEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueMovimento" ADD CONSTRAINT "EstoqueMovimento_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueMovimento" ADD CONSTRAINT "EstoqueMovimento_materiaPrimaId_fkey" FOREIGN KEY ("materiaPrimaId") REFERENCES "MateriaPrima"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueMovimento" ADD CONSTRAINT "EstoqueMovimento_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventarioCiclico" ADD CONSTRAINT "InventarioCiclico_localEstoqueId_fkey" FOREIGN KEY ("localEstoqueId") REFERENCES "LocalEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCompra" ADD CONSTRAINT "PedidoCompra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCompraItem" ADD CONSTRAINT "PedidoCompraItem_pedidoCompraId_fkey" FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoCompraItem" ADD CONSTRAINT "PedidoCompraItem_materiaPrimaId_fkey" FOREIGN KEY ("materiaPrimaId") REFERENCES "MateriaPrima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_pedidoVendaId_fkey" FOREIGN KEY ("pedidoVendaId") REFERENCES "PedidoVenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscalEntrada" ADD CONSTRAINT "NotaFiscalEntrada_pedidoCompraId_fkey" FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaFiscalEntrada" ADD CONSTRAINT "NotaFiscalEntrada_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoContas" ADD CONSTRAINT "PlanoContas_centroCustoId_fkey" FOREIGN KEY ("centroCustoId") REFERENCES "CentroCusto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_pedidoVendaId_fkey" FOREIGN KEY ("pedidoVendaId") REFERENCES "PedidoVenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_planoContasId_fkey" FOREIGN KEY ("planoContasId") REFERENCES "PlanoContas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_pedidoCompraId_fkey" FOREIGN KEY ("pedidoCompraId") REFERENCES "PedidoCompra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_planoContasId_fkey" FOREIGN KEY ("planoContasId") REFERENCES "PlanoContas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AprovacaoAlcada" ADD CONSTRAINT "AprovacaoAlcada_contaPagarId_fkey" FOREIGN KEY ("contaPagarId") REFERENCES "ContaPagar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedicao" ADD CONSTRAINT "Expedicao_pedidoVendaId_fkey" FOREIGN KEY ("pedidoVendaId") REFERENCES "PedidoVenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedicao" ADD CONSTRAINT "Expedicao_transportadoraId_fkey" FOREIGN KEY ("transportadoraId") REFERENCES "Transportadora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpedicaoVolume" ADD CONSTRAINT "ExpedicaoVolume_expedicaoId_fkey" FOREIGN KEY ("expedicaoId") REFERENCES "Expedicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treinamento" ADD CONSTRAINT "Treinamento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatConversa" ADD CONSTRAINT "ChatConversa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMensagem" ADD CONSTRAINT "ChatMensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "ChatConversa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
