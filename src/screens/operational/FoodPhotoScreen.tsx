// GLPY — Food Photo Screen (Placeholder — Em breve)
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md

import React from 'react';
import { Camera, Beef, Star, Droplets, Sparkles } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap } from '../../theme/spacing';
import { radius } from '../../theme/radius';

interface FoodPhotoScreenProps {
  onBack?: () => void;
}

const PREVIEW_ITEMS = [
  { Icon: Beef,     label: 'Proteína estimada',        color: '#EF4444' },
  { Icon: Star,     label: 'Qualidade do prato',       color: '#F59E0B' },
  { Icon: Droplets, label: 'Hidratação complementar',  color: '#3B82F6' },
  { Icon: Sparkles, label: 'Sugestão da IA GLPY',      color: '#8B5CF6' },
] as const;

export default function FoodPhotoScreen({ onBack }: FoodPhotoScreenProps) {
  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Foto do Prato" onBack={onBack} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: gap.medium }}>

        {/* ── Header card ───────────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          style={{
            background: `linear-gradient(135deg, #fdf3f8, #fce7f3)`,
            border:     `1.5px solid #f9a8d433`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width:           40,
              height:          40,
              borderRadius:    14,
              background:      '#fce7f3',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              flexShrink:      0,
              border:          `1px solid #f9a8d433`,
            }}>
              <Camera size={20} color="#ec4899" strokeWidth={2} />
            </div>
            <div>
              <span style={{
                fontFamily:    fontFamily.primary,
                fontSize:      10,
                fontWeight:    '800',
                color:         '#be185d',
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
                Foto do Prato
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
            Análise inteligente em preparação.
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
            Em breve, você poderá enviar a foto da sua refeição para receber uma leitura simples sobre proteína, equilíbrio do prato e proteção metabólica.
          </p>
        </GLPYCard>

        {/* ── Preview de funcionalidades ────────────────────────────────────── */}
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
