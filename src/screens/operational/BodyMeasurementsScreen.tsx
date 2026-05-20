// GLPY — Body Measurements Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela apenas registra medidas informadas pelo usuário.
// O GLPY não avalia composição corporal nem substitui orientação profissional.
//
// Futuramente esta tela poderá alimentar gráficos de evolução corporal,
// resultados visuais e relatórios de progresso.

import React, { useState } from 'react';
import { TrendingUp, Ruler, Lightbulb } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYInput, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// ── Props ─────────────────────────────────────────────────────────────────────

interface BodyMeasurementsScreenProps {
  onBack?: () => void;
  onSave?: (data: {
    waist: string; hip: string; abdomen: string;
    chest: string; arm: string;  thigh: string;
  }) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidMeasurement(value: string): boolean {
  const n = parseFloat(value.replace(',', '.'));
  return !isNaN(n) && n > 0;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BodyMeasurementsScreen({ onBack, onSave }: BodyMeasurementsScreenProps) {
  const [waist,   setWaist]   = useState('84');
  const [hip,     setHip]     = useState('104');
  const [abdomen, setAbdomen] = useState('92');
  const [chest,   setChest]   = useState('96');
  const [arm,     setArm]     = useState('32');
  const [thigh,   setThigh]   = useState('58');

  const canSave = [waist, hip, abdomen, chest, arm, thigh].every(isValidMeasurement);

  function handleSave() {
    console.log('[GLPY] Body measurements saved:', {
      waist, hip, abdomen, chest, arm, thigh,
    });
    onSave?.({ waist, hip, abdomen, chest, arm, thigh });
  }

  // ── Shared styles ──────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
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

  const cardTitleRowStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          gap.small,
    marginBottom: gap.small,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  // card 1 — summary
  const summarySubtextStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    color:        lightColors.text.secondary,
    lineHeight:   1.5,
    marginBottom: gap.small,
  };

  const summaryBlockStyle: React.CSSProperties = {
    background:    lightColors.background.secondary,
    borderRadius:  radius.secondary,
    padding:       '12px 16px',
    display:       'flex',
    flexDirection: 'column',
    gap:           6,
  };

  const summaryRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
  };

  const summaryLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
  };

  const summaryValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  // card 2 — 2-column grid
  const measurementGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 gap.medium,
  };

  // dica
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
      <GLPYHeader title="Medidas" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Card 1 — Evolução corporal ─────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingUp size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Evolução corporal</span>
          </div>
          <p style={summarySubtextStyle}>
            Registre suas medidas para acompanhar mudanças que a balança nem sempre mostra.
          </p>
          <div style={summaryBlockStyle}>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Último registro</span>
              <span style={summaryValueStyle}>12/05/2026</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Cintura</span>
              <span style={summaryValueStyle}>84 cm</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Quadril</span>
              <span style={summaryValueStyle}>104 cm</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Card 2 — Medidas principais ───────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Ruler size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Medidas principais</span>
          </div>
          <div style={measurementGridStyle}>
            <GLPYInput
              value={waist}
              onChange={setWaist}
              label="Cintura"
              unit="cm"
              centerWithUnit
              placeholder="84"
            />
            <GLPYInput
              value={hip}
              onChange={setHip}
              label="Quadril"
              unit="cm"
              centerWithUnit
              placeholder="104"
            />
            <GLPYInput
              value={abdomen}
              onChange={setAbdomen}
              label="Abdômen"
              unit="cm"
              centerWithUnit
              placeholder="92"
            />
            <GLPYInput
              value={chest}
              onChange={setChest}
              label="Peito"
              unit="cm"
              centerWithUnit
              placeholder="96"
            />
            <GLPYInput
              value={arm}
              onChange={setArm}
              label="Braço"
              unit="cm"
              centerWithUnit
              placeholder="32"
            />
            <GLPYInput
              value={thigh}
              onChange={setThigh}
              label="Coxa"
              unit="cm"
              centerWithUnit
              placeholder="58"
            />
          </div>
        </GLPYCard>

        {/* ── Card 3 — Dica GLPY ────────────────────────────────────────────── */}
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
            Acompanhar medidas ajuda a perceber evolução corporal mesmo quando o peso muda pouco.
            Pequenas mudanças também contam.
          </p>
        </GLPYCard>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSave}
          onClick={handleSave}
        >
          Salvar medidas
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
