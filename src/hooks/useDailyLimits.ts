import { useState, useEffect } from 'react';
import { glpyStore } from '../data/glpyStore';
import { getLocalDateKey } from '../utils/formatters';

export interface DailyLimitsData {
  fotosUsadas: number;
  fotosLimite: number;
  iaUsadas: number;
  iaLimite: number;
}

// Sprint 17B.1 — planos HeroSpark + backward compat Kiwify
const LIMITES_FOTO: Record<string, number> = { starter: 5, fundador: 5, essencial: 5, pro: 19, top: 999, betatester: 999, plus: 6 };
const LIMITES_IA:   Record<string, number> = { starter: 30, fundador: 30, essencial: 30, pro: 99, top: 999, betatester: 999, plus: 20 };

function getTodayKey(): string {
  return getLocalDateKey();
}

// Zera glpy_ai_usage localmente quando detecta mudança de dia.
// Roda antes de qualquer leitura, garantindo que readIAUsage retorna 0 no novo dia
// mesmo antes de qualquer callback async (Firestore) completar.
function resetLocalIfNewDay(): void {
  try {
    const parsed = glpyStore.aiUsage.get() as any;
    const today = getTodayKey();
    if (!parsed.date || parsed.date !== today) {
      const plano = localStorage.getItem('glpy_plano') ?? 'starter';
      const limit = LIMITES_IA[plano] ?? 10;
      glpyStore.aiUsage.save({
        date: today, dia: today, reset_dia: today,
        used: 0, limit, updatedAt: new Date().toISOString(),
      } as any);
    }
  } catch {}
}

function readIAUsage(iaLimite: number): number {
  try {
    const parsed = glpyStore.aiUsage.get() as any;
    const today = getTodayKey();
    if (!parsed.date || parsed.date !== today) return 0;
    const used = typeof parsed.used === 'number' ? parsed.used : 0;
    return Math.min(used, iaLimite);
  } catch { return 0; }
}

function readDailyLimits(): DailyLimitsData {
  resetLocalIfNewDay();
  const plano = localStorage.getItem('glpy_plano') ?? 'starter';
  const fotosLimite = LIMITES_FOTO[plano] ?? 3;
  const iaLimite   = LIMITES_IA[plano]   ?? 10;

  let fotosUsadas = 0;
  try {
    const dataGravada = localStorage.getItem('glpy_fotos_data');
    if (dataGravada === getTodayKey()) {
      const n = parseInt(localStorage.getItem('glpy_fotos_hoje') ?? '0', 10);
      if (!isNaN(n) && n >= 0) fotosUsadas = n;
    }
  } catch {}

  return {
    fotosUsadas,
    fotosLimite,
    iaUsadas: readIAUsage(iaLimite),
    iaLimite,
  };
}

export function useDailyLimits(): DailyLimitsData {
  const [data, setData] = useState<DailyLimitsData>(readDailyLimits);

  useEffect(() => {
    const handleUpdate = () => setData(readDailyLimits());
    window.addEventListener('local-storage-change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('local-storage-change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return data;
}
