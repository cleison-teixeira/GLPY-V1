// GLPY — Configuração Central de Planos
// Sprint 17B.1 — HeroSpark Webhook + Planos GLPY
//
// Fonte única de verdade para:
//   • nomes de planos oficiais
//   • limites por plano
//   • mapeamento offer_id → plano
//   • planos ativos (acesso liberado)
//
// NÃO importar Firebase aqui — módulo de dados puros.

// ── Mapeamento offer_id HeroSpark → plano ─────────────────────────────────────

export const HEROSPARK_OFFER_MAP: Record<string, string> = {
  '524346': 'fundador',   // GLPY Fundador — R$19,90/mês
  // futuros:
  // 'XXXXXX': 'essencial',
  // 'XXXXXX': 'pro',
};

export function planFromOfferId(offerId: string | number | undefined): string | null {
  if (!offerId) return null;
  return HEROSPARK_OFFER_MAP[String(offerId)] ?? null;
}

// ── Limites por plano ─────────────────────────────────────────────────────────

export interface GlpyPlanLimits {
  label:        string;
  iaPerDay:     number;
  fotosPerDay:  number;
  protocolos:   number;  // 0 = nenhum liberado
  receitasPerMonth: number;
  active:       boolean; // false = plano bloqueado (cancelado, expirado)
}

export const PLAN_LIMITS: Record<string, GlpyPlanLimits> = {
  starter: {
    label: 'Starter (Grátis)',
    iaPerDay: 30, fotosPerDay: 5, protocolos: 0, receitasPerMonth: 0,
    active: true,
  },
  fundador: {
    label: 'Fundador',
    iaPerDay: 30, fotosPerDay: 5, protocolos: 10, receitasPerMonth: 10,
    active: true,
  },
  essencial: {
    label: 'Essencial',
    iaPerDay: 30, fotosPerDay: 5, protocolos: 10, receitasPerMonth: 10,
    active: true,
  },
  pro: {
    label: 'Pro',
    iaPerDay: 99, fotosPerDay: 19, protocolos: 10, receitasPerMonth: 10,
    active: true,
  },
  top: {
    label: 'Top / Admin / Dev',
    iaPerDay: 999, fotosPerDay: 999, protocolos: 10, receitasPerMonth: 999,
    active: true,
  },
  cancelado: {
    label: 'Cancelado',
    iaPerDay: 0, fotosPerDay: 0, protocolos: 0, receitasPerMonth: 0,
    active: false,
  },
  expirado: {
    label: 'Expirado',
    iaPerDay: 0, fotosPerDay: 0, protocolos: 0, receitasPerMonth: 0,
    active: false,
  },
  // Backward compat — planos antigos da Kiwify
  plus:     { label: 'Plus (legado)', iaPerDay: 20,  fotosPerDay: 6,   protocolos: 0,  receitasPerMonth: 0,   active: true  },
  vitalicio:{ label: 'Vitalício',     iaPerDay: 999, fotosPerDay: 999, protocolos: 10, receitasPerMonth: 999, active: true  },
  founder:  { label: 'Founder',       iaPerDay: 30,  fotosPerDay: 5,   protocolos: 10, receitasPerMonth: 10,  active: true  },
  premium:  { label: 'Premium',       iaPerDay: 30,  fotosPerDay: 5,   protocolos: 0,  receitasPerMonth: 0,   active: true  },
};

export function getPlanLimits(plano: string): GlpyPlanLimits {
  return PLAN_LIMITS[plano.toLowerCase()] ?? PLAN_LIMITS['starter'];
}

// ── Planos que liberam acesso ao app ─────────────────────────────────────────

export const ACTIVE_PLAN_NAMES = new Set(
  Object.entries(PLAN_LIMITS)
    .filter(([, v]) => v.active)
    .map(([k]) => k),
);
