// GLPY — Visual Progress Share Screen
// System: Operational — LIGHT PREMIUM (story card interno DARK PREMIUM)
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Fotos e dados vêm de glpy_body_photos, glpy_medidas_iniciais,
// glpy_medidas_corporais e glpy_protocolo_ativo (localStorage).
// Se dado real não existir, fallback seguro '—'.
// Salvar imagem: html2canvas captura o story card; iOS abre em nova aba.

import React, { useRef } from 'react';
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
    // migração: fotos sem role recebem 'progress'
    return parsed.map((p: BodyPhoto) => ({ ...p, role: p.role ?? 'progress' }));
  } catch { return []; }
}

// Peso atual — mesma cascata do useCurrentWeight hook
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

// Peso inicial — mesma cascata do HomePremiumV2 (weightStart)
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

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function fmtMonthPT(dateStr: string): string {
  const [y, m] = dateStr.split('-');
  const month = MONTHS_PT[parseInt(m, 10) - 1] ?? '—';
  return `${month} ${y}`;
}

function calcDaysApart(d1: string, d2: string): number {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.round(Math.abs(t2 - t1) / 86400000);
}

// ── Story card dark tokens ────────────────────────────────────────────────────

const S_BG         = '#0A1628';
const S_PHOTO_A    = '#1a2e44';
const S_PHOTO_B    = '#0d2030';
const S_STRIP_BG   = '#1a2e44';
const S_STRIP_CELL = '#0d1f35';
const S_GREEN      = '#00C27A';
const S_WHITE      = '#FFFFFF';
const S_MUTED      = 'rgba(255,255,255,0.45)';
const S_MUTED_LO   = 'rgba(255,255,255,0.20)';

// ── Share options — 4 canais em grid 2×2 ─────────────────────────────────────

const SHARE_OPTIONS = [
  { id: 'cell',      label: 'Célula GLPY', icon: <Users    size={16} strokeWidth={2} /> },
  { id: 'whatsapp',  label: 'WhatsApp',    icon: <Share2   size={16} strokeWidth={2} /> },
  { id: 'instagram', label: 'Instagram',   icon: <Share2   size={16} strokeWidth={2} /> },
  { id: 'tiktok',    label: 'TikTok',      icon: <Share2   size={16} strokeWidth={2} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisualProgressShareScreen({ onBack }: VisualProgressShareScreenProps) {

  const storyCardRef = useRef<HTMLDivElement>(null);

  // ── Data from localStorage ─────────────────────────────────────────────────

  const photos = readBodyPhotos();

  // Antes: primeira com role 'before', senão primeira foto
  const beforePhoto = photos.find(p => p.role === 'before')
    ?? (photos.length > 0 ? photos[0] : null);

  // Depois: última com role 'after', senão última (requer 2+ fotos)
  const afterCandidates = photos.filter(p => p.role === 'after');
  const afterPhoto = afterCandidates.length > 0
    ? afterCandidates[afterCandidates.length - 1]
    : (photos.length > 1 ? photos[photos.length - 1] : null);

  const pesoAntesNum  = beforePhoto?.weight ?? null;
  const pesoDepoisNum = afterPhoto?.weight  ?? readCurrentWeight();

  // Evolução: prioridade 1 — pesos diferentes entre fotos
  //           prioridade 2 — jornada real: pesoInicial vs pesoAtual (mesma lógica da Home)
  const evolucaoKg = (() => {
    if (pesoAntesNum != null && pesoDepoisNum != null && pesoAntesNum > pesoDepoisNum) {
      const diff = pesoAntesNum - pesoDepoisNum;
      return `−${diff.toFixed(1).replace('.', ',')} kg`;
    }
    const pesoInicial = readInitialWeight();
    const pesoAtual   = readCurrentWeight();
    if (pesoInicial != null && pesoAtual != null && pesoInicial > pesoAtual) {
      const diff = pesoInicial - pesoAtual;
      return `−${diff.toFixed(1).replace('.', ',')} kg`;
    }
    return '—';
  })();

  // Antes/Depois display: peso da foto → fallback dados da jornada
  const displayPesoAntes  = pesoAntesNum  ?? readInitialWeight();
  const displayPesoDepois = pesoDepoisNum ?? null;

  const pesoAntesStr  = displayPesoAntes  != null ? String(Math.round(displayPesoAntes))  : '—';
  const pesoDepoisStr = displayPesoDepois != null ? String(Math.round(displayPesoDepois)) : '—';

  const cinturaAntes  = readWaistFromKey('glpy_medidas_iniciais');
  const cinturaDepois = readWaistFromKey('glpy_medidas_corporais');

  const evolucaoCintura = (() => {
    if (cinturaAntes == null || cinturaDepois == null) return '—';
    const diff = cinturaAntes - cinturaDepois;
    if (diff <= 0) return '—';
    return `−${Math.round(diff)} cm`;
  })();

  const dataAntes  = beforePhoto ? fmtMonthPT(beforePhoto.date) : '—';
  const dataDepois = afterPhoto  ? fmtMonthPT(afterPhoto.date)  : '—';

  const diasStr = (() => {
    if (!beforePhoto || !afterPhoto) return '—';
    const d = calcDaysApart(beforePhoto.date, afterPhoto.date);
    return `${d} dia${d !== 1 ? 's' : ''}`;
  })();

  const protocoloNome = readProtocolo() ?? '—';

  const cinturaAntesStr  = cinturaAntes  != null ? String(Math.round(cinturaAntes))  : '—';
  const cinturaDepoisStr = cinturaDepois != null ? String(Math.round(cinturaDepois)) : '—';

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleShare(platform: string) {
    console.log(`[GLPY] share_${platform}`);
  }

  async function handleSaveImage() {
    if (!storyCardRef.current) return;
    try {
      const canvas = await html2canvas(storyCardRef.current, {
        scale:           2,
        useCORS:         true,
        backgroundColor: S_BG,
        logging:         false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      // iOS Safari não suporta download via <a>; abre em nova aba para salvar via long-press
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
      if (isIOS) {
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(
            `<!DOCTYPE html><html><head><title>Minha evolução GLPY</title>` +
            `<meta name="viewport" content="width=device-width,initial-scale=1">` +
            `<style>body{margin:0;background:#0A1628;display:flex;align-items:center;justify-content:center;min-height:100vh}` +
            `p{color:rgba(255,255,255,.55);font-family:sans-serif;font-size:13px;text-align:center;position:fixed;bottom:24px;width:100%}</style></head>` +
            `<body><img src="${dataUrl}" style="max-width:100%;display:block"/>` +
            `<p>Pressione a imagem e toque em "Salvar" para guardar no seu dispositivo.</p></body></html>`
          );
          newTab.document.close();
        }
      } else {
        const a = document.createElement('a');
        a.href     = dataUrl;
        a.download = 'minha-evolucao-glpy.png';
        a.click();
      }
    } catch (err) {
      console.error('[GLPY] Erro ao gerar imagem', err);
    }
  }

  // ── Layout gap ────────────────────────────────────────────────────────────

  const sectionGap: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  // ── Story card ────────────────────────────────────────────────────────────

  const storyWrap: React.CSSProperties = {
    background: S_BG,
    position:   'relative',
  };

  const scTopStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '16px 18px 12px',
  };

  const protoWrapStyle: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'flex-end',
  };

  const protoLineStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   10,
    fontWeight: '600',
    color:      S_MUTED,
    lineHeight: 1.4,
  };

  const protoGreenStyle: React.CSSProperties = {
    fontFamily:  fontFamily.primary,
    fontSize:    11,
    fontWeight:  '700',
    color:       S_GREEN,
    lineHeight:  1.4,
    textAlign:   'right',
  };

  const scHeadlineStyle: React.CSSProperties = {
    padding:   '0 18px 14px',
    textAlign: 'center',
  };

  const scH1Style: React.CSSProperties = {
    fontFamily:    fontFamily.primary,
    fontSize:      22,
    fontWeight:    '900',
    color:         S_WHITE,
    letterSpacing: '-0.8px',
    marginBottom:  3,
    lineHeight:    1.1,
  };

  const scTaglineStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   11,
    fontWeight: '500',
    color:      S_MUTED,
  };

  const photosGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 16px 1fr',
    alignItems:          'end',
    padding:             '0 14px',
  };

  const photoBeforeStyle: React.CSSProperties = {
    background:    S_PHOTO_A,
    borderRadius:  '12px 12px 0 0',
    overflow:      'hidden',
    height:        180,
    display:       'flex',
    flexDirection: 'column',
    justifyContent:'flex-end',
    position:      'relative',
  };

  const photoAfterStyle: React.CSSProperties = {
    background:    S_PHOTO_B,
    borderRadius:  '12px 12px 0 0',
    overflow:      'hidden',
    height:        218,
    display:       'flex',
    flexDirection: 'column',
    justifyContent:'flex-end',
    position:      'relative',
    border:        `2px solid ${S_GREEN}`,
  };

  const photoPlaceholderStyle: React.CSSProperties = {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'column',
    gap:            6,
  };

  const realPhotoStyle: React.CSSProperties = {
    position:   'absolute',
    inset:      0,
    width:      '100%',
    height:     '100%',
    objectFit:  'cover',
  };

  const photoLabelRowStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '8px 10px 6px',
    position:       'relative',
    zIndex:         2,
  };

  const photoDateStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   9,
    fontWeight: '500',
    color:      'rgba(255,255,255,0.30)',
  };

  const arrowWrapStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    paddingBottom:  76,
  };

  const arrowCircleStyle: React.CSSProperties = {
    width:          34,
    height:         34,
    background:     S_GREEN,
    borderRadius:   99,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    boxShadow:      `0 0 0 5px ${S_BG}`,
  };

  const statsStripStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap:                 1,
    background:          S_STRIP_BG,
    marginTop:           0,
  };

  const statCellStyle: React.CSSProperties = {
    background: S_STRIP_CELL,
    padding:    '12px 8px',
    textAlign:  'center',
  };

  const statValBaseStyle: React.CSSProperties = {
    fontFamily:    fontFamily.primary,
    fontSize:      15,
    fontWeight:    '800',
    letterSpacing: '-0.5px',
    lineHeight:    1,
    marginBottom:  3,
    display:       'flex',
    alignItems:    'center',
    justifyContent:'center',
    gap:           3,
  };

  const statLabelStyle: React.CSSProperties = {
    fontFamily:    fontFamily.primary,
    fontSize:      9,
    fontWeight:    '600',
    color:         'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const scFooterStyle: React.CSSProperties = {
    padding:    '14px 18px 16px',
    textAlign:  'center',
    borderTop:  '1px solid rgba(255,255,255,0.05)',
  };

  const fraseStyle: React.CSSProperties = {
    fontFamily:   fontFamily.primary,
    fontSize:     12,
    fontWeight:   '600',
    color:        S_MUTED,
    fontStyle:    'italic',
    marginBottom: 6,
  };

  const brandRowStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            5,
  };

  const brandDotStyle: React.CSSProperties = {
    width:        5,
    height:       5,
    background:   S_GREEN,
    borderRadius: 99,
  };

  const brandTextStyle: React.CSSProperties = {
    fontFamily:    fontFamily.primary,
    fontSize:      10,
    fontWeight:    '600',
    color:         S_MUTED_LO,
    letterSpacing: '0.05em',
  };

  // ── Resumo card ───────────────────────────────────────────────────────────

  const resumoTitleStyle: React.CSSProperties = {
    fontFamily:    fontFamily.primary,
    fontSize:      12,
    fontWeight:    '700',
    color:         lightColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom:  12,
  };

  const resumoRowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingTop:     1,
    paddingBottom:  1,
  };

  const resumoKeyStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    color:      lightColors.text.secondary,
    display:    'flex',
    alignItems: 'center',
    gap:        6,
  };

  const resumoValStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: fontWeight.h3,
    color:      lightColors.text.navy,
  };

  const resumoValGreenStyle: React.CSSProperties = {
    ...resumoValStyle,
    color: lightColors.brand.greenDark,
  };

  const resumoDividerStyle: React.CSSProperties = {
    height:     0.5,
    background: lightColors.border.soft,
    margin:     '6px 0',
  };

  // ── Share card ────────────────────────────────────────────────────────────

  const shareTitleStyle: React.CSSProperties = {
    fontFamily:    fontFamily.primary,
    fontSize:      12,
    fontWeight:    '700',
    color:         lightColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom:  12,
  };

  const shareGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:                 gap.small,
  };

  const shareBtnStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          8,
    padding:      '10px 12px',
    background:   lightColors.background.secondary,
    border:       `0.5px solid ${lightColors.border.soft}`,
    borderRadius: 14,
    cursor:       'pointer',
    fontFamily:   fontFamily.primary,
    fontSize:     12,
    fontWeight:   '600',
    color:        lightColors.text.navy,
    transition:   transition.default,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Minha evolução" onBack={onBack} />

      <div style={sectionGap}>

        {/* ── Story Card ────────────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          noPadding
          style={{ border: `1.5px solid rgba(106,210,143,0.22)` }}
        >
          {/* ref apenas no conteúdo escuro — capturado pelo html2canvas */}
          <div ref={storyCardRef} style={storyWrap}>

            {/* Topo: logo + protocolo */}
            <div style={scTopStyle}>
              <img
                src={logoGlpyDark}
                alt="GLPY"
                style={{ height: 26, objectFit: 'contain', display: 'block' }}
              />
              <div style={protoWrapStyle}>
                <span style={protoLineStyle}>Meu protocolo</span>
                <span style={protoGreenStyle}>{protocoloNome}</span>
              </div>
            </div>

            {/* Headline */}
            <div style={scHeadlineStyle}>
              <div style={scH1Style}>Meu Antes &amp; Depois</div>
              <div style={scTaglineStyle}>Mais saúde. Mais controle. Mais eu.</div>
            </div>

            {/* Fotos: grid 1fr 16px 1fr, align-items end */}
            <div style={photosGridStyle}>

              {/* Antes — 180px */}
              <div style={photoBeforeStyle}>
                {beforePhoto ? (
                  <img src={beforePhoto.imageDataUrl} alt="Antes" style={realPhotoStyle} />
                ) : (
                  <div style={{ ...photoPlaceholderStyle, paddingBottom: 32 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                <div style={photoLabelRowStyle}>
                  <span style={{ fontFamily: fontFamily.primary, fontSize: 10, fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)' }}>Antes</span>
                  <span style={photoDateStyle}>{dataAntes}</span>
                </div>
              </div>

              {/* Seta com ring */}
              <div style={arrowWrapStyle}>
                <div style={arrowCircleStyle}>
                  <ArrowRight size={15} color="#fff" strokeWidth={2.5} />
                </div>
              </div>

              {/* Depois — 218px */}
              <div style={photoAfterStyle}>
                {afterPhoto ? (
                  <img src={afterPhoto.imageDataUrl} alt="Depois" style={realPhotoStyle} />
                ) : (
                  <div style={photoPlaceholderStyle}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={`${S_GREEN}50`} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                <div style={photoLabelRowStyle}>
                  <span style={{ fontFamily: fontFamily.primary, fontSize: 10, fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', color: S_GREEN }}>Depois</span>
                  <span style={photoDateStyle}>{dataDepois}</span>
                </div>
              </div>

            </div>

            {/* Stats strip — gap 1px como separador */}
            <div style={statsStripStyle}>
              <div style={statCellStyle}>
                <div style={{ ...statValBaseStyle, color: S_GREEN }}>{evolucaoKg}</div>
                <div style={statLabelStyle}>Evolução</div>
              </div>
              <div style={statCellStyle}>
                <div style={{ ...statValBaseStyle, color: S_WHITE }}>
                  {pesoAntesStr}
                  {pesoAntesStr !== '—' && pesoDepoisStr !== '—' && (
                    <ArrowRight size={10} color={S_GREEN} strokeWidth={2.5} />
                  )}
                  {pesoDepoisStr}
                </div>
                <div style={statLabelStyle}>Peso (kg)</div>
              </div>
              <div style={statCellStyle}>
                <div style={{ ...statValBaseStyle, color: S_WHITE }}>
                  {cinturaAntesStr}
                  {cinturaAntesStr !== '—' && cinturaDepoisStr !== '—' && (
                    <ArrowRight size={10} color={S_GREEN} strokeWidth={2.5} />
                  )}
                  {cinturaDepoisStr}
                </div>
                <div style={statLabelStyle}>Cintura (cm)</div>
              </div>
            </div>

            {/* Footer do story card */}
            <div style={scFooterStyle}>
              <div style={fraseStyle}>Disciplina hoje. Liberdade amanhã.</div>
              <div style={brandRowStyle}>
                <div style={brandDotStyle} />
                <span style={brandTextStyle}>glpy.com.br</span>
                <div style={brandDotStyle} />
              </div>
            </div>

          </div>
        </GLPYCard>

        {/* ── Resumo da evolução ─────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={resumoTitleStyle}>Resumo da evolução</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={resumoRowStyle}>
              <span style={resumoKeyStyle}>
                <TrendingUp size={15} color={lightColors.text.secondary} strokeWidth={2} />
                Peso eliminado
              </span>
              <span style={resumoValGreenStyle}>{evolucaoKg}</span>
            </div>
            <div style={resumoDividerStyle} />
            <div style={resumoRowStyle}>
              <span style={resumoKeyStyle}>
                <Ruler size={15} color={lightColors.text.secondary} strokeWidth={2} />
                Cintura
              </span>
              <span style={resumoValGreenStyle}>{evolucaoCintura}</span>
            </div>
            <div style={resumoDividerStyle} />
            <div style={resumoRowStyle}>
              <span style={resumoKeyStyle}>
                <CalendarDays size={15} color={lightColors.text.secondary} strokeWidth={2} />
                Tempo
              </span>
              <span style={resumoValStyle}>{diasStr}</span>
            </div>
            <div style={resumoDividerStyle} />
            <div style={resumoRowStyle}>
              <span style={resumoKeyStyle}>
                <Check size={15} color={lightColors.text.secondary} strokeWidth={2} />
                Protocolo
              </span>
              <span style={resumoValStyle}>{protocoloNome}</span>
            </div>
          </div>
        </GLPYCard>

        {/* ── Compartilhar ──────────────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={shareTitleStyle}>Compartilhar</div>
          <div style={shareGridStyle}>
            {SHARE_OPTIONS.map(opt => (
              <div
                key={opt.id}
                style={shareBtnStyle}
                onClick={() => handleShare(opt.id)}
                role="button"
                aria-label={opt.label}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        </GLPYCard>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <GLPYButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSaveImage}
        >
          Salvar imagem
        </GLPYButton>

      </div>
    </GLPYScreen>
  );
}
