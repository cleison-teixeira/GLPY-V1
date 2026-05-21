// GLPY — Body Profile Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Tela de edição do perfil corporal do usuário.
// Permite corrigir altura, peso inicial, peso atual e meta de peso.
// Preserva todos os outros campos do glpy_onboarding ao salvar.

import React, { useState } from 'react';
import { Scale, Ruler, Target, TrendingDown, Lightbulb } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYInput, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { saveWeightEntry } from '../../core/glpyLocalIntelligence';

// ── Props ─────────────────────────────────────────────────────────────────────

interface BodyProfileScreenProps {
  onBack?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readOnboarding(): Record<string, unknown> {
  try { return JSON.parse(localStorage.getItem('glpy_onboarding') || '{}') ?? {}; }
  catch { return {}; }
}

function fmtNum(v: unknown, decimals = 2): string {
  const n = parseFloat(String(v ?? ''));
  return isNaN(n) ? '' : n.toFixed(decimals).replace('.', ',');
}

function normalizeHeight(raw: string): number | null {
  const s = raw.trim().replace(',', '.').replace(/cm/i, '').trim();
  const n = parseFloat(s);
  if (isNaN(n) || n <= 0) return null;
  // se veio em cm (> 3) converte para metros
  return n > 3 ? parseFloat((n / 100).toFixed(2)) : n;
}

function parseKg(raw: string): number | null {
  const n = parseFloat(raw.replace(',', '.'));
  return isNaN(n) || n <= 0 ? null : n;
}

// ── Component ─────────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved';

export default function BodyProfileScreen({ onBack }: BodyProfileScreenProps) {
  const onb = readOnboarding();

  // Read current values from localStorage
  const [pesoAtualInput,   setPesoAtualInput]   = useState(() => {
    try {
      const lw = JSON.parse(localStorage.getItem('glpy_latest_weight') || 'null');
      if (lw?.weight) return fmtNum(lw.weight);
    } catch {}
    return fmtNum(localStorage.getItem('glpy_peso_atual') ?? onb.peso_atual ?? onb.pesoAtual ?? '');
  });

  const [pesoInicialInput, setPesoInicialInput] = useState(() =>
    fmtNum(onb.pesoInicial ?? onb.peso_inicial ?? onb.peso_atual ?? '')
  );

  const [metaInput, setMetaInput] = useState(() => {
    const fromKey = parseFloat(localStorage.getItem('glpy_peso_sonho') ?? '');
    if (!isNaN(fromKey) && fromKey > 0) return fmtNum(fromKey);
    return fmtNum(onb.pesoMeta ?? onb.peso_sonho ?? onb.peso_meta ?? '');
  });

  const [alturaInput, setAlturaInput] = useState(() => {
    const fromKey = parseFloat(localStorage.getItem('glpy_altura') ?? '');
    if (!isNaN(fromKey) && fromKey > 0) {
      const h = fromKey > 3 ? fromKey / 100 : fromKey;
      return h.toFixed(2).replace('.', ',');
    }
    const v = parseFloat(String(onb.altura ?? ''));
    if (!isNaN(v) && v > 0) {
      const h = v > 3 ? v / 100 : v;
      return h.toFixed(2).replace('.', ',');
    }
    return '';
  });

  const [saveState, setSaveState] = useState<SaveState>('idle');

  function handleSave() {
    if (saveState !== 'idle') return;
    setSaveState('saving');

    const existing = readOnboarding();

    // Peso atual
    const pesoAtual = parseKg(pesoAtualInput);
    if (pesoAtual !== null) {
      saveWeightEntry({ weight: pesoAtual });
    }

    // Peso inicial
    const pesoInicial = parseKg(pesoInicialInput);
    if (pesoInicial !== null) {
      existing.pesoInicial  = pesoInicial;
      existing.peso_inicial = pesoInicial;
      existing.peso_atual   = pesoInicial; // useUserOnboarding lê como pesoInicial
    }

    // Meta de peso
    const meta = parseKg(metaInput);
    if (meta !== null) {
      existing.pesoMeta   = meta;
      existing.peso_sonho = meta;
      existing.peso_meta  = meta;
      localStorage.setItem('glpy_peso_sonho', meta.toFixed(1));
    }

    // Altura
    const alturaM = normalizeHeight(alturaInput);
    if (alturaM !== null) {
      existing.altura = alturaM;
      localStorage.setItem('glpy_altura', alturaM.toFixed(2));
    }

    localStorage.setItem('glpy_onboarding', JSON.stringify(existing));
    window.dispatchEvent(new Event('local-storage-change'));

    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => onBack?.(), 900);
    }, 500);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

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

  const gridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 gap.medium,
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
      <GLPYHeader title="Perfil Corporal" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Card 1 — Pesos ────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Scale size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Dados de peso</span>
          </div>
          <div style={gridStyle}>
            <GLPYInput
              label="Peso atual"
              unit="kg"
              type="number"
              centerWithUnit
              value={pesoAtualInput}
              onChange={setPesoAtualInput}
              placeholder="80,0"
            />
            <GLPYInput
              label="Peso inicial"
              unit="kg"
              type="number"
              centerWithUnit
              value={pesoInicialInput}
              onChange={setPesoInicialInput}
              placeholder="85,0"
            />
            <GLPYInput
              label="Meta de peso"
              unit="kg"
              type="number"
              centerWithUnit
              value={metaInput}
              onChange={setMetaInput}
              placeholder="60,0"
            />
          </div>
        </GLPYCard>

        {/* ── Card 2 — Altura ───────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Ruler size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Altura</span>
          </div>
          <GLPYInput
            label="Altura"
            unit="m"
            type="number"
            centerWithUnit
            value={alturaInput}
            onChange={setAlturaInput}
            placeholder="1,64"
          />
        </GLPYCard>

        {/* ── Card 3 — Dica ─────────────────────────────────────────────────── */}
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
            Corrija seus dados se precisar. Seus registros diários e histórico não serão apagados.
          </p>
        </GLPYCard>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={saveState !== 'idle'}
          onClick={handleSave}
        >
          {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Perfil salvo ✓' : 'Salvar perfil'}
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
