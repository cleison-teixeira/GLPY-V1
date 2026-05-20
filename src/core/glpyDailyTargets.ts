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

// Modelo de consumo diário acumulado
export interface GLPYDailyConsumed {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  mealCount: number;
}

// Saldo restante de um macro individual
export interface MacroBalance {
  remaining: number;    // 0 se completou; pode ser negativo internamente
  overage: number;      // excedente acima da meta (>0 quando passou)
  completed: boolean;
}

// Saída completa do cálculo de saldo
export interface GLPYDailyRemaining {
  calories: MacroBalance;
  proteinGrams: MacroBalance;
  carbsGrams: MacroBalance;
  fatGrams: MacroBalance;
  waterLiters: MacroBalance;
  overallCompletionPercent: number; // % média entre os 5 componentes
  aiOrientationNote: string;        // nota gerada para injetar no prompt da IA
}

// Fatores de Multiplicação de Atividade Física (TDEE Multipliers)
const ACTIVITY_MULTIPLIERS: Record<GLPYTargetsInput['activityLevel'], number> = {
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

  // 1. IMC para aviso clínico
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (bmi >= 30) {
    warnings.push(
      "Para graus mais elevados de obesidade (IMC ≥ 30), a fórmula baseada no peso atual pode superestimar metas de hidratação e proteínas. Considere ajustar a referência do peso para 'Peso Alvo' (Target Weight) para maior exatidão metabólica."
    );
  }

  // 2. BMR — Mifflin-St Jeor
  let bmr = 0;
  if (gender === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
  }

  // 3. TDEE
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  const tdee = bmr * activityMultiplier;

  // 4. Meta Calórica com Déficit
  const deficit = GLPY_TARGETS_CONFIG.calories.deficitByPace[weightLossPace] ?? 500;
  let grossCalories = tdee - deficit;
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
  caloriesTarget = Math.round(caloriesTarget);

  // 5. Proteínas (g/kg)
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

  // 6. Gorduras (25% kcal)
  const fatPercent = GLPY_TARGETS_CONFIG.macros.fatPercentDefault;
  const fatCalories = Math.round(caloriesTarget * (fatPercent / 100));
  const fatGrams = Math.round(fatCalories / 9);

  // 7. Carboidratos (remainder)
  let carbsCalories = caloriesTarget - proteinCalories - fatCalories;
  if (carbsCalories < 0) carbsCalories = 0;
  const carbsGrams = Math.round(carbsCalories / 4);

  if (carbsGrams < 50) {
    warnings.push(
      `Seu consumo planejado de carboidratos (${carbsGrams}g) está criticamente baixo. Recomenda-se um ritmo de perda de peso mais suave ('leve') para equilibrar a ingestão de energia.`
    );
  }

  // 8. Água (ml/kg clampada)
  const rawWater = (weightKg * GLPY_TARGETS_CONFIG.water.mlPerKg) / 1000;
  const waterLiters = parseFloat(
    Math.min(
      Math.max(rawWater, GLPY_TARGETS_CONFIG.water.minLiters),
      GLPY_TARGETS_CONFIG.water.maxLiters
    ).toFixed(2)
  );

  // 9. Contexto medicamento GLP-1
  if (activeMedicationDose?.trim()) {
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
    waterLiters,
    warnings,
    clinicalContextNotes,
    configVersion: GLPY_TARGETS_CONFIG.version
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSUMO DIÁRIO E SALDO RESTANTE
// ─────────────────────────────────────────────────────────────────────────────

/** Constrói um MacroBalance individual comparando consumido vs meta. */
function buildBalance(consumed: number, target: number, decimals = 0): MacroBalance {
  const diff = target - consumed;
  const remaining = diff > 0 ? parseFloat(diff.toFixed(decimals)) : 0;
  const overage   = diff < 0 ? parseFloat(Math.abs(diff).toFixed(decimals)) : 0;
  return { remaining, overage, completed: diff <= 0 };
}

/**
 * Calcula o saldo restante de macros e água para o dia, dado o que já foi consumido.
 * Retorna também uma nota de orientação para injetar no prompt da IA.
 */
export function calculateDailyRemaining(
  targets: GLPYTargetsOutput,
  consumed: GLPYDailyConsumed
): GLPYDailyRemaining {
  const calories    = buildBalance(consumed.calories,     targets.caloriesTarget);
  const proteinGrams= buildBalance(consumed.proteinGrams, targets.proteinGrams);
  const carbsGrams  = buildBalance(consumed.carbsGrams,   targets.carbsGrams);
  const fatGrams    = buildBalance(consumed.fatGrams,      targets.fatGrams);
  const waterLiters = buildBalance(consumed.waterLiters,  targets.waterLiters, 2);

  // % de conclusão médio entre os 5 eixos
  const pct = (macro: MacroBalance, target: number) =>
    target > 0 ? Math.min((target - macro.remaining) / target, 1) : 1;

  const completionPcts = [
    pct(calories,     targets.caloriesTarget),
    pct(proteinGrams, targets.proteinGrams),
    pct(carbsGrams,   targets.carbsGrams),
    pct(fatGrams,      targets.fatGrams),
    pct(waterLiters,  targets.waterLiters),
  ];
  const overallCompletionPercent = Math.round(
    (completionPcts.reduce((a, b) => a + b, 0) / completionPcts.length) * 100
  );

  // Gera nota orientativa para a IA
  const pending: string[] = [];
  if (!proteinGrams.completed) pending.push(`proteína (faltam ${proteinGrams.remaining}g)`);
  if (!waterLiters.completed)  pending.push(`hidratação (faltam ${waterLiters.remaining}L)`);
  if (!calories.completed)     pending.push(`calorias (faltam ${calories.remaining} kcal)`);
  if (!carbsGrams.completed)   pending.push(`carboidratos (faltam ${carbsGrams.remaining}g)`);
  if (!fatGrams.completed)     pending.push(`gorduras (faltam ${fatGrams.remaining}g)`);

  let aiOrientationNote = '';
  if (pending.length === 0) {
    aiOrientationNote = 'Usuário atingiu todas as metas do dia. Parabéns! Reforce a manutenção.';
  } else {
    aiOrientationNote = `Usuário ainda está pendente em: ${pending.join(', ')}. Priorize refeições pequenas e proteicas, hidratação fracionada e escolhas de baixo impacto glicêmico.`;
  }

  return {
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
    overallCompletionPercent,
    aiOrientationNote
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILDER DE PAYLOAD PARA IA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formata o payload completo de metas + consumo + saldo como string de texto
 * para injetar no contexto da IA (DeepSeek / ChatIA).
 */
export function buildDailyTargetsForAI(
  targets: GLPYTargetsOutput,
  consumed: GLPYDailyConsumed,
  remaining: GLPYDailyRemaining
): string {
  const formatBalance = (b: MacroBalance, unit: string) =>
    b.completed
      ? `Meta concluída${b.overage > 0 ? ` (+${b.overage}${unit} acima)` : ''}`
      : `${b.remaining}${unit} restantes`;

  return `
=== GLPY DAILY TARGETS ENGINE ===

Metas do Dia:
- Calorias: ${targets.caloriesTarget} kcal
- Proteína: ${targets.proteinGrams}g
- Carboidratos: ${targets.carbsGrams}g
- Gorduras: ${targets.fatGrams}g
- Água: ${targets.waterLiters}L
- Versão da engine: ${targets.configVersion}

Consumido Hoje (${consumed.mealCount} refeição${consumed.mealCount !== 1 ? 'ões' : ''}):
- Calorias: ${consumed.calories} kcal
- Proteína: ${consumed.proteinGrams}g
- Carboidratos: ${consumed.carbsGrams}g
- Gorduras: ${consumed.fatGrams}g
- Água: ${consumed.waterLiters}L

Saldo Restante:
- Calorias: ${formatBalance(remaining.calories, ' kcal')}
- Proteína: ${formatBalance(remaining.proteinGrams, 'g')}
- Carboidratos: ${formatBalance(remaining.carbsGrams, 'g')}
- Gorduras: ${formatBalance(remaining.fatGrams, 'g')}
- Água: ${formatBalance(remaining.waterLiters, 'L')}

Conclusão Geral do Dia: ${remaining.overallCompletionPercent}%

Orientação para IA:
${remaining.aiOrientationNote}

IMPORTANTE: Adapte suas sugestões alimentares, de hidratação e estilo de vida a esses dados em tempo real.`.trim();
}
