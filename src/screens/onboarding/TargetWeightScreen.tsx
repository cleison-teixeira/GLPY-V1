// GLPY — Target Weight Screen
// System: Onboarding — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React, { useState } from 'react';
import { Target, TrendingDown, Lightbulb } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYInput, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface TargetWeightScreenProps {
  onBack?: () => void;
  onSave?: (targetWeight: number) => void;
  currentWeight?: number;
  mode?: 'onboarding' | 'edit';
}

const CURRENT_WEIGHT_DEFAULT = 80.0;

function parseWeight(raw: string): number | null {
  const normalized = raw.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

function formatDiff(current: number, target: number | null): string {
  if (target === null || target <= 0) return '—';
  const diff = current - target;
  if (diff <= 0) return '—';
  return `${diff.toFixed(1)} kg`;
}

export default function TargetWeightScreen({
  onBack,
  onSave,
  currentWeight = CURRENT_WEIGHT_DEFAULT,
  mode = 'onboarding',
}: TargetWeightScreenProps) {
  const [value, setValue] = useState('58,0');

  const parsedTarget = parseWeight(value);
  const diff = parsedTarget !== null ? currentWeight - parsedTarget : null;
  const isValid = parsedTarget !== null && parsedTarget > 0 && parsedTarget < currentWeight;

  function handleSave() {
    if (!isValid || parsedTarget === null) return;
    console.log('[GLPY] Target weight saved:', parsedTarget, 'kg');
    onSave?.(parsedTarget);
  }

  // ── styles ──────────────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: gap.medium,
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
    marginBottom: gap.medium,
    paddingLeft:  40 + gap.small,
  };

  // context row
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: padding.small,
    paddingBottom: padding.small,
    borderBottom: `1px solid ${lightColors.border.soft}`,
  };

  const rowLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyDefault,
    color: lightColors.text.secondary,
  };

  const rowValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color: lightColors.text.navy,
  };

  const rowValueGreenStyle: React.CSSProperties = {
    ...rowValueStyle,
    color: lightColors.brand.greenDark,
  };

  // dica card
  const dicaHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: gap.small,
    marginBottom: gap.small,
  };

  const dicaTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color: lightColors.text.navy,
  };

  const dicaTextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    color: lightColors.text.secondary,
    lineHeight: 1.55,
  };

  // validation hint
  const hintStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    color: lightColors.brand.greenDark,
    marginTop: 4,
    minHeight: 18,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader
        title="Peso Alvo"
        onBack={onBack}
      />

      <div style={sectionGap}>

        {/* ── Main card ───────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={heroRowStyle}>
            <div style={heroIconWrap}>
              <Target size={20} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <h2 style={headlineStyle}>Qual é o seu peso alvo?</h2>
          </div>
          <p style={subtextStyle}>
            Defina uma meta realista para acompanhar sua evolução com clareza.
          </p>

          <GLPYInput
            value={value}
            onChange={setValue}
            label="Seu peso alvo"
            unit="kg"
            type="number"
            placeholder="58,0"
            centerWithUnit
          />

          <div style={hintStyle}>
            {value.length > 0 && !isValid && parsedTarget !== null
              ? 'O peso alvo deve ser menor que o peso atual.'
              : ''}
          </div>
        </GLPYCard>

        {/* ── Context card ────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={{ display: 'flex', alignItems: 'center', gap: gap.small, marginBottom: gap.medium }}>
            <TrendingDown size={18} color={lightColors.brand.greenDark} strokeWidth={2} />
            <span style={{ fontFamily: fontFamily.primary, fontSize: fontSize.small, fontWeight: fontWeight.h3, color: lightColors.text.navy }}>
              Resumo da meta
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={rowStyle}>
              <span style={rowLabelStyle}>Peso atual</span>
              <span style={rowValueStyle}>{currentWeight.toFixed(1)} kg</span>
            </div>

            <div style={rowStyle}>
              <span style={rowLabelStyle}>Meta</span>
              <span style={rowValueStyle}>
                {isValid && parsedTarget !== null ? `${parsedTarget.toFixed(1)} kg` : '—'}
              </span>
            </div>

            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={rowLabelStyle}>Falta eliminar</span>
              <span style={rowValueGreenStyle}>
                {isValid && diff !== null ? `${diff.toFixed(1)} kg` : '—'}
              </span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Dica GLPY card ───────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          style={{ background: `${lightColors.brand.green}14`, border: `1px solid ${lightColors.brand.green}33` }}
        >
          <div style={dicaHeaderStyle}>
            <Lightbulb size={18} color={lightColors.brand.greenDark} strokeWidth={2} />
            <span style={dicaTitleStyle}>Dica GLPY</span>
          </div>
          <p style={dicaTextStyle}>
            Metas realistas ajudam a manter consistência e reduzem o risco de efeito rebote.
          </p>
        </GLPYCard>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          onClick={handleSave}
        >
          Salvar meta
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
