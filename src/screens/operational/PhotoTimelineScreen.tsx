// GLPY — Photo Timeline Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Fotos corporais salvas em glpy_body_photos (localStorage, base64 comprimido).
// O GLPY deve incentivar progresso sem pressionar exposição pública.
// Futuramente o botão "Ver minha evolução" abrirá a VisualProgressShareScreen.

import React, { useState, useRef } from 'react';
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface BodyPhoto {
  id:           string;
  date:         string;       // YYYY-MM-DD
  createdAt:    string;       // ISOString
  weight:       number | null;
  imageDataUrl: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readPhotos(): BodyPhoto[] {
  try {
    const raw = localStorage.getItem('glpy_body_photos');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function readCurrentWeight(): number | null {
  try {
    for (const key of ['glpy_latest_weight', 'glpy_peso_atual']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const v = parseFloat(String(parsed?.weight ?? parsed ?? ''));
      if (!isNaN(v) && v > 0) return v;
    }
    const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
    const v = parseFloat(String(onb.peso_atual ?? onb.pesoAtual ?? ''));
    return !isNaN(v) && v > 0 ? v : null;
  } catch { return null; }
}

// Redimensiona para máx 800px e comprime para JPEG 0.8 — mantém fotos abaixo de ~300KB
function resizeImage(dataUrl: string, maxSize = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else        { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
}

function fmtDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PhotoTimelineScreen({ onBack }: PhotoTimelineScreenProps) {
  const [photos, setPhotos] = useState<BodyPhoto[]>(() => readPhotos());
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAddPhoto() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const imageDataUrl = await resizeImage(raw);
      const newPhoto: BodyPhoto = {
        id:           `photo_${Date.now()}`,
        date:         new Date().toISOString().split('T')[0],
        createdAt:    new Date().toISOString(),
        weight:       readCurrentWeight(),
        imageDataUrl,
      };
      const existing = readPhotos();
      const updated = [...existing, newPhoto];
      localStorage.setItem('glpy_body_photos', JSON.stringify(updated));
      window.dispatchEvent(new Event('local-storage-change'));
      setPhotos(updated);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  }

  function handleViewProgress() {
    window.location.href = '/preview/visual-progress-share';
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const firstPhoto  = photos.length > 0 ? photos[0]                    : null;
  const lastPhoto   = photos.length > 1 ? photos[photos.length - 1]    : null;
  const beforePhoto = firstPhoto;
  const afterPhoto  = lastPhoto;

  const lastUpdateStr = (lastPhoto ?? firstPhoto)
    ? fmtDateBR((lastPhoto ?? firstPhoto)!.date)
    : '—';

  const weightEvolutionStr = (() => {
    if (!firstPhoto?.weight || !lastPhoto?.weight) return null;
    const diff = firstPhoto.weight - lastPhoto.weight;
    if (diff <= 0) return null;
    return `${diff.toFixed(1).replace('.', ',')} kg eliminados`;
  })();

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

  // card 2 — before/after
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
    overflow:       'hidden',
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
    zIndex:       1,
  };

  const photoWeightBadgeStyle: React.CSSProperties = {
    position:     'absolute',
    bottom:       10,
    left:         10,
    background:   'rgba(10,22,40,0.65)',
    borderRadius: 99,
    padding:      '2px 8px',
    fontFamily:   fontFamily.primary,
    fontSize:     10,
    fontWeight:   fontWeight.h3,
    color:        '#fff',
    zIndex:       1,
  };

  const realPhotoStyle: React.CSSProperties = {
    position:   'absolute',
    inset:      0,
    width:      '100%',
    height:     '100%',
    objectFit:  'cover',
    borderRadius: radius.secondary,
  };

  // card 3
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

  // ── Render helpers ─────────────────────────────────────────────────────────

  function PhotoSlot({ photo, label }: { photo: BodyPhoto | null; label: string }) {
    return (
      <div style={photoPlaceholderStyle}>
        <span style={photoLabelBadgeStyle}>{label}</span>
        {photo ? (
          <>
            <img src={photo.imageDataUrl} alt={label} style={realPhotoStyle} />
            {photo.weight && (
              <span style={photoWeightBadgeStyle}>{photo.weight.toFixed(1).replace('.', ',')} kg</span>
            )}
          </>
        ) : (
          <Camera size={28} color={lightColors.border.soft} strokeWidth={1.5} />
        )}
      </div>
    );
  }

  return (
    <GLPYScreen variant="light">
      {/* hidden file input — accept images from gallery or camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

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
              <span style={summaryValueStyle}>{lastUpdateStr}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Fotos registradas</span>
              <span style={summaryValueStyle}>{photos.length}</span>
            </div>
            <div style={summaryRowStyle}>
              <span style={summaryLabelStyle}>Evolução</span>
              <span style={summaryValueStyle}>{weightEvolutionStr ?? '—'}</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Card 2 — Antes e depois ────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Camera size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Antes e depois</span>
          </div>
          {photos.length === 0 && (
            <p style={{ ...cardSubtextStyle, marginBottom: gap.small }}>
              Adicione sua primeira foto para acompanhar sua evolução além da balança.
            </p>
          )}
          <div style={beforeAfterRowStyle}>
            <PhotoSlot photo={beforePhoto} label="Antes" />
            <PhotoSlot photo={afterPhoto}  label="Depois" />
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
              Adicionar foto
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
