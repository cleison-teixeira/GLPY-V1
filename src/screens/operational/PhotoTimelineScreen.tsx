// GLPY — Photo Timeline Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela usa placeholders/mock para fotos no MVP.
// O upload real será implementado futuramente.
// O GLPY deve incentivar progresso sem pressionar exposição pública.
//
// Futuramente o botão "Ver minha evolução" abrirá a VisualProgressShareScreen.

import React, { useState } from 'react';
import { TrendingUp, Camera, Lightbulb } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';

// ── Props ─────────────────────────────────────────────────────────────────────

interface PhotoTimelineScreenProps {
  onBack?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PhotoTimelineScreen({ onBack }: PhotoTimelineScreenProps) {
  const [photoAdded, setPhotoAdded] = useState(false);

  function handleAddPhoto() {
    console.log('[GLPY] add_photo');
    setPhotoAdded(prev => !prev);
  }

  // Futuramente este botão abrirá a VisualProgressShareScreen.
  function handleViewProgress() {
    console.log('[GLPY] open_visual_progress_share_screen');
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

  // card 1 — summary block
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

  // card 2 — before/after: side by side, portrait proportion
  const beforeAfterRowStyle: React.CSSProperties = {
    display: 'flex',
    gap:     gap.small,
  };

  const photoPlaceholderStyle: React.CSSProperties = {
    flex:           1,
    height:         200,
    borderRadius:   radius.secondary,
    background:     lightColors.background.secondary,
    border:         `1.5px dashed ${lightColors.border.soft}`,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    position:       'relative',
  };

  const photoLabelBadgeStyle: React.CSSProperties = {
    position:     'absolute',
    top:          10,
    left:         10,
    background:   lightColors.background.primary,
    border:       `1px solid ${lightColors.border.soft}`,
    borderRadius: 99,
    padding:      '3px 10px',
    fontFamily:   fontFamily.primary,
    fontSize:     11,
    fontWeight:   fontWeight.h3,
    color:        lightColors.text.secondary,
    boxShadow:    lightShadows.soft,
  };

  // card 3 — add photo
  const addPhotoButtonWrapStyle: React.CSSProperties = {
    marginTop: 4,
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
      <GLPYHeader title="Fotos" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Card 1 — Evolução visual ───────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingUp size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Sua transformação visual</span>
          </div>
          <p style={cardSubtextStyle}>
            Acompanhe sua evolução com fotos e veja mudanças que a balança nem sempre mostra.
          </p>
          <div style={summaryBlockStyle}>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Última atualização</span>
              <span style={summaryValueStyle}>12/05/2026</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Fotos registradas</span>
              <span style={summaryValueStyle}>2</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Evolução</span>
              <span style={summaryValueStyle}>4,8 kg eliminados</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Card 2 — Antes e depois — lado a lado, proporção corporal ─────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Camera size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Antes e depois</span>
          </div>
          <div style={beforeAfterRowStyle}>
            <div style={photoPlaceholderStyle}>
              <span style={photoLabelBadgeStyle}>Antes</span>
              <Camera size={28} color={lightColors.border.soft} strokeWidth={1.5} />
            </div>
            <div style={photoPlaceholderStyle}>
              <span style={photoLabelBadgeStyle}>Depois</span>
              <Camera size={28} color={lightColors.border.soft} strokeWidth={1.5} />
            </div>
          </div>
        </GLPYCard>

        {/* ── Card 3 — Adicionar nova foto ───────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Camera size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Adicionar foto corporal</span>
          </div>
          <p style={{ ...cardSubtextStyle, marginBottom: 0 }}>
            Registre uma nova foto para acompanhar sua evolução.
          </p>
          <div style={addPhotoButtonWrapStyle}>
            <GLPYButton
              variant="secondary"
              size="sm"
              onClick={handleAddPhoto}
            >
              {photoAdded ? 'Foto adicionada ✓' : 'Adicionar foto'}
            </GLPYButton>
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
            Fotos ajudam você a perceber evolução visual, postura e consistência.
            Compartilhe apenas quando se sentir confortável.
          </p>
        </GLPYCard>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleViewProgress}
        >
          Ver minha evolução
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
