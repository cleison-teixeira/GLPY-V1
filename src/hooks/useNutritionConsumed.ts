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

function readTodayConsumed(): NutritionConsumed {
  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem('glpy_refeicoes_hoje');
    if (!raw) return zero();
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) return zero();
    const todayEntries = entries.filter(e => {
      if (!e.savedAt) return true;
      return new Date(e.savedAt).toISOString().slice(0, 10) === todayKey;
    });
    return {
      consumedCalories: todayEntries.reduce((s, e) => {
        const cal = parseFloat(String(e.calories ?? 0)) || 0;
        if (cal > 0) return s + cal;
        // Fallback: calcular por macros quando calorias não foram preenchidas
        const p = parseFloat(String(e.protein ?? 0)) || 0;
        const c = parseFloat(String(e.carbs   ?? 0)) || 0;
        const f = parseFloat(String(e.fat     ?? 0)) || 0;
        return s + (p * 4 + c * 4 + f * 9);
      }, 0),
      consumedProtein:  todayEntries.reduce((s, e) => s + (parseFloat(String(e.protein  ?? 0)) || 0), 0),
      consumedCarbs:    todayEntries.reduce((s, e) => s + (parseFloat(String(e.carbs    ?? 0)) || 0), 0),
      consumedFat:      todayEntries.reduce((s, e) => s + (parseFloat(String(e.fat      ?? 0)) || 0), 0),
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
