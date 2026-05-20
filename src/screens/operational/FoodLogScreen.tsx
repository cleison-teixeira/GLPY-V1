// GLPY — Food Log Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// INTEGRAÇÃO FUTURA:
// A integração com FatSecret API, AI Image Recognition e NLP será feita
// futuramente por um MealInsightEngine. No MVP, esta tela apenas registra
// dados locais/mockados.

import React, { useState } from 'react';
import { Camera, Coffee, Utensils, Moon, Apple, Lightbulb, Check } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Types ─────────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealOption {
  id:    MealType;
  label: string;
  icon:  React.ReactNode;
}

interface FoodLogScreenProps {
  onBack?: () => void;
  onSave?: (data: { mealType: MealType; description: string; photoAdded: boolean }) => void;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const MEAL_OPTIONS: MealOption[] = [
  { id: 'breakfast', label: 'Café da manhã', icon: <Coffee size={16} strokeWidth={2} /> },
  { id: 'lunch',     label: 'Almoço',        icon: <Utensils size={16} strokeWidth={2} /> },
  { id: 'dinner',    label: 'Jantar',         icon: <Moon size={16} strokeWidth={2} /> },
  { id: 'snack',     label: 'Lanche',         icon: <Apple size={16} strokeWidth={2} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function FoodLogScreen({ onBack, onSave }: FoodLogScreenProps) {
  const [mealType,    setMealType]    = useState<MealType>('lunch');
  const [description, setDescription] = useState('');
  const [photoAdded,  setPhotoAdded]  = useState(false);

  function handleAddPhoto() {
    console.log('[GLPY] Adicionar foto — MealInsightEngine (futuro)');
    setPhotoAdded(true);
  }

  function handleSave() {
    console.log('[GLPY] Meal saved:', { mealType, description, photoAdded });
    onSave?.({ mealType, description, photoAdded });
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
              {photoAdded ? 'Alterar foto' : 'Adicionar foto'}
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

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
        >
          Salvar refeição
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
