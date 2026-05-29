// GLPY — Nutrition Meal Analyzer — Serverless Endpoint
// Sprint 17B.21: Análise nutricional por descrição de texto em PT-BR via IA
//
// Rota Vercel: POST /api/nutrition/analyze-meal
//
// Variáveis de ambiente necessárias (Vercel — server-side, sem prefixo VITE_):
//   DEEPSEEK_KEY → platform.deepseek.com
//
// ⚠️  SEGURANÇA: nunca usar VITE_ prefix.
//     Esta rota é chamada pelo front-end via fetch.
//     A chave fica exclusivamente no processo Node.js da Vercel.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type MealType  = 'cafe' | 'almoco' | 'jantar' | 'lanche';
type Confidence = 'low' | 'medium' | 'high';

interface RequestPayload {
  description: string;
  mealType?:   MealType;
}

export interface MealItem {
  name:      string;
  quantity:  string;
  calories:  number;
  protein:   number;
  carbs:     number;
  fat:       number;
}

export interface AnalyzeSuccessResponse {
  success:    true;
  title:      string;
  calories:   number;
  protein:    number;
  carbs:      number;
  fat:        number;
  confidence: Confidence;
  source:     'ai';
  items:      MealItem[];
}

interface AnalyzeErrorResponse {
  success: false;
  error:   string;
}

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um estimador nutricional especializado em alimentação brasileira para usuários em jornada GLP-1.

A partir da descrição de uma refeição em português brasileiro, estime os macronutrientes de forma realista e conservadora.

REGRAS:
- Use porções médias brasileiras quando a quantidade não for informada
  (ex: "1 bife médio" = 100g, "1 prato de arroz" = 150g, "1 concha de feijão" = 80g)
- Seja conservador: prefira subestimar a superestimar
- Não dê conselhos médicos nem mencione medicamentos
- Retorne SOMENTE JSON válido, sem markdown, sem blocos de código, sem texto adicional

FORMATO OBRIGATÓRIO (respeite exatamente os campos):
{
  "title": "Nome resumido da refeição (máx 50 caracteres)",
  "calories": número inteiro,
  "protein": número inteiro em gramas,
  "carbs": número inteiro em gramas,
  "fat": número inteiro em gramas,
  "confidence": "low" | "medium" | "high",
  "source": "ai",
  "items": [
    {
      "name": "Nome do alimento",
      "quantity": "Porção estimada",
      "calories": número inteiro,
      "protein": número inteiro,
      "carbs": número inteiro,
      "fat": número inteiro
    }
  ]
}

CONFIDENCE:
- "high": descrição clara com quantidades ("2 ovos mexidos", "100g de frango")
- "medium": descrição razoável sem quantidades exatas ("frango com batata")
- "low": descrição vaga ou ambígua ("comida", "almoço")

TOTAIS: calories/protein/carbs/fat do objeto raiz devem ser a SOMA dos items.
Se não for possível identificar nenhum alimento: retorne erro {"error": "descrição não reconhecida"}.`;

const MEAL_LABELS: Record<string, string> = {
  cafe:   'café da manhã',
  almoco: 'almoço',
  jantar: 'jantar',
  lanche: 'lanche',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function cleanJson(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i,     '')
    .replace(/\s*```\s*$/i,  '')
    .trim();
}

function isValidResult(p: unknown): p is AnalyzeSuccessResponse {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.title    === 'string'  && o.title.length > 0 &&
    typeof o.calories === 'number'  &&
    typeof o.protein  === 'number'  &&
    typeof o.carbs    === 'number'  &&
    typeof o.fat      === 'number'  &&
    ['low', 'medium', 'high'].includes(o.confidence as string) &&
    o.source === 'ai' &&
    Array.isArray(o.items)
  );
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' } satisfies AnalyzeErrorResponse);
    return;
  }

  // Valida input antes de verificar chaves (fail fast, erros úteis para o usuário)
  const body        = req.body as Partial<RequestPayload>;
  const description = (body.description ?? '').trim();
  const mealType    = body.mealType ?? 'almoco';

  if (!description) {
    res.status(400).json({
      success: false,
      error:   'Descreva sua refeição antes de analisar.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  if (description.length > 500) {
    res.status(400).json({
      success: false,
      error:   'Descrição muito longa. Use até 500 caracteres.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  const apiKey = process.env.DEEPSEEK_KEY;
  if (!apiKey) {
    console.error('[AnalyzeMeal] DEEPSEEK_KEY ausente');
    res.status(500).json({
      success: false,
      error:   'Serviço de análise não configurado. Contate o suporte.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  const mealLabel  = MEAL_LABELS[mealType] ?? 'refeição';
  const userMessage = `Tipo de refeição: ${mealLabel}\nDescrição: ${description}`;

  console.log(`[AnalyzeMeal] mealType=${mealType} desc="${description.slice(0, 80)}"`);

  let dsRes: Response;
  try {
    dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'deepseek-chat',
        temperature: 0.2,
        max_tokens:  700,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage   },
        ],
      }),
    });
  } catch (networkErr) {
    console.error(`[AnalyzeMeal] network error: ${String(networkErr).slice(0, 100)}`);
    res.status(502).json({
      success: false,
      error:   'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  if (!dsRes.ok) {
    const errText = (await dsRes.text()).slice(0, 150).replace(/[\n\r]/g, ' ');
    console.error(`[AnalyzeMeal] DeepSeek erro ${dsRes.status}: ${errText}`);
    res.status(502).json({
      success: false,
      error:   'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  let dsData: unknown;
  try {
    dsData = await dsRes.json();
  } catch {
    res.status(502).json({
      success: false,
      error:   'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  const rawText: string = (dsData as any)?.choices?.[0]?.message?.content ?? '';
  console.log(`[AnalyzeMeal] raw: ${rawText.slice(0, 300).replace(/[\n\r]/g, ' ')}`);

  // Se a IA retornou um erro semântico (ex: {"error": "..."})
  if (rawText.trim().startsWith('{"error"')) {
    res.status(200).json({
      success: false,
      error:   'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJson(rawText));
  } catch {
    console.error(`[AnalyzeMeal] JSON parse falhou: ${rawText.slice(0, 200)}`);
    res.status(200).json({
      success: false,
      error:   'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  if (!isValidResult(parsed)) {
    console.error(`[AnalyzeMeal] resultado inválido: ${JSON.stringify(parsed).slice(0, 200)}`);
    res.status(200).json({
      success: false,
      error:   'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  // Rejeita macros todos zerados
  const allZero = parsed.calories === 0 && parsed.protein === 0 && parsed.carbs === 0 && parsed.fat === 0;
  if (allZero) {
    console.error('[AnalyzeMeal] macros zerados — rejeita');
    res.status(200).json({
      success: false,
      error:   'Não consegui estimar essa refeição agora. Tente descrever com mais detalhes, por exemplo: 1 bife médio, 3 colheres de arroz e 1 concha de feijão.',
    } satisfies AnalyzeErrorResponse);
    return;
  }

  // Normaliza números (garante inteiros não-negativos)
  const normalize = (n: number) => Math.max(0, Math.round(n));
  const normalizeItems = (items: MealItem[]): MealItem[] =>
    items.map(item => ({
      name:     String(item.name     ?? ''),
      quantity: String(item.quantity ?? ''),
      calories: normalize(item.calories ?? 0),
      protein:  normalize(item.protein  ?? 0),
      carbs:    normalize(item.carbs    ?? 0),
      fat:      normalize(item.fat      ?? 0),
    }));

  const response: AnalyzeSuccessResponse = {
    success:    true,
    title:      String(parsed.title).slice(0, 60),
    calories:   normalize(parsed.calories),
    protein:    normalize(parsed.protein),
    carbs:      normalize(parsed.carbs),
    fat:        normalize(parsed.fat),
    confidence: parsed.confidence,
    source:     'ai',
    items:      normalizeItems(parsed.items),
  };

  console.log(`[AnalyzeMeal] ok — "${response.title}" cal=${response.calories} prot=${response.protein}g confidence=${response.confidence}`);
  res.status(200).json(response satisfies AnalyzeSuccessResponse);
}
