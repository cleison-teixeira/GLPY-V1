// GLPY — Food Log Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// INTEGRAÇÃO FUTURA:
// A integração com FatSecret API, AI Image Recognition e NLP será feita
// futuramente por um MealInsightEngine. No MVP, esta tela apenas registra
// dados locais/mockados.

import React, { useState } from 'react';
import { Camera, Coffee, Utensils, Moon, Apple, Lightbulb, Check, Flame } from 'lucide-react';

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

// ── Types ─────────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealOption {
  id:    MealType;
  label: string;
  icon:  React.ReactNode;
}

interface MealEntry {
  id?:        string;
  nome?:      string;
  descricao?: string;
  tipo?:      'manual' | 'foto_ia';
  origem?:    'FoodLogScreen' | 'FoodPhotoAnalysisScreen';
  mealType:   MealType;
  description: string;
  photoAdded:  boolean;
  savedAt:     number;
  calories:    number;
  protein:     number;
  carbs:       number;
  fat:         number;
  createdAt?:  string;
  date?:       string;
}

interface FoodLogScreenProps {
  onBack?:            () => void;
  onNavigateToPhoto?: () => void;
  onSave?: (data: { mealType: MealType; description: string; photoAdded: boolean; calories: number; protein: number; carbs: number; fat: number }) => void;
}

// ── Module-scope label map ────────────────────────────────────────────────────

const MEAL_LABEL_MAP: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch:     'Almoço',
  dinner:    'Jantar',
  snack:     'Lanche',
};

// ── Data ──────────────────────────────────────────────────────────────────────

const MEAL_OPTIONS: MealOption[] = [
  { id: 'breakfast', label: 'Café da manhã', icon: <Coffee size={16} strokeWidth={2} /> },
  { id: 'lunch',     label: 'Almoço',        icon: <Utensils size={16} strokeWidth={2} /> },
  { id: 'dinner',    label: 'Jantar',         icon: <Moon size={16} strokeWidth={2} /> },
  { id: 'snack',     label: 'Lanche',         icon: <Apple size={16} strokeWidth={2} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────

type MealSaveState = 'idle' | 'saving' | 'saved';

export default function FoodLogScreen({ onBack, onNavigateToPhoto, onSave }: FoodLogScreenProps) {
  const [mealType,    setMealType]    = useState<MealType>('lunch');
  const [description, setDescription] = useState('');
  const [photoAdded,  setPhotoAdded]  = useState(false);
  const [saveState,   setSaveState]   = useState<MealSaveState>('idle');
  const [calories,    setCalories]    = useState('');
  const [protein,     setProtein]     = useState('');
  const [carbs,       setCarbs]       = useState('');
  const [fat,         setFat]         = useState('');
  const [todayMeals,  setTodayMeals]  = useState<MealEntry[]>(() => {
    try { return glpyStore.meals.getToday() as unknown as MealEntry[]; }
    catch { return []; }
  });

  function reloadTodayMeals() {
    try { setTodayMeals(glpyStore.meals.getToday() as unknown as MealEntry[]); }
    catch { /* keep current */ }
  }

  function handleAddPhoto() {
    if (onNavigateToPhoto) {
      onNavigateToPhoto();
    } else {
      setPhotoAdded(true);
    }
  }

  function handleSave() {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    const now      = Date.now();
    const todayDate = getLocalDateKey();
    const calNum  = parseFloat(calories) || 0;
    const protNum = parseFloat(protein)  || 0;
    const carbNum = parseFloat(carbs)    || 0;
    const fatNum  = parseFloat(fat)      || 0;
    setTimeout(() => {
      const canonicalEntry: MealEntry = {
        id:          now.toString(),
        nome:        description.trim() || MEAL_LABEL_MAP[mealType],
        descricao:   description.trim() || undefined,
        tipo:        'manual',
        origem:      'FoodLogScreen',
        mealType,
        description,
        photoAdded,
        savedAt:     now,
        calories:    calNum,
        protein:     protNum,
        carbs:       carbNum,
        fat:         fatNum,
        createdAt:   new Date(now).toISOString(),
        date:        todayDate,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      glpyStore.meals.saveMeal(canonicalEntry as any);
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.MEAL_SAVED, category: CATEGORIES.NUTRITION, domain: DOMAINS.NUTRITION,
        signal: SIGNALS.MEAL_LOGGED, screen: 'FoodLogScreen', source: 'manual',
        payload: { calories: calNum, protein: protNum, carbs: carbNum, fat: fatNum, mealType },
      });
      window.dispatchEvent(new Event('local-storage-change'));
      setSaveState('saved');
      reloadTodayMeals();
      setTimeout(() => onSave?.({ mealType, description, photoAdded, calories: calNum, protein: protNum, carbs: carbNum, fat: fatNum }), 900);
    }, 500);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
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

  // photo card
  const photoAreaStyle: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            gap.small,
    paddingTop:     gap.small,
    paddingBottom:  gap.small,
  };

  const photoBigIconWrap: React.CSSProperties = {
    width:          56,
    height:         56,
    borderRadius:   16,
    background:     photoAdded
      ? `${lightColors.brand.green}22`
      : lightColors.background.secondary,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    transition:     transition.default,
  };

  const photoSubStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    textAlign:  'center',
    lineHeight: 1.45,
  };

  // meal type grid
  const mealGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 gap.small,
  };

  // description textarea
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

  // meal history
  const MEAL_LABEL = MEAL_LABEL_MAP;

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
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
    flex:       1,
  };

  const historyDescStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   11,
    color:      lightColors.text.secondary,
    maxWidth:   160,
    overflow:   'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const historyEmptyStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    textAlign:  'center',
    paddingTop: 4,
    paddingBottom: 4,
    lineHeight: 1.5,
  };

  // dica card
  const dicaHeaderStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          gap.small,
    marginBottom: 4,
  };

  const dicaTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  const dicaTextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    lineHeight: 1.5,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Refeição" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Foto do prato ────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Camera size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Foto do prato</span>
          </div>

          <div style={photoAreaStyle}>
            <div style={photoBigIconWrap}>
              {photoAdded
                ? <Check size={24} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                : <Camera size={24} color={lightColors.text.secondary} strokeWidth={1.5} />
              }
            </div>
            <p style={photoSubStyle}>
              {photoAdded
                ? 'Foto adicionada com sucesso.'
                : 'Adicione uma foto para acompanhar sua alimentação.'}
            </p>
            <GLPYButton
              variant="secondary"
              size="sm"
              onClick={handleAddPhoto}
            >
              Analisar pela foto com IA
            </GLPYButton>
          </div>
        </GLPYCard>

        {/* ── Tipo de refeição ─────────────────────────────────────────────── */}
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
                onSelect={() => setMealType(option.id)}
              />
            ))}
          </div>
        </GLPYCard>

        {/* ── Descrição ───────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Utensils size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Descrição da refeição</span>
          </div>

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: frango, arroz, salada e feijão"
            style={textareaStyle}
            onFocus={e => {
              e.target.style.border = `2px solid ${lightColors.brand.green}`;
              e.target.style.boxShadow = `0 0 0 3px rgba(106,210,143,0.18)`;
            }}
            onBlur={e => {
              e.target.style.border = `1.5px solid ${lightColors.border.soft}`;
              e.target.style.boxShadow = lightShadows.soft;
            }}
          />
        </GLPYCard>

        {/* ── Macros opcionais ────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Flame size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Macros (opcional)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: gap.small }}>
            {([
              { label: 'Calorias', unit: 'kcal', value: calories, set: setCalories },
              { label: 'Proteína', unit: 'g',    value: protein,  set: setProtein  },
              { label: 'Carboidratos', unit: 'g', value: carbs,   set: setCarbs    },
              { label: 'Gordura',   unit: 'g',    value: fat,      set: setFat      },
            ] as const).map(({ label, unit, value, set }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: fontFamily.primary, fontSize: 11, fontWeight: '700', color: lightColors.text.secondary }}>
                  {label} ({unit})
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder="—"
                  style={{
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
                  }}
                  onFocus={e => {
                    e.target.style.border = `2px solid ${lightColors.brand.green}`;
                    e.target.style.boxShadow = `0 0 0 3px rgba(106,210,143,0.18)`;
                  }}
                  onBlur={e => {
                    e.target.style.border = `1.5px solid ${lightColors.border.soft}`;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </GLPYCard>

        {/* ── Dica GLPY ───────────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          style={{
            padding:    padding.small,
            background: `${lightColors.brand.green}14`,
            border:     `1px solid ${lightColors.brand.green}33`,
          }}
        >
          <div style={dicaHeaderStyle}>
            <Lightbulb size={15} color={lightColors.brand.greenDark} strokeWidth={2} />
            <span style={dicaTitleStyle}>Dica GLPY</span>
          </div>
          <p style={dicaTextStyle}>
            Registrar suas refeições ajuda a GLPY IA a entender seus padrões de fome,
            proteína e energia ao longo da jornada.
          </p>
        </GLPYCard>

        {/* ── Refeições de hoje ────────────────────────────────────────────── */}
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
              {todayMeals.map((entry, index) => (
                <React.Fragment key={entry.savedAt}>
                  {index > 0 && <div style={historyDividerStyle} />}
                  <div style={historyRowStyle}>
                    <span style={historyLabelStyle}>{MEAL_LABEL[entry.mealType]}</span>
                    {entry.description
                      ? <span style={historyDescStyle}>{entry.description}</span>
                      : null
                    }
                    {entry.photoAdded && (
                      <Check size={14} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </GLPYCard>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={saveState !== 'idle'}
          onClick={handleSave}
        >
          {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Refeição salva ✓' : 'Salvar refeição'}
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}

// ── MealChip (local) ──────────────────────────────────────────────────────────

interface MealChipProps {
  option:   MealOption;
  selected: boolean;
  onSelect: () => void;
}

function MealChip({ option, selected, onSelect }: MealChipProps) {
  const chipStyle: React.CSSProperties = {
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
  };

  const iconWrapStyle: React.CSSProperties = {
    color:      selected ? lightColors.brand.greenDark : lightColors.text.secondary,
    display:    'flex',
    flexShrink: 0,
    transition: transition.default,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    fontWeight: fontWeight.h3,
    color:      selected ? lightColors.text.navy : lightColors.text.secondary,
    lineHeight: 1.2,
    transition: transition.default,
  };

  return (
    <div style={chipStyle} onClick={onSelect} role="button" aria-pressed={selected}>
      <div style={iconWrapStyle}>{option.icon}</div>
      <span style={labelStyle}>{option.label}</span>
    </div>
  );
}
