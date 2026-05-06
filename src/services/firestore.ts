import {
  doc, setDoc, getDoc, collection, addDoc,
  serverTimestamp, updateDoc,
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
