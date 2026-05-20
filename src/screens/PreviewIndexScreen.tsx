// GLPY — Developer Previews Index Screen
// System: Operational / Developer Utility — LIGHT PREMIUM
// Authority: docs/glpy-screen-map-v1.md | docs/glpy-design-system-v1.md
//
// Esta tela centraliza todos os previews de telas mockadas no MVP.
// Permite que desenvolvedores e revisores acessem rapidamente rotas isoladas.

import React from 'react';
import {
  ChevronRight, Compass, ListChecks, TrendingDown, Syringe, Camera,
  Droplets, Utensils, Smile, Flame, Scale, CheckSquare, PlusCircle,
  HelpCircle, Ruler, Settings, AlertCircle, PlayCircle, Eye, Share2, Image,
  Calendar, Award, Layers
} from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard } from '../components/ui';
import { lightColors } from '../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../theme/typography';
import { gap, padding } from '../theme/spacing';
import { radius } from '../theme/radius';

// ── Types & Metadata ─────────────────────────────────────────────────────────

interface PreviewItem {
  name: string;
  path: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

interface PreviewGroup {
  title: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  items: PreviewItem[];
}

const PREVIEW_GROUPS: PreviewGroup[] = [
  {
    title: 'Entrega Principal',
    Icon: Award,
    items: [
      { name: 'Protocolos', path: '/preview/protocols', description: 'Biblioteca de protocolos GLPY', Icon: ListChecks },
      { name: 'Protocolo Anti-Rebote', path: '/preview/protocol-anti-rebote', description: 'Protocolo principal da oferta', Icon: Scale },
      { name: 'Receitas', path: '/preview/recipes', description: 'Receitas para a jornada GLP-1', Icon: Utensils },
    ],
  },
  {
    title: 'Protocolos Individuais',
    Icon: Layers,
    items: [
      { name: '1 · Sobrevivendo às Canetas',        path: '/preview/protocolo1',  description: 'Adaptação nos primeiros dias — náusea, timing e o que comer', Icon: Syringe },
      { name: '2 · Controle de Efeitos Colaterais', path: '/preview/protocolo2',  description: 'Gerenciar sintomas adversos do GLP-1 com segurança', Icon: AlertCircle },
      { name: '3 · Anti-Queda de Cabelo',           path: '/preview/protocolo3',  description: 'Nutrição e cuidados para preservar os fios durante o emagrecimento', Icon: HelpCircle },
      { name: '4 · Anti-Rebote',                    path: '/preview/protocolo4',  description: 'Trave o efeito rebote em 7 dias com ciência', Icon: Scale },
      { name: '5 · Psicologia do Emagrecimento',    path: '/preview/protocolo5',  description: 'Mente e comportamento como aliados da perda de peso', Icon: Smile },
      { name: '6 · Alimentação para Baixo Apetite', path: '/preview/protocolo6',  description: 'Nutrição densa e prática para quem não sente fome', Icon: Utensils },
      { name: '7 · Não Perca Músculo',              path: '/preview/protocolo7',  description: 'Preservar massa magra durante déficit calórico com GLP-1', Icon: Flame },
      { name: '8 · Energia Baixa',                  path: '/preview/protocolo8',  description: 'Estratégias para combater fadiga e cansaço no tratamento', Icon: Droplets },
      { name: '9 · Ajuste Metabólico',              path: '/preview/protocolo9',  description: 'Otimizar metabolismo e quebrar platôs de emagrecimento', Icon: TrendingDown },
      { name: '10 · Transição — Parar a Caneta',    path: '/preview/protocolo10', description: 'Manter os resultados ao encerrar o uso do GLP-1', Icon: CheckSquare },
    ],
  },
  {
    title: 'Onboarding',
    Icon: Compass,
    items: [
      { name: 'Peso Atual', path: '/preview/current-weight', description: 'Registro de peso inicial no onboarding', Icon: Scale },
      { name: 'Altura', path: '/preview/height', description: 'Input de altura no onboarding', Icon: Ruler },
      { name: 'Peso Alvo', path: '/preview/target-weight', description: 'Definição da meta de peso', Icon: CheckSquare },
      { name: 'Ritmo de Perda', path: '/preview/weight-pace', description: 'Seleção da velocidade de emagrecimento', Icon: Flame },
      { name: 'Unidades', path: '/preview/units', description: 'Configuração de métricas (kg/cm vs lbs/in)', Icon: Settings },
    ],
  },
  {
    title: 'Operacional Diário',
    Icon: ListChecks,
    items: [
      { name: 'Ações rápidas', path: '/preview/quick-actions', description: 'Hub operacional de ações rápidas do GLPY', Icon: PlusCircle },
      { name: 'Registro de Água', path: '/preview/water', description: 'Tracking diário de hidratação quantitativa', Icon: Droplets },
      { name: 'Registro de Refeições', path: '/preview/food-log', description: 'Inputs e acompanhamento de alimentação', Icon: Utensils },
      { name: 'Humor / Emoção', path: '/preview/emotion', description: 'Seletor e nota do estado mental', Icon: Smile },
      { name: 'Atividade Física', path: '/preview/activity', description: 'Registro e tracking de exercícios físicos', Icon: Flame },
      { name: 'Medidas Corporais', path: '/preview/body-measurements', description: 'Módulo de entrada de medidas (Cintura, Quadril, etc.)', Icon: Ruler },
      { name: 'Consolidação Check-in', path: '/preview/check-in', description: 'Resumo completo diário e gamificação de XP', Icon: CheckSquare },
    ],
  },
  {
    title: 'Progresso',
    Icon: TrendingDown,
    items: [
      { name: 'Resultados', path: '/preview/results', description: 'Resumo visual da evolução GLPY', Icon: CheckSquare },
      { name: 'Histórico de Peso', path: '/preview/weight-history', description: 'SVG Line Chart e histórico de oscilação', Icon: Scale },
      { name: 'Linha do Tempo', path: '/preview/progress-timeline', description: 'Marcos importantes da jornada GLPY', Icon: Calendar },
    ],
  },
  {
    title: 'Aplicação & Módulo Médico',
    Icon: Syringe,
    items: [
      { name: 'Registro de Aplicação', path: '/preview/injection', description: 'Agendamento e tracking de caneta GLP-1', Icon: Syringe },
      { name: 'Configurações de Tratamento', path: '/preview/treatment-settings', description: 'Ajuste de dosagem, marca e frequência', Icon: Settings },
      { name: 'Efeitos Colaterais', path: '/preview/side-effects', description: 'Tracking de sintomas e desconfortos metabólicos', Icon: AlertCircle },
      { name: 'Configurações de Peso', path: '/preview/weight-settings', description: 'Módulo auxiliar para configurar metas', Icon: Scale },
    ],
  },
  {
    title: 'Visual / Compartilhamento',
    Icon: Camera,
    items: [
      { name: 'Galeria de Fotos', path: '/preview/photo-timeline', description: 'Linha do tempo visual do corpo em evolução', Icon: Image },
      { name: 'Compartilhamento de Progresso', path: '/preview/visual-progress-share', description: 'Card para exportar progresso no Instagram/Stories', Icon: Share2 },
    ],
  },
  {
    title: 'Debug / Integração',
    Icon: PlayCircle,
    items: [
      { name: 'Teste Inteligência Local', path: '/preview/local-intelligence-test', description: 'Visualizador de logs e prompt compilado para IA', Icon: PlayCircle },
      { name: 'Metas Diárias Engine', path: '/preview/daily-targets-test', description: 'Calculadora de BMR, TDEE, macros e auditoria JSON', Icon: Scale },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PreviewIndexScreen() {

  function handleNavigate(path: string) {
    window.location.href = path;
  }

  // ── Shared Styles ──────────────────────────────────────────────────────────

  const containerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.large,
  };

  const groupCardStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.medium,
  };

  const groupTitleRowStyle: React.CSSProperties = {
    display:      'flex',
    alignItems:   'center',
    gap:          gap.small,
    borderBottom: `1.5px solid ${lightColors.border.soft}`,
    paddingBottom: 8,
  };

  const groupTitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.bodyDefault,
    fontWeight: fontWeight.h2,
    color:      lightColors.text.navy,
    margin:     0,
  };

  const itemsListStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           gap.small,
  };

  const rowLinkStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            12,
    padding:        '12px 14px',
    background:     lightColors.background.secondary,
    borderRadius:   radius.secondary,
    border:         `1px solid transparent`,
    cursor:         'pointer',
    transition:     'transform 0.15s ease, background 0.15s ease',
  };

  const linkIconWrap: React.CSSProperties = {
    width:          30,
    height:         30,
    borderRadius:   8,
    background:     `#FFFFFF`,
    border:         `1px solid ${lightColors.border.soft}`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  };

  const textBlockStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
    flex:          1,
  };

  const linkNameStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small,
    fontWeight: '700',
    color:      lightColors.text.navy,
  };

  const linkDescriptionStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize:   fontSize.small - 2, // 12px
    color:      lightColors.text.secondary,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader
        title="Central de Previews"
        subtitle="Selecione uma tela para validar no navegador"
      />

      <div style={containerStyle}>
        {PREVIEW_GROUPS.map((group) => {
          const GroupIcon = group.Icon;
          return (
            <GLPYCard key={group.title} variant="light" style={groupCardStyle}>
              <div style={groupTitleRowStyle}>
                <GroupIcon size={16} color={lightColors.brand.greenDark} strokeWidth={2.5} />
                <h3 style={groupTitleStyle}>{group.title}</h3>
              </div>

              <div style={itemsListStyle}>
                {group.items.map((item) => {
                  const ItemIcon = item.Icon;
                  return (
                    <div
                      key={item.path}
                      style={rowLinkStyle}
                      onClick={() => handleNavigate(item.path)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${lightColors.brand.green}12`;
                        e.currentTarget.style.borderColor = `${lightColors.brand.green}44`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = lightColors.background.secondary;
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={linkIconWrap}>
                        <ItemIcon size={14} color={lightColors.brand.greenDark} strokeWidth={2.25} />
                      </div>
                      <div style={textBlockStyle}>
                        <span style={linkNameStyle}>{item.name}</span>
                        <span style={linkDescriptionStyle}>{item.description}</span>
                      </div>
                      <ChevronRight size={16} color={lightColors.text.secondary} />
                    </div>
                  );
                })}
              </div>
            </GLPYCard>
          );
        })}
      </div>
    </GLPYScreen>
  );
}
