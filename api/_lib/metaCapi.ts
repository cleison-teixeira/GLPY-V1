// GLPY — Meta Conversions API (CAPI) — server-side
// Sprint 17B.20 — Purchase server-side após pagamento HeroSpark confirmado
//
// Pixel ID lido de: process.env.META_PIXEL_ID
// Token lido de:    process.env.META_CAPI_ACCESS_TOKEN
// NUNCA hardcoded. NUNCA exposto no frontend.
//
// event_id gerado com a mesma lógica do client-side (Sprint 17B.19)
// para deduplicação Meta quando os dois eventos chegam.
//
// Dados de saúde (medicação, dose, sintomas, peso, altura, fotos, IA) NUNCA enviados.

import { createHash } from 'node:crypto';

// ── Plano → parâmetros de conversão ──────────────────────────────────────────

const PLANO_CAPI: Record<string, { value: number; contentName: string }> = {
  fundador:  { value:  19.90, contentName: 'GLPY Fundador'  },
  essencial: { value:  49.90, contentName: 'GLPY Essencial' },
  semestral: { value: 249.90, contentName: 'GLPY Semestral' },
  anual:     { value: 447.00, contentName: 'GLPY Anual'     },
  pro:       { value:  59.90, contentName: 'GLPY Pro'       },
};

const PURCHASE_PLANS = new Set(['fundador', 'essencial', 'semestral', 'anual', 'pro']);

// ── Helpers de hash ───────────────────────────────────────────────────────────

function sha256hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// Mesma normalização do client-side em AcessoScreen.tsx
function normalizeEmailForEventId(email: string): string {
  return email.toLowerCase().replace(/[@.]/g, '_');
}

// Primeiros 10 hex chars do SHA-256 do email normalizado.
// Idêntico ao browser: crypto.subtle.digest('SHA-256', textEncoder.encode(normalized))
function emailHash10(email: string): string {
  return sha256hex(normalizeEmailForEventId(email)).slice(0, 10);
}

// ── Interface de entrada ──────────────────────────────────────────────────────

export interface MetaPurchaseCapiParams {
  plan:              string;
  offerId:           string;
  email:             string;
  phone?:            string | null;
  clientIpAddress?:  string;
  clientUserAgent?:  string;
  fbc?:              string | null;
  fbp?:              string | null;
}

// ── Envio principal ───────────────────────────────────────────────────────────

export async function sendMetaPurchaseCapi(params: MetaPurchaseCapiParams): Promise<void> {
  const pixelId     = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testCode    = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn('[MetaCAPI] skipped: missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN');
    return;
  }

  if (!PURCHASE_PLANS.has(params.plan)) {
    console.warn('[MetaCAPI] skipped: plan not in purchase list:', params.plan);
    return;
  }

  const planParams = PLANO_CAPI[params.plan];
  if (!planParams) return;

  const emailNorm = params.email.trim().toLowerCase();

  // event_id idêntico ao Sprint 17B.19 client-side — permite deduplicação Meta
  const eventId = `glpy_purchase_${params.plan}_${params.offerId}_${emailHash10(emailNorm)}`;

  // user_data — e-mail e telefone hasheados, nunca em texto legível
  const userData: Record<string, unknown> = {
    em: sha256hex(emailNorm),
  };
  if (params.phone) {
    const phoneDigits = params.phone.replace(/\D/g, '');
    if (phoneDigits) userData.ph = sha256hex(phoneDigits);
  }
  if (params.clientIpAddress) userData.client_ip_address = params.clientIpAddress;
  if (params.clientUserAgent) userData.client_user_agent = params.clientUserAgent;
  if (params.fbc)             userData.fbc = params.fbc;
  if (params.fbp)             userData.fbp = params.fbp;

  const customData = {
    currency:         'BRL',
    value:            planParams.value,
    content_name:     planParams.contentName,
    content_category: 'subscription',
    contents:         [{ id: params.plan, quantity: 1, item_price: planParams.value }],
    plan:             params.plan,
  };

  const eventPayload: Record<string, unknown> = {
    event_name:       'Purchase',
    event_time:       Math.floor(Date.now() / 1000),
    event_id:         eventId,
    action_source:    'website',
    event_source_url: 'https://glpy.com.br/acesso',
    user_data:        userData,
    custom_data:      customData,
  };

  const body: Record<string, unknown> = {
    data:         [eventPayload],
    access_token: accessToken,
  };

  if (testCode) body.test_event_code = testCode;

  const resp = await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => 'unknown');
    console.error(`[MetaCAPI] error status=${resp.status}`, errText.slice(0, 200));
    return;
  }

  console.log(`[MetaCAPI] Purchase enviado plan=${params.plan} offerId=${params.offerId} eventId=${eventId}`);
}
