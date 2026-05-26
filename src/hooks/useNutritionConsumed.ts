import { useState, useEffect } from 'react';

export interface NutritionConsumed {
  consumedCalories: number;
  consumedProtein:  number;
  consumedCarbs:    number;
  consumedFat:      number;
  mealsCount:       number;
}

function zero(): NutritionConsumed {
  return { consumedCalories: 0, consumedProtein: 0, consumedCarbs: 0, consumedFat: 0, mealsCount: 0 };
}

// Normaliza campos antigos e novos em valores numéricos.
// Aceita: calories/calorias, protein/proteina/proteinas,
//         carbs/carboidratos, fat/gordura/gorduras
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMacros(e: any) {
  return {
    calories: parseFloat(String(e.calories ?? e.calorias ?? 0)) || 0,
    protein:  parseFloat(String(e.protein  ?? e.proteina ?? e.proteinas ?? 0)) || 0,
    carbs:    parseFloat(String(e.carbs    ?? e.carboidratos ?? 0)) || 0,
    fat:      parseFloat(String(e.fat      ?? e.gordura ?? e.gorduras ?? 0)) || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isToday(e: any, todayKey: string): boolean {
  if (typeof e.date === 'string' && e.date.length >= 10)
    return e.date.slice(0, 10) === todayKey;
  if (typeof e.createdAt === 'string' && e.createdAt.length >= 10)
    return e.createdAt.slice(0, 10) === todayKey;
  if (e.savedAt)
    return new Date(e.savedAt).toISOString().slice(0, 10) === todayKey;
  return true;
}

function readTodayConsumed(): NutritionConsumed {
  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem('glpy_refeicoes_hoje');
    if (!raw) return zero();
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) return zero();
    const todayEntries = entries.filter(e => isToday(e, todayKey));
    return {
      consumedCalories: todayEntries.reduce((s, e) => {
        const m = normalizeMacros(e);
        if (m.calories > 0) return s + m.calories;
        return s + (m.protein * 4 + m.carbs * 4 + m.fat * 9);
      }, 0),
      consumedProtein:  todayEntries.reduce((s, e) => s + normalizeMacros(e).protein, 0),
      consumedCarbs:    todayEntries.reduce((s, e) => s + normalizeMacros(e).carbs,   0),
      consumedFat:      todayEntries.reduce((s, e) => s + normalizeMacros(e).fat,     0),
      mealsCount: todayEntries.length,
    };
  } catch {
    return zero();
  }
}

export function useNutritionConsumed(): NutritionConsumed {
  const [data, setData] = useState<NutritionConsumed>(() => readTodayConsumed());

  useEffect(() => {
    function handleUpdate() { setData(readTodayConsumed()); }
    window.addEventListener('local-storage-change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('local-storage-change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return data;
}
