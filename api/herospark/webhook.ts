// GLPY — HeroSpark Webhook
// Sprint 17B.1
// Endpoint: POST /api/herospark/webhook
//
// Responsabilidades:
//   1. Validar token de segurança
//   2. Identificar plano pelo offer_id (NÃO pelo preço)
//   3. Criar/atualizar usuário no Firebase Auth + Firestore
//   4. Enviar e-mail de acesso via EmailJS
//   5. Tratar cancelamento: rebaixa plano para starter
//
// Configuração de ambiente (Vercel → Settings → Environment Variables):
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY
//   HEROSPARK_WEBHOOK_TOKEN   (token secreto para validar origem)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

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
  "524346": "fundador",   // GLPY Fundador — R$19,90/mês
  // Futuros:
  // "XXXXXX": "essencial",
  // "XXXXXX": "pro",
};

function planFromOfferId(offerId: string | number | undefined): string {
  if (!offerId) return "starter";
  return HEROSPARK_OFFER_MAP[String(offerId)] ?? "starter";
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

  // 3. Payload
  const body = req.body as HeroSparkPayload;
  const email = body?.buyer_email?.trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Missing buyer_email" });
  }

  const paymentStatus      = body?.payment_status ?? "";
  const subscriptionStatus = body?.subscription_status ?? "";

  console.log("[HeroSpark] recebido:", {
    email,
    offer_id: body?.offer_id,
    payment_status: paymentStatus,
    subscription_status: subscriptionStatus,
  });

  try {

    // ── 4a. Pagamento aprovado ──────────────────────────────────────────────
    if (paymentStatus === "approved") {
      const planTipo  = planFromOfferId(body?.offer_id);
      const offerId   = String(body?.offer_id ?? "");
      const productId = String(body?.product_id ?? "");

      // Busca ou cria usuário no Firebase Auth
      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      let uid: string;
      let existia: boolean;

      if (snapshot.empty) {
        existia = false;
        const userRecord = await getAuth().createUser({ email, password: "GLPY@2026" });
        uid = userRecord.uid;
      } else {
        existia = true;
        uid = snapshot.docs[0].id;
      }

      const nomeCliente   = (body?.buyer_name ?? "Usuário GLPY").trim();
      const subscriptionId = String(body?.subscription_id ?? "");
      const paymentId      = String(body?.payment_id ?? "");
      const availableUntil = body?.subscription_available_until ?? null;

      // Dado de acesso: compatível com syncFromFirestore (usa plano.tipo)
      const planoData = {
        tipo:                     planTipo,
        status:                   "active",
        origem:                   "herospark",
        heroSparkOfferId:         offerId,
        heroSparkSubscriptionId:  subscriptionId,
        dataExpiracao:            null,   // assinatura recorrente — sem data fixa de expiração
      };

      // Dado completo para auditoria / access_control
      const heroSparkData = {
        source:         "herospark",
        plan:           planTipo,
        active:         true,
        status:         "active",
        customerEmail:  email,
        customerName:   nomeCliente,
        productId,
        offerId,
        paymentId,
        subscriptionId,
        subscriptionAvailableUntil: availableUntil,
        paymentMethod:  body?.payment_method ?? null,
        paymentValue:   body?.payment_value  ?? null,  // armazenado apenas para auditoria
        updatedAt:      FieldValue.serverTimestamp(),
      };

      if (!existia) {
        await db.collection("users").doc(uid).set({
          email,
          nome:          nomeCliente,
          primeiroAcesso: true,
          plano:         planoData,
          herospark:     heroSparkData,
          createdAt:     FieldValue.serverTimestamp(),
          updatedAt:     FieldValue.serverTimestamp(),
        });
      } else {
        await db.collection("users").doc(uid).update({
          plano:     planoData,
          herospark: heroSparkData,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      console.log("[HeroSpark] purchase.approved:", { email, planTipo, offerId, novo: !existia });

      // E-mail de boas-vindas via EmailJS
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
      });

      console.log("[HeroSpark] email enviado para:", email);

      return res.status(200).json({ ok: true, plan: planTipo });
    }

    // ── 4b. Assinatura cancelada ─────────────────────────────────────────────
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

    // ── 4c. Evento não tratado ───────────────────────────────────────────────
    console.log("[HeroSpark] evento ignorado:", { paymentStatus, subscriptionStatus });
    return res.status(200).json({ ignored: true });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[HeroSpark] erro:", message);
    return res.status(500).json({ error: message });
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
  payment_status?:              string; // 'approved' | 'pending' | 'refunded' | 'chargeback' | 'canceled'
  payment_method?:              string;
  payment_value?:               number | string;
  subscription_id?:             string | number;
  subscription_status?:         string; // 'active' | 'canceled' | 'suspended'
  subscription_available_until?: string;
  execution_at?:                string;
}
