import { useMemo, useState, useEffect } from 'react';
import {
  calculateGLPYDailyTargets,
  GLPYTargetsOutput,
} from '../core/glpyDailyTargets';
import { useCurrentWeight } from './useCurrentWeight';
import { useUserOnboarding } from './useUserOnboarding';
import { glpyStore } from '../data/glpyStore';

function readTodayActivityCalories(): number {
  try {
    return glpyStore.activity.getToday()?.activityCaloriesBurned ?? 0;
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
