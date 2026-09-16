/**
 * Catálogo de recursos do RBAC granular (ver §5 do PROMPT-BIOGREEN-SYSTEM.md).
 * Cada recurso vira uma linha de Permissao por Cargo (ver/criar/editar/aprovar/excluir).
 * `modulo` agrupa os recursos na sidebar; `label` é o texto exibido ao usuário.
 */
export interface RecursoDef {
  chave: string;
  modulo: string;
  label: string;
}

export const RECURSOS: RecursoDef[] = [
  { chave: "nucleo.usuarios", modulo: "Núcleo", label: "Usuários e permissões" },
  { chave: "nucleo.cadastros", modulo: "Núcleo", label: "Cadastros mestres" },
  { chave: "comercial.oportunidades", modulo: "Comercial", label: "Funil de oportunidades" },
  { chave: "comercial.propostas", modulo: "Comercial", label: "Propostas e orçamentos" },
  { chave: "comercial.pedidos", modulo: "Comercial", label: "Pedidos de venda" },
  { chave: "comercial.comissoes", modulo: "Comercial", label: "Comissões e metas" },
  { chave: "tecnica.visitas", modulo: "Assistência Técnica", label: "Visitas técnicas" },
  { chave: "tecnica.testes", modulo: "Assistência Técnica", label: "Testes industriais" },
  { chave: "producao.formulas", modulo: "Produção", label: "Fórmulas (BOM)" },
  { chave: "producao.ordens", modulo: "Produção", label: "Ordens de produção" },
  { chave: "producao.lotes", modulo: "Produção", label: "Lotes e rastreabilidade" },
  { chave: "qualidade.especificacoes", modulo: "Qualidade", label: "Especificações e análises" },
  { chave: "qualidade.naoConformidades", modulo: "Qualidade", label: "Não conformidades" },
  { chave: "estoque.movimentos", modulo: "Estoque", label: "Estoque e inventário" },
  { chave: "compras.pedidos", modulo: "Compras", label: "Pedidos de compra" },
  { chave: "fiscal.notas", modulo: "Fiscal", label: "Notas fiscais" },
  { chave: "financeiro.contasReceber", modulo: "Financeiro", label: "Contas a receber" },
  { chave: "financeiro.contasPagar", modulo: "Financeiro", label: "Contas a pagar" },
  { chave: "governanca.fechamento", modulo: "Governança", label: "Fechamento e prestação de contas" },
  { chave: "logistica.expedicao", modulo: "Logística", label: "Expedição" },
  { chave: "producao.custeio", modulo: "Produção", label: "Centro de custo" },
  { chave: "patrimonio.ativos", modulo: "Patrimônio", label: "Ativos (CAPEX)" },
  { chave: "pessoas.colaboradores", modulo: "Pessoas", label: "Colaboradores e treinamentos" },
  { chave: "pessoas.tarefas", modulo: "Pessoas", label: "Tarefas" },
  { chave: "cerebro.chat", modulo: "Cérebro (IA)", label: "Chat com os dados" },
];

export type Acao = "podeVer" | "podeCriar" | "podeEditar" | "podeAprovar" | "podeExcluir";
