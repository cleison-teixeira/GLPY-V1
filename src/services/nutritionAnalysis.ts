// GLPY — Nutrition Analysis Service
// Sprint 17B.21: Análise nutricional por descrição de texto em PT-BR via IA
//
// Fonte principal: DeepSeek via /api/nutrition/analyze-meal (server-side)
// FatSecret: desativado como fonte principal (resultados ruins em PT-BR no plano gratuito)
//            mantido comentado abaixo para reativar em V2 se credenciais forem atualizadas
//
// Segurança: nenhuma chave de API no front-end.
//            Todo processamento é server-side.

const ANALYZE_ENDPOINT = '/api/nutrition/analyze-meal';

// ── Types ─────────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionItem {
  name:      string;
  quantity:  string;
  calories:  number;
  protein:   number;
  carbs:     number;
  fat:       number;
}

export interface NutritionAnalysisResult {
  title:      string;
  calories:   number;
  protein:    number;
  carbs:      number;
  fat:        number;
  confidence: 'low' | 'medium' | 'high';
  source:     'ai' | 'fallback';
  items:      NutritionItem[];
}

// ── Mapeamento de tipos ───────────────────────────────────────────────────────

type FatSecretMealType = 'cafe' | 'almoco' | 'jantar' | 'lanche';

const API_MEAL_TYPE: Record<MealType, FatSecretMealType> = {
  breakfast: 'cafe',
  lunch:     'almoco',
  dinner:    'jantar',
  snack:     'lanche',
};

// ── Função principal ──────────────────────────────────────────────────────────

export async function analyzeMealDescription(
  description: string,
  mealType: MealType,
): Promise<{ ok: true; result: NutritionAnalysisResult } | { ok: false; error: string }> {
  const trimmed = description.trim();
  if (!trimmed) {
    return { ok: false, error: 'Descreva sua refeição antes de analisar.' };
  }

  try {
    const response = await fetch(ANALYZE_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        description: trimmed,
        mealType:    API_MEAL_TYPE[mealType],
      }),
    });

    const data = await response.json();

    if (data.success === true) {
      return {
        ok: true,
        result: {
          title:      data.title,
          calories:   data.calories,
          protein:    data.protein,
          carbs:      data.carbs,
          fat:        data.fat,
          confidence: data.confidence,
          source:     'ai',
          items:      (data.items ?? []) as NutritionItem[],
        },
      };
    }

    // Endpoint retornou erro semântico com mensagem amigável
    return {
      ok:    false,
      error: data.error ?? 'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes.',
    };

  } catch {
    return {
      ok:    false,
      error: 'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    };
  }
}

// ── FatSecret (V2) ────────────────────────────────────────────────────────────
// Desativado: foods.search não é útil para PT-BR no plano gratuito.
// Reativar em V2 quando:
//   1. Migrar para plano FatSecret com NLP (food.search.v3)
//   2. Usar FatSecret apenas para enriquecer itens já identificados pela IA
//
// import { searchFoodAndNormalize } from './fatsecret/fatsecretClient';
