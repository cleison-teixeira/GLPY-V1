// GLPY — Daily Targets Test Screen
// System: Debug / Integration Tool — LIGHT PREMIUM
// Authority: docs/glpy-daily-targets-engine-v1.md | src/config/glpyTargetsConfig.ts

import React, { useState } from 'react';
import {
  Scale, Droplets, Utensils, Syringe, Activity,
  Sparkles, ShieldAlert, Award, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

import { GLPY_TARGETS_CONFIG } from '../../config/glpyTargetsConfig';
import { calculateGLPYDailyTargets, GLPYTargetsInput } from '../../core/glpyDailyTargets';

export default function DailyTargetsTestScreen({ onBack }: { onBack?: () => void }) {
  // Inputs state
  const [weight, setWeight] = useState('80.0');
  const [height, setHeight] = useState('170');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [activity, setActivity] = useState<GLPYTargetsInput['activityLevel']>('moderately_active');
  const [pace, setPace] = useState<GLPYTargetsInput['weightLossPace']>('equilibrado');
  const [targetWeight, setTargetWeight] = useState('70.0');
  const [medication, setMedication] = useState('0.5mg');

  // Convert inputs to numbers
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseInt(age, 10) || 0;
  const tw = parseFloat(targetWeight) || undefined;

  // Run calculation engine
  let result = null;
  let calculationError = '';

  try {
    if (w > 0 && h > 0 && a > 0) {
      result = calculateGLPYDailyTargets({
        weightKg: w,
        heightCm: h,
        ageYears: a,
        gender,
        activityLevel: activity,
        weightLossPace: pace,
        targetWeightKg: tw,
        activeMedicationDose: medication
      });
    } else {
      calculationError = 'Preencha peso, altura e idade válidos para calcular.';
    }
  } catch (err) {
    calculationError = `Erro na engine: ${err}`;
  }

  // Helper macro calculations percentages for visual display
  const getPct = (macroKcal: number) => {
    if (!result || result.caloriesTarget === 0) return 0;
    return Math.round((macroKcal / result.caloriesTarget) * 100);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const mainContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: gap.large,
    paddingBottom: 40,
  };

  const gridLayout: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: gap.medium,
  };

  const formGroup: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 10,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: 12,
    fontWeight: '700',
    color: lightColors.text.navy,
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${lightColors.border.soft}`,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  };

  const resultsGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 10,
    marginTop: 10,
  };

  const resultBadge: React.CSSProperties = {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    border: `1px solid ${lightColors.border.soft}`,
  };

  const macroBlock: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    border: `1px solid ${lightColors.border.soft}`,
  };

  const warningCard: React.CSSProperties = {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderLeft: '4px solid #F59E0B',
    marginBottom: 8,
  };

  const configBox: React.CSSProperties = {
    width: '100%',
    height: 250,
    backgroundColor: '#1E293B',
    color: '#34D399',
    fontFamily: 'Courier, monospace',
    fontSize: 11,
    padding: 10,
    borderRadius: 8,
    border: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    marginTop: 8,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader
        title="Engine Metas Diárias"
        subtitle="Simulador Clínico e de Calorias"
        onBack={onBack || (() => { window.location.href = '/preview'; })}
      />

      <div style={mainContainer}>

        {/* ── PAINEL DE INPUTS ──────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color={lightColors.brand.greenDark} />
            Simulação de Dados Biométricos
          </h3>

          <div style={gridLayout}>
            {/* Peso e Altura */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={formGroup}>
                <label style={labelStyle}>Peso Atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  style={inputStyle}
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Altura (cm)</label>
                <input
                  type="number"
                  step="1"
                  style={inputStyle}
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                />
              </div>
            </div>

            {/* Idade e Gênero */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={formGroup}>
                <label style={labelStyle}>Idade (anos)</label>
                <input
                  type="number"
                  step="1"
                  style={inputStyle}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Gênero</label>
                <select
                  style={selectStyle}
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                >
                  <option value="female">Feminino</option>
                  <option value="male">Masculino</option>
                </select>
              </div>
            </div>

            {/* Nível de Atividade */}
            <div style={formGroup}>
              <label style={labelStyle}>Nível de Atividade Física</label>
              <select
                style={selectStyle}
                value={activity}
                onChange={e => setActivity(e.target.value as any)}
              >
                <option value="sedentary">Sedentário (BMR x 1.2)</option>
                <option value="lightly_active">Levemente Ativo (BMR x 1.375)</option>
                <option value="moderately_active">Moderadamente Ativo (BMR x 1.55)</option>
                <option value="very_active">Muito Ativo (BMR x 1.725)</option>
                <option value="extra_active">Extra Ativo (BMR x 1.9)</option>
              </select>
            </div>

            {/* Ritmo de Perda */}
            <div style={formGroup}>
              <label style={labelStyle}>Ritmo de Emagrecimento (Déficit)</label>
              <select
                style={selectStyle}
                value={pace}
                onChange={e => setPace(e.target.value as any)}
              >
                <option value="leve">Leve (-250 kcal/dia)</option>
                <option value="equilibrado">Equilibrado (-500 kcal/dia)</option>
                <option value="intenso">Intenso (-750 kcal/dia)</option>
              </select>
            </div>

            {/* Peso Alvo e Dose Caneta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={formGroup}>
                <label style={labelStyle}>Peso Alvo (kg) (Opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  style={inputStyle}
                  value={targetWeight}
                  onChange={e => setTargetWeight(e.target.value)}
                />
              </div>
              <div style={formGroup}>
                <label style={labelStyle}>Dose Caneta GLP-1 (Opcional)</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={medication}
                  onChange={e => setMedication(e.target.value)}
                  placeholder="Ex: 0.5mg"
                />
              </div>
            </div>
          </div>
        </GLPYCard>

        {/* ── PAINEL DE RESULTADOS NUTRICIONAIS ──────────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color={lightColors.brand.greenDark} />
            Metas Calculadas reativamente
          </h3>

          {calculationError && (
            <div style={{ color: '#EF4444', fontSize: 13, padding: 8, background: '#FEE2E2', borderRadius: 6, marginTop: 8 }}>
              {calculationError}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 12 }}>
              {/* Resultados Gerais */}
              <div style={resultsGrid}>
                <div style={resultBadge}>
                  <span style={{ fontSize: 10, color: lightColors.text.secondary, display: 'block' }}>BMR (Mifflin)</span>
                  <strong style={{ fontSize: 16, color: lightColors.text.navy }}>{result.bmr} kcal</strong>
                </div>
                <div style={resultBadge}>
                  <span style={{ fontSize: 10, color: lightColors.text.secondary, display: 'block' }}>TDEE (Metabólico)</span>
                  <strong style={{ fontSize: 16, color: lightColors.text.navy }}>{result.tdee} kcal</strong>
                </div>
                <div style={{
                  ...resultBadge,
                  backgroundColor: result.caloriesMinWarningApplied ? '#FFFBEB' : '#E8F5E9',
                  borderColor: result.caloriesMinWarningApplied ? '#F59E0B' : lightColors.brand.green
                }}>
                  <span style={{ fontSize: 10, color: result.caloriesMinWarningApplied ? '#B45309' : lightColors.brand.greenDark, display: 'block', fontWeight: '700' }}>
                    Meta Calórica ⚖️
                  </span>
                  <strong style={{ fontSize: 18, color: result.caloriesMinWarningApplied ? '#D97706' : lightColors.brand.greenDark }}>
                    {result.caloriesTarget} kcal
                  </strong>
                </div>
                <div style={{ ...resultBadge, backgroundColor: '#E0F2FE', borderColor: '#38BDF8' }}>
                  <span style={{ fontSize: 10, color: '#0369A1', display: 'block', fontWeight: '700' }}>Meta Hídrica 💧</span>
                  <strong style={{ fontSize: 18, color: '#0284C7' }}>{result.waterLiters}L</strong>
                </div>
              </div>

              {/* Seção de Macronutrientes */}
              <h4 style={{ margin: '18px 0 8px 0', fontSize: 14, fontWeight: '700', color: lightColors.text.navy }}>
                Distribuição de Macronutrientes:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Proteína */}
                <div style={macroBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: '700', color: lightColors.brand.greenDark, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: lightColors.brand.green }} />
                      Proteína (1,5g/kg)
                    </span>
                    <strong style={{ fontSize: 14, color: lightColors.text.navy }}>{result.proteinGrams}g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: lightColors.text.secondary }}>
                    <span>{result.proteinCalories} kcal alocadas</span>
                    <span>{getPct(result.proteinCalories)}% do total</span>
                  </div>
                </div>

                {/* Gordura */}
                <div style={macroBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: '700', color: '#E28743', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: '#E28743' }} />
                      Gordura (25% kcal)
                    </span>
                    <strong style={{ fontSize: 14, color: lightColors.text.navy }}>{result.fatGrams}g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: lightColors.text.secondary }}>
                    <span>{result.fatCalories} kcal alocadas</span>
                    <span>{getPct(result.fatCalories)}% do total</span>
                  </div>
                </div>

                {/* Carboidrato */}
                <div style={macroBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: '700', color: '#0284C7', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: '#38BDF8' }} />
                      Carboidrato (Sobra / Remainder)
                    </span>
                    <strong style={{ fontSize: 14, color: lightColors.text.navy }}>{result.carbsGrams}g</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: lightColors.text.secondary }}>
                    <span>{result.carbsCalories} kcal alocadas</span>
                    <span>{getPct(result.carbsCalories)}% do total</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GLPYCard>

        {/* ── PAINEL DE ADVERTÊNCIAS CLÍNICAS (ALERTAS) ──────────────────────── */}
        {result && (result.warnings.length > 0 || result.clinicalContextNotes.length > 0) && (
          <GLPYCard variant="light" style={{ borderColor: result.warnings.length > 0 ? '#F59E0B' : lightColors.brand.green }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: 15, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={18} color={result.warnings.length > 0 ? '#D97706' : lightColors.brand.greenDark} />
              Avaliação de Segurança Clínica & Metadados IA
            </h3>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {result.warnings.map((w, idx) => (
                  <div key={idx} style={warningCard}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <AlertCircle size={14} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#92400E', fontWeight: '500', lineHeight: 1.4 }}>{w}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clinical context metadata */}
            {result.clinicalContextNotes.length > 0 && (
              <div style={{ padding: 10, backgroundColor: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 11, fontWeight: '700', color: lightColors.text.secondary, display: 'block', marginBottom: 4 }}>
                  Notas de Contexto Injetadas na IA:
                </span>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: lightColors.text.navy, lineHeight: 1.5 }}>
                  {result.clinicalContextNotes.map((note, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </GLPYCard>
        )}

        {/* ── PAINEL DA CONFIGURAÇÃO CENTRALIZADA (JSON AUDIT) ────────────────── */}
        <GLPYCard variant="light" style={{ backgroundColor: '#1E293B', border: 'none' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: '700', color: '#34D399', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="#34D399" />
            Configuração Clínica Auditável (JSON)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#94A3B8' }}>
            Abaixo estão representados os coeficientes isolados do arquivo <code>src/config/glpyTargetsConfig.ts</code>. Eles são lidos em tempo de execução pela engine, permitindo calibrações clínicas sem refatoração de código.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 10, padding: '2px 6px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34D399', borderRadius: 4 }}>
              Versão: {GLPY_TARGETS_CONFIG.version}
            </span>
            <span style={{ fontSize: 10, padding: '2px 6px', backgroundColor: 'rgba(52, 211, 153, 0.1)', color: '#34D399', borderRadius: 4 }}>
              Última Revisão: {GLPY_TARGETS_CONFIG.lastUpdated}
            </span>
          </div>
          <textarea
            readOnly
            style={configBox}
            value={JSON.stringify(GLPY_TARGETS_CONFIG, null, 2)}
          />
        </GLPYCard>

        {/* ── DISCLAIMER DE SEGURANÇA ────────────────────────────────────────── */}
        <div style={{ padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, border: `1px solid ${lightColors.border.soft}` }}>
          <span style={{ fontSize: 11, fontWeight: '700', color: lightColors.text.navy, display: 'block', marginBottom: 2 }}>
            Aviso de Responsabilidade Médica:
          </span>
          <p style={{ margin: 0, fontSize: 11, color: lightColors.text.secondary, lineHeight: 1.45 }}>
            {GLPY_TARGETS_CONFIG.disclaimers.long}
          </p>
        </div>

      </div>
    </GLPYScreen>
  );
}
