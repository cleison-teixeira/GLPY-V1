// GLPY — Weight Settings Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React from 'react';
import { Scale, Ruler, Target, Activity, Globe, ChevronRight } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap } from '../../theme/spacing';
import { transition } from '../../theme/motion';

// ── Types ────────────────────────────────────────────────────────────────────

interface SettingItem {
  id:         string;
  label:      string;
  value:      string;
  icon:       React.ReactNode;
  screenRef:  string;
}

interface WeightSettingsScreenProps {
  onBack?: () => void;
}

// ── Data ─────────────────────────────────────────────────────────────────────
// MVP PLACEHOLDER — valores fixos. No futuro virão do perfil real do usuário.

const SETTINGS_ITEMS: SettingItem[] = [
  {
    id:        'current-weight',
    label:     'Peso Atual',
    value:     '80,0 kg',
    icon:      <Scale size={18} strokeWidth={2} />,
    screenRef: 'CurrentWeightScreen',
  },
  {
    id:        'height',
    label:     'Altura',
    value:     '164 cm',
    icon:      <Ruler size={18} strokeWidth={2} />,
    screenRef: 'HeightScreen',
  },
  {
    id:        'target-weight',
    label:     'Peso Alvo',
    value:     '58,0 kg',
    icon:      <Target size={18} strokeWidth={2} />,
    screenRef: 'TargetWeightScreen',
  },
  {
    id:        'weight-pace',
    label:     'Velocidade de Perda',
    value:     'Equilibrada · 0,5 kg/sem',
    icon:      <Activity size={18} strokeWidth={2} />,
    screenRef: 'WeightPaceScreen',
  },
  {
    id:        'units',
    label:     'Unidades',
    value:     'cm / kg',
    icon:      <Globe size={18} strokeWidth={2} />,
    screenRef: 'UnitsScreen',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function WeightSettingsScreen({ onBack }: WeightSettingsScreenProps) {

  function handleEdit(item: SettingItem) {
    console.log('[GLPY] Open edit:', item.screenRef, '— mode="edit"');
  }

  // ── Styles ───────────────────────────────────────────────────────────────

  const listStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Configurações de Peso" onBack={onBack} />

      <div style={listStyle}>
        {SETTINGS_ITEMS.map(item => (
          <SettingCard
            key={item.id}
            item={item}
            onEdit={() => handleEdit(item)}
          />
        ))}
      </div>
    </GLPYScreen>
  );
}

// ── SettingCard (local) ───────────────────────────────────────────────────────

interface SettingCardProps {
  item:   SettingItem;
  onEdit: () => void;
}

function SettingCard({ item, onEdit }: SettingCardProps) {
  const [hovered, setHovered] = React.useState(false);

  const rowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        gap.small,
  };

  const iconWrapStyle: React.CSSProperties = {
    width:          36,
    height:         36,
    borderRadius:   10,
    background:     `linear-gradient(135deg, ${lightColors.brand.green}22, ${lightColors.brand.greenDark}33)`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    color:          lightColors.brand.greenDark,
  };

  const contentStyle: React.CSSProperties = {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    lineHeight: 1.2,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
    lineHeight: 1.2,
  };

  const chevronColor = hovered ? lightColors.brand.greenDark : lightColors.border.soft;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GLPYCard
        variant="light"
        style={{
          background: hovered ? lightColors.background.secondary : lightColors.background.card,
          transition: transition.default,
        }}
        onClick={onEdit}
      >
        <div style={rowStyle}>
          <div style={iconWrapStyle}>{item.icon}</div>
          <div style={contentStyle}>
            <span style={labelStyle}>{item.label}</span>
            <span style={valueStyle}>{item.value}</span>
          </div>
          <ChevronRight size={18} color={chevronColor} strokeWidth={2} />
        </div>
      </GLPYCard>
    </div>
  );
}
