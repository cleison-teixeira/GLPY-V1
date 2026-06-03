// GLPY — Admin: Liberação Manual de Acesso
// Sprint 17B.44 BugFix
// Endpoint: POST /api/admin/manual-access
//
// Usa Firebase Admin SDK para bypassar security rules do Firestore.
// Autenticação via Firebase ID token verificado server-side.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

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
const ADMIN_EMAIL = "cleisonimarketing@gmail.com";

interface ManualAccessBody {
  nome: string;
  email: string;
  telefone?: string;
  plano: string;
  origem: string;
  valorPago?: string;
  observacao?: string;
  comprovanteUrl?: string;
  accessType: "temporario" | "sem_expiracao" | "personalizado";
  durationDays: number | null;
  dataExpiracao: string | null;
  adminEmail: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  // Verificar Firebase ID token do admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    console.warn("[admin/manual-access] sem Authorization header");
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const idToken = authHeader.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    if (decoded.email !== ADMIN_EMAIL) {
      console.warn("[admin/manual-access] email não autorizado:", decoded.email);
      return res.status(403).json({ ok: false, error: "forbidden", detail: "email_not_admin" });
    }
  } catch (tokenErr) {
    const msg = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
    console.warn("[admin/manual-access] token inválido:", msg);
    return res.status(401).json({ ok: false, error: "invalid_token" });
  }

  const body = req.body as ManualAccessBody;
  const email = body.email?.trim().toLowerCase();

  if (!email) return res.status(400).json({ ok: false, error: "missing_email" });
  if (!body.nome?.trim()) return res.status(400).json({ ok: false, error: "missing_nome" });
  if (!body.plano) return res.status(400).json({ ok: false, error: "missing_plano" });

  try {
    // 1. Buscar ou criar usuário no Firebase Auth
    let uid: string;
    let action: "created" | "updated";

    try {
      const userRecord = await getAuth().getUserByEmail(email);
      uid = userRecord.uid;
      action = "updated";
      console.log("[admin/manual-access] usuário existente encontrado:", { email, uid });
    } catch (authErr: unknown) {
      const code = (authErr as { code?: string })?.code ?? "";
      if (code === "auth/user-not-found") {
        const newUser = await getAuth().createUser({
          email,
          password: "GLPY@2026",
          displayName: body.nome.trim(),
        });
        uid = newUser.uid;
        action = "created";
        console.log("[admin/manual-access] novo usuário criado:", { email, uid });
      } else {
        console.error("[admin/manual-access] erro Auth inesperado:", { code, authErr });
        throw authErr;
      }
    }

    // 2. Calcular expiração
    const dataExp = body.dataExpiracao ? new Date(body.dataExpiracao) : null;
    const expTs = dataExp ? Timestamp.fromDate(dataExp) : null;

    // 3. String de duração para compatibilidade com admin_grants antigos
    const duracao =
      body.accessType === "sem_expiracao" ? "vitalicio"
      : body.accessType === "personalizado" ? "personalizado"
      : `${body.durationDays}d`;

    // 4. Escrever users/{uid} — merge:true preserva todos os campos existentes
    await db.collection("users").doc(uid).set({
      email,
      emailLower: email,
      nome: body.nome.trim(),
      telefone: body.telefone ?? "",
      plano: {
        tipo:         body.plano,
        status:       "active",
        origem:       body.origem,
        dataAtivacao: FieldValue.serverTimestamp(),
        dataExpiracao: expTs,
      },
      herospark: {
        active:        true,
        plan:          body.plano,
        status:        "active",
        customerEmail: email,
        source:        "manual_admin",
      },
      manualAccess: {
        active:        true,
        source:        body.origem,
        accessType:    body.accessType,
        durationDays:  body.durationDays,
        expiresAt:     expTs,
        value:         body.valorPago ?? "",
        comprovanteUrl: body.comprovanteUrl ?? "",
        observacao:    body.observacao ?? "",
        createdAt:     FieldValue.serverTimestamp(),
        createdBy:     body.adminEmail,
      },
      ...(action === "created" ? {
        primeiroAcesso: true,
        createdAt: FieldValue.serverTimestamp(),
      } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log("[admin/manual-access] users/{uid} atualizado com merge:", { uid, plano: body.plano });

    // 5. Criar registro em admin_grants
    const grantRef = await db.collection("admin_grants").add({
      uid,
      email,
      nome:           body.nome.trim(),
      telefone:       body.telefone ?? "",
      plano:          body.plano,
      origem:         body.origem,
      valorPago:      body.valorPago ?? "",
      observacao:     body.observacao ?? "",
      comprovanteUrl: body.comprovanteUrl ?? "",
      duracao,
      accessType:     body.accessType,
      durationDays:   body.durationDays,
      dataExpiracao:  expTs,
      liberadoEm:     FieldValue.serverTimestamp(),
      status:         "active",
      adminEmail:     body.adminEmail,
    });

    const linkAcesso = `https://glpy.com.br/acesso?email=${encodeURIComponent(email)}&token=GLPY2026`;

    console.log("[admin/manual-access] acesso liberado com sucesso:", {
      uid, email, plano: body.plano, origem: body.origem, grantId: grantRef.id, action,
    });

    return res.status(200).json({
      ok: true,
      uid,
      email,
      grantId: grantRef.id,
      linkAcesso,
      action,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: string })?.code ?? "";
    console.error("[admin/manual-access] erro:", { message, code });
    return res.status(500).json({ ok: false, error: message, code });
  }
}
