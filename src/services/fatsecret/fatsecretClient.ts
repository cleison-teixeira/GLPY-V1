// GLPY — FatSecret Service — Front-end Client
// BUG 15A: Camada de acesso segura ao endpoint serverless
//
// ⚠️  SEGURANÇA:
//     Esta função chama APENAS /api/fatsecret-food (serverless Vercel).
//     Nunca chama api.fatsecret.com diretamente do browser.
//     FATSECRET_CLIENT_ID e FATSECRET_CLIENT_SECRET ficam no servidor.

import type {
  FatSecretRequestPayload,
  FatSecretResult,
  FatSecretAnalysisResult,
  FatSecretMealType,
  NormalizedMealFromPhoto,
} from './types';
import { normalizeFatSecretResult } from './normalizeFatSecret';

// ──────────────────────────────────────────────────────────────────────────────
// Constante de endpoint — nunca aponta para api.fatsecret.com diretamente
// ──────────────────────────────────────────────────────────────────────────────

const FATSECRET_ENDPOINT = '/api/fatsecret-food';

// ──────────────────────────────────────────────────────────────────────────────
// 1. Função principal: envia payload → endpoint serverless → retorna resultado
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Envia uma requisição de análise de alimento para o endpoint serverless seguro.
 *
 * @param payload  Dados da requisição (imagem ou texto)
 * @returns FatSecretResult com success:true/false
 *
 * ⚠️  Nunca chama FatSecret diretamente. Sempre via /api/fatsecret-food.
 */
export async function analyzeFoodWithFatSecret(
  payload: FatSecretRequestPayload
): Promise<FatSecretResult> {
  try {
    const response = await fetch(FATSECRET_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data: FatSecretResult = await response.json();

    if (!response.ok) {
      // Endpoint pode ter retornado erro HTTP com body { success: false, error }
      if (!data.success) return data;
      return {
        success: false,
        error: `Erro HTTP ${response.status} do servidor`,
      };
    }

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[FatSecretClient] Falha na requisição:', message);
    return {
      success: false,
      error: `Falha ao conectar com o servidor de análise: ${message}`,
    };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Conveniência: analisa imagem e retorna resultado normalizado (MealEntry)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Analisa uma imagem de prato e retorna um NormalizedMealFromPhoto.
 *
 * @param imageBase64  Imagem em base64 (SEM prefixo "data:image/jpeg;base64,")
 * @param mealType     Tipo de refeição selecionado pelo usuário (opcional)
 * @returns NormalizedMealFromPhoto pronto para uso em BUG 15B+
 *
 * ⚠️  NÃO persiste em localStorage. Apenas analisa e normaliza.
 */
export async function analyzePhotoAndNormalize(
  imageBase64: string,
  mealType?: FatSecretMealType
): Promise<{ ok: true; meal: NormalizedMealFromPhoto } | { ok: false; error: string }> {
  const result = await analyzeFoodWithFatSecret({
    mode: 'image',
    imageBase64,
    locale:   'pt-BR',
    mealType: mealType ?? undefined,
  });

  if (!result.success) {
    return { ok: false, error: result.error };
  }

  const meal = normalizeFatSecretResult(result as FatSecretAnalysisResult, mealType);
  return { ok: true, meal };
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Conveniência: busca alimento por texto
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Busca alimentos por texto (modo search) e retorna resultado normalizado.
 *
 * @param query     Texto de busca (ex: "frango grelhado", "arroz integral")
 * @param mealType  Tipo de refeição (opcional)
 */
export async function searchFoodAndNormalize(
  query: string,
  mealType?: FatSecretMealType
): Promise<{ ok: true; meal: NormalizedMealFromPhoto } | { ok: false; error: string }> {
  const result = await analyzeFoodWithFatSecret({
    mode: 'search',
    query,
    locale:   'pt-BR',
    mealType: mealType ?? undefined,
  });

  if (!result.success) {
    return { ok: false, error: result.error };
  }

  const meal = normalizeFatSecretResult(result as FatSecretAnalysisResult, mealType);
  return { ok: true, meal };
}
