// GLPY — Weight Pace Screen
// System: Onboarding — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
// Reference: docs/target-weight-screen-v1.md

import React, { useState } from 'react';
import { Leaf, Activity, Zap, Lightbulb, Check } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Types ────────────────────────────────────────────────────────────────────

type Pace = 'light' | 'balanced' | 'accelerated';

interface PaceOption {
  id:           Pace;
  label:        string;
  rate:         string;
  description:  string;
  icon:         React.ReactNode;
  recommended?: boolean;
}

interface WeightPaceScreenProps {
  onBack?: () => void;
  onSave?: (pace: Pace) => void;
  mode?: 'onboarding' | 'edit';
}

// ── Data ─────────────────────────────────────────────────────────────────────
//
// MVP PLACEHOLDER — estes valores são fixos apenas para visualização inicial.
// No futuro devem ser calculados dinamicamente com base em:
//   - peso atual e peso alvo do usuário
//   - IMC e composição corporal
//   - fase da jornada GLP-1 (início, manutenção, transição)
//   - histórico de adesão e variação de peso
//   - segurança metabólica (limite saudável por fase)

const PACE_OPTIONS: PaceOption[] = [
  {
    id:          'light',
    label:       'Leve',
    rate:        '0,3 kg/semana',
    description: 'Ritmo mais gradual.',
    icon:        <Leaf size={18} strokeWidth={2} />,
  },
  {
    id:          'balanced',
    label:       'Equilibrada',
    rate:        '0,5 kg/semana',
    description: 'Recomendado para consistência.',
    icon:        <Activity size={18} strokeWidth={2} />,
    recommended: true,
  },
  {
    id:          'accelerated',
    label:       'Acelerada',
    rate:        '0,8 kg/semana',
    description: 'Exige mais atenção aos hábitos.',
    icon:        <Zap size={18} strokeWidth={2} />,
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function WeightPaceScreen({ onBack, onSave, mode = 'onboarding' }: WeightPaceScreenProps) {
  const [selectedPace, setSelectedPace] = useState<Pace>('balanced');

  function handleSave() {
    console.log('[GLPY] Weight pace saved:', selectedPace);
    onSave?.(selectedPace);
  }

  // ── Styles ───────────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  const heroRowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        gap.small,
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
    fontFamily:  fontFamily.primary,
    fontSize:    fontSize.small,
    color:       lightColors.text.secondary,
    lineHeight:  1.45,
    marginTop:   4,
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
      <GLPYHeader title="Velocidade de Perda" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <GLPYCard variant="light" style={{ padding: padding.card }}>
          <div style={heroRowStyle}>
            <div style={heroIconWrap}>
              <Activity size={20} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <h2 style={headlineStyle}>Qual ritmo combina com você?</h2>
          </div>
          <p style={subtextStyle}>
            Escolha um ritmo sustentável para sua evolução.
          </p>
        </GLPYCard>

        {/* ── Pace selector cards ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small }}>
          {PACE_OPTIONS.map(option => (
            <PaceCard
              key={option.id}
              option={option}
              selected={selectedPace === option.id}
              onSelect={() => setSelectedPace(option.id)}
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
            Ritmos sustentáveis ajudam seu corpo a se adaptar melhor e favorecem a manutenção dos resultados.
          </p>
        </GLPYCard>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <GLPYButton variant="primary" size="md" fullWidth onClick={handleSave}>
          Salvar ritmo
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}

// ── PaceCard (local) ─────────────────────────────────────────────────────────

interface PaceCardProps {
  option:   PaceOption;
  selected: boolean;
  onSelect: () => void;
}

function PaceCard({ option, selected, onSelect }: PaceCardProps) {
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

  const labelRowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        6,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  const rateStyle: React.CSSProperties = {
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

  const badgeStyle: React.CSSProperties = {
    display:       'inline-flex',
    alignItems:    'center',
    paddingLeft:   6,
    paddingRight:  6,
    paddingTop:    1,
    paddingBottom: 1,
    borderRadius:  99,
    background:    `${lightColors.brand.green}22`,
    fontFamily:    fontFamily.primary,
    fontSize:      10,
    fontWeight:    fontWeight.h3,
    color:         lightColors.brand.greenDark,
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
          <div style={labelRowStyle}>
            <span style={labelStyle}>{option.label}</span>
            {option.recommended && <span style={badgeStyle}>Recomendado</span>}
          </div>
          <span style={rateStyle}>{option.rate}</span>
          <span style={descStyle}>{option.description}</span>
        </div>

        <div style={checkStyle}>
          {selected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
}
