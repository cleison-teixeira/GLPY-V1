// GLPY — Gemini Food Vision Service
// BUG 15C.1: Detecta alimentos em fotos via Gemini Vision (server-side)
//
// Não salva em localStorage.
// Não chama FatSecret.
// Não expõe GEMINI_KEY — a chave fica exclusivamente em api/gemini-food-vision.ts.
//
// Uso:
//   import { detectFoodsFromPhoto } from '../services/geminiFoodVision';
//   const result = await detectFoodsFromPhoto(imageBase64);
//   if (result.ok) { /* result.detectedFoods, result.summary */ }

// ──────────────────────────────────────────────────────────────────────────────
// Tipos públicos
// ──────────────────────────────────────────────────────────────────────────────

export interface DetectedFood {
  /** Nome do alimento em português — usado na exibição */
  name:         string;
  /** Termo em inglês otimizado para busca nutricional (FatSecret) */
  searchQuery?: string;
  /** Confiança do Gemini (0.0 – 1.0) */
  confidence:   number;
  /** Estimativa de porção: "porção média", "1 fatia" etc. */
  portionGuess: string;
}

export interface GeminiVisionSuccess {
  ok:            true;
  detectedFoods: DetectedFood[];
  /** Frase descritiva do prato gerada pelo Gemini */
  summary:       string;
}

export interface GeminiVisionError {
  ok:    false;
  error: string;
}

export type GeminiVisionResult = GeminiVisionSuccess | GeminiVisionError;

// ──────────────────────────────────────────────────────────────────────────────
// Função principal
// ──────────────────────────────────────────────────────────────────────────────

export async function detectFoodsFromPhoto(imageBase64: string): Promise<GeminiVisionResult> {
  try {
    const res = await fetch('/api/gemini-food-vision', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ imageBase64 }),
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return {
        ok:    false,
        error: 'Não conseguimos identificar os alimentos automaticamente agora.',
      };
    }

    const d = data as any;

    if (!d?.success) {
      return {
        ok:    false,
        error: d?.error ?? 'Não conseguimos identificar os alimentos automaticamente agora.',
      };
    }

    return {
      ok:            true,
      detectedFoods: Array.isArray(d.detectedFoods) ? d.detectedFoods : [],
      summary:       typeof d.summary === 'string' ? d.summary : '',
    };
  } catch {
    return {
      ok:    false,
      error: 'Não conseguimos identificar os alimentos automaticamente agora.',
    };
  }
}
