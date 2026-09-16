# PERGUNTAS — BIOGREEN SYSTEM

Decisões ambíguas (de negócio ou técnicas) encontradas durante o desenvolvimento. Cada item segue com um valor padrão configurável até ser respondido — nada fica bloqueado à espera de resposta.

## Abertas

| # | Pergunta | Área | Valor padrão adotado enquanto aguarda | Origem |
|---|---|---|---|---|
| 1 | Confirma o desvio do monorepo/NestJS da seção 3 do prompt original em favor de reaproveitar a arquitetura do Imetal (Next.js monolítico)? | Arquitetura | Next.js monolítico (padrão Imetal) | docs/PLANO.md §2 |
| 2 | Aceita Vercel Cron + tabela de jobs (evoluindo para Inngest) no lugar de BullMQ + Redis? | Arquitetura | Vercel Cron + tabela `job` | docs/PLANO.md §2 |
| 3 | Mantém Vercel Blob como storage mesmo com volume maior esperado (FISPQ, COA, DANFE, fotos), ou nasce com S3 dedicado? | Arquitetura | Vercel Blob (padrão Imetal) | docs/PLANO.md §2 |
| 4 | Regime tributário da empresa e cálculo de impostos padrão (interno x interestadual) | Fiscal | Alíquotas zeradas/parametrizáveis, sem cálculo automático até confirmação | docs/PLANO.md §5 |
| 5 | Provedor de NF-e/NFS-e a contratar e disponibilidade de certificado digital A1/A3 | Fiscal | Adapter implementado, sem provedor ativo (modo "rascunho") | docs/PLANO.md §5 |
| 6 | Regras de comissão (percentual por produto/segmento/vendedor, base de cálculo, teto/escalonamento) | Comercial | Percentual único configurável por vendedor, calculado sobre valor faturado | docs/PLANO.md §5 |
| 7 | Alçadas de aprovação (valores-limite e aprovadores por nível) para propostas, compras e pagamentos | Governança | Alçada única (qualquer ADMIN aprova), valor-limite configurável iniciando em R$ 0 (tudo exige aprovação) | docs/PLANO.md §5 |
| 8 | Margem mínima por produto/segmento que bloqueia ou exige aprovação em proposta | Comercial | Sem bloqueio automático; campo de margem mínima existe mas começa vazio | docs/PLANO.md §5 |
| 9 | Gateway bancário/PIX preferido para cobrança | Financeiro | Nenhum gateway ativo; boleto/PIX manual até definição | docs/PLANO.md §5 |
| 10 | Formato de exportação disponível do Conta Azul e do MAXCONT para migração | Migração | Importador aceita CSV genérico com mapeamento de colunas configurável | docs/PLANO.md §5 |
| 11 | Quais produtos são "controlados" (Polícia Federal/Exército) e prazos de licença vigentes | Núcleo/Qualidade | Campo "produto controlado" existe, nenhum produto marcado até confirmação | docs/PLANO.md §5 |
| 12 | WhatsApp Business API: Biogreen já tem BSP contratado ou GB Company deve indicar? | Integrações | Notificação por e-mail como canal único até definição | docs/PLANO.md §5 |
| 13 | Biogreen opera como unidade única hoje, ou já há filiais/CDs exigindo multi-unidade desde a Fase 0? | Núcleo | Unidade única, mas schema já suporta múltiplas unidades por empresa | docs/PLANO.md §5 |
| 14 | Cadastro de ativos/patrimônio (equipamentos, com fornecedor, data de aquisição, valor, localização, depreciação?) — hoje a Karol/Igor rastreiam manualmente "no nome do fornecedor", sem confiabilidade pra levantamento. Precisa depreciação contábil ou só controle físico simples? | Compras/Financeiro | Nenhum cadastro de patrimônio ainda — `Equipamento` no schema hoje é só pra reator/misturador de produção, não serve pra isso | Áudio da Karol, 2026-09-16 |
| 15 | Código interno de ativos e de produtos — a Karol mencionou um código ("N...", trecho do áudio pouco claro) que usam hoje. Confirmar formato exato antes de decidir se o `codigoInterno`/`codigo` já seguidos no cadastro batem com o padrão deles ou se precisa migrar. | Núcleo | Segue com o formato livre atual (`codigoInterno` string) até a Karol confirmar o padrão deles | Áudio da Karol, 2026-09-16 |
| 16 | Histórico de alteração de preço por produto, visível na tela do produto (hoje só dá pra ver via nota fiscal emitida no MAXCONT, não no cadastro) | Núcleo/Comercial | O schema já suporta isso — `TabelaPreco` tem `vigenciaInicio`/`vigenciaFim`, cada mudança de preço vira uma linha nova sem apagar a anterior — falta só uma tela mostrando essa linha do tempo | Áudio da Karol, 2026-09-16 |

## Respondidas

- **"Compramos soda, mas na hora de faturar o sistema não reconhece porque a nota do fornecedor vem com outro nome — estoque zera"** (Karol, 2026-09-16): resolvido por desenho do sistema. Toda entrada de estoque aponta para um `materiaPrimaId` do cadastro único (Núcleo) — não existe campo de texto livre copiando o nome do fornecedor. Quem lança a entrada sempre seleciona da lista cadastrada, nunca digita.
- **"Tudo que compramos (até sabonete/detergente) sobe pro estoque de venda, misturado com matéria-prima"** (Karol, 2026-09-16): resolvido por desenho do sistema. Só existem cadastros de `Produto` e `MateriaPrima` — o que não é matéria-prima/produto de venda não tem onde "virar estoque"; uma compra de uso e consumo interno vira só lançamento de despesa no Financeiro.
