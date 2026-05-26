// GLPY — Visual Progress Share Screen
// System: Operational — LIGHT PREMIUM (story card interno DARK PREMIUM)
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Fotos e dados vêm de glpy_body_photos, glpy_medidas_iniciais,
// glpy_medidas_corporais e glpy_protocolo_ativo (localStorage).
// Se dado real não existir, fallback seguro '—'.
// Exportação: html2canvas captura exportStoryCardRef (1080×1920 offscreen).
// Photos usam backgroundImage no exportRef porque html2canvas ignora objectFit em <img>.
// iOS: abre popup antes do canvas (preserva gesto) e instrui pressionar para salvar.

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { ArrowRight, TrendingUp, Ruler, CalendarDays, Check, Users, Share2 } from 'lucide-react';
import logoGlpyDark from '@/assets/logos/logo-dark.png';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap } from '../../theme/spacing';
import { transition } from '../../theme/motion';

// ── Props ─────────────────────────────────────────────────────────────────────

interface VisualProgressShareScreenProps {
  onBack?: () => void;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PhotoRole = 'before' | 'after' | 'progress';

interface BodyPhoto {
  id:           string;
  date:         string;
  createdAt?:   string;
  weight:       number | null;
  imageDataUrl: string;
  role:         PhotoRole;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readBodyPhotos(): BodyPhoto[] {
  try {
    const raw = localStorage.getItem('glpy_body_photos');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p: BodyPhoto) => ({ ...p, role: p.role ?? 'progress' }));
  } catch { return []; }
}

function readCurrentWeight(): number | null {
  try {
    const latestRaw = localStorage.getItem('glpy_latest_weight');
    if (latestRaw) {
      const latest = JSON.parse(latestRaw);
      const w = typeof latest.weight === 'number' ? latest.weight : parseFloat(String(latest.weight ?? ''));
      if (!isNaN(w) && w > 20 && w < 300) return w;
    }
    const fromKey = parseFloat(localStorage.getItem('glpy_peso_atual') ?? '');
    if (!isNaN(fromKey) && fromKey > 20 && fromKey < 300) return fromKey;
    const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
    const fromOnb = parseFloat(String(onb.peso_atual ?? onb.pesoAtual ?? ''));
    if (!isNaN(fromOnb) && fromOnb > 20 && fromOnb < 300) return fromOnb;
  } catch {}
  return null;
}

function readInitialWeight(): number | null {
  try {
    const rs = JSON.parse(localStorage.getItem('glpy_results_summary') || '{}');
    const v = parseFloat(String(rs.initialWeight ?? ''));
    if (!isNaN(v) && v > 0) return v;
  } catch {}
  try {
    const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
    const v = parseFloat(String(onb.pesoInicial ?? ''));
    if (!isNaN(v) && v > 0) return v;
  } catch {}
  return null;
}

function readProtocolo(): string | null {
  try {
    const raw = localStorage.getItem('glpy_protocolo_ativo');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.nome ?? null;
  } catch { return null; }
}

function readWaistFromKey(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const v = parseFloat(String(parsed?.cintura ?? parsed?.waist ?? ''));
    return !isNaN(v) && v > 0 ? v : null;
  } catch { return null; }
}

function fmtBR(n: number, decimals = 2): string {
  return n.toFixed(decimals).replace('.', ',');
}

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function fmtMonthPT(dateStr: string): string {
  const [y, m] = dateStr.split('-');
  return `${MONTHS_PT[parseInt(m, 10) - 1] ?? '—'} ${y}`;
}

function calcDaysApart(d1: string, d2: string): number {
  return Math.round(Math.abs(new Date(d1).getTime() - new Date(d2).getTime()) / 86400000);
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
}

// ── Dark tokens ───────────────────────────────────────────────────────────────

const S_BG      = '#0A1628';
const S_PHOTO_A = '#111e30';
const S_PHOTO_B = '#0e1628';
const S_GREEN   = '#00C27A';
const S_WHITE   = '#FFFFFF';
const S_MUTED   = 'rgba(255,255,255,0.42)';
const S_MUTED_LO= 'rgba(255,255,255,0.18)';

// ── Share options ─────────────────────────────────────────────────────────────

const SHARE_OPTIONS = [
  { id: 'cell',      label: 'Célula GLPY', icon: <Users  size={16} strokeWidth={2} /> },
  { id: 'whatsapp',  label: 'WhatsApp',    icon: <Share2 size={16} strokeWidth={2} /> },
  { id: 'instagram', label: 'Instagram',   icon: <Share2 size={16} strokeWidth={2} /> },
  { id: 'tiktok',    label: 'TikTok',      icon: <Share2 size={16} strokeWidth={2} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisualProgressShareScreen({ onBack }: VisualProgressShareScreenProps) {

  const storyCardRef       = useRef<HTMLDivElement>(null);
  const exportStoryCardRef = useRef<HTMLDivElement>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────

  const photos = readBodyPhotos();

  const beforePhoto = photos.find(p => p.role === 'before')
    ?? (photos.length > 0 ? photos[0] : null);

  const afterCandidates = photos.filter(p => p.role === 'after');
  const afterPhoto = afterCandidates.length > 0
    ? afterCandidates[afterCandidates.length - 1]
    : (photos.length > 1 ? photos[photos.length - 1] : null);

  const pesoAntesNum  = beforePhoto?.weight ?? null;
  const pesoDepoisNum = afterPhoto?.weight  ?? readCurrentWeight();

  const evolucaoKg = (() => {
    if (pesoAntesNum != null && pesoDepoisNum != null && pesoAntesNum > pesoDepoisNum)
      return `- ${fmtBR(pesoAntesNum - pesoDepoisNum)} kg`;
    const pi = readInitialWeight(), pa = readCurrentWeight();
    if (pi != null && pa != null && pi > pa)
      return `- ${fmtBR(pi - pa)} kg`;
    return '—';
  })();

  const displayPesoAntes  = pesoAntesNum  ?? readInitialWeight();
  const displayPesoDepois = pesoDepoisNum ?? null;
  const pesoAntesStr  = displayPesoAntes  != null ? fmtBR(displayPesoAntes)  : '—';
  const pesoDepoisStr = displayPesoDepois != null ? fmtBR(displayPesoDepois) : '—';

  const cinturaAntes  = readWaistFromKey('glpy_medidas_iniciais');
  const cinturaDepois = readWaistFromKey('glpy_medidas_corporais');
  const hasCintura    = cinturaAntes != null && cinturaDepois != null;
  const cinturaAntesStr  = hasCintura ? fmtBR(cinturaAntes!)  : '—';
  const cinturaDepoisStr = hasCintura ? fmtBR(cinturaDepois!) : '—';

  const evolucaoCintura = (() => {
    if (!hasCintura) return '—';
    const d = cinturaAntes! - cinturaDepois!;
    return d > 0 ? `- ${fmtBR(d)} cm` : '—';
  })();

  const dataAntes  = beforePhoto ? fmtMonthPT(beforePhoto.date) : '—';
  const dataDepois = afterPhoto  ? fmtMonthPT(afterPhoto.date)  : '—';

  const diasStr = (() => {
    if (!beforePhoto || !afterPhoto) return '—';
    const d = calcDaysApart(beforePhoto.date, afterPhoto.date);
    return `${d} dia${d !== 1 ? 's' : ''}`;
  })();

  const protocoloNome = readProtocolo() ?? '—';

  // ── Image generation ──────────────────────────────────────────────────────

  // Captures exportStoryCardRef: fixed 1080×1920, photos via backgroundImage.
  // backgroundSize:cover is correctly rendered by html2canvas; objectFit is not.
  async function generateStoryImageBlob(): Promise<{ dataUrl: string; blob: Blob } | null> {
    if (!exportStoryCardRef.current) return null;
    const canvas = await html2canvas(exportStoryCardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: S_BG,
      logging: false,
      width: 1080,
      height: 1920,
      windowWidth: 1080,
      windowHeight: 1920,
      scrollX: 0,
      scrollY: 0,
    });
    const dataUrl = canvas.toDataURL('image/png');
    return new Promise(resolve =>
      canvas.toBlob(blob => resolve(blob ? { dataUrl, blob } : null), 'image/png')
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSaveImage() {
    setActionMsg(null);
    const ios = isIOS();

    // Open popup synchronously (preserves user-gesture context on iOS).
    let popup: Window | null = null;
    if (ios) {
      popup = window.open('', '_blank');
      if (popup) popup.document.write(
        '<html><body style="background:#0A1628;color:rgba(255,255,255,.5);font-family:sans-serif;' +
        'display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
        '<p>Gerando imagem…</p></body></html>'
      );
    }

    try {
      const result = await generateStoryImageBlob();
      if (!result) { if (popup) popup.close(); return; }

      if (ios) {
        if (popup) {
          popup.document.open();
          popup.document.write(
            `<!DOCTYPE html><html><head><title>Minha evolução GLPY</title>` +
            `<meta name="viewport" content="width=device-width,initial-scale=1">` +
            `<style>body{margin:0;background:#0A1628;display:flex;flex-direction:column;` +
            `align-items:center;justify-content:center;min-height:100vh;gap:16px}` +
            `p{color:rgba(255,255,255,.55);font-family:sans-serif;font-size:13px;` +
            `text-align:center;padding:0 20px;margin:0}</style></head>` +
            `<body><img src="${result.dataUrl}" style="max-width:100%;display:block"/>` +
            `<p>Pressione a imagem e toque em "Salvar" para guardar no rolo.</p>` +
            `</body></html>`
          );
          popup.document.close();
        }
        setActionMsg('Imagem gerada. Pressione e segure para salvar.');
      } else {
        const a = document.createElement('a');
        a.href = result.dataUrl; a.download = 'minha-evolucao-glpy.png'; a.click();
        setActionMsg('Download iniciado.');
      }
    } catch (err) {
      console.error('[GLPY] Erro ao gerar imagem', err);
      if (popup) popup.close();
    }
  }

  async function handleShareAction() {
    setActionMsg(null);
    const ios = isIOS();

    // Pre-open popup BEFORE any await so the user gesture is preserved.
    // If navigator.share is unavailable or fails, we write the image here.
    // window.open() called AFTER an await is blocked by iOS Safari.
    let popup: Window | null = null;
    if (ios) {
      popup = window.open('', '_blank');
      if (popup) popup.document.write(
        '<html><body style="background:#0A1628;color:rgba(255,255,255,.5);font-family:sans-serif;' +
        'display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
        '<p>Gerando imagem…</p></body></html>'
      );
    }

    const imagePopupHtml = (dataUrl: string) =>
      `<!DOCTYPE html><html><head><title>Minha evolução GLPY</title>` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<style>body{margin:0;background:#0A1628;display:flex;flex-direction:column;` +
      `align-items:center;justify-content:center;min-height:100vh;gap:16px}` +
      `p{color:rgba(255,255,255,.55);font-family:sans-serif;font-size:13px;` +
      `text-align:center;padding:0 20px;margin:0}</style></head>` +
      `<body><img src="${dataUrl}" style="max-width:100%;display:block"/>` +
      `<p>Pressione e segure a imagem para salvar ou compartilhar pelo WhatsApp.</p>` +
      `</body></html>`;

    try {
      const result = await generateStoryImageBlob();
      if (!result) { popup?.close(); return; }

      const file = new File([result.blob], 'minha-evolucao-glpy.png', { type: 'image/png' });
      const canShare =
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        (() => { try { return navigator.canShare({ files: [file] }); } catch { return false; } })();

      if (canShare) {
        // Close loading popup before share sheet — no url, no text in shareData
        popup?.close();
        try {
          await navigator.share({ files: [file], title: 'Minha evolução GLPY' });
          return;
        } catch (shareErr: unknown) {
          if ((shareErr as { name?: string }).name === 'AbortError') return;
          // navigator.share failed (gesture lost on older iOS, etc.)
          // Gesture is now lost — try blob URL download as last resort on desktop
          if (!ios) {
            try {
              const blobUrl = URL.createObjectURL(result.blob);
              const link = document.createElement('a');
              link.href = blobUrl; link.download = 'minha-evolucao-glpy.png'; link.click();
              setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
              setActionMsg('Download iniciado.');
            } catch { setActionMsg('Use "Salvar imagem" para salvar manualmente.'); }
          } else {
            setActionMsg('Use "Salvar imagem" para salvar e compartilhar manualmente.');
          }
          return;
        }
      }

      // navigator.share unavailable or PNG files not supported:
      // popup was opened before the await, so gesture is still valid for document.write
      if (ios && popup) {
        popup.document.open();
        popup.document.write(imagePopupHtml(result.dataUrl));
        popup.document.close();
        setActionMsg('Pressione e segure a imagem para compartilhar.');
      } else {
        popup?.close();
        const a = document.createElement('a');
        a.href = result.dataUrl; a.download = 'minha-evolucao-glpy.png'; a.click();
        setActionMsg('Download iniciado.');
      }
    } catch (err) {
      console.error('[GLPY] Erro ao compartilhar', err);
      popup?.close();
    }
  }

  // ── Shared style helpers ───────────────────────────────────────────────────

  const ff  = fontFamily.primary;
  const overlayGrad = 'linear-gradient(to top, rgba(3,7,16,0.93) 0%, rgba(3,7,16,0.40) 52%, transparent 100%)';
  const photoAbs: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

  // ── Resumo card styles ─────────────────────────────────────────────────────

  const resumoRowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 1, paddingBottom: 1,
  };
  const resumoKeyStyle: React.CSSProperties = {
    fontFamily: ff, fontSize: fontSize.small, color: lightColors.text.secondary, display: 'flex', alignItems: 'center', gap: 6,
  };
  const resumoValStyle: React.CSSProperties = {
    fontFamily: ff, fontSize: fontSize.small, fontWeight: fontWeight.h3, color: lightColors.text.navy,
  };
  const resumoValGreen: React.CSSProperties = { ...resumoValStyle, color: lightColors.brand.greenDark };
  const dividerStyle: React.CSSProperties = { height: 0.5, background: lightColors.border.soft, margin: '6px 0' };
  const sectionTitle: React.CSSProperties = {
    fontFamily: ff, fontSize: 12, fontWeight: '700', color: lightColors.text.secondary,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
  };

  // ── Share card styles ──────────────────────────────────────────────────────

  const shareBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
    background: lightColors.background.secondary, border: `0.5px solid ${lightColors.border.soft}`,
    borderRadius: 14, cursor: 'pointer', fontFamily: ff, fontSize: 12, fontWeight: '600',
    color: lightColors.text.navy, transition: transition.default,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Minha evolução" onBack={onBack} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small }}>

        {/* ─── Story card 9:16 (preview visível — não usado para exportação) ─── */}
        <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(0,194,122,0.18)', boxShadow: '0 8px 40px rgba(0,194,122,0.07)' }}>
          <div
            ref={storyCardRef}
            style={{ background: S_BG, aspectRatio: '9 / 16', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >

            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{ flexShrink: 0, padding: '22px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <img src={logoGlpyDark} alt="GLPY" style={{ height: 22, objectFit: 'contain', display: 'block' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, background: S_GREEN, borderRadius: 99 }} />
                  <span style={{ fontFamily: ff, fontSize: 10, fontWeight: '700', color: S_GREEN, letterSpacing: '0.02em' }}>
                    {protocoloNome}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 13 }}>
                <div style={{ fontFamily: ff, fontSize: 22, fontWeight: '900', color: S_WHITE, letterSpacing: '-0.9px', lineHeight: 1.05, marginBottom: 5 }}>
                  Meu Antes &amp; Depois
                </div>
                <div style={{ fontFamily: ff, fontSize: 10, color: S_MUTED, letterSpacing: '0.02em' }}>
                  Mais saúde. Mais controle. Mais eu.
                </div>
              </div>
              <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${S_GREEN}55, transparent)` }} />
            </div>

            {/* ── Fotos ───────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '10px 14px 0', gap: 8 }}>

              {/* Antes */}
              <div style={{ flex: 1, marginTop: 20, position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0', background: S_PHOTO_A }}>
                {beforePhoto
                  ? <img src={beforePhoto.imageDataUrl} alt="Antes" style={photoAbs} />
                  : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                }
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: overlayGrad, padding: '32px 10px 12px', zIndex: 1 }}>
                  <div style={{ fontFamily: ff, fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.40)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 3 }}>Antes</div>
                  <div style={{ fontFamily: ff, fontSize: 8, color: 'rgba(255,255,255,0.22)', marginBottom: 5 }}>{dataAntes}</div>
                  {pesoAntesStr !== '—' && (
                    <div style={{ fontFamily: ff, fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.75)' }}>{pesoAntesStr} kg</div>
                  )}
                </div>
              </div>

              {/* Depois */}
              <div style={{ flex: 1, boxShadow: `0 0 18px rgba(0,194,122,0.22), 0 0 5px rgba(0,194,122,0.10)`, borderRadius: '16px 16px 0 0' }}>
                <div style={{ height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '16px 16px 0 0', background: S_PHOTO_B, borderTop: `2px solid ${S_GREEN}`, borderLeft: `1px solid rgba(0,194,122,0.28)`, borderRight: `1px solid rgba(0,194,122,0.28)` }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 20%, rgba(0,194,122,0.10) 0%, transparent 65%)', zIndex: 1, pointerEvents: 'none' }} />
                  {afterPhoto
                    ? <img src={afterPhoto.imageDataUrl} alt="Depois" style={photoAbs} />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={`${S_GREEN}40`} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: overlayGrad, padding: '32px 10px 12px', zIndex: 2 }}>
                    <div style={{ fontFamily: ff, fontSize: 9, fontWeight: '700', color: S_GREEN, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 3 }}>Depois</div>
                    <div style={{ fontFamily: ff, fontSize: 8, color: 'rgba(255,255,255,0.22)', marginBottom: 5 }}>{dataDepois}</div>
                    {pesoDepoisStr !== '—' && (
                      <div style={{ fontFamily: ff, fontSize: 13, fontWeight: '800', color: S_WHITE }}>{pesoDepoisStr} kg</div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* ── Métricas ─────────────────────────────────────────────── */}
            <div style={{ flexShrink: 0, padding: '16px 20px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: ff, fontSize: 34, fontWeight: '900', color: evolucaoKg !== '—' ? S_GREEN : S_MUTED, letterSpacing: '-1.4px', lineHeight: 1 }}>
                {evolucaoKg}
              </div>
              {evolucaoKg !== '—' && (
                <div style={{ fontFamily: ff, fontSize: 10, color: S_MUTED, letterSpacing: '0.05em', marginTop: 10 }}>
                  eliminados
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 12 }}>
                <div>
                  <div style={{ fontFamily: ff, fontSize: 8, fontWeight: '600', color: 'rgba(255,255,255,0.26)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Peso (kg)</div>
                  <div style={{ fontFamily: ff, fontSize: 13, fontWeight: '800', color: S_WHITE, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                    <span>{pesoAntesStr}</span>
                    {pesoAntesStr !== '—' && pesoDepoisStr !== '—' && <ArrowRight size={9} color={S_GREEN} strokeWidth={2.5} />}
                    <span>{pesoDepoisStr}</span>
                  </div>
                </div>
                {hasCintura && (
                  <div>
                    <div style={{ fontFamily: ff, fontSize: 8, fontWeight: '600', color: 'rgba(255,255,255,0.26)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Cintura (cm)</div>
                    <div style={{ fontFamily: ff, fontSize: 13, fontWeight: '800', color: S_WHITE, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                      <span>{cinturaAntesStr}</span>
                      <ArrowRight size={9} color={S_GREEN} strokeWidth={2.5} />
                      <span>{cinturaDepoisStr}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Rodapé ───────────────────────────────────────────────── */}
            <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '11px 20px 22px', textAlign: 'center' }}>
              <div style={{ fontFamily: ff, fontSize: 11, fontWeight: '500', color: S_MUTED, fontStyle: 'italic', marginBottom: 7 }}>
                Disciplina hoje. Liberdade amanhã.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ width: 4, height: 4, background: S_GREEN, borderRadius: 99, opacity: 0.55 }} />
                <span style={{ fontFamily: ff, fontSize: 9, fontWeight: '600', color: S_MUTED_LO, letterSpacing: '0.07em' }}>glpy.com.br</span>
                <div style={{ width: 4, height: 4, background: S_GREEN, borderRadius: 99, opacity: 0.55 }} />
              </div>
            </div>

          </div>
        </div>

        {/* ─── Resumo ──────────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={sectionTitle}>Resumo da evolução</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: <TrendingUp size={15} color={lightColors.text.secondary} strokeWidth={2} />, label: 'Peso eliminado', val: evolucaoKg,      green: true },
              { icon: <Ruler       size={15} color={lightColors.text.secondary} strokeWidth={2} />, label: 'Cintura',        val: evolucaoCintura, green: true },
              { icon: <CalendarDays size={15} color={lightColors.text.secondary} strokeWidth={2} />, label: 'Tempo',         val: diasStr,         green: false },
              { icon: <Check       size={15} color={lightColors.text.secondary} strokeWidth={2} />, label: 'Protocolo',      val: protocoloNome,   green: false },
            ].map((row, i) => (
              <React.Fragment key={row.label}>
                {i > 0 && <div style={dividerStyle} />}
                <div style={resumoRowStyle}>
                  <span style={resumoKeyStyle}>{row.icon}{row.label}</span>
                  <span style={row.green ? resumoValGreen : resumoValStyle}>{row.val}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </GLPYCard>

        {/* ─── Compartilhar ────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={sectionTitle}>Compartilhar</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: gap.small }}>
            {SHARE_OPTIONS.map(opt => (
              <div key={opt.id} style={shareBtnStyle} onClick={handleShareAction} role="button" aria-label={opt.label}>
                {opt.icon}<span>{opt.label}</span>
              </div>
            ))}
          </div>
        </GLPYCard>

        {actionMsg && (
          <div style={{
            fontFamily: fontFamily.primary, fontSize: 12, color: lightColors.text.secondary,
            textAlign: 'center', padding: '4px 16px',
          }}>
            {actionMsg}
          </div>
        )}

        {/* ─── CTA ─────────────────────────────────────────────────────────── */}
        <GLPYButton variant="primary" size="lg" fullWidth onClick={handleSaveImage}>
          Salvar imagem
        </GLPYButton>

      </div>

      {/* ─── Export card offscreen 1080×1920 ─────────────────────────────────
          Capturado por generateStoryImageBlob(). Dimensões fixas garantem 9:16
          real. Photos usam backgroundSize:cover (html2canvas não renderiza
          objectFit:cover em <img>; backgroundSize funciona corretamente).      */}
      <div
        ref={exportStoryCardRef}
        style={{
          position: 'fixed',
          left: -99999,
          top: 0,
          width: 1080,
          height: 1920,
          pointerEvents: 'none',
          background: S_BG,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, padding: '66px 60px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 42 }}>
            <img src={logoGlpyDark} alt="GLPY" style={{ height: 66, objectFit: 'contain', display: 'block' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{ width: 15, height: 15, background: S_GREEN, borderRadius: 99 }} />
              <span style={{ fontFamily: ff, fontSize: 30, fontWeight: '700', color: S_GREEN, letterSpacing: '0.02em' }}>
                {protocoloNome}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 39 }}>
            <div style={{ fontFamily: ff, fontSize: 66, fontWeight: '900', color: S_WHITE, letterSpacing: '-0.9px', lineHeight: 1.05, marginBottom: 15 }}>
              Meu Antes &amp; Depois
            </div>
            <div style={{ fontFamily: ff, fontSize: 30, color: S_MUTED, letterSpacing: '0.02em' }}>
              Mais saúde. Mais controle. Mais eu.
            </div>
          </div>
          <div style={{ height: 3, background: `linear-gradient(to right, transparent, ${S_GREEN}55, transparent)` }} />
        </div>

        {/* ── Fotos ─────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '30px 42px 0', gap: 24 }}>

          {/* Antes — backgroundImage evita distorção no canvas */}
          <div style={{
            flex: 1,
            marginTop: 60,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '48px 48px 0 0',
            background: S_PHOTO_A,
            ...(beforePhoto ? {
              backgroundImage: `url("${beforePhoto.imageDataUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            } : {}),
          }}>
            {!beforePhoto && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: overlayGrad, padding: '96px 30px 36px', zIndex: 1 }}>
              <div style={{ fontFamily: ff, fontSize: 27, fontWeight: '700', color: 'rgba(255,255,255,0.40)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: 9 }}>Antes</div>
              <div style={{ fontFamily: ff, fontSize: 24, color: 'rgba(255,255,255,0.22)', marginBottom: 15 }}>{dataAntes}</div>
              {pesoAntesStr !== '—' && (
                <div style={{ fontFamily: ff, fontSize: 39, fontWeight: '800', color: 'rgba(255,255,255,0.75)' }}>{pesoAntesStr} kg</div>
              )}
            </div>
          </div>

          {/* Depois — backgroundImage evita distorção no canvas */}
          <div style={{ flex: 1, boxShadow: `0 0 54px rgba(0,194,122,0.22), 0 0 15px rgba(0,194,122,0.10)`, borderRadius: '48px 48px 0 0' }}>
            <div style={{
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '48px 48px 0 0',
              background: S_PHOTO_B,
              borderTop: `6px solid ${S_GREEN}`,
              borderLeft: `3px solid rgba(0,194,122,0.28)`,
              borderRight: `3px solid rgba(0,194,122,0.28)`,
              ...(afterPhoto ? {
                backgroundImage: `url("${afterPhoto.imageDataUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
              } : {}),
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 20%, rgba(0,194,122,0.10) 0%, transparent 65%)', zIndex: 1, pointerEvents: 'none' }} />
              {!afterPhoto && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke={`${S_GREEN}40`} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: overlayGrad, padding: '96px 30px 36px', zIndex: 2 }}>
                <div style={{ fontFamily: ff, fontSize: 27, fontWeight: '700', color: S_GREEN, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: 9 }}>Depois</div>
                <div style={{ fontFamily: ff, fontSize: 24, color: 'rgba(255,255,255,0.22)', marginBottom: 15 }}>{dataDepois}</div>
                {pesoDepoisStr !== '—' && (
                  <div style={{ fontFamily: ff, fontSize: 39, fontWeight: '800', color: S_WHITE }}>{pesoDepoisStr} kg</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ── Métricas ──────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, padding: '48px 60px 36px', textAlign: 'center' }}>
          <div style={{ fontFamily: ff, fontSize: 102, fontWeight: '900', color: evolucaoKg !== '—' ? S_GREEN : S_MUTED, letterSpacing: '-1.4px', lineHeight: 1 }}>
            {evolucaoKg}
          </div>
          {evolucaoKg !== '—' && (
            <div style={{ fontFamily: ff, fontSize: 30, color: S_MUTED, letterSpacing: '0.05em', marginTop: 30 }}>
              eliminados
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 84, marginTop: 36 }}>
            <div>
              <div style={{ fontFamily: ff, fontSize: 24, fontWeight: '600', color: 'rgba(255,255,255,0.26)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 12 }}>Peso (kg)</div>
              <div style={{ fontFamily: ff, fontSize: 39, fontWeight: '800', color: S_WHITE, display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
                <span>{pesoAntesStr}</span>
                {pesoAntesStr !== '—' && pesoDepoisStr !== '—' && <ArrowRight size={27} color={S_GREEN} strokeWidth={2.5} />}
                <span>{pesoDepoisStr}</span>
              </div>
            </div>
            {hasCintura && (
              <div>
                <div style={{ fontFamily: ff, fontSize: 24, fontWeight: '600', color: 'rgba(255,255,255,0.26)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 12 }}>Cintura (cm)</div>
                <div style={{ fontFamily: ff, fontSize: 39, fontWeight: '800', color: S_WHITE, display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
                  <span>{cinturaAntesStr}</span>
                  <ArrowRight size={27} color={S_GREEN} strokeWidth={2.5} />
                  <span>{cinturaDepoisStr}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Rodapé ────────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, borderTop: '3px solid rgba(255,255,255,0.06)', padding: '33px 60px 66px', textAlign: 'center' }}>
          <div style={{ fontFamily: ff, fontSize: 33, fontWeight: '500', color: S_MUTED, fontStyle: 'italic', marginBottom: 21 }}>
            Disciplina hoje. Liberdade amanhã.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <div style={{ width: 12, height: 12, background: S_GREEN, borderRadius: 99, opacity: 0.55 }} />
            <span style={{ fontFamily: ff, fontSize: 27, fontWeight: '600', color: S_MUTED_LO, letterSpacing: '0.07em' }}>glpy.com.br</span>
            <div style={{ width: 12, height: 12, background: S_GREEN, borderRadius: 99, opacity: 0.55 }} />
          </div>
        </div>

      </div>

    </GLPYScreen>
  );
}
