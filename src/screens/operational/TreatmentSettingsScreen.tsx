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
    treatmentStartDate:   string | null;
    applicationWeekday:   string | null;
    applicationMonthDay:  number | null;
  }) => void;
}

import { GLPY_MEDICATION_OPTIONS } from '../../data/glpyMedicationOptions';
import { glpyStore } from '../../data/glpyStore';
import { glpyBlackBox } from '../../data/glpyBlackBox';
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from '../../data/glpyEventCatalog';

// Remove sufixo " mg" se presente, converte separador e formata com 2 casas decimais.
// Evita "2,5 mg mg" quando o valor salvo inclui a unidade.
function normalizeDose(raw: string | null): string {
  const clean = (raw ?? '').trim().replace(/\s*mg\s*/gi, '').trim();
  const n = parseFloat(clean.replace(',', '.'));
  if (isNaN(n) || n <= 0) return '';
  return n.toFixed(2).replace('.', ',');
}

// ── Date helpers (mesmo padrão do Onboarding — data de nascimento) ────────────

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function dateDisplayToISO(display: string): string | null {
  const digits = display.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function isoToDateDisplay(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function isValidCalendarDate(iso: string): boolean {
  const parts = iso.split('-');
  if (parts.length !== 3) return false;
  const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
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

const WEEKDAY_OPTIONS = [
  { value: 'monday',    label: 'Segunda-feira' },
  { value: 'tuesday',   label: 'Terça-feira'   },
  { value: 'wednesday', label: 'Quarta-feira'  },
  { value: 'thursday',  label: 'Quinta-feira'  },
  { value: 'friday',    label: 'Sexta-feira'   },
  { value: 'saturday',  label: 'Sábado'        },
  { value: 'sunday',    label: 'Domingo'       },
] as const;

function weekdayLabel(value: string): string {
  return WEEKDAY_OPTIONS.find(o => o.value === value)?.label ?? 'Selecionar dia';
}

// ── Component ─────────────────────────────────────────────────────────────────

type TreatSaveState = 'idle' | 'saving' | 'saved';

export default function TreatmentSettingsScreen({ onBack, onSave, mode = 'edit' }: TreatmentSettingsScreenProps) {
  const [selectedMedication,  setSelectedMedication]  = useState(() => glpyStore.treatment.getMedication());
  const [selectedFrequency,   setSelectedFrequency]   = useState(() => glpyStore.treatment.getFrequencia());
  const [customFrequencyDays, setCustomFrequencyDays] = useState('7');
  const [dose,                setDose]                = useState(() => normalizeDose(glpyStore.treatment.getDose()) || '2,50');
  const [startDateDisplay,    setStartDateDisplay]    = useState(() => {
    const iso = glpyStore.treatment.getTreatmentStartDate();
    return iso ? isoToDateDisplay(iso) : '';
  });
  const [applicationWeekday,  setApplicationWeekday]  = useState(() => glpyStore.treatment.getApplicationWeekday() || '');
  const [applicationMonthDay, setApplicationMonthDay] = useState<number | null>(() => glpyStore.treatment.getApplicationMonthDay());
  const [dateError,           setDateError]           = useState('');
  const [medModalOpen,        setMedModalOpen]        = useState(false);
  const [freqModalOpen,       setFreqModalOpen]       = useState(false);
  const [weekdayModalOpen,    setWeekdayModalOpen]    = useState(false);
  const [monthDayModalOpen,   setMonthDayModalOpen]   = useState(false);
  const [saveState,           setSaveState]           = useState<TreatSaveState>('idle');
  const [fromInjection]                               = useState(() => new URLSearchParams(window.location.search).get('from') === 'injection');

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

    // Validar data de início se preenchida
    const dateDigits = startDateDisplay.replace(/\D/g, '');
    if (dateDigits.length > 0 && dateDigits.length < 8) {
      setDateError('Digite a data completa no formato DD/MM/AAAA.');
      return;
    }
    if (dateDigits.length === 8) {
      const isoCheck = dateDisplayToISO(startDateDisplay);
      if (!isoCheck || !isValidCalendarDate(isoCheck)) {
        setDateError('Data inválida. Verifique o dia e o mês informados.');
        return;
      }
    }

    // Normalizar dose antes de qualquer coisa (cobre o caso em que o usuário
    // digitou "5" sem dar blur — garante "5,00" no input e no onSave callback).
    const parsedDose = parseFloat((dose || '').replace(',', '.').replace(/[^0-9.]/g, ''));
    const doseNorm   = (!isNaN(parsedDose) && parsedDose > 0)
      ? parsedDose.toFixed(2).replace('.', ',')
      : dose;
    if (doseNorm !== dose) setDose(doseNorm);

    setSaveState('saving');

    // Salva via glpyStore para garantir reatividade imediata na Home.
    glpyStore.treatment.saveMedication(selectedMedication);
    glpyStore.treatment.saveFrequencia(selectedFrequency);
    if (selectedFrequency === 'Personalizada') {
      glpyStore.treatment.saveFrequenciaPersonalizadaDias(customFrequencyDays);
    }
    if (!isNaN(parsedDose) && parsedDose > 0) {
      glpyStore.treatment.saveDose(String(parsedDose));
    }

    // Salvar data de início do tratamento
    const isoDate = dateDigits.length === 8 ? dateDisplayToISO(startDateDisplay) : null;
    glpyStore.treatment.saveTreatmentStartDate(isoDate);

    // Salvar dia da semana da aplicação (apenas para frequência Semanal)
    if (selectedFrequency === 'Semanal' && applicationWeekday) {
      glpyStore.treatment.saveApplicationWeekday(applicationWeekday);
    } else if (selectedFrequency !== 'Semanal') {
      glpyStore.treatment.saveApplicationWeekday(null);
    }

    // Salvar dia do mês da aplicação (apenas para frequência Mensal)
    if (selectedFrequency === 'Mensal' && applicationMonthDay !== null) {
      glpyStore.treatment.saveApplicationMonthDay(applicationMonthDay);
    } else if (selectedFrequency !== 'Mensal') {
      glpyStore.treatment.saveApplicationMonthDay(null);
    }

    glpyBlackBox.addEvent({
      type: EVENT_TYPES.TREATMENT_UPDATED, category: CATEGORIES.TREATMENT, domain: DOMAINS.TREATMENT,
      signal: SIGNALS.MEDICATION_UPDATED, screen: 'TreatmentSettingsScreen', source: 'manual',
      payload: { fieldsChanged: ['medication', 'frequency', 'dose', 'treatmentStartDate', 'applicationWeekday', 'applicationMonthDay'] },
    });
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
      setTimeout(() => {
        if (fromInjection) {
          window.location.href = '/preview/injection';
        } else {
          onSave?.({
            medication: selectedMedication, frequency: selectedFrequency,
            customFrequencyDays, dose: doseNorm,
            treatmentStartDate:  isoDate,
            applicationWeekday:  selectedFrequency === 'Semanal' ? applicationWeekday || null : null,
            applicationMonthDay: selectedFrequency === 'Mensal'  ? applicationMonthDay : null,
          });
        }
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
        <GLPYHeader title="Configurações do Tratamento" onBack={fromInjection ? () => { window.location.href = '/preview/injection'; } : onBack} />

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
              Com que frequência você aplica?
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

          {/* ── Card 2b — Dia da semana (apenas Semanal) ──────────────────────── */}
          {selectedFrequency === 'Semanal' && (
            <GLPYCard variant="light">
              <div style={cardTitleRowStyle}>
                <div style={cardIconWrap}>
                  <CalendarDays size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
                </div>
                <span style={cardTitleStyle}>Dia da semana da aplicação</span>
              </div>
              <p style={supportTextStyle}>
                Qual dia da semana você aplica?
              </p>
              <div
                style={{
                  ...selectorRowStyle,
                  ...(applicationWeekday ? {} : { borderColor: lightColors.border.soft }),
                }}
                onClick={() => setWeekdayModalOpen(true)}
                role="button"
                aria-haspopup="listbox"
              >
                <span style={{
                  ...selectorValueStyle,
                  color: applicationWeekday ? lightColors.text.navy : lightColors.text.secondary,
                  fontWeight: applicationWeekday ? '600' : '400',
                }}>
                  {applicationWeekday ? weekdayLabel(applicationWeekday) : 'Selecionar dia'}
                </span>
                <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
              </div>
            </GLPYCard>
          )}

          {/* ── Card 2c — Dia do mês (apenas Mensal) ────────────────────────────── */}
          {selectedFrequency === 'Mensal' && (
            <GLPYCard variant="light">
              <div style={cardTitleRowStyle}>
                <div style={cardIconWrap}>
                  <CalendarDays size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
                </div>
                <span style={cardTitleStyle}>Dia do mês da aplicação</span>
              </div>
              <p style={supportTextStyle}>
                Qual dia do mês você aplica?
              </p>
              <div
                style={{
                  ...selectorRowStyle,
                  ...(applicationMonthDay !== null ? {} : { borderColor: lightColors.border.soft }),
                }}
                onClick={() => setMonthDayModalOpen(true)}
                role="button"
                aria-haspopup="listbox"
              >
                <span style={{
                  ...selectorValueStyle,
                  color:      applicationMonthDay !== null ? lightColors.text.navy : lightColors.text.secondary,
                  fontWeight: applicationMonthDay !== null ? '600' : '400',
                }}>
                  {applicationMonthDay !== null ? `Dia ${applicationMonthDay}` : 'Selecionar dia'}
                </span>
                <ChevronRight size={18} color={lightColors.text.secondary} strokeWidth={2} />
              </div>
            </GLPYCard>
          )}

          {/* ── Card 2d — Data de início do tratamento ────────────────────────── */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap}>
                <CalendarDays size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Início do tratamento</span>
            </div>
            <p style={supportTextStyle}>
              Quando você começou o tratamento?
            </p>
            <div style={{
              height:       56,
              borderRadius: radius.input,
              border:       `1.5px solid ${dateError ? '#C05000' : lightColors.border.soft}`,
              background:   lightColors.background.primary,
              boxShadow:    lightShadows.soft,
              paddingLeft:  20,
              paddingRight: 20,
              display:      'flex',
              alignItems:   'center',
              transition:   transition.default,
            }}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={startDateDisplay}
                onChange={e => { setStartDateDisplay(maskDate(e.target.value)); setDateError(''); }}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                style={{
                  width:       '100%',
                  fontFamily:  fontFamily.primary,
                  fontSize:    fontSize.h3,
                  fontWeight:  '600',
                  color:       lightColors.text.navy,
                  background:  'transparent',
                  border:      'none',
                  outline:     'none',
                  letterSpacing: '0.04em',
                }}
              />
            </div>
            {dateError ? (
              <p style={{
                fontFamily: fontFamily.primary,
                fontSize:   fontSize.small,
                color:      '#C05000',
                marginTop:  gap.small,
                lineHeight: 1.45,
              }}>
                {dateError}
              </p>
            ) : (
              <p style={{
                fontFamily: fontFamily.primary,
                fontSize:   fontSize.small,
                color:      lightColors.text.secondary,
                marginTop:  gap.small,
                lineHeight: 1.45,
                opacity:    0.8,
              }}>
                Pode ser uma data aproximada, se você não lembrar exatamente.
              </p>
            )}
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

      {/* ── Bottom Sheet — Dia da semana ─────────────────────────────────────── */}
      {weekdayModalOpen && (
        <WeekdayModal
          selected={applicationWeekday}
          onSelect={v => { setApplicationWeekday(v); setWeekdayModalOpen(false); }}
          onClose={() => setWeekdayModalOpen(false)}
        />
      )}

      {/* ── Bottom Sheet — Dia do mês ────────────────────────────────────────── */}
      {monthDayModalOpen && (
        <MonthDayModal
          selected={applicationMonthDay}
          onSelect={d => { setApplicationMonthDay(d); setMonthDayModalOpen(false); }}
          onClose={() => setMonthDayModalOpen(false)}
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

// ── MonthDayModal ─────────────────────────────────────────────────────────────

interface MonthDayModalProps {
  selected: number | null;
  onSelect: (day: number) => void;
  onClose:  () => void;
}

function MonthDayModal({ selected, onSelect, onClose }: MonthDayModalProps) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <>
      <div style={sharedBackdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={sharedPanelStyle} role="listbox" aria-label="Selecionar dia do mês">
        <div style={sharedHandleBarStyle} />
        <div style={sharedSheetHeaderStyle}>
          <span style={sharedSheetTitleStyle}>Qual dia do mês você aplica?</span>
        </div>
        <div style={sharedListStyle}>
          {days.map(day => (
            <SheetRow
              key={day}
              label={`Dia ${day}`}
              selected={selected === day}
              isLast={day === 31}
              onSelect={() => onSelect(day)}
            />
          ))}
        </div>
        <div style={{ paddingLeft: padding.screen, paddingRight: padding.screen, paddingBottom: 28, flexShrink: 0 }}>
          <p style={{
            fontFamily: fontFamily.primary,
            fontSize:   12,
            color:      lightColors.text.secondary,
            textAlign:  'center',
            lineHeight: 1.45,
            opacity:    0.72,
            paddingTop: gap.small,
          }}>
            Use apenas o intervalo orientado pelo seu profissional de saúde.
          </p>
        </div>
      </div>
    </>
  );
}

// ── WeekdayModal ──────────────────────────────────────────────────────────────

interface WeekdayModalProps {
  selected: string;
  onSelect: (value: string) => void;
  onClose:  () => void;
}

function WeekdayModal({ selected, onSelect, onClose }: WeekdayModalProps) {
  return (
    <>
      <div style={sharedBackdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={sharedPanelStyle} role="listbox" aria-label="Selecionar dia da semana">
        <div style={sharedHandleBarStyle} />
        <div style={sharedSheetHeaderStyle}>
          <span style={sharedSheetTitleStyle}>Qual dia você aplica?</span>
        </div>
        <div style={sharedListStyle}>
          {WEEKDAY_OPTIONS.map((opt, i) => (
            <SheetRow
              key={opt.value}
              label={opt.label}
              selected={selected === opt.value}
              isLast={i === WEEKDAY_OPTIONS.length - 1}
              onSelect={() => onSelect(opt.value)}
            />
          ))}
        </div>
        <div style={{ paddingLeft: padding.screen, paddingRight: padding.screen, paddingBottom: 28, flexShrink: 0 }}>
          <p style={{
            fontFamily: fontFamily.primary,
            fontSize:   12,
            color:      lightColors.text.secondary,
            textAlign:  'center',
            lineHeight: 1.45,
            opacity:    0.72,
            paddingTop: gap.small,
          }}>
            Use apenas o intervalo orientado pelo seu profissional de saúde.
          </p>
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
