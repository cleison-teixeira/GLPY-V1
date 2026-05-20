// GLPY — Daily Targets Engine
// System: Calculation Engine — LIGHT PREMIUM
// Authority: docs/glpy-daily-targets-engine-v1.md | src/config/glpyTargetsConfig.ts

import { GLPY_TARGETS_CONFIG } from '../config/glpyTargetsConfig';

export interface GLPYTargetsInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  weightLossPace: 'leve' | 'equilibrado' | 'intenso';
  targetWeightKg?: number;
  activeMedicationDose?: string;
}

export interface GLPYTargetsOutput {
  bmr: number;
  tdee: number;
  caloriesTarget: number;
  caloriesMinWarningApplied: boolean;
  proteinGrams: number;
  proteinCalories: number;
  fatGrams: number;
  fatCalories: number;
  carbsGrams: number;
  carbsCalories: number;
  waterLiters: number;
  warnings: string[];
  clinicalContextNotes: string[];
  configVersion: string;
}

// Fatores de Multiplicação de Atividade Física (TDEE Multipliers)
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

/**
 * Calcula as metas diárias recomendadas baseando-se nos inputs do usuário e na configuração.
 * Engine 100% pura, síncrona e auditável.
 */
export function calculateGLPYDailyTargets(input: GLPYTargetsInput): GLPYTargetsOutput {
  const {
    weightKg,
    heightCm,
    ageYears,
    gender,
    activityLevel,
    weightLossPace,
    targetWeightKg,
    activeMedicationDose
  } = input;

  const warnings: string[] = [];
  const clinicalContextNotes: string[] = [];

  // 1. Cálculo do IMC (Índice de Massa Corporal) para auxílio clínico
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  // Alerta clínico de obesidade sugerindo ajuste por peso alvo nas proteínas
  if (bmi >= 30) {
    warnings.push(
      "Para graus mais elevados de obesidade (IMC ≥ 30), a fórmula baseada no peso atual pode superestimar metas de hidratação e proteínas. Considere ajustar a referência do peso para 'Peso Alvo' (Target Weight) para maior exatidão metabólica."
    );
  }

  // 2. Taxa Metabólica Basal (BMR) - Equação de Mifflin-St Jeor
  let bmr = 0;
  if (gender === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
  }

  // 3. Gasto Energético Diário Total (TDEE)
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const tdee = bmr * activityMultiplier;

  // 4. Meta de Calorias com Déficit Calórico por Ritmo
  const deficit = GLPY_TARGETS_CONFIG.calories.deficitByPace[weightLossPace] || 500;
  let grossCalories = tdee - deficit;

  // Garantia do Piso Calórico Protetivo
  let caloriesTarget = grossCalories;
  let caloriesMinWarningApplied = false;
  const floorCalories = GLPY_TARGETS_CONFIG.calories.minCaloriesWarning;

  if (caloriesTarget < floorCalories) {
    caloriesTarget = floorCalories;
    caloriesMinWarningApplied = true;
    warnings.push(
      `A meta calórica bruta calculada (${Math.round(grossCalories)} kcal) ficou abaixo do limite seguro. Ajustamos reativamente para o piso protetivo de ${floorCalories} kcal para preservar massa magra e evitar fadiga extrema.`
    );
  }

  // Arredonda calorias
  caloriesTarget = Math.round(caloriesTarget);

  // 5. Meta de Proteínas (g/kg)
  // Determina se usa peso atual ou peso alvo com base na configuração editável
  const pConfig = GLPY_TARGETS_CONFIG.protein;
  let refWeight = weightKg;
  if (pConfig.referenceWeightMode === 'target' && targetWeightKg && targetWeightKg > 20) {
    refWeight = targetWeightKg;
    clinicalContextNotes.push(`Metas proteicas baseadas no Peso Alvo de ${targetWeightKg} kg.`);
  } else {
    clinicalContextNotes.push(`Metas proteicas baseadas no Peso Atual de ${weightKg} kg.`);
  }

  const proteinGrams = Math.round(refWeight * pConfig.defaultGPerKg);
  const proteinCalories = proteinGrams * 4;

  // 6. Meta de Gorduras (Frações do total calórico)
  const fatPercent = GLPY_TARGETS_CONFIG.macros.fatPercentDefault;
  const fatCalories = Math.round(caloriesTarget * (fatPercent / 100));
  const fatGrams = Math.round(fatCalories / 9);

  // 7. Meta de Carboidratos (Remainder / Diferença Calórica)
  let carbsCalories = caloriesTarget - proteinCalories - fatCalories;
  
  // Garantia matemática de não negatividade
  if (carbsCalories < 0) {
    carbsCalories = 0;
  }
  const carbsGrams = Math.round(carbsCalories / 4);

  // Alerta clínico de muito baixo carboidrato
  if (carbsGrams < 50) {
    warnings.push(
      `Seu consumo planejado de carboidratos (${carbsGrams}g) está criticamente baixo devido à alta cota proteica. Recomenda-se aumentar ligeiramente a meta calórica ou selecionar um ritmo de perda de peso mais suave ('leve') para equilibrar a ingestão de energia.`
    );
  }

  // 8. Meta de Hidratação de Água (ml/kg)
  const rawWater = (weightKg * GLPY_TARGETS_CONFIG.water.mlPerKg) / 1000;
  
  // Clampa com segurança de acordo com os limites configuráveis
  const waterLiters = Math.min(
    Math.max(rawWater, GLPY_TARGETS_CONFIG.water.minLiters),
    GLPY_TARGETS_CONFIG.water.maxLiters
  );

  // 9. Contextualização do Medicamento GLP-1
  if (activeMedicationDose && activeMedicationDose.trim()) {
    clinicalContextNotes.push(
      `Contexto Clínico Ativo: O paciente faz uso do medicamento GLP-1 na dose de ${activeMedicationDose}.`
    );
    clinicalContextNotes.push(GLPY_TARGETS_CONFIG.medicationContext.notes);
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    caloriesTarget,
    caloriesMinWarningApplied,
    proteinGrams,
    proteinCalories,
    fatGrams,
    fatCalories,
    carbsGrams,
    carbsCalories,
    waterLiters: parseFloat(waterLiters.toFixed(2)),
    warnings,
    clinicalContextNotes,
    configVersion: GLPY_TARGETS_CONFIG.version
  };
}
