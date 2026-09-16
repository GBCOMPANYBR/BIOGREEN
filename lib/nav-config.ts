import {
  LayoutDashboard,
  Building2,
  Handshake,
  Stethoscope,
  ClipboardList,
  Factory,
  FlaskConical,
  Warehouse,
  ShoppingCart,
  Receipt,
  Wallet,
  ShieldCheck,
  Truck,
  Users,
  Brain,
  Calculator,
  Package2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  slug: string;
  modulo: string;
  label: string;
  icon: LucideIcon;
  /** Recurso do RBAC associado ao módulo — controla se aparece na sidebar para o usuário. */
  recurso: string;
  /** Fase do docs/PLANO.md em que a UI do módulo é implementada. */
  fase: 0 | 1 | 2 | 3 | 4;
}

export const NAV_ITEMS: NavItem[] = [
  { slug: "", modulo: "Painel", label: "Painel da Empresa", icon: LayoutDashboard, recurso: "nucleo.cadastros", fase: 0 },
  { slug: "nucleo", modulo: "Núcleo", label: "Cadastros e usuários", icon: Building2, recurso: "nucleo.cadastros", fase: 0 },
  { slug: "comercial", modulo: "Comercial", label: "Comercial / CRM", icon: Handshake, recurso: "comercial.pedidos", fase: 1 },
  { slug: "tecnica", modulo: "Assistência Técnica", label: "Assistência Técnica", icon: Stethoscope, recurso: "tecnica.visitas", fase: 1 },
  { slug: "pcp", modulo: "PCP", label: "PCP", icon: ClipboardList, recurso: "producao.formulas", fase: 3 },
  { slug: "producao", modulo: "Produção", label: "Produção", icon: Factory, recurso: "producao.ordens", fase: 3 },
  { slug: "custeio", modulo: "Produção", label: "Centro de Custo", icon: Calculator, recurso: "producao.custeio", fase: 3 },
  { slug: "qualidade", modulo: "Qualidade", label: "Qualidade / Laboratório", icon: FlaskConical, recurso: "qualidade.especificacoes", fase: 3 },
  { slug: "estoque", modulo: "Estoque", label: "Estoque", icon: Warehouse, recurso: "estoque.movimentos", fase: 3 },
  { slug: "compras", modulo: "Compras", label: "Compras", icon: ShoppingCart, recurso: "compras.pedidos", fase: 3 },
  { slug: "ativos", modulo: "Patrimônio", label: "Ativos (CAPEX)", icon: Package2, recurso: "patrimonio.ativos", fase: 3 },
  { slug: "fiscal", modulo: "Fiscal", label: "Fiscal", icon: Receipt, recurso: "fiscal.notas", fase: 2 },
  { slug: "financeiro", modulo: "Financeiro", label: "Financeiro", icon: Wallet, recurso: "financeiro.contasReceber", fase: 2 },
  { slug: "governanca", modulo: "Governança", label: "Prestação de Contas", icon: ShieldCheck, recurso: "governanca.fechamento", fase: 4 },
  { slug: "logistica", modulo: "Logística", label: "Logística / Expedição", icon: Truck, recurso: "logistica.expedicao", fase: 4 },
  { slug: "pessoas", modulo: "Pessoas", label: "Pessoas e Tarefas", icon: Users, recurso: "pessoas.tarefas", fase: 4 },
  { slug: "cerebro", modulo: "Cérebro", label: "Cérebro (IA)", icon: Brain, recurso: "cerebro.chat", fase: 4 },
];
