// GLPY — Navigation Return Utility
// Centralizes safe return-to logic for all operational screens.
// Prevents any operational screen from accidentally navigating to plans/paywall.

const KEY     = 'glpy_return_to';
const TAB_KEY = 'glpy_restore_tab';

const ALLOWED = new Set([
  'dashboard', 'hub', 'perfil',
  'progress', 'results',
  'recipes', 'receitas',
  'comunidade', 'protocolHub', 'chatIA',
]);

// These must NEVER be a return destination for operational screens.
const BLOCKED = new Set([
  'plan', 'plans', 'planos', 'paywall', 'pricing', 'subscription',
]);

export function setReturnTo(target: string, restoreTab?: string): void {
  sessionStorage.setItem(KEY, target);
  if (restoreTab) sessionStorage.setItem(TAB_KEY, restoreTab);
  else            sessionStorage.removeItem(TAB_KEY);
}

export function getReturnTo(): string | null {
  return sessionStorage.getItem(KEY);
}

export function clearReturnTo(): void {
  sessionStorage.removeItem(KEY);
  sessionStorage.removeItem(TAB_KEY);
}

/**
 * Reads glpy_return_to, validates it, clears it, and returns the safe target.
 * Falls back to `fallback` (default: 'dashboard') if stored value is absent,
 * blocked, or an unrecognised /preview route.
 */
export function resolveSafeReturn(fallback = 'dashboard'): string {
  const stored = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  if (!stored)                      return fallback;
  if (BLOCKED.has(stored))          return fallback;
  if (stored.startsWith('/preview')) return fallback;
  if (ALLOWED.has(stored))          return stored;
  return fallback;
}

export function getRestoreTab(): string | null {
  const tab = sessionStorage.getItem(TAB_KEY);
  sessionStorage.removeItem(TAB_KEY);
  return tab;
}
