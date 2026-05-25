// GLPY — Results Screen
// System: Operational — LIGHT PREMIUM

import React from 'react';
import { Ruler, CheckSquare, Flame, Scale, TrendingDown, Image, Sparkles, Check, Camera, ChevronLeft, LineChart } from 'lucide-react';
import glpyLogoLight from '@/assets/logos/logo-light.png';

import { GLPYScreen, GLPYHeader, GLPYCard } from '../../components/ui';
import BottomNav from '../../components/BottomNav';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// ── Props ─────────────────────────────────────────────────────────────────────

interface ResultsScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

// ── Data helpers ──────────────────────────────────────────────────────────────

function readOnboarding() {
  try { return JSON.parse(localStorage.getItem('glpy_onboarding') || '{}') ?? {}; }
  catch { return {}; }
}

function readMedidas() {
  try { return JSON.parse(localStorage.getItem('glpy_medidas_corporais') || '{}') ?? {}; }
  catch { return {}; }
}

function readCheckinHistorico(): unknown[] {
  try { return JSON.parse(localStorage.getItem('glpy_checkin_historico') || '[]') ?? []; }
  catch { return []; }
}

function readAtividadeHoje() {
  try {
    const raw = localStorage.getItem('glpy_atividade_hoje');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = parsed?.savedAt
      ? new Date(parsed.savedAt).toISOString().slice(0, 10)
      : null;
    return savedDate === today ? parsed : null;
  } catch { return null; }
}

function readCurrentWeight(): number | null {
  // Priority: most recent save from saveWeightEntry
  for (const key of ['glpy_latest_weight', 'glpy_current_weight']) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const v = parseFloat(String(parsed?.weight ?? parsed ?? ''));
        if (!isNaN(v) && v > 0) return v;
      }
    } catch {}
  }
  // Legacy string key
  try {
    const v = parseFloat(localStorage.getItem('glpy_peso_atual') ?? '');
    if (!isNaN(v) && v > 0) return v;
  } catch {}
  // Onboarding fallback
  try {
    const onb = readOnboarding();
    const v = parseFloat(String(onb.peso_atual ?? onb.pesoAtual ?? ''));
    if (!isNaN(v) && v > 0) return v;
  } catch {}
  return null;
}

function readStreak(): number {
  try {
    const raw = localStorage.getItem('glpy_checkin_historico');
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return 0;
    const dates = (parsed as unknown[]).map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'date' in item) return (item as Record<string, unknown>).date as string;
      return '';
    }).filter(Boolean) as string[];
    const unique = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
    if (unique.length === 0) return 0;
    const todayStr    = new Date().toISOString().split('T')[0];
    const yest        = new Date(); yest.setDate(yest.getDate() - 1);
    const yesterdayStr = yest.toISOString().split('T')[0];
    const hasToday     = unique.includes(todayStr);
    const hasYesterday = unique.includes(yesterdayStr);
    if (!hasToday && !hasYesterday) return 0;
    let streak = 0;
    const d = new Date(hasToday ? todayStr : yesterdayStr);
    while (true) {
      const s = d.toISOString().split('T')[0];
      if (unique.includes(s)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return streak;
  } catch { return 0; }
}

interface BodyPhoto {
  id:           string;
  date:         string;
  weight:       number | null;
  imageDataUrl: string;
}

function readBodyPhotos(): BodyPhoto[] {
  try {
    const raw = localStorage.getItem('glpy_body_photos');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function fmt(v: number | null, decimals = 2): string {
  if (v === null) return '—';
  return v.toFixed(decimals).replace('.', ',');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsScreen({ onBack, onNavigate }: ResultsScreenProps) {
  const onb        = readOnboarding();
  const medidas    = readMedidas();
  const hist       = readCheckinHistorico();
  const atividade  = readAtividadeHoje();
  const streak     = readStreak();
  const bodyPhotos = readBodyPhotos();
  const bodyPhotoFirst = bodyPhotos.length > 0 ? bodyPhotos[0]                 : null;
  const bodyPhotoLast  = bodyPhotos.length > 1 ? bodyPhotos[bodyPhotos.length - 1] : null;

  const pesoInicial: number | null = (() => {
    // Mesma cascata usada pela Home
    try {
      const rs = JSON.parse(localStorage.getItem('glpy_results_summary') || '{}');
      const rsW = parseFloat(String(rs.initialWeight ?? ''));
      if (!isNaN(rsW) && rsW > 0) return rsW;
    } catch {}
    const v1 = parseFloat(String(onb.pesoInicial ?? onb.peso_inicial ?? ''));
    if (!isNaN(v1) && v1 > 0) return v1;
    // Fallback: peso_atual do onboarding (mesmo fallback da Home)
    const v2 = parseFloat(String(onb.peso_atual ?? onb.pesoAtual ?? ''));
    return !isNaN(v2) && v2 > 0 ? v2 : null;
  })();

  const pesoAtual: number | null = readCurrentWeight();

  const pesoMeta: number | null = (() => {
    // Mesma cascata usada pela Home: pesoMeta → peso_sonho → glpy_peso_sonho
    const v1 = parseFloat(String(onb.pesoMeta ?? onb.peso_meta ?? onb.targetWeight ?? ''));
    if (!isNaN(v1) && v1 > 0) return v1;
    const v2 = parseFloat(String(onb.peso_sonho ?? ''));
    if (!isNaN(v2) && v2 > 0) return v2;
    const v3 = parseFloat(localStorage.getItem('glpy_peso_sonho') ?? '');
    return !isNaN(v3) && v3 > 0 ? v3 : null;
  })();

  const pesoEliminado: number | null =
    pesoInicial !== null && pesoAtual !== null
      ? parseFloat(Math.max(0, pesoInicial - pesoAtual).toFixed(1))
      : null;

  const faltaEliminar: number | null =
    pesoAtual !== null && pesoMeta !== null
      ? parseFloat(Math.max(0, pesoAtual - pesoMeta).toFixed(1))
      : null;

  const totalRange =
    pesoInicial !== null && pesoMeta !== null ? pesoInicial - pesoMeta : null;
  const progressoPct =
    pesoEliminado !== null && totalRange !== null && totalRange > 0
      ? Math.min(100, Math.round((pesoEliminado / totalRange) * 100))
      : 0;

  const cinturaVal: string | null = (() => {
    const v = parseFloat(String(medidas.cintura ?? medidas.waist ?? ''));
    return !isNaN(v) && v > 0 ? `${fmt(v)} cm` : null;
  })();

  const checkins = Array.isArray(hist) ? hist.length : 0;

  const atividadeLabel: string | null = atividade
    ? `${atividade.duration ?? '—'} min hoje`
    : null;

  const hasAnyData =
    pesoInicial !== null || pesoAtual !== null || pesoMeta !== null || checkins > 0;

  // ── Shared Styles ──────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: gap.medium,
  };

  const cardIconWrap: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 10,
    background: `linear-gradient(135deg, ${lightColors.brand.green}22, ${lightColors.brand.greenDark}33)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  };

  const cardTitleRowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: gap.small, marginBottom: gap.small,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary, fontSize: fontSize.bodyDefault,
    fontWeight: fontWeight.h3, color: lightColors.text.navy,
  };

  const cardSubtextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary, fontSize: fontSize.small,
    color: lightColors.text.secondary, lineHeight: 1.5, margin: 0,
  };

  const metaMetricsRowStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: gap.medium, marginBottom: gap.small,
  };

  const metaMetricBoxStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 2,
  };

  const metaLabelStyle: React.CSSProperties = {
    fontSize: fontSize.small - 2, color: lightColors.text.secondary, fontWeight: '500',
  };

  const metaValueStyle: React.CSSProperties = {
    fontSize: fontSize.small, fontWeight: '700', color: lightColors.text.navy,
  };

  const progressBarTrackStyle: React.CSSProperties = {
    width: '100%', height: 10, background: lightColors.background.secondary,
    borderRadius: 99, overflow: 'hidden', position: 'relative', marginTop: gap.medium,
  };

  const progressBarFillStyle: React.CSSProperties = {
    width: `${progressoPct}%`, height: '100%',
    background: lightColors.brand.green, borderRadius: 99,
  };

  const labelsRowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between',
    fontSize: fontSize.small - 3, color: lightColors.text.secondary,
    marginTop: 6, fontWeight: '600',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: gap.small, marginTop: gap.medium,
  };

  const gridItemStyle: React.CSSProperties = {
    background: lightColors.background.secondary, padding: '12px 14px',
    borderRadius: radius.secondary, display: 'flex', flexDirection: 'column', gap: 4,
  };

  const gridValStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary, fontSize: fontSize.bodyDefault,
    fontWeight: '700', color: lightColors.text.navy,
  };

  const photoContainerStyle: React.CSSProperties = {
    display: 'flex', gap: gap.small, marginTop: gap.medium, marginBottom: gap.small,
  };

  const photoBoxBase: React.CSSProperties = {
    flex: 1, height: 120, borderRadius: radius.secondary,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  };

  const beforeBoxStyle: React.CSSProperties = {
    ...photoBoxBase,
    background: lightColors.background.secondary,
    border: `1px solid ${lightColors.border.soft}`,
  };

  const afterBoxStyle: React.CSSProperties = {
    ...photoBoxBase,
    background: `${lightColors.brand.green}08`,
    border: `1px dashed ${lightColors.brand.green}44`,
  };

  const photoLabelStyle: React.CSSProperties = {
    fontSize: fontSize.small - 2, fontWeight: '600', color: lightColors.text.secondary,
  };

  const photoWeightStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary, fontSize: fontSize.small - 2,
    fontWeight: '700', color: lightColors.text.secondary,
  };

  const seqRowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'baseline', gap: 4, margin: '8px 0',
  };

  const seqValueStyle: React.CSSProperties = {
    fontSize: 32, fontWeight: '800', color: lightColors.text.navy,
  };

  const seqLabelStyle: React.CSSProperties = {
    fontSize: fontSize.small, fontWeight: '600', color: lightColors.brand.greenDark,
  };

  const pendingBoxStyle: React.CSSProperties = {
    background: lightColors.background.secondary,
    borderRadius: radius.secondary,
    padding: '16px',
    textAlign: 'center',
  };

  const pendingTextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    color: lightColors.text.secondary,
    lineHeight: 1.5,
  };

  // ── Empty state card helper ────────────────────────────────────────────────

  function PendingCard({ label }: { label: string }) {
    return (
      <div style={pendingBoxStyle}>
        <p style={pendingTextStyle}>{label}</p>
      </div>
    );
  }

  return (
    <>
      <GLPYScreen variant="light" style={{ backgroundColor: '#FFFFFF' }}>
        <header className="sticky top-0 bg-white -mx-6 -mt-6 px-6 pt-6 pb-8 border-b border-[#E2EBE7] z-10 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button onClick={() => { try { sessionStorage.removeItem('glpy_restore_tab'); } catch {} onBack?.(); }} className="w-9 h-9 bg-[#F4F6F8] border border-[#E2EBE7] rounded-full flex items-center justify-center flex-shrink-0">
                <ChevronLeft className="w-4 h-4 text-[#3D5A70]" />
              </button>
              <img src={glpyLogoLight} alt="GLPY" className="w-[84px] h-auto object-contain" />
            </div>

            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                <LineChart className="w-5 h-5 text-blue-500 stroke-[2.2]" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-[#0A1628] tracking-tight">
            Resultados
          </h1>
          <p className="text-sm text-[#3D5A70] mt-1">
            Acompanhe sua evolução
          </p>
        </header>

      <div style={containerStyle}>

        {/* ── Card 1 — Conquista principal ──────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingDown size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Você já eliminou</span>
          </div>

          {pesoEliminado !== null ? (
            <>
              <div style={{
                fontFamily: fontFamily.primary, fontSize: 38, fontWeight: '800',
                color: lightColors.brand.greenDark, margin: '8px 0', letterSpacing: '-0.02em',
              }}>
                {fmt(pesoEliminado)} kg
              </div>
              <p style={cardSubtextStyle}>desde o início da sua jornada.</p>
              {progressoPct > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: `${lightColors.brand.green}14`,
                  border: `1px solid ${lightColors.brand.green}33`,
                  borderRadius: 99, padding: '4px 12px',
                  fontSize: fontSize.small - 1, fontWeight: '600',
                  color: lightColors.brand.greenDark, marginTop: gap.small,
                }}>
                  {progressoPct}% da sua meta concluída
                </div>
              )}
            </>
          ) : (
            <PendingCard label="Registre seu peso para acompanhar seu progresso." />
          )}
        </GLPYCard>

        {/* ── Card 2 — Progresso da meta ────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Scale size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Progresso da meta</span>
          </div>

          {hasAnyData ? (
            <>
              <div style={metaMetricsRowStyle}>
                <div style={metaMetricBoxStyle}>
                  <span style={metaLabelStyle}>Peso inicial</span>
                  <span style={metaValueStyle}>{fmt(pesoInicial)} kg</span>
                </div>
                <div style={metaMetricBoxStyle}>
                  <span style={metaLabelStyle}>Peso atual</span>
                  <span style={metaValueStyle}>{fmt(pesoAtual)} kg</span>
                </div>
                <div style={metaMetricBoxStyle}>
                  <span style={metaLabelStyle}>Meta</span>
                  <span style={metaValueStyle}>{fmt(pesoMeta)} kg</span>
                </div>
                <div style={metaMetricBoxStyle}>
                  <span style={metaLabelStyle}>Falta eliminar</span>
                  <span style={{ ...metaValueStyle, color: lightColors.brand.greenDark }}>
                    {fmt(faltaEliminar)} kg
                  </span>
                </div>
              </div>
              <div style={progressBarTrackStyle}>
                <div style={progressBarFillStyle} />
              </div>
              <div style={labelsRowStyle}>
                <span>0%</span>
                <span>{progressoPct}%</span>
                <span>META</span>
              </div>
            </>
          ) : (
            <PendingCard label="Complete seu perfil para ver seu progresso de meta." />
          )}
        </GLPYCard>

        {/* ── Card 3 — Evolução resumida ────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <TrendingDown size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Evolução resumida</span>
          </div>

          <div style={gridStyle}>
            {[
              { label: 'Peso eliminado', value: pesoEliminado !== null ? `${fmt(pesoEliminado)} kg` : '—', Icon: Scale },
              { label: 'Cintura', value: cinturaVal ?? '—', Icon: Ruler },
              { label: 'Check-ins', value: checkins > 0 ? `${checkins} dias` : '0 dias', Icon: CheckSquare },
              { label: 'Atividade', value: atividadeLabel ?? 'Nenhuma hoje', Icon: Flame },
            ].map((stat) => {
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

        {/* ── Card 4 — Transformação visual ─────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Image size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Transformação visual</span>
          </div>

          <div style={photoContainerStyle}>
            {/* Slot Antes */}
            <div
              style={{ ...beforeBoxStyle, cursor: 'pointer', ...(bodyPhotoFirst ? { position: 'relative', overflow: 'hidden', justifyContent: 'space-between', padding: 8 } : {}) }}
              onClick={() => onNavigate?.('foto')}
            >
              <span style={{ ...photoLabelStyle, ...(bodyPhotoFirst ? { position: 'relative', zIndex: 1, background: 'rgba(10,22,40,0.55)', color: '#fff', padding: '1px 7px', borderRadius: 99 } : {}) }}>
                Antes
              </span>
              {bodyPhotoFirst ? (
                <>
                  <img src={bodyPhotoFirst.imageDataUrl} alt="Antes" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ ...photoWeightStyle, position: 'relative', zIndex: 1, background: 'rgba(10,22,40,0.55)', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>
                    {bodyPhotoFirst.weight ? `${bodyPhotoFirst.weight.toFixed(1).replace('.', ',')} kg` : '—'}
                  </span>
                </>
              ) : (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: lightColors.background.primary, border: `1px solid ${lightColors.border.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0' }}>
                    <Camera size={16} color={lightColors.text.secondary} strokeWidth={2.25} />
                  </div>
                  <span style={photoWeightStyle}>{fmt(pesoInicial)} kg</span>
                </>
              )}
            </div>
            {/* Slot Depois */}
            <div
              style={{ ...afterBoxStyle, cursor: 'pointer', ...(bodyPhotoLast ? { position: 'relative', overflow: 'hidden', justifyContent: 'space-between', padding: 8 } : {}) }}
              onClick={() => onNavigate?.('foto')}
            >
              <span style={{ ...photoLabelStyle, ...(bodyPhotoLast ? { position: 'relative', zIndex: 1, background: 'rgba(10,22,40,0.55)', color: '#fff', padding: '1px 7px', borderRadius: 99 } : {}) }}>
                Depois
              </span>
              {bodyPhotoLast ? (
                <>
                  <img src={bodyPhotoLast.imageDataUrl} alt="Depois" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ ...photoWeightStyle, position: 'relative', zIndex: 1, background: 'rgba(10,22,40,0.55)', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>
                    {bodyPhotoLast.weight ? `${bodyPhotoLast.weight.toFixed(1).replace('.', ',')} kg` : '—'}
                  </span>
                </>
              ) : (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF', border: `1px solid ${lightColors.brand.green}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0', boxShadow: `0 2px 8px ${lightColors.brand.green}14` }}>
                    <Camera size={16} color={lightColors.brand.greenDark} strokeWidth={2.25} />
                  </div>
                  <span style={{ ...photoWeightStyle, color: lightColors.brand.greenDark }}>
                    {fmt(pesoAtual)} kg
                  </span>
                </>
              )}
            </div>
          </div>

          <p style={{ ...cardSubtextStyle, marginTop: 4 }}>
            Adicione fotos pelo registro de progresso para visualizar sua transformação.
          </p>
        </GLPYCard>

        {/* ── Card 5 — Sequência e consistência ─────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <CheckSquare size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Sua sequência</span>
          </div>

          <div style={seqRowStyle}>
            <span style={seqValueStyle}>{streak}</span>
            <span style={seqLabelStyle}>dias</span>
          </div>
          <p style={cardSubtextStyle}>
            {streak > 0
              ? 'Continue assim. Pequenos registros constroem grandes mudanças.'
              : 'Faça seu primeiro check-in para iniciar sua sequência.'}
          </p>
        </GLPYCard>

        {/* ── Card 6 — Próximo passo ────────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={cardTitleRowStyle}>
            <div style={cardIconWrap}>
              <Sparkles size={16} color={lightColors.brand.greenDark} strokeWidth={2} />
            </div>
            <span style={cardTitleStyle}>Próximo passo</span>
          </div>
          <p style={cardSubtextStyle}>
            {checkins === 0
              ? 'Faça seu primeiro check-in diário para acompanhar sua evolução.'
              : streak === 0
                ? `Você já fez ${checkins} check-in${checkins > 1 ? 's' : ''}. Faça o check-in de hoje para iniciar sua sequência.`
                : streak < 7
                  ? `Continue assim. Faltam ${7 - streak} dias para completar sua primeira semana.`
                  : 'Excelente. Você completou sua primeira semana de sequência.'}
          </p>
        </GLPYCard>

      </div>
    </GLPYScreen>

    <BottomNav active="progress" onNavigate={onNavigate ?? (() => {})} />
  </>
);
}
