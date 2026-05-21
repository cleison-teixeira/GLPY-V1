// GLPY — Ações Rápidas Screen V3 (Light Premium Refined)
// System: Operational Hub — LIGHT PREMIUM
// Authority: docs/glpy-quick-actions-v2-refined.md | docs/glpy-design-system-v1.md
//
// Esta tela é o hub operacional de ações rápidas do GLPY.
// A tela usa LIGHT PREMIUM porque serve para registros rápidos.
// Telas abertas por ela são telas operacionais Light Premium.
// No MVP, ações e navegação são mockadas via console.log.
// Futuramente será conectada ao App Shell e navegação real.

import React from 'react';
import { 
  Scale, Droplets, Utensils, Syringe, Activity, Smile, Flame, Ruler, Camera, CheckSquare, Sparkles, Lightbulb, Compass, User, TrendingDown, ChevronRight
} from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuickActionsScreenProps {
  onBack?: () => void;
}

// ── Grid Item Component (Light Premium Compact style) ──────────────────────────

interface GridItemProps {
  label: string;
  subtext: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onClick: () => void;
}

function GridItem({ label, subtext, Icon, onClick }: GridItemProps) {
  const [hovered, setHovered] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    background:   hovered ? lightColors.background.secondary : '#FFFFFF',
    borderRadius: radius.main,
    border:       `1.5px solid ${hovered || active ? lightColors.brand.green : lightColors.border.soft}`,
    padding:      '12px 14px',
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    cursor:       'pointer',
    transition:   'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow:    hovered || active 
      ? '0 6px 20px rgba(106, 210, 143, 0.12)' 
      : '0 2px 8px rgba(0, 0, 0, 0.03)',
    transform:    active ? 'scale(0.97)' : hovered ? 'scale(1.02)' : 'scale(1)',
    minWidth:     0,
    boxSizing:    'border-box',
    width:        '100%',
  };

  const iconWrapStyle: React.CSSProperties = {
    width:          34,
    height:         34,
    borderRadius:   10,
    background:     'rgba(106, 210, 143, 0.08)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    border:         `1px solid rgba(106, 210, 143, 0.15)`,
  };

  const textContainerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    flex:          1,
    gap:           1,
    overflow:      'hidden',
    minWidth:      0,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   13,
    fontWeight: '700',
    color:      lightColors.text.navy,
    margin:     0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:   'hidden',
  };

  const subtextStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   11,
    color:      lightColors.text.secondary,
    margin:     0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow:   'hidden',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      <div style={iconWrapStyle}>
        <Icon size={16} color={lightColors.brand.greenDark} strokeWidth={2.25} />
      </div>
      
      <div style={textContainerStyle}>
        <p style={labelStyle}>{label}</p>
        <p style={subtextStyle}>{subtext}</p>
      </div>

      <ChevronRight size={12} color={lightColors.text.secondary} style={{ opacity: 0.5, flexShrink: 0 }} />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuickActionsScreen({ onBack }: QuickActionsScreenProps) {

  // ── Shared Styles ──────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.medium,
    paddingBottom: 88, // clear spacing above bottom nav
    boxSizing:     'border-box',
    width:         '100%',
  };

  // ── Bottom Nav ──────────────────────────────────────────────────────────────

  const bottomNavStyle: React.CSSProperties = {
    position:        'fixed',
    bottom:          0,
    left:            '50%',
    transform:       'translateX(-50%)',
    width:           '100%',
    maxWidth:        430,
    height:          76,
    background:      'rgba(255, 255, 255, 0.96)',
    backdropFilter:  'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop:       `1.5px solid ${lightColors.border.soft}`,
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-around',
    padding:         '0 12px',
    zIndex:          100,
  };

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           4,
    color:         active ? lightColors.brand.greenDark : lightColors.text.secondary,
    cursor:        'pointer',
    background:    'none',
    border:        'none',
    padding:       0,
  });

  const centralBtnContainer: React.CSSProperties = {
    position:   'relative',
    top:        -18,
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const centralBtnStyle: React.CSSProperties = {
    width:          52,
    height:         52,
    borderRadius:   '50%',
    background:     `linear-gradient(135deg, ${lightColors.brand.green}, ${lightColors.brand.greenDark})`,
    border:         '4px solid #FFFFFF',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    color:          '#FFFFFF',
    boxShadow:      `0 4px 16px rgba(106, 210, 143, 0.35)`,
    cursor:         'pointer',
    fontSize:       24,
    fontWeight:     'bold',
    transition:     'transform 0.2s ease',
  };

  const avatarStyle: React.CSSProperties = {
    width:          24,
    height:         24,
    borderRadius:   '50%',
    background:     `linear-gradient(135deg, ${lightColors.brand.green}, ${lightColors.brand.greenDark})`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontWeight:     'bold',
    fontSize:       9,
    color:          '#FFFFFF',
    border:         '1px solid rgba(0, 0, 0, 0.05)',
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader title="Ações rápidas" onBack={onBack} />

      <div style={containerStyle}>
        
        {/* ── Subtitle ────────────────────────────────────────────────────── */}
        <p style={{
          fontFamily: fontFamily.primary,
          fontSize:   fontSize.small + 1, // 14px
          color:      lightColors.text.secondary,
          margin:     '0 0 -4px 0',
          textAlign:  'left',
        }}>
          Registre sua jornada em poucos segundos.
        </p>

        {/* ── Card Recomendado ─────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          hoverable
          onClick={() => { window.location.href = '/preview/check-in'; }}
          style={{
            borderLeft: `4px solid ${lightColors.brand.green}`,
            background: '#FFFFFF',
            boxShadow:  '0 4px 14px rgba(0, 0, 0, 0.04)',
            padding:    '14px 16px',
            boxSizing:  'border-box',
            width:      '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: gap.small }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
              <span style={{ 
                fontSize: 10, 
                fontWeight: '800', 
                color: lightColors.brand.greenDark, 
                textTransform: 'uppercase', 
                letterSpacing: '0.06em' 
              }}>
                Recomendado agora
              </span>
              <h3 style={{ 
                fontSize: fontSize.bodyDefault + 1, 
                fontWeight: '750', 
                color: lightColors.text.navy, 
                margin: 0,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                Concluir check-in diário
              </h3>
              <p style={{ 
                fontSize: fontSize.small, 
                color: lightColors.text.secondary, 
                margin: 0,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                Feche sua rotina e mantenha sua sequência ativa.
              </p>
            </div>
            
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              background: 'rgba(106, 210, 143, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={16} color={lightColors.brand.greenDark} />
            </div>
          </div>
        </GLPYCard>

        {/* ── Grid de Ações Rápidas ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small, width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ 
            fontFamily: fontFamily.primary,
            fontSize:   11, 
            fontWeight: '800', 
            color:      lightColors.text.secondary, 
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin:     '12px 0 2px 0',
          }}>
            O que você quer registrar agora?
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: gap.small,
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <GridItem
              label="Peso"
              subtext="Registrar peso"
              Icon={Scale}
              onClick={() => { window.location.href = '/preview/current-weight'; }}
            />
            <GridItem
              label="Água"
              subtext="Hidratação"
              Icon={Droplets}
              onClick={() => { window.location.href = '/preview/water'; }}
            />
            <GridItem
              label="Refeição"
              subtext="Registrar refeição"
              Icon={Utensils}
              onClick={() => { window.location.href = '/preview/food-log'; }}
            />
            <GridItem
              label="Aplicação"
              subtext="Registrar dose"
              Icon={Syringe}
              onClick={() => { window.location.href = '/preview/injection'; }}
            />
            <GridItem
              label="Sintomas"
              subtext="Sintomas"
              Icon={Activity}
              onClick={() => { window.location.href = '/preview/side-effects'; }}
            />
            <GridItem
              label="Emoção"
              subtext="Como você está?"
              Icon={Smile}
              onClick={() => { window.location.href = '/preview/emotion'; }}
            />
            <GridItem
              label="Atividade"
              subtext="Registrar treino"
              Icon={Flame}
              onClick={() => { window.location.href = '/preview/activity'; }}
            />
            <GridItem
              label="Medidas"
              subtext="Registrar medidas"
              Icon={Ruler}
              onClick={() => { window.location.href = '/preview/body-measurements'; }}
            />
            <GridItem
              label="Foto corporal"
              subtext="Evolução"
              Icon={Camera}
              onClick={() => { window.location.href = '/preview/photo-timeline'; }}
            />
            <GridItem
              label="Check-in"
              subtext="Resumo do dia"
              Icon={CheckSquare}
              onClick={() => { window.location.href = '/preview/check-in'; }}
            />
          </div>
        </div>

        {/* ── Dica GLPY ────────────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          style={{
            background: 'rgba(106, 210, 143, 0.04)',
            border:     `1px solid rgba(106, 210, 143, 0.15)`,
            boxShadow:  'none',
            display:    'flex',
            alignItems: 'flex-start',
            gap:        12,
            padding:    '14px 16px',
            marginTop:  gap.small,
            width:      '100%',
            boxSizing:  'border-box',
          }}
        >
          <Lightbulb size={18} color={lightColors.brand.greenDark} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{
            fontFamily: fontFamily.primary,
            fontSize:   fontSize.small,
            color:      lightColors.text.navy,
            margin:     0,
            lineHeight: 1.45,
            fontWeight: '500'
          }}>
            Pequenos registros ajudam a GLPY IA a entender melhor sua jornada e encontrar padrões ao longo do tempo.
          </p>
        </GLPYCard>

      </div>

      {/* ── Bottom Navigation ───────────────────────────────────────────────── */}
      <div style={bottomNavStyle}>
        <button style={navItemStyle(false)} onClick={() => { window.location.href = '/preview/home-premium-v2'; }}>
          <Compass size={20} strokeWidth={2.25} />
          <span style={{ fontSize: 9, fontWeight: '700' }}>Home</span>
        </button>

        <button style={navItemStyle(false)} onClick={() => { window.location.href = '/preview/protocols'; }}>
          <Activity size={20} strokeWidth={2.25} />
          <span style={{ fontSize: 9, fontWeight: '700' }}>Protocolos</span>
        </button>

        {/* Central Plus Button */}
        <div style={centralBtnContainer}>
          <button
            style={centralBtnStyle}
            onClick={() => { window.location.href = '/preview/quick-actions'; }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            +
          </button>
        </div>

        <button style={navItemStyle(true)} onClick={() => { window.location.href = '/preview/quick-actions'; }}>
          <TrendingDown size={20} strokeWidth={2.25} />
          <span style={{ fontSize: 9, fontWeight: '750' }}>Ações</span>
        </button>

        <button style={navItemStyle(false)} onClick={() => { window.location.href = '/preview/home-premium-v2'; }}>
          <div style={avatarStyle}>C</div>
          <span style={{ fontSize: 9, fontWeight: '700', marginTop: 2 }}>Perfil</span>
        </button>
      </div>

    </GLPYScreen>
  );
}
