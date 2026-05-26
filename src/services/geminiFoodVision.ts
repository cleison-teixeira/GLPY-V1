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
    console.log('[FoodPhoto] calling Gemini Vision — base64Len=', imageBase64.length);

    const res = await fetch('/api/gemini-food-vision', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ imageBase64 }),
    });

    console.log('[FoodPhoto] Gemini HTTP status=', res.status, '| content-type=', res.headers.get('content-type'));

    // Lê como texto primeiro para diagnóstico seguro
    const rawText = await res.text();

    if (!rawText || rawText.trim().length === 0) {
      console.error('[FoodPhoto] Gemini — body vazio. Endpoint /api/gemini-food-vision não está servido localmente (use vercel dev).');
      return {
        ok:    false,
        error: 'Endpoint de análise indisponível localmente. Execute com vercel dev.',
      };
    }

    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('[FoodPhoto] Gemini — JSON parse falhou. Status=', res.status, '| Raw (300):', rawText.slice(0, 300));
      return {
        ok:    false,
        error: 'Não conseguimos identificar os alimentos automaticamente agora.',
      };
    }

    const d = data as any;

    if (!d?.success) {
      console.error('[FoodPhoto] Gemini — success=false:', d?.error, '| debug:', JSON.stringify(d?.debug ?? {}));
      return {
        ok:    false,
        error: d?.error ?? 'Não conseguimos identificar os alimentos automaticamente agora.',
      };
    }

    console.log('[FoodPhoto] Gemini success — detectedFoods=', Array.isArray(d.detectedFoods) ? d.detectedFoods.length : 0);
    return {
      ok:            true,
      detectedFoods: Array.isArray(d.detectedFoods) ? d.detectedFoods : [],
      summary:       typeof d.summary === 'string' ? d.summary : '',
    };
  } catch (err) {
    console.error('[FoodPhoto] Gemini fetch exception:', {
      message: (err as any)?.message,
      name:    (err as any)?.name,
      stack:   (err as any)?.stack?.slice(0, 300),
    });
    return {
      ok:    false,
      error: 'Não conseguimos identificar os alimentos automaticamente agora.',
    };
  }
}
