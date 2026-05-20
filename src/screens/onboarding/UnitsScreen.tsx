// GLPY — Units Screen
// System: Onboarding — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React, { useState } from 'react';
import { Ruler, Globe, Flag, Lightbulb, Check } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Types ────────────────────────────────────────────────────────────────────

type UnitSystem = 'metric' | 'imperial';

interface UnitOption {
  id:          UnitSystem;
  label:       string;
  measures:    string;
  description: string;
  icon:        React.ReactNode;
}

interface UnitsScreenProps {
  onBack?: () => void;
  onSave?: (unit: UnitSystem) => void;
  mode?: 'onboarding' | 'edit';
}

// ── Data ─────────────────────────────────────────────────────────────────────

const UNIT_OPTIONS: UnitOption[] = [
  {
    id:          'metric',
    label:       'Métrico',
    measures:    'cm / kg',
    description: 'Usado no Brasil e na maior parte do mundo.',
    icon:        <Globe size={18} strokeWidth={2} />,
  },
  {
    id:          'imperial',
    label:       'Imperial',
    measures:    'ft / lbs',
    description: 'Usado principalmente nos Estados Unidos.',
    icon:        <Flag size={18} strokeWidth={2} />,
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function UnitsScreen({ onBack, onSave, mode = 'onboarding' }: UnitsScreenProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitSystem>('metric');

  function handleSave() {
    console.log('[GLPY] Unit system saved:', selectedUnit);
    onSave?.(selectedUnit);
  }

  // ── Styles ───────────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  const heroRowStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          gap.small,
    marginBottom: 4,
  };

  const heroIconWrap: React.CSSProperties = {
    width:          40,
    height:         40,
    borderRadius:   12,
    background:     `linear-gradient(135deg, ${lightColors.brand.green}22, ${lightColors.brand.greenDark}33)`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    marginTop:      2,
  };

  const headlineStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.h3,
    fontWeight: fontWeight.h1,
    color:      lightColors.text.navy,
    lineHeight: 1.2,
    margin:     0,
  };

  const subtextStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    color:        lightColors.text.secondary,
    lineHeight:   1.45,
    marginTop:    4,
    marginBottom: 0,
    paddingLeft:  40 + gap.small,
  };

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
      <GLPYHeader title="Unidades" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <GLPYCard variant="light" style={{ padding: padding.card }}>
          <div style={heroRowStyle}>
            <div style={heroIconWrap}>
              <Ruler size={20} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <h2 style={headlineStyle}>Como você prefere medir sua evolução?</h2>
          </div>
          <p style={subtextStyle}>
            Escolha o sistema de medidas que faz mais sentido para você.
          </p>
        </GLPYCard>

        {/* ── Unit selector cards ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small }}>
          {UNIT_OPTIONS.map(option => (
            <UnitCard
              key={option.id}
              option={option}
              selected={selectedUnit === option.id}
              onSelect={() => setSelectedUnit(option.id)}
            />
          ))}
        </div>

        {/* ── Dica GLPY card ──────────────────────────────────────────────── */}
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
            Você poderá alterar suas unidades depois nas configurações.
          </p>
        </GLPYCard>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <GLPYButton variant="primary" size="lg" fullWidth onClick={handleSave}>
          Salvar unidades
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}

// ── UnitCard (local) ─────────────────────────────────────────────────────────

interface UnitCardProps {
  option:   UnitOption;
  selected: boolean;
  onSelect: () => void;
}

function UnitCard({ option, selected, onSelect }: UnitCardProps) {
  const cardStyle: React.CSSProperties = {
    borderRadius: radius.main,
    padding:      `${padding.small}px ${padding.card}px`,
    cursor:       'pointer',
    transition:   transition.default,
    background:   selected ? `${lightColors.brand.green}14` : lightColors.background.card,
    border:       selected
      ? `2px solid ${lightColors.brand.green}`
      : `1.5px solid ${lightColors.border.soft}`,
    boxShadow:    selected ? `0 0 0 3px ${lightColors.brand.green}18` : lightShadows.soft,
  };

  const rowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        gap.small,
  };

  const iconWrapStyle: React.CSSProperties = {
    width:          36,
    height:         36,
    borderRadius:   12,
    background:     selected ? `${lightColors.brand.green}22` : lightColors.background.secondary,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    color:          selected ? lightColors.brand.greenDark : lightColors.text.secondary,
    transition:     transition.default,
  };

  const contentStyle: React.CSSProperties = {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           1,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  const measuresStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      selected ? lightColors.brand.greenDark : lightColors.text.secondary,
    transition: transition.default,
  };

  const descStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.text.secondary,
    lineHeight: 1.4,
  };

  const checkStyle: React.CSSProperties = {
    width:          22,
    height:         22,
    borderRadius:   11,
    border:         selected
      ? `2px solid ${lightColors.brand.green}`
      : `2px solid ${lightColors.border.soft}`,
    background:     selected ? lightColors.brand.green : 'transparent',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    transition:     transition.default,
  };

  return (
    <div style={cardStyle} onClick={onSelect} role="button" aria-pressed={selected}>
      <div style={rowStyle}>
        <div style={iconWrapStyle}>{option.icon}</div>

        <div style={contentStyle}>
          <span style={labelStyle}>{option.label}</span>
          <span style={measuresStyle}>{option.measures}</span>
          <span style={descStyle}>{option.description}</span>
        </div>

        <div style={checkStyle}>
          {selected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
}
