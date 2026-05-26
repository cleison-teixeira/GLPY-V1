// GLPY — FatSecret Platform API — Serverless Endpoint
// BUG 15A: Proxy seguro para FatSecret API — credenciais nunca vão ao browser
// BUG 15C.1: Corrigido parsing defensivo — verifica Content-Type antes de res.json()
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
// Tipos internos do endpoint
// ──────────────────────────────────────────────────────────────────────────────

type FatSecretMode     = 'image' | 'search';
type FatSecretMealType = 'cafe' | 'almoco' | 'jantar' | 'lanche';
type Stage             = 'token' | 'recognize' | 'search';

interface RequestPayload {
  mode:          FatSecretMode;
  imageBase64?:  string;
  query?:        string;
  locale?:       string;
  mealType?:     FatSecretMealType;
}

interface FatSecretFoodItem {
  name:                string;
  brand?:              string;
  servingDescription?: string;
  calories?:           number;
  protein?:            number;
  carbs?:              number;
  fat?:                number;
  fiber?:              number;
  confidence?:         number;
  externalId?:         string;
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
}

interface ErrorResponse {
  success: false;
  error:   string;
  debug?: {
    stage:       Stage;
    status:      number;
    contentType: string;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: lê resposta HTTP de forma segura, verificando Content-Type primeiro.
// NUNCA chama res.json() sem confirmar que a resposta realmente é JSON.
// ──────────────────────────────────────────────────────────────────────────────

type SafeJsonResult<T> =
  | { ok: true;  data: T }
  | { ok: false; status: number; contentType: string; snippet: string };

async function safeJson<T>(response: Response, stage: Stage): Promise<SafeJsonResult<T>> {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json') || contentType.includes('text/json');

  if (!isJson) {
    const body  = await response.text();
    const snippet = body.slice(0, 150).replace(/[\n\r]/g, ' ');
    console.error(`[FatSecret][${stage}] não-JSON ${response.status} ct="${contentType}" body="${snippet}"`);
    return { ok: false, status: response.status, contentType, snippet };
  }

  try {
    const data = await response.json() as T;
    return { ok: true, data };
  } catch (e) {
    const snippet = String(e).slice(0, 100);
    console.error(`[FatSecret][${stage}] json parse error: ${snippet}`);
    return { ok: false, status: response.status, contentType, snippet };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// OAuth 2.0 — Client Credentials Flow
// ──────────────────────────────────────────────────────────────────────────────

const FATSECRET_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const FATSECRET_API_URL   = 'https://platform.fatsecret.com/rest/server.api';

interface OAuthTokenResponse {
  access_token: string;
  token_type:   string;
  expires_in:   number;
  scope?:       string;
}

async function getOAuthToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(FATSECRET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
      'Accept':        'application/json',
    },
    body: 'grant_type=client_credentials&scope=basic',
  });

  if (!res.ok) {
    const errText = await res.text();
    const snippet = errText.slice(0, 120).replace(/[\n\r]/g, ' ');
    console.error(`[FatSecret][token] falha ${res.status}: ${snippet}`);
    throw new Error(`Falha na autenticação com a FatSecret. Verifique as credenciais no Vercel. (${res.status})`);
  }

  const parsed = await safeJson<OAuthTokenResponse>(res, 'token');
  if (!parsed.ok) {
    throw new Error(`Falha na autenticação com a FatSecret. Verifique as credenciais no Vercel. (resposta não-JSON: ${parsed.contentType})`);
  }

  console.log(`[FatSecret][token] ok scope=${parsed.data.scope ?? 'basic'}`);
  return parsed.data.access_token;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parse seguro de número (campos FatSecret chegam como string)
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
// FatSecret Food Image Recognition — análise por foto (Premium API)
// Retorna:
//   FatSecretFoodItem[]  — reconhecimento ok (pode ser [] se não identificou)
//   null                 — API não disponível no plano atual (XML ou erro de plano)
// ──────────────────────────────────────────────────────────────────────────────

async function recognizeFoodByImage(
  token: string,
  imageBase64: string
): Promise<FatSecretFoodItem[] | null> {
  const recognizeUrl = 'https://platform.fatsecret.com/rest/food/recognize/v3';

  let res: Response;
  try {
    res = await fetch(recognizeUrl, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ image_b64: imageBase64 }),
    });
  } catch (networkErr) {
    console.error('[FatSecret][recognize] network error:', String(networkErr).slice(0, 100));
    return null;
  }

  console.log(`[FatSecret][recognize] status=${res.status} ct="${res.headers.get('content-type') ?? ''}"`);

  if (!res.ok) {
    // Non-2xx: pode ser 401, 403 (plano insuficiente) — lê como texto, retorna null
    const errText = await res.text();
    const snippet = errText.slice(0, 150).replace(/[\n\r]/g, ' ');
    console.error(`[FatSecret][recognize] erro ${res.status}: ${snippet}`);
    return null;
  }

  // 2xx: verificar Content-Type ANTES de chamar .json()
  const parsed = await safeJson<Record<string, unknown>>(res, 'recognize');
  if (!parsed.ok) {
    // Resposta 2xx com body XML — plano não suporta reconhecimento por imagem
    return null;
  }

  console.log('[FatSecret][recognize] raw:', JSON.stringify(parsed.data).slice(0, 200));

  const foodResponse: unknown[] = (parsed.data as any)?.food_response ?? [];

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
// Extrai macros do campo food_description da API foods.search
// Formato típico: "Per 100g - Calories: 130kcal | Fat: 2.00g | Carbs: 27.00g | Prot: 2.70g"
// ──────────────────────────────────────────────────────────────────────────────

function parseFoodDescription(desc: string): {
  calories?: number; protein?: number; carbs?: number; fat?: number; servingDescription?: string;
} {
  if (!desc) return {};
  const servingMatch = desc.match(/^Per\s+([^-|]+?)(?:\s*-|\s*\|)/i);
  const servingDescription = servingMatch ? servingMatch[1].trim() : undefined;
  const cal   = desc.match(/Calories?:\s*([\d.]+)/i);
  const fat   = desc.match(/Fat:\s*([\d.]+)/i);
  const carbs = desc.match(/Carbs?:\s*([\d.]+)/i);
  const prot  = desc.match(/Prot(?:ein|e[ií]na)?:\s*([\d.]+)/i);
  return {
    servingDescription,
    calories: cal   ? parseFloat(cal[1])   : undefined,
    fat:      fat   ? parseFloat(fat[1])   : undefined,
    carbs:    carbs ? parseFloat(carbs[1]) : undefined,
    protein:  prot  ? parseFloat(prot[1])  : undefined,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// FatSecret Foods.Search — busca textual
// ──────────────────────────────────────────────────────────────────────────────

async function searchFoodsByText(token: string, query: string): Promise<FatSecretFoodItem[]> {
  const params = new URLSearchParams({
    method:            'foods.search',
    search_expression: query,
    format:            'json',
    max_results:       '5',
    page_number:       '0',
    language:          'pt',
    region:            'BR',
  });

  const res = await fetch(`${FATSECRET_API_URL}?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept':        'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    const snippet = errText.slice(0, 120).replace(/[\n\r]/g, ' ');
    console.error(`[FatSecret][search] erro ${res.status}: ${snippet}`);
    throw new Error(`Busca de alimentos falhou (${res.status})`);
  }

  const parsed = await safeJson<Record<string, unknown>>(res, 'search');
  if (!parsed.ok) {
    throw new Error(`Busca de alimentos retornou formato inesperado (${parsed.contentType})`);
  }

  console.log('[FatSecret][search] raw:', JSON.stringify(parsed.data).slice(0, 200));

  const rawFoods = (parsed.data as any)?.foods?.food;
  if (!rawFoods) return [];

  const foodArray: unknown[] = Array.isArray(rawFoods) ? rawFoods : [rawFoods];

  return foodArray.slice(0, 5).map((f: any) => {
    const nutrition = f.food_description ? parseFoodDescription(String(f.food_description)) : {};
    return {
      name:               f.food_name ?? 'Alimento desconhecido',
      brand:              f.brand_name ?? undefined,
      externalId:         f.food_id ?? undefined,
      servingDescription: nutrition.servingDescription,
      calories:           nutrition.calories,
      protein:            nutrition.protein,
      carbs:              nutrition.carbs,
      fat:                nutrition.fat,
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

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' } satisfies ErrorResponse);
    return;
  }

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

  const body = req.body as Partial<RequestPayload>;
  const { mode, imageBase64, query } = body;

  if (!mode || (mode !== 'image' && mode !== 'search')) {
    res.status(400).json({ success: false, error: "Campo 'mode' é obrigatório e deve ser 'image' ou 'search'." } satisfies ErrorResponse);
    return;
  }
  if (mode === 'image' && !imageBase64) {
    res.status(400).json({ success: false, error: "Campo 'imageBase64' é obrigatório quando mode='image'." } satisfies ErrorResponse);
    return;
  }
  if (mode === 'search' && !query) {
    res.status(400).json({ success: false, error: "Campo 'query' é obrigatório quando mode='search'." } satisfies ErrorResponse);
    return;
  }

  // ── OAuth
  let accessToken: string;
  try {
    accessToken = await getOAuthToken(clientId, clientSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ success: false, error: message } satisfies ErrorResponse);
    return;
  }

  // ── Análise
  let items: FatSecretFoodItem[];

  try {
    if (mode === 'image') {
      const result = await recognizeFoodByImage(accessToken, imageBase64!);

      // null = API retornou XML / plano não suporta reconhecimento por imagem
      if (result === null) {
        res.status(200).json({
          success: false,
          error:   'Reconhecimento por imagem indisponível no plano atual da FatSecret.',
          debug: {
            stage:       'recognize' as Stage,
            status:      0,
            contentType: 'non-json',
          },
        } satisfies ErrorResponse);
        return;
      }

      // [] = API respondeu mas não identificou itens
      if (result.length === 0) {
        res.status(200).json({
          success: false,
          error:   'Nenhum alimento identificado na imagem. Tente uma foto mais próxima e com boa iluminação.',
          debug: {
            stage:       'recognize' as Stage,
            status:      200,
            contentType: 'application/json',
          },
        } satisfies ErrorResponse);
        return;
      }

      items = result;

    } else {
      items = await searchFoodsByText(accessToken, query!);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[FatSecret][handler] erro análise:', message);
    res.status(502).json({
      success: false,
      error:   `Falha na análise: ${message}`,
    } satisfies ErrorResponse);
    return;
  }

  res.status(200).json({
    success: true,
    source:  'fatsecret',
    items,
    totals:  calcTotals(items),
  } satisfies SuccessResponse);
}
