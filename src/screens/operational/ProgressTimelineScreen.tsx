// GLPY — Progress Timeline Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela exibe uma linha do tempo mockada no MVP.
// O GLPY não interpreta dados como diagnóstico nem substitui orientação profissional.
// Futuramente esta tela será conectada ao DailyTrackingEngine, WeightTrackingEngine, ProtocolEngine, XP/Streak Engine e GLPY IA.
// A experiência deve reforçar progresso, continuidade e identidade, sem gerar ansiedade ou culpa.

import React from 'react';
import { Lightbulb, Calendar, Compass, Milestone, Sparkles, Award } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProgressTimelineScreenProps {
  onBack?: () => void;
}

// ── Constants & Mock Data ─────────────────────────────────────────────────────

interface TimelineEvent {
  title: string;
  date: string;
  text: string;
  status: 'concluido' | 'proximo';
}

const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  { title: 'Jornada iniciada', date: '07/05/2026', text: 'Você deu o primeiro passo no GLPY.', status: 'concluido' },
  { title: 'Primeiro peso registrado', date: '07/05/2026', text: 'Peso inicial registrado: 84,8 kg.', status: 'concluido' },
  { title: 'Primeira aplicação registrada', date: '08/05/2026', text: 'Sua jornada da caneta começou a ser acompanhada.', status: 'concluido' },
  { title: 'Primeiro check-in concluído', date: '09/05/2026', text: 'Você concluiu seu primeiro check-in diário.', status: 'concluido' },
  { title: 'Primeiro marco de peso', date: '13/05/2026', text: 'Você já eliminou 4,8 kg desde o início.', status: 'concluido' },
  { title: 'Foto de evolução adicionada', date: '13/05/2026', text: 'Sua transformação visual começou a ser registrada.', status: 'concluido' },
  { title: 'Próximo marco', date: 'Em breve', text: 'Completar 14 dias de sequência.', status: 'proximo' },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProgressTimelineScreen({ onBack }: ProgressTimelineScreenProps) {

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

  // ── Card 1 — Sua jornada ────────────────────────────────────────────────────

  const metricsRowStyle: React.CSSProperties = {
    display:       'flex',
    justifyContent: 'space-between',
    gap:           gap.small,
    marginTop:     gap.medium,
  };

  const metricBoxStyle: React.CSSProperties = {
    flex:          1,
    background:    lightColors.background.secondary,
    padding:       '12px 8px',
    borderRadius:  radius.secondary,
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           4,
    textAlign:     'center',
  };

  const metricLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small - 3, // 11px
    color:      lightColors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  };

  const metricValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: '700',
    color:      lightColors.text.navy,
  };

  // ── Card 2 — Marcos da evolução ──────────────────────────────────────────────

  const timelineContainerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    marginTop:     gap.medium,
    paddingLeft:   4,
  };

  const itemContainerStyle = (isLast: boolean): React.CSSProperties => ({
    position:      'relative',
    paddingLeft:   28,
    paddingBottom: isLast ? 0 : 28,
  });

  const lineStyle = (status: 'concluido' | 'proximo'): React.CSSProperties => ({
    position:   'absolute',
    left:       9,
    top:        8,
    bottom:     -28,
    width:      2,
    background: status === 'concluido' ? `${lightColors.brand.green}66` : lightColors.border.soft,
    zIndex:     1,
  });

  const dotStyle = (status: 'concluido' | 'proximo'): React.CSSProperties => ({
    position:     'absolute',
    left:         4,
    top:          4,
    width:        12,
    height:       12,
    borderRadius: '50%',
    background:   status === 'concluido' ? lightColors.brand.greenDark : lightColors.text.secondary,
    border:       '2.5px solid #FFF',
    boxShadow:    status === 'concluido' ? `0 0 0 2.5px ${lightColors.brand.green}44` : 'none',
    zIndex:       2,
  });

  const eventContentStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
  };

  const eventTitleRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    gap:            gap.small,
  };

  const eventTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: '700',
    color:      lightColors.text.navy,
  };

  const eventDateStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small - 2, // 12px
    color:      lightColors.text.secondary,
    fontWeight: '500',
  };

  const eventTextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small - 1, // 13px
    color:      lightColors.text.secondary,
    lineHeight: 1.5,
    margin:     0,
  };

  // ── Card 3 — Próximo marco ───────────────────────────────────────────────────

  const nextMilestoneBoxStyle: React.CSSProperties = {
    background:    `${lightColors.brand.green}12`,
    border:        `1px dashed ${lightColors.brand.green}66`,
    borderRadius:  radius.secondary,
    padding:       '14px 16px',
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

  // ── Card 4 — Dica GLPY ───────────────────────────────────────────────────────

  const dicaHeaderStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          gap.small,
    marginBottom: 6,
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
    margin:     0,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Linha do tempo" onBack={onBack} />

      <div style={containerStyle}>
        
        {/* ── Card 1 — Sua jornada ────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Compass size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Sua jornada</span>
          </div>
          <p style={cardSubtextStyle}>
            Cada registro conta uma parte da sua evolução. Veja os marcos que você já construiu.
          </p>

          <div style={metricsRowStyle}>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>Início</span>
              <span style={metricValueStyle}>07/05/2026</span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>Sequência</span>
              <span style={{ ...metricValueStyle, color: lightColors.brand.greenDark }}>12 dias</span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>Marcos</span>
              <span style={metricValueStyle}>6</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Card 2 — Marcos da evolução ──────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Milestone size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Marcos da evolução</span>
          </div>

          <div style={timelineContainerStyle}>
            {TIMELINE_EVENTS.map((event, index) => {
              const isLast = index === TIMELINE_EVENTS.length - 1;
              return (
                <div key={event.title} style={itemContainerStyle(isLast)}>
                  {!isLast && <div style={lineStyle(event.status)} />}
                  <div style={dotStyle(event.status)} />
                  
                  <div style={eventContentStyle}>
                    <div style={eventTitleRowStyle}>
                      <span style={eventTitleStyle}>{event.title}</span>
                      <span style={eventDateStyle}>{event.date}</span>
                    </div>
                    <p style={eventTextStyle}>{event.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GLPYCard>

        {/* ── Card 3 — Próximo marco ───────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Sparkles size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Próximo marco</span>
          </div>
          <p style={cardSubtextStyle}>
            Faltam apenas 2 dias para completar 14 dias de sequência.
          </p>

          <div style={nextMilestoneBoxStyle}>
            <Award size={16} color={lightColors.brand.greenDark} strokeWidth={2.25} />
            <span style={nextMilestoneTextStyle}>14 dias de consistência</span>
          </div>
        </GLPYCard>

        {/* ── Card 4 — Dica GLPY ───────────────────────────────────────────────── */}
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
            A evolução não acontece em um único dia. Ela aparece nos pequenos registros que você mantém ao longo da jornada.
          </p>
        </GLPYCard>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            console.log("open_results_screen");
          }}
        >
          Ver resultados
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
