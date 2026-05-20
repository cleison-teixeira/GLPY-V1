// GLPY — Weight History Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela exibe histórico de peso mockado no MVP.
// O GLPY não interpreta peso como diagnóstico nem substitui orientação profissional.
// Futuramente esta tela será conectada ao WeightTrackingEngine, gráficos reais, tendências e GLPY IA.
// A experiência deve reforçar progresso sem gerar ansiedade ou culpa.

import React from 'react';
import { Lightbulb, TrendingDown, Calendar, Scale } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// ── Props ─────────────────────────────────────────────────────────────────────

interface WeightHistoryScreenProps {
  onBack?: () => void;
}

// ── Constants & Mock Data ─────────────────────────────────────────────────────

const MOCK_CHART_DATA = [
  { date: "07/05", weight: 84.8 },
  { date: "08/05", weight: 84.1 },
  { date: "09/05", weight: 83.2 },
  { date: "10/05", weight: 82.5 },
  { date: "11/05", weight: 81.6 },
  { date: "12/05", weight: 80.8 },
  { date: "13/05", weight: 80.0 },
] as const;

const MOCK_RECENT_RECORDS = [
  { label: 'Hoje',          weight: '80,0 kg', change: '-0,8 kg' },
  { label: '12/05/2026',    weight: '80,8 kg', change: '-0,8 kg' },
  { label: '11/05/2026',    weight: '81,6 kg', change: '-0,9 kg' },
  { label: '10/05/2026',    weight: '82,5 kg', change: '-0,7 kg' },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function WeightHistoryScreen({ onBack }: WeightHistoryScreenProps) {

  // ── Shared styles ──────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
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

  // ── Card 1 — Evolução do peso ──────────────────────────────────────────────

  const metricsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: gap.small,
    marginTop: gap.medium,
  };

  const metricBoxStyle: React.CSSProperties = {
    background:    lightColors.background.secondary,
    padding:       '12px 14px',
    borderRadius:  radius.secondary,
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  };

  const metricLabelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small - 2, // 12px
    color:      lightColors.text.secondary,
    fontWeight: '500',
  };

  const metricValueStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault, // 16px
    fontWeight: '700',
    color:      lightColors.text.navy,
  };

  // ── Card 2 — Gráfico de evolução ───────────────────────────────────────────

  const chartContainerStyle: React.CSSProperties = {
    display:         'flex',
    justifyContent:  'center',
    alignItems:      'center',
    marginTop:       gap.small,
    background:      lightColors.background.secondary,
    borderRadius:    radius.secondary,
    padding:         '24px 12px 16px 12px',
    overflow:        'visible',
  };

  // ── Card 3 — Registros recentes ────────────────────────────────────────────

  const recordListStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    marginTop:     gap.small,
  };

  const recordRowStyle = (isLast: boolean): React.CSSProperties => ({
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingTop:     12,
    paddingBottom:  12,
    borderBottom:   isLast ? 'none' : `1px solid ${lightColors.border.soft}`,
  });

  const recordDateStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    flex:       1,
  };

  const recordWeightStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
    width:      80,
    textAlign:  'right',
  };

  const recordChangeStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.brand.greenDark,
    width:      70,
    textAlign:  'right',
  };

  // ── Card 4 — Dica GLPY ─────────────────────────────────────────────────────

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
      <GLPYHeader title="Histórico de peso" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Card 1 — Evolução do peso ──────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingDown size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Evolução do peso</span>
          </div>
          <p style={cardSubtextStyle}>
            Acompanhe sua jornada com leveza. O importante é a direção, não a perfeição diária.
          </p>

          <div style={metricsGridStyle}>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>Peso inicial</span>
              <span style={metricValueStyle}>84,8 kg</span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>Peso atual</span>
              <span style={metricValueStyle}>80,0 kg</span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>Meta</span>
              <span style={metricValueStyle}>58,0 kg</span>
            </div>
            <div style={metricBoxStyle}>
              <span style={metricLabelStyle}>Eliminado</span>
              <span style={{ ...metricValueStyle, color: lightColors.brand.greenDark }}>4,8 kg</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Card 2 — Gráfico de evolução ─────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Scale size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Últimos registros</span>
          </div>

          <div style={chartContainerStyle}>
            <svg viewBox="0 0 360 160" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lightColors.brand.green} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={lightColors.brand.green} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Gridlines */}
              <line x1="20" y1="25" x2="340" y2="25" stroke={lightColors.border.soft} strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="60" x2="340" y2="60" stroke={lightColors.border.soft} strokeWidth="1" strokeDasharray="4 4" />
              <line x1="20" y1="95" x2="340" y2="95" stroke={lightColors.border.soft} strokeWidth="1" strokeDasharray="4 4" />

              {/* Gradient Area Fill */}
              <path
                d="M 25 25 L 78 35 L 130 48 L 183 58 L 235 71 L 288 83 L 340 95 L 340 120 L 25 120 Z"
                fill="url(#chart-area-gradient)"
              />

              {/* Descending Line */}
              <path
                d="M 25 25 L 78 35 L 130 48 L 183 58 L 235 71 L 288 83 L 340 95"
                fill="none"
                stroke={lightColors.brand.green}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Highlight Coordinates Dots */}
              <circle cx="25" cy="25" r="4" fill={lightColors.brand.greenDark} />
              <circle cx="78" cy="35" r="4" fill={lightColors.brand.greenDark} />
              <circle cx="130" cy="48" r="4" fill={lightColors.brand.greenDark} />
              <circle cx="183" cy="58" r="4" fill={lightColors.brand.greenDark} />
              <circle cx="235" cy="71" r="4" fill={lightColors.brand.greenDark} />
              <circle cx="288" cy="83" r="4" fill={lightColors.brand.greenDark} />

              {/* Halo Glow for the Latest weight */}
              <circle cx="340" cy="95" r="10" fill={lightColors.brand.green} opacity="0.3" />
              <circle cx="340" cy="95" r="5" fill={lightColors.brand.greenDark} stroke="#FFF" strokeWidth="2" />
              
              {/* Highlight text label */}
              <text
                x="340"
                y="78"
                textAnchor="middle"
                fill={lightColors.text.navy}
                fontSize="11"
                fontWeight="700"
                fontFamily={fontFamily.primary}
              >
                80,0 kg
              </text>

              {/* Axis Date Labels */}
              <text x="25" y="140" textAnchor="middle" fill={lightColors.text.secondary} fontSize="10" fontFamily={fontFamily.primary}>
                07/05
              </text>
              <text x="183" y="140" textAnchor="middle" fill={lightColors.text.secondary} fontSize="10" fontFamily={fontFamily.primary}>
                10/05
              </text>
              <text x="340" y="140" textAnchor="middle" fill={lightColors.text.secondary} fontSize="10" fontFamily={fontFamily.primary}>
                13/05
              </text>
            </svg>
          </div>
        </GLPYCard>

        {/* ── Card 3 — Registros recentes ──────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Calendar size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Registros recentes</span>
          </div>

          <div style={recordListStyle}>
            {MOCK_RECENT_RECORDS.map((record, index) => {
              const isLast = index === MOCK_RECENT_RECORDS.length - 1;
              return (
                <div key={record.label} style={recordRowStyle(isLast)}>
                  <span style={recordDateStyle}>{record.label}</span>
                  <span style={recordWeightStyle}>{record.weight}</span>
                  <span style={recordChangeStyle}>{record.change}</span>
                </div>
              );
            })}
          </div>
        </GLPYCard>

        {/* ── Card 4 — Dica GLPY ────────────────────────────────────────────── */}
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
            O peso pode oscilar de um dia para o outro. Observe a tendência da sua jornada e comemore pequenas evoluções.
          </p>
        </GLPYCard>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            console.log("open_current_weight_edit");
          }}
        >
          Adicionar novo peso
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
