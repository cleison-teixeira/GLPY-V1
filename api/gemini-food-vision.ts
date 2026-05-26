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
}

// ──────────────────────────────────────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.0-flash-001';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const VISION_PROMPT = `Analise a foto de uma refeição.
Responda somente em JSON válido, sem markdown, sem blocos de código.
Identifique os alimentos mais prováveis no prato.
Não invente macros.
Não dê diagnóstico médico.
Use nomes de alimentos em português do Brasil.
Se não tiver certeza, retorne sugestões prováveis com confidence baixo.
O campo confidence deve ser um número entre 0.0 e 1.0.
Formato de resposta obrigatório:
{
  "detectedFoods": [
    {
      "name": "nome do alimento",
      "confidence": 0.82,
      "portionGuess": "porção média"
    }
  ],
  "summary": "Resumo do prato em uma frase."
}`;

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

  // ── Chamada Gemini Vision ──────────────────────────────────────────────────

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: body.imageBase64 } },
            { text: VISION_PROMPT },
          ],
        }],
        generationConfig: {
          temperature:      0.2,
          maxOutputTokens:  512,
        },
      }),
    });
  } catch (networkErr) {
    console.error('[GeminiVision] network error:', String(networkErr).slice(0, 120));
    res.status(502).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error(`[GeminiVision] erro ${geminiRes.status}: ${errText.slice(0, 150).replace(/[\n\r]/g, ' ')}`);
    res.status(502).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  // ── Parse resposta Gemini ──────────────────────────────────────────────────

  let geminiData: unknown;
  try {
    geminiData = await geminiRes.json();
  } catch {
    console.error('[GeminiVision] falha ao parsear resposta do Gemini');
    res.status(502).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  const rawText: string =
    (geminiData as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  console.log('[GeminiVision] raw text:', rawText.slice(0, 300).replace(/[\n\r]/g, ' '));

  // Remove possíveis blocos markdown ```json ... ``` que o Gemini às vezes emite
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[GeminiVision] JSON parse falhou. Raw:', rawText.slice(0, 200).replace(/[\n\r]/g, ' '));
    res.status(200).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  // ── Normalização defensiva dos alimentos detectados ───────────────────────

  const rawFoods = (parsed as any)?.detectedFoods;
  if (!Array.isArray(rawFoods) || rawFoods.length === 0) {
    console.warn('[GeminiVision] detectedFoods ausente ou vazio');
    res.status(200).json({
      success: false,
      error:   'Não conseguimos identificar os alimentos automaticamente agora.',
    } satisfies ErrorResponse);
    return;
  }

  const detectedFoods: DetectedFood[] = rawFoods.slice(0, 8).map((f: any) => ({
    name:         String(f?.name ?? 'Alimento desconhecido'),
    confidence:   typeof f?.confidence === 'number'
                    ? Math.min(1, Math.max(0, f.confidence))
                    : 0.5,
    portionGuess: String(f?.portionGuess ?? 'porção média'),
  }));

  const summary = String((parsed as any)?.summary ?? 'Alimentos identificados na imagem.');

  console.log(`[GeminiVision] ok — ${detectedFoods.length} alimento(s) detectado(s)`);

  res.status(200).json({
    success: true,
    detectedFoods,
    summary,
  } satisfies SuccessResponse);
}
