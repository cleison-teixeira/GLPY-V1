// GLPY — DeepSeek Food Analysis — Serverless Endpoint
// BUG 15D: Análise GLP-1 contextual do prato
//
// Rota Vercel: POST /api/deepseek-food-analysis
//
// Variáveis de ambiente necessárias (Vercel — server-side):
//   DEEPSEEK_KEY → obtido em platform.deepseek.com
//
// ⚠️  SEGURANÇA: nunca usar VITE_ prefix para essa chave.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface RequestPayload {
  foodName:      string;
  fatSecretName?: string;
  mealType:      'cafe' | 'almoco' | 'jantar' | 'lanche';
  calories:      number;
  protein:       number;
  carbs:         number;
  fat:           number;
  portion?:      string;
  detectedFoods?: Array<{
    name:         string;
    portionGuess?: string;
    confidence?:  number;
  }>;
}

interface FoodAnalysis {
  title:          string;
  summary:        string;
  proteinInsight: string;
  glp1Tip:        string;
  status:         'bom' | 'atencao' | 'ajustar';
  suggestion?:    string;
}

interface SuccessResponse {
  success:  true;
  analysis: FoodAnalysis;
}

interface ErrorResponse {
  success: false;
  error:   string;
}

// ── Prompt ─────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é a inteligência nutricional do GLPY, app de acompanhamento para usuários de GLP-1.

Analise os dados de uma refeição estimada por IA e FatSecret.

LIMITES DE CARACTERES — respeite exatamente:
- title: máximo 45 caracteres
- summary: máximo 110 caracteres
- proteinInsight: máximo 120 caracteres
- glp1Tip: máximo 120 caracteres
- suggestion: máximo 100 caracteres

ESTILO:
- frases curtas, sem repetir ideias entre campos
- linguagem leiga, sem termos médicos
- tom acolhedor, nunca alarmista
- preferir "ajuda a proteger massa magra" (não "risco de perda")
- preferir "ajuda na saciedade" (não "pode comprometer")
- suggestion: concreta e leve, ex: "Adicione ovo ou iogurte proteico."

STATUS:
- proteína < 10g → "atencao"
- proteína 10–20g → "ajustar" (carbs altos ou calorias baixas) ou "bom" (equilibrada)
- proteína > 20g → "bom"

SUGGESTION:
- "bom": omitir ou sugestão leve
- "ajustar" / "atencao": sugestão prática obrigatória

NUNCA: mencionar dose, medicação, diagnóstico ou prometer resultado.

Responda somente JSON válido, sem markdown, sem blocos de código.
Formato obrigatório:
{
  "title": "até 45 caracteres",
  "summary": "até 110 caracteres",
  "proteinInsight": "até 120 caracteres",
  "glp1Tip": "até 120 caracteres",
  "status": "bom|atencao|ajustar",
  "suggestion": "até 100 caracteres (opcional)"
}`;

const MEAL_LABELS: Record<string, string> = {
  cafe:   'café da manhã',
  almoco: 'almoço',
  jantar: 'jantar',
  lanche: 'lanche',
};

// ── Handler ────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' } satisfies ErrorResponse);
    return;
  }

  const apiKey = process.env.DEEPSEEK_KEY;
  if (!apiKey) {
    console.error('[DeepSeekFood] DEEPSEEK_KEY ausente');
    res.status(500).json({ success: false, error: 'Serviço de análise não configurado.' } satisfies ErrorResponse);
    return;
  }

  const body = req.body as Partial<RequestPayload>;
  if (!body.foodName || body.calories == null || body.protein == null || body.carbs == null || body.fat == null) {
    res.status(400).json({ success: false, error: 'Dados de refeição incompletos.' } satisfies ErrorResponse);
    return;
  }

  const mealLabel = MEAL_LABELS[body.mealType ?? 'almoco'] ?? 'refeição';

  const extras = body.detectedFoods && body.detectedFoods.length > 1
    ? `\nOutros alimentos identificados: ${body.detectedFoods.slice(1).map(f => f.name).join(', ')}`
    : '';

  const userMessage =
    `Refeição: ${body.foodName}` +
    (body.fatSecretName && body.fatSecretName !== body.foodName
      ? ` (referência FatSecret: ${body.fatSecretName})`
      : '') +
    `\nTipo: ${mealLabel}` +
    `\nPorção estimada: ${body.portion ?? 'não informada'}` +
    `\nCalorias: ${body.calories} kcal` +
    `\nProteína: ${body.protein} g` +
    `\nCarboidratos: ${body.carbs} g` +
    `\nGorduras: ${body.fat} g` +
    extras +
    `\n\nAnalise essa refeição para um usuário de GLP-1 e responda no formato JSON especificado.`;

  console.log(`[DeepSeekFood] ${body.foodName} | cal=${body.calories} prot=${body.protein} carbs=${body.carbs} fat=${body.fat}`);

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
        temperature: 0.3,
        max_tokens:  500,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage   },
        ],
      }),
    });
  } catch (networkErr) {
    console.error(`[DeepSeekFood] network error: ${String(networkErr).slice(0, 100)}`);
    res.status(502).json({ success: false, error: 'Não conseguimos gerar a análise agora.' } satisfies ErrorResponse);
    return;
  }

  if (!dsRes.ok) {
    const errText = (await dsRes.text()).slice(0, 150).replace(/[\n\r]/g, ' ');
    console.error(`[DeepSeekFood] erro ${dsRes.status}: ${errText}`);
    res.status(502).json({ success: false, error: 'Não conseguimos gerar a análise agora.' } satisfies ErrorResponse);
    return;
  }

  let dsData: unknown;
  try {
    dsData = await dsRes.json();
  } catch {
    res.status(502).json({ success: false, error: 'Não conseguimos gerar a análise agora.' } satisfies ErrorResponse);
    return;
  }

  const rawText: string = (dsData as any)?.choices?.[0]?.message?.content ?? '';
  console.log(`[DeepSeekFood] raw: ${rawText.slice(0, 300).replace(/[\n\r]/g, ' ')}`);

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i,     '')
    .replace(/\s*```\s*$/i,  '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error(`[DeepSeekFood] JSON parse falhou: ${rawText.slice(0, 200)}`);
    res.status(200).json({ success: false, error: 'Não conseguimos gerar a análise agora.' } satisfies ErrorResponse);
    return;
  }

  const p = parsed as any;

  const validStatuses = ['bom', 'atencao', 'ajustar'] as const;
  const status = validStatuses.includes(p?.status) ? p.status as 'bom' | 'atencao' | 'ajustar' : 'ajustar';

  function trunc(s: string, max: number): string {
    return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…';
  }

  const analysis: FoodAnalysis = {
    title:          trunc(String(p?.title          ?? 'Análise da refeição'), 45),
    summary:        trunc(String(p?.summary        ?? ''), 110),
    proteinInsight: trunc(String(p?.proteinInsight ?? ''), 120),
    glp1Tip:        trunc(String(p?.glp1Tip        ?? ''), 120),
    status,
    suggestion:     p?.suggestion ? trunc(String(p.suggestion), 100) : undefined,
  };

  console.log(`[DeepSeekFood] ok — status=${analysis.status} title="${analysis.title}"`);
  res.status(200).json({ success: true, analysis } satisfies SuccessResponse);
}
