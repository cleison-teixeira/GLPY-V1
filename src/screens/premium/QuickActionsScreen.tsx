// GLPY — Ações Rápidas Screen V3 (Light Premium Refined)
// System: Operational Hub — LIGHT PREMIUM
// Authority: docs/glpy-quick-actions-v2-refined.md | docs/glpy-design-system-v1.md
//
// Esta tela é o hub operacional de ações rápidas do GLPY.
// A tela usa LIGHT PREMIUM porque serve para registros rápidos.
// Telas abertas por ela são telas operacionais Light Premium.

import React from 'react';
import { 
  Scale, Droplets, Utensils, Syringe, Activity, Smile, Flame, Ruler, Camera, CheckSquare, Sparkles, Lightbulb, Compass, User, TrendingDown, ChevronRight,
  Brain, Settings, Pill, Users, ShoppingBag, BookOpen, LayoutGrid
} from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { gap } from '../../theme/spacing';
import { radius } from '../../theme/radius';

// ── Props ─────────────────────────────────────────────────────────────────────

interface QuickActionsScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

// ── Grid Item Component (Light Premium Compact style) ──────────────────────────

interface GridItemProps {
  label: string;
  subtext: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onClick: () => void;
  badge?: string;
  isComingSoon?: boolean;
}

function GridItem({ label, subtext, Icon, onClick, badge, isComingSoon }: GridItemProps) {
  const [hovered, setHovered] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    background:   hovered ? lightColors.background.secondary : '#FFFFFF',
    borderRadius: radius.main,
    border:       `1.5px solid ${hovered || active ? (isComingSoon ? lightColors.border.soft : lightColors.brand.green) : lightColors.border.soft}`,
    padding:      '12px 14px',
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    cursor:       'pointer',
    transition:   'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow:    hovered || active 
      ? '0 6px 20px rgba(106, 210, 143, 0.08)' 
      : '0 2px 8px rgba(0, 0, 0, 0.03)',
    transform:    active ? 'scale(0.97)' : hovered ? 'scale(1.02)' : 'scale(1)',
    minWidth:     0,
    boxSizing:    'border-box',
    width:        '100%',
    opacity:      isComingSoon ? 0.82 : 1,
  };

  const iconWrapStyle: React.CSSProperties = {
    width:          34,
    height:         34,
    borderRadius:   10,
    background:     isComingSoon ? 'rgba(148, 163, 184, 0.08)' : 'rgba(106, 210, 143, 0.08)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    border:         isComingSoon ? '1px solid rgba(148, 163, 184, 0.15)' : `1px solid rgba(106, 210, 143, 0.15)`,
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
    color:      isComingSoon ? '#64748B' : lightColors.text.navy,
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
        <Icon size={16} color={isComingSoon ? '#64748B' : lightColors.brand.greenDark} strokeWidth={2.25} />
      </div>
      
      <div style={textContainerStyle}>
        <p style={labelStyle}>{label}</p>
        <p style={subtextStyle}>{subtext}</p>
      </div>

      {badge ? (
        <span style={{
          fontSize: 9,
          fontWeight: '800',
          padding: '2px 6px',
          borderRadius: 6,
          background: isComingSoon ? 'rgba(148, 163, 184, 0.1)' : 'rgba(106, 210, 143, 0.12)',
          color: isComingSoon ? '#64748B' : lightColors.brand.greenDark,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginLeft: 6,
          flexShrink: 0,
        }}>
          {badge}
        </span>
      ) : (
        <ChevronRight size={12} color={lightColors.text.secondary} style={{ opacity: 0.5, flexShrink: 0 }} />
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuickActionsScreen({ onBack, onNavigate }: QuickActionsScreenProps) {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  };

  const isRealApp = sessionStorage.getItem('glpy_nav_mode') === 'real';

  const handleNavigate = (previewPath: string, realAppAction?: string) => {
    if (onNavigate && realAppAction) {
      onNavigate(realAppAction);
    } else {
      window.location.href = previewPath;
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.href = isRealApp ? '/' : '/preview/home-premium-v2';
    }
  };

  // ── Shared Styles ──────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.medium,
    paddingBottom: 96, // clear spacing above bottom nav
    boxSizing:     'border-box',
    width:         '100%',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   11, 
    fontWeight: '800', 
    color:      lightColors.text.secondary, 
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin:     '18px 0 4px 0',
  };

  const gridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap:                 gap.small,
    width:               '100%',
    boxSizing:           'border-box',
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
      <GLPYHeader title="Painel de controle" onBack={handleBack} />

      <style>{`
        @keyframes glpyToastIn {
          from { opacity: 0; transform: translate(-50%, 12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div style={containerStyle}>
        
        {/* ── Subtitle ────────────────────────────────────────────────────── */}
        <p style={{
          fontFamily: fontFamily.primary,
          fontSize:   fontSize.small + 1, // 14px
          color:      lightColors.text.secondary,
          margin:     '0 0 -4px 0',
          textAlign:  'left',
        }}>
          Gerencie e registre sua jornada de saúde em um só lugar.
        </p>

        {/* ── Card Recomendado ─────────────────────────────────────────────── */}
        <GLPYCard
          variant="light"
          hoverable
          onClick={() => handleNavigate('/preview/check-in', 'checkin')}
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

        {/* ── GRUPO 1: REGISTROS DIÁRIOS ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small, width: '100%', boxSizing: 'border-box' }}>
          <h3 style={sectionHeaderStyle}>Registros Diários</h3>

          <div style={gridStyle}>
            <GridItem
              label="Peso"
              subtext="Registrar peso"
              Icon={Scale}
              onClick={() => handleNavigate('/preview/current-weight')}
            />
            <GridItem
              label="Água"
              subtext="Hidratação"
              Icon={Droplets}
              onClick={() => handleNavigate('/preview/water')}
            />
            <GridItem
              label="Refeição"
              subtext="Registrar refeição"
              Icon={Utensils}
              onClick={() => handleNavigate('/preview/food-log', 'fotoPrato')}
            />
            <GridItem
              label="Aplicação"
              subtext="Registrar dose"
              Icon={Syringe}
              onClick={() => handleNavigate('/preview/injection', 'injecao')}
            />
            <GridItem
              label="Sintomas"
              subtext="Registrar sintomas"
              Icon={Activity}
              onClick={() => handleNavigate('/preview/side-effects')}
            />
            <GridItem
              label="Emoção"
              subtext="Como você está?"
              Icon={Smile}
              onClick={() => handleNavigate('/preview/emotion')}
            />
            <GridItem
              label="Atividade"
              subtext="Registrar treino"
              Icon={Flame}
              onClick={() => handleNavigate('/preview/activity')}
            />
            <GridItem
              label="Medidas"
              subtext="Registrar medidas"
              Icon={Ruler}
              onClick={() => handleNavigate('/preview/body-measurements')}
            />
            <GridItem
              label="Foto corporal"
              subtext="Evolução"
              Icon={Camera}
              onClick={() => handleNavigate('/preview/photo-timeline', 'fotosEvolucao')}
            />
          </div>
        </div>

        {/* ── GRUPO 2: SUPORTE & TRATAMENTO ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small, width: '100%', boxSizing: 'border-box' }}>
          <h3 style={sectionHeaderStyle}>Suporte & Tratamento</h3>

          <div style={gridStyle}>
            <GridItem
              label="GLPY IA"
              subtext="Chat inteligente"
              Icon={Brain}
              badge="Beta"
              onClick={() => handleNavigate('/preview/chat-ia', 'chatIA')}
            />
            <GridItem
              label="Protocolos"
              subtext="Guias de saúde"
              Icon={BookOpen}
              onClick={() => handleNavigate('/preview/protocols', 'protocolHub')}
            />
            <GridItem
              label="Tratamento"
              subtext="Configurações"
              Icon={Settings}
              onClick={() => handleNavigate('/preview/treatment-settings')}
            />
          </div>
        </div>

        {/* ── GRUPO 3: ESTILO DE VIDA & PROGRAMAS ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small, width: '100%', boxSizing: 'border-box' }}>
          <h3 style={sectionHeaderStyle}>Estilo de Vida & Programas</h3>

          <div style={gridStyle}>
            <GridItem
              label="Receitas"
              subtext="Pratos saudáveis"
              Icon={Utensils}
              onClick={() => handleNavigate('/preview/recipes', 'recipes')}
            />
            <GridItem
              label="Suplementação"
              subtext="Vitaminas & macros"
              Icon={Pill}
              onClick={() => handleNavigate('/preview/supplements')}
            />
          </div>
        </div>

        {/* ── GRUPO 4: COMUNIDADE & LOJA ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: gap.small, width: '100%', boxSizing: 'border-box' }}>
          <h3 style={sectionHeaderStyle}>Comunidade & Loja</h3>

          <div style={gridStyle}>
            <GridItem
              label="Células"
              subtext="Comunidade"
              Icon={Users}
              badge="Breve"
              isComingSoon
              onClick={() => { showToast("Comunidade estará disponível em breve! 🚀"); }}
            />
            <GridItem
              label="Loja GLPY"
              subtext="Suplementos"
              Icon={ShoppingBag}
              badge="Breve"
              isComingSoon
              onClick={() => { showToast("Loja GLPY estará disponível em breve! 🛍️"); }}
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
            Use este painel para acessar de forma rápida todas as ferramentas do GLPY. Acompanhe seu tratamento e melhore seus resultados!
          </p>
        </GLPYCard>

      </div>

      {/* ── Toast Notification ──────────────────────────────────────────────── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 92, // float nicely above bottom tab bar
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: radius.main,
          fontSize: 13,
          fontWeight: '600',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          animation: 'glpyToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          whiteSpace: 'nowrap',
        }}>
          <Sparkles size={14} color="#6AD28F" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Bottom Navigation ───────────────────────────────────────────────── */}
      <div style={bottomNavStyle}>
        <button style={navItemStyle(false)} onClick={handleBack}>
          <Compass size={20} strokeWidth={2.25} />
          <span style={{ fontSize: 9, fontWeight: '700' }}>Home</span>
        </button>

        <button style={navItemStyle(false)} onClick={() => handleNavigate('/preview/hub', 'hub')}>
          <LayoutGrid size={20} strokeWidth={2.25} />
          <span style={{ fontSize: 9, fontWeight: '700' }}>HUB</span>
        </button>

        {/* Central Plus Button */}
        <div style={centralBtnContainer}>
          <button
            style={centralBtnStyle}
            onClick={() => handleNavigate('/preview/quick-actions', 'quickActions')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            +
          </button>
        </div>

        <button style={navItemStyle(true)} onClick={() => handleNavigate('/preview/quick-actions', 'quickActions')}>
          <TrendingDown size={20} strokeWidth={2.25} />
          <span style={{ fontSize: 9, fontWeight: '750' }}>Ações</span>
        </button>

        <button style={navItemStyle(false)} onClick={() => handleNavigate('/preview/home-premium-v2', 'perfil')}>
          <div style={avatarStyle}>C</div>
          <span style={{ fontSize: 9, fontWeight: '700', marginTop: 2 }}>Perfil</span>
        </button>
      </div>

    </GLPYScreen>
  );
}
