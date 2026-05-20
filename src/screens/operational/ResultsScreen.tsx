// GLPY — Results Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-results-screen-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela consolida resultados mockados no MVP.
// O GLPY não interpreta dados como diagnóstico nem promete resultado médico.
// Futuramente esta tela será conectada ao WeightTrackingEngine, DailyTrackingEngine, ProgressEngine, PhotoEngine, XP/Streak Engine e GLPY IA.
// A experiência deve reforçar progresso, clareza e motivação, sem gerar ansiedade ou culpa.

import React from 'react';
import { Ruler, CheckSquare, Flame, Scale, TrendingDown, Image, Sparkles, AlertCircle, Check, Camera } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ResultsScreenProps {
  onBack?: () => void;
}

// ── Constants & Types ─────────────────────────────────────────────────────────

interface GridStat {
  label: string;
  value: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
}

const STATS_GRID: readonly GridStat[] = [
  { label: 'Peso eliminado', value: '4,8 kg', Icon: Scale, color: lightColors.brand.greenDark },
  { label: 'Cintura', value: '-16 cm', Icon: Ruler, color: lightColors.brand.greenDark },
  { label: 'Check-ins', value: '12 dias', Icon: CheckSquare, color: lightColors.brand.greenDark },
  { label: 'Atividade', value: '30 min hoje', Icon: Flame, color: lightColors.brand.greenDark },
] as const;

interface DayStatus {
  label: string;
  completed: boolean;
}

const WEEK_DAYS: readonly DayStatus[] = [
  { label: 'S', completed: true },
  { label: 'T', completed: true },
  { label: 'Q', completed: true },
  { label: 'Q', completed: true },
  { label: 'S', completed: true },
  { label: 'S', completed: true },
  { label: 'D', completed: false },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsScreen({ onBack }: ResultsScreenProps) {

  // ── Shared Styles ──────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.medium,
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
    margin:       0,
  };

  // ── Card 1 — Conquista principal ────────────────────────────────────────────

  const card1ValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   38,
    fontWeight: '800',
    color:      lightColors.brand.greenDark,
    margin:     '8px 0',
    letterSpacing: '-0.02em',
  };

  const badgeStyle: React.CSSProperties = {
    display:       'inline-flex',
    alignItems:    'center',
    background:    `${lightColors.brand.green}14`,
    border:        `1px solid ${lightColors.brand.green}33`,
    borderRadius:  99,
    padding:       '4px 12px',
    fontSize:      fontSize.small - 1, // 13px
    fontWeight:    '600',
    color:         lightColors.brand.greenDark,
    marginTop:     gap.small,
  };

  // ── Card 2 — Progresso da meta ──────────────────────────────────────────────

  const metaMetricsRowStyle: React.CSSProperties = {
    display:       'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:           gap.medium,
    marginBottom:  gap.small,
  };

  const metaMetricBoxStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
  };

  const metaLabelStyle: React.CSSProperties = {
    fontSize:   fontSize.small - 2, // 12px
    color:      lightColors.text.secondary,
    fontWeight: '500',
  };

  const metaValueStyle: React.CSSProperties = {
    fontSize:   fontSize.small,
    fontWeight: '700',
    color:      lightColors.text.navy,
  };

  const progressBarTrackStyle: React.CSSProperties = {
    width:        '100%',
    height:       10,
    background:   lightColors.background.secondary,
    borderRadius: 99,
    overflow:     'hidden',
    position:     'relative',
    marginTop:    gap.medium,
  };

  const progressBarFillStyle: React.CSSProperties = {
    width:        '32%',
    height:       '100%',
    background:   lightColors.brand.green,
    borderRadius: 99,
  };

  const labelsRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    fontSize:       fontSize.small - 3, // 11px
    color:          lightColors.text.secondary,
    marginTop:      6,
    fontWeight:     '600',
  };

  // ── Card 3 — Evolução resumida ──────────────────────────────────────────────

  const gridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 gap.small,
    marginTop:           gap.medium,
  };

  const gridItemStyle: React.CSSProperties = {
    background:   lightColors.background.secondary,
    padding:      '12px 14px',
    borderRadius: radius.secondary,
    display:      'flex',
    flexDirection: 'column',
    gap:          4,
  };

  const gridValStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: '700',
    color:      lightColors.text.navy,
  };

  // ── Card 4 — Transformação visual ───────────────────────────────────────────

  const photoContainerStyle: React.CSSProperties = {
    display:       'flex',
    gap:           gap.small,
    marginTop:     gap.medium,
    marginBottom:  gap.small,
  };

  const beforeBoxStyle: React.CSSProperties = {
    flex:           1,
    height:         120,
    background:     lightColors.background.secondary,
    borderRadius:   radius.secondary,
    border:         `1px solid ${lightColors.border.soft}`,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    position:       'relative',
  };

  const afterBoxStyle: React.CSSProperties = {
    flex:           1,
    height:         120,
    background:     `${lightColors.brand.green}08`,
    borderRadius:   radius.secondary,
    border:         `1px dashed ${lightColors.brand.green}44`,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    position:       'relative',
  };

  const photoLabelStyle: React.CSSProperties = {
    fontSize:   fontSize.small - 2, // 12px
    fontWeight: '600',
    color:      lightColors.text.secondary,
  };

  const placeholderIconStyle = (status: 'before' | 'after'): React.CSSProperties => ({
    width:          36,
    height:         36,
    borderRadius:   '50%',
    background:     status === 'before' ? lightColors.background.primary : '#FFF',
    border:         `1px solid ${status === 'before' ? lightColors.border.soft : `${lightColors.brand.green}33`}`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    margin:         '6px 0',
    boxShadow:      status === 'after' ? `0 2px 8px ${lightColors.brand.green}14` : 'none',
  });

  const photoWeightStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small - 2, // 12px
    fontWeight: '700',
    color:      lightColors.text.secondary,
  };

  const linkButtonStyle: React.CSSProperties = {
    background: 'none',
    border:     'none',
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: '600',
    color:      lightColors.brand.greenDark,
    cursor:     'pointer',
    padding:    '4px 0',
    textAlign:  'left',
    display:    'inline-block',
  };

  // ── Card 5 — Sequência e consistência ────────────────────────────────────────

  const seqRowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'baseline',
    gap:        4,
    margin:     '8px 0',
  };

  const seqValueStyle: React.CSSProperties = {
    fontSize:   32,
    fontWeight: '800',
    color:      lightColors.text.navy,
  };

  const seqLabelStyle: React.CSSProperties = {
    fontSize:   fontSize.small,
    fontWeight: '600',
    color:      lightColors.brand.greenDark,
  };

  const dotsRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    marginTop:      gap.medium,
    padding:        '0 4px',
  };

  const dayDotContainerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           6,
  };

  const dayLabelStyle: React.CSSProperties = {
    fontSize:   fontSize.small - 3, // 11px
    fontWeight: '600',
    color:      lightColors.text.secondary,
  };

  const dotStyle2 = (completed: boolean): React.CSSProperties => ({
    width:          24,
    height:         24,
    borderRadius:   '50%',
    background:     completed ? lightColors.brand.green : '#FFF',
    border:         `2.5px solid ${completed ? 'transparent' : lightColors.border.soft}`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    boxShadow:      completed ? `0 2px 6px ${lightColors.brand.green}44` : 'none',
  });

  // ── Card 6 — Próximo passo ───────────────────────────────────────────────────

  const nextMilestoneBoxStyle: React.CSSProperties = {
    background:    `${lightColors.brand.green}12`,
    border:        `1px dashed ${lightColors.brand.green}66`,
    borderRadius:  radius.secondary,
    padding:       '12px 16px',
    display:       'flex',
    alignItems:    'center',
    justifyContent: 'center',
    gap:           gap.small,
    marginTop:     gap.medium,
  };

  const nextMilestoneTextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: '700',
    color:      lightColors.brand.greenDark,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Resultados" onBack={onBack} />

      <div style={containerStyle}>
        
        {/* ── Card 1 — Conquista principal ────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingDown size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Você já eliminou</span>
          </div>

          <div style={card1ValueStyle}>4,8 kg</div>
          <p style={cardSubtextStyle}>desde o início da sua jornada.</p>
          
          <div style={badgeStyle}>
            32% da sua meta concluída
          </div>
        </GLPYCard>

        {/* ── Card 2 — Progresso da meta ──────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Scale size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Progresso da meta</span>
          </div>

          <div style={metaMetricsRowStyle}>
            <div style={metaMetricBoxStyle}>
              <span style={metaLabelStyle}>Peso inicial</span>
              <span style={metaValueStyle}>84,8 kg</span>
            </div>
            <div style={metaMetricBoxStyle}>
              <span style={metaLabelStyle}>Peso atual</span>
              <span style={metaValueStyle}>80,0 kg</span>
            </div>
            <div style={metaMetricBoxStyle}>
              <span style={metaLabelStyle}>Meta</span>
              <span style={metaValueStyle}>58,0 kg</span>
            </div>
            <div style={metaMetricBoxStyle}>
              <span style={metaLabelStyle}>Falta eliminar</span>
              <span style={{ ...metaValueStyle, color: lightColors.brand.greenDark }}>22,0 kg</span>
            </div>
          </div>

          <div style={progressBarTrackStyle}>
            <div style={progressBarFillStyle} />
          </div>
          <div style={labelsRowStyle}>
            <span>0%</span>
            <span>32%</span>
            <span>META</span>
          </div>
        </GLPYCard>

        {/* ── Card 3 — Evolução resumida ──────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingDown size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Evolução resumida</span>
          </div>

          <div style={gridStyle}>
            {STATS_GRID.map((stat) => {
              const StatIcon = stat.Icon;
              return (
                <div key={stat.label} style={gridItemStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StatIcon size={14} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                    <span style={metaLabelStyle}>{stat.label}</span>
                  </div>
                  <span style={gridValStyle}>{stat.value}</span>
                </div>
              );
            })}
          </div>
        </GLPYCard>

        {/* ── Card 4 — Transformação visual ───────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Image size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Transformação visual</span>
          </div>

          <div style={photoContainerStyle}>
            <div style={beforeBoxStyle}>
              <span style={photoLabelStyle}>Antes</span>
              <div style={placeholderIconStyle('before')}>
                <Camera size={16} color={lightColors.text.secondary} strokeWidth={2.25} />
              </div>
              <span style={photoWeightStyle}>84,8 kg</span>
            </div>
            <div style={afterBoxStyle}>
              <span style={photoLabelStyle}>Depois</span>
              <div style={placeholderIconStyle('after')}>
                <Camera size={16} color={lightColors.brand.greenDark} strokeWidth={2.25} />
              </div>
              <span style={{ ...photoWeightStyle, color: lightColors.brand.greenDark }}>80,0 kg</span>
            </div>
          </div>

          <button
            style={linkButtonStyle}
            onClick={() => {
              console.log("open_visual_progress_share");
            }}
          >
            Ver evolução visual &gt;
          </button>
        </GLPYCard>

        {/* ── Card 5 — Sequência e consistência ────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <CheckSquare size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Sua sequência</span>
          </div>

          <div style={seqRowStyle}>
            <span style={seqValueStyle}>12</span>
            <span style={seqLabelStyle}>dias</span>
          </div>
          <p style={cardSubtextStyle}>
            Continue assim. Pequenos registros constroem grandes mudanças.
          </p>

          <div style={dotsRowStyle}>
            {WEEK_DAYS.map((day, i) => (
              <div key={i} style={dayDotContainerStyle}>
                <span style={dayLabelStyle}>{day.label}</span>
                <div style={dotStyle2(day.completed)}>
                  {day.completed && <Check size={11} color="#FFF" strokeWidth={3.5} />}
                </div>
              </div>
            ))}
          </div>
        </GLPYCard>

        {/* ── Card 6 — Próximo passo ───────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Sparkles size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Próximo passo</span>
          </div>
          <p style={cardSubtextStyle}>
            Completar 14 dias de consistência.
          </p>

          <div style={nextMilestoneBoxStyle}>
            <span style={nextMilestoneTextStyle}>Faltam 2 dias</span>
          </div>
        </GLPYCard>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            console.log("open_progress_timeline");
          }}
        >
          Ver linha do tempo
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
