// GLPY — Activity Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela apenas registra informações informadas pelo usuário.
// No MVP, calorias são uma estimativa simples calculada localmente.
// O GLPY não substitui orientação profissional de atividade física.
// Futuramente esta tela poderá ser conectada ao ActivityTrackingEngine
// para cálculo mais preciso, histórico, metas, padrões e integração com GLPY IA.

import React, { useState } from 'react';
import {
  Flame, Zap, PenLine, Lightbulb, ChevronRight, Check,
  Footprints, Wind, Dumbbell, Bike, Waves, Leaf,
  MoveVertical, Layers, Music, Mountain, RotateCw, Activity,
} from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton, GLPYInput } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ActivityScreenProps {
  onBack?: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  { id: 'caminhada',   label: 'Caminhada',   Icon: Footprints   },
  { id: 'corrida',     label: 'Corrida',     Icon: Wind         },
  { id: 'musculacao',  label: 'Musculação',  Icon: Dumbbell     },
  { id: 'ciclismo',    label: 'Ciclismo',    Icon: Bike         },
  { id: 'natacao',     label: 'Natação',     Icon: Waves        },
  { id: 'yoga',        label: 'Yoga',        Icon: Leaf         },
  { id: 'alongamento', label: 'Alongamento', Icon: MoveVertical },
  { id: 'pilates',     label: 'Pilates',     Icon: Layers       },
  { id: 'danca',       label: 'Dança',       Icon: Music        },
  { id: 'trilha',      label: 'Trilha',      Icon: Mountain     },
  { id: 'eliptico',    label: 'Elíptico',    Icon: RotateCw     },
  { id: 'outro',       label: 'Outro',       Icon: Activity     },
] as const;

const DURATION_PRESETS = ['10', '20', '30', '45', '60'] as const;

const INTENSITY_OPTIONS = ['Leve', 'Moderada', 'Intensa'] as const;

// cálculo mockado para MVP, será refinado futuramente
const INTENSITY_MULTIPLIER: Record<string, number> = {
  'Leve':     3,
  'Moderada': 4,
  'Intensa':  6,
};

function calculateCalories(duration: string, intensity: string): number {
  const d = parseFloat(duration) || 0;
  return Math.round(d * (INTENSITY_MULTIPLIER[intensity] ?? 4));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ActivityScreen({ onBack }: ActivityScreenProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedActivity,   setSelectedActivity]   = useState('caminhada');
  const [activityModalOpen,  setActivityModalOpen]  = useState(false);

  const [selectedDuration,   setSelectedDuration]   = useState('30');
  const [durationModalOpen,  setDurationModalOpen]  = useState(false);
  const [showCustomInput,    setShowCustomInput]     = useState(false);
  const [customDuration,     setCustomDuration]      = useState('30');

  const [selectedIntensity,  setSelectedIntensity]  = useState('Moderada');
  const [intensityModalOpen, setIntensityModalOpen] = useState(false);

  const [note, setNote] = useState('');

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedActivityLabel =
    ACTIVITY_OPTIONS.find(a => a.id === selectedActivity)?.label ?? '';

  const calculatedCalories = calculateCalories(selectedDuration, selectedIntensity);

  const isPresetDuration = (DURATION_PRESETS as readonly string[]).includes(selectedDuration);

  const isValid =
    selectedActivity !== '' &&
    parseFloat(selectedDuration) > 0 &&
    selectedIntensity !== '';

  // ── Handlers ───────────────────────────────────────────────────────────────
  function openDurationModal() {
    setCustomDuration(selectedDuration);
    setShowCustomInput(!isPresetDuration);
    setDurationModalOpen(true);
  }

  function closeDurationModal() {
    setDurationModalOpen(false);
    setShowCustomInput(false);
  }

  function handleSave() {
    console.log('[GLPY] Activity saved:', {
      selectedActivity,
      selectedDuration,
      selectedIntensity,
      calculatedCalories,
      note,
    });
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

  const cardSubtextStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    color:        lightColors.text.secondary,
    lineHeight:   1.5,
    marginBottom: 0,
  };

  // ── Summary block (Card 1) ────────────────────────────────────────────────

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

  // ── Compact selector row (shared) ─────────────────────────────────────────

  const selectorRowStyle: React.CSSProperties = {
    height:         56,
    borderRadius:   radius.input,
    border:         `1.5px solid ${lightColors.border.soft}`,
    background:     lightColors.background.primary,
    boxShadow:      lightShadows.soft,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 16px 0 20px',
    cursor:         'pointer',
    transition:     transition.default,
    marginTop:      4,
  };

  const selectorValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  // ── Bottom sheet (shared) ─────────────────────────────────────────────────

  const backdropStyle: React.CSSProperties = {
    position:   'fixed',
    inset:      0,
    background: 'rgba(0,0,0,0.30)',
    zIndex:     99,
  };

  const sheetStyle: React.CSSProperties = {
    position:      'fixed',
    bottom:        0,
    left:          '50%',
    transform:     'translateX(-50%)',
    width:         '100%',
    maxWidth:      430,
    maxHeight:     '78vh',
    background:    lightColors.background.primary,
    borderRadius:  '24px 24px 0 0',
    boxShadow:     '0 -8px 32px rgba(0,0,0,0.12)',
    zIndex:        100,
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  };

  const sheetHandleStyle: React.CSSProperties = {
    width:        36,
    height:       4,
    borderRadius: 2,
    background:   lightColors.background.secondary,
    margin:       '14px auto 0',
    flexShrink:   0,
  };

  const sheetHeaderStyle: React.CSSProperties = {
    padding:      '14px 20px 12px',
    flexShrink:   0,
    borderBottom: `1px solid ${lightColors.border.soft}`,
  };

  const sheetTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h2,
    color:      lightColors.text.navy,
  };

  const listStyle: React.CSSProperties = {
    flex:      1,
    overflowY: 'auto',
    padding:   '8px 12px 24px',
  };

  function sheetRowStyle(selected: boolean): React.CSSProperties {
    return {
      display:      'flex',
      alignItems:   'center',
      gap:          12,
      padding:      '13px 12px',
      borderRadius: 14,
      border:       selected
        ? `1px solid ${lightColors.brand.green}44`
        : '1px solid transparent',
      background:   selected ? `${lightColors.brand.green}10` : 'transparent',
      cursor:       'pointer',
      transition:   transition.default,
      marginBottom: 2,
    };
  }

  function sheetRowLabelStyle(selected: boolean): React.CSSProperties {
    return {
      flex:       1,
      fontFamily: fontFamily.primary,
      fontSize:   fontSize.small,
      fontWeight: selected ? '700' : '500',
      color:      selected ? lightColors.brand.greenDark : lightColors.text.navy,
    };
  }

  // ── Dica ──────────────────────────────────────────────────────────────────

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
      <GLPYHeader title="Atividade" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Card 1 — Movimento de hoje (summary dinâmico) ──────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Flame size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Movimento de hoje</span>
          </div>
          <div style={summaryBlockStyle}>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Hoje</span>
              <span style={summaryValueStyle}>{selectedDuration} min</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Intensidade</span>
              <span style={summaryValueStyle}>{selectedIntensity}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Estimativa</span>
              <span style={summaryValueStyle}>{calculatedCalories} kcal</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Card 2 — Tipo de atividade ────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Activity size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Tipo de atividade</span>
          </div>
          <p style={cardSubtextStyle}>Escolha o movimento que você realizou hoje.</p>
          <div
            style={selectorRowStyle}
            onClick={() => setActivityModalOpen(true)}
            role="button"
            aria-label="Selecionar tipo de atividade"
          >
            <span style={selectorValueStyle}>{selectedActivityLabel}</span>
            <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
          </div>
        </GLPYCard>

        {/* ── Card 3 — Duração ──────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Zap size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Duração</span>
          </div>
          <p style={cardSubtextStyle}>Informe quanto tempo você se movimentou.</p>
          <div
            style={selectorRowStyle}
            onClick={openDurationModal}
            role="button"
            aria-label="Selecionar duração"
          >
            <span style={selectorValueStyle}>{selectedDuration} min</span>
            <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
          </div>
        </GLPYCard>

        {/* ── Card 4 — Intensidade ──────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Flame size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Intensidade</span>
          </div>
          <p style={cardSubtextStyle}>Como foi o esforço dessa atividade?</p>
          <div
            style={selectorRowStyle}
            onClick={() => setIntensityModalOpen(true)}
            role="button"
            aria-label="Selecionar intensidade"
          >
            <span style={selectorValueStyle}>{selectedIntensity}</span>
            <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
          </div>
        </GLPYCard>

        {/* ── Card 5 — Registro adicional ───────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <PenLine size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Registro adicional</span>
          </div>

          {/* Estimativa de calorias */}
          <div style={{ ...summaryBlockStyle, marginBottom: gap.small }}>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Calorias estimadas</span>
              <span style={summaryValueStyle}>{calculatedCalories} kcal</span>
            </div>
          </div>

          {/* Observação opcional */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{
              fontFamily:    fontFamily.primary,
              fontSize:      fontSize.small,
              fontWeight:    '600',
              color:         lightColors.text.secondary,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}>
              Observação
            </span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex: caminhei no fim da tarde e me senti com mais energia."
              style={{
                width:       '100%',
                minHeight:   88,
                borderRadius: radius.input,
                border:      `1.5px solid ${lightColors.border.soft}`,
                background:  lightColors.background.primary,
                fontFamily:  fontFamily.primary,
                fontSize:    fontSize.small,
                color:       lightColors.text.navy,
                padding:     '14px 16px',
                outline:     'none',
                resize:      'none',
                lineHeight:  1.5,
                boxShadow:   lightShadows.soft,
                boxSizing:   'border-box',
              }}
            />
          </div>
        </GLPYCard>

        {/* ── Card 6 — Dica GLPY ────────────────────────────────────────────── */}
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
            Registrar movimento ajuda a GLPY IA a entender como sua energia, fome, sintomas e evolução respondem à sua rotina.
          </p>
        </GLPYCard>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          onClick={handleSave}
        >
          Registrar atividade
        </GLPYButton>

      </div>

      {/* ── Activity Modal ────────────────────────────────────────────────────── */}
      {activityModalOpen && (
        <>
          <div style={backdropStyle} onClick={() => setActivityModalOpen(false)} />
          <div style={sheetStyle}>
            <div style={sheetHandleStyle} />
            <div style={sheetHeaderStyle}>
              <span style={sheetTitleStyle}>Selecionar atividade</span>
            </div>
            <div style={listStyle}>
              {ACTIVITY_OPTIONS.map(({ id, label, Icon }) => {
                const selected = selectedActivity === id;
                return (
                  <div
                    key={id}
                    style={sheetRowStyle(selected)}
                    onClick={() => { setSelectedActivity(id); setActivityModalOpen(false); }}
                    role="button"
                    aria-label={label}
                    aria-pressed={selected}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      color={selected ? lightColors.brand.greenDark : lightColors.text.secondary}
                    />
                    <span style={sheetRowLabelStyle(selected)}>{label}</span>
                    {selected && (
                      <Check size={16} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Duration Modal ────────────────────────────────────────────────────── */}
      {durationModalOpen && (
        <>
          <div style={backdropStyle} onClick={closeDurationModal} />
          <div style={sheetStyle}>
            <div style={sheetHandleStyle} />
            <div style={sheetHeaderStyle}>
              <span style={sheetTitleStyle}>Selecionar duração</span>
            </div>
            <div style={listStyle}>

              {/* Presets */}
              {DURATION_PRESETS.map(d => {
                const selected = selectedDuration === d && !showCustomInput;
                return (
                  <div
                    key={d}
                    style={sheetRowStyle(selected)}
                    onClick={() => { setSelectedDuration(d); setShowCustomInput(false); closeDurationModal(); }}
                    role="button"
                    aria-label={`${d} minutos`}
                    aria-pressed={selected}
                  >
                    <span style={sheetRowLabelStyle(selected)}>{d} min</span>
                    {selected && (
                      <Check size={16} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                    )}
                  </div>
                );
              })}

              {/* Personalizada */}
              <div
                style={sheetRowStyle(showCustomInput || (!isPresetDuration && !showCustomInput))}
                onClick={() => { setShowCustomInput(true); }}
                role="button"
                aria-label="Duração personalizada"
              >
                <span style={sheetRowLabelStyle(showCustomInput || !isPresetDuration)}>
                  Personalizada
                </span>
                {(!isPresetDuration && !showCustomInput) && (
                  <Check size={16} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                )}
              </div>

              {/* Custom input — aparece ao selecionar Personalizada */}
              {showCustomInput && (
                <div style={{ padding: '12px 4px 4px', display: 'flex', flexDirection: 'column', gap: gap.small }}>
                  <GLPYInput
                    label="Duração personalizada"
                    value={customDuration}
                    onChange={setCustomDuration}
                    unit="min"
                    centerWithUnit
                    type="number"
                    autoFocus
                  />
                  <GLPYButton
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={!(parseFloat(customDuration) > 0)}
                    onClick={() => {
                      setSelectedDuration(customDuration);
                      closeDurationModal();
                    }}
                  >
                    Confirmar duração
                  </GLPYButton>
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* ── Intensity Modal ───────────────────────────────────────────────────── */}
      {intensityModalOpen && (
        <>
          <div style={backdropStyle} onClick={() => setIntensityModalOpen(false)} />
          <div style={{ ...sheetStyle, maxHeight: 'auto' }}>
            <div style={sheetHandleStyle} />
            <div style={sheetHeaderStyle}>
              <span style={sheetTitleStyle}>Selecionar intensidade</span>
            </div>
            <div style={{ ...listStyle, flex: 'none' }}>
              {INTENSITY_OPTIONS.map(opt => {
                const selected = selectedIntensity === opt;
                return (
                  <div
                    key={opt}
                    style={sheetRowStyle(selected)}
                    onClick={() => { setSelectedIntensity(opt); setIntensityModalOpen(false); }}
                    role="button"
                    aria-label={opt}
                    aria-pressed={selected}
                  >
                    <span style={sheetRowLabelStyle(selected)}>{opt}</span>
                    {selected && (
                      <Check size={16} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </GLPYScreen>
  );
}
