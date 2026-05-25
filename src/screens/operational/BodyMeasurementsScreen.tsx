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
import { parseBRNumber, formatDecimalBR } from '../../utils/formatters';

// ── Props ─────────────────────────────────────────────────────────────────────

interface BodyMeasurementsScreenProps {
  onBack?: () => void;
  onSave?: (data: {
    waist: string; hip: string; abdomen: string;
    chest: string; arm: string;  thigh: string; calf: string;
  }) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidMeasurement(value: string): boolean {
  const n = parseFloat(value.replace(',', '.'));
  return !isNaN(n) && n > 0;
}

function fmtMeasure(value: string): string {
  if (!isValidMeasurement(value)) return '— cm';
  return `${formatDecimalBR(parseBRNumber(value))} cm`;
}

function loadSavedMeasures(): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem('glpy_medidas_corporais') || '{}') ?? {}; }
  catch { return {}; }
}

// Converte número ou string para exibição no input com 2 casas decimais (pt-BR).
function norm(v: unknown): string {
  if (v === undefined || v === null || v === '') return '';
  const n = parseFloat(String(v).replace(',', '.'));
  if (isNaN(n) || n <= 0) return String(v).replace('.', ',');
  return formatDecimalBR(n);
}

// Formata string digitada pelo usuário para 2 casas decimais no onBlur/save.
// Não altera strings vazias nem valores inválidos — evita travar digitação.
function fmtInput(v: string): string {
  if (!v.trim()) return v;
  const n = parseBRNumber(v);
  if (isNaN(n) || n <= 0) return v;
  return formatDecimalBR(n);
}

// ── Component ─────────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved';

export default function BodyMeasurementsScreen({ onBack, onSave }: BodyMeasurementsScreenProps) {
  const saved = loadSavedMeasures();
  const [waist,   setWaist]   = useState(() => norm(saved.waist   || saved.cintura     || ''));
  const [hip,     setHip]     = useState(() => norm(saved.hip     || saved.quadril     || ''));
  const [abdomen, setAbdomen] = useState(() => norm(saved.abdomen || ''));
  const [chest,   setChest]   = useState(() => norm(saved.chest   || saved.busto       || ''));
  const [arm,     setArm]     = useState(() => norm(saved.arm     || saved.braco       || ''));
  const [thigh,   setThigh]   = useState(() => norm(saved.thigh   || saved.coxa        || ''));
  const [calf,    setCalf]    = useState(() => norm(saved.calf    || saved.panturrilha || ''));
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const canSave = [waist, hip, abdomen, chest, arm, thigh, calf].some(isValidMeasurement);

  function handleSave() {
    if (saveState !== 'idle') return;
    const fWaist   = fmtInput(waist);   setWaist(fWaist);
    const fHip     = fmtInput(hip);     setHip(fHip);
    const fAbdomen = fmtInput(abdomen); setAbdomen(fAbdomen);
    const fChest   = fmtInput(chest);   setChest(fChest);
    const fArm     = fmtInput(arm);     setArm(fArm);
    const fThigh   = fmtInput(thigh);   setThigh(fThigh);
    const fCalf    = fmtInput(calf);    setCalf(fCalf);
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => onSave?.({ waist: fWaist, hip: fHip, abdomen: fAbdomen, chest: fChest, arm: fArm, thigh: fThigh, calf: fCalf }), 900);
    }, 500);
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
              <span style={summaryLabelStyle}>Cintura</span>
              <span style={summaryValueStyle}>{fmtMeasure(waist)}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Quadril</span>
              <span style={summaryValueStyle}>{fmtMeasure(hip)}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Coxa</span>
              <span style={summaryValueStyle}>{fmtMeasure(thigh)}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Panturrilha</span>
              <span style={summaryValueStyle}>{fmtMeasure(calf)}</span>
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
              onBlur={() => setWaist(fmtInput(waist))}
              label="Cintura"
              unit="cm"
              type="number"
              centerWithUnit
              placeholder="84"
            />
            <GLPYInput
              value={hip}
              onChange={setHip}
              onBlur={() => setHip(fmtInput(hip))}
              label="Quadril"
              unit="cm"
              type="number"
              centerWithUnit
              placeholder="104"
            />
            <GLPYInput
              value={abdomen}
              onChange={setAbdomen}
              onBlur={() => setAbdomen(fmtInput(abdomen))}
              label="Abdômen"
              unit="cm"
              type="number"
              centerWithUnit
              placeholder="92"
            />
            <GLPYInput
              value={chest}
              onChange={setChest}
              onBlur={() => setChest(fmtInput(chest))}
              label="Peito"
              unit="cm"
              type="number"
              centerWithUnit
              placeholder="96"
            />
            <GLPYInput
              value={arm}
              onChange={setArm}
              onBlur={() => setArm(fmtInput(arm))}
              label="Braço"
              unit="cm"
              type="number"
              centerWithUnit
              placeholder="32"
            />
            <GLPYInput
              value={thigh}
              onChange={setThigh}
              onBlur={() => setThigh(fmtInput(thigh))}
              label="Coxa"
              unit="cm"
              type="number"
              centerWithUnit
              placeholder="58"
            />
            <GLPYInput
              value={calf}
              onChange={setCalf}
              onBlur={() => setCalf(fmtInput(calf))}
              label="Panturrilha"
              unit="cm"
              type="number"
              centerWithUnit
              placeholder="36"
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
          disabled={!canSave || saveState !== 'idle'}
          onClick={handleSave}
        >
          {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Medidas salvas ✓' : 'Salvar medidas'}
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
