// GLPY — Current Weight Screen
// System: Onboarding — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React, { useState } from 'react';
import { Scale, Lightbulb, TrendingDown, Target } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYInput, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';

// ── Types ────────────────────────────────────────────────────────────────────

interface CurrentWeightScreenProps {
  onBack?: () => void;
  onSave?: (weight: number) => void;
  mode?: 'onboarding' | 'edit';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseWeight(raw: string): number | null {
  const normalized = raw.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CurrentWeightScreen({ onBack, onSave, mode = 'onboarding' }: CurrentWeightScreenProps) {
  const [value, setValue] = useState('80,0');

  const parsed = parseWeight(value);
  const isValid = parsed !== null && parsed > 20 && parsed < 300;

  function handleSave() {
    if (!isValid || parsed === null) return;
    console.log('[GLPY] Current weight saved:', parsed, 'kg');
    onSave?.(parsed);
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
    marginBottom: gap.medium,
    paddingLeft:  40 + gap.small,
  };

  const hintStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        4,
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.brand.greenDark,
    marginTop:  6,
    minHeight:  18,
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

  // context card rows
  const contextRowStyle: React.CSSProperties = {
    display:       'flex',
    alignItems:    'flex-start',
    justifyContent:'space-between',
    paddingTop:    padding.small,
    paddingBottom: padding.small,
    borderBottom:  `1px solid ${lightColors.border.soft}`,
  };

  const contextLeftStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'flex-start',
    gap:        8,
  };

  const contextIconWrap: React.CSSProperties = {
    width:          28,
    height:         28,
    borderRadius:   8,
    background:     `${lightColors.brand.green}14`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    marginTop:      1,
  };

  const contextLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.text.secondary,
  };

  const contextValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
    lineHeight: 1.2,
  };

  const contextSubStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.text.secondary,
  };

  const contextRightStyle: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'flex-end',
    gap:            2,
  };

  const contextTrendStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.brand.greenDark,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Peso Atual" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={heroRowStyle}>
            <div style={heroIconWrap}>
              <Scale size={20} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <h2 style={headlineStyle}>Qual é o seu peso atual?</h2>
          </div>
          <p style={subtextStyle}>
            Atualize seu peso para acompanhar seu progresso com precisão.
          </p>

          <GLPYInput
            value={value}
            onChange={setValue}
            label="Seu peso atual"
            unit="kg"
            type="number"
            placeholder="80,0"
            centerWithUnit
          />

          <div style={hintStyle}>
            {isValid ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill={`${lightColors.brand.green}33`} />
                  <path d="M4 7l2 2 4-4" stroke={lightColors.brand.greenDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Valor dentro da faixa saudável
              </>
            ) : null}
          </div>
        </GLPYCard>

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
            Pesagens pela manhã, após ir ao banheiro e antes de se alimentar, são mais precisas.
          </p>
        </GLPYCard>

        {/* ── Context card ────────────────────────────────────────────────── */}
        {/* MVP PLACEHOLDER — valores fixos. No futuro virão do histórico real do usuário. */}
        <GLPYCard variant="light">
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={contextRowStyle}>
              <div style={contextLeftStyle}>
                <div style={contextIconWrap}>
                  <TrendingDown size={14} color={lightColors.brand.greenDark} strokeWidth={2} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={contextLabelStyle}>Último registro</span>
                  <span style={contextValueStyle}>80,8 kg</span>
                  <span style={contextSubStyle}>há 2 dias</span>
                </div>
              </div>
              <div style={contextRightStyle}>
                <span style={contextTrendStyle}>↓ 0,8 kg</span>
                <span style={contextSubStyle}>desde então</span>
              </div>
            </div>

            <div style={{ ...contextRowStyle, borderBottom: 'none' }}>
              <div style={contextLeftStyle}>
                <div style={contextIconWrap}>
                  <Target size={14} color={lightColors.brand.greenDark} strokeWidth={2} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={contextLabelStyle}>Sua meta</span>
                  <span style={contextValueStyle}>58,0 kg</span>
                </div>
              </div>
              <div style={contextRightStyle}>
                <span style={contextTrendStyle}>22,0 kg</span>
                <span style={contextSubStyle}>para perder</span>
              </div>
            </div>

          </div>
        </GLPYCard>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          onClick={handleSave}
        >
          Salvar peso
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
