import { useState } from 'react';

export interface UserOnboardingData {
  nome: string;
  pesoInicial: number;
  pesoMeta: number;
  altura: number;       // sempre em metros
  objetivo: string;
  modo: string;
  medicamento: string;
  sexo: string | null;
  idade: number | null;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
}

const FALLBACK: UserOnboardingData = {
  nome: 'Usuário GLPY',
  pesoInicial: 72.6,
  pesoMeta: 60.0,
  altura: 1.65,
  objetivo: '',
  modo: '🧘 Equilibrado',
  medicamento: '',
  sexo: null,
  idade: null,
  activityLevel: 'lightly_active',
};

function normalizeHeight(raw: string | number | undefined): number | null {
  const n = parseFloat(String(raw ?? ''));
  if (isNaN(n) || n <= 0) return null;
  // se veio em cm (> 3), converte para metros
  return n > 3 ? parseFloat((n / 100).toFixed(2)) : n;
}

function mapActivityLevel(
  raw: string | undefined,
): UserOnboardingData['activityLevel'] {
  const s = (raw ?? '').toLowerCase();
  if (s.includes('sedent')) return 'sedentary';
  if (s.includes('moder')) return 'moderately_active';
  if (s.includes('muito') || s.includes('very')) return 'very_active';
  if (s.includes('extra')) return 'extra_active';
  return 'lightly_active';
}

function readOnboarding(): UserOnboardingData {
  try {
    const raw = localStorage.getItem('glpy_onboarding');
    const onb: Record<string, unknown> = raw ? JSON.parse(raw) : {};

    const nome =
      localStorage.getItem('glpy_nome')?.trim() ||
      String(onb.nome ?? '').trim() ||
      FALLBACK.nome;

    const pesoInicial = (() => {
      const n = parseFloat(String(onb.peso_atual ?? ''));
      return !isNaN(n) && n > 0 ? n : FALLBACK.pesoInicial;
    })();

    const pesoMeta = (() => {
      const fromKey = parseFloat(localStorage.getItem('glpy_peso_sonho') ?? '');
      if (!isNaN(fromKey) && fromKey > 0) return fromKey;
      const n = parseFloat(String(onb.peso_sonho ?? ''));
      return !isNaN(n) && n > 0 ? n : FALLBACK.pesoMeta;
    })();

    const altura = (() => {
      const fromKey = normalizeHeight(localStorage.getItem('glpy_altura') ?? '');
      if (fromKey !== null) return fromKey;
      return normalizeHeight(onb.altura as string | number) ?? FALLBACK.altura;
    })();

    const sexo =
      localStorage.getItem('glpy_sexo')?.trim() ||
      String(onb.sexo ?? '').trim() ||
      null;

    const idade = (() => {
      const n = parseInt(String(onb.idade ?? ''), 10);
      return !isNaN(n) && n > 0 ? n : null;
    })();

    return {
      nome,
      pesoInicial,
      pesoMeta,
      altura,
      objetivo: String(onb.objetivo ?? ''),
      modo: String(onb.modo ?? FALLBACK.modo),
      medicamento:
        localStorage.getItem('glpy_medicamento')?.trim() ||
        String(onb.medicamento ?? ''),
      sexo: sexo || null,
      idade,
      activityLevel: mapActivityLevel(String(onb.atividade ?? '')),
    };
  } catch {
    return FALLBACK;
  }
}

export function useUserOnboarding(): UserOnboardingData {
  const [data] = useState<UserOnboardingData>(readOnboarding);
  return data;
}
