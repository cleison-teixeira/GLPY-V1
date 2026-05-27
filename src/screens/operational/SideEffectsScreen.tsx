// GLPY — Side Effects Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela apenas registra sintomas informados pelo usuário.
// O GLPY não diagnostica, trata ou substitui orientação médica.
//
// Futuramente esta tela será conectada ao TreatmentTrackingEngine e à GLPY IA
// para identificar padrões entre dose, sintomas, hidratação, alimentação e evolução.

import React, { useState, useEffect } from 'react';
import { HeartPulse, Gauge, PenLine, Lightbulb, ChevronRight, Check } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { glpyStore } from '../../data/glpyStore';
import { glpyBlackBox } from '../../data/glpyBlackBox';
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from '../../data/glpyEventCatalog';
import { getLocalDateKey } from '../../utils/formatters';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Types ─────────────────────────────────────────────────────────────────────

type Intensity = 'Leve' | 'Moderada' | 'Forte';

interface SideEffectsScreenProps {
  onBack?: () => void;
  onSave?: (data: { symptoms: string[]; intensity: string; note: string }) => void;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const SYMPTOM_OPTIONS = [
  'Náusea',
  'Constipação',
  'Refluxo',
  'Fadiga',
  'Dor no local',
  'Dor de cabeça',
  'Boca seca',
  'Tontura',
  'Diarreia',
  'Baixo apetite',
  'Compulsão',
  'Ansiedade',
  'Queda de cabelo',
  'Nenhum sintoma',
] as const;

const INTENSITY_OPTIONS: Intensity[] = ['Leve', 'Moderada', 'Forte'];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SideEffectsScreen({ onBack, onSave }: SideEffectsScreenProps) {
  const fromInjection = new URLSearchParams(window.location.search).get('from') === 'injection';
  const resetMode     = new URLSearchParams(window.location.search).get('reset') === 'true';

  const [selectedSymptoms,  setSelectedSymptoms]  = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity | ''>(() => resetMode ? '' : 'Leve');
  const [note,              setNote]              = useState('');
  const [modalOpen,         setModalOpen]         = useState(false);
  const [saved,             setSaved]             = useState(false);

  // Load today's saved record on mount — skip in reset mode (new registration)
  useEffect(() => {
    if (resetMode) return;
    try {
      const rec = glpyStore.treatment.getEfeitosHoje();
      if (!rec) return;
      if (rec.date !== getLocalDateKey()) return; // stale — different day
      if (Array.isArray(rec.symptoms))       setSelectedSymptoms(rec.symptoms);
      if (rec.intensity)                     setSelectedIntensity(rec.intensity as Intensity);
      if (typeof rec.note === 'string')      setNote(rec.note);
    } catch {}
  }, []);

  const canSave = selectedIntensity !== '';

  const symptomsDisplayValue =
    selectedSymptoms.length === 0 ? null :
    selectedSymptoms.length === 1 ? selectedSymptoms[0] :
    selectedSymptoms.length === 2 ? selectedSymptoms.join(' · ') :
    `${selectedSymptoms.length} sintomas selecionados`;

  function handleConfirmSymptoms(symptoms: string[]) {
    setSelectedSymptoms(symptoms);
    setModalOpen(false);
  }

  function handleSave() {
    const today = getLocalDateKey();
    const record = {
      date:      today,
      symptoms:  selectedSymptoms,
      intensity: selectedIntensity,
      note,
      savedAt:   new Date().toISOString(),
    };

    // Persist today's record
    glpyStore.treatment.saveEfeitosHoje(record);

    glpyBlackBox.addEvent({
      type: EVENT_TYPES.SIDE_EFFECT_LOGGED, category: CATEGORIES.SIDE_EFFECTS, domain: DOMAINS.TREATMENT,
      signal: SIGNALS.SIDE_EFFECT_AFTER_INJECTION, screen: 'SideEffectsScreen', source: 'manual',
      payload: { symptomKeys: selectedSymptoms, count: selectedSymptoms.length, intensity: selectedIntensity },
    });
    // Upsert history — replace entry for today if already exists, no duplicates
    try {
      const history = glpyStore.treatment.getEfeitosHistorico();
      const withoutToday = Array.isArray(history) ? history.filter((e: any) => e.date !== today) : [];
      withoutToday.push({ id: `effects_${today}_${Date.now()}`, ...record });
      glpyStore.treatment.saveEfeitosHistorico(withoutToday);
    } catch {}

    // Notify other components that listen to local-storage-change
    window.dispatchEvent(new Event('local-storage-change'));

    // Feedback + navigate back after short delay
    setSaved(true);
    onSave?.({ symptoms: selectedSymptoms, intensity: selectedIntensity, note });
    setTimeout(() => {
      if (fromInjection) {
        window.location.href = '/preview/injection';
      } else if (typeof onBack === 'function') {
        onBack();
      } else {
        window.history.back();
      }
    }, 800);
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

  // card 1 — hero
  const heroHeadlineStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.h3,
    fontWeight:   fontWeight.h1,
    color:        lightColors.text.navy,
    lineHeight:   1.3,
    marginBottom: gap.small,
  };

  const heroSubtextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    lineHeight: 1.5,
  };

  // compact selector row — same pattern as TreatmentSettingsScreen
  const selectorRowStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    height:         56,
    borderRadius:   radius.input,
    border:         `1.5px solid ${lightColors.border.soft}`,
    background:     lightColors.background.primary,
    boxShadow:      lightShadows.soft,
    paddingLeft:    20,
    paddingRight:   20,
    cursor:         'pointer',
    transition:     transition.default,
  };

  const selectorValueBaseStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.h3,
    fontWeight: '600',
    lineHeight: 1,
  };

  // intensity row
  const intensityRowStyle: React.CSSProperties = {
    display: 'flex',
    gap:     gap.small,
  };

  // observation textarea
  const textareaStyle: React.CSSProperties = {
    width:        '100%',
    minHeight:    80,
    borderRadius: radius.input,
    border:       `1.5px solid ${lightColors.border.soft}`,
    background:   lightColors.background.primary,
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.bodyDefault,
    color:        lightColors.text.navy,
    padding:      `${padding.small}px 16px`,
    outline:      'none',
    resize:       'none',
    boxShadow:    lightShadows.soft,
    lineHeight:   1.5,
    boxSizing:    'border-box',
    transition:   transition.default,
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
    <>
      <GLPYScreen variant="light">
        <GLPYHeader title="Efeitos após aplicação" onBack={fromInjection ? () => { window.location.href = '/preview/injection'; } : onBack} />

        <div style={sectionGap}>

          {/* ── Card 1 — Como você se sentiu? ───────────────────────────────── */}
          <GLPYCard variant="light">
            <p style={heroHeadlineStyle}>
              Como você se sentiu depois da aplicação?
            </p>
            <p style={heroSubtextStyle}>
              Registre sintomas ou desconfortos para acompanhar seus padrões ao longo da jornada.
            </p>
          </GLPYCard>

          {/* ── Card 2 — Sintomas ───────────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <HeartPulse size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Sintomas</span>
            </div>
            <div
              style={selectorRowStyle}
              onClick={() => setModalOpen(true)}
              role="button"
              aria-haspopup="listbox"
            >
              <span style={{
                ...selectorValueBaseStyle,
                color: symptomsDisplayValue
                  ? lightColors.text.navy
                  : lightColors.text.secondary,
              }}>
                {symptomsDisplayValue ?? 'Selecionar sintomas'}
              </span>
              <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
            </div>
          </GLPYCard>

          {/* ── Card 3 — Intensidade ────────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <Gauge size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Intensidade geral</span>
            </div>
            <div style={intensityRowStyle}>
              {INTENSITY_OPTIONS.map(level => (
                <IntensityChip
                  key={level}
                  label={level}
                  selected={selectedIntensity === level}
                  onSelect={() => setSelectedIntensity(level)}
                />
              ))}
            </div>
          </GLPYCard>

          {/* ── Card 4 — Observação ─────────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <PenLine size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Observação</span>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex: senti náusea leve pela manhã, melhorou após me hidratar."
              style={textareaStyle}
              onFocus={e => {
                e.target.style.border    = `2px solid ${lightColors.brand.green}`;
                e.target.style.boxShadow = `0 0 0 3px rgba(106,210,143,0.18)`;
              }}
              onBlur={e => {
                e.target.style.border    = `1.5px solid ${lightColors.border.soft}`;
                e.target.style.boxShadow = lightShadows.soft;
              }}
            />
          </GLPYCard>

          {/* ── Card 5 — Dica GLPY ──────────────────────────────────────────── */}
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
              Registrar sintomas ajuda a GLPY IA a identificar padrões entre aplicação,
              alimentação, hidratação e evolução. Isso não substitui orientação de um
              profissional de saúde.
            </p>
          </GLPYCard>

          {/* ── CTA ─────────────────────────────────────────────────────────── */}
          <GLPYButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canSave}
            onClick={handleSave}
          >
            {saved ? 'Registrado!' : 'Salvar registro'}
          </GLPYButton>

        </div>
      </GLPYScreen>

      {/* ── Bottom Sheet — Sintomas ──────────────────────────────────────────── */}
      {modalOpen && (
        <SymptomModal
          selected={selectedSymptoms}
          onConfirm={handleConfirmSymptoms}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ── IntensityChip (local) — single-select ────────────────────────────────────

interface IntensityChipProps {
  label:    string;
  selected: boolean;
  onSelect: () => void;
}

function IntensityChip({ label, selected, onSelect }: IntensityChipProps) {
  const chipStyle: React.CSSProperties = {
    flex:         1,
    borderRadius: radius.secondary,
    padding:      '12px 8px',
    cursor:       'pointer',
    transition:   transition.default,
    textAlign:    'center',
    background:   selected ? `${lightColors.brand.green}14` : lightColors.background.card,
    border:       selected
      ? `2px solid ${lightColors.brand.green}`
      : `1.5px solid ${lightColors.border.soft}`,
    boxShadow:    selected ? `0 0 0 3px ${lightColors.brand.green}18` : lightShadows.soft,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      selected ? lightColors.text.navy : lightColors.text.secondary,
    transition: transition.default,
    lineHeight: 1,
  };

  return (
    <div style={chipStyle} onClick={onSelect} role="button" aria-pressed={selected}>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}

// ── SymptomModal (bottom sheet — multi-select) ───────────────────────────────

interface SymptomModalProps {
  selected:  string[];
  onConfirm: (symptoms: string[]) => void;
  onClose:   () => void;
}

function SymptomModal({ selected, onConfirm, onClose }: SymptomModalProps) {
  const [pending, setPending] = useState<string[]>(selected);

  function togglePending(symptom: string) {
    if (symptom === 'Nenhum sintoma') {
      setPending(['Nenhum sintoma']);
    } else {
      setPending(prev => {
        const withoutNone = prev.filter(s => s !== 'Nenhum sintoma');
        return withoutNone.includes(symptom)
          ? withoutNone.filter(s => s !== symptom)
          : [...withoutNone, symptom];
      });
    }
  }

  const backdropStyle: React.CSSProperties = {
    position:   'fixed',
    top:        0,
    left:       0,
    right:      0,
    bottom:     0,
    background: 'rgba(22,33,62,0.35)',
    zIndex:     100,
  };

  const panelStyle: React.CSSProperties = {
    position:      'fixed',
    bottom:        0,
    left:          '50%',
    transform:     'translateX(-50%)',
    width:         '100%',
    maxWidth:      430,
    maxHeight:     '78vh',
    borderRadius:  '24px 24px 0 0',
    background:    lightColors.background.card,
    boxShadow:     '0 -8px 40px rgba(0,0,0,0.12)',
    zIndex:        200,
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  };

  const handleBarStyle: React.CSSProperties = {
    width:        40,
    height:       4,
    borderRadius: 99,
    background:   lightColors.border.soft,
    margin:       '14px auto 0',
    flexShrink:   0,
  };

  const sheetHeaderStyle: React.CSSProperties = {
    padding:    `16px ${padding.screen}px 12px`,
    flexShrink: 0,
  };

  const sheetTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyLarge,
    fontWeight: fontWeight.h2,
    color:      lightColors.text.navy,
    lineHeight: 1.2,
  };

  const listStyle: React.CSSProperties = {
    overflowY:     'auto',
    flex:          1,
    paddingLeft:   padding.screen,
    paddingRight:  padding.screen,
    paddingBottom: 24,
  };

  const footerStyle: React.CSSProperties = {
    paddingLeft:   padding.screen,
    paddingRight:  padding.screen,
    paddingTop:    gap.medium,
    paddingBottom: 32,
    flexShrink:    0,
    borderTop:     `1px solid ${lightColors.border.soft}`,
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={panelStyle} role="listbox" aria-multiselectable="true" aria-label="Selecionar sintomas">
        <div style={handleBarStyle} />
        <div style={sheetHeaderStyle}>
          <span style={sheetTitleStyle}>Selecionar sintomas</span>
        </div>
        <div style={listStyle}>
          {SYMPTOM_OPTIONS.map((symptom, i) => (
            <SymptomModalRow
              key={symptom}
              label={symptom}
              selected={pending.includes(symptom)}
              isLast={i === SYMPTOM_OPTIONS.length - 1}
              onToggle={() => togglePending(symptom)}
            />
          ))}
        </div>
        <div style={footerStyle}>
          <GLPYButton
            variant="primary"
            size="md"
            fullWidth
            onClick={() => onConfirm(pending)}
          >
            Confirmar sintomas
          </GLPYButton>
        </div>
      </div>
    </>
  );
}

// ── SymptomModalRow (bottom sheet row — multi-select) ─────────────────────────

interface SymptomModalRowProps {
  label:    string;
  selected: boolean;
  isLast:   boolean;
  onToggle: () => void;
}

function SymptomModalRow({ label, selected, isLast, onToggle }: SymptomModalRowProps) {
  const rowStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingTop:     15,
    paddingBottom:  15,
    borderBottom:   isLast ? 'none' : `1px solid ${lightColors.border.soft}`,
    cursor:         'pointer',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: selected ? fontWeight.h3 : '400',
    color:      selected ? lightColors.brand.greenDark : lightColors.text.navy,
    transition: transition.default,
  };

  return (
    <div
      style={rowStyle}
      onClick={onToggle}
      role="option"
      aria-selected={selected}
    >
      <span style={labelStyle}>{label}</span>
      {selected && (
        <Check size={18} color={lightColors.brand.greenDark} strokeWidth={2.5} />
      )}
    </div>
  );
}
