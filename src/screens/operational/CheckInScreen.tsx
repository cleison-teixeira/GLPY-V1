// GLPY — Check-in Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela consolida registros diários mockados no MVP.
// O GLPY não diagnostica, prescreve ou substitui orientação profissional.
// Futuramente esta tela será conectada ao DailyTrackingEngine, XP/Streak Engine e GLPY IA.
// O check-in deve gerar sensação de progresso, continuidade e micro recompensa emocional.

import React, { useState } from 'react';
import {
  Star, ListChecks, Smile, TrendingUp, Lightbulb, Check, CheckCircle2,
  Droplets, Utensils, Syringe, AlertCircle, Flame, Camera,
} from 'lucide-react';
import { glpyStore } from '../../data/glpyStore';
import { glpyBlackBox } from '../../data/glpyBlackBox';
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from '../../data/glpyEventCatalog';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { transition } from '../../theme/motion';
import { formatLiters } from '../../utils/formatters';

// ── Props ─────────────────────────────────────────────────────────────────────

interface CheckInScreenProps {
  onBack?: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

type DayFeeling = 'Leve' | 'Normal' | 'Difícil';
const FEELING_OPTIONS: DayFeeling[] = ['Leve', 'Normal', 'Difícil'];

function buildResumoItems(todayStr: string) {
  const fmtL = formatLiters;

  const agua = (() => {
    try {
      const p = glpyStore.water.getToday();
      if (!p || p.date !== todayStr) return { value: 'Pendente', done: false };
      const amount = parseFloat(String(p.amount)) || 0;
      return { value: `${fmtL(amount)} L de ${fmtL(2.6)} L`, done: amount >= 2.6 };
    } catch { return { value: 'Pendente', done: false }; }
  })();

  const refeicao = (() => {
    try {
      const list = JSON.parse(localStorage.getItem('glpy_refeicoes_hoje') || '[]');
      if (!Array.isArray(list)) return { value: 'Pendente', done: false };
      const count = list.filter((r: any) =>
        r?.savedAt && new Date(r.savedAt).toISOString().slice(0, 10) === todayStr
      ).length;
      if (count === 0) return { value: 'Pendente', done: false };
      return { value: `${count} de 3`, done: count >= 3 };
    } catch { return { value: 'Pendente', done: false }; }
  })();

  const aplicacao = (() => {
    try {
      const p = glpyStore.treatment.getUltimaInjecao();
      const isToday = p?.savedAt && new Date(p.savedAt).toISOString().slice(0, 10) === todayStr;
      return isToday ? { value: 'Registrada', done: true } : { value: 'Pendente', done: false };
    } catch { return { value: 'Pendente', done: false }; }
  })();

  const emocao = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = glpyStore.emotion.getToday() as any;
      const isToday = p?.savedAt && new Date(p.savedAt).toISOString().slice(0, 10) === todayStr;
      if (!isToday) return { value: 'Pendente', done: false };
      return { value: typeof p?.mood === 'string' ? p.mood : 'Registrada', done: true };
    } catch { return { value: 'Pendente', done: false }; }
  })();

  const atividade = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = glpyStore.activity.getToday() as any;
      const isToday = p?.savedAt && new Date(p.savedAt).toISOString().slice(0, 10) === todayStr;
      if (!isToday) return { value: 'Pendente', done: false };
      return { value: p?.duration ? `${p.duration} min` : 'Registrada', done: true };
    } catch { return { value: 'Pendente', done: false }; }
  })();

  const sintomas = (() => {
    try {
      const rec = glpyStore.treatment.getEfeitosHoje();
      if (!rec) return { value: 'Pendente', done: false };
      if (rec?.date !== todayStr) return { value: 'Pendente', done: false };
      if (rec.noSymptoms) return { value: 'Nenhum sintoma', done: true };
      const count = Array.isArray(rec.symptoms) ? rec.symptoms.length : 0;
      if (count === 0) return { value: 'Registrado', done: true };
      return { value: count === 1 ? rec.symptoms[0] : `${count} sintomas`, done: true };
    } catch { return { value: 'Pendente', done: false }; }
  })();

  return [
    { id: 'agua',      label: 'Água',          ...agua,      Icon: Droplets    },
    { id: 'refeicao',  label: 'Refeições',     ...refeicao,  Icon: Utensils    },
    { id: 'aplicacao', label: 'Aplicação',     ...aplicacao, Icon: Syringe     },
    { id: 'emocao',    label: 'Emoção',        ...emocao,    Icon: Smile       },
    { id: 'atividade', label: 'Atividade',     ...atividade, Icon: Flame       },
    { id: 'sintomas',  label: 'Sintomas',      ...sintomas,  Icon: AlertCircle },
    { id: 'foto',      label: 'Foto corporal', value: 'Pendente', done: false,  Icon: Camera      },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────

type CheckInSaveState = 'idle' | 'saving' | 'saved';

export default function CheckInScreen({ onBack }: CheckInScreenProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const resumoItems = buildResumoItems(todayStr);
  const doneCount = resumoItems.filter(i => i.done).length;

  const [selectedDayFeeling, setSelectedDayFeeling] = useState<DayFeeling>(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = glpyStore.checkin.getToday() as any;
      const f = parsed?.dayFeeling;
      if (f === 'Leve' || f === 'Normal' || f === 'Difícil') return f as DayFeeling;
    } catch {}
    return 'Normal';
  });
  const [checkInState, setCheckInState] = useState<CheckInSaveState>('idle');

  const realStreak = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = glpyStore.checkin.getHistory() as any[];
      if (!Array.isArray(parsed) || parsed.length === 0) return 0;
      const dates = parsed.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item && item.date) return item.date;
        return '';
      }).filter(Boolean);
      const unique = Array.from(new Set(dates)).sort((a: any, b: any) => b.localeCompare(a)) as string[];
      const todayStr = new Date().toISOString().split('T')[0];
      const yest = new Date(); yest.setDate(yest.getDate() - 1);
      const yesterdayStr = yest.toISOString().split('T')[0];
      const hasToday = unique.includes(todayStr);
      const hasYesterday = unique.includes(yesterdayStr);
      if (!hasToday && !hasYesterday) return 0;
      let streak = 0;
      let d = new Date(hasToday ? todayStr : yesterdayStr);
      while (true) {
        const s = d.toISOString().split('T')[0];
        if (unique.includes(s)) { streak++; d.setDate(d.getDate() - 1); } else break;
      }
      return streak;
    } catch { return 0; }
  })();

  const alreadyDoneToday = (() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = glpyStore.checkin.getToday() as any;
      return parsed?.date === todayStr;
    } catch { return false; }
  })();

  function handleCheckIn() {
    if (checkInState !== 'idle') return;
    setCheckInState('saving');
    const today = new Date().toISOString().split('T')[0];
    const newEntry = { date: today, dayFeeling: selectedDayFeeling, savedAt: Date.now() };
    glpyStore.checkin.saveToday(newEntry);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hist: any[] = [];
    try { hist = [...glpyStore.checkin.getHistory()]; }
    catch { hist = []; }
    if (!Array.isArray(hist)) hist = [];

    const existingIndex = hist.findIndex((item: any) =>
      typeof item === 'string' ? item === today : item?.date === today
    );
    if (existingIndex !== -1) {
      hist[existingIndex] = typeof hist[existingIndex] === 'string'
        ? newEntry
        : { ...hist[existingIndex], ...newEntry };
    } else {
      hist.push(newEntry);
    }
    glpyStore.checkin.saveHistory(hist);

    if (!alreadyDoneToday) {
      const xpEarned = 10 + doneCount * 10;
      glpyStore.gamification.addXP(xpEarned);
      glpyStore.gamification.saveStreak(realStreak + 1);
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.CHECKIN_COMPLETED, category: CATEGORIES.CHECKIN, domain: DOMAINS.ADHERENCE,
        signal: SIGNALS.CHECKIN_COMPLETED, screen: 'CheckInScreen', source: 'manual',
        payload: { doneCount, xpEarned, streak: realStreak + 1 },
      });
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.XP_ADDED, category: CATEGORIES.GAMIFICATION, domain: DOMAINS.ADHERENCE,
        signal: SIGNALS.XP_ADDED, screen: 'CheckInScreen', source: 'system',
        payload: { amount: xpEarned, reason: 'checkin', total: glpyStore.gamification.getXP() },
      });
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.STREAK_UPDATED, category: CATEGORIES.GAMIFICATION, domain: DOMAINS.ADHERENCE,
        signal: SIGNALS.STREAK_UPDATED, screen: 'CheckInScreen', source: 'system',
        payload: { streak: realStreak + 1 },
      });
    }

    window.dispatchEvent(new Event('local-storage-change'));

    setTimeout(() => {
      setCheckInState('saved');
      setTimeout(() => onBack?.(), 900);
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

  const cardSubtextStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    color:        lightColors.text.secondary,
    lineHeight:   1.5,
    marginBottom: gap.small,
  };

  // ── Card 1 — summary block ────────────────────────────────────────────────

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

  // ── Card 2 — resumo item ──────────────────────────────────────────────────

  const resumoItemRowStyle: React.CSSProperties = {
    display:     'flex',
    alignItems:  'center',
    gap:         10,
    paddingTop:  7,
    paddingBottom: 7,
  };

  const resumoItemIconWrap: React.CSSProperties = {
    width:          26,
    height:         26,
    borderRadius:   8,
    background:     lightColors.background.secondary,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  };

  const resumoItemLabelStyle: React.CSSProperties = {
    flex:       1,
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
  };

  const resumoItemValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
    marginRight: 8,
  };

  const resumoDividerStyle: React.CSSProperties = {
    height:     0.5,
    background: lightColors.border.soft,
  };

  function statusDotStyle(done: boolean): React.CSSProperties {
    return {
      width:          20,
      height:         20,
      borderRadius:   99,
      flexShrink:     0,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      background:     done ? lightColors.brand.greenDark : 'transparent',
      border:         done ? 'none' : `1.5px dashed ${lightColors.border.soft}`,
    };
  }

  // ── Card 3 — feeling chip ─────────────────────────────────────────────────

  const feelingRowStyle: React.CSSProperties = {
    display: 'flex',
    gap:     gap.small,
  };

  function feelingChipStyle(selected: boolean): React.CSSProperties {
    return {
      flex:         1,
      textAlign:    'center',
      padding:      '12px 8px',
      borderRadius: radius.secondary,
      border:       selected
        ? `1.5px solid ${lightColors.brand.green}`
        : `1px solid ${lightColors.border.soft}`,
      background:   selected
        ? `${lightColors.brand.green}18`
        : lightColors.background.secondary,
      fontFamily:   fontFamily.primary,
      fontSize:     fontSize.small,
      fontWeight:   selected ? '700' : '500',
      color:        selected ? lightColors.brand.greenDark : lightColors.text.secondary,
      cursor:       'pointer',
      transition:   transition.default,
    };
  }

  // ── Card 4 — próximo passo ────────────────────────────────────────────────

  const proximoBlockStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          12,
    background:   lightColors.background.secondary,
    borderRadius: radius.secondary,
    padding:      '12px 16px',
  };

  const proximoActionStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

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
      <GLPYHeader title="Check-in" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Card 1 — Check-in de hoje ──────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              {alreadyDoneToday
                ? <CheckCircle2 size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
                : <Star        size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
              }
            </div>
            <span style={cardTitleStyle}>Check-in de hoje</span>
          </div>
          <p style={cardSubtextStyle}>
            {alreadyDoneToday
              ? 'Check-in de hoje concluído. Você pode atualizar seu humor abaixo.'
              : 'Revise sua rotina e conclua mais um passo da sua jornada.'}
          </p>
          <div style={summaryBlockStyle}>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Sequência</span>
              <span style={summaryValueStyle}>{realStreak > 0 ? `${realStreak} dias` : '—'}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Progresso de hoje</span>
              <span style={summaryValueStyle}>{doneCount} de 7 ações</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>XP do dia</span>
              <span style={{ ...summaryValueStyle, color: lightColors.brand.greenDark }}>+{10 + doneCount * 10} XP</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Banner — já concluído hoje ────────────────────────────────────── */}
        {alreadyDoneToday && (
          <GLPYCard
            variant="light"
            style={{
              padding:    padding.small,
              background: `${lightColors.brand.green}14`,
              border:     `1.5px solid ${lightColors.brand.green}44`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <CheckCircle2
                size={18}
                color={lightColors.brand.greenDark}
                strokeWidth={1.75}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <div style={{
                  fontFamily:   fontFamily.primary,
                  fontSize:     fontSize.small,
                  fontWeight:   fontWeight.h3,
                  color:        lightColors.brand.greenDark,
                  marginBottom: 3,
                }}>
                  Check-in de hoje já concluído
                </div>
                <div style={{
                  fontFamily: fontFamily.primary,
                  fontSize:   fontSize.small,
                  color:      lightColors.text.secondary,
                  lineHeight: 1.5,
                }}>
                  Volte amanhã para continuar sua sequência. Você ainda pode atualizar como foi seu dia.
                </div>
              </div>
            </div>
          </GLPYCard>
        )}

        {/* ── Card 2 — Resumo diário ─────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <ListChecks size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Resumo diário</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {resumoItems.map(({ id, label, value, done, Icon }, index) => (
              <React.Fragment key={id}>
                {index > 0 && <div style={resumoDividerStyle} />}
                <div style={resumoItemRowStyle}>
                  <div style={resumoItemIconWrap}>
                    <Icon
                      size={14}
                      strokeWidth={1.75}
                      color={lightColors.text.secondary}
                    />
                  </div>
                  <span style={resumoItemLabelStyle}>{label}</span>
                  <span style={resumoItemValueStyle}>{value}</span>
                  <div style={statusDotStyle(done)}>
                    {done && (
                      <Check size={10} color="#fff" strokeWidth={3} />
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </GLPYCard>

        {/* ── Card 3 — Como foi seu dia? ─────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Smile size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Como foi seu dia?</span>
          </div>
          <div style={feelingRowStyle}>
            {FEELING_OPTIONS.map(opt => (
              <div
                key={opt}
                style={feelingChipStyle(selectedDayFeeling === opt)}
                onClick={() => setSelectedDayFeeling(opt)}
                role="button"
                aria-label={opt}
                aria-pressed={selectedDayFeeling === opt}
              >
                {opt}
              </div>
            ))}
          </div>
        </GLPYCard>

        {/* ── Card 4 — Próximo passo ─────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingUp size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Próximo passo</span>
          </div>
          <p style={{ ...cardSubtextStyle, marginBottom: gap.small }}>
            Amanhã você continua de onde parou.
          </p>
          <div style={proximoBlockStyle}>
            <TrendingUp size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            <span style={proximoActionStyle}>Manter sua sequência ativa</span>
          </div>
        </GLPYCard>

        {/* ── Card 5 — Dica GLPY ────────────────────────────────────────────── */}
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
            Completar seu check-in ajuda a GLPY IA a entender padrões entre rotina, sintomas, energia e evolução.
          </p>
        </GLPYCard>

        {/* ── Feedback de conclusão ──────────────────────────────────────────── */}
        {checkInState === 'saved' && (
          <GLPYCard
            variant="light"
            style={{
              padding:    padding.card,
              background: `${lightColors.brand.green}14`,
              border:     `1.5px solid ${lightColors.brand.green}44`,
              textAlign:  'center',
            }}
          >
            <CheckCircle2
              size={36}
              color={lightColors.brand.greenDark}
              strokeWidth={1.75}
              style={{ display: 'block', margin: '0 auto 10px' }}
            />
            <div style={{
              fontFamily:   fontFamily.primary,
              fontSize:     fontSize.bodyDefault,
              fontWeight:   fontWeight.h2,
              color:        lightColors.brand.greenDark,
              marginBottom: 4,
            }}>
              {alreadyDoneToday ? 'Atualizado ✓' : '+80 XP'}
            </div>
            <p style={{
              fontFamily: fontFamily.primary,
              fontSize:   fontSize.small,
              color:      lightColors.text.secondary,
              lineHeight: 1.5,
              margin:     0,
            }}>
              {alreadyDoneToday
                ? 'Seu humor foi atualizado para hoje.'
                : 'Check-in concluído. Mais um passo na sua evolução.'}
            </p>
          </GLPYCard>
        )}

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={checkInState !== 'idle'}
          onClick={handleCheckIn}
        >
          {checkInState === 'saving'
            ? 'Salvando...'
            : checkInState === 'saved'
              ? (alreadyDoneToday ? 'Check-in atualizado ✓' : 'Check-in salvo ✓')
              : (alreadyDoneToday ? 'Atualizar check-in de hoje' : 'Concluir check-in')}
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
