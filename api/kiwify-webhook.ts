import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Inicializa Firebase Admin (singleton)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// Mapeamento nome do produto → plano interno
function identifyPlan(productName: string): string {
  const name = productName.toLowerCase();
  if (name.includes("top")) return "top";
  if (name.includes("pro")) return "pro";
  if (name.includes("plus")) return "plus";
  if (name.includes("starter")) return "starter";
  return "starter";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verificação opcional de token
  const token =
    req.headers["x-kiwify-token"] ?? (req.query.token as string | undefined);
  const VALID_TOKENS = ["glpy_kiwify_2026", "2o0698iikwi"];
  if (process.env.KIWIFY_WEBHOOK_TOKEN) {
    const tokenValido = VALID_TOKENS.includes(token as string) ||
      token === process.env.KIWIFY_WEBHOOK_TOKEN;
    if (!tokenValido) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const body = req.body as KiwifyPayload;
  const event = body?.event;

  if (!event) {
    return res.status(400).json({ error: "Missing event" });
  }

  // Kiwify usa PascalCase nos objetos aninhados
  const email = body?.Customer?.email;
  if (!email) {
    return res.status(400).json({ error: "Missing customer email" });
  }

  // Busca usuário pelo email
  const snapshot = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  let uid: string;
  let existia = true;

  if (snapshot.empty) {
    existia = false;
    // Cria conta Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password: "GLPY@2026",
    });
    uid = userRecord.uid;
  } else {
    uid = snapshot.docs[0].id;
  }

  const productName = body?.Product?.name ?? "";
  const planTipo = identifyPlan(productName);
  const subscriptionId = body?.Subscription?.id ?? null;
  const nomeCliente = body?.Customer?.full_name ?? "Usuário GLPY";

  if (event === "purchase.approved" || event === "subscription.renewed") {
    const planoData = {
      tipo: planTipo,
      status: "active",
      origem: "kiwify",
      kiwifySubscriptionId: subscriptionId,
      dataExpiracao: null,
    };

    if (!existia) {
      // Cria documento base + plano para usuário novo
      await db.collection("users").doc(uid).set({
        email,
        nome: nomeCliente,
        primeiroAcesso: true,
        plano: planoData,
        kiwify: {
          event,
          orderId: body?.order_id ?? null,
          productId: body?.Product?.product_id ?? null,
          productName,
          subscriptionId,
          chargeFrequency: body?.Subscription?.charge_frequency ?? null,
          approvedAt: body?.approved_date ?? new Date().toISOString(),
          status: "active",
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await db.collection("users").doc(uid).update({
        plano: planoData,
        kiwify: {
          event,
          orderId: body?.order_id ?? null,
          productId: body?.Product?.product_id ?? null,
          productName,
          subscriptionId,
          chargeFrequency: body?.Subscription?.charge_frequency ?? null,
          approvedAt: body?.approved_date ?? new Date().toISOString(),
          status: "active",
        },
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    console.log("[Kiwify] purchase.approved:", { email, planTipo, novo: !existia });

    // Envia email com credenciais
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: "service_2yk9ntj",
        template_id: "template_s9fz94e",
        user_id: "nzjByS_tk1VefLj3y",
        template_params: {
          to_email: email,
          to_name: nomeCliente,
          plano: planTipo,
          senha: "GLPY@2026",
          app_url: "glpy.com.br",
        },
      }),
    });

    console.log("[Kiwify] email enviado para:", email);

  } else if (event === "subscription.canceled") {
    await db.collection("users").doc(uid).update({
      plano: {
        tipo: "starter",
        status: "canceled",
        origem: "kiwify",
      },
      "kiwify.status": "canceled",
      "kiwify.canceledAt": new Date().toISOString(),
      "kiwify.event": event,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return res.status(200).json({ ok: true });
}

// ─── Tipos do payload Kiwify ─────────────────────────────────────────────────

interface KiwifyPayload {
  event: string;
  webhook_id?: string;
  order_id?: string;
  payment_method?: string;
  approved_date?: string;
  Customer?: {
    full_name?: string;
    email: string;
    mobile?: string;
    CPF?: string;
  };
  Product?: {
    product_id?: string;
    name: string;
  };
  Subscription?: {
    id?: string;
    status?: string;
    charge_frequency?: string;
  };
}
