// GLPY — Height Screen
// System: Onboarding — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React, { useState } from 'react';
import { Ruler, Lightbulb } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYInput, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';

// ── Types ────────────────────────────────────────────────────────────────────

interface HeightScreenProps {
  onBack?: () => void;
  onSave?: (height: number) => void;
  mode?: 'onboarding' | 'edit';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseHeight(raw: string): number | null {
  const trimmed = raw.trim().replace(/cm/i, '').trim();
  // support 1.64 → 164
  const normalized = trimmed.replace(',', '.');
  let parsed = parseFloat(normalized);
  if (isNaN(parsed)) return null;
  // if entered as meters (e.g. 1.64)
  if (parsed < 3) parsed = Math.round(parsed * 100);
  return parsed;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function HeightScreen({ onBack, onSave, mode = 'onboarding' }: HeightScreenProps) {
  const [value, setValue] = useState('164');

  const parsed = parseHeight(value);
  const isValid = parsed !== null && parsed >= 50 && parsed <= 250;

  function handleSave() {
    if (!isValid || parsed === null) return;
    console.log('[GLPY] Height saved:', parsed, 'cm');
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
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.brand.greenDark,
    marginTop:  4,
    minHeight:  18,
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
      <GLPYHeader title="Altura" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Hero card ───────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={heroRowStyle}>
            <div style={heroIconWrap}>
              <Ruler size={20} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <h2 style={headlineStyle}>Qual é a sua altura?</h2>
          </div>
          <p style={subtextStyle}>
            Isso nos ajuda a calcular seu IMC e personalizar suas metas.
          </p>

          <GLPYInput
            value={value}
            onChange={setValue}
            label="Sua altura"
            unit="cm"
            type="number"
            placeholder="164"
            centerWithUnit
          />

          <div style={hintStyle}>
            {value.length > 0 && !isValid && parsed !== null
              ? 'Insira uma altura válida entre 50 e 250 cm.'
              : ''}
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
            Você poderá alterar isso depois nas configurações.
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
          Salvar altura
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
