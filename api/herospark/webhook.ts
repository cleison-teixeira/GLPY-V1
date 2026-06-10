// GLPY — HeroSpark Webhook
// Sprint 17B.1 — criação
// Sprint 17B.3 — normalização de payload, subscription_status: "active", diagnóstico de ignore
//
// Endpoint: POST /api/herospark/webhook
//
// Responsabilidades:
//   1. Validar token de segurança
//   2. Normalizar payload (flat ou aninhado)
//   3. Identificar plano pelo offer_id (NÃO pelo preço)
//   4. Criar/atualizar usuário no Firebase Auth + Firestore
//   5. Enviar e-mail de acesso via EmailJS
//   6. Tratar cancelamento: rebaixa plano para starter
//
// Configuração de ambiente (Vercel → Settings → Environment Variables):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY      (chave privada com \n literais — Vercel substitui em runtime)
//   HEROSPARK_WEBHOOK_TOKEN   (opcional — token extra além do fixo)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { sendMetaPurchaseCapi } from "../_lib/metaCapi.js";

// ── Firebase Admin (singleton) ────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ── Mapeamento offer_id → plano ───────────────────────────────────────────────
// Regra: NUNCA usar payment_value para definir plano.
// Fonte única de verdade para mapeamento de oferta.

const HEROSPARK_OFFER_MAP: Record<string, string> = {
  "524346": "fundador",   // GLPY Fundador  — R$19,90/mês
  "524492": "essencial",  // GLPY Essencial — R$49,90/mês
  "524494": "pro",        // GLPY Pro       — R$59,90/mês
  "526680": "semestral",  // GLPY Semestral — R$249,90
  "526681": "anual",      // GLPY Anual     — R$447,00
};

function planFromOfferId(offerId: string | number | undefined): string {
  if (!offerId) return "starter";
  return HEROSPARK_OFFER_MAP[String(offerId)] ?? "starter";
}

// ── Normalização de payload ───────────────────────────────────────────────────
// HeroSpark pode enviar campos flat (buyer_email) ou aninhados (buyer.email).
// Esta função normaliza os dois formatos para a interface padrão.

function normalizePayload(raw: Record<string, unknown>): HeroSparkPayload {
  const buyer       = raw.buyer        as Record<string, unknown> | undefined;
  const payment     = raw.payment      as Record<string, unknown> | undefined;
  const offer       = raw.offer        as Record<string, unknown> | undefined;
  const subscription = raw.subscription as Record<string, unknown> | undefined;

  return {
    buyer_email:  (raw.buyer_email  as string | undefined) ?? (buyer?.email  as string | undefined),
    buyer_name:   (raw.buyer_name   as string | undefined) ?? (buyer?.name   as string | undefined),
    buyer_phone:  (raw.buyer_phone  as string | undefined) ?? (buyer?.phone  as string | undefined),
    product_id:   raw.product_id  ?? undefined,
    product_name: raw.product_name as string | undefined,
    offer_id:     raw.offer_id    ?? (offer?.id)           ?? undefined,
    offer_title:  raw.offer_title as string | undefined,
    payment_id:   raw.payment_id  ?? (payment?.id)         ?? undefined,
    payment_status: (raw.payment_status as string | undefined) ?? (payment?.status as string | undefined),
    payment_method: (raw.payment_method as string | undefined) ?? (payment?.method as string | undefined),
    payment_value:  (raw.payment_value  as number | string | undefined) ?? (payment?.value as number | string | undefined),
    subscription_id:     raw.subscription_id     ?? (subscription?.id)     ?? undefined,
    subscription_status: (raw.subscription_status as string | undefined)   ?? (subscription?.status as string | undefined),
    subscription_available_until: raw.subscription_available_until as string | undefined,
    execution_at: raw.execution_at as string | undefined,
  };
}

// ── Handler principal ─────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {

  // 1. Método
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Token de segurança — query param ou header
  const urlObj = new URL(req.url ?? "/", "https://glpy.com.br");
  const token =
    (req.headers["x-herospark-token"] as string | undefined) ??
    urlObj.searchParams.get("token") ??
    undefined;

  const VALID_TOKENS = ["glpy_herospark_2026"];
  const tokenValido =
    VALID_TOKENS.includes(token as string) ||
    (!!process.env.HEROSPARK_WEBHOOK_TOKEN && token === process.env.HEROSPARK_WEBHOOK_TOKEN);

  if (!tokenValido) {
    console.warn("[HeroSpark] token inválido:", token);
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 3. Normalizar payload (aceita flat e aninhado)
  const raw  = req.body as Record<string, unknown> ?? {};
  const body = normalizePayload(raw);

  const email = body.buyer_email?.trim().toLowerCase();
  if (!email) {
    console.warn("[HeroSpark] payload sem email:", JSON.stringify(raw).slice(0, 300));
    return res.status(400).json({ error: "Missing buyer_email", reason: "missing_email" });
  }

  const paymentStatus      = body.payment_status      ?? "";
  const subscriptionStatus = body.subscription_status ?? "";
  const offerId            = String(body.offer_id ?? "");

  console.log("[HeroSpark] recebido:", {
    email,
    offer_id:            offerId,
    payment_status:      paymentStatus,
    subscription_status: subscriptionStatus,
    payment_method:      body.payment_method,
    raw_keys:            Object.keys(raw),
  });

  try {

    // ── 4a. Pagamento aprovado OU assinatura ativa ──────────────────────────
    // Sprint 17B.3: aceita subscription_status: "active" além de payment_status: "approved".
    // Necessário para Pix e para eventos de renovação de assinatura HeroSpark.
    const isAprovado = paymentStatus === "approved" || subscriptionStatus === "active";

    if (isAprovado) {
      const planTipo   = planFromOfferId(body.offer_id);
      const productId  = String(body.product_id ?? "");

      if (planTipo === "starter" && offerId) {
        // offer_id veio mas não está mapeado — logar para diagnóstico
        console.warn("[HeroSpark] offer_id desconhecido — plano fallback=starter:", { offerId, email });
      }

      // Busca ou cria usuário no Firebase Auth (fonte de verdade do uid).
      // Sprint 17B.4: getUserByEmail() evita "email-already-exists" em createUser.
      let uid: string;
      let existia: boolean;

      try {
        const userRecord = await getAuth().getUserByEmail(email);
        uid    = userRecord.uid;
        existia = true;
      } catch (authErr: unknown) {
        const code = (authErr as { code?: string })?.code ?? "";
        if (code === "auth/user-not-found") {
          // Usuário realmente não existe — criar
          const newUser = await getAuth().createUser({ email, password: "GLPY@2026" });
          uid    = newUser.uid;
          existia = false;
        } else {
          // Outro erro de Auth — propagar
          throw authErr;
        }
      }

      const nomeCliente    = (body.buyer_name ?? "Usuário GLPY").trim();
      const subscriptionId = String(body.subscription_id ?? "");
      const paymentId      = String(body.payment_id ?? "");
      const availableUntil = body.subscription_available_until ?? null;

      const trigger = paymentStatus === "approved" ? "payment_approved" : "subscription_active";

      // Sprint 17B.4: set+merge garante que nunca apaga dados existentes do usuário,
      // e funciona tanto para doc novo quanto existente no Firestore.
      await db.collection("users").doc(uid).set({
        email,
        emailLower: email,
        nome:      nomeCliente,
        plano: {
          tipo:                    planTipo,
          status:                  "active",
          origem:                  "herospark",
          heroSparkOfferId:        offerId,
          heroSparkSubscriptionId: subscriptionId,
          dataExpiracao:           null,
        },
        herospark: {
          source:                     "herospark",
          plan:                       planTipo,
          active:                     true,
          status:                     "active",
          customerEmail:              email,
          customerName:               nomeCliente,
          customerPhone:              body.buyer_phone ?? null,
          productId,
          offerId,
          paymentId,
          subscriptionId,
          subscriptionAvailableUntil: availableUntil,
          paymentMethod:              body.payment_method ?? null,
          paymentValue:               body.payment_value  ?? null,
          updatedAt:                  FieldValue.serverTimestamp(),
        },
        ...(existia ? {} : { primeiroAcesso: true, createdAt: FieldValue.serverTimestamp() }),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      const action = existia ? "updated_existing_user" : "created_new_user";
      console.log("[HeroSpark] ativado:", { email, uid, planTipo, offerId, action, trigger });

      // Sprint 17B.20 — CAPI Purchase server-side. Falhas não quebram o webhook.
      if (planTipo !== "starter") {
        try {
          await sendMetaPurchaseCapi({
            plan:             planTipo,
            offerId,
            email,
            phone:            body.buyer_phone ?? null,
            clientIpAddress:  (req.headers["x-forwarded-for"] as string | undefined)
                                ?.split(",")[0]?.trim(),
            clientUserAgent:  req.headers["user-agent"] as string | undefined,
          });
        } catch (capiErr) {
          console.error("[MetaCAPI] failed:", (capiErr as Error)?.message ?? String(capiErr));
        }
      }

      // E-mail de boas-vindas via EmailJS (somente em criação nova)
      if (!existia) {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id:  "service_2yk9ntj",
            template_id: "template_s9fz94e",
            user_id:     "nzjByS_tk1VefLj3y",
            template_params: {
              to_email: email,
              to_name:  nomeCliente,
              plano:    planTipo,
              senha:    "GLPY@2026",
              app_url:  "glpy.com.br",
            },
          }),
        }).catch((e) => console.warn("[HeroSpark] EmailJS falhou:", e?.message));

        console.log("[HeroSpark] email enviado para:", email);
      }

      return res.status(200).json({ ok: true, success: true, action, plan: planTipo, email, uid });
    }

    // ── 4b. Assinatura cancelada / reembolso / chargeback ───────────────────
    if (subscriptionStatus === "canceled" || paymentStatus === "refunded" || paymentStatus === "chargeback") {
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const uid = snapshot.docs[0].id;
        await db.collection("users").doc(uid).update({
          plano: {
            tipo:   "starter",
            status: "canceled",
            origem: "herospark",
          },
          "herospark.active":     false,
          "herospark.status":     subscriptionStatus || paymentStatus,
          "herospark.canceledAt": new Date().toISOString(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log("[HeroSpark] cancelado/reembolsado:", { email, subscriptionStatus, paymentStatus });
      }

      return res.status(200).json({ ok: true, action: "canceled" });
    }

    // ── 4c. Evento não tratado — retornar diagnóstico ────────────────────────
    const ignoreReason =
      !paymentStatus && !subscriptionStatus ? "missing_status_fields"
      : paymentStatus === "pending" || paymentStatus === "waiting_payment" ? "payment_not_confirmed"
      : "unhandled_event";

    console.log("[HeroSpark] ignorado:", { email, paymentStatus, subscriptionStatus, ignoreReason });
    return res.status(200).json({
      ignored: true,
      reason:  ignoreReason,
      debug: {
        payment_status:      paymentStatus,
        subscription_status: subscriptionStatus,
        offer_id:            offerId,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[HeroSpark] firebase_write_failed:", message);
    return res.status(500).json({ error: message, reason: "firebase_write_failed" });
  }
}

// ── Tipos do payload HeroSpark ────────────────────────────────────────────────

interface HeroSparkPayload {
  buyer_email?:                 string;
  buyer_name?:                  string;
  buyer_phone?:                 string;
  product_id?:                  string | number;
  product_name?:                string;
  offer_id?:                    string | number;
  offer_title?:                 string;
  payment_id?:                  string | number;
  payment_status?:              string; // 'approved' | 'pending' | 'waiting_payment' | 'refunded' | 'chargeback'
  payment_method?:              string;
  payment_value?:               number | string;
  subscription_id?:             string | number;
  subscription_status?:         string; // 'active' | 'canceled' | 'suspended'
  subscription_available_until?: string;
  execution_at?:                string;
}
