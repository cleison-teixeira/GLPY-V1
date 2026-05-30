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
// Popula localStorage a partir do Firestore
// ─────────────────────────────────────────────
export async function syncFromFirestore(): Promise<{ primeiroAcesso: boolean }> {
  const id = uid();
  const data = await loadUserData();
  // Sprint 17B.5.6 — usuário sem documento no Firestore é tratado como primeiro acesso.
  // Cobre o caso de registro via Firebase Auth sem passar pelo Admin (criarUsuarioNovo).
  if (!data) {
    // Sprint 17B.9 — limpa plano herdado de sessão anterior para impedir acesso indevido
    localStorage.removeItem('glpy_plano');
    localStorage.removeItem('glpy_access_control');
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

  // ADM/QA — força plano "top" para emails internos, independente do que Firestore retornou
  if (isAdmQA()) {
    localStorage.setItem("glpy_plano", "top");
  }

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
