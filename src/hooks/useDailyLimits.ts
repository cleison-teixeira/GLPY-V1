import { useState } from 'react';

export interface DailyLimitsData {
  // Foto do prato — count lido localmente; limite derivado do plano
  fotosUsadas: number;
  fotosLimite: number;
  // IA — sem fonte local (Firestore-only); count sempre 0 como fallback
  iaUsadas: number;
  iaLimite: number;
}

const LIMITES_FOTO: Record<string, number> = { starter: 3, plus: 6, pro: 9, top: Infinity };
const LIMITES_IA:   Record<string, number> = { starter: 10, plus: 20, pro: 30, top: 999 };

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
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
    // Se a data gravada for de outro dia o contador ainda não foi resetado pelo
    // FotoPrato — tratamos como 0 (nenhuma foto feita hoje ainda).
  } catch {}

  return {
    fotosUsadas,
    fotosLimite,
    iaUsadas: 0, // armazenado apenas no Firestore; fallback local = 0
    iaLimite,
  };
}

export function useDailyLimits(): DailyLimitsData {
  const [data] = useState<DailyLimitsData>(readDailyLimits);
  return data;
}
