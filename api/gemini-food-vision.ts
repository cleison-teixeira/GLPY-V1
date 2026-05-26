// GLPY — Gemini Vision API — Serverless Endpoint
// BUG 15C.1: Identifica alimentos em fotos via Gemini Vision
//            Não conecta com FatSecret. Não salva em localStorage.
//
// Rota Vercel: POST /api/gemini-food-vision
//
// Variáveis de ambiente necessárias (Vercel dashboard — server-side):
//   GEMINI_KEY → obtido em aistudio.google.com
//
// ⚠️  SEGURANÇA:
//     Nunca usar VITE_ prefix para essa chave.
//     VITE_ expõe a variável no bundle JavaScript do browser.
//     GEMINI_KEY só existe no processo Node.js da Vercel.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ──────────────────────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────────────────────

interface RequestPayload {
  imageBase64: string;
}

interface DetectedFood {
  name:         string;
  searchQuery?: string;
  confidence:   number;
  portionGuess: string;
}

interface SuccessResponse {
  success:       true;
  detectedFoods: DetectedFood[];
  summary:       string;
}

interface ErrorResponse {
  success: false;
  error:   string;
  debug?: {
    stage:       string;
    modelsTried: string[];
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Modelos com fallback — tenta na ordem até um funcionar
// ──────────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const VISION_PROMPT = `Analise a foto de uma refeição.
Responda somente em JSON válido, sem markdown, sem blocos de código.
Identifique os alimentos mais prováveis no prato.
Não invente macros.
Não dê diagnóstico médico.
Use nomes de alimentos em português do Brasil no campo "name".
No campo "searchQuery", use o nome do alimento em inglês simples, otimizado para busca em base nutricional (ex: "egg", "strawberry yogurt", "instant noodles", "grilled chicken", "white rice").
Se não tiver certeza, retorne sugestões prováveis com confidence baixo.
O campo confidence deve ser um número entre 0.0 e 1.0.
Formato de resposta obrigatório:
{
  "detectedFoods": [
    {
      "name": "Iogurte de Morango",
      "searchQuery": "strawberry yogurt",
      "confidence": 0.95,
      "portionGuess": "garrafa grande"
    }
  ],
  "summary": "Resumo do prato em uma frase."
}`;

// ──────────────────────────────────────────────────────────────────────────────
// Helper: tenta um modelo específico, retorna a Response ou null se 404/modelo
// ──────────────────────────────────────────────────────────────────────────────

async function tryGeminiModel(
  model: string,
  apiKey: string,
  imageBase64: string,
): Promise<Response | null> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: VISION_PROMPT },
          ],
        }],
        generationConfig: {
          temperature:     0.2,
          maxOutputTokens: 1024,
          thinkingConfig:  { thinkingBudget: 0 },
        },
      }),
    });
  } catch (networkErr) {
    console.error(`[GeminiVision][${model}] network error: ${String(networkErr).slice(0, 100)}`);
    return null;
  }

  console.log(`[GeminiVision][${model}] status=${res.status}`);

  // 404 = modelo indisponível para esta conta → tentar próximo
  if (res.status === 404) {
    const snippet = (await res.text()).slice(0, 150).replace(/[\n\r]/g, ' ');
    console.warn(`[GeminiVision][${model}] modelo indisponível: ${snippet}`);
    return null;
  }

  return res;
}

// ──────────────────────────────────────────────────────────────────────────────
// Handler principal
// ──────────────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' } satisfies ErrorResponse);
    return;
  }

  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    console.error('[GeminiVision] Variável de ambiente ausente: GEMINI_KEY');
    res.status(500).json({
      success: false,
      error:   'Serviço de visão não configurado no servidor.',
    } satisfies ErrorResponse);
    return;
  }

  const body = req.body as Partial<RequestPayload>;
  if (!body.imageBase64) {
    res.status(400).json({
      success: false,
      error:   "Campo 'imageBase64' é obrigatório.",
    } satisfies ErrorResponse);
    return;
  }

  console.log(`[GeminiVision] imageBase64Length=${body.imageBase64.length}`);

  // ── Loop de fallback pelos modelos ────────────────────────────────────────

  const modelsTried: string[] = [];
  let geminiRes: Response | null = null;
  let usedModel = '';

  for (const model of GEMINI_MODEL_FALLBACKS) {
    modelsTried.push(model);
    const attempt = await tryGeminiModel(model, apiKey, body.imageBase64);

    if (attempt === null) continue; // 404 ou network error → próximo

    if (!attempt.ok) {
      const errText = await attempt.text();
      console.error(`[GeminiVision][${model}] erro ${attempt.status}: ${errText.slice(0, 150).replace(/[\n\r]/g, ' ')}`);
      // Erro não-404 (ex: 400, 429, 500) → não tenta próximo modelo
      res.status(502).json({
        success: false,
        error:   'Não conseguimos identificar os alimentos automaticamente agora.',
      } satisfies ErrorResponse);
      return;
    }

    geminiRes = attempt;
    usedModel = model;
    break;
  }

  if (!geminiRes) {
    console.error(`[GeminiVision] todos os modelos falharam: ${modelsTried.join(', ')}`);
    res.status(502).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
      debug: {
        stage:       'gemini_model_unavailable',
        modelsTried,
      },
    } satisfies ErrorResponse);
    return;
  }

  // ── Parse resposta Gemini ──────────────────────────────────────────────────

  let geminiData: unknown;
  try {
    geminiData = await geminiRes.json();
  } catch {
    console.error(`[GeminiVision][${usedModel}] falha ao parsear resposta`);
    res.status(502).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  // ── Selecionar a part correta, ignorando thinking parts ─────────────────
  // gemini-2.5-flash pode retornar parts[0] com thought:true (raciocínio interno)
  // e a resposta JSON real em parts[1] ou posterior.
  const parts: any[] = (geminiData as any)?.candidates?.[0]?.content?.parts ?? [];

  const textPart: any =
    // 1ª prioridade: part não-thought com texto
    parts.find((p: any) => !p.thought && typeof p.text === 'string' && p.text.trim().length > 0) ??
    // 2ª prioridade: qualquer part contendo "detectedFoods" (fallback extremo)
    parts.find((p: any) => typeof p.text === 'string' && p.text.includes('detectedFoods')) ??
    null;

  const rawText: string = textPart?.text ?? '';

  const thoughtCount = parts.filter((p: any) => p.thought).length;
  console.log(`[GeminiVision][${usedModel}] parts=${parts.length} thoughts=${thoughtCount} rawLen=${rawText.length}`);
  console.log(`[GeminiVision][${usedModel}] raw text: ${rawText.slice(0, 300).replace(/[\n\r]/g, ' ')}`);

  // Remove possíveis blocos markdown ```json ... ``` que o Gemini às vezes emite
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  let parsed: unknown;
  let parseFailed = false;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: extrair objeto JSON de dentro do texto se houver preamble residual
    const jsonMatch = cleaned.match(/\{[\s\S]*"detectedFoods"[\s\S]*\}/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[0]); } catch { parseFailed = true; }
    } else {
      parseFailed = true;
    }
  }

  if (parseFailed || parsed === undefined) {
    console.error(`[GeminiVision][${usedModel}] JSON parse falhou. Raw: ${rawText.slice(0, 200).replace(/[\n\r]/g, ' ')}`);
    res.status(200).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  // ── Normalização defensiva dos alimentos detectados ───────────────────────

  const rawFoods = (parsed as any)?.detectedFoods;
  if (!Array.isArray(rawFoods) || rawFoods.length === 0) {
    console.warn(`[GeminiVision][${usedModel}] detectedFoods ausente ou vazio`);
    res.status(200).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  const detectedFoods: DetectedFood[] = rawFoods.slice(0, 8).map((f: any) => ({
    name:         String(f?.name ?? 'Alimento desconhecido'),
    searchQuery:  f?.searchQuery ? String(f.searchQuery) : undefined,
    confidence:   typeof f?.confidence === 'number'
                    ? Math.min(1, Math.max(0, f.confidence))
                    : 0.5,
    portionGuess: String(f?.portionGuess ?? 'porção média'),
  }));

  const summary = String((parsed as any)?.summary ?? 'Alimentos identificados na imagem.');

  console.log(`[GeminiVision][${usedModel}] ok — ${detectedFoods.length} alimento(s) detectado(s)`);

  res.status(200).json({
    success: true,
    detectedFoods,
    summary,
  } satisfies SuccessResponse);
}
