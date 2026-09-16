# Requisitos capturados na reunião com o Renato — 2026-09-16

Feedback recebido ao vivo durante a demo da Fase 0/fluxo real (ver `docs/CHANGELOG.md`). Registrado aqui tal como veio, para virar plano de implementação depois — **nada disso foi implementado ainda**, para não arriscar quebrar o sistema no meio da apresentação.

## 1. Separar PCP de Produção — edição de fórmula

- Produto cadastrado nasce com uma **fórmula BASE**.
- Alguns usuários (perfil a definir — provavelmente o cargo "Líder de Produção" ou um novo cargo de PCP) podem **editar a fórmula antes de produzir**, quando necessário para aquele pedido/lote específico.
- Novo módulo **PCP** (Planejamento e Controle de Produção), separado do módulo **Produção** atual:
  - Fluxo revisado: Comercial (pedido aprovado) → **PCP** (revisa a fórmula, edita se precisar, aprova) → **Produção** (executa — só entra aqui depois do PCP aprovar).
  - A tela de Produção deve mostrar a **fórmula final** usada (original ou editada), não só a base — rastreável, para quem executa saber exatamente o que fazer.
- Impacto técnico: hoje `aprovarPedido` (Comercial) já cria a `OrdemProducao` direto em status `EM_PRODUCAO`. Precisa virar dois passos — Comercial aprova → PCP recebe e trava a fórmula final → só aí libera pra Produção.

## 2. Centro de Custo (módulo novo)

- Cálculo **detalhado** de quanto custa cada produto/lote: hora de funcionário, insumos, frete, tempo — "absolutamente tudo".
- O schema já tem `CustoLote` (matéria-prima, embalagem, mão de obra, energia rateada) e `CentroCusto`, mas:
  - Não tem UI nenhuma ainda.
  - A granularidade pedida (hora de funcionário nominal, tempo de processo) provavelmente exige campos novos — desenhar com calma, não espremer no modelo atual sem conversar.

## 3. Ativos / CAPEX (módulo novo)

- Cadastro de equipamentos/ativos comprados pela empresa (CAPEX).
- Confirma e formaliza o que a Karol já tinha pedido por áudio antes da reunião (ver `docs/PERGUNTAS.md`, pergunta 14) — hoje `Equipamento` no schema é só pra reator/misturador de produção, não serve como cadastro de patrimônio geral.
- Precisa esclarecer: precisa de depreciação contábil ou só controle físico/rastreio simples (fornecedor, data, valor, localização)?

## 4. Checagem de estoque de matéria-prima antes de aprovar pedido

- O PCP (ou o próprio Comercial, no momento da aprovação) precisa **checar se há matéria-prima suficiente em estoque** antes de liberar a produção.
- "A quebra do estoque tem que aparecer no Comercial/CRM, porque não tem como ele aceitar o produto porque não tem matéria-prima" — hoje o Comercial aprova sem checar disponibilidade real; precisa avisar/bloquear quando faltar insumo.
- Impacto técnico: hoje o sistema já sabe calcular o consumo automático pela fórmula (baixa 840kg soda + 210kg enxofre pra 1050kg de Biopac); falta comparar esse consumo contra o saldo real em estoque *antes* de aprovar, e sinalizar no Comercial se vai faltar.

## 5. Estoque — cores semânticas

- Saída de estoque em **vermelho**, entrada em **verde** — hoje os badges de tipo de movimento usam a paleta neutra do design system (verde institucional/secundário), não vermelho/verde semânticos.

## 6. Logística mais completa

- Campo de **valor do frete** por pedido/expedição (hoje `Expedicao` não tem esse campo).
- **Anexar canhoto/NF assinado** — upload de arquivo. O schema já tem um model genérico `Anexo` (entidadeTipo/entidadeId/url) pronto pra isso; falta a UI de upload e o storage já configurado (`lib/storage.ts`, Vercel Blob/disco local) já suporta.

## 7. Estoque (compras recorrentes) — precisa esclarecer

- Mencionado sem detalhe — não ficou claro se é: sugestão automática de reposição baseada em contrato de fornecimento recorrente (já existe `ContratoFornecimento` no schema, hoje só pro lado de venda/cliente — precisaria de um equivalente pro lado de compra/fornecedor), ou um relatório de itens comprados com frequência. **Perguntar ao Renato/Karol antes de desenhar.**

---

Nenhum destes itens tem prazo ou fase definida ainda — entram no replanejamento de `docs/PLANO.md` depois da reunião.
