import { useState, useEffect } from 'react';
import { glpyStore } from '../data/glpyStore';

export interface DailyLimitsData {
  fotosUsadas: number;
  fotosLimite: number;
  iaUsadas: number;
  iaLimite: number;
}

const LIMITES_FOTO: Record<string, number> = { starter: 3, plus: 6, pro: 9, top: Infinity };
const LIMITES_IA:   Record<string, number> = { starter: 10, plus: 20, pro: 30, top: 999 };

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function readIAUsage(iaLimite: number): number {
  try {
    const parsed = glpyStore.aiUsage.get();
    if (!parsed.month || parsed.month !== getCurrentMonth()) return 0;
    const used = typeof parsed.used === 'number' ? parsed.used : 0;
    return Math.min(used, iaLimite);
  } catch { return 0; }
}

function readDailyLimits(): DailyLimitsData {
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
