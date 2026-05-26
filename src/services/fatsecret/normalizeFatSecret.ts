// GLPY — FatSecret Service — Normalizer
// BUG 15A: Transforma resultado da FatSecret API → formato MealEntry do GLPY
//
// ⚠️  IMPORTANTE: Esta função NÃO salva em localStorage.
//     Apenas prepara o objeto para ser salvo pelo App.tsx (onSave handler)
//     em fases futuras (BUG 15B+).

import type {
  FatSecretAnalysisResult,
  FatSecretFoodItem,
  FatSecretMealType,
  FatSecretServing,
  NormalizedMealFromPhoto,
  NormalizedMealType,
} from './types';
import { MEAL_TYPE_MAP } from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ──────────────────────────────────────────────────────────────────────────────

/** Parse seguro de string numérica da API (todos os campos chegam como string) */
function parseApiNumber(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(n) ? 0 : n;
}

/** Garante que um campo da API que pode ser objeto único ou array vire array */
export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Seleciona a serving padrão (primeira do array, preferencialmente 100g) */
export function selectDefaultServing(servings: FatSecretServing[]): FatSecretServing | null {
  if (servings.length === 0) return null;
  // Prioriza serving de 100g para consistência nutricional
  const per100 = servings.find(s =>
    s.serving_description?.toLowerCase().includes('100')
    || s.metric_serving_unit?.toLowerCase() === 'g' && parseApiNumber(s.metric_serving_amount) === 100
  );
  return per100 ?? servings[0];
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. Normaliza uma FatSecretServing → FatSecretFoodItem (formato GLPY)
// ──────────────────────────────────────────────────────────────────────────────

export function normalizeServing(
  serving: FatSecretServing,
  foodName: string,
  opts: {
    brand?:      string;
    externalId?: string;
    confidence?: number;
  } = {}
): FatSecretFoodItem {
  return {
    name:               foodName,
    brand:              opts.brand,
    servingDescription: serving.serving_description,
    calories:           parseApiNumber(serving.calories)     || undefined,
    protein:            parseApiNumber(serving.protein)      || undefined,
    carbs:              parseApiNumber(serving.carbohydrate) || undefined,
    fat:                parseApiNumber(serving.fat)          || undefined,
    fiber:              serving.fiber ? parseApiNumber(serving.fiber) : undefined,
    confidence:         opts.confidence,
    externalId:         opts.externalId,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Soma os totais de um array de FatSecretFoodItem
// ──────────────────────────────────────────────────────────────────────────────

export function sumNutritionTotals(
  items: FatSecretFoodItem[]
): FatSecretAnalysisResult['totals'] {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories ?? 0),
      protein:  acc.protein  + (item.protein  ?? 0),
      carbs:    acc.carbs    + (item.carbs    ?? 0),
      fat:      acc.fat      + (item.fat      ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Gera descrição textual a partir da lista de alimentos
// ──────────────────────────────────────────────────────────────────────────────

export function buildMealDescription(items: FatSecretFoodItem[]): string {
  if (items.length === 0) return 'Refeição registrada via foto';
  const names = items
    .slice(0, 4)                       // máximo 4 itens na descrição
    .map(i => i.name)
    .filter(Boolean);
  const description = names.join(', ');
  return items.length > 4
    ? `${description} e mais ${items.length - 4} item(s)`
    : description;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Converte FatSecretMealType → NormalizedMealType
// ──────────────────────────────────────────────────────────────────────────────

export function toNormalizedMealType(
  mealType?: FatSecretMealType
): NormalizedMealType {
  if (!mealType) return inferMealTypeFromHour();
  return MEAL_TYPE_MAP[mealType];
}

/** Infere tipo de refeição pelo horário atual (fallback quando mealType não informado) */
function inferMealTypeFromHour(): NormalizedMealType {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 19) return 'snack';
  return 'dinner';
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Função principal: FatSecretAnalysisResult → NormalizedMealFromPhoto
//    Pronta para ser salva em glpy_refeicoes_hoje (BUG 15B+)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Normaliza o resultado do endpoint /api/fatsecret-food para o formato
 * compatível com MealEntry (glpy_refeicoes_hoje).
 *
 * ⚠️  NÃO persiste em localStorage. Apenas transforma o dado.
 *     A persistência é responsabilidade do App.tsx (onSave handler).
 *
 * @param result  Resposta bem-sucedida de /api/fatsecret-food
 * @param mealType  Tipo de refeição selecionado pelo usuário (opcional)
 * @returns NormalizedMealFromPhoto — pronto para uso em BUG 15B+
 */
export function normalizeFatSecretResult(
  result: FatSecretAnalysisResult,
  mealType?: FatSecretMealType
): NormalizedMealFromPhoto {
  const totals = result.totals;

  return {
    mealType:    toNormalizedMealType(mealType),
    description: buildMealDescription(result.items),
    photoAdded:  true,
    savedAt:     Date.now(),
    calories:    totals.calories > 0 ? totals.calories : undefined,
    protein:     totals.protein  > 0 ? totals.protein  : undefined,
    carbs:       totals.carbs    > 0 ? totals.carbs    : undefined,
    fat:         totals.fat      > 0 ? totals.fat      : undefined,
    source:      'fatsecret',
    items:       result.items,
  };
}
