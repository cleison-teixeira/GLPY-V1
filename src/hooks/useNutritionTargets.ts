import { useMemo, useState, useEffect } from 'react';
import {
  calculateGLPYDailyTargets,
  GLPYTargetsOutput,
} from '../core/glpyDailyTargets';
import { useCurrentWeight } from './useCurrentWeight';
import { useUserOnboarding } from './useUserOnboarding';

function readTodayActivityCalories(): number {
  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayRaw = localStorage.getItem('glpy_today_activity');
    if (todayRaw) {
      const entries: Array<{ kcalBurned?: number; date?: string }> = JSON.parse(todayRaw);
      if (Array.isArray(entries) && entries.length > 0) {
        const todayEntries = entries.filter(e => e.date === todayKey);
        if (todayEntries.length > 0) {
          return todayEntries.reduce((sum, e) => sum + (e.kcalBurned ?? 0), 0);
        }
      }
    }
    // legacy fallback: ActivityScreen still writes here
    const legacy = JSON.parse(localStorage.getItem('glpy_atividade_hoje') || '{}');
    if (legacy?.calories && typeof legacy.calories === 'number' && legacy.calories > 0) {
      if (legacy.savedAt) {
        const savedDate = new Date(legacy.savedAt).toISOString().slice(0, 10);
        if (savedDate === todayKey) return legacy.calories;
      }
    }
  } catch {}
  return 0;
}

export type { GLPYTargetsOutput };

// Mapeia o campo "modo" (armazenado com emoji) para o enum do engine
export function mapModoToWeightLossPace(
  modo: string,
): 'leve' | 'equilibrado' | 'intenso' {
  const s = (modo ?? '').toLowerCase();
  if (s.includes('gentil') || s.includes('leve')) return 'leve';
  if (s.includes('intensivo') || s.includes('intenso')) return 'intenso';
  return 'equilibrado';
}

export function useNutritionTargets(): GLPYTargetsOutput | null {
  const { weight } = useCurrentWeight();
  const onboarding = useUserOnboarding();
  const [activityCalories, setActivityCalories] = useState<number>(() => readTodayActivityCalories());

  useEffect(() => {
    function handleUpdate() {
      setActivityCalories(readTodayActivityCalories());
    }
    window.addEventListener('local-storage-change', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('local-storage-change', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return useMemo(() => {
    try {
      // altura do hook já está em metros; engine espera cm
      const heightCm =
        onboarding.altura > 3
          ? Math.round(onboarding.altura)          // já era cm
          : Math.round(onboarding.altura * 100);   // converte m → cm

      const ageYears = onboarding.idade ?? 35;
      const gender: 'male' | 'female' = (onboarding.sexo ?? '')
        .toLowerCase()
        .includes('masc')
        ? 'male'
        : 'female';

      return calculateGLPYDailyTargets({
        weightKg: weight,
        heightCm,
        ageYears,
        gender,
        activityLevel: onboarding.activityLevel,
        weightLossPace: mapModoToWeightLossPace(onboarding.modo),
        targetWeightKg: onboarding.pesoMeta > 0 ? onboarding.pesoMeta : undefined,
        activityCaloriesBurned: activityCalories,
      });
    } catch {
      return null;
    }
  }, [weight, onboarding, activityCalories]);
}
