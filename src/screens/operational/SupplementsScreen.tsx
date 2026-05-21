// GLPY — Supplements Screen (Placeholder — Em breve)
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React from 'react';
import { Pill, Dumbbell, Droplets, Zap, TrendingUp } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface SupplementsScreenProps {
  onBack?: () => void;
}

const PREVIEW_ITEMS = [
  { Icon: Dumbbell,   label: 'Proteína',              color: '#00C27A' },
  { Icon: Droplets,   label: 'Eletrólitos',            color: '#3B82F6' },
  { Icon: Zap,        label: 'Suporte muscular',       color: '#F59E0B' },
  { Icon: TrendingUp, label: 'Energia e recuperação',  color: '#8B5CF6' },
] as const;

export default function SupplementsScreen({ onBack }: SupplementsScreenProps) {
  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Suplementos GLPY" onBack={onBack} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: gap.medium }}>

        {/* ── Header card ───────────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          style={{
            background: `linear-gradient(135deg, #f3f7f5, #edf7f2)`,
            border:     `1.5px solid ${lightColors.brand.green}33`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width:           40,
              height:          40,
              borderRadius:    14,
              background:      `${lightColors.brand.green}20`,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              flexShrink:      0,
              border:          `1px solid ${lightColors.brand.green}33`,
            }}>
              <Pill size={20} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <div>
              <span style={{
                fontFamily:    fontFamily.primary,
                fontSize:      10,
                fontWeight:    '800',
                color:         lightColors.brand.greenDark,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display:       'block',
                marginBottom:  2,
              }}>
                Em breve
              </span>
              <h2 style={{
                fontFamily: fontFamily.primary,
                fontSize:   fontSize.h2,
                fontWeight: fontWeight.h1,
                color:      lightColors.text.navy,
                margin:     0,
              }}>
                Suplementos GLPY
              </h2>
            </div>
          </div>
          <p style={{
            fontFamily: fontFamily.primary,
            fontSize:   fontSize.small,
            color:      lightColors.text.secondary,
            margin:     0,
            lineHeight: 1.55,
          }}>
            Em breve, recomendações inteligentes para apoiar sua jornada metabólica.
          </p>
        </GLPYCard>

        {/* ── Descrição ─────────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <p style={{
            fontFamily: fontFamily.primary,
            fontSize:   fontSize.bodyDefault,
            color:      lightColors.text.navy,
            margin:     0,
            lineHeight: 1.6,
          }}>
            O GLPY vai cruzar seus dados de atividade, proteína, água, energia e protocolo ativo para sugerir suporte nutricional de forma personalizada.
          </p>
        </GLPYCard>

        {/* ── Preview de categorias ─────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <span style={{
            fontFamily:    fontFamily.primary,
            fontSize:      11,
            fontWeight:    '800',
            color:         lightColors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display:       'block',
            marginBottom:  12,
          }}>
            O que está chegando
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PREVIEW_ITEMS.map(({ Icon, label, color }) => (
              <div
                key={label}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          12,
                  padding:      '10px 12px',
                  borderRadius: radius.secondary,
                  background:   lightColors.background.secondary,
                  border:       `1px solid ${lightColors.border.soft}`,
                }}
              >
                <div style={{
                  width:           32,
                  height:          32,
                  borderRadius:    10,
                  background:      `${color}18`,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  flexShrink:      0,
                }}>
                  <Icon size={16} color={color} strokeWidth={2} />
                </div>
                <span style={{
                  fontFamily: fontFamily.primary,
                  fontSize:   fontSize.small,
                  fontWeight: fontWeight.h3,
                  color:      lightColors.text.navy,
                  flex:       1,
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily:    fontFamily.primary,
                  fontSize:      9,
                  fontWeight:    '700',
                  color:         lightColors.text.secondary,
                  background:    lightColors.background.secondary,
                  padding:       '3px 8px',
                  borderRadius:  99,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border:        `1px solid ${lightColors.border.soft}`,
                }}>
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </GLPYCard>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton variant="primary" size="lg" fullWidth onClick={onBack}>
          Voltar para Home
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
