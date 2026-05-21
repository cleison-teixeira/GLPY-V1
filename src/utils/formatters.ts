// GLPY — Formatadores de medidas no padrão brasileiro
// Usar vírgula como separador decimal.
// LocalStorage continua armazenando number; estes helpers são apenas para exibição.

export function formatDecimalBR(value: number, decimals = 2): string {
  return value.toFixed(decimals).replace('.', ',');
}

export function formatKg(value: number): string {
  return `${formatDecimalBR(value)} kg`;
}

export function formatMeters(value: number): string {
  return `${formatDecimalBR(value)} m`;
}

export function formatCm(value: number): string {
  return `${formatDecimalBR(value)} cm`;
}

export function formatLiters(value: number): string {
  return `${formatDecimalBR(value)} L`;
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
