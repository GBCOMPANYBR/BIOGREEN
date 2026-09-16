# Requisitos financeiros — "Parte financeira sistema.docx" (Karol)

Documento enviado pela Karol, transcrito e traduzido em itens técnicos. Marcados: ✅ já implementado, 🔨 implementado nesta rodada, 📋 registrado para depois.

## Vendas

- ✅ **NF emitida já cria contas a receber** — `gerarNotaFiscal` (lib/actions.ts) já faz isso desde a Fase do fluxo real.
- 🔨 **Parcelas, não só uma linha única** — a condição de pagamento do pedido (ex.: "30/60/90 dias") agora gera uma `ContaReceber` por parcela, não uma só.
- 📋 **Mesma coisa para contas a pagar** — hoje não existe uma ação "receber pedido de compra" que gere `ContaPagar` automaticamente (só existe no seed, manual). Entra junto com o módulo de Compras de verdade.
- 🔨 **"Vencidos" e "Vencem hoje"** — cards separados no Financeiro (hoje só tinha a lista geral e o card agregado "contas vencendo 7 dias" do Painel).
- ✅ **Cruzar gasto de matéria-prima com produção do produto acabado** — é exatamente o Centro de Custo (implementado na rodada anterior): `CustoLote.custoMateriaPrima` por lote, com médio por produto.

## Fluxo de caixa

- 🔨 **Opção diário e mensal** — toggle na tela Financeiro.
- 🔨 **Gráfico no início da tela: recebimentos / pagamentos / saldo** — Recharts, já é dependência do projeto.
- 🔨 **Gráfico de vendas mensal**.

## Integração com a Receita Federal (NF-e)

- 📋 **Consultar automaticamente NF-e emitidas contra o CNPJ da empresa** — isso é uma integração real com webservices da SEFAZ/Receita Federal, não uma simulação como o resto do sistema. Exige certificado digital A1/A3 e é o mesmo ponto já registrado em `docs/PERGUNTAS.md` (pergunta 5, provedor de NF-e). **Não dá pra simular** — só entra quando a Biogreen decidir o provedor (Focus NFe, NFe.io etc.) e tiver certificado ativo.

## Relatórios

- 📋 **Relatórios de ativos, clientes, vendas mensais, compras** — precisa decidir formato de saída (tela só, PDF, Excel/CSV) antes de desenhar. Registrado, não implementado.

## Categorias financeiras

- 📋 **Categorias de receita / despesa estilo DRE** — o schema já tem `PlanoContas` (tipo RECEITA/DESPESA) mas não existe tela de gestão nem um relatório DRE montado.
- 📋 **Centro de custo por projeto** ("no fim do projeto poder rastrear tudo que foi gasto") — precisa de um conceito de "Projeto" que não existe no schema ainda; o Centro de Custo atual é por lote/produto, não por projeto.
- 📋 **Centro de custo por área da empresa** — o schema já tem `CentroCusto` vinculado a setor, mas `CustoLote` (o custo real calculado por lote) ainda não tem esse vínculo — hoje o Centro de Custo só quebra por produto, não por setor/área.

## Cadastro de produto — campos pedidos

| Campo pedido | Situação |
|---|---|
| Nome | ✅ já existe (`nomeComercial`) |
| Código | ✅ já existe (`codigoInterno`) |
| Família | ✅ já existe (`familia`) |
| Origem | ✅ já existe (`origem`) |
| Composição de Produto % | ✅ já existe como Fórmula (`Formula`/`FormulaItem`), mas só aparece na tela de PCP — 📋 falta mostrar/editar isso direto no cadastro do produto em Núcleo |
| Unidade de medida para venda | ✅ já existe (`unidadeMedidaId`) |
| Centro de custo | 📋 falta vincular `Produto` a um `CentroCusto` — precisa migração (campo novo) |
| Categoria | 📋 esclarecer com a Karol: é a mesma coisa que "família", ou um campo novo e distinto? |
| NCM | ✅ já existe |
| CEST | ✅ já existe |
