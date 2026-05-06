import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as admin from "firebase-admin";

// Inicializa Firebase Admin (singleton)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

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
  if (
    process.env.KIWIFY_WEBHOOK_TOKEN &&
    token !== process.env.KIWIFY_WEBHOOK_TOKEN
  ) {
    return res.status(401).json({ error: "Unauthorized" });
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

  if (snapshot.empty) {
    // Usuário ainda não cadastrado — retorna 200 para não gerar retry no Kiwify
    return res.status(200).json({ ok: true, message: "user not found" });
  }

  const uid = snapshot.docs[0].id;
  const updateData: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (event === "purchase.approved" || event === "subscription.renewed") {
    const productName = body?.Product?.name ?? "";
    const plano = identifyPlan(productName);

    updateData.plano = plano;
    updateData.kiwify = {
      event,
      orderId: body?.order_id ?? null,
      productId: body?.Product?.product_id ?? null,
      productName,
      subscriptionId: body?.Subscription?.id ?? null,
      chargeFrequency: body?.Subscription?.charge_frequency ?? null,
      approvedAt: body?.approved_date ?? new Date().toISOString(),
      status: "active",
    };
  } else if (event === "subscription.canceled") {
    updateData.plano = "free";
    updateData["kiwify.status"] = "canceled";
    updateData["kiwify.canceledAt"] = new Date().toISOString();
    updateData["kiwify.event"] = event;
  }

  await db.collection("users").doc(uid).update(updateData);

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
