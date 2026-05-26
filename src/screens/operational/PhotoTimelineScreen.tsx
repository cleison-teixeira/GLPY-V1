// GLPY — Photo Timeline Screen
// System: Operational — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Fotos corporais salvas em glpy_body_photos (localStorage, base64 comprimido).
// Formato: { id, date, createdAt, weight, imageDataUrl, role }
// role: 'before' | 'after' | 'progress' — fotos antigas sem role migram para 'progress'.
// O GLPY deve incentivar progresso sem pressionar exposição pública.

import React, { useState, useRef } from 'react';
import { TrendingUp, Camera, Lightbulb, X } from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { lightShadows } from '../../theme/shadows';
import { glpyStore } from '../../data/glpyStore';

// ── Props ─────────────────────────────────────────────────────────────────────

interface PhotoTimelineScreenProps {
  onBack?: () => void;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PhotoRole = 'before' | 'after' | 'progress';

interface BodyPhoto {
  id:           string;
  date:         string;       // YYYY-MM-DD
  createdAt:    string;       // ISOString
  weight:       number | null;
  imageDataUrl: string;
  role:         PhotoRole;
}

interface ModalState {
  imageDataUrl: string;
  date:         string;
  weightInput:  string;
  role:         PhotoRole;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readPhotos(): BodyPhoto[] {
  try {
    const parsed = glpyStore.progress.getBodyPhotos();
    if (!Array.isArray(parsed)) return [];
    // migração: fotos sem role recebem 'progress'
    return parsed.map((p: BodyPhoto) => ({ ...p, role: p.role ?? 'progress' }));
  } catch { return []; }
}

// Aceita vírgula ou ponto como separador decimal
function parseBRWeight(s: string): number | null {
  const v = parseFloat(s.trim().replace(',', '.'));
  return !isNaN(v) && v > 10 && v < 500 ? v : null;
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
  const [photos, setPhotos]   = useState<BodyPhoto[]>(() => readPhotos());
  const [modal, setModal]     = useState<ModalState | null>(null);
  const fileInputRef          = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) fileInputRef.current.value = '';
      setModal({
        imageDataUrl,
        date:        new Date().toISOString().split('T')[0],
        weightInput: '',
        role:        'progress',
      });
    };
    reader.readAsDataURL(file);
  }

  function handleSavePhoto() {
    if (!modal) return;
    const newPhoto: BodyPhoto = {
      id:           `photo_${Date.now()}`,
      date:         modal.date || new Date().toISOString().split('T')[0],
      createdAt:    new Date().toISOString(),
      weight:       parseBRWeight(modal.weightInput),
      imageDataUrl: modal.imageDataUrl,
      role:         modal.role,
    };
    const existing = readPhotos();
    const updated  = [...existing, newPhoto];
    glpyStore.progress.saveBodyPhotos(updated);
    window.dispatchEvent(new Event('local-storage-change'));
    setPhotos(updated);
    setModal(null);
  }

  function handleViewProgress() {
    window.location.href = '/preview/visual-progress-share';
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  // Antes: primeira com role 'before', senão primeira foto
  const beforePhoto = photos.find(p => p.role === 'before')
    ?? (photos.length > 0 ? photos[0] : null);

  // Depois: última com role 'after', senão última (requer 2+ fotos)
  const afterCandidates = photos.filter(p => p.role === 'after');
  const afterPhoto = afterCandidates.length > 0
    ? afterCandidates[afterCandidates.length - 1]
    : (photos.length > 1 ? photos[photos.length - 1] : null);

  const lastAny        = photos.length > 0 ? photos[photos.length - 1] : null;
  const lastUpdateStr  = lastAny ? fmtDateBR(lastAny.date) : '—';

  const weightEvolutionStr = (() => {
    if (!beforePhoto?.weight || !afterPhoto?.weight) return null;
    const diff = beforePhoto.weight - afterPhoto.weight;
    if (diff <= 0) return null;
    return `${diff.toFixed(1).replace('.', ',')} kg eliminados`;
  })();

  // ── Shared card styles ─────────────────────────────────────────────────────

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

  // card 1 — summary
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
    position:     'absolute',
    inset:        0,
    width:        '100%',
    height:       '100%',
    objectFit:    'cover',
    borderRadius: radius.secondary,
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

  // ── Modal styles ───────────────────────────────────────────────────────────

  const modalLabelStyle: React.CSSProperties = {
    display:      'block',
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.small,
    fontWeight:   fontWeight.h3,
    color:        lightColors.text.navy,
    marginBottom: 6,
  };

  const modalInputStyle: React.CSSProperties = {
    width:        '100%',
    padding:      '11px 12px',
    border:       `1px solid ${lightColors.border.soft}`,
    borderRadius: radius.secondary,
    fontFamily:   fontFamily.primary,
    fontSize:     fontSize.bodyDefault,
    color:        lightColors.text.navy,
    background:   lightColors.background.secondary,
    marginBottom: 16,
    boxSizing:    'border-box',
    outline:      'none',
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  function PhotoSlot({ photo, label }: { photo: BodyPhoto | null; label: string }) {
    return (
      <div style={photoPlaceholderStyle}>
        <span style={photoLabelBadgeStyle}>{label}</span>
        {photo ? (
          <>
            <img src={photo.imageDataUrl} alt={label} style={realPhotoStyle} />
            <span style={photoWeightBadgeStyle}>
              {photo.weight ? `${photo.weight.toFixed(1).replace('.', ',')} kg` : '— kg'}
            </span>
          </>
        ) : (
          <Camera size={28} color={lightColors.border.soft} strokeWidth={1.5} />
        )}
      </div>
    );
  }

  const ROLE_OPTIONS: { key: PhotoRole; label: string }[] = [
    { key: 'before',   label: 'Antes'    },
    { key: 'after',    label: 'Depois'   },
    { key: 'progress', label: 'Registro' },
  ];

  return (
    <GLPYScreen variant="light">
      {/* hidden file input */}
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
          <div style={{ marginTop: 4 }}>
            <GLPYButton variant="secondary" size="sm" onClick={handleAddPhoto}>
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
        <GLPYButton variant="primary" size="lg" fullWidth onClick={handleViewProgress}>
          Ver minha evolução
        </GLPYButton>

      </div>

      {/* ── Modal — dados da foto ──────────────────────────────────────────────── */}
      {modal && (
        <>
          {/* Overlay — não fecha ao clicar para evitar perda acidental da foto */}
          <div
            style={{
              position:   'fixed',
              inset:      0,
              background: 'rgba(10,22,40,0.52)',
              zIndex:     100,
            }}
          />

          {/* Bottom sheet */}
          <div
            style={{
              position:     'fixed',
              bottom:       0,
              left:         0,
              right:        0,
              zIndex:       101,
              background:   lightColors.background.primary,
              borderRadius: '20px 20px 0 0',
              padding:      '20px 20px 36px',
              boxShadow:    '0 -8px 40px rgba(10,22,40,0.14)',
              maxHeight:    '88vh',
              overflowY:    'auto',
            }}
          >
            {/* Drag pill */}
            <div style={{ width: 36, height: 4, background: lightColors.border.soft, borderRadius: 99, margin: '0 auto 18px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: fontFamily.primary, fontSize: fontSize.bodyDefault, fontWeight: fontWeight.h3, color: lightColors.text.navy }}>
                Nova foto corporal
              </span>
              <button
                onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
              >
                <X size={18} color={lightColors.text.secondary} />
              </button>
            </div>

            {/* Preview */}
            <img
              src={modal.imageDataUrl}
              alt="Preview"
              style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: radius.secondary, marginBottom: 20 }}
            />

            {/* Data */}
            <label style={modalLabelStyle}>Data da foto</label>
            <input
              type="date"
              value={modal.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setModal(m => m ? { ...m, date: e.target.value } : m)}
              style={modalInputStyle}
            />

            {/* Peso */}
            <label style={modalLabelStyle}>
              Peso naquela foto{' '}
              <span style={{ fontWeight: 400, color: lightColors.text.secondary }}>(opcional)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={modal.weightInput}
              onChange={e => setModal(m => m ? { ...m, weightInput: e.target.value } : m)}
              placeholder="Ex: 85,0"
              style={modalInputStyle}
            />

            {/* Tipo da foto */}
            <label style={{ ...modalLabelStyle, marginBottom: 10 }}>Tipo da foto</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {ROLE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setModal(m => m ? { ...m, role: key } : m)}
                  style={{
                    flex:         1,
                    padding:      '10px 4px',
                    borderRadius: radius.secondary,
                    border:       `1.5px solid ${modal.role === key ? lightColors.brand.green : lightColors.border.soft}`,
                    background:   modal.role === key ? lightColors.brand.green : lightColors.background.secondary,
                    color:        modal.role === key ? '#fff' : lightColors.text.navy,
                    fontFamily:   fontFamily.primary,
                    fontSize:     fontSize.small,
                    fontWeight:   modal.role === key ? fontWeight.h3 : '400',
                    cursor:       'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Salvar */}
            <GLPYButton variant="primary" size="lg" fullWidth onClick={handleSavePhoto}>
              Salvar foto
            </GLPYButton>

            {/* Cancelar */}
            <button
              onClick={() => setModal(null)}
              style={{
                display:    'block',
                width:      '100%',
                marginTop:  12,
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                fontFamily: fontFamily.primary,
                fontSize:   fontSize.small,
                color:      lightColors.text.secondary,
                padding:    '8px 0',
              }}
            >
              Cancelar
            </button>

          </div>
        </>
      )}

    </GLPYScreen>
  );
}
