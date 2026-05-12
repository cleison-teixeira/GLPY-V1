import {
  doc, setDoc, getDoc, collection, addDoc,
  serverTimestamp, updateDoc, increment,
} from "firebase/firestore";
import { db, auth } from "../firebase.js";

function uid(): string | null {
  return auth.currentUser?.uid ?? null;
}

// ─────────────────────────────────────────────
// Perfil completo do usuário (onboarding + Firebase user)
// ─────────────────────────────────────────────
export async function saveUserProfile(data: Record<string, unknown>): Promise<void> {
  const id = uid();
  if (!id) return;
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
// Limites de uso da IA — users/{uid}/limites/ia
// ─────────────────────────────────────────────
const LIMITES_POR_PLANO: Record<string, number> = { starter: 10, plus: 20, pro: 30, top: 999 };

export async function carregarLimitesIA(plano: string): Promise<{
  usadas: number;
  limite: number;
}> {
  const id = uid();
  const limite = LIMITES_POR_PLANO[plano] ?? 10;
  if (!id) return { usadas: 0, limite };

  const ref = doc(db, "users", id, "limites", "ia");
  const primeroDiaMes = new Date().toISOString().slice(0, 8) + "01";

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      msgs_ia_usadas: 0,
      msgs_ia_limite: limite,
      reset_dia: primeroDiaMes,
      updatedAt: serverTimestamp(),
    });
    return { usadas: 0, limite };
  }

  const d = snap.data();
  const resetDia: string = d.reset_dia ?? "2000-01-01";

  if (resetDia < primeroDiaMes) {
    // Novo mês — zera o contador
    await setDoc(ref, {
      msgs_ia_usadas: 0,
      msgs_ia_limite: limite,
      reset_dia: primeroDiaMes,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { usadas: 0, limite };
  }

  return {
    usadas: typeof d.msgs_ia_usadas === "number" ? d.msgs_ia_usadas : 0,
    limite: typeof d.msgs_ia_limite === "number" ? d.msgs_ia_limite : limite,
  };
}

export async function incrementarMsgIA(): Promise<void> {
  const id = uid();
  if (!id) return;
  await updateDoc(doc(db, "users", id, "limites", "ia"), {
    msgs_ia_usadas: increment(1),
    updatedAt: serverTimestamp(),
  });
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
export async function syncFromFirestore(): Promise<void> {
  const data = await loadUserData();
  if (!data) return;

  if (data.onboarding) {
    localStorage.setItem("glpy_onboarding", JSON.stringify(data.onboarding));
  }
  if (data.nome)   localStorage.setItem("glpy_nome", String(data.nome));
  if (data.plano)  localStorage.setItem("glpy_plano", String(data.plano));
  if (data.email)  localStorage.setItem("glpy_email", String(data.email));
  if (data.xp)     localStorage.setItem("glpy_xp", String(data.xp));
  if (data.streak) localStorage.setItem("glpy_streak", String(data.streak));
  if (data.protocoloAtivo) {
    localStorage.setItem("glpy_protocolo_ativo", JSON.stringify(data.protocoloAtivo));
  }
}
