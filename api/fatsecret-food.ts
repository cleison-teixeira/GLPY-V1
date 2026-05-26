// GLPY — FatSecret Platform API — Serverless Endpoint
// BUG 15A: Proxy seguro para FatSecret API — credenciais nunca vão ao browser
//
// Rota Vercel: POST /api/fatsecret-food
//
// Variáveis de ambiente necessárias (Vercel dashboard — server-side):
//   FATSECRET_CLIENT_ID     → obtido em platform.fatsecret.com
//   FATSECRET_CLIENT_SECRET → obtido em platform.fatsecret.com
//
// ⚠️  SEGURANÇA:
//     Nunca usar VITE_ prefix para essas chaves.
//     VITE_ expõe a variável no bundle JavaScript do browser.
//     Essas variáveis só existem no processo Node.js da Vercel.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ──────────────────────────────────────────────────────────────────────────────
// Tipos internos do endpoint (espelho de src/services/fatsecret/types.ts)
// Duplicados aqui para manter o endpoint sem dependências do front-end
// ──────────────────────────────────────────────────────────────────────────────

type FatSecretMode = 'image' | 'search';
type FatSecretMealType = 'cafe' | 'almoco' | 'jantar' | 'lanche';

interface RequestPayload {
  mode:          FatSecretMode;
  imageBase64?:  string;
  query?:        string;
  locale?:       string;
  mealType?:     FatSecretMealType;
}

interface FatSecretFoodItem {
  name:               string;
  brand?:             string;
  servingDescription?: string;
  calories?:          number;
  protein?:           number;
  carbs?:             number;
  fat?:               number;
  fiber?:             number;
  confidence?:        number;
  externalId?:        string;
}

interface SuccessResponse {
  success: true;
  source:  'fatsecret';
  items:   FatSecretFoodItem[];
  totals: {
    calories: number;
    protein:  number;
    carbs:    number;
    fat:      number;
  };
  raw?: unknown;
}

interface ErrorResponse {
  success: false;
  error:   string;
}

// ──────────────────────────────────────────────────────────────────────────────
// OAuth 2.0 — Client Credentials Flow
// Ref: https://platform.fatsecret.com/api/Default.aspx?screen=rapirefoauthauth
// ──────────────────────────────────────────────────────────────────────────────

const FATSECRET_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const FATSECRET_API_URL   = 'https://platform.fatsecret.com/rest/server.api';

interface OAuthTokenResponse {
  access_token: string;
  token_type:   string;
  expires_in:   number;
  scope?:       string;
}

/**
 * Obtém token OAuth2 (Client Credentials).
 * ⚠️  Executado apenas no servidor — credenciais nunca chegam ao browser.
 */
async function getOAuthToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(FATSECRET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[FatSecret] OAuth error:', errText);
    throw new Error(`OAuth falhou (${res.status}): ${errText}`);
  }

  const data = await res.json() as OAuthTokenResponse;
  return data.access_token;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parse seguro de número (todos os campos da FatSecret chegam como string)
// ──────────────────────────────────────────────────────────────────────────────

function parseNum(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function toUndefinedIfZero(n: number): number | undefined {
  return n > 0 ? n : undefined;
}

// ──────────────────────────────────────────────────────────────────────────────
// FatSecret Foods.Search — busca textual
// Ref: https://platform.fatsecret.com/api/Default.aspx?screen=rapiref&method=foods.search
// ──────────────────────────────────────────────────────────────────────────────

async function searchFoodsByText(
  token: string,
  query: string
): Promise<FatSecretFoodItem[]> {
  // TODO [BUG 15A]: A API REST JSON da FatSecret usa query params com format=json
  // Ref: https://platform.fatsecret.com/api/Default.aspx?screen=rapiref&method=foods.search
  const params = new URLSearchParams({
    method:       'foods.search',
    search_expression: query,
    format:       'json',
    max_results:  '5',
    page_number:  '0',
    language:     'pt',
    region:       'BR',
  });

  const res = await fetch(`${FATSECRET_API_URL}?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[FatSecret] foods.search error:', errText);
    throw new Error(`foods.search falhou (${res.status})`);
  }

  const data = await res.json() as Record<string, unknown>;

  // TODO [BUG 15B]: mapear resultado real da API
  // A estrutura retornada é: { foods: { food: Food | Food[], total_results, ... } }
  // Por ora retorna array vazio seguro para não quebrar build
  console.log('[FatSecret] foods.search raw:', JSON.stringify(data).slice(0, 200));

  const rawFoods = (data as any)?.foods?.food;
  if (!rawFoods) return [];

  const foodArray: unknown[] = Array.isArray(rawFoods) ? rawFoods : [rawFoods];

  return foodArray.slice(0, 5).map((f: any) => ({
    name:       f.food_name ?? 'Alimento desconhecido',
    brand:      f.brand_name ?? undefined,
    externalId: f.food_id ?? undefined,
    // Macros ficam na serving padrão — parsing completo em BUG 15B
    calories:   undefined,
    protein:    undefined,
    carbs:      undefined,
    fat:        undefined,
  } satisfies FatSecretFoodItem));
}

// ──────────────────────────────────────────────────────────────────────────────
// FatSecret Food Image Recognition — análise por foto (Premium API)
// Ref: https://platform.fatsecret.com/api/Default.aspx?screen=rapiref&method=food.recognize.v3
// ──────────────────────────────────────────────────────────────────────────────

async function recognizeFoodByImage(
  token: string,
  imageBase64: string
): Promise<FatSecretFoodItem[]> {
  // TODO [BUG 15A]: food.recognize.v3 requer plano Premium da FatSecret.
  // Se o plano atual for Basic (foods.search only), usar searchFoodsByText
  // com nome inferido por outro mecanismo (ex: Clarifai ou GLPY IA).
  //
  // Endpoint de reconhecimento:
  // POST https://platform.fatsecret.com/rest/food/recognize/v3
  // Body: { image_b64: "<base64>" }
  // Header: Authorization: Bearer <token>

  const recognizeUrl = 'https://platform.fatsecret.com/rest/food/recognize/v3';

  const res = await fetch(recognizeUrl, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ image_b64: imageBase64 }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[FatSecret] food.recognize error:', errText);
    // Falha silenciosa no reconhecimento — retorna array vazio para o caller tratar
    return [];
  }

  const data = await res.json() as Record<string, unknown>;
  console.log('[FatSecret] food.recognize raw:', JSON.stringify(data).slice(0, 200));

  // TODO [BUG 15B]: mapear resultado real da API de reconhecimento
  // Estrutura esperada: { food_response: [{ food_id, food_name, score, servings }] }
  const foodResponse: unknown[] = (data as any)?.food_response ?? [];

  return (foodResponse as any[]).slice(0, 5).map((item: any) => {
    const serving = item?.servings?.serving;
    const s = Array.isArray(serving) ? serving[0] : serving;

    return {
      name:               item.food_name ?? 'Alimento desconhecido',
      servingDescription: s?.serving_description ?? undefined,
      calories:           s ? toUndefinedIfZero(parseNum(s.calories))     : undefined,
      protein:            s ? toUndefinedIfZero(parseNum(s.protein))      : undefined,
      carbs:              s ? toUndefinedIfZero(parseNum(s.carbohydrate)) : undefined,
      fat:                s ? toUndefinedIfZero(parseNum(s.fat))          : undefined,
      fiber:              s?.fiber ? toUndefinedIfZero(parseNum(s.fiber)) : undefined,
      confidence:         item.score ?? undefined,
      externalId:         String(item.food_id ?? ''),
    } satisfies FatSecretFoodItem;
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Calcula totais a partir dos items
// ──────────────────────────────────────────────────────────────────────────────

function calcTotals(items: FatSecretFoodItem[]): SuccessResponse['totals'] {
  return items.reduce(
    (acc, i) => ({
      calories: acc.calories + (i.calories ?? 0),
      protein:  acc.protein  + (i.protein  ?? 0),
      carbs:    acc.carbs    + (i.carbs    ?? 0),
      fat:      acc.fat      + (i.fat      ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Handler principal
// ──────────────────────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {

  // ── Método
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' } satisfies ErrorResponse);
    return;
  }

  // ── Credenciais — server-side apenas
  const clientId     = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[FatSecret] Variáveis de ambiente ausentes: FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET');
    res.status(500).json({
      success: false,
      error:   'Credenciais FatSecret não configuradas no servidor.',
    } satisfies ErrorResponse);
    return;
  }

  // ── Payload
  const body = req.body as Partial<RequestPayload>;
  const { mode, imageBase64, query, mealType } = body;

  if (!mode || (mode !== 'image' && mode !== 'search')) {
    res.status(400).json({
      success: false,
      error:   "Campo 'mode' é obrigatório e deve ser 'image' ou 'search'.",
    } satisfies ErrorResponse);
    return;
  }

  if (mode === 'image' && !imageBase64) {
    res.status(400).json({
      success: false,
      error:   "Campo 'imageBase64' é obrigatório quando mode='image'.",
    } satisfies ErrorResponse);
    return;
  }

  if (mode === 'search' && !query) {
    res.status(400).json({
      success: false,
      error:   "Campo 'query' é obrigatório quando mode='search'.",
    } satisfies ErrorResponse);
    return;
  }

  // ── OAuth
  let accessToken: string;
  try {
    accessToken = await getOAuthToken(clientId, clientSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({
      success: false,
      error:   `Falha na autenticação FatSecret: ${message}`,
    } satisfies ErrorResponse);
    return;
  }

  // ── Análise
  let items: FatSecretFoodItem[];
  let rawData: unknown;

  try {
    if (mode === 'image') {
      items = await recognizeFoodByImage(accessToken, imageBase64!);

      // Fallback: se reconhecimento retornou vazio (plano Basic ou sem resultado),
      // usa mock seguro para não quebrar o fluxo de desenvolvimento
      if (items.length === 0) {
        console.warn('[FatSecret] Reconhecimento vazio — usando mock de fallback para desenvolvimento');
        // TODO [BUG 15B]: remover mock quando reconhecimento real estiver validado
        items = [{
          name:               'Prato identificado (pendente Premium API)',
          servingDescription: '1 porção',
          calories:           undefined,
          protein:            undefined,
          carbs:              undefined,
          fat:                undefined,
          confidence:         0,
        }];
      }
    } else {
      items = await searchFoodsByText(accessToken, query!);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({
      success: false,
      error:   `Falha na análise de alimento: ${message}`,
    } satisfies ErrorResponse);
    return;
  }

  // ── Resposta
  const totals = calcTotals(items);

  const responseBody: SuccessResponse = {
    success: true,
    source:  'fatsecret',
    items,
    totals,
    raw:     rawData,
  };

  res.status(200).json(responseBody);
}
