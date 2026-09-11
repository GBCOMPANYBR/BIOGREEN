# BIOGREEN SYSTEM

Sistema de gestão integrado da **Biogreen Indústria Química Ltda** — "segundo cérebro" da empresa, construído pela GB Company. Ver [docs/PLANO.md](docs/PLANO.md) para arquitetura completa, diagrama de entidades e fases, e [PROMPT-BIOGREEN-SYSTEM.md](PROMPT-BIOGREEN-SYSTEM.md) para o briefing original do cliente.

## Stack

- **Next.js (App Router) + TypeScript** — front-end e API no mesmo app (mesmo padrão do projeto irmão IMETAL, sem monorepo).
- **Prisma + Postgres** — schema completo com todos os módulos do negócio (núcleo, comercial, assistência técnica, produção, qualidade, estoque, compras, fiscal, financeiro, governança, logística, pessoas, IA).
- **Autenticação própria** (sessão em cookie httpOnly assinada com JWT) + **RBAC granular** por cargo/recurso/ação (ver/criar/editar/aprovar/excluir) — ver [lib/permissions.ts](lib/permissions.ts) e [lib/recursos.ts](lib/recursos.ts).
- **Anexos em Vercel Blob** em produção; sem `BLOB_READ_WRITE_TOKEN`, cai automaticamente para disco local em `storage/attachments/` (mesmo padrão do Imetal).
- **Tailwind CSS** + shadcn/ui (componentes próprios em `components/ui/`) + Recharts (gráficos, a partir da Fase 1+).

## Primeiro uso (ambiente local)

Duas formas de subir o Postgres local — use a que preferir:

**a) Docker:**
```bash
docker compose up -d
```

**b) Postgres já instalado na máquina** (ex.: via Homebrew): crie um role/banco `biogreen`/`biogreen` apontando para `localhost:5432`, ou ajuste `DATABASE_URL` no `.env` para o seu Postgres local.

Depois:
```bash
npm install
cp .env.example .env          # preencha DATABASE_URL / DATABASE_URL_UNPOOLED / SESSION_SECRET
npx prisma migrate dev         # cria o schema completo no banco
npm run db:seed                # popula dados fictícios realistas da Biogreen
npm run dev                    # http://localhost:3000
```

### Usuários de teste (senha inicial `biogreen123` — trocar assim que possível)

| Usuário | Papel | Acesso |
|---|---|---|
| `admin` | Diretoria | `superAdmin` — bypassa o RBAC, vê todos os módulos |
| `vendedor1` | Comercial | Núcleo (só ver) + Comercial + Assistência Técnica |
| `tecnico1` | Assistência Técnica | Núcleo (só ver) + Assistência Técnica |
| `financeiro1` | Financeiro | Financeiro + Fiscal (só ver notas) |

## Estrutura

```
app/(app)/          rotas autenticadas — sidebar+topbar via layout.tsx, um diretório por módulo
app/api/             rotas REST (auth, busca global)
app/login/           tela de login
components/ui/       primitivos de design system (button, input, card, badge...)
components/layout/   sidebar, topbar, busca global (⌘K), shell da área logada
lib/                 prisma client, auth (JWT), RBAC (permissions.ts/recursos.ts), storage, nav-config
prisma/schema.prisma schema completo (todos os módulos, modelado desde a Fase 0)
prisma/seed.ts        dados fictícios realistas da Biogreen para desenvolvimento
docs/                 PLANO.md, PERGUNTAS.md, CHANGELOG.md, MANUAL-USUARIO.md
```

## Estado atual

**Fase 0 (Fundação) concluída:** app rodando, banco modelado por completo, auth + RBAC granular funcionando, design system (paleta verde derivada da marca, modo claro/escuro), layout base (sidebar recolhível, busca global ⌘K), Painel da Empresa com dados reais do banco, e um placeholder por módulo indicando em qual fase a UI de cada um entra. Ver [docs/CHANGELOG.md](docs/CHANGELOG.md) e [docs/PLANO.md](docs/PLANO.md) para as fases seguintes.

## Migração de dados

Conta Azul, MAXCONT e as planilhas de Excel atuais serão substituídos — os importadores entram na Fase 2/3 (ver `docs/PLANO.md`). Nenhuma planilha real de cliente deve ser versionada neste repositório.
