/**
 * 🚨 ATENÇÃO PRÉ-LANÇAMENTO GLPY
 *
 * DEV_ACCESS_OPEN libera o app inteiro sem validar plano, HeroSpark ou Paywall.
 *
 * USAR SOMENTE DURANTE DESENVOLVIMENTO DO MVP.
 *
 * ANTES DE LANÇAR/VENDER OFICIALMENTE:
 * 1. Alterar DEV_ACCESS_OPEN para false
 * 2. Validar /admin liberando usuário por email
 * 3. Validar webhook HeroSpark (api/herospark/webhook.ts)
 * 4. Validar usuário com plano ativo → Home
 * 5. Validar usuário sem plano → Planos
 * 6. Validar que botão voltar de Planos não burla acesso
 *
 * NÃO FAZER DEPLOY DE VENDA COM DEV_ACCESS_OPEN = true.
 */
// Sprint 17B.5.3 — DEV_ACCESS_OPEN desativado para lançamento
export const DEV_ACCESS_OPEN = false;

// Planos que liberam acesso completo ao app
// starter = fallback técnico — NÃO libera acesso completo
// Acesso manual via admin_grants define o plano (ex: 'fundador') no users/{uid}
const VALID_PLANS = new Set([
  // Planos pagos HeroSpark
  'fundador', 'essencial', 'pro', 'top',
  // Planos legados Kiwify (backward compat para assinantes antigos)
  'plus', 'vitalicio', 'founder', 'premium',
]);

export function hasActiveAccess(): boolean {
  if (DEV_ACCESS_OPEN) {
    console.warn(
      '🚨 GLPY DEV_ACCESS_OPEN está ATIVO. Paywall/Admin/Kiwify estão liberados temporariamente. Desligar antes do lançamento oficial.'
    );
    return true;
  }
  try {
    const raw = localStorage.getItem('glpy_plano');
    if (!raw || !raw.trim()) return false;
    return VALID_PLANS.has(raw.trim().toLowerCase());
  } catch { return false; }
}

export function getActivePlan(): string | null {
  try { return localStorage.getItem('glpy_plano')?.trim() || null; } catch { return null; }
}
