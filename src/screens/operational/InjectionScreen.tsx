// GLPY — Injection Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// MVP PLACEHOLDER:
// No MVP, esta tela registra informações informadas pelo usuário.
// Esta tela não substitui orientação médica e apenas registra dados informados pelo usuário.
//
// TreatmentSettingsScreen será criada futuramente para editar medicação, frequência e dose.
// SideEffectsScreen será criada futuramente para registrar sintomas/efeitos após aplicação.

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Clock, Settings2, MapPin, Activity, Lightbulb, ChevronRight } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { glpyStore } from '../../data/glpyStore';
import { glpyBlackBox } from '../../data/glpyBlackBox';
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from '../../data/glpyEventCatalog';
import { calculateNextInjection } from '../../utils/treatmentUtils';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { transition } from '../../theme/motion';

// ── Types ─────────────────────────────────────────────────────────────────────

type InjectionSite = 'abdomen' | 'thigh' | 'arm';

interface SiteOption {
  id:    InjectionSite;
  label: string;
}

interface InjectionScreenProps {
  onBack?: () => void;
  onSave?: (data: { medication: string; dose: string; frequency: string; site: InjectionSite }) => void;
}

// ── Data ─────────────────────────────────────────────────────────────────────
// MVP PLACEHOLDER — dados fixos. Futuramente virão do perfil de tratamento do usuário.

const SITE_OPTIONS: SiteOption[] = [
  { id: 'abdomen', label: 'Abdômen' },
  { id: 'thigh',   label: 'Coxa'    },
  { id: 'arm',     label: 'Braço'   },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function InjectionScreen({ onBack, onSave }: InjectionScreenProps) {
  const [selectedSite, setSelectedSite] = useState<InjectionSite>(() => {
    try {
      const s = glpyStore.treatment.getUltimaInjecao()?.site;
      return (['abdomen', 'thigh', 'arm'] as InjectionSite[]).includes(s) ? s : 'abdomen';
    } catch { return 'abdomen'; }
  });
  const [medication] = useState(() => glpyStore.treatment.getMedication());
  const [dose]       = useState(() => glpyStore.treatment.getDose());
  const [frequency]  = useState(() => glpyStore.treatment.getFrequencia());

  const nextInj = calculateNextInjection();

  function handleEditConfig(_field: string) {
    window.location.href = '/preview/treatment-settings?from=injection';
  }

  function handleSymptoms() {
    window.location.href = '/preview/side-effects?from=injection&reset=true';
  }

  const [saveState,           setSaveState]           = useState<'idle' | 'saving' | 'saved'>('idle');
  const [noSymptomsModalOpen, setNoSymptomsModalOpen] = useState(false);

  function todayISO(): string { return new Date().toISOString().slice(0, 10); }

  function hasTodaySymptoms(): boolean {
    try {
      const rec = glpyStore.treatment.getEfeitosHoje();
      if (!rec) return false;
      return rec.date === todayISO();
    } catch { return false; }
  }

  function registerNoSymptoms(): void {
    const today = todayISO();
    const record = { date: today, symptoms: [], intensity: 'none', noSymptoms: true, savedAt: new Date().toISOString() };
    glpyStore.treatment.saveEfeitosHoje(record);
    try {
      const history  = glpyStore.treatment.getEfeitosHistorico();
      const filtered = Array.isArray(history) ? history.filter((e: any) => e.date !== today) : [];
      filtered.push({ id: `effects_${today}_${Date.now()}`, ...record });
      glpyStore.treatment.saveEfeitosHistorico(filtered);
    } catch {}
    window.dispatchEvent(new Event('local-storage-change'));
  }

  function doActualSave() {
    setSaveState('saving');
    glpyStore.treatment.saveUltimaInjecao({ site: selectedSite, savedAt: Date.now() });
    glpyBlackBox.addEvent({
      type: EVENT_TYPES.INJECTION_LOGGED, category: CATEGORIES.INJECTION, domain: DOMAINS.TREATMENT,
      signal: SIGNALS.INJECTION_LOGGED, screen: 'InjectionScreen', source: 'manual',
      payload: { date: new Date().toISOString().slice(0, 10) },
    });
    setTimeout(() => {
      setSaveState('saved');
      setTimeout(() => onSave?.({ medication, dose, frequency, site: selectedSite }), 900);
    }, 500);
  }

  function handleSave() {
    if (saveState !== 'idle') return;
    if (!hasTodaySymptoms()) { setNoSymptomsModalOpen(true); return; }
    doActualSave();
  }

  // ── Shared styles ──────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  const cardIconWrap = (size = 32): React.CSSProperties => ({
    width:          size,
    height:         size,
    borderRadius:   10,
    background:     `linear-gradient(135deg, ${lightColors.brand.green}22, ${lightColors.brand.greenDark}33)`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  });

  const cardTitleRowStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          6,
    marginBottom: 6,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   11,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.secondary,
    flex:       1,
    lineHeight: 1,
  };

  const mainValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.h3,
    fontWeight: fontWeight.h1,
    color:      lightColors.text.navy,
    lineHeight: 1.2,
  };

  const subValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    marginTop:  3,
  };

  const badgeStyle: React.CSSProperties = {
    display:       'inline-flex',
    alignItems:    'center',
    paddingLeft:   6,
    paddingRight:  6,
    paddingTop:    2,
    paddingBottom: 2,
    borderRadius:  99,
    background:    `${lightColors.brand.green}22`,
    fontFamily:    fontFamily.primary,
    fontSize:      10,
    fontWeight:    fontWeight.h3,
    color:         lightColors.brand.greenDark,
    marginBottom:  6,
    alignSelf:     'flex-start' as const,
  };

  // microtexto disclaimer
  const disclaimerStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.text.secondary,
    textAlign:  'center',
    lineHeight: 1.4,
    opacity:    0.75,
    paddingTop: 2,
  };

  // config rows
  const configRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingTop:     11,
    paddingBottom:  11,
    borderBottom:   `1px solid ${lightColors.border.soft}`,
    cursor:         'pointer',
  };

  const configLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
  };

  const configValueRowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        4,
  };

  const configValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  const configFooterStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   12,
    color:      lightColors.brand.greenDark,
    marginTop:  gap.small,
    textAlign:  'right',
  };

  // site chips
  const siteRowStyle: React.CSSProperties = {
    display: 'flex',
    gap:     gap.small,
  };

  // effects card
  const effectsTextStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    color:        lightColors.text.secondary,
    lineHeight:   1.5,
    marginBottom: gap.small,
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
      <GLPYHeader title="Aplicação" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Cards 1 & 2 — grid 2 colunas ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: gap.small }}>

          {/* Card 1 — Próxima aplicação */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap(26)}>
                <CalendarDays size={13} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Próxima aplicação</span>
            </div>
            <div style={badgeStyle}>{frequency}</div>
            <div style={mainValueStyle}>{nextInj.nextDateFormatted}</div>
            <div style={subValueStyle}>{nextInj.daysRemainingText}</div>
          </GLPYCard>

          {/* Card 2 — Última aplicação */}
          <GLPYCard variant="light">
            <div style={cardTitleRowStyle}>
              <div style={cardIconWrap(26)}>
                <Clock size={13} color={lightColors.brand.greenDark} strokeWidth={2} />
              </div>
              <span style={cardTitleStyle}>Última aplicação</span>
            </div>
            <div style={{ ...badgeStyle, background: 'transparent', color: 'transparent' }}>·</div>
            <div style={mainValueStyle}>{nextInj.hasHistory ? dose : 'Sem registro'}</div>
            <div style={subValueStyle}>
              {nextInj.hasHistory
                ? `${nextInj.lastDateFormatted} · ${medication}`
                : 'Tratamento não iniciado'}
            </div>
          </GLPYCard>

        </div>

        {/* microtexto disclaimer */}
        <p style={disclaimerStyle}>
          Registre apenas informações já orientadas pelo seu profissional de saúde.
        </p>

        {/* ── Card 3 — Configurações do tratamento ──────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap()}>
              <Settings2 size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={{ ...cardTitleStyle, fontSize: fontSize.bodyDefault, color: lightColors.text.navy }}>
              Configurações do tratamento
            </span>
          </div>

          <div>
            {[
              { label: 'Medicação',  value: medication },
              { label: 'Frequência', value: frequency  },
              { label: 'Dose atual', value: dose       },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  ...configRowStyle,
                  ...(i === arr.length - 1 ? { borderBottom: 'none', paddingBottom: 2 } : {}),
                }}
                onClick={() => handleEditConfig(row.label)}
              >
                <span style={configLabelStyle}>{row.label}</span>
                <div style={configValueRowStyle}>
                  <span style={configValueStyle}>{row.value}</span>
                  <ChevronRight size={14} color={lightColors.border.soft} strokeWidth={2} />
                </div>
              </div>
            ))}
          </div>

          <p style={configFooterStyle}>Toque para ajustar seus dados</p>
        </GLPYCard>

        {/* ── Card 4 — Local da aplicação ───────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={{ ...cardTitleRowStyle, marginBottom: gap.small }}>
            <div style={cardIconWrap()}>
              <MapPin size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={{ ...cardTitleStyle, fontSize: fontSize.bodyDefault, color: lightColors.text.navy }}>
              Local da aplicação
            </span>
          </div>

          <div style={siteRowStyle}>
            {SITE_OPTIONS.map(option => (
              <SiteChip
                key={option.id}
                option={option}
                selected={selectedSite === option.id}
                onSelect={() => setSelectedSite(option.id)}
              />
            ))}
          </div>
        </GLPYCard>

        {/* ── Card 5 — Efeitos após aplicação ──────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={{ ...cardTitleRowStyle, marginBottom: gap.small }}>
            <div style={cardIconWrap()}>
              <Activity size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={{ ...cardTitleStyle, fontSize: fontSize.bodyDefault, color: lightColors.text.navy }}>
              Efeitos após aplicação
            </span>
          </div>
          <p style={effectsTextStyle}>
            Acompanhe sintomas ou desconfortos depois da dose.
          </p>
          <GLPYButton variant="secondary" size="sm" onClick={handleSymptoms}>
            Registrar sintomas
          </GLPYButton>
        </GLPYCard>

        {/* ── Dica GLPY ─────────────────────────────────────────────────────── */}
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
            Registrar sua rotina de aplicação ajuda a GLPY IA a entender padrões entre
            dose, sintomas, hidratação, alimentação e evolução.
          </p>
        </GLPYCard>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <GLPYButton variant="primary" size="lg" fullWidth disabled={saveState !== 'idle'} onClick={handleSave}>
          {saveState === 'saving' ? 'Salvando...' : saveState === 'saved' ? 'Aplicação salva ✓' : 'Registrar aplicação'}
        </GLPYButton>

        {noSymptomsModalOpen && createPortal(
          <SymptomsGuardModal
            onRegisterSymptoms={() => {
              setNoSymptomsModalOpen(false);
              window.location.href = '/preview/side-effects?from=injection&reset=true';
            }}
            onNoSymptoms={() => {
              setNoSymptomsModalOpen(false);
              registerNoSymptoms();
              doActualSave();
            }}
            onClose={() => setNoSymptomsModalOpen(false)}
          />,
          document.body
        )}

      </div>
    </GLPYScreen>
  );
}

// ── SymptomsGuardModal (local) ────────────────────────────────────────────────

interface SymptomsGuardModalProps {
  onRegisterSymptoms: () => void;
  onNoSymptoms:       () => void;
  onClose:            () => void;
}

function SymptomsGuardModal({ onRegisterSymptoms, onNoSymptoms, onClose }: SymptomsGuardModalProps) {
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
    borderRadius:  '24px 24px 0 0',
    background:    lightColors.background.card,
    boxShadow:     '0 -8px 40px rgba(0,0,0,0.12)',
    zIndex:        200,
    padding:       `20px ${padding.screen}px 36px`,
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.medium,
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose} aria-hidden="true" />
      <div style={panelStyle}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: lightColors.border.soft, margin: '0 auto' }} />
        <div>
          <p style={{
            fontFamily:   fontFamily.primary,
            fontSize:     fontSize.bodyLarge,
            fontWeight:   fontWeight.h1,
            color:        lightColors.text.navy,
            lineHeight:   1.3,
            marginBottom: 8,
          }}>
            Você sentiu algum efeito após a aplicação?
          </p>
          <p style={{
            fontFamily: fontFamily.primary,
            fontSize:   fontSize.small,
            color:      lightColors.text.secondary,
            lineHeight: 1.5,
          }}>
            Registrar sintomas ajuda a acompanhar seus padrões ao longo da jornada.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small }}>
          <GLPYButton variant="primary"   size="md" fullWidth onClick={onRegisterSymptoms}>
            Registrar sintomas
          </GLPYButton>
          <GLPYButton variant="secondary" size="md" fullWidth onClick={onNoSymptoms}>
            Não senti sintomas
          </GLPYButton>
        </div>
      </div>
    </>
  );
}

// ── SiteChip (local) ──────────────────────────────────────────────────────────

interface SiteChipProps {
  option:   SiteOption;
  selected: boolean;
  onSelect: () => void;
}

function SiteChip({ option, selected, onSelect }: SiteChipProps) {
  const chipStyle: React.CSSProperties = {
    flex:         1,
    borderRadius: radius.secondary,
    padding:      `10px 8px`,
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
      <span style={labelStyle}>{option.label}</span>
    </div>
  );
}
