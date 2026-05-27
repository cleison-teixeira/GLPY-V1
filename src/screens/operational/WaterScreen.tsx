// GLPY — Water Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React, { useState } from 'react';
import { Droplets, Lightbulb } from 'lucide-react';

import { glpyStore } from '../../data/glpyStore';
import { glpyBlackBox } from '../../data/glpyBlackBox';
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from '../../data/glpyEventCatalog';
import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { formatLiters, getLocalDateKey } from '../../utils/formatters';

// ── Constants ─────────────────────────────────────────────────────────────────
// MVP PLACEHOLDER — meta diária fixa. No futuro será calculada dinamicamente
// com base no peso, fase GLP-1 e nível de atividade do usuário.

const DAILY_GOAL = 2.6; // litros
const MAX_SAFE   = 5.0; // aviso suave acima deste valor

const QUICK_ADD = [
  { label: '+250 ml', amount: 0.25 },
  { label: '+500 ml', amount: 0.5  },
  { label: '+750 ml', amount: 0.75 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = formatLiters;

// ── Types ─────────────────────────────────────────────────────────────────────

interface WaterScreenProps {
  onBack?: () => void;
  onSave?: (amount: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

type WaterSaveState = 'idle' | 'saving' | 'saved';

function readTodayWater(): number {
  try {
    const w = glpyStore.water.getToday();
    if (!w) return 0;
    const today = getLocalDateKey();
    if (w.date !== today) return 0;
    return parseFloat(String(w.amount)) || 0;
  } catch { return 0; }
}

export default function WaterScreen({ onBack, onSave }: WaterScreenProps) {
  const [waterAmount, setWaterAmount] = useState(() => readTodayWater());
  const [saveState, setSaveState] = useState<WaterSaveState>('idle');

  const remaining       = Math.max(0, DAILY_GOAL - waterAmount);
  const progressPercent = Math.min((waterAmount / DAILY_GOAL) * 100, 100);
  const isOverSafe      = waterAmount > MAX_SAFE;
  const isComplete      = waterAmount >= DAILY_GOAL;

  function handleAdd(amount: number) {
    setWaterAmount(prev => {
      const next = parseFloat(Math.min(prev + amount, 99).toFixed(2));
      const today = getLocalDateKey();
      glpyStore.water.saveToday({ amount: next, date: today, updatedAt: new Date().toISOString() });
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.WATER_UPDATED, category: CATEGORIES.HYDRATION, domain: DOMAINS.METABOLISM,
        signal: next >= DAILY_GOAL ? SIGNALS.WATER_GOAL_HIT : SIGNALS.WATER_LOGGED,
        screen: 'WaterScreen', source: 'manual',
        payload: { totalMlToday: next },
      });
      window.dispatchEvent(new Event('local-storage-change'));
      return next;
    });
  }

  function handleSave() {
    if (saveState !== 'idle') return;
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => onSave?.(waterAmount), 900);
    }, 500);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  const heroRowStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          gap.small,
    marginBottom: gap.medium,
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

  // big centered amount display
  const amountDisplayStyle: React.CSSProperties = {
    textAlign:  'center',
    fontFamily: fontFamily.primary,
    fontSize:   40,
    fontWeight: '700',
    color:      isComplete ? lightColors.brand.greenDark : lightColors.text.navy,
    lineHeight: 1,
    transition: 'color 0.2s ease',
    marginBottom: 4,
  };

  const amountUnitStyle: React.CSSProperties = {
    fontSize:   fontSize.h3,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.secondary,
    marginLeft: 4,
  };

  // progress bar
  const progressTrackStyle: React.CSSProperties = {
    width:        '100%',
    height:       8,
    borderRadius: 99,
    background:   `${lightColors.brand.green}22`,
    overflow:     'hidden',
    margin:       `${gap.medium}px 0 6px`,
  };

  const progressFillStyle: React.CSSProperties = {
    height:     '100%',
    width:      `${progressPercent}%`,
    borderRadius: 99,
    background: `linear-gradient(90deg, ${lightColors.brand.green}, ${lightColors.brand.greenDark})`,
    transition: 'width 0.3s ease',
  };

  const progressLabelRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    marginBottom:   gap.medium,
  };

  const progressLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.text.secondary,
  };

  const progressPctStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    fontWeight: fontWeight.h3,
    color:      lightColors.brand.greenDark,
  };

  // data rows
  const rowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingTop:     padding.small,
    paddingBottom:  padding.small,
    borderBottom:   `1px solid ${lightColors.border.soft}`,
  };

  const rowLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    color:      lightColors.text.secondary,
  };

  const rowValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  const rowValueGreenStyle: React.CSSProperties = {
    ...rowValueStyle,
    color: lightColors.brand.greenDark,
  };

  // quick-add buttons
  const quickRowStyle: React.CSSProperties = {
    display: 'flex',
    gap:     gap.small,
  };

  // warning hint
  const warnStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    textAlign:  'center',
    minHeight:  18,
    paddingTop: 4,
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
      <GLPYHeader title="Água" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Progress card ────────────────────────────────────────────────── */}
        <GLPYCard variant="light">

          <div style={heroRowStyle}>
            <div style={heroIconWrap}>
              <Droplets size={20} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <h2 style={headlineStyle}>Sua hidratação hoje</h2>
          </div>

          {/* big amount */}
          <div style={{ textAlign: 'center' }}>
            <span style={amountDisplayStyle}>
              {fmt(waterAmount)}
              <span style={amountUnitStyle}>L</span>
            </span>
          </div>

          {/* progress bar */}
          <div style={progressTrackStyle}>
            <div style={progressFillStyle} />
          </div>
          <div style={progressLabelRowStyle}>
            <span style={progressLabelStyle}>0 L</span>
            <span style={progressPctStyle}>{Math.round(progressPercent)}%</span>
            <span style={progressLabelStyle}>{fmt(DAILY_GOAL)} L (meta)</span>
          </div>

          {/* data rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={rowStyle}>
              <span style={rowLabelStyle}>Consumido</span>
              <span style={rowValueStyle}>{fmt(waterAmount)} L</span>
            </div>
            <div style={rowStyle}>
              <span style={rowLabelStyle}>Meta</span>
              <span style={rowValueStyle}>{fmt(DAILY_GOAL)} L</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={rowLabelStyle}>Falta</span>
              <span style={isComplete ? rowValueGreenStyle : rowValueStyle}>
                {isComplete ? 'Meta atingida 🎉' : `${fmt(remaining)} L`}
              </span>
            </div>
          </div>

        </GLPYCard>

        {/* ── Quick-add buttons ────────────────────────────────────────────── */}
        <div style={quickRowStyle}>
          {QUICK_ADD.map(item => (
            <div key={item.label} style={{ flex: 1 }}>
              <GLPYButton
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => handleAdd(item.amount)}
              >
                {item.label}
              </GLPYButton>
            </div>
          ))}
        </div>

        {/* soft warning above 5L */}
        <div style={warnStyle}>
          {isOverSafe
            ? 'Você já ultrapassou 5 L — continue hidratado com moderação.'
            : ''}
        </div>

        {/* ── Dica GLPY card ───────────────────────────────────────────────── */}
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
            Manter a hidratação ajuda seu corpo a lidar melhor com a jornada metabólica
            e pode reduzir desconfortos comuns.
          </p>
        </GLPYCard>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={saveState !== 'idle'}
          onClick={handleSave}
        >
          {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Água salva ✓' : 'Salvar água'}
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
