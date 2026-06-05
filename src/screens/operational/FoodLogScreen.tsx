// GLPY — Food Log Screen v2
// Sprint 17B.21: Registro manual com análise automática de macros
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React, { useState, useRef } from 'react';
import {
  Coffee, Utensils, Moon, Apple, Lightbulb, Flame,
  ChevronDown, ChevronUp, Camera, Check, Brain, Trash2, AlertTriangle,
} from 'lucide-react';

import { glpyStore } from '../../data/glpyStore';
import { glpyBlackBox } from '../../data/glpyBlackBox';
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from '../../data/glpyEventCatalog';
import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';
import { getLocalDateKey } from '../../utils/formatters';
import {
  analyzeMealDescription,
  type NutritionAnalysisResult,
} from '../../services/nutritionAnalysis';

// ── Types ─────────────────────────────────────────────────────────────────────

type MealType      = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type AnalysisPhase = 'idle' | 'analyzing' | 'done';
type SaveState     = 'idle' | 'saving' | 'saved';

interface MealOption {
  id:    MealType;
  label: string;
  icon:  React.ReactNode;
}

export interface FoodLogScreenProps {
  onBack?:            () => void;
  onNavigateToPhoto?: () => void;
  onSave?: (data: {
    mealType:    MealType;
    description: string;
    photoAdded:  boolean;
    calories:    number;
    protein:     number;
    carbs:       number;
    fat:         number;
  }) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MEAL_LABEL_MAP: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch:     'Almoço',
  dinner:    'Jantar',
  snack:     'Lanche',
};

const MEAL_OPTIONS: MealOption[] = [
  { id: 'breakfast', label: 'Café da manhã', icon: <Coffee  size={16} strokeWidth={2} /> },
  { id: 'lunch',     label: 'Almoço',        icon: <Utensils size={16} strokeWidth={2} /> },
  { id: 'dinner',    label: 'Jantar',         icon: <Moon    size={16} strokeWidth={2} /> },
  { id: 'snack',     label: 'Lanche',         icon: <Apple   size={16} strokeWidth={2} /> },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGlp1Tip(protein: number, carbs: number, fat: number): string {
  if (protein >= 25) return 'Boa presença de proteína para ajudar na saciedade e apoiar a preservação de massa magra.';
  if (carbs > 50)    return 'Os carboidratos ajudam na energia, mas a porção pode ser ajustada conforme seu apetite e objetivo do dia.';
  if (fat > 20)      return 'A gordura aumenta a saciedade, mas pode deixar a refeição mais pesada para algumas pessoas.';
  return 'Refeição mais leve, útil quando o apetite está reduzido.';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatMealTime(entry: any): string {
  const ts = entry.createdAt
    ? new Date(entry.createdAt as string).getTime()
    : (entry.savedAt as number | undefined);
  if (!ts) return '';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FoodLogScreen({ onBack, onNavigateToPhoto, onSave }: FoodLogScreenProps) {
  const [referencePhoto] = useState<string | null>(() => {
    const photo = sessionStorage.getItem('glpy_manual_photo');
    if (photo) sessionStorage.removeItem('glpy_manual_photo');
    return photo;
  });

  const [mealType,       setMealType]       = useState<MealType>('lunch');
  const [description,    setDescription]    = useState('');
  const [analysisPhase,  setAnalysisPhase]  = useState<AnalysisPhase>('idle');
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysisResult | null>(null);
  const [analysisError,  setAnalysisError]  = useState('');
  const [showManual,     setShowManual]     = useState(false);
  const [calories,       setCalories]       = useState('');
  const [protein,        setProtein]        = useState('');
  const [carbs,          setCarbs]          = useState('');
  const [fat,            setFat]            = useState('');
  const [saveState,        setSaveState]        = useState<SaveState>('idle');
  const [saveError,        setSaveError]        = useState('');
  const [todayMeals,       setTodayMeals]       = useState(() => {
    try { return glpyStore.meals.getToday(); }
    catch { return []; }
  });
  const [confirmDeleteId,  setConfirmDeleteId]  = useState<string | null>(null);

  // Ref síncrono para impedir duplo clique em Android (state é assíncrono)
  const savingRef = useRef(false);

  const canAnalyze = description.trim().length > 0 && analysisPhase !== 'analyzing';
  const canSave    = (
    description.trim().length > 0 &&
    analysisPhase === 'done' &&
    saveState === 'idle'
  );

  function reloadTodayMeals() {
    try { setTodayMeals(glpyStore.meals.getToday()); }
    catch { /* keep current */ }
  }

  function handleDeleteMeal(id: string) {
    const all = glpyStore.meals.getAll();
    const remaining = all.filter((m: any) => m.id !== id);
    glpyStore.meals.updateAll(remaining);
    window.dispatchEvent(new Event('local-storage-change'));
    reloadTodayMeals();
    setConfirmDeleteId(null);
  }

  function resetAnalysis() {
    setAnalysisPhase('idle');
    setAnalysisResult(null);
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setShowManual(false);
    setAnalysisError('');
  }

  async function handleAnalyze() {
    if (analysisPhase === 'analyzing') return;
    if (!description.trim()) {
      setSaveError('Descreva sua refeição antes de analisar.');
      return;
    }
    setSaveError('');
    setAnalysisError('');
    setAnalysisResult(null);
    setAnalysisPhase('analyzing');

    const res = await analyzeMealDescription(description.trim(), mealType);

    if (res.ok === false) {
      setAnalysisError(res.error);
      setAnalysisPhase('idle');
      return;
    }

    setAnalysisResult(res.result);
    setCalories(res.result.calories > 0 ? String(res.result.calories) : '');
    setProtein(res.result.protein   > 0 ? String(res.result.protein)  : '');
    setCarbs(res.result.carbs       > 0 ? String(res.result.carbs)    : '');
    setFat(res.result.fat           > 0 ? String(res.result.fat)      : '');
    // Fallback: abre ajuste manual automaticamente para o usuário preencher
    if (res.result.source === 'fallback') {
      setShowManual(true);
    }
    setAnalysisPhase('done');
  }

  function handleSave() {
    if (savingRef.current) return;

    if (!description.trim()) {
      setSaveError('Descreva sua refeição ou analise os alimentos antes de salvar.');
      return;
    }
    if (analysisPhase !== 'done') {
      setSaveError('Analise sua refeição antes de salvar.');
      return;
    }
    if (saveState !== 'idle') return;

    savingRef.current = true;
    setSaveState('saving');
    setSaveError('');

    const now     = Date.now();
    const calNum  = calories !== '' ? (parseFloat(calories)  || 0) : (analysisResult?.calories || 0);
    const protNum = protein  !== '' ? (parseFloat(protein)   || 0) : (analysisResult?.protein  || 0);
    const carbNum = carbs    !== '' ? (parseFloat(carbs)     || 0) : (analysisResult?.carbs    || 0);
    const fatNum  = fat      !== '' ? (parseFloat(fat)       || 0) : (analysisResult?.fat      || 0);

    setTimeout(() => {
      const entry = {
        id:             now.toString(),
        nome:           analysisResult?.title || description.trim() || MEAL_LABEL_MAP[mealType],
        descricao:      description.trim() || undefined,
        tipo:           'manual' as const,
        origem:         'FoodLogScreen' as const,
        mealType,
        description,
        photoAdded:     false,
        savedAt:        now,
        calories:       calNum,
        protein:        protNum,
        carbs:          carbNum,
        fat:            fatNum,
        createdAt:      new Date(now).toISOString(),
        date:           getLocalDateKey(),
        analysisSource: analysisResult?.source ?? 'none',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      glpyStore.meals.saveMeal(entry as any);
      glpyBlackBox.addEvent({
        type:     EVENT_TYPES.MEAL_SAVED,
        category: CATEGORIES.NUTRITION,
        domain:   DOMAINS.NUTRITION,
        signal:   SIGNALS.MEAL_LOGGED,
        screen:   'FoodLogScreen',
        source:   'manual',
        payload:  { calories: calNum, protein: protNum, carbs: carbNum, fat: fatNum, mealType, analysisSource: entry.analysisSource },
      });
      window.dispatchEvent(new Event('local-storage-change'));
      setSaveState('saved');
      reloadTodayMeals();

      setTimeout(() => {
        savingRef.current = false;
        onSave?.({ mealType, description, photoAdded: false, calories: calNum, protein: protNum, carbs: carbNum, fat: fatNum });
      }, 900);
    }, 300);
  }

  // ── Computed display values (refletem edição manual) ──────────────────────

  const dispCalories = calories !== '' ? (parseFloat(calories) || 0) : (analysisResult?.calories || 0);
  const dispProtein  = protein  !== '' ? (parseFloat(protein)  || 0) : (analysisResult?.protein  || 0);
  const dispCarbs    = carbs    !== '' ? (parseFloat(carbs)    || 0) : (analysisResult?.carbs    || 0);
  const dispFat      = fat      !== '' ? (parseFloat(fat)      || 0) : (analysisResult?.fat      || 0);

  // ── Styles ────────────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    lineHeight: 1.5,
    margin:     0,
  };

  const cardTitleRowStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          gap.small,
    marginBottom: gap.small,
  };

  const cardIconWrap: React.CSSProperties = {
    width:          32,
    height:         32,
    borderRadius:   10,
    background:     `linear-gradient(135deg, ${lightColors.brand.green}22, ${lightColors.brand.greenDark}33)`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  const mealGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 gap.small,
  };

  const textareaStyle: React.CSSProperties = {
    width:        '100%',
    minHeight:    80,
    borderRadius: radius.input,
    border:       `1.5px solid ${lightColors.border.soft}`,
    background:   lightColors.background.primary,
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.bodyDefault,
    color:        lightColors.text.navy,
    padding:      `${padding.small}px 16px`,
    outline:      'none',
    resize:       'none',
    boxShadow:    lightShadows.soft,
    lineHeight:   1.5,
    boxSizing:    'border-box',
    transition:   transition.default,
  };

  const macroGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 gap.small,
    marginTop:           gap.small,
  };

  const macroItemStyle: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    padding:        `${padding.small}px`,
    borderRadius:   radius.secondary,
    background:     lightColors.background.secondary,
    gap:            2,
  };

  const macroValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   '20px',
    fontWeight: fontWeight.h2,
    color:      lightColors.text.navy,
    lineHeight: 1.1,
  };

  const macroLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   11,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.secondary,
  };

  const warningStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    lineHeight: 1.45,
    fontStyle:  'italic',
    marginTop:  gap.small,
  };

  const fallbackWarningStyle: React.CSSProperties = {
    background:   '#FFF9E6',
    border:       `1px solid #F6C90E`,
    borderRadius: radius.secondary,
    padding:      `${padding.small}px`,
    marginBottom: gap.small,
  };

  const fallbackWarningTextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      '#7A5600',
    lineHeight: 1.45,
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      '#E53E3E',
    lineHeight: 1.4,
    paddingTop: 6,
  };

  const adjustToggleStyle: React.CSSProperties = {
    display:     'flex',
    alignItems:  'center',
    gap:         6,
    marginTop:   gap.small,
    cursor:      'pointer',
    padding:     '4px 0',
    userSelect:  'none',
  };

  const adjustToggleLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.brand.greenDark,
  };

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    borderRadius: radius.input,
    border:       `1.5px solid ${lightColors.border.soft}`,
    background:   lightColors.background.primary,
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.bodyDefault,
    color:        lightColors.text.navy,
    padding:      '8px 12px',
    outline:      'none',
    boxSizing:    'border-box',
  };

  const historyRowStyle: React.CSSProperties = {
    display:       'flex',
    alignItems:    'center',
    gap:           10,
    paddingTop:    7,
    paddingBottom: 7,
  };

  const historyDividerStyle: React.CSSProperties = {
    height:     0.5,
    background: lightColors.border.soft,
  };

  const historyLabelStyle: React.CSSProperties = {
    fontFamily:  fontFamily.primary,
    fontSize:    fontSize.small,
    fontWeight:  fontWeight.h3,
    color:       lightColors.text.navy,
    flex:        1,
  };

  const historyDescStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     11,
    color:        lightColors.text.secondary,
    maxWidth:     160,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  };

  const historyEmptyStyle: React.CSSProperties = {
    fontFamily:  fontFamily.primary,
    fontSize:    fontSize.small,
    color:       lightColors.text.secondary,
    textAlign:   'center',
    paddingTop:  4,
    paddingBottom: 4,
    lineHeight:  1.5,
  };

  const hintStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.text.secondary,
    textAlign:  'center',
    lineHeight: 1.4,
  };

  const macroInputs = [
    { label: 'Calorias',     unit: 'kcal', value: calories, set: setCalories },
    { label: 'Proteína',     unit: 'g',    value: protein,  set: setProtein  },
    { label: 'Carboidratos', unit: 'g',    value: carbs,    set: setCarbs    },
    { label: 'Gordura',      unit: 'g',    value: fat,      set: setFat      },
  ] as const;

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Descrever Refeição" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Subtítulo ────────────────────────────────────────────────── */}
        <p style={subtitleStyle}>
          {referencePhoto
            ? 'Não conseguimos analisar automaticamente agora, mas você ainda pode registrar sua refeição manualmente.'
            : 'Digite o que você comeu. O GLPY estima os macros automaticamente para você.'
          }
        </p>

        {/* ── Foto de referência (vinda de FoodPhotoAnalysisScreen) ────── */}
        {referencePhoto && (
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          12,
            background:   '#F4F6F8',
            borderRadius: 16,
            padding:      '10px 12px',
            border:       '1px solid #E2E8F0',
          }}>
            <img
              src={referencePhoto}
              alt="Foto da refeição"
              style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
            <p style={{ fontFamily: 'inherit', fontSize: 12, color: '#64748B', lineHeight: 1.45, margin: 0 }}>
              Use a foto como referência para descrever sua refeição abaixo.
            </p>
          </div>
        )}

        {/* ── Tipo de refeição ─────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Utensils size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Tipo de refeição</span>
          </div>

          <div style={mealGridStyle}>
            {MEAL_OPTIONS.map(option => (
              <MealChip
                key={option.id}
                option={option}
                selected={mealType === option.id}
                onSelect={() => {
                  setMealType(option.id);
                  if (analysisPhase === 'done') resetAnalysis();
                }}
              />
            ))}
          </div>
        </GLPYCard>

        {/* ── Descrição + Analisar ─────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Utensils size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Descrição da refeição</span>
          </div>

          <textarea
            value={description}
            onChange={e => {
              setDescription(e.target.value);
              if (analysisPhase === 'done') resetAnalysis();
              if (saveError) setSaveError('');
            }}
            placeholder="Ex: 1 bife com arroz e feijão"
            style={textareaStyle}
            disabled={analysisPhase === 'analyzing' || saveState !== 'idle'}
            onFocus={e => {
              e.target.style.border     = `2px solid ${lightColors.brand.green}`;
              e.target.style.boxShadow  = `0 0 0 3px rgba(106,210,143,0.18)`;
            }}
            onBlur={e => {
              e.target.style.border    = `1.5px solid ${lightColors.border.soft}`;
              e.target.style.boxShadow = lightShadows.soft;
            }}
          />

          {analysisError && (
            <p style={errorStyle}>{analysisError}</p>
          )}

          <div style={{ marginTop: gap.small }}>
            <GLPYButton
              variant={analysisPhase === 'done' ? 'secondary' : 'primary'}
              size="md"
              fullWidth
              disabled={!canAnalyze}
              onClick={handleAnalyze}
            >
              {analysisPhase === 'analyzing'
                ? 'Analisando sua refeição…'
                : analysisPhase === 'done'
                  ? 'Reanalisar'
                  : 'Analisar refeição'}
            </GLPYButton>
          </div>
        </GLPYCard>

        {/* ── Resultado da análise ─────────────────────────────────────── */}
        {analysisPhase === 'done' && analysisResult && (
          <>
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <Flame size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Estimativa da refeição</span>
            </div>

            {/* Aviso de fallback */}
            {analysisResult.source === 'fallback' && (
              <div style={fallbackWarningStyle}>
                <p style={fallbackWarningTextStyle}>
                  Estimativa aproximada. Você pode ajustar antes de salvar.
                </p>
              </div>
            )}

            {/* Grid de macros — padrão visual da Análise do Prato */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small, marginTop: gap.small }}>
              {/* Calorias — card full-width */}
              <div style={{
                background:   '#FEF2F2',
                borderRadius: radius.secondary,
                padding:      '14px',
                textAlign:    'center',
                border:       `1px solid ${lightColors.border.soft}`,
              }}>
                <p style={{ fontFamily: fontFamily.primary, fontSize: '22px', fontWeight: '900', color: '#EF4444', lineHeight: 1, margin: 0 }}>
                  {dispCalories} kcal
                </p>
                <p style={{ fontFamily: fontFamily.primary, fontSize: 11, color: lightColors.text.secondary, margin: '6px 0 0 0' }}>
                  Calorias
                </p>
              </div>
              {/* 3 colunas: prot / carbs / gord */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: gap.small }}>
                {[
                  { label: 'Proteínas',    value: dispProtein, bg: `${lightColors.brand.green}14`, color: lightColors.brand.greenDark },
                  { label: 'Carboidratos', value: dispCarbs,   bg: '#FFFBEB',                      color: '#D97706'                   },
                  { label: 'Gorduras',     value: dispFat,     bg: '#F5F3FF',                      color: '#7C3AED'                   },
                ].map(({ label, value, bg, color }) => (
                  <div key={label} style={{
                    background:   bg,
                    borderRadius: radius.secondary,
                    padding:      '10px 6px',
                    textAlign:    'center',
                    border:       `1px solid ${lightColors.border.soft}`,
                  }}>
                    <p style={{ fontFamily: fontFamily.primary, fontSize: '16px', fontWeight: '900', color, lineHeight: 1, margin: 0 }}>
                      {value} g
                    </p>
                    <p style={{ fontFamily: fontFamily.primary, fontSize: 10, color: lightColors.text.secondary, margin: '4px 0 0 0' }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso de estimativa — só quando FatSecret funcionou */}
            {analysisResult.source === 'fatsecret' && (
              <p style={warningStyle}>
                Os valores são estimativas e podem variar conforme porção e preparo.
              </p>
            )}

            {/* Ajustar manualmente (toggle) */}
            <div
              style={adjustToggleStyle}
              onClick={() => setShowManual(v => !v)}
              role="button"
              aria-expanded={showManual}
            >
              <span style={adjustToggleLabelStyle}>Ajustar manualmente</span>
              {showManual
                ? <ChevronUp   size={14} color={lightColors.brand.greenDark} />
                : <ChevronDown size={14} color={lightColors.brand.greenDark} />}
            </div>

            {showManual && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: gap.small, marginTop: 4 }}>
                {macroInputs.map(({ label, unit, value, set }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{
                      fontFamily: fontFamily.primary,
                      fontSize:   11,
                      fontWeight: '700',
                      color:      lightColors.text.secondary,
                    }}>
                      {label} ({unit})
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={value}
                      onChange={e => set(e.target.value)}
                      placeholder="0"
                      style={inputStyle}
                      onFocus={e => {
                        e.target.style.border    = `2px solid ${lightColors.brand.green}`;
                        e.target.style.boxShadow = `0 0 0 3px rgba(106,210,143,0.18)`;
                      }}
                      onBlur={e => {
                        e.target.style.border    = `1.5px solid ${lightColors.border.soft}`;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </GLPYCard>

          {/* ── Card Análise GLP-1 ───────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: gap.small }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Brain size={14} color="#7C3AED" strokeWidth={2} />
                <span style={{
                  fontFamily:    fontFamily.primary,
                  fontSize:      11,
                  fontWeight:    '700',
                  color:         lightColors.text.secondary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                }}>Análise GLP-1</span>
              </div>
              <span style={{
                fontFamily:   fontFamily.primary,
                fontSize:     10,
                fontWeight:   '700',
                color:        '#7C3AED',
                background:   '#F5F3FF',
                padding:      '2px 8px',
                borderRadius: 100,
                border:       '1px solid #EDE9FE',
              }}>GLPY IA</span>
            </div>

            <p style={{
              fontFamily:   fontFamily.primary,
              fontSize:     fontSize.bodyDefault,
              fontWeight:   fontWeight.h3,
              color:        lightColors.text.navy,
              lineHeight:   1.4,
              margin:       '0 0 6px 0',
            }}>
              {analysisResult.title}
            </p>

            <p style={{
              fontFamily:   fontFamily.primary,
              fontSize:     fontSize.small,
              color:        lightColors.text.secondary,
              lineHeight:   1.5,
              margin:       '0 0 6px 0',
            }}>
              {getGlp1Tip(dispProtein, dispCarbs, dispFat)}
            </p>

            <p style={{
              fontFamily: fontFamily.primary,
              fontSize:   11,
              color:      lightColors.text.secondary,
              lineHeight: 1.4,
              fontStyle:  'italic',
              margin:     0,
            }}>
              Esses valores são estimativas e podem variar conforme porção e preparo.
            </p>
          </GLPYCard>
          </>
        )}

        {/* ── Erro de validação ────────────────────────────────────────── */}
        {saveError && (
          <p style={{ ...hintStyle, color: '#E53E3E' }}>{saveError}</p>
        )}

        {/* ── Hint quando análise ainda não foi feita ──────────────────── */}
        {analysisPhase === 'idle' && description.trim().length > 0 && !saveError && (
          <p style={hintStyle}>Clique em "Analisar refeição" antes de salvar.</p>
        )}

        {/* ── CTA Salvar ───────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSave}
          onClick={handleSave}
        >
          {saveState === 'saving'
            ? 'Salvando...'
            : saveState === 'saved'
              ? 'Refeição salva ✓'
              : 'Salvar refeição'}
        </GLPYButton>

        {/* ── Link para foto (secundário) ──────────────────────────────── */}
        {onNavigateToPhoto && (
          <div style={{ textAlign: 'center' }}>
            <GLPYButton variant="ghost" size="sm" onClick={onNavigateToPhoto}>
              <Camera size={14} />
              Analisar pela foto com IA
            </GLPYButton>
          </div>
        )}

        {/* ── Dica GLPY ───────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          style={{
            padding:    padding.small,
            background: `${lightColors.brand.green}14`,
            border:     `1px solid ${lightColors.brand.green}33`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: gap.small, marginBottom: 4 }}>
            <Lightbulb size={15} color={lightColors.brand.greenDark} strokeWidth={2} />
            <span style={{
              fontFamily: fontFamily.primary,
              fontSize:   fontSize.small,
              fontWeight: fontWeight.h3,
              color:      lightColors.text.navy,
            }}>
              Dica GLPY
            </span>
          </div>
          <p style={{
            fontFamily: fontFamily.primary,
            fontSize:   fontSize.small,
            color:      lightColors.text.secondary,
            lineHeight: 1.5,
            margin:     0,
          }}>
            Registrar suas refeições ajuda a GLPY IA a entender seus padrões de fome,
            proteína e energia ao longo da jornada.
          </p>
        </GLPYCard>

        {/* ── Refeições de hoje ────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Utensils size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Refeições de hoje</span>
          </div>

          {todayMeals.length === 0 ? (
            <p style={historyEmptyStyle}>Nenhuma refeição registrada hoje ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(todayMeals as any[]).map((entry, index) => {
                const timeStr   = formatMealTime(entry);
                const hasCals   = (entry.calories ?? 0) > 0;
                const hasMacros = (entry.protein ?? 0) > 0 || (entry.carbs ?? 0) > 0 || (entry.fat ?? 0) > 0;
                const macroStr  = [
                  (entry.protein ?? 0) > 0 ? `${entry.protein}g prot`  : null,
                  (entry.carbs   ?? 0) > 0 ? `${entry.carbs}g carbs`   : null,
                  (entry.fat     ?? 0) > 0 ? `${entry.fat}g gord`      : null,
                ].filter(Boolean).join(' • ');
                return (
                  <React.Fragment key={entry.id ?? entry.savedAt ?? index}>
                    {index > 0 && <div style={historyDividerStyle} />}
                    <div style={{ paddingTop: 10, paddingBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width:          28,
                          height:         28,
                          borderRadius:   8,
                          background:     `${lightColors.brand.green}14`,
                          border:         `1px solid ${lightColors.brand.green}22`,
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                          flexShrink:     0,
                          marginTop:      2,
                        }}>
                          <Utensils size={12} color={lightColors.brand.greenDark} strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                            <span style={{
                              fontFamily:   fontFamily.primary,
                              fontSize:     fontSize.small,
                              fontWeight:   fontWeight.h3,
                              color:        lightColors.text.navy,
                              flex:         1,
                              overflow:     'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace:   'nowrap',
                            }}>
                              {entry.nome || MEAL_LABEL_MAP[entry.mealType as MealType] || 'Refeição'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              {timeStr && (
                                <span style={{
                                  fontFamily: fontFamily.primary,
                                  fontSize:   11,
                                  color:      lightColors.text.secondary,
                                }}>
                                  {timeStr}
                                </span>
                              )}
                              <button
                                onClick={() => setConfirmDeleteId(entry.id ?? String(entry.savedAt ?? index))}
                                style={{
                                  padding:    '4px',
                                  background: 'transparent',
                                  border:     'none',
                                  cursor:     'pointer',
                                  display:    'flex',
                                  alignItems: 'center',
                                  color:      '#CBD5E0',
                                }}
                                aria-label="Excluir refeição"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          {(hasCals || hasMacros) && (
                            <p style={{
                              fontFamily:   fontFamily.primary,
                              fontSize:     11,
                              color:        lightColors.text.secondary,
                              margin:       '2px 0 0 0',
                              overflow:     'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace:   'nowrap',
                            }}>
                              {[
                                hasCals   ? `${entry.calories} calorias` : null,
                                hasMacros ? macroStr                     : null,
                              ].filter(Boolean).join('  ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </GLPYCard>

      </div>

      {/* ── Modal de confirmação de exclusão ─────────────────────── */}
      {confirmDeleteId !== null && (
        <div style={{
          position:        'fixed',
          inset:           0,
          background:      'rgba(10,22,40,0.55)',
          zIndex:          300,
          display:         'flex',
          alignItems:      'flex-end',
          justifyContent:  'center',
          padding:         '0 0 24px 0',
        }}
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   '#fff',
              borderRadius: '24px 24px 16px 16px',
              padding:      '24px',
              width:        '100%',
              maxWidth:     420,
              margin:       '0 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={20} color="#E53E3E" />
              <span style={{ fontFamily: fontFamily.primary, fontSize: fontSize.bodyDefault, fontWeight: fontWeight.h2, color: lightColors.text.navy }}>
                Excluir esta refeição?
              </span>
            </div>
            <p style={{ fontFamily: fontFamily.primary, fontSize: fontSize.small, color: lightColors.text.secondary, lineHeight: 1.5, marginBottom: 20 }}>
              Essa ação remove os macros registrados para ela.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14,
                  border: `1.5px solid ${lightColors.border.soft}`,
                  background: lightColors.background.secondary,
                  fontFamily: fontFamily.primary, fontSize: fontSize.small,
                  fontWeight: fontWeight.h3, color: lightColors.text.secondary,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteMeal(confirmDeleteId)}
                style={{
                  flex: 1, padding: '13px', borderRadius: 14,
                  border: 'none', background: '#FEE2E2',
                  fontFamily: fontFamily.primary, fontSize: fontSize.small,
                  fontWeight: fontWeight.h2, color: '#E53E3E',
                  cursor: 'pointer',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </GLPYScreen>
  );
}

// ── MealChip ──────────────────────────────────────────────────────────────────

interface MealChipProps {
  option:   MealOption;
  selected: boolean;
  onSelect: () => void;
}

function MealChip({ option, selected, onSelect }: MealChipProps) {
  return (
    <div
      style={{
        borderRadius: radius.secondary,
        padding:      `${padding.small}px 12px`,
        cursor:       'pointer',
        transition:   transition.default,
        background:   selected ? `${lightColors.brand.green}14` : lightColors.background.card,
        border:       selected
          ? `2px solid ${lightColors.brand.green}`
          : `1.5px solid ${lightColors.border.soft}`,
        boxShadow:    selected ? `0 0 0 3px ${lightColors.brand.green}18` : lightShadows.soft,
        display:      'flex',
        alignItems:   'center',
        gap:          6,
      }}
      onClick={onSelect}
      role="button"
      aria-pressed={selected}
    >
      <span style={{
        color:      selected ? lightColors.brand.greenDark : lightColors.text.secondary,
        display:    'flex',
        flexShrink: 0,
        transition: transition.default,
      }}>
        {option.icon}
      </span>
      <span style={{
        fontFamily: fontFamily.primary,
        fontSize:   12,
        fontWeight: fontWeight.h3,
        color:      selected ? lightColors.text.navy : lightColors.text.secondary,
        lineHeight: 1.2,
        transition: transition.default,
      }}>
        {option.label}
      </span>
    </div>
  );
}
