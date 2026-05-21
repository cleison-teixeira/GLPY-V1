// GLPY — Formatadores de medidas
// Storage continua armazenando number; estes helpers são apenas para exibição.
// Preparados para múltiplos locales (padrão: pt-BR).

// ── Core ─────────────────────────────────────────────────────────────────────

export function formatNumberByLocale(value: number, decimals: number, locale = 'pt-BR'): string {
  if (locale === 'pt-BR') {
    return value.toFixed(decimals).replace('.', ',');
  }
  return value.toFixed(decimals); // en-US usa ponto
}

// Formata número + unidade com espaço entre eles.
// formatUnit(85, 'g', 0)        → "85 g"
// formatUnit(1.3, 'L', 2)       → "1,30 L"
// formatUnit(84.5, 'kg', 2)     → "84,50 kg"
// formatUnit(1.3, 'L', 2, 'en-US') → "1.30 L"
export function formatUnit(value: number, unit: string, decimals = 2, locale = 'pt-BR'): string {
  return `${formatNumberByLocale(value, decimals, locale)} ${unit}`;
}

// ── Helpers de conveniência (padrão pt-BR) ────────────────────────────────────

export function formatDecimalBR(value: number, decimals = 2): string {
  return formatNumberByLocale(value, decimals, 'pt-BR');
}

export function formatKg(value: number): string {
  return formatUnit(value, 'kg', 2);
}

export function formatMeters(value: number): string {
  return formatUnit(value, 'm', 2);
}

export function formatCm(value: number): string {
  return formatUnit(value, 'cm', 2);
}

export function formatLiters(value: number): string {
  return formatUnit(value, 'L', 2);
}

export function formatMl(value: number): string {
  return `${Math.round(value)} ml`;
}

export function formatKcal(value: number): string {
  return `${Math.round(value)} kcal`;
}

// Aceita "84,50" / "84.50" / "84" / "1,65" e converte para number
export function parseBRNumber(input: string): number {
  const cleaned = String(input).trim().replace(',', '.');
  return parseFloat(cleaned);
}
