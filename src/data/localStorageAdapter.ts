// GLPY — localStorage Adapter
// BUG 16A: camada de acesso seguro ao localStorage.
//
// Regras:
// - SSR-safe: verifica typeof window antes de qualquer acesso.
// - Todas as escritas disparam o evento local-storage-change.
// - readJSON retorna fallback em caso de JSON inválido.
// - Não apaga nenhuma chave existente sem chamada explícita a removeKey.

// ── Primitivo interno ─────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ── Emitir evento de mudança ─────────────────────────────────────────────────

export function emitStorageChange(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event('local-storage-change'));
}

// ── Leitura ──────────────────────────────────────────────────────────────────

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readString(key: string, fallback = ''): string {
  if (!isBrowser()) return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

// ── Escrita ──────────────────────────────────────────────────────────────────

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitStorageChange();
  } catch {
    // quota exceeded ou contexto privado — falha silenciosa
  }
}

export function writeString(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
    emitStorageChange();
  } catch {
    // falha silenciosa
  }
}

// ── Remoção ──────────────────────────────────────────────────────────────────

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
    emitStorageChange();
  } catch {
    // falha silenciosa
  }
}
