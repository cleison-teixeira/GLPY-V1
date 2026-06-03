import {
  doc, setDoc, getDoc, collection, addDoc,
  serverTimestamp, updateDoc, increment,
  query, where, getDocs, Timestamp, orderBy, limit,
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { db, auth } from "../firebase.js";
import app from "../firebase.js";
import { getLocalDateKey } from "../utils/formatters";

function uid(): string | null {
  return auth.currentUser?.uid ?? null;
}

// ─────────────────────────────────────────────
// Perfil completo do usuário (onboarding + Firebase user)
// ─────────────────────────────────────────────
export async function saveUserProfile(data: Record<string, unknown>): Promise<void> {
  // Fallback para UID via localStorage se auth.currentUser ainda não resolveu
  const id = uid() ?? (() => {
    try { return JSON.parse(localStorage.getItem("glpy_user") || "{}").uid ?? null; } catch { return null; }
  })();
  if (!id) { console.warn("saveUserProfile: uid null, save ignorado"); return; }
  await setDoc(doc(db, "users", id), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function loadUserData(): Promise<Record<string, unknown> | null> {
  const id = uid();
  if (!id) return null;
  const snap = await getDoc(doc(db, "users", id));
  if (!snap.exists()) return null;
  return snap.data() as Record<string, unknown>;
}

// ─────────────────────────────────────────────
// Check-in diário
// ─────────────────────────────────────────────
export async function saveCheckin(data: Record<string, unknown>): Promise<void> {
  const id = uid();
  if (!id) return;
  await addDoc(collection(db, "users", id, "checkins"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  // Atualiza último check-in no perfil
  await updateDoc(doc(db, "users", id), {
    lastCheckin: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────
// Gamificação (XP, streak, nível)
// ─────────────────────────────────────────────
export async function saveGamification(data: {
  xp: number;
  streak: number;
  nivel: number;
}): Promise<void> {
  const id = uid();
  if (!id) return;
  await updateDoc(doc(db, "users", id), {
    xp: data.xp,
    streak: data.streak,
    nivel: data.nivel,
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────
// Progresso de protocolo
// ─────────────────────────────────────────────
export async function saveProtocolProgress(data: {
  protocoloId: string;
  protocoloNome: string;
  diaAtual: number;
  totalDias: number;
}): Promise<void> {
  const id = uid();
  if (!id) return;
  await updateDoc(doc(db, "users", id), {
    protocoloAtivo: data,
    updatedAt: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────
// Anti-Rebote — subcoleção protocolos/anti-rebote
// ─────────────────────────────────────────────
export async function saveAntiReboteProgress(data: {
  diaAtual: number;
  dataUltimoCheck: string;
  diasCompletos: number[];
}): Promise<void> {
  const id = uid();
  if (!id) return;
  await setDoc(
    doc(db, "users", id, "protocolos", "anti-rebote"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function loadAntiReboteProgress(): Promise<{
  diaAtual: number;
  dataUltimoCheck: string | null;
  diasCompletos: number[];
} | null> {
  const id = uid();
  if (!id) return null;
  const snap = await getDoc(doc(db, "users", id, "protocolos", "anti-rebote"));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    diaAtual: typeof d.diaAtual === "number" ? d.diaAtual : 0,
    dataUltimoCheck: d.dataUltimoCheck ?? null,
    diasCompletos: Array.isArray(d.diasCompletos) ? d.diasCompletos : [],
  };
}

// ─────────────────────────────────────────────
// Progresso genérico de protocolo — subcoleção protocolos/{protocoloId}
// ─────────────────────────────────────────────
export async function salvarProgressoProtocolo(
  protocoloId: string,
  dados: { diaAtual: number; dataUltimoCheck: string; diasCompletos: number[] },
): Promise<void> {
  const id = uid();
  if (!id) return;
  await setDoc(
    doc(db, "users", id, "protocolos", protocoloId),
    { ...dados, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function carregarProgressoProtocolo(protocoloId: string): Promise<{
  diaAtual: number;
  dataUltimoCheck: string | null;
  diasCompletos: number[];
} | null> {
  const id = uid();
  if (!id) return null;
  const snap = await getDoc(doc(db, "users", id, "protocolos", protocoloId));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    diaAtual: typeof d.diaAtual === "number" ? d.diaAtual : 0,
    dataUltimoCheck: d.dataUltimoCheck ?? null,
    diasCompletos: Array.isArray(d.diasCompletos) ? d.diasCompletos : [],
  };
}

// ─────────────────────────────────────────────
// Limites de uso da IA — users/{uid}/limites/ia
// ─────────────────────────────────────────────
// Sprint 17B.1 — planos HeroSpark + backward compat Kiwify
const LIMITES_POR_PLANO: Record<string, number> = { starter: 30, fundador: 30, essencial: 30, pro: 99, top: 999, betatester: 999, plus: 20 };

// ADM/QA interno — override de limites para emails de desenvolvimento. Não afeta usuários comuns.
const ADM_QA_EMAILS = new Set(["cleisonimarketing@gmail.com"]);
function isAdmQA(): boolean {
  const email = (auth.currentUser?.email || localStorage.getItem("glpy_email") || "").toLowerCase().trim();
  return ADM_QA_EMAILS.has(email);
}

export async function carregarLimitesIA(plano: string): Promise<{
  usadas: number;
  limite: number;
}> {
  const id = uid();
  const limite = isAdmQA() ? 999 : (LIMITES_POR_PLANO[plano] ?? 10);
  if (!id) return { usadas: 0, limite };

  const ref = doc(db, "users", id, "limites", "ia");
  const hoje = getLocalDateKey();

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      msgs_ia_usadas: 0,
      msgs_ia_limite: limite,
      reset_dia: hoje,
      updatedAt: serverTimestamp(),
    });
    return { usadas: 0, limite };
  }

  const d = snap.data();
  const resetDia: string = d.reset_dia ?? "2000-01-01";

  if (resetDia < hoje) {
    // Novo dia — zera o contador
    await setDoc(ref, {
      msgs_ia_usadas: 0,
      msgs_ia_limite: limite,
      reset_dia: hoje,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { usadas: 0, limite };
  }

  const storedUsadas = typeof d.msgs_ia_usadas === "number" ? d.msgs_ia_usadas : 0;
  const storedLimite = typeof d.msgs_ia_limite === "number" ? d.msgs_ia_limite : limite;
  const finalLimite = isAdmQA() ? 999 : storedLimite;

  // Corrigir limite legado no Firestore quando ADM tem valor desatualizado
  if (isAdmQA() && storedLimite !== 999) {
    setDoc(ref, { msgs_ia_limite: 999, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
  }

  return { usadas: storedUsadas, limite: finalLimite };
}

export async function incrementarMsgIA(): Promise<void> {
  const id = uid();
  if (!id) return;
  await updateDoc(doc(db, "users", id, "limites", "ia"), {
    msgs_ia_usadas: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function resetLimitesIAHoje(plano: string): Promise<void> {
  const id = uid();
  if (!id) return;
  const limite = isAdmQA() ? 999 : (LIMITES_POR_PLANO[plano] ?? 10);
  const hoje = getLocalDateKey();
  await setDoc(doc(db, "users", id, "limites", "ia"), {
    msgs_ia_usadas: 0,
    msgs_ia_limite: limite,
    reset_dia: hoje,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ─────────────────────────────────────────────
// Contexto da IA — users/{uid}/contexto_ia/atual
// ─────────────────────────────────────────────
export type ContextoIA = {
  data: string;             // ISO "YYYY-MM-DD"
  fome: number;             // 0–10
  energia: number;          // 0–10
  humor: string;            // emoji
  sintomas: string[];
  agua: string | null;      // ex: "1L", null se não informado
  peso: number;
  protocolo_ativo: string | null;
  dia_protocolo: number;
};

export async function salvarContextoIA(data: ContextoIA): Promise<void> {
  const id = uid();
  if (!id) return;
  await setDoc(doc(db, "users", id, "contexto_ia", "atual"), {
    ...data,
    savedAt: serverTimestamp(),
  });
}

export async function carregarContextoIA(): Promise<ContextoIA | null> {
  const id = uid();
  if (!id) return null;
  const snap = await getDoc(doc(db, "users", id, "contexto_ia", "atual"));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    data: d.data ?? "",
    fome: d.fome ?? 5,
    energia: d.energia ?? 5,
    humor: d.humor ?? "😐",
    sintomas: Array.isArray(d.sintomas) ? d.sintomas : [],
    agua: d.agua ?? null,
    peso: typeof d.peso === "number" ? d.peso : 75,
    protocolo_ativo: d.protocolo_ativo ?? null,
    dia_protocolo: d.dia_protocolo ?? 1,
  };
}

// ─────────────────────────────────────────────
// Sprint 17B.41B — Fallback robusto por e-mail (UID mismatch + regras Firestore)
// Estratégia em 2 etapas:
//   1. Collection query cliente (pode falhar por security rules)
//   2. /api/acesso/check server-side (bypassa regras, usa Firebase Admin SDK)
// ─────────────────────────────────────────────

const EMAIL_FALLBACK_PAID_PLANS = new Set(["fundador", "essencial", "pro"]);

// Verifica se o plano cacheado no localStorage é realmente válido para acesso
// (evita que "starter" ou outros planos inválidos bloqueiem o fallback)
function hasCachedValidPlan(): boolean {
  const raw = localStorage.getItem("glpy_plano");
  if (!raw || !raw.trim()) return false;
  const p = raw.trim().toLowerCase();
  return ["fundador","essencial","pro","top","admin","betatester","plus","vitalicio","founder","premium"].includes(p);
}

// Campos seguros para backfill automático em UID mismatch.
// xp, streak, protocoloAtivo excluídos: sem verificação de target e risco de inconsistência
// de subcoleção. Migração desses campos fica para Sprint 17B.42 Guardião de Dados.
type ProfileBackfill = {
  nome?: string;
  onboarding?: unknown;
  primeiroAcesso?: boolean;
};

// Espelha campos de plano/acesso para users/{currentUid} com merge.
// merge:true protege campos NÃO incluídos no write; campos incluídos SÃO sobrescritos.
// Por isso o backfill inclui apenas campos seguros (nome, onboarding, primeiroAcesso).
function mirrorPlanToUid(
  currentUid: string,
  email: string,
  planoTipo: string,
  origem: string,
  extra?: Record<string, unknown>,
  profileData?: ProfileBackfill
): void {
  const profileFields: Record<string, unknown> = {};
  if (profileData?.nome)               profileFields.nome = profileData.nome;
  if (profileData?.onboarding != null)  profileFields.onboarding = profileData.onboarding;
  // primeiroAcesso: copia false somente quando o usuário já concluiu o onboarding no doc fonte.
  // Nunca copia true — não há risco de mandar usuário para onboarding sem necessidade.
  if (profileData?.primeiroAcesso === false) profileFields.primeiroAcesso = false;

  setDoc(doc(db, "users", currentUid), {
    email,
    emailLower: email,
    plano: { tipo: planoTipo, status: "active", origem, dataExpiracao: null },
    herospark: {
      active: true, plan: planoTipo, status: "active",
      customerEmail: email, source: origem,
      ...(extra ?? {}),
    },
    ...profileFields,
    accessResolvedBy: origem,
    accessResolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true }).catch(e => console.warn("[glpy] mirror write failed:", e));

  // Popula localStorage imediatamente para a sessão atual (apenas campos copiados)
  if (profileData?.nome)               localStorage.setItem("glpy_nome", profileData.nome);
  if (profileData?.onboarding != null)  localStorage.setItem("glpy_onboarding", JSON.stringify(profileData.onboarding));

  localStorage.setItem("glpy_plano", planoTipo);
  console.info("[glpy] fallback: glpy_plano →", planoTipo, "| origem:", origem, "| profileBackfill:", Object.keys(profileFields));
}

// Etapa 1: collection query client SDK (pode ser bloqueado por security rules)
async function tryFirestoreEmailFallback(
  currentUid: string,
  email: string
): Promise<{ found: boolean; primeiroAcesso: boolean }> {
  console.info("[glpy] fallback [1/2]: query Firestore users where email ==", email);
  try {
    const snap = await getDocs(
      query(collection(db, "users"), where("email", "==", email), limit(5))
    );
    console.info("[glpy] fallback [1/2]: docs encontrados:", snap.size);

    const found = snap.docs
      .filter(d => { const keep = d.id !== currentUid; if (!keep) console.info("[glpy] fallback [1/2]: ignorando próprio UID"); return keep; })
      .map(d => ({ _id: d.id, ...(d.data() as Record<string, unknown>) }))
      .find(d => {
        const p = d.plano as Record<string, unknown> | undefined;
        const hs = d.herospark as Record<string, unknown> | undefined;
        const validA = p?.status === "active" && EMAIL_FALLBACK_PAID_PLANS.has(String(p.tipo ?? ""));
        const validB = hs?.active === true && EMAIL_FALLBACK_PAID_PLANS.has(String(hs.plan ?? ""));
        console.info("[glpy] fallback [1/2]: UID", (d as {_id:string})._id, "| plano.tipo:", p?.tipo, "plano.status:", p?.status, "| herospark.active:", hs?.active, "| elegível:", validA || validB);
        return validA || validB;
      });

    if (!found) { console.info("[glpy] fallback [1/2]: nenhum doc elegível em outro UID"); return { found: false, primeiroAcesso: true }; }

    const planoObj = (found.plano as Record<string, unknown>) ?? {};
    const hsObj    = (found.herospark as Record<string, unknown>) ?? {};
    const tipo = String(planoObj.tipo ?? hsObj.plan ?? "").trim().toLowerCase();
    if (!EMAIL_FALLBACK_PAID_PLANS.has(tipo)) return { found: false, primeiroAcesso: true };

    // Extrai apenas campos seguros do doc fonte (xp/streak/protocoloAtivo excluídos — Sprint 17B.42)
    const profileData: ProfileBackfill = {
      nome:           found.nome as string | undefined,
      onboarding:     found.onboarding,
      primeiroAcesso: found.primeiroAcesso as boolean | undefined,
    };
    const sourceCompletedOnboarding = profileData.primeiroAcesso === false;
    console.info("[glpy] fallback [1/2]: plano ativo encontrado. Espelhando:", tipo, "| sourceCompletedOnboarding:", sourceCompletedOnboarding, "| hasNome:", !!profileData.nome, "| hasOnboarding:", profileData.onboarding != null);

    mirrorPlanToUid(currentUid, email, tipo, "herospark_email_fallback", {
      ...(hsObj.offerId != null ? { offerId: String(hsObj.offerId) } : {}),
      ...(hsObj.transactionId != null ? { transactionId: String(hsObj.transactionId) } : {}),
    }, profileData);

    return { found: true, primeiroAcesso: !sourceCompletedOnboarding };
  } catch (err) {
    console.warn("[glpy] fallback [1/2]: query falhou (possível security rule):", err);
    return { found: false, primeiroAcesso: true };
  }
}

// Etapa 2: /api/acesso/check server-side (Firebase Admin SDK, bypassa security rules).
// A API não retorna dados de perfil, então primeiroAcesso fica true (rota para onboarding).
async function tryApiCheckFallback(
  currentUid: string,
  email: string
): Promise<{ found: boolean; primeiroAcesso: boolean }> {
  console.info("[glpy] fallback [2/2]: /api/acesso/check para", email);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const resp = await fetch(
      `/api/acesso/check?email=${encodeURIComponent(email)}&token=GLPY2026`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!resp.ok) { console.warn("[glpy] fallback [2/2]: HTTP", resp.status); return { found: false, primeiroAcesso: true }; }

    const json = await resp.json();
    console.info("[glpy] fallback [2/2]: resposta:", JSON.stringify(json));

    if (!json.ok || !json.found || !json.active) {
      console.info("[glpy] fallback [2/2]: plano não encontrado ou inativo no servidor");
      return { found: false, primeiroAcesso: true };
    }

    const tipo = String(json.plano ?? "").trim().toLowerCase();
    if (!EMAIL_FALLBACK_PAID_PLANS.has(tipo)) {
      console.info("[glpy] fallback [2/2]: plano do servidor não elegível:", tipo);
      return { found: false, primeiroAcesso: true };
    }

    console.info("[glpy] fallback [2/2]: plano confirmado pelo servidor:", tipo);
    mirrorPlanToUid(currentUid, email, tipo, "api_check_fallback");
    return { found: true, primeiroAcesso: true };
  } catch (err) {
    console.warn("[glpy] fallback [2/2]: erro:", err);
    return { found: false, primeiroAcesso: true };
  }
}

// Fallback principal — tenta Firestore query, depois API server-side.
// Retorna { found, primeiroAcesso } para que syncFromFirestore roteie corretamente.
async function resolveAccessByEmail(
  currentUid: string
): Promise<{ found: boolean; primeiroAcesso: boolean }> {
  const email = auth.currentUser?.email?.toLowerCase().trim();
  if (!email) { console.info("[glpy] fallback: sem email autenticado"); return { found: false, primeiroAcesso: true }; }
  console.info("[glpy] fallback: iniciando para email=", email, "| UID atual=", currentUid);

  const byFirestore = await tryFirestoreEmailFallback(currentUid, email);
  if (byFirestore.found) return byFirestore;

  return tryApiCheckFallback(currentUid, email);
}

// ─────────────────────────────────────────────
// Popula localStorage a partir do Firestore
// ─────────────────────────────────────────────
export async function syncFromFirestore(): Promise<{ primeiroAcesso: boolean }> {
  const id = uid();
  console.info("[glpy] syncFromFirestore: uid=", id, "| email=", auth.currentUser?.email);

  // Try-catch em loadUserData para garantir que erros de Firestore (ex: security rules)
  // não propaguem ao App.tsx e causem roteamento para Planos antes do fallback rodar.
  let data: Record<string, unknown> | null = null;
  try {
    data = await loadUserData();
    console.info("[glpy] syncFromFirestore: users/{uid} existe?", data !== null);
    if (data !== null) {
      const p = data.plano as Record<string, unknown> | undefined;
      console.info("[glpy] syncFromFirestore: plano.tipo=", p?.tipo, "| plano.status=", p?.status, "| herospark.active=", (data.herospark as Record<string,unknown> | undefined)?.active);
    }
  } catch (err) {
    console.warn("[glpy] syncFromFirestore: loadUserData() falhou (regras Firestore ou rede). Seguindo para fallback:", err);
    data = null;
  }

  // Sprint 17B.5.6 — usuário sem documento no Firestore é tratado como primeiro acesso.
  // Cobre o caso de registro via Firebase Auth sem passar pelo Admin (criarUsuarioNovo).
  if (!data) {
    // Sprint 17B.9 — limpa plano herdado de sessão anterior para impedir acesso indevido
    localStorage.removeItem('glpy_plano');
    localStorage.removeItem('glpy_access_control');
    // Sprint 17B.41 — ADM/QA sem documento Firestore: garante acesso sem cair no Paywall
    if (isAdmQA()) {
      localStorage.setItem("glpy_plano", "top");
      return { primeiroAcesso: false };
    }
    // Sprint 17B.41B — UID mismatch: busca plano por e-mail (Firestore query + API check)
    if (id) {
      const result = await resolveAccessByEmail(id);
      if (result.found) {
        console.info("[glpy] syncFromFirestore: acesso liberado por fallback (sem doc) | primeiroAcesso=", result.primeiroAcesso);
        return { primeiroAcesso: result.primeiroAcesso };
      }
    }
    console.info("[glpy] syncFromFirestore: sem doc e sem plano → primeiroAcesso: true");
    return { primeiroAcesso: true };
  }

  // Sprint 17B.9 — limpa antes de repopular para nunca herdar plano de sessão anterior
  localStorage.removeItem('glpy_plano');

  if (data.onboarding) {
    localStorage.setItem("glpy_onboarding", JSON.stringify(data.onboarding));
  }
  if (data.nome)   localStorage.setItem("glpy_nome", String(data.nome));
  if (data.email)  localStorage.setItem("glpy_email", String(data.email));
  if (data.xp)     localStorage.setItem("glpy_xp", String(data.xp));
  if (data.streak) localStorage.setItem("glpy_streak", String(data.streak));
  if (data.protocoloAtivo) {
    localStorage.setItem("glpy_protocolo_ativo", JSON.stringify(data.protocoloAtivo));
  }

  // Plano: suporta string legada e objeto {tipo, dataExpiracao}
  if (data.plano) {
    if (typeof data.plano === "object") {
      const planoObj = data.plano as Record<string, unknown>;
      const expTs = planoObj.dataExpiracao as { toDate?: () => Date } | null;
      let planoExpirado = false;
      if (expTs?.toDate) {
        const exp = expTs.toDate();
        if (exp < new Date() && id) {
          // Plano expirado — rebaixa Firestore em background
          // Remove glpy_plano do localStorage para permitir override via admin_grants abaixo
          updateDoc(doc(db, "users", id), {
            "plano.tipo": "starter",
            "plano.status": "active",
            updatedAt: serverTimestamp(),
          }).catch(() => {});
          localStorage.removeItem("glpy_plano");
          planoExpirado = true;
        }
      }
      if (!planoExpirado && planoObj.tipo) {
        localStorage.setItem("glpy_plano", String(planoObj.tipo).trim().toLowerCase());
      }
    } else {
      localStorage.setItem("glpy_plano", String(data.plano).trim().toLowerCase());
    }
  }

  // Fallback: se users/{uid} não tem plano, buscar em admin_grants pelo email logado.
  // Cobre UID mismatch ou falha silenciosa na escrita do users/{uid}.
  //
  // IMPORTANTE: query usa APENAS where("email") para evitar exigência de índice composto.
  // Filtros adicionais (status, dataExpiracao) são aplicados em JavaScript.
  if (!localStorage.getItem("glpy_plano") && auth.currentUser?.email) {
    const email = auth.currentUser.email.toLowerCase();
    try {
      const grantsSnap = await getDocs(
        query(
          collection(db, "admin_grants"),
          where("email", "==", email),
          limit(10),
        )
      );
      if (!grantsSnap.empty) {
        // Filtra em JS para evitar dependência de índice composto no Firestore
        const activeGrant = grantsSnap.docs
          .map(d => d.data())
          .find(g => {
            if (g.status !== "active") return false;
            const expTs = g.dataExpiracao as { toDate?: () => Date } | null | undefined;
            if (expTs?.toDate) return expTs.toDate() >= new Date();
            return true; // null/ausente = acesso vitalício
          });

        if (activeGrant) {
          const planoNorm = String(activeGrant.plano).trim().toLowerCase();
          localStorage.setItem("glpy_plano", planoNorm);
          // Sincroniza de volta para users/{uid} — evita re-consultar admin_grants nos próximos logins
          if (id) {
            setDoc(doc(db, "users", id), {
              plano: {
                tipo: planoNorm,
                status: "active",
                origem: "manual",
                dataExpiracao: activeGrant.dataExpiracao ?? null,
                liberadoPor: "admin",
              },
              updatedAt: serverTimestamp(),
            }, { merge: true }).catch(() => {});
          }
        }
      }
    } catch { /* fallback silencioso — não bloqueia o fluxo */ }
  }

  // Sprint 17B.41B — fallback por e-mail: cobre UID mismatch E plano inválido (ex: "starter")
  // hasCachedValidPlan() é mais robusto que !glpy_plano: detecta planos não elegíveis também.
  // Neste path, primeiroAcesso vem de data.primeiroAcesso (doc existe), então ignoramos o retorno.
  if (!hasCachedValidPlan() && id) {
    console.info("[glpy] syncFromFirestore: plano não elegível após leitura do doc → iniciando fallback. glpy_plano atual=", localStorage.getItem("glpy_plano"));
    await resolveAccessByEmail(id);
  }

  // ADM/QA — força plano "top" para emails internos, independente do que Firestore retornou
  if (isAdmQA()) {
    localStorage.setItem("glpy_plano", "top");
  }

  console.info("[glpy] syncFromFirestore: glpy_plano final=", localStorage.getItem("glpy_plano"), "| hasCachedValidPlan=", hasCachedValidPlan());
  return { primeiroAcesso: data.primeiroAcesso === true };
}

// ─────────────────────────────────────────────
// Admin — liberação manual de acesso
// ─────────────────────────────────────────────
const DURACAO_DIAS: Record<string, number | null> = {
  "7d": 7, "15d": 15, "30d": 30, "90d": 90, "vitalicio": null,
};

export type Grant = {
  id: string;
  uid: string;
  email: string;
  plano: string;
  duracao: string;
  dataExpiracao: Date | null;
  liberadoEm: Date;
};

export async function buscarUidPorEmail(email: string): Promise<string | null> {
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", email.toLowerCase().trim()))
  );
  if (snap.empty) return null;
  return snap.docs[0].id;
}

export async function criarUsuarioNovo(email: string): Promise<string> {
  // Usa app secundário para não derrubar a sessão do admin
  const secondaryApp = initializeApp(app.options, `admin-create-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  let newUid: string;
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, "GLPY@2026");
    newUid = cred.user.uid;
    await fbSignOut(secondaryAuth);
  } finally {
    await deleteApp(secondaryApp);
  }
  // Cria documento base no Firestore
  await setDoc(doc(db, "users", newUid), {
    email: email.toLowerCase(),
    nome: "Usuário GLPY",
    primeiroAcesso: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newUid;
}

export async function liberarAcesso(
  uid: string,
  email: string,
  plano: string,
  duracao: string,
): Promise<string> {
  const dias = DURACAO_DIAS[duracao];
  let dataExpiracao: Date | null = null;
  if (dias !== null && dias !== undefined) {
    dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + dias);
  }

  const planoData = {
    tipo: plano,
    status: "active",
    origem: "manual",
    dataExpiracao: dataExpiracao ? Timestamp.fromDate(dataExpiracao) : null,
    liberadoPor: "admin",
  };

  // setDoc merge funciona para doc novo e existente
  await setDoc(doc(db, "users", uid), {
    plano: planoData,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const ref = await addDoc(collection(db, "admin_grants"), {
    uid,
    email,
    plano,
    duracao,
    dataExpiracao: dataExpiracao ? Timestamp.fromDate(dataExpiracao) : null,
    liberadoEm: serverTimestamp(),
    status: "active",
  });
  return ref.id;
}

export async function revogarAcesso(targetUid: string, grantId: string): Promise<void> {
  await updateDoc(doc(db, "users", targetUid), {
    plano: {
      tipo: "starter",
      status: "active",
      origem: "manual",
      dataExpiracao: null,
      liberadoPor: "admin",
    },
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "admin_grants", grantId), { status: "revoked" });
}

export async function listarAcessosManuais(): Promise<Grant[]> {
  const snap = await getDocs(
    query(
      collection(db, "admin_grants"),
      where("status", "==", "active"),
      orderBy("liberadoEm", "desc"),
      limit(10),
    )
  );
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      uid: data.uid,
      email: data.email,
      plano: data.plano,
      duracao: data.duracao,
      dataExpiracao: data.dataExpiracao?.toDate?.() ?? null,
      liberadoEm: data.liberadoEm?.toDate?.() ?? new Date(),
    };
  });
}
