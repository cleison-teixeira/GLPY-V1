// GLPY — Acesso: verificação de plano pós-compra
// Sprint 17B.5
// Endpoint: GET /api/acesso/check?email=...&token=...
//
// Usado por AcessoScreen para confirmar server-side se aquele e-mail
// tem plano ativo no Firebase antes de exibir a tela de confirmação.
// Não libera plano — apenas lê e retorna o status.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

// Planos pagos que confirmam acesso ativo
const PAID_PLANS = new Set(["fundador", "essencial", "pro", "top"]);

// Tokens aceitos para este endpoint (leitura apenas — não altera dados)
const VALID_TOKENS = new Set(["GLPY2026"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : null;
  const token = typeof req.query.token === "string" ? req.query.token.trim() : null;

  if (!token || !VALID_TOKENS.has(token)) {
    return res.status(200).json({ ok: false, error: "invalid_token" });
  }

  if (!email) {
    return res.status(200).json({ ok: false, error: "missing_email" });
  }

  try {
    const snap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(200).json({ ok: true, found: false, active: false, plano: null });
    }

    const data        = snap.docs[0].data();
    const plano       = data.plano       as Record<string, unknown> | undefined;
    const herospark   = data.herospark   as Record<string, unknown> | undefined;

    const planoTipo   = typeof plano?.tipo   === "string" ? plano.tipo   : null;
    const planoStatus = typeof plano?.status === "string" ? plano.status : null;
    const hsActive    = herospark?.active === true;

    const active =
      (planoStatus === "active" && !!planoTipo && PAID_PLANS.has(planoTipo)) ||
      hsActive;

    return res.status(200).json({
      ok:     true,
      found:  true,
      active,
      plano:  planoTipo,
      status: planoStatus,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[acesso/check] erro:", message);
    return res.status(500).json({ ok: false, error: "firebase_error" });
  }
}
