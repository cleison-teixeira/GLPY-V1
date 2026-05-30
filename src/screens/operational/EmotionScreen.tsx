// GLPY — Emotion Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela apenas registra emoções informadas pelo usuário.
// O GLPY não diagnostica, trata ou substitui acompanhamento psicológico, psiquiátrico ou médico.
//
// Futuramente esta tela poderá ser conectada à GLPY IA para identificar padrões entre
// emoção, alimentação, aplicação, sintomas, sono e evolução.

import React, { useState } from 'react';
import { Smile, Zap, PenLine, Lightbulb, ChevronRight, Check } from 'lucide-react';
import { glpyStore } from '../../data/glpyStore';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Data ─────────────────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  'Bem',
  'Calma',
  'Ansiosa',
  'Cansada',
  'Irritada',
  'Triste',
  'Confiante',
  'Desmotivada',
] as const;

type Mood   = typeof MOOD_OPTIONS[number];
type Energy = 'Baixa' | 'Média' | 'Alta';

const ENERGY_OPTIONS: Energy[] = ['Baixa', 'Média', 'Alta'];

// ── Props ─────────────────────────────────────────────────────────────────────

interface EmotionScreenProps {
  onBack?: () => void;
  onSave?: (data: { mood: string; energy: string; note: string }) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmotionScreen({ onBack, onSave }: EmotionScreenProps) {
  const [selectedMood, setSelectedMood] = useState<Mood>('Bem');
  const [selectedEnergy, setSelectedEnergy] = useState<Energy>('Média');
  const [note, setNote] = useState('');
  const [moodModalOpen, setMoodModalOpen] = useState(false);

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  function handleSave() {
    if (saveState !== 'idle') return;
    const snapshot = { mood: selectedMood, energy: selectedEnergy, note };
    setSaveState('saving');
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => {
        setSelectedMood('Bem');
        setSelectedEnergy('Média');
        setNote('');
        setSaveState('idle');
        onSave?.(snapshot);
      }, 900);
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

  // compact selector row — same pattern as TreatmentSettingsScreen / SideEffectsScreen
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

  const selectorValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.h3,
    fontWeight: '600',
    color:      lightColors.text.navy,
    lineHeight: 1,
  };

  // energy row
  const energyRowStyle: React.CSSProperties = {
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
        <GLPYHeader title="Emoção" onBack={onBack} />

        <div style={sectionGap}>

          {/* ── Card 1 — Como você está se sentindo? ────────────────────────── */}
          <GLPYCard variant="light">
            <p style={heroHeadlineStyle}>
              Como você está se sentindo hoje?
            </p>
            <p style={heroSubtextStyle}>
              Registre sua emoção para acompanhar padrões entre alimentação, aplicação, sono e evolução.
            </p>
          </GLPYCard>

          {/* ── Card 2 — Humor principal ─────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <Smile size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Humor principal</span>
            </div>
            <div
              style={selectorRowStyle}
              onClick={() => setMoodModalOpen(true)}
              role="button"
              aria-haspopup="listbox"
            >
              <span style={selectorValueStyle}>{selectedMood}</span>
              <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
            </div>
          </GLPYCard>

          {/* ── Card 3 — Energia emocional ───────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <Zap size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Energia emocional</span>
            </div>
            <div style={energyRowStyle}>
              {ENERGY_OPTIONS.map(level => (
                <EnergyChip
                  key={level}
                  label={level}
                  selected={selectedEnergy === level}
                  onSelect={() => setSelectedEnergy(level)}
                />
              ))}
            </div>
          </GLPYCard>

          {/* ── Card 4 — Observação ──────────────────────────────────────────── */}
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
              placeholder="Ex: hoje acordei mais sensível, mas consegui manter minha rotina."
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

          {/* ── Card 5 — Dica GLPY ───────────────────────────────────────────── */}
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
              Registrar suas emoções ajuda a GLPY IA a entender como sua jornada metabólica
              se conecta com energia, fome, sintomas e consistência.
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
            {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Emoção salva ✓' : 'Salvar emoção'}
          </GLPYButton>

        </div>
      </GLPYScreen>

      {/* ── Bottom Sheet — Humor ─────────────────────────────────────────────── */}
      {moodModalOpen && (
        <MoodModal
          selected={selectedMood}
          onSelect={mood => { setSelectedMood(mood); setMoodModalOpen(false); }}
          onClose={() => setMoodModalOpen(false)}
        />
      )}
    </>
  );
}

// ── EnergyChip (local) — single-select ────────────────────────────────────────

interface EnergyChipProps {
  label:    string;
  selected: boolean;
  onSelect: () => void;
}

function EnergyChip({ label, selected, onSelect }: EnergyChipProps) {
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

// ── MoodModal (bottom sheet — single-select) ──────────────────────────────────

interface MoodModalProps {
  selected: Mood;
  onSelect: (mood: Mood) => void;
  onClose:  () => void;
}

function MoodModal({ selected, onSelect, onClose }: MoodModalProps) {
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
    paddingTop:    gap.small,
    paddingBottom: 28,
    flexShrink:    0,
    borderTop:     `1px solid ${lightColors.border.soft}`,
  };

  const safetyBlockStyle: React.CSSProperties = {
    background:   lightColors.background.secondary,
    border:       `1px solid ${lightColors.border.soft}`,
    borderRadius: 14,
    padding:      '10px 14px',
    fontFamily:   fontFamily.primary,
    fontSize:      12,
    color:        lightColors.text.secondary,
    textAlign:    'center',
    lineHeight:   1.5,
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={panelStyle} role="listbox" aria-label="Selecionar humor">
        <div style={handleBarStyle} />
        <div style={sheetHeaderStyle}>
          <span style={sheetTitleStyle}>Selecionar humor</span>
        </div>
        <div style={listStyle}>
          {MOOD_OPTIONS.map((mood, i) => (
            <MoodRow
              key={mood}
              label={mood}
              selected={selected === mood}
              isLast={i === MOOD_OPTIONS.length - 1}
              onSelect={() => onSelect(mood)}
            />
          ))}
        </div>
        <div style={footerStyle}>
          <div style={safetyBlockStyle}>
            Registre apenas como você está se sentindo de verdade. O GLPY não diagnostica nem substitui acompanhamento psicológico ou médico.
          </div>
        </div>
      </div>
    </>
  );
}

// ── MoodRow (bottom sheet row — single-select) ────────────────────────────────

interface MoodRowProps {
  label:    string;
  selected: boolean;
  isLast:   boolean;
  onSelect: () => void;
}

function MoodRow({ label, selected, isLast, onSelect }: MoodRowProps) {
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
      onClick={onSelect}
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
