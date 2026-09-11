# CHANGELOG — BIOGREEN SYSTEM

## Fase 0 — Fundação (2026-09-11)

- Plano inicial (`docs/PLANO.md`) e perguntas abertas (`docs/PERGUNTAS.md`), com arquitetura definida a partir do padrão já validado no projeto IMETAL (Next.js monolítico, Prisma/Postgres, auth JWT própria, Vercel Blob).
- Schema Prisma completo (`prisma/schema.prisma`) cobrindo todos os módulos do negócio: núcleo, cadastros mestres, comercial/CRM, assistência técnica, produção (PCP), qualidade/laboratório, estoque, compras, fiscal, financeiro, governança, logística, pessoas e o "Cérebro" (IA) — com soft delete e trilha de auditoria (`AuditLog`) nas entidades operacionais.
- Autenticação própria (JWT em cookie httpOnly) e RBAC granular por cargo/recurso/ação (`lib/permissions.ts`, `lib/recursos.ts`), com guard de acesso por módulo (`requireModuleAccess`) aplicado em toda rota autenticada.
- Design system: paleta verde institucional derivada do logo da Biogreen + acento azul-petróleo, modo claro/escuro, componentes base (`components/ui/`).
- Layout: sidebar recolhível com módulos filtrados por permissão, busca global (⌘K) com categorias reais (clientes, produtos, lotes, notas fiscais, pedidos), respeitando RBAC por categoria.
- Painel da Empresa com dados reais do banco: caixa do dia, contas vencendo, pedidos em produção, lotes com laudo pendente, visitas técnicas da semana, feed de atividade e atalhos por setor (também filtrados por permissão).
- Um placeholder por módulo ainda sem UI, indicando em qual fase entra.
- Seed com dados fictícios realistas da Biogreen (3 clientes de segmentos distintos, fórmulas, ordens de produção, lotes com e sem COA, financeiro com títulos pagos/abertos, expedição, etc.) para desenvolvimento e demonstração.
- `docker-compose.yml` para Postgres local de dev.
- Testado ponta a ponta via HTTP contra Postgres real (login, RBAC, painel, busca, logout) — sem verificação visual em navegador (Playwright indisponível neste ambiente por incompatibilidade de SO). Dois bugs encontrados e corrigidos nesse processo: (1) componentes de ícone (lucide-react) sendo passados de Server para Client Components, violando a fronteira RSC; (2) atalhos do Painel e acesso direto por URL não respeitavam o RBAC (só a sidebar filtrava corretamente).
