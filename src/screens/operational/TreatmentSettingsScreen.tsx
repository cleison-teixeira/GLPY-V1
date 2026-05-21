// GLPY — Treatment Settings Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela apenas registra informações informadas pelo usuário.
//
// O GLPY não recomenda frequência, dosagem, medicamento ou tratamento.
//
// Frequência personalizada existe apenas para registrar o intervalo informado
// pelo usuário, sem substituir orientação de profissional de saúde.
//
// Futuramente o TreatmentTrackingEngine poderá usar esses dados para lembretes
// e histórico, sem substituir orientação médica.

import React, { useState } from 'react';
import { Pill, CalendarDays, Droplets, Lightbulb, ChevronRight, Check } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton, GLPYInput } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TreatmentSettingsScreenProps {
  onBack?: () => void;
  mode?:   'onboarding' | 'edit';
  onSave?: (data: {
    medication:          string;
    frequency:           string;
    customFrequencyDays: string;
    dose:                string;
  }) => void;
}

import { GLPY_MEDICATION_OPTIONS } from '../../data/glpyMedicationOptions';

// Remove sufixo " mg" se presente, converte separador e formata com 2 casas decimais.
// Evita "2,5 mg mg" quando o valor salvo inclui a unidade.
function normalizeDose(raw: string | null): string {
  const clean = (raw ?? '').trim().replace(/\s*mg\s*/gi, '').trim();
  const n = parseFloat(clean.replace(',', '.'));
  if (isNaN(n) || n <= 0) return '';
  return n.toFixed(2).replace('.', ',');
}

// ── Data ─────────────────────────────────────────────────────────────────────
// MVP PLACEHOLDER — listas registráveis pelo usuário, sem recomendação clínica.

const MEDICATION_OPTIONS = GLPY_MEDICATION_OPTIONS;

const FREQUENCY_OPTIONS = [
  'Diária',
  'Semanal',
  'A cada 10 dias',
  'A cada 14 dias',
  'Mensal',
  'Personalizada',
  'Ainda não defini',
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

type TreatSaveState = 'idle' | 'saving' | 'saved';

export default function TreatmentSettingsScreen({ onBack, onSave, mode = 'edit' }: TreatmentSettingsScreenProps) {
  const [selectedMedication,  setSelectedMedication]  = useState(() => localStorage.getItem('glpy_medicamento') || 'Mounjaro®');
  const [selectedFrequency,   setSelectedFrequency]   = useState(() => localStorage.getItem('glpy_frequencia')  || 'Semanal');
  const [customFrequencyDays, setCustomFrequencyDays] = useState('7');
  const [dose,                setDose]                = useState(() => normalizeDose(localStorage.getItem('glpy_dose')) || '2,50');
  const [medModalOpen,        setMedModalOpen]        = useState(false);
  const [freqModalOpen,       setFreqModalOpen]       = useState(false);
  const [saveState,           setSaveState]           = useState<TreatSaveState>('idle');

  const normalizedDose = dose.trim().replace(',', '.');
  const doseNum        = parseFloat(normalizedDose);
  const isDoseValid    = dose.trim() !== '' && !isNaN(doseNum) && doseNum > 0;
  const doseWarning    = isDoseValid && doseNum > 30;

  const frequencyDisplayValue =
    selectedFrequency === 'Personalizada'
      ? `Personalizada · ${customFrequencyDays} dias`
      : selectedFrequency;

  function handleSelectMedication(med: string) {
    setSelectedMedication(med);
    setMedModalOpen(false);
  }

  function handleSelectFrequency(freq: string, days?: string) {
    setSelectedFrequency(freq);
    if (days !== undefined) setCustomFrequencyDays(days);
    setFreqModalOpen(false);
  }

  function handleDoseBlur() {
    const n = parseFloat(dose.replace(',', '.').replace(/[^0-9.]/g, ''));
    if (!isNaN(n) && n > 0) setDose(n.toFixed(2).replace('.', ','));
  }

  function handleSave() {
    if (saveState !== 'idle') return;

    // Normalizar dose antes de qualquer coisa (cobre o caso em que o usuário
    // digitou "5" sem dar blur — garante "5,00" no input e no onSave callback).
    const parsedDose = parseFloat((dose || '').replace(',', '.').replace(/[^0-9.]/g, ''));
    const doseNorm   = (!isNaN(parsedDose) && parsedDose > 0)
      ? parsedDose.toFixed(2).replace('.', ',')
      : dose;
    if (doseNorm !== dose) setDose(doseNorm);

    setSaveState('saving');

    // Salva diretamente no localStorage para garantir reatividade imediata na Home,
    // independente do callback onSave do componente pai (App.tsx ou main.tsx).
    localStorage.setItem('glpy_medicamento', selectedMedication);
    localStorage.setItem('glpy_frequencia',  selectedFrequency);
    if (selectedFrequency === 'Personalizada') {
      localStorage.setItem('glpy_frequencia_personalizada_dias', customFrequencyDays);
    }
    if (!isNaN(parsedDose) && parsedDose > 0) {
      localStorage.setItem('glpy_dose', String(parsedDose));
    }
    try {
      const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
      onb.medicamento = selectedMedication;
      onb.frequencia  = selectedFrequency;
      if (!isNaN(parsedDose) && parsedDose > 0) onb.dose = parsedDose;
      localStorage.setItem('glpy_onboarding', JSON.stringify(onb));
    } catch {}
    // Dispara evento reativo para que a Home re-leia os dados instantaneamente
    window.dispatchEvent(new Event('local-storage-change'));

    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => onSave?.({ medication: selectedMedication, frequency: selectedFrequency, customFrequencyDays, dose: doseNorm }), 900);
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

  const supportTextStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    color:        lightColors.text.secondary,
    lineHeight:   1.45,
    marginBottom: gap.small,
  };

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
        <GLPYHeader title="Configurações do Tratamento" onBack={onBack} />

        <div style={sectionGap}>

          {/* ── Card 1 — Medicamento ─────────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <Pill size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Medicamento</span>
            </div>
            <p style={supportTextStyle}>
              Escolha a caneta que você usa ou pretende usar.
            </p>
            <div
              style={selectorRowStyle}
              onClick={() => setMedModalOpen(true)}
              role="button"
              aria-haspopup="listbox"
            >
              <span style={selectorValueStyle}>{selectedMedication}</span>
              <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
            </div>
          </GLPYCard>

          {/* ── Card 2 — Frequência ───────────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <CalendarDays size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Frequência</span>
            </div>
            <p style={supportTextStyle}>
              Registre o intervalo entre suas aplicações.
            </p>
            <div
              style={selectorRowStyle}
              onClick={() => setFreqModalOpen(true)}
              role="button"
              aria-haspopup="listbox"
            >
              <span style={selectorValueStyle}>{frequencyDisplayValue}</span>
              <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
            </div>
          </GLPYCard>

          {/* ── Card 3 — Dose atual ───────────────────────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <Droplets size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Dose atual</span>
            </div>
            <p style={supportTextStyle}>
              Informe a dose que você já utiliza.
            </p>
            <GLPYInput
              value={dose}
              onChange={setDose}
              onBlur={handleDoseBlur}
              unit="mg"
              type="number"
              centerWithUnit
              placeholder="0"
            />
            {doseWarning && (
              <p style={{
                fontFamily:  fontFamily.primary,
                fontSize:    fontSize.small,
                color:       '#C05000',
                marginTop:   gap.small,
                lineHeight:  1.45,
              }}>
                ⚠️ Confira a dose informada. Doses acima de 30 mg não são habituais — certifique-se de que está correto com seu profissional de saúde.
              </p>
            )}
          </GLPYCard>

          {/* ── Card 4 — Dica GLPY ───────────────────────────────────────────── */}
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
              Registre apenas informações já orientadas pelo seu profissional de saúde.
              O GLPY usa esses dados para organizar sua jornada, lembretes e padrões de sintomas.
            </p>
          </GLPYCard>

          {/* ── CTA ──────────────────────────────────────────────────────────── */}
          <GLPYButton
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isDoseValid || doseWarning || saveState !== 'idle'}
            onClick={handleSave}
          >
            {saveState === 'saving' ? 'Salvando...'
              : saveState === 'saved' ? 'Tratamento salvo ✓'
              : mode === 'onboarding' ? 'Continuar'
              : 'Salvar tratamento'}
          </GLPYButton>

        </div>
      </GLPYScreen>

      {/* ── Bottom Sheet — Medicamento ───────────────────────────────────────── */}
      {medModalOpen && (
        <MedicationModal
          selected={selectedMedication}
          onSelect={handleSelectMedication}
          onClose={() => setMedModalOpen(false)}
        />
      )}

      {/* ── Bottom Sheet — Frequência ────────────────────────────────────────── */}
      {freqModalOpen && (
        <FrequencyModal
          selected={selectedFrequency}
          customDays={customFrequencyDays}
          onSelect={handleSelectFrequency}
          onClose={() => setFreqModalOpen(false)}
        />
      )}
    </>
  );
}

// ── Shared bottom sheet primitives ────────────────────────────────────────────

const sharedBackdropStyle: React.CSSProperties = {
  position:   'fixed',
  top:        0,
  left:       0,
  right:      0,
  bottom:     0,
  background: 'rgba(22,33,62,0.35)',
  zIndex:     100,
};

const sharedPanelStyle: React.CSSProperties = {
  position:      'fixed',
  bottom:        0,
  left:          '50%',
  transform:     'translateX(-50%)',
  width:         '100%',
  maxWidth:      430,
  maxHeight:     '80vh',
  borderRadius:  '24px 24px 0 0',
  background:    lightColors.background.card,
  boxShadow:     '0 -8px 40px rgba(0,0,0,0.12)',
  zIndex:        200,
  display:       'flex',
  flexDirection: 'column',
  overflow:      'hidden',
};

const sharedHandleBarStyle: React.CSSProperties = {
  width:        40,
  height:       4,
  borderRadius: 99,
  background:   lightColors.border.soft,
  margin:       '14px auto 0',
  flexShrink:   0,
};

const sharedSheetHeaderStyle: React.CSSProperties = {
  padding:    `16px ${padding.screen}px 12px`,
  flexShrink: 0,
};

const sharedSheetTitleStyle: React.CSSProperties = {
  fontFamily: fontFamily.primary,
  fontSize:   fontSize.bodyLarge,
  fontWeight: fontWeight.h2,
  color:      lightColors.text.navy,
  lineHeight: 1.2,
};

const sharedListStyle: React.CSSProperties = {
  overflowY:    'auto',
  flex:         1,
  paddingLeft:  padding.screen,
  paddingRight: padding.screen,
};

// ── MedicationModal ───────────────────────────────────────────────────────────

interface MedicationModalProps {
  selected: string;
  onSelect: (med: string) => void;
  onClose:  () => void;
}

function MedicationModal({ selected, onSelect, onClose }: MedicationModalProps) {
  const footerStyle: React.CSSProperties = {
    paddingLeft:   padding.screen,
    paddingRight:  padding.screen,
    paddingBottom: 28,
    flexShrink:    0,
  };

  const safetyStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.text.secondary,
    textAlign:  'center',
    lineHeight: 1.45,
    opacity:    0.72,
    paddingTop: gap.small,
  };

  return (
    <>
      <div style={sharedBackdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={sharedPanelStyle} role="listbox" aria-label="Selecionar medicamento">
        <div style={sharedHandleBarStyle} />
        <div style={sharedSheetHeaderStyle}>
          <span style={sharedSheetTitleStyle}>Selecionar medicamento</span>
        </div>
        <div style={sharedListStyle}>
          {MEDICATION_OPTIONS.map((med, i) => (
            <SheetRow
              key={med}
              label={med}
              selected={selected === med}
              isLast={i === MEDICATION_OPTIONS.length - 1}
              onSelect={() => onSelect(med)}
            />
          ))}
        </div>
        <div style={footerStyle}>
          <p style={safetyStyle}>
            Registre apenas o medicamento informado pelo seu profissional de saúde.
          </p>
        </div>
      </div>
    </>
  );
}

// ── FrequencyModal ────────────────────────────────────────────────────────────

interface FrequencyModalProps {
  selected:   string;
  customDays: string;
  onSelect:   (freq: string, days?: string) => void;
  onClose:    () => void;
}

function FrequencyModal({ selected, customDays, onSelect, onClose }: FrequencyModalProps) {
  const [pendingFreq, setPendingFreq] = useState(selected);
  const [pendingDays, setPendingDays] = useState(customDays);

  const isCustom           = pendingFreq === 'Personalizada';
  const normalizedDays     = pendingDays.trim().replace(',', '.');
  const daysNum            = parseFloat(normalizedDays);
  const isCustomDaysValid  = pendingDays.trim() !== '' && !isNaN(daysNum) && daysNum > 0;

  function handleRowSelect(freq: string) {
    if (freq === 'Personalizada') {
      setPendingFreq('Personalizada');
    } else {
      onSelect(freq);
    }
  }

  function handleConfirmCustom() {
    if (isCustomDaysValid) {
      onSelect('Personalizada', pendingDays.trim());
    }
  }

  const footerStyle: React.CSSProperties = {
    paddingLeft:   padding.screen,
    paddingRight:  padding.screen,
    paddingTop:    gap.medium,
    paddingBottom: 32,
    flexShrink:    0,
  };

  const customSectionStyle: React.CSSProperties = {
    paddingTop:    gap.medium,
    paddingBottom: gap.medium,
    borderTop:     `1px solid ${lightColors.border.soft}`,
  };

  const customLabelStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    fontWeight:   fontWeight.h3,
    color:        lightColors.text.secondary,
    display:      'block',
    marginBottom: gap.small,
  };

  const safetyBlockStyle: React.CSSProperties = {
    marginTop:    gap.medium,
    padding:      '10px 14px',
    borderRadius: 14,
    background:   lightColors.background.secondary,
    border:       `1px solid ${lightColors.border.soft}`,
  };

  const safetyStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    textAlign:  'center',
    lineHeight: 1.5,
  };

  return (
    <>
      <div style={sharedBackdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={sharedPanelStyle} role="listbox" aria-label="Selecionar frequência">
        <div style={sharedHandleBarStyle} />
        <div style={sharedSheetHeaderStyle}>
          <span style={sharedSheetTitleStyle}>Selecionar frequência</span>
        </div>
        <div style={sharedListStyle}>
          {FREQUENCY_OPTIONS.map((freq, i) => (
            <SheetRow
              key={freq}
              label={freq}
              selected={pendingFreq === freq}
              isLast={i === FREQUENCY_OPTIONS.length - 1}
              onSelect={() => handleRowSelect(freq)}
            />
          ))}
        </div>
        <div style={footerStyle}>
          {isCustom && (
            <div style={customSectionStyle}>
              <span style={customLabelStyle}>Intervalo entre aplicações</span>
              <GLPYInput
                value={pendingDays}
                onChange={setPendingDays}
                unit="dias"
                centerWithUnit
                placeholder="7"
              />
              <div style={{ marginTop: gap.medium }}>
                <GLPYButton
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={!isCustomDaysValid}
                  onClick={handleConfirmCustom}
                >
                  Confirmar frequência
                </GLPYButton>
              </div>
            </div>
          )}
          <div style={safetyBlockStyle}>
            <p style={safetyStyle}>
              Use apenas o intervalo orientado pelo seu profissional de saúde.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── SheetRow (shared bottom sheet row) ───────────────────────────────────────

interface SheetRowProps {
  label:    string;
  selected: boolean;
  isLast:   boolean;
  onSelect: () => void;
}

function SheetRow({ label, selected, isLast, onSelect }: SheetRowProps) {
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
