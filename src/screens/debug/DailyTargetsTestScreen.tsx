// GLPY — Daily Targets Test Screen  (Fase 1C.1)
// System: Debug / Integration Tool — LIGHT PREMIUM
// Authority: docs/glpy-daily-targets-engine-v1.md | src/config/glpyTargetsConfig.ts

import React, { useState, useEffect } from 'react';
import {
  Scale, Droplets, Utensils, Sparkles, ShieldAlert, Award,
  FileText, AlertCircle, Plus, RotateCcw, TrendingDown, CheckCircle2,
  Activity
} from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { gap } from '../../theme/spacing';

import { GLPY_TARGETS_CONFIG } from '../../config/glpyTargetsConfig';
import {
  calculateGLPYDailyTargets,
  calculateDailyRemaining,
  buildDailyTargetsForAI,
  GLPYTargetsInput,
  GLPYDailyConsumed,
} from '../../core/glpyDailyTargets';

import { getGLPYIntelligenceContext, saveWaterEntry, saveFoodEntry, clearTodayConsumption, FoodEntry } from '../../core/glpyLocalIntelligence';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DailyTargetsTestScreen({ onBack }: { onBack?: () => void }) {

  // ── Biometric inputs ──────────────────────────────────────────────────────
  const [weight, setWeight]       = useState('80.0');
  const [height, setHeight]       = useState('170');
  const [age, setAge]             = useState('35');
  const [gender, setGender]       = useState<'male' | 'female'>('female');
  const [activity, setActivity]   = useState<GLPYTargetsInput['activityLevel']>('moderately_active');
  const [pace, setPace]           = useState<GLPYTargetsInput['weightLossPace']>('equilibrado');
  const [targetWeight, setTargetWeight] = useState('70.0');
  const [medication, setMedication]     = useState('0.5mg');
  const [activityKcal, setActivityKcal] = useState('0');

  // ── Consumption inputs ────────────────────────────────────────────────────
  const [waterInput, setWaterInput] = useState('0.5');
  const [mealName, setMealName]     = useState('Frango Grelhado com Legumes');
  const [mealKcal, setMealKcal]     = useState('380');
  const [mealProt, setMealProt]     = useState('40');
  const [mealCarbs, setMealCarbs]   = useState('20');
  const [mealFat, setMealFat]       = useState('12');

  // ── Accumulated daily consumption ─────────────────────────────────────────
  const [meals, setMeals]           = useState<Meal[]>([]);
  const [totalWater, setTotalWater] = useState(0);
  const [addFeedback, setAddFeedback] = useState('');
  const [consumptionSource, setConsumptionSource] = useState<'local_intelligence' | 'simulation'>('simulation');

  // Carga inicial: popula consumo a partir da Local Intelligence Store
  useEffect(() => {
    try {
      const ctx = getGLPYIntelligenceContext();
      const todayKey = new Date().toISOString().slice(0, 10);
      const todayTracking = ctx.dailyTracking[todayKey];
      let loaded = false;

      const todayMeals = todayTracking?.meals ?? [];
      if (todayMeals.length > 0) {
        const loadedMeals: Meal[] = todayMeals.map((f: FoodEntry) => ({
          name: f.prato,
          calories: f.kcal,
          protein: f.proteina,
          carbs: f.carbs,
          fat: f.gordura,
        }));
        setMeals(loadedMeals);
        loaded = true;
      }

      if (todayTracking?.water && todayTracking.water > 0) {
        setTotalWater(parseFloat(todayTracking.water.toFixed(2)));
        loaded = true;
      }

      if (loaded) setConsumptionSource('local_intelligence');
    } catch (_) { /* silent */ }
  }, []);

  // ── Derived targets ──────────────────────────────────────────────────────
  const w  = parseFloat(weight)     || 0;
  const h  = parseFloat(height)     || 0;
  const a  = parseInt(age, 10)      || 0;
  const tw = parseFloat(targetWeight) || undefined;

  let result    = null;
  let calcError = '';
  try {
    if (w > 0 && h > 0 && a > 0) {
      const actKcal = parseFloat(activityKcal) || 0;
      result = calculateGLPYDailyTargets({
        weightKg: w, heightCm: h, ageYears: a, gender,
        activityLevel: activity, weightLossPace: pace,
        targetWeightKg: tw, activeMedicationDose: medication,
        activityCaloriesBurned: actKcal > 0 ? actKcal : undefined,
      });
    } else {
      calcError = 'Preencha peso, altura e idade válidos para calcular.';
    }
  } catch (err) {
    calcError = `Erro na engine: ${err}`;
  }

  // Consumo acumulado
  const consumed: GLPYDailyConsumed = {
    calories:     meals.reduce((s, m) => s + m.calories, 0),
    proteinGrams: meals.reduce((s, m) => s + m.protein, 0),
    carbsGrams:   meals.reduce((s, m) => s + m.carbs, 0),
    fatGrams:     meals.reduce((s, m) => s + m.fat, 0),
    waterLiters:  parseFloat(totalWater.toFixed(2)),
    mealCount:    meals.length,
  };

  const remaining = result ? calculateDailyRemaining(result, consumed) : null;
  const intelligenceContext = getGLPYIntelligenceContext();
  const protocolDayToday = intelligenceContext.protocolDayToday;

  const sourceLabel = consumptionSource === 'local_intelligence'
    ? 'Local Intelligence Store'
    : 'Simulação local';

  const aiPayload = result && remaining
    ? buildDailyTargetsForAI(result, consumed, remaining) +
      `\n\nFonte do consumo: ${sourceLabel}`
    : '';

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleAddWater() {
    const amt = parseFloat(waterInput);
    if (isNaN(amt) || amt <= 0) return;
    setTotalWater(prev => parseFloat((prev + amt).toFixed(2)));
    // Integra com Local Intelligence Store
    try { saveWaterEntry({ amount: amt }); } catch (_) { /* silent */ }
    setAddFeedback(`✓ +${amt}L de água adicionada`);
    setTimeout(() => setAddFeedback(''), 2000);
  }

  function handleAddMeal() {
    const kcal = parseInt(mealKcal, 10) || 0;
    const prot = parseInt(mealProt, 10) || 0;
    const carbs = parseInt(mealCarbs, 10) || 0;
    const fat  = parseInt(mealFat,  10) || 0;
    if (!mealName.trim() || kcal === 0) return;

    const meal: Meal = { name: mealName, calories: kcal, protein: prot, carbs, fat };
    setMeals(prev => [...prev, meal]);

    // Integra com Local Intelligence Store
    try {
      saveFoodEntry({ prato: mealName, kcal, proteina: prot, carbs, gordura: fat });
    } catch (_) { /* silent */ }

    setAddFeedback(`✓ "${mealName}" adicionada`);
    setTimeout(() => setAddFeedback(''), 2000);
    setMealName('');
  }

  function handleResetConsumed() {
    try { clearTodayConsumption(); } catch (_) { /* silent */ }
    setMeals([]);
    setTotalWater(0);
    setConsumptionSource('simulation');
    setAddFeedback('Consumo do dia resetado.');
    setTimeout(() => setAddFeedback(''), 2000);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const mainContainer: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: gap.large, paddingBottom: 40 };
  const formGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 };
  const labelStyle: React.CSSProperties = { fontFamily: fontFamily.primary, fontSize: 12, fontWeight: '700', color: lightColors.text.navy };
  const inputStyle: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: `1px solid ${lightColors.border.soft}`, fontFamily: fontFamily.primary, fontSize: fontSize.small, outline: 'none', boxSizing: 'border-box' as const, width: '100%' };
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' as const, backgroundColor: '#FFFFFF', cursor: 'pointer' };
  const resultBadge: React.CSSProperties = { padding: 10, borderRadius: 8, backgroundColor: '#F8FAFC', textAlign: 'center' as const, border: `1px solid ${lightColors.border.soft}` };
  const macroRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${lightColors.border.soft}` };
  const sectionTitle: React.CSSProperties = { margin: '0 0 12px 0', fontSize: 15, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 8 };
  const configBox: React.CSSProperties = { width: '100%', height: 220, backgroundColor: '#1E293B', color: '#34D399', fontFamily: 'Courier, monospace', fontSize: 10, padding: 10, borderRadius: 8, border: 'none', resize: 'none' as const, boxSizing: 'border-box' as const, marginTop: 8 };
  const aiBox: React.CSSProperties = { ...configBox, color: '#38BDF8', height: 280, marginTop: 8 };

  // helper: badge de status
  function StatusBadge({ completed, overage, remaining: rem, unit }: { completed: boolean; overage: number; remaining: number; unit: string }) {
    if (completed && overage > 0)
      return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, backgroundColor: '#FEE2E2', color: '#EF4444', fontWeight: '600' }}>+{overage}{unit} acima</span>;
    if (completed)
      return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, backgroundColor: '#D1FAE5', color: '#059669', fontWeight: '600' }}>✓ Concluído</span>;
    return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, backgroundColor: '#F1F5F9', color: lightColors.text.navy, fontWeight: '600' }}>faltam {rem}{unit}</span>;
  }

  // Helper: barra de progresso
  function ProgressBar({ consumed: c, target: t, color }: { consumed: number; target: number; color: string }) {
    const pct = t > 0 ? Math.min((c / t) * 100, 100) : 0;
    return (
      <div style={{ height: 4, borderRadius: 99, backgroundColor: '#E2E8F0', marginTop: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 99, transition: 'width 0.3s ease' }} />
      </div>
    );
  }

  return (
    <GLPYScreen variant="light">
      <GLPYHeader
        title="Engine Metas Diárias"
        subtitle="Simulador Clínico — Fase 1C.1"
        onBack={onBack || (() => { window.location.href = '/preview'; })}
      />

      <div style={mainContainer}>

        {/* ── 1. DADOS BIOMÉTRICOS ───────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={sectionTitle}><Sparkles size={17} color={lightColors.brand.greenDark} />Dados Biométricos</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={formGroup}><label style={labelStyle}>Peso Atual (kg)</label>
              <input type="number" step="0.1" style={inputStyle} value={weight} onChange={e => setWeight(e.target.value)} /></div>
            <div style={formGroup}><label style={labelStyle}>Altura (cm)</label>
              <input type="number" step="1" style={inputStyle} value={height} onChange={e => setHeight(e.target.value)} /></div>
            <div style={formGroup}><label style={labelStyle}>Idade (anos)</label>
              <input type="number" step="1" style={inputStyle} value={age} onChange={e => setAge(e.target.value)} /></div>
            <div style={formGroup}><label style={labelStyle}>Gênero</label>
              <select style={selectStyle} value={gender} onChange={e => setGender(e.target.value as any)}>
                <option value="female">Feminino</option>
                <option value="male">Masculino</option>
              </select></div>
          </div>

          <div style={formGroup}><label style={labelStyle}>Nível de Atividade Física</label>
            <select style={selectStyle} value={activity} onChange={e => setActivity(e.target.value as any)}>
              <option value="sedentary">Sedentário (x1.2)</option>
              <option value="lightly_active">Levemente Ativo (x1.375)</option>
              <option value="moderately_active">Moderadamente Ativo (x1.55)</option>
              <option value="very_active">Muito Ativo (x1.725)</option>
              <option value="extra_active">Extra Ativo (x1.9)</option>
            </select></div>

          <div style={formGroup}><label style={labelStyle}>Ritmo de Emagrecimento</label>
            <select style={selectStyle} value={pace} onChange={e => setPace(e.target.value as any)}>
              <option value="leve">Leve (-250 kcal/dia)</option>
              <option value="equilibrado">Equilibrado (-500 kcal/dia)</option>
              <option value="intenso">Intenso (-750 kcal/dia)</option>
            </select></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={formGroup}><label style={labelStyle}>Peso Alvo (kg)</label>
              <input type="number" step="0.1" style={inputStyle} value={targetWeight} onChange={e => setTargetWeight(e.target.value)} /></div>
            <div style={formGroup}><label style={labelStyle}>Dose GLP-1</label>
              <input type="text" style={inputStyle} value={medication} onChange={e => setMedication(e.target.value)} placeholder="Ex: 0.5mg" /></div>
          </div>

          <div style={formGroup}>
            <label style={labelStyle}>Atividade Física Hoje (kcal queimadas, 0–2000)</label>
            <input type="number" min="0" max="2000" step="10" style={inputStyle} value={activityKcal} onChange={e => setActivityKcal(e.target.value)} placeholder="Ex: 360" />
          </div>
        </GLPYCard>

        {/* ── 2. METAS CALCULADAS ────────────────────────────────────────────── */}
        {calcError && (
          <GLPYCard variant="light">
            <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{calcError}</p>
          </GLPYCard>
        )}

        {result && (
          <GLPYCard variant="light">
            <h3 style={sectionTitle}><Award size={17} color={lightColors.brand.greenDark} />Metas Calculadas (Mifflin-St Jeor)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <div style={resultBadge}><span style={{ fontSize: 10, color: lightColors.text.secondary, display: 'block' }}>BMR</span><strong style={{ fontSize: 14 }}>{result.bmr} kcal</strong></div>
              <div style={resultBadge}><span style={{ fontSize: 10, color: lightColors.text.secondary, display: 'block' }}>TDEE</span><strong style={{ fontSize: 14 }}>{result.tdee} kcal</strong></div>
              <div style={{ ...resultBadge, backgroundColor: '#E8F5E9', borderColor: lightColors.brand.green, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 10, color: lightColors.brand.greenDark, fontWeight: '700', display: 'block' }}>Meta Calórica Base ⚖️</span>
                <strong style={{ fontSize: 20, color: lightColors.brand.greenDark }}>{result.caloriesTarget} kcal</strong>
              </div>
              {result.activityCaloriesBurned > 0 && (
                <div style={{ ...resultBadge, backgroundColor: '#FFF3E0', borderColor: '#FF9800', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: 10, color: '#E65100', fontWeight: '700', display: 'block' }}>Bônus Atividade Física 🏃</span>
                  <strong style={{ fontSize: 14, color: '#E65100' }}>+{result.activityCaloriesBurned} kcal</strong>
                </div>
              )}
              {result.activityCaloriesBurned > 0 && (
                <div style={{ ...resultBadge, backgroundColor: '#FCE4EC', borderColor: '#E91E63', gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: 10, color: '#880E4F', fontWeight: '700', display: 'block' }}>Meta Calórica Ajustada ✅</span>
                  <strong style={{ fontSize: 20, color: '#880E4F' }}>{result.adjustedCaloriesTarget} kcal</strong>
                </div>
              )}
              <div style={{ ...resultBadge, backgroundColor: '#E0F2FE', borderColor: '#38BDF8' }}>
                <span style={{ fontSize: 10, color: '#0369A1', fontWeight: '700', display: 'block' }}>Proteína</span>
                <strong style={{ fontSize: 14 }}>{result.proteinGrams}g</strong>
              </div>
              <div style={{ ...resultBadge, backgroundColor: '#FFF7ED', borderColor: '#FBB040' }}>
                <span style={{ fontSize: 10, color: '#B45309', fontWeight: '700', display: 'block' }}>Gordura</span>
                <strong style={{ fontSize: 14 }}>{result.fatGrams}g</strong>
              </div>
              <div style={{ ...resultBadge, backgroundColor: '#EDE9FE', borderColor: '#8B5CF6' }}>
                <span style={{ fontSize: 10, color: '#6D28D9', fontWeight: '700', display: 'block' }}>Carboidratos</span>
                <strong style={{ fontSize: 14 }}>{result.carbsGrams}g</strong>
              </div>
              <div style={{ ...resultBadge, backgroundColor: '#DBEAFE', borderColor: '#3B82F6' }}>
                <span style={{ fontSize: 10, color: '#1D4ED8', fontWeight: '700', display: 'block' }}>Água 💧</span>
                <strong style={{ fontSize: 14 }}>{result.waterLiters}L</strong>
              </div>
            </div>
          </GLPYCard>
        )}

        {/* ── 3. SIMULAR CONSUMO DO DIA ─────────────────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={sectionTitle}><Plus size={17} color={lightColors.brand.greenDark} />Simular Consumo do Dia</h3>

          {/* Água */}
          <div style={{ borderBottom: `1px solid ${lightColors.border.soft}`, paddingBottom: 12, marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px 0', fontSize: 12, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Droplets size={14} color="#0284C7" /> Água consumida (litros)
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" step="0.1" min="0" style={{ ...inputStyle, flex: 1 }} value={waterInput} onChange={e => setWaterInput(e.target.value)} placeholder="Ex: 0.5" />
              <GLPYButton variant="primary" size="sm" onClick={handleAddWater}>Adicionar Água</GLPYButton>
            </div>
          </div>

          {/* Refeição */}
          <div>
            <p style={{ margin: '0 0 6px 0', fontSize: 12, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Utensils size={14} color={lightColors.brand.greenDark} /> Registrar Refeição
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="text" style={inputStyle} value={mealName} onChange={e => setMealName(e.target.value)} placeholder="Nome da refeição" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                <div style={formGroup}><label style={{ ...labelStyle, fontSize: 11 }}>kcal</label>
                  <input type="number" min="0" style={{ ...inputStyle, padding: '7px 8px' }} value={mealKcal} onChange={e => setMealKcal(e.target.value)} /></div>
                <div style={formGroup}><label style={{ ...labelStyle, fontSize: 11 }}>Prot (g)</label>
                  <input type="number" min="0" style={{ ...inputStyle, padding: '7px 8px' }} value={mealProt} onChange={e => setMealProt(e.target.value)} /></div>
                <div style={formGroup}><label style={{ ...labelStyle, fontSize: 11 }}>Carb (g)</label>
                  <input type="number" min="0" style={{ ...inputStyle, padding: '7px 8px' }} value={mealCarbs} onChange={e => setMealCarbs(e.target.value)} /></div>
                <div style={formGroup}><label style={{ ...labelStyle, fontSize: 11 }}>Gord (g)</label>
                  <input type="number" min="0" style={{ ...inputStyle, padding: '7px 8px' }} value={mealFat} onChange={e => setMealFat(e.target.value)} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <GLPYButton variant="primary" size="sm" onClick={handleAddMeal} style={{ flex: 1 }}>Adicionar Refeição</GLPYButton>
                <button onClick={handleResetConsumed} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: 8, fontFamily: fontFamily.primary, fontSize: 12, fontWeight: '600', cursor: 'pointer' }}>
                  <RotateCcw size={13} />Resetar
                </button>
              </div>
            </div>
          </div>

          {/* Feedback toast */}
          {addFeedback && (
            <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#D1FAE5', borderRadius: 8, fontSize: 12, color: '#065F46', fontWeight: '600' }}>
              {addFeedback}
            </div>
          )}

          {/* Lista de refeições adicionadas */}
          {meals.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: '700', color: lightColors.text.secondary }}>Refeições registradas:</p>
              {meals.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', color: lightColors.text.navy, borderBottom: `1px solid ${lightColors.border.soft}` }}>
                  <span>{m.name}</span>
                  <span style={{ color: lightColors.text.secondary }}>{m.calories} kcal · {m.protein}g prot</span>
                </div>
              ))}
            </div>
          )}
        </GLPYCard>

        {/* ── 4. CONSUMIDO HOJE ─────────────────────────────────────────────── */}
        {result && (
          <GLPYCard variant="light">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ ...sectionTitle, margin: 0 }}><Activity size={17} color="#0284C7" />Consumido Hoje</h3>
              <span style={{
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 10,
                fontWeight: '700',
                backgroundColor: consumptionSource === 'local_intelligence' ? '#D1FAE5' : '#F1F5F9',
                color: consumptionSource === 'local_intelligence' ? '#065F46' : lightColors.text.secondary,
              }}>
                Fonte: {sourceLabel}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Calorias', consumed: consumed.calories, target: result.caloriesTarget, unit: ' kcal', color: lightColors.brand.greenDark },
                { label: 'Proteína', consumed: consumed.proteinGrams, target: result.proteinGrams, unit: 'g', color: '#0284C7' },
                { label: 'Carboidratos', consumed: consumed.carbsGrams, target: result.carbsGrams, unit: 'g', color: '#7C3AED' },
                { label: 'Gordura', consumed: consumed.fatGrams, target: result.fatGrams, unit: 'g', color: '#E28743' },
                { label: 'Água', consumed: consumed.waterLiters, target: result.waterLiters, unit: 'L', color: '#3B82F6' },
              ].map(({ label, consumed: c, target: t, unit, color }) => (
                <div key={label} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${lightColors.border.soft}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: lightColors.text.navy, fontWeight: '600' }}>{label}</span>
                    <span style={{ color: lightColors.text.secondary, fontSize: 11 }}><strong style={{ color: lightColors.text.navy }}>{c}{unit}</strong> de {t}{unit}</span>
                  </div>
                  <ProgressBar consumed={c} target={t} color={color} />
                </div>
              ))}
              <p style={{ margin: 0, fontSize: 11, color: lightColors.text.secondary }}>
                {consumed.mealCount} refeição{consumed.mealCount !== 1 ? 'ões' : ''} registrada{consumed.mealCount !== 1 ? 's' : ''}
              </p>
            </div>
          </GLPYCard>
        )}

        {/* ── 5. SALDO RESTANTE ─────────────────────────────────────────────── */}
        {result && remaining && (
          <GLPYCard variant="light" style={{ borderColor: remaining.overallCompletionPercent >= 100 ? lightColors.brand.green : lightColors.border.soft }}>
            <h3 style={sectionTitle}>
              <TrendingDown size={17} color={remaining.overallCompletionPercent >= 100 ? lightColors.brand.greenDark : '#F59E0B'} />
              Saldo Restante — {remaining.overallCompletionPercent}% concluído
            </h3>

            {([
              { label: 'Calorias',     bal: remaining.calories,     unit: ' kcal' },
              { label: 'Proteína',     bal: remaining.proteinGrams,  unit: 'g' },
              { label: 'Carboidratos', bal: remaining.carbsGrams,    unit: 'g' },
              { label: 'Gordura',      bal: remaining.fatGrams,       unit: 'g' },
              { label: 'Água',         bal: remaining.waterLiters,   unit: 'L' },
            ] as Array<{ label: string; bal: typeof remaining.calories; unit: string }>).map(({ label, bal, unit }) => (
              <div key={label} style={{ ...macroRow }}>
                <span style={{ fontSize: 13, color: lightColors.text.navy, fontWeight: '600' }}>{label}</span>
                <StatusBadge completed={bal.completed} overage={bal.overage} remaining={bal.remaining} unit={unit} />
              </div>
            ))}

            {/* Nota orientativa */}
            <div style={{ marginTop: 12, padding: '10px 12px', backgroundColor: remaining.overallCompletionPercent >= 100 ? '#D1FAE5' : '#F1F5F9', borderRadius: 8, borderLeft: `3px solid ${remaining.overallCompletionPercent >= 100 ? '#10B981' : '#94A3B8'}` }}>
              <p style={{ margin: 0, fontSize: 11, color: remaining.overallCompletionPercent >= 100 ? '#065F46' : lightColors.text.navy, lineHeight: 1.5 }}>
                <strong>Orientação IA:</strong> {remaining.aiOrientationNote}
              </p>
            </div>
          </GLPYCard>
        )}

        {/* ── 5.1. EXECUÇÃO DO PROTOCOLO HOJE ──────────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={sectionTitle}><CheckCircle2 size={17} color={lightColors.brand.greenDark} />Execução do Protocolo Hoje</h3>
          {protocolDayToday ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ ...macroRow, paddingTop: 0 }}>
                <span style={{ fontSize: 13, color: lightColors.text.navy, fontWeight: '700' }}>
                  {protocolDayToday.protocolEmoji} {protocolDayToday.protocolName}
                </span>
                <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, backgroundColor: protocolDayToday.dayStatus === 'concluido' ? '#D1FAE5' : '#F1F5F9', color: protocolDayToday.dayStatus === 'concluido' ? '#059669' : lightColors.text.navy, fontWeight: '600' }}>
                  {protocolDayToday.dayStatus}
                </span>
              </div>
              <div style={macroRow}>
                <span style={{ fontSize: 12, color: lightColors.text.secondary }}>Dia do protocolo</span>
                <strong style={{ fontSize: 12, color: lightColors.text.navy }}>{protocolDayToday.day}/{protocolDayToday.totalDays}</strong>
              </div>
              {protocolDayToday.recipeOfDay?.nome && (
                <div style={macroRow}>
                  <span style={{ fontSize: 12, color: lightColors.text.secondary }}>Receita do dia</span>
                  <strong style={{ fontSize: 12, color: lightColors.text.navy }}>{protocolDayToday.recipeOfDay.nome}</strong>
                </div>
              )}
              {protocolDayToday.selectedCheckins?.length > 0 && (
                <p style={{ margin: 0, fontSize: 12, color: lightColors.text.navy }}>
                  <strong>Check-in:</strong> {protocolDayToday.selectedCheckins.join(', ')}
                </p>
              )}
              {protocolDayToday.missions?.length > 0 && (
                <div>
                  {protocolDayToday.missions.map((mission, index) => (
                    <div key={mission.id || index} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', fontSize: 12, color: lightColors.text.navy }}>
                      <span>{mission.texto}</span>
                      <span style={{ color: mission.status === 'concluida' ? '#059669' : lightColors.text.secondary, fontWeight: '700' }}>
                        {mission.status === 'concluida' ? 'concluída' : 'pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ margin: 0, fontSize: 11, color: lightColors.text.secondary }}>
                Missões marcadas entram como sinal comportamental. O consumo real segue vindo das refeições/foto do prato.
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: lightColors.text.secondary }}>
              Nenhuma execução do protocolo registrada hoje na Local Intelligence Store.
            </p>
          )}
        </GLPYCard>

        {/* ── 6. PAYLOAD PARA IA ────────────────────────────────────────────── */}
        {result && remaining && (
          <GLPYCard variant="light" style={{ backgroundColor: '#0F172A', border: 'none' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: '700', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} color="#38BDF8" />Payload para Chat IA (buildDailyTargetsForAI)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#94A3B8' }}>
              String exata que será injetada no contexto da IA contendo metas, consumo e saldo.
            </p>
            <textarea readOnly style={aiBox} value={aiPayload} />
          </GLPYCard>
        )}

        {/* ── 7. ALERTAS CLÍNICOS ──────────────────────────────────────────── */}
        {result && result.warnings.length > 0 && (
          <GLPYCard variant="light" style={{ borderColor: '#F59E0B' }}>
            <h3 style={sectionTitle}><ShieldAlert size={17} color="#D97706" />Alertas Clínicos da Engine</h3>
            {result.warnings.map((w, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, backgroundColor: '#FFFBEB', borderLeft: '4px solid #F59E0B', marginBottom: 6, display: 'flex', gap: 8 }}>
                <AlertCircle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: '#92400E', lineHeight: 1.4 }}>{w}</span>
              </div>
            ))}
          </GLPYCard>
        )}

        {/* ── 8. CONFIG AUDIT JSON ─────────────────────────────────────────── */}
        <GLPYCard variant="light" style={{ backgroundColor: '#1E293B', border: 'none' }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: '700', color: '#34D399', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={15} color="#34D399" />Configuração Clínica Auditável (glpyTargetsConfig.ts)
          </h3>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 10, padding: '2px 6px', backgroundColor: 'rgba(52,211,153,0.1)', color: '#34D399', borderRadius: 4 }}>v{GLPY_TARGETS_CONFIG.version}</span>
            <span style={{ fontSize: 10, padding: '2px 6px', backgroundColor: 'rgba(52,211,153,0.1)', color: '#34D399', borderRadius: 4 }}>{GLPY_TARGETS_CONFIG.lastUpdated}</span>
          </div>
          <textarea readOnly style={configBox} value={JSON.stringify(GLPY_TARGETS_CONFIG, null, 2)} />
        </GLPYCard>

        {/* ── 9. DISCLAIMER ─────────────────────────────────────────────────── */}
        <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, border: `1px solid ${lightColors.border.soft}` }}>
          <span style={{ fontSize: 11, fontWeight: '700', color: lightColors.text.navy, display: 'block', marginBottom: 2 }}>Aviso de Responsabilidade Médica:</span>
          <p style={{ margin: 0, fontSize: 11, color: lightColors.text.secondary, lineHeight: 1.45 }}>{GLPY_TARGETS_CONFIG.disclaimers.long}</p>
        </div>

      </div>
    </GLPYScreen>
  );
}
