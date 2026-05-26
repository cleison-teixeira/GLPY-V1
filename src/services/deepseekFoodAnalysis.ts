// GLPY — DeepSeek Food Analysis Service
// BUG 15D: Chama /api/deepseek-food-analysis para análise GLP-1 do prato.
//
// DEEPSEEK_KEY fica exclusivamente em api/deepseek-food-analysis.ts (server-side).
// Este arquivo nunca expõe a chave.

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export interface DeepSeekFoodPayload {
  foodName:       string;
  fatSecretName?: string;
  mealType:       'cafe' | 'almoco' | 'jantar' | 'lanche';
  calories:       number;
  protein:        number;
  carbs:          number;
  fat:            number;
  portion?:       string;
  detectedFoods?: Array<{
    name:          string;
    portionGuess?: string;
    confidence?:   number;
  }>;
}

export interface DeepSeekFoodAnalysis {
  title:          string;
  summary:        string;
  proteinInsight: string;
  glp1Tip:        string;
  status:         'bom' | 'atencao' | 'ajustar';
  suggestion?:    string;
}

export interface DeepSeekFoodSuccess {
  ok:       true;
  analysis: DeepSeekFoodAnalysis;
}

export interface DeepSeekFoodError {
  ok:    false;
  error: string;
}

export type DeepSeekFoodResult = DeepSeekFoodSuccess | DeepSeekFoodError;

// ── Função principal ───────────────────────────────────────────────────────────

export async function analyzeFoodWithDeepSeek(
  payload: DeepSeekFoodPayload,
): Promise<DeepSeekFoodResult> {
  try {
    const res = await fetch('/api/deepseek-food-analysis', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return { ok: false, error: 'Não conseguimos gerar a análise agora.' };
    }

    const d = data as any;
    if (!d?.success) {
      return { ok: false, error: d?.error ?? 'Não conseguimos gerar a análise agora.' };
    }

    return { ok: true, analysis: d.analysis as DeepSeekFoodAnalysis };
  } catch {
    return { ok: false, error: 'Não conseguimos gerar a análise agora.' };
  }
}
