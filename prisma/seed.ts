import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import { RECURSOS } from "../lib/recursos";

const prisma = new PrismaClient();

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

async function main() {
  console.log("Seed BIOGREEN SYSTEM — dados fictícios para desenvolvimento...");

  // ---------------------------------------------------------------
  // Núcleo: empresa, unidade, setores, cargos, permissões, usuários
  // ---------------------------------------------------------------
  const empresa = await prisma.empresa.upsert({
    where: { cnpj: "12.345.678/0001-90" },
    update: {},
    create: {
      razaoSocial: "Biogreen Indústria Química Ltda",
      nomeFantasia: "Biogreen",
      cnpj: "12.345.678/0001-90",
      endereco: "Av. Jorge Bei Maluf, 843 – Galpão 2 – Vila Theodoro",
      cidade: "Suzano",
      uf: "SP",
      cep: "08686-000",
      telefone: "+55 11 96469-4466",
      email: "contato@biogreenquimica.com.br",
      site: "https://www.biogreenquimica.com.br",
      logoUrl: "/logo-biogreen.jpg",
    },
  });

  await prisma.unidade.upsert({
    where: { id: 1 },
    update: {},
    create: { empresaId: empresa.id, nome: "Matriz Suzano", endereco: empresa.endereco, principal: true },
  });

  const setorNomes = ["Diretoria", "Comercial", "Compras", "Assistência Técnica", "Produção", "Qualidade", "Logística", "Financeiro"];
  const setores: Record<string, { id: number }> = {};
  for (const nome of setorNomes) {
    setores[nome] = await prisma.setor.upsert({
      where: { empresaId_nome: { empresaId: empresa.id, nome } },
      update: {},
      create: { empresaId: empresa.id, nome },
    });
  }

  const cargoDiretor = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Diretoria"].id, nome: "Diretor" } },
    update: {},
    create: { setorId: setores["Diretoria"].id, nome: "Diretor" },
  });
  const cargoVendedor = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Comercial"].id, nome: "Vendedor" } },
    update: {},
    create: { setorId: setores["Comercial"].id, nome: "Vendedor" },
  });
  const cargoTecnico = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Assistência Técnica"].id, nome: "Técnico de Aplicação" } },
    update: {},
    create: { setorId: setores["Assistência Técnica"].id, nome: "Técnico de Aplicação" },
  });
  const cargoFinanceiro = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Financeiro"].id, nome: "Analista Financeiro" } },
    update: {},
    create: { setorId: setores["Financeiro"].id, nome: "Analista Financeiro" },
  });
  const cargoComprador = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Compras"].id, nome: "Comprador" } },
    update: {},
    create: { setorId: setores["Compras"].id, nome: "Comprador" },
  });
  const cargoLiderProducao = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Produção"].id, nome: "Líder de Produção" } },
    update: {},
    create: { setorId: setores["Produção"].id, nome: "Líder de Produção" },
  });
  const cargoLaboratorio = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Qualidade"].id, nome: "Analista de Laboratório" } },
    update: {},
    create: { setorId: setores["Qualidade"].id, nome: "Analista de Laboratório" },
  });
  const cargoLogistica = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Logística"].id, nome: "Analista de Logística" } },
    update: {},
    create: { setorId: setores["Logística"].id, nome: "Analista de Logística" },
  });
  const cargoFaturamento = await prisma.cargo.upsert({
    where: { setorId_nome: { setorId: setores["Financeiro"].id, nome: "Faturamento" } },
    update: {},
    create: { setorId: setores["Financeiro"].id, nome: "Faturamento" },
  });

  // Permissões granulares de exemplo (o Diretor não precisa — usa superAdmin).
  for (const r of RECURSOS.filter((r) => r.modulo === "Comercial" || r.chave === "nucleo.cadastros" || r.chave === "tecnica.visitas")) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoVendedor.id, recurso: r.chave } },
      update: {},
      create: { cargoId: cargoVendedor.id, recurso: r.chave, podeVer: true, podeCriar: true, podeEditar: true },
    });
  }
  for (const r of RECURSOS.filter((r) => r.modulo === "Assistência Técnica" || r.chave === "nucleo.cadastros")) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoTecnico.id, recurso: r.chave } },
      update: {},
      create: { cargoId: cargoTecnico.id, recurso: r.chave, podeVer: true, podeCriar: true, podeEditar: true },
    });
  }
  for (const r of RECURSOS.filter(
    (r) => r.modulo === "Financeiro" || r.chave === "fiscal.notas" || r.chave === "producao.custeio" || r.chave === "patrimonio.ativos"
  )) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoFinanceiro.id, recurso: r.chave } },
      update: {},
      create: {
        cargoId: cargoFinanceiro.id,
        recurso: r.chave,
        podeVer: true,
        podeCriar: true,
        podeEditar: true,
        podeAprovar: r.chave.startsWith("financeiro"),
      },
    });
  }

  // Cargos do fluxo real repassado pela Karol (pedido -> produção -> laudo -> nota -> expedição).
  for (const r of RECURSOS.filter(
    (r) =>
      r.chave === "comercial.pedidos" ||
      r.chave === "nucleo.cadastros" ||
      r.chave === "patrimonio.ativos" ||
      r.chave === "estoque.materiasPrimas"
  )) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoComprador.id, recurso: r.chave } },
      update: {},
      create: {
        cargoId: cargoComprador.id,
        recurso: r.chave,
        podeVer: true,
        podeCriar: true,
        podeEditar: r.chave === "estoque.materiasPrimas",
        podeExcluir: r.chave === "estoque.materiasPrimas",
        podeAprovar: r.chave === "comercial.pedidos",
      },
    });
  }
  for (const r of RECURSOS.filter(
    (r) =>
      r.chave === "producao.ordens" ||
      r.chave === "producao.formulas" ||
      r.chave === "producao.lotes" ||
      r.chave === "producao.custeio" ||
      r.chave === "estoque.movimentos" ||
      r.chave === "estoque.materiasPrimas"
  )) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoLiderProducao.id, recurso: r.chave } },
      update: {},
      create: { cargoId: cargoLiderProducao.id, recurso: r.chave, podeVer: true, podeCriar: true, podeEditar: true },
    });
  }
  for (const r of RECURSOS.filter((r) => r.modulo === "Qualidade")) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoLaboratorio.id, recurso: r.chave } },
      update: {},
      create: { cargoId: cargoLaboratorio.id, recurso: r.chave, podeVer: true, podeCriar: true, podeEditar: true },
    });
  }
  for (const r of RECURSOS.filter((r) => r.chave === "logistica.expedicao" || r.chave === "estoque.movimentos")) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoLogistica.id, recurso: r.chave } },
      update: {},
      create: { cargoId: cargoLogistica.id, recurso: r.chave, podeVer: true, podeCriar: true, podeEditar: true },
    });
  }
  for (const r of RECURSOS.filter((r) => r.chave === "fiscal.notas" || r.chave === "financeiro.contasReceber")) {
    await prisma.permissao.upsert({
      where: { cargoId_recurso: { cargoId: cargoFaturamento.id, recurso: r.chave } },
      update: {},
      create: { cargoId: cargoFaturamento.id, recurso: r.chave, podeVer: true, podeCriar: true },
    });
  }

  const senhaInicial = await hashPassword("biogreen123");

  const admin = await prisma.usuario.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Diretoria Biogreen",
      email: "diretoria@biogreenquimica.com.br",
      username: "admin",
      passwordHash: senhaInicial,
      cargoId: cargoDiretor.id,
      superAdmin: true,
    },
  });

  const vendedor = await prisma.usuario.upsert({
    where: { username: "vendedor1" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Marcos Andrade",
      email: "marcos.andrade@biogreenquimica.com.br",
      username: "vendedor1",
      passwordHash: senhaInicial,
      cargoId: cargoVendedor.id,
    },
  });

  const tecnico = await prisma.usuario.upsert({
    where: { username: "tecnico1" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Fernanda Lima",
      email: "fernanda.lima@biogreenquimica.com.br",
      username: "tecnico1",
      passwordHash: senhaInicial,
      cargoId: cargoTecnico.id,
    },
  });

  const financeiro = await prisma.usuario.upsert({
    where: { username: "financeiro1" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Rodrigo Nascimento",
      email: "rodrigo.nascimento@biogreenquimica.com.br",
      username: "financeiro1",
      passwordHash: senhaInicial,
      cargoId: cargoFinanceiro.id,
    },
  });

  // Time do processo real repassado pela Karol (Financeiro/Faturamento) — cada um loga e faz
  // exatamente a etapa que já faz hoje manualmente, só que dentro do sistema.
  const joseHigor = await prisma.usuario.upsert({
    where: { username: "jose.higor" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "José Higor",
      email: "jose.higor@biogreenquimica.com.br",
      username: "jose.higor",
      passwordHash: senhaInicial,
      cargoId: cargoComprador.id,
    },
  });
  const anderson = await prisma.usuario.upsert({
    where: { username: "anderson" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Anderson",
      email: "anderson@biogreenquimica.com.br",
      username: "anderson",
      passwordHash: senhaInicial,
      cargoId: cargoLiderProducao.id,
    },
  });
  const beatriz = await prisma.usuario.upsert({
    where: { username: "beatriz" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Beatriz",
      email: "beatriz@biogreenquimica.com.br",
      username: "beatriz",
      passwordHash: senhaInicial,
      cargoId: cargoLaboratorio.id,
    },
  });
  const larissa = await prisma.usuario.upsert({
    where: { username: "larissa" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Larissa",
      email: "larissa@biogreenquimica.com.br",
      username: "larissa",
      passwordHash: senhaInicial,
      cargoId: cargoLogistica.id,
    },
  });
  const karoline = await prisma.usuario.upsert({
    where: { username: "karoline" },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Karoline",
      email: "karoline@biogreenquimica.com.br",
      username: "karoline",
      passwordHash: senhaInicial,
      cargoId: cargoFaturamento.id,
    },
  });

  // ---------------------------------------------------------------
  // Cadastros mestres
  // ---------------------------------------------------------------
  const kg = await prisma.unidadeMedida.upsert({ where: { sigla: "kg" }, update: {}, create: { sigla: "kg", nome: "Quilograma" } });
  const l = await prisma.unidadeMedida.upsert({ where: { sigla: "L" }, update: {}, create: { sigla: "L", nome: "Litro" } });
  await prisma.unidadeMedida.upsert({
    where: { sigla: "t" },
    update: {},
    create: { sigla: "t", nome: "Tonelada", unidadeBaseId: kg.id, fatorConversaoBase: 1000 },
  });
  await prisma.unidadeMedida.upsert({
    where: { sigla: "TB200" },
    update: {},
    create: { sigla: "TB200", nome: "Tambor 200L", unidadeBaseId: l.id, fatorConversaoBase: 200 },
  });
  await prisma.unidadeMedida.upsert({
    where: { sigla: "IBC1000" },
    update: {},
    create: { sigla: "IBC1000", nome: "IBC 1000L", unidadeBaseId: l.id, fatorConversaoBase: 1000 },
  });
  await prisma.unidadeMedida.upsert({ where: { sigla: "BAG" }, update: {}, create: { sigla: "BAG", nome: "Bag" } });
  await prisma.unidadeMedida.upsert({ where: { sigla: "SC" }, update: {}, create: { sigla: "SC", nome: "Saco" } });

  await prisma.embalagem.createMany({
    data: [
      { nome: "Tambor 200L", unidadeMedidaId: l.id, capacidade: 200 },
      { nome: "IBC 1000L", unidadeMedidaId: l.id, capacidade: 1000 },
      { nome: "Bag 1000kg", unidadeMedidaId: kg.id, capacidade: 1000 },
      { nome: "Saco 25kg", unidadeMedidaId: kg.id, capacidade: 25 },
    ],
    skipDuplicates: true,
  });

  const clienteCelutec = await prisma.cliente.upsert({
    where: { cnpjCpf: "11.111.111/0001-11" },
    update: {},
    create: {
      empresaId: empresa.id,
      razaoSocial: "Celutec Papéis Ltda",
      nomeFantasia: "Celutec",
      cnpjCpf: "11.111.111/0001-11",
      segmento: "PAPEL_CARTAO",
      condicoesComerciais: "30/60 dias, frete CIF",
      vendedorId: vendedor.id,
      tecnicoId: tecnico.id,
      createdById: admin.id,
    },
  });
  const clienteAmazonia = await prisma.cliente.upsert({
    where: { cnpjCpf: "22.222.222/0001-22" },
    update: {},
    create: {
      empresaId: empresa.id,
      razaoSocial: "Amazônia Celulose S.A.",
      nomeFantasia: "Amazônia Celulose",
      cnpjCpf: "22.222.222/0001-22",
      segmento: "CELULOSE",
      condicoesComerciais: "45 dias, frete FOB",
      vendedorId: vendedor.id,
      tecnicoId: tecnico.id,
      createdById: admin.id,
    },
  });
  const clienteHidroclean = await prisma.cliente.upsert({
    where: { cnpjCpf: "33.333.333/0001-33" },
    update: {},
    create: {
      empresaId: empresa.id,
      razaoSocial: "Hidroclean Saneamento Ltda",
      nomeFantasia: "Hidroclean",
      cnpjCpf: "33.333.333/0001-33",
      segmento: "TRATAMENTO_AGUA",
      condicoesComerciais: "30 dias, frete CIF",
      vendedorId: vendedor.id,
      tecnicoId: tecnico.id,
      createdById: admin.id,
    },
  });

  await prisma.clienteContato.createMany({
    data: [
      { clienteId: clienteCelutec.id, nome: "João Ferreira", cargo: "Comprador", email: "joao@celutec.com.br", principal: true },
      { clienteId: clienteAmazonia.id, nome: "Patrícia Gomes", cargo: "Engenharia de Processo", email: "patricia@amazoniacelulose.com.br", principal: true },
      { clienteId: clienteHidroclean.id, nome: "Carlos Meireles", cargo: "Responsável Técnico", email: "carlos@hidroclean.com.br", principal: true },
    ],
    skipDuplicates: true,
  });

  const fornecedorNacional = await prisma.fornecedor.upsert({
    where: { cnpjCpf: "44.444.444/0001-44" },
    update: {},
    create: {
      empresaId: empresa.id,
      razaoSocial: "Química Nacional Insumos Ltda",
      nomeFantasia: "Química Nacional",
      cnpjCpf: "44.444.444/0001-44",
      pais: "Brasil",
      contato: "Vendas",
      email: "vendas@quimicanacional.com.br",
    },
  });
  const fornecedorImportado = await prisma.fornecedor.upsert({
    where: { cnpjCpf: "55.555.555/0001-55" },
    update: {},
    create: {
      empresaId: empresa.id,
      razaoSocial: "Sino Chem Trading Co.",
      nomeFantasia: "Sino Chem",
      cnpjCpf: "55.555.555/0001-55",
      pais: "China",
      contato: "Export Dept.",
      email: "export@sinochemtrading.cn",
    },
  });

  const transportadora = await prisma.transportadora.upsert({
    where: { cnpj: "66.666.666/0001-66" },
    update: {},
    create: { nome: "TransRápida Logística Ltda", cnpj: "66.666.666/0001-66", contato: "Central de cargas" },
  });

  const mpPoliamina = await prisma.materiaPrima.upsert({
    where: { codigo: "MP-001" },
    update: {},
    create: { codigo: "MP-001", nome: "Poliamina", unidadeMedidaId: kg.id, fornecedorPadraoId: fornecedorNacional.id, custoMedio: 8.5, estoqueMinimo: 500 },
  });
  const mpAcidoSulfamico = await prisma.materiaPrima.upsert({
    where: { codigo: "MP-002" },
    update: {},
    create: { codigo: "MP-002", nome: "Ácido Sulfâmico", unidadeMedidaId: kg.id, fornecedorPadraoId: fornecedorImportado.id, custoMedio: 12.3, estoqueMinimo: 300 },
  });
  const mpOxidoMagnesio = await prisma.materiaPrima.upsert({
    where: { codigo: "MP-003" },
    update: {},
    create: { codigo: "MP-003", nome: "Óxido de Magnésio", unidadeMedidaId: kg.id, fornecedorPadraoId: fornecedorNacional.id, custoMedio: 6.9, estoqueMinimo: 400 },
  });
  const mpSoda = await prisma.materiaPrima.upsert({
    where: { codigo: "MP-004" },
    update: {},
    create: { codigo: "MP-004", nome: "Soda", unidadeMedidaId: kg.id, fornecedorPadraoId: fornecedorNacional.id, custoMedio: 4.2, estoqueMinimo: 2000 },
  });
  const mpEnxofre = await prisma.materiaPrima.upsert({
    where: { codigo: "MP-005" },
    update: {},
    create: { codigo: "MP-005", nome: "Enxofre", unidadeMedidaId: kg.id, fornecedorPadraoId: fornecedorNacional.id, custoMedio: 3.1, estoqueMinimo: 500 },
  });

  const produtoAkd = await prisma.produto.upsert({
    where: { codigoInterno: "BG-AKD-200" },
    update: {},
    create: {
      empresaId: empresa.id,
      codigoInterno: "BG-AKD-200",
      nomeComercial: "BG-Resin AKD 200",
      familia: "Resinas de colagem",
      forma: "EMULSAO",
      densidade: 1.02,
      concentracao: 18.5,
      ncm: "3809.92.90",
      classificacaoOnu: "Não classificado",
      fispqUrl: "/fispq/bg-akd-200.pdf",
      fispqValidade: daysFromNow(300),
      origem: "FABRICADO",
      segmento: "PAPEL_CARTAO",
      unidadeMedidaId: kg.id,
      precoBase: 14.9,
    },
  });
  const produtoDisperse = await prisma.produto.upsert({
    where: { codigoInterno: "BG-DISP-CEL-40" },
    update: {},
    create: {
      empresaId: empresa.id,
      codigoInterno: "BG-DISP-CEL-40",
      nomeComercial: "BG-Disperse CEL 40",
      familia: "Antiespumantes",
      forma: "LIQUIDO",
      densidade: 0.97,
      ncm: "3402.13.00",
      fispqUrl: "/fispq/bg-disperse-cel-40.pdf",
      fispqValidade: daysFromNow(280),
      origem: "FABRICADO",
      segmento: "CELULOSE",
      unidadeMedidaId: kg.id,
      precoBase: 11.2,
    },
  });
  const produtoPac = await prisma.produto.upsert({
    where: { codigoInterno: "BG-COAG-PAC-18" },
    update: {},
    create: {
      empresaId: empresa.id,
      codigoInterno: "BG-COAG-PAC-18",
      nomeComercial: "BG-Coag PAC 18",
      familia: "Coagulantes minerais",
      forma: "LIQUIDO",
      ncm: "3824.99.89",
      fispqUrl: "/fispq/bg-coag-pac-18.pdf",
      fispqValidade: daysFromNow(320),
      origem: "REVENDIDO",
      segmento: "TRATAMENTO_AGUA",
      unidadeMedidaId: kg.id,
      precoBase: 3.4,
    },
  });
  const produtoMixHidroclean = await prisma.produto.upsert({
    where: { codigoInterno: "BG-MIX-HIDRO-07" },
    update: {},
    create: {
      empresaId: empresa.id,
      codigoInterno: "BG-MIX-HIDRO-07",
      nomeComercial: "BG-Mix Hidroclean 07",
      familia: "Mistura customizada",
      forma: "LIQUIDO",
      origem: "MISTURA_CUSTOMIZADA",
      segmento: "TRATAMENTO_AGUA",
      unidadeMedidaId: kg.id,
      clienteExclusivoId: clienteHidroclean.id,
      precoBase: 9.8,
    },
  });

  // Produto real repassado pela Karol: Biopac, feito de 80% soda + 20% enxofre.
  const produtoBiopac = await prisma.produto.upsert({
    where: { codigoInterno: "BIOPAC" },
    update: {},
    create: {
      empresaId: empresa.id,
      codigoInterno: "BIOPAC",
      nomeComercial: "Biopac",
      familia: "Coagulantes",
      forma: "PO",
      ncm: "3824.99.89",
      origem: "FABRICADO",
      segmento: "TRATAMENTO_AGUA",
      unidadeMedidaId: kg.id,
      precoBase: 7.5,
    },
  });

  await prisma.tabelaPreco.createMany({
    data: [
      { produtoId: produtoAkd.id, clienteId: clienteCelutec.id, preco: 14.5, vigenciaInicio: daysFromNow(-60) },
      { produtoId: produtoDisperse.id, clienteId: clienteAmazonia.id, preco: 10.9, vigenciaInicio: daysFromNow(-60) },
      { produtoId: produtoMixHidroclean.id, clienteId: clienteHidroclean.id, preco: 9.8, vigenciaInicio: daysFromNow(-30) },
      { produtoId: produtoBiopac.id, clienteId: clienteHidroclean.id, preco: 7.5, vigenciaInicio: daysFromNow(-30) },
    ],
    skipDuplicates: true,
  });

  // ---------------------------------------------------------------
  // Comercial / CRM
  // ---------------------------------------------------------------
  const oportunidadeHidroclean = await prisma.oportunidade.create({
    data: {
      clienteId: clienteHidroclean.id,
      vendedorId: vendedor.id,
      etapa: "NEGOCIACAO",
      valorEstimado: 48000,
      dataAbertura: daysFromNow(-25),
    },
  });

  const propostaHidroclean = await prisma.proposta.create({
    data: {
      oportunidadeId: oportunidadeHidroclean.id,
      clienteId: clienteHidroclean.id,
      numero: "PROP-2026-0001",
      status: "ENVIADA",
      validadeAte: daysFromNow(15),
      createdById: vendedor.id,
      itens: {
        create: [{ produtoId: produtoMixHidroclean.id, quantidade: 2000, precoUnitario: 9.8, margemPercentual: 22 }],
      },
    },
  });

  const pedidoCelutec = await prisma.pedidoVenda.create({
    data: {
      clienteId: clienteCelutec.id,
      numero: "PV-2026-0001",
      status: "EM_PRODUCAO",
      condicaoPagamento: "30/60 dias",
      freteTipo: "CIF",
      dataPrometida: daysFromNow(6),
      createdById: vendedor.id,
      itens: { create: [{ produtoId: produtoAkd.id, quantidade: 1000, precoUnitario: 14.5 }] },
    },
    include: { itens: true },
  });

  const pedidoAmazonia = await prisma.pedidoVenda.create({
    data: {
      clienteId: clienteAmazonia.id,
      numero: "PV-2026-0002",
      // Já nasce com expedição e movimento de saída no seed (ver mais abaixo) — status
      // precisa refletir isso, senão o pedido aparece em Logística como "aguardando saída"
      // e clicar em Programar saída falha (unique constraint: já existe uma Expedicao).
      status: "EXPEDIDO",
      condicaoPagamento: "45 dias",
      freteTipo: "FOB",
      dataPrometida: daysFromNow(-2),
      createdById: vendedor.id,
      itens: { create: [{ produtoId: produtoDisperse.id, quantidade: 800, precoUnitario: 10.9 }] },
    },
  });

  const pedidoHidroclean = await prisma.pedidoVenda.create({
    data: {
      clienteId: clienteHidroclean.id,
      numero: "PV-2026-0003",
      status: "APROVADO",
      condicaoPagamento: "30 dias",
      freteTipo: "CIF",
      dataPrometida: daysFromNow(10),
      createdById: vendedor.id,
      itens: { create: [{ produtoId: produtoMixHidroclean.id, quantidade: 500, precoUnitario: 9.8 }] },
    },
  });

  await prisma.contratoFornecimento.create({
    data: { clienteId: clienteAmazonia.id, produtoId: produtoDisperse.id, consumoMensalPrevisto: 800, alertaReposicaoDias: 10 },
  });

  const comissaoAmazonia = await prisma.comissao.create({
    data: {
      vendedorId: vendedor.id,
      pedidoVendaId: pedidoAmazonia.id,
      percentual: 2.5,
      valor: 800 * 10.9 * 0.025,
      baseCalculo: "FATURADO",
      status: "PENDENTE",
    },
  });

  await prisma.metaComercial.create({
    data: { vendedorId: vendedor.id, segmento: "TRATAMENTO_AGUA", periodo: "2026-09", valorMeta: 60000 },
  });

  // ---------------------------------------------------------------
  // Assistência Técnica
  // ---------------------------------------------------------------
  const visitaRealizada = await prisma.visitaTecnica.create({
    data: {
      clienteId: clienteAmazonia.id,
      tecnicoId: tecnico.id,
      dataAgendada: daysFromNow(-10),
      status: "REALIZADA",
      roteiro: "Acompanhamento de dosagem na linha de branqueamento",
    },
  });
  await prisma.relatorioVisita.create({
    data: {
      visitaTecnicaId: visitaRealizada.id,
      parametrosMedidos: { pH: 7.2, turbidez: 4.1, dosagemPpm: 12 },
      produtosAplicados: [{ produtoId: produtoDisperse.id, quantidade: 40 }],
      recomendacoes: "Reduzir dosagem em 10% e reavaliar em 15 dias.",
      proximaAcao: "Nova visita em 2026-10-05",
    },
  });

  await prisma.visitaTecnica.create({
    data: {
      clienteId: clienteHidroclean.id,
      tecnicoId: tecnico.id,
      dataAgendada: daysFromNow(3),
      status: "AGENDADA",
      roteiro: "Apresentação de resultado do teste industrial BG-Mix Hidroclean 07",
    },
  });

  await prisma.testeIndustrial.create({
    data: {
      clienteId: clienteHidroclean.id,
      oportunidadeId: oportunidadeHidroclean.id,
      planejamento: "Teste de coagulação em ETA piloto, 3 dosagens distintas",
      resultado: "Melhor turbidez residual com dosagem intermediária",
      decisao: "APROVADO",
      dataPlanejada: daysFromNow(-20),
      dataResultado: daysFromNow(-18),
    },
  });

  await prisma.artigoConhecimento.create({
    data: {
      aplicacao: "AGUA",
      titulo: "Boas práticas de dosagem de coagulantes orgânicos",
      conteudo: "Guia interno sobre curva de dosagem, jar test e ajuste sazonal por turbidez de entrada.",
    },
  });

  // ---------------------------------------------------------------
  // Produção (PCP)
  // ---------------------------------------------------------------
  const formulaAkd = await prisma.formula.create({
    data: {
      produtoId: produtoAkd.id,
      versao: 3,
      rendimento: 1000,
      ordemAdicao: ["Água", "Poliamina", "Ácido Sulfâmico", "Resina base"],
      tempoMinutos: 90,
      temperatura: 65,
      epi: "Luvas, óculos de proteção, avental químico",
      instrucoes: "Adicionar sob agitação constante, controlar temperatura entre 60-70°C.",
      itens: {
        create: [
          { materiaPrimaId: mpPoliamina.id, quantidade: 120, ordem: 1 },
          { materiaPrimaId: mpAcidoSulfamico.id, quantidade: 40, ordem: 2 },
        ],
      },
    },
  });

  // Fórmula real do Biopac: rendimento de 100kg, sempre 80% soda + 20% enxofre — a produção
  // usa essa proporção pra calcular a baixa automática de matéria-prima, qualquer que seja o
  // tamanho do lote pedido (ex.: pedido de 1050kg -> 840kg soda + 210kg enxofre, sozinho).
  const formulaBiopac = await prisma.formula.create({
    data: {
      produtoId: produtoBiopac.id,
      versao: 1,
      rendimento: 100,
      tempoMinutos: 45,
      epi: "Luvas, óculos de proteção, máscara PFF2",
      instrucoes: "Misturar soda e enxofre nas proporções da fórmula sob agitação controlada.",
      itens: {
        create: [
          { materiaPrimaId: mpSoda.id, quantidade: 80, ordem: 1 },
          { materiaPrimaId: mpEnxofre.id, quantidade: 20, ordem: 2 },
        ],
      },
    },
  });

  const reator1 = await prisma.equipamento.create({ data: { nome: "Reator 01", tipo: "REATOR", capacidade: 2000 } });
  await prisma.equipamento.create({ data: { nome: "Misturador 01", tipo: "MISTURADOR", capacidade: 1000 } });

  const opConcluida = await prisma.ordemProducao.create({
    data: {
      numero: "OP-2026-0001",
      formulaId: formulaAkd.id,
      equipamentoId: reator1.id,
      status: "CONCLUIDA",
      quantidadePlanejada: 1000,
      quantidadeReal: 985,
      dataInicio: daysFromNow(-6),
      dataFim: daysFromNow(-5),
      createdById: tecnico.id,
    },
  });

  const loteComCoa = await prisma.lote.create({
    data: {
      numeroLote: "BG-AKD-260905A",
      produtoId: produtoAkd.id,
      ordemProducaoId: opConcluida.id,
      quantidade: 985,
      dataFabricacao: daysFromNow(-5),
      dataValidade: daysFromNow(355),
    },
  });

  await prisma.custoLote.create({
    data: {
      loteId: loteComCoa.id,
      custoMateriaPrima: 6820,
      custoEmbalagem: 410,
      custoMaoObra: 950,
      custoEnergiaRateada: 320,
      custoTotal: 8500,
    },
  });

  const especAkd = await prisma.especificacao.create({
    data: { produtoId: produtoAkd.id, parametro: "Teor ativo (%)", minimo: 17, maximo: 20, metodo: "Titulação" },
  });
  await prisma.analiseLote.create({
    data: { loteId: loteComCoa.id, especificacaoId: especAkd.id, valorMedido: 18.6, aprovado: true, analistaId: tecnico.id },
  });
  await prisma.coaDocumento.create({ data: { loteId: loteComCoa.id, pdfUrl: "/coa/bg-akd-260905a.pdf" } });

  // Segundo lote, ainda sem COA — alimenta o card "lotes com laudo pendente" do painel.
  const opEmProducao = await prisma.ordemProducao.create({
    data: {
      numero: "OP-2026-0002",
      pedidoVendaId: pedidoCelutec.id,
      pedidoVendaItemId: pedidoCelutec.itens[0]?.id,
      formulaId: formulaAkd.id,
      equipamentoId: reator1.id,
      status: "EM_PRODUCAO",
      quantidadePlanejada: 1000,
      dataInicio: daysFromNow(-1),
      createdById: tecnico.id,
    },
  });
  await prisma.lote.create({
    data: {
      numeroLote: "BG-AKD-260910B",
      produtoId: produtoAkd.id,
      ordemProducaoId: opEmProducao.id,
      quantidade: 1000,
      dataFabricacao: daysFromNow(-1),
      dataValidade: daysFromNow(359),
    },
  });

  await prisma.inspecaoRecebimento.create({
    data: {
      materiaPrimaId: mpPoliamina.id,
      fornecedorId: fornecedorNacional.id,
      numeroLoteFornecedor: "QN-88213",
      status: "APROVADO",
    },
  });

  await prisma.naoConformidade.create({
    data: {
      origem: "CLIENTE",
      descricao: "Cliente relatou viscosidade fora do padrão no lote BG-AKD-260905A",
      loteId: loteComCoa.id,
      clienteId: clienteCelutec.id,
      status: "EM_ANALISE",
      acao8D: { d1: "Equipe formada", d2: "Descrição do problema registrada" },
    },
  });

  // ---------------------------------------------------------------
  // Estoque e Compras
  // ---------------------------------------------------------------
  const almoxarifadoMp = await prisma.localEstoque.create({ data: { nome: "Almoxarifado MP - Suzano", tipo: "ALMOXARIFADO_MP" } });
  const produtoAcabado = await prisma.localEstoque.create({ data: { nome: "Produto Acabado - Suzano", tipo: "PRODUTO_ACABADO" } });
  await prisma.localEstoque.create({ data: { nome: "Quarentena - Suzano", tipo: "QUARENTENA" } });

  await prisma.estoqueMovimento.createMany({
    data: [
      { localEstoqueId: almoxarifadoMp.id, materiaPrimaId: mpPoliamina.id, tipo: "ENTRADA", quantidade: 1000, motivo: "Compra QN-88213" },
      { localEstoqueId: almoxarifadoMp.id, materiaPrimaId: mpPoliamina.id, tipo: "SAIDA", quantidade: 120, motivo: "Consumo OP-2026-0001" },
      { localEstoqueId: produtoAcabado.id, produtoId: produtoAkd.id, loteId: loteComCoa.id, tipo: "ENTRADA", quantidade: 985, motivo: "Produção OP-2026-0001" },
      { localEstoqueId: produtoAcabado.id, produtoId: produtoDisperse.id, tipo: "SAIDA", quantidade: 800, motivo: "Faturamento PV-2026-0002" },
      { localEstoqueId: almoxarifadoMp.id, materiaPrimaId: mpSoda.id, tipo: "ENTRADA", quantidade: 5000, motivo: "Estoque inicial — Soda" },
      { localEstoqueId: almoxarifadoMp.id, materiaPrimaId: mpEnxofre.id, tipo: "ENTRADA", quantidade: 2000, motivo: "Estoque inicial — Enxofre" },
    ],
  });

  const pedidoCompraNacional = await prisma.pedidoCompra.create({
    data: {
      fornecedorId: fornecedorNacional.id,
      numero: "PC-2026-0001",
      status: "RECEBIDO",
      createdById: financeiro.id,
      itens: { create: [{ materiaPrimaId: mpPoliamina.id, quantidade: 1000, precoUnitario: 8.5 }] },
    },
  });
  const pedidoCompraImportado = await prisma.pedidoCompra.create({
    data: {
      fornecedorId: fornecedorImportado.id,
      numero: "PC-2026-0002",
      status: "ENVIADO",
      moeda: "USD",
      cambio: 5.15,
      custosNacionalizacao: 2100,
      createdById: financeiro.id,
      itens: { create: [{ materiaPrimaId: mpOxidoMagnesio.id, quantidade: 2000, precoUnitario: 1.9 }] },
    },
  });

  // ---------------------------------------------------------------
  // Patrimônio (Ativos/CAPEX)
  // ---------------------------------------------------------------
  await prisma.ativo.createMany({
    data: [
      {
        nome: "Reator industrial 2000L",
        categoria: "Equipamento de Produção",
        fornecedorId: fornecedorNacional.id,
        numeroSerie: "RX-2000-0042",
        dataAquisicao: daysFromNow(-540),
        valorAquisicao: 185000,
        localizacao: "Galpão 2 — Suzano",
        vidaUtilAnos: 15,
        createdById: joseHigor.id,
      },
      {
        nome: "Empilhadeira elétrica 2,5t",
        categoria: "Veículo",
        fornecedorId: fornecedorNacional.id,
        numeroSerie: "EMP-2540-11",
        dataAquisicao: daysFromNow(-210),
        valorAquisicao: 62000,
        localizacao: "Galpão 2 — Suzano",
        vidaUtilAnos: 10,
        createdById: joseHigor.id,
      },
    ],
  });

  // ---------------------------------------------------------------
  // Fiscal
  // ---------------------------------------------------------------
  const notaFiscalAmazonia = await prisma.notaFiscal.create({
    data: {
      tipo: "VENDA",
      pedidoVendaId: pedidoAmazonia.id,
      clienteId: clienteAmazonia.id,
      numero: "000123",
      serie: "1",
      chaveAcesso: "35260900000000000000550010000001231000000012",
      status: "AUTORIZADA",
      valorTotal: 800 * 10.9,
      emitidaEm: daysFromNow(-2),
    },
  });

  await prisma.notaFiscalEntrada.create({
    data: {
      pedidoCompraId: pedidoCompraNacional.id,
      fornecedorId: fornecedorNacional.id,
      numero: "000045",
      chaveAcesso: "35260800000000000000550010000000451000000045",
      manifestacao: "CIENCIA_DA_OPERACAO",
    },
  });

  // ---------------------------------------------------------------
  // Financeiro
  // ---------------------------------------------------------------
  await prisma.contaBancaria.create({ data: { nome: "Banco do Brasil - Conta Corrente", banco: "001", agencia: "1234-5", conta: "67890-1", saldoInicial: 150000 } });

  const centroComercial = await prisma.centroCusto.create({ data: { nome: "Comercial" } });
  const centroProducao = await prisma.centroCusto.create({ data: { nome: "Produção" } });

  const planoReceita = await prisma.planoContas.create({ data: { codigo: "1.1", nome: "Receita de Vendas", tipo: "RECEITA", centroCustoId: centroComercial.id } });
  const planoDespesaMp = await prisma.planoContas.create({ data: { codigo: "2.1", nome: "Compra de Matéria-Prima", tipo: "DESPESA", centroCustoId: centroProducao.id } });

  // Centros de custo reais que o José Higor (Compras) usa hoje no Conta Azul pra categorizar
  // toda entrada de NF — cada um vira um PlanoContas de despesa pra virar Conta a Pagar.
  const categoriasCompras = [
    "CAPEX",
    "Copa e Cozinha",
    "Produção/Manutenção",
    "Escritório",
    "Construção de Imóvel",
    "Manutenção Predial",
    "Manutenção Preventiva",
  ];
  let codigoDespesa = 2001;
  for (const nome of categoriasCompras) {
    const cc = await prisma.centroCusto.create({ data: { nome } });
    await prisma.planoContas.create({ data: { codigo: `2.${codigoDespesa}`, nome: `Despesas — ${nome}`, tipo: "DESPESA", centroCustoId: cc.id } });
    codigoDespesa++;
  }

  const valorNfAmazonia = 800 * 10.9;
  await prisma.contaReceber.create({
    data: {
      clienteId: clienteAmazonia.id,
      pedidoVendaId: pedidoAmazonia.id,
      planoContasId: planoReceita.id,
      valor: valorNfAmazonia,
      valorPago: valorNfAmazonia,
      vencimento: daysFromNow(-2),
      status: "PAGO",
      dataBaixa: new Date(),
    },
  });
  await prisma.contaReceber.create({
    data: {
      clienteId: clienteHidroclean.id,
      pedidoVendaId: pedidoHidroclean.id,
      planoContasId: planoReceita.id,
      valor: 500 * 9.8,
      valorPago: 0,
      vencimento: daysFromNow(3),
      status: "ABERTO",
    },
  });

  const valorPcNacional = 1000 * 8.5;
  const contaPagarNacional = await prisma.contaPagar.create({
    data: {
      fornecedorId: fornecedorNacional.id,
      pedidoCompraId: pedidoCompraNacional.id,
      planoContasId: planoDespesaMp.id,
      valor: valorPcNacional,
      valorPago: valorPcNacional,
      vencimento: daysFromNow(-1),
      status: "PAGO",
      dataBaixa: new Date(),
    },
  });
  const contaPagarImportado = await prisma.contaPagar.create({
    data: {
      fornecedorId: fornecedorImportado.id,
      pedidoCompraId: pedidoCompraImportado.id,
      planoContasId: planoDespesaMp.id,
      valor: 2000 * 1.9 * 5.15 + 2100,
      valorPago: 0,
      vencimento: daysFromNow(5),
      status: "ABERTO",
    },
  });

  await prisma.aprovacaoAlcada.create({
    data: {
      tipo: "PAGAMENTO",
      contaPagarId: contaPagarImportado.id,
      referenciaId: contaPagarImportado.id,
      valorLimite: 15000,
      status: "PENDENTE",
    },
  });

  // ---------------------------------------------------------------
  // Governança
  // ---------------------------------------------------------------
  await prisma.fechamentoMensal.create({
    data: { periodo: "2026-08", setor: "Financeiro", status: "FECHADO", fechadoPorId: financeiro.id, fechadoEm: daysFromNow(-10) },
  });
  await prisma.kpi.create({ data: { setor: "Comercial", nome: "Conversão do funil", meta: 25, realizado: 18, periodo: "2026-09", semaforo: "AMARELO" } });

  // ---------------------------------------------------------------
  // Logística
  // ---------------------------------------------------------------
  const expedicaoAmazonia = await prisma.expedicao.create({
    data: {
      pedidoVendaId: pedidoAmazonia.id,
      status: "ENTREGUE",
      transportadoraId: transportadora.id,
      dataAgendamento: daysFromNow(-3),
      comprovanteUrl: "/comprovantes/pv-2026-0002.pdf",
    },
  });
  await prisma.expedicaoVolume.create({
    data: { expedicaoId: expedicaoAmazonia.id, etiquetaCodigo: "VOL-000001", classificacaoOnu: "Não classificado", pesoKg: 816 },
  });

  // ---------------------------------------------------------------
  // Pessoas e Tarefas
  // ---------------------------------------------------------------
  const colaboradorTecnico = await prisma.colaborador.create({
    data: { usuarioId: tecnico.id, nome: tecnico.nome, setorId: setores["Assistência Técnica"].id, cargoTexto: "Técnico de Aplicação", escala: "Segunda a sexta, 8h-17h" },
  });
  await prisma.treinamento.create({
    data: { colaboradorId: colaboradorTecnico.id, nome: "NR-35 Trabalho em Altura", dataRealizado: daysFromNow(-180), dataValidade: daysFromNow(185) },
  });

  await prisma.tarefa.create({
    data: {
      titulo: "Follow-up proposta Hidroclean",
      descricao: "Ligar para Carlos Meireles confirmando prazo de decisão.",
      responsavelId: vendedor.id,
      status: "A_FAZER",
      prazo: daysFromNow(5),
      entidadeTipo: "Proposta",
      entidadeId: propostaHidroclean.id,
    },
  });

  // ---------------------------------------------------------------
  // Cérebro (IA)
  // ---------------------------------------------------------------
  const conversa = await prisma.chatConversa.create({ data: { usuarioId: admin.id, titulo: "Consumo Hidroclean 2026" } });
  await prisma.chatMensagem.createMany({
    data: [
      { conversaId: conversa.id, role: "USER", conteudo: "Quanto vendemos de BG-Mix Hidroclean 07 para o cliente Hidroclean em 2026?" },
      {
        conversaId: conversa.id,
        role: "ASSISTANT",
        conteudo: "Até agora, 1 pedido aprovado (PV-2026-0003) de 500 kg a R$ 9,80/kg, totalizando R$ 4.900,00. Há também uma proposta enviada de 2.000 kg em negociação.",
      },
    ],
  });

  await prisma.sugestaoProativa.create({
    data: {
      tipo: "estoque_baixo",
      descricao: "Poliamina (MP-001) está próxima do estoque mínimo — considerar novo pedido de compra.",
      entidadeTipo: "MateriaPrima",
      entidadeId: mpPoliamina.id,
      status: "NOVA",
    },
  });

  // ---------------------------------------------------------------
  // Fila de jobs (exemplo) e trilha de auditoria (feed do painel)
  // ---------------------------------------------------------------
  await prisma.job.create({
    data: { tipo: "enviar_email_proposta", payload: { propostaId: propostaHidroclean.id }, status: "CONCLUIDO", processadoEm: daysFromNow(-1) },
  });

  const auditEntries: { usuarioId: number; entidade: string; entidadeId: number; acao: string; minutosAtras: number }[] = [
    { usuarioId: vendedor.id, entidade: "PedidoVenda", entidadeId: pedidoHidroclean.id, acao: "criou", minutosAtras: 12 },
    { usuarioId: financeiro.id, entidade: "ContaPagar", entidadeId: contaPagarNacional.id, acao: "deu baixa em", minutosAtras: 40 },
    { usuarioId: tecnico.id, entidade: "VisitaTecnica", entidadeId: visitaRealizada.id, acao: "concluiu relatório de", minutosAtras: 95 },
    { usuarioId: vendedor.id, entidade: "Proposta", entidadeId: propostaHidroclean.id, acao: "enviou", minutosAtras: 180 },
    { usuarioId: admin.id, entidade: "Usuario", entidadeId: financeiro.id, acao: "criou", minutosAtras: 400 },
    { usuarioId: financeiro.id, entidade: "PedidoCompra", entidadeId: pedidoCompraImportado.id, acao: "enviou", minutosAtras: 600 },
    { usuarioId: tecnico.id, entidade: "Lote", entidadeId: loteComCoa.id, acao: "aprovou análise de", minutosAtras: 900 },
    { usuarioId: vendedor.id, entidade: "Comissao", entidadeId: comissaoAmazonia.id, acao: "gerou", minutosAtras: 1200 },
  ];
  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        usuarioId: entry.usuarioId,
        entidade: entry.entidade,
        entidadeId: entry.entidadeId,
        acao: entry.acao,
        createdAt: minutesAgo(entry.minutosAtras),
      },
    });
  }

  console.log("Seed concluído.");
  console.log("Usuários criados (senha inicial 'biogreen123', trocar assim que possível):");
  console.log("  admin / vendedor1 / tecnico1 / financeiro1");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
