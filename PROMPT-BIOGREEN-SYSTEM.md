# PROMPT — BIOGREEN SYSTEM (cole no Claude Code)

Você é o engenheiro-chefe do projeto **BIOGREEN SYSTEM**, um sistema de gestão integrado + "segundo cérebro" que a **GB Company** está construindo para a **Biogreen Indústria Química Ltda**. Trabalhe como um engenheiro sênior autônomo: leia este documento inteiro antes de escrever qualquer código, crie o plano, e só então comece a executar. Sempre que eu pedir uma feature, verifique antes como ela conversa com os outros módulos — nada aqui é isolado.

---

## 1. Contexto do cliente

- **Empresa:** Biogreen Indústria Química Ltda (www.biogreenquimica.com.br)
- **Sede:** Av. Jorge Bei Maluf, 843 – Galpão 2 – Vila Theodoro – Suzano/SP – CEP 08686-000
- **Contato oficial:** contato@biogreenquimica.com.br · +55 11 96469-4466 · +55 11 98147-1920
- **Perfil:** indústria química familiar de médio porte, com estrutura internacional própria (marcas irmãs Novogreen e NG Chimie). Vende produtos químicos e assistência técnica especializada para três segmentos B2B:
  1. **Papel e Cartão** — resinas de resistência a seco/úmido, colas AKD e breu, biocidas, enzimas, coagulantes, polímeros, dispersantes, antiespumantes, dióxido de titânio.
  2. **Celulose** — controle de depósitos/incrustações, ácido sulfâmico, dispersantes, antiespumantes baixo silicone, anti-pitch, auxiliares de lavagem e drenagem.
  3. **Tratamento de Água** — coagulantes orgânicos (poliamina, polidadmac) e minerais (sulfatos de ferro/alumínio, PAC), polímeros, sequestrantes, ureia, ácido fosfórico, óxido de magnésio, cepas bacterianas.
- **Modelo de negócio:** produtos com especificação exclusiva + commodities + assistência técnica no cliente (preparo, aplicação, controle e avaliação de resultados). Muitos produtos são **misturas customizadas** por cliente.
- **Site atual** tem versões em PT / EN / FR / ES — o sistema deve nascer preparado para i18n (pt-BR padrão, EN e ES/FR depois).
- **Ferramentas que usam hoje (serão substituídas ou integradas):**
  - **Conta Azul** — financeiro/ERP leve
  - **MAXCONT** — emissão de notas fiscais
  - **Excel** — todos os controles internos (produção, estoque, laudos, comissões etc.)
- **Objetivo declarado:** centralizar TUDO em um único sistema, com todos os setores interligados — do comercial à produção, do financeiro à prestação de contas. Layout inovador, moderno e de fácil manuseio, para ser usado por gente do chão de fábrica até a diretoria.

## 2. Referência de produto

Este projeto segue o mesmo conceito e padrão de qualidade do sistema que construímos para a **Imetal** e do "Rei OS" (Rei dos Infláveis): um **segundo cérebro da empresa** — um lugar único onde entra e vive toda a informação da operação, com dashboards por setor, um canal de IA que responde perguntas sobre os dados da empresa, e uma base pronta para automações.

> Se houver um repositório/pasta da Imetal acessível neste ambiente, leia a estrutura, o design system e as convenções antes de começar e **reaproveite a mesma arquitetura e stack** para manter padronização entre os projetos da GB Company. Se não houver, use a stack da seção 3.

## 3. Stack e arquitetura

Use esta stack (ajuste apenas para espelhar o projeto da Imetal, se encontrado):

- **Monorepo** com `apps/web` (frontend) e `apps/api` (backend), `packages/ui`, `packages/db`, `packages/shared`.
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + lucide-react + Recharts. PWA instalável (uso em tablets na produção/expedição).
- **Backend:** Node/TypeScript com NestJS ou Next API routes + tRPC/REST (escolha uma e justifique no plano). Validação com Zod.
- **Banco:** PostgreSQL com Prisma. Migrations versionadas. Row-level: toda tabela operacional tem `empresa_id`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at` (soft delete).
- **Auth:** e-mail/senha + convite por link, RBAC por setor e cargo, 2FA opcional para financeiro/diretoria.
- **Storage:** S3-compatível (laudos, FISPQ, comprovantes, XML/DANFE, fotos de expedição).
- **Filas/jobs:** BullMQ + Redis (envio de e-mails, geração de PDFs, conciliação, alertas).
- **IA:** integração com a API da Anthropic (Claude) para o módulo "Cérebro" — consulta em linguagem natural sobre os dados via ferramentas (tools) que leem o banco com permissões do usuário logado. Nunca expor chaves no frontend.
- **Infra:** Docker Compose para dev; produção em VPS/Render/Railway com Postgres gerenciado. `.env.example` completo.
- **Qualidade:** ESLint + Prettier, testes (Vitest) nas regras de negócio críticas (estoque, custo de lote, comissão, financeiro), seed com dados fictícios realistas da Biogreen.
- **Auditoria:** tabela `audit_log` registrando quem alterou o quê e quando, em todas as entidades sensíveis.

## 4. Identidade visual e UX

- Nome no sistema: **BIOGREEN SYSTEM**. Créditos discretos "desenvolvido por GB Company" no rodapé do login.
- Paleta derivada da marca: verdes (institucional) + neutros claros, com um tom de acento (azul-petróleo ou lima) para ações primárias. Modo claro e escuro.
- Layout: sidebar recolhível com módulos por setor, topo com busca global (⌘K) que acha cliente, produto, lote, NF, título financeiro, tarefa — qualquer coisa.
- Tela inicial = **Painel da Empresa**: cards de saúde (caixa do dia, contas vencendo, pedidos em produção, lotes com laudo pendente, estoque abaixo do mínimo, visitas técnicas da semana) + feed de atividades + atalhos por setor.
- Cada módulo tem seu próprio dashboard no topo e a operação (tabelas, kanban, formulários) abaixo.
- Tabelas com filtros salvos, colunas configuráveis, exportação CSV/Excel (eles vivem no Excel — precisam sair dele sem sofrer).
- Formulários grandes em etapas, com autosave. Mobile/tablet first nas telas de produção e expedição.
- Notificações in-app + e-mail + WhatsApp (via API oficial, fase posterior).
- Acessibilidade básica (contraste, teclado, labels) e textos em pt-BR sem jargão técnico.

## 5. Módulos (todos interligados)

Implemente nesta ordem de prioridade, mas modele o banco inteiro desde o início.

### 5.1 Núcleo
- Empresa, unidades, usuários, cargos, setores, permissões (RBAC granular por ação: ver / criar / editar / aprovar / excluir).
- Cadastros mestres: **clientes** (matriz/filiais, contatos, segmento papel/celulose/água, condições comerciais, tabela de preço, vendedor responsável, técnico responsável), **fornecedores**, **transportadoras**, **produtos**, **matérias-primas**, **embalagens**, **unidades de medida** com conversão (kg, L, t, tambor 200 L, IBC 1000 L, bag, sacos).
- Produto químico: código interno, nome comercial, família, forma (pó/emulsão/líquido), densidade, concentração/teor ativo, NCM, CEST, classificação ONU/risco, **FISPQ** (arquivo + validade), ficha técnica, se é **produto controlado** (Polícia Federal / Exército — guardar nº da licença e vencimento), shelf life, condições de armazenagem, se é fabricado, revendido ou mistura customizada.

### 5.2 Comercial / CRM
- Funil de oportunidades (kanban): lead → visita técnica → teste industrial → proposta → negociação → ganho/perdido, com motivo de perda.
- **Propostas e orçamentos** com versionamento, geração de PDF com a marca Biogreen, validade, aprovação interna por alçada.
- **Pedidos de venda**: itens, preço, impostos estimados, condição de pagamento, frete, data prometida. Ao aprovar, gera automaticamente: reserva de estoque ou **ordem de produção**, previsão em contas a receber, tarefa de expedição.
- Contratos de fornecimento recorrente (consumo mensal previsto por cliente/produto) com alerta de reposição.
- Tabela de preços por cliente/segmento, histórico de preço, margem mínima por produto (bloqueio ou aprovação se abaixo).
- **Comissões** por vendedor/representante com regras configuráveis (por produto, margem, recebimento).
- Metas por vendedor/segmento e dashboard comercial (funil, ticket, conversão, carteira, churn de clientes).

### 5.3 Assistência Técnica (diferencial da Biogreen)
- Agenda de **visitas técnicas** por cliente/técnico, roteiro, check-in com foto e geolocalização (PWA).
- **Relatório de visita**: parâmetros medidos (ex.: dosagem, pH, retenção, Kappa, turbidez, consumo), produtos aplicados, recomendações, próxima ação. Gera PDF para o cliente e alimenta o histórico do cliente.
- **Testes industriais / ensaios**: planejamento, resultado, decisão (aprovado → vira proposta).
- Base de conhecimento técnica por aplicação (papel, celulose, água).

### 5.4 Produção (PCP)
- **Fórmulas / receitas (BOM)** com versão, rendimento, ordem de adição, tempo, temperatura, EPI, instruções. Fórmulas customizadas por cliente vinculadas ao produto.
- **Ordens de produção**: planejada → em produção → controle de qualidade → aprovada/reprovada → concluída. Consumo real vs. teórico de matérias-primas, apontamento por tablet, perdas, retrabalho.
- **Lotes** com rastreabilidade total: lote de matéria-prima usado → lote produzido → NF → cliente (rastreio para frente e para trás).
- Custo real por lote (matéria-prima + embalagem + mão de obra + energia rateada) alimentando o custo do produto e a margem comercial.
- Capacidade/agenda de reatores e misturadores, manutenção preventiva de equipamentos.

### 5.5 Qualidade / Laboratório
- Especificações por produto (parâmetro, mín/máx, método). Análises por lote, **COA (Certificado de Análise)** em PDF com a marca, anexado ao lote e à NF.
- Inspeção de recebimento de matéria-prima (aprovar/bloquear lote do fornecedor).
- Não conformidades, reclamações de cliente, ações corretivas (fluxo simples 8D). Controle de FISPQ e documentos com vencimento.

### 5.6 Estoque e Compras
- Estoque por local (almoxarifado de MP, produção, produto acabado, quarentena, cliente em consignação) e por lote, com validade e FIFO/FEFO.
- Entradas por NF (importar XML), saídas por venda/produção/perda, transferências, inventário cíclico com leitor de código de barras/QR (etiquetas geradas pelo sistema).
- Estoque mínimo/ponto de pedido calculado pelo consumo, sugestão automática de compra.
- **Compras**: requisição → cotação com fornecedores → pedido de compra → recebimento → conferência → contas a pagar. Importação e exportação relevantes (empresa tem cadeia internacional): moeda, câmbio, custos de nacionalização.

### 5.7 Fiscal (substitui / integra MAXCONT)
- Emissão de **NF-e (modelo 55)** e NFS-e via provedor de API (Focus NFe, NFe.io ou similar — deixe abstraído em um adapter para trocar de provedor). NF de venda, remessa, devolução, complementar, transferência.
- Cálculo de impostos por NCM/UF/regime (parametrizável, com tabela mantida pelo contador). Armazenar XML e DANFE, enviar por e-mail ao cliente.
- Importação de NF de entrada por chave/XML. Manifestação do destinatário.
- Relatórios para contabilidade (livros de entrada/saída, SPED auxiliar em CSV) e um **portal do contador** com acesso somente-leitura.

### 5.8 Financeiro (substitui Conta Azul)
- Contas a receber e a pagar geradas automaticamente pelos outros módulos, com baixa manual, parcial e por conciliação.
- Plano de contas, centros de custo por setor/segmento, contas bancárias, **importação OFX** e conciliação bancária.
- Boletos e PIX via API bancária ou gateway (Asaas/Inter/Cora — adapter), régua de cobrança automática por e-mail/WhatsApp.
- **Fluxo de caixa** realizado e projetado (30/60/90 dias), DRE gerencial por segmento e por cliente, margem por produto/lote, curva ABC de clientes e produtos.
- Aprovações por alçada para pagamentos acima de valor X.
- Migração: importador de exportações CSV/Excel do Conta Azul (clientes, fornecedores, títulos, plano de contas).

### 5.9 Prestação de Contas / Governança
- Fechamento mensal com checklist por setor e travamento do período.
- **Relatório de prestação de contas** para os sócios/diretoria: resultado, caixa, estoque valorizado, carteira, produção, inadimplência — em PDF e em uma tela executiva com comparativo mês a mês.
- Indicadores (KPIs) por setor com metas e semáforos. Trilha de auditoria consultável.

### 5.10 Logística / Expedição
- Separação por pedido, conferência com QR, romaneio, etiquetas de volume com dados de risco/ONU, agendamento de coleta, transportadora, rastreio, comprovante de entrega com foto/assinatura.

### 5.11 Pessoas e Tarefas
- Cadastro de colaboradores por setor, escala, EPIs entregues, treinamentos e certificados com validade (NR-20, NR-35 etc.).
- Tarefas e projetos internos (kanban) vinculáveis a qualquer registro do sistema (cliente, lote, NF, OP).

### 5.12 O "Cérebro" (IA)
- Chat interno conectado aos dados com permissão do usuário: "quanto vendemos de PAC para o cliente X em 2026?", "quais lotes vencem em 30 dias?", "me monte o relatório de visita do cliente Y com base nos últimos 3 apontamentos".
- Resumo diário automático por setor. Sugestões proativas (cliente que reduziu consumo, MP a repor, título vencendo, laudo pendente).
- Toda ação da IA que altera dados exige confirmação humana e é registrada na auditoria.

## 6. Integrações e automações
- Adapters (interfaces) para: NF-e, banco/boleto/PIX, e-mail transacional, WhatsApp Business API, câmbio (BCB), CEP, consulta de CNPJ (Receita).
- Importadores: XML NF-e, OFX, CSV/Excel do Conta Azul e planilhas atuais (crie templates de planilha para o cliente preencher na migração).
- Webhooks e API REST documentada (OpenAPI) para o site da Biogreen (formulário de contato/orçamento vira lead no CRM).

## 7. Como quero que você trabalhe

1. **Primeiro**, gere `docs/PLANO.md` com: arquitetura escolhida, diagrama de entidades (Mermaid), lista de módulos com fases, e perguntas abertas que você precisa que eu leve à Biogreen. Aguarde meu OK.
2. **Fase 0 — Fundação:** monorepo, banco modelado completo (todas as entidades acima), auth/RBAC, design system, layout base, painel da empresa com dados de seed, busca global. Deploy local com Docker Compose funcionando.
3. **Fase 1 — Comercial + Cadastros + Assistência Técnica.**
4. **Fase 2 — Financeiro + Fiscal + migração do Conta Azul/MAXCONT.**
5. **Fase 3 — Estoque + Compras + Produção + Qualidade.**
6. **Fase 4 — Expedição, Pessoas, Prestação de Contas, Cérebro IA, WhatsApp.**
- Ao final de cada fase: atualize `docs/CHANGELOG.md`, `README.md` (como rodar), e um `docs/MANUAL-USUARIO.md` em linguagem simples, com prints das telas quando possível.
- Commits pequenos e descritivos em português. Nunca apague migrations; crie novas.
- Se uma decisão de negócio for ambígua (regra fiscal, comissão, alçada), **não invente**: registre em `docs/PERGUNTAS.md` e siga com um valor padrão configurável.
- Priorize sempre: integridade dos dados > rastreabilidade > velocidade de entrega > estética. Mas a estética importa: o cliente comprou "layout inovador e de fácil manuseio".

Comece agora pelo passo 1 (gerar o `docs/PLANO.md`) e me apresente o resumo do plano e as perguntas abertas.
