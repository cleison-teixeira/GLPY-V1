/**
 * GLPY — Tela de Planos
 * Abre checkout Kiwify direto no navegador
 */

import { useState } from 'react';

interface PlanosProps {
  onNavigate: (tela: string) => void;
  planoAtual?: string;
}

const PLANOS = [
  {
    id: 'starter',
    nome: 'Starter',
    preco: 'R$29,90',
    periodo: '/mês',
    cor: '#00C27A',
    corLight: '#E6FBF3',
    corBorder: '#C8F0E0',
    destaque: false,
    badge: null,
    link: 'https://pay.kiwify.com.br/rR7VtkF',
    descricao: 'Para começar com suporte inteligente',
    recursos: [
      '✅ Protocolos 1 e 2 (14 dias)',
      '✅ Check-in diário com GLPY.IA',
      '✅ 10 mensagens/mês para a IA',
      '✅ 3 análises de prato por foto/mês',
      '✅ Dashboard com macros personalizados',
      '✅ Streak e sistema de XP',
    ],
    bloqueados: [
      '🔒 Protocolos 3 a 10',
      '🔒 Receitas premium',
      '🔒 IA ilimitada',
    ],
  },
  {
    id: 'plus',
    nome: 'Plus',
    preco: 'R$59,90',
    periodo: '/mês',
    cor: '#7660FF',
    corLight: '#F0EEFF',
    corBorder: '#D4CEFB',
    destaque: true,
    badge: '⭐ Mais popular',
    link: 'https://pay.kiwify.com.br/HAFlJpc',
    descricao: 'O mais escolhido — resultado real',
    recursos: [
      '✅ Tudo do Starter',
      '✅ Protocolos 3 a 6 (Anti-Rebote incluso)',
      '✅ 20 mensagens/mês para a IA',
      '✅ 6 análises de prato por foto/mês',
      '✅ 30 receitas premium',
      '✅ Protocolo Anti-Queda de Cabelo',
      '✅ Protocolo Anti-Rebote EXCLUSIVO',
    ],
    bloqueados: [
      '🔒 Protocolos 7 a 10',
      '🔒 Relatório PDF médico',
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 'R$99,90',
    periodo: '/mês',
    cor: '#F5A623',
    corLight: '#FFF8ED',
    corBorder: '#FFE4A0',
    destaque: false,
    badge: null,
    link: 'https://pay.kiwify.com.br/PqIRO7e',
    descricao: 'Para quem quer controle total',
    recursos: [
      '✅ Tudo do Plus',
      '✅ Protocolos 7 a 9',
      '✅ 30 mensagens/mês para a IA',
      '✅ 9 análises de prato por foto/mês',
      '✅ Relatório PDF para médico',
      '✅ Contador ANVISA com alertas',
      '✅ Controle de injeções',
    ],
    bloqueados: [
      '🔒 Protocolo Transição (parar a caneta)',
      '🔒 Telemedicina integrada',
    ],
  },
  {
    id: 'top',
    nome: 'Top',
    preco: 'R$149',
    periodo: '/mês',
    cor: '#E8445A',
    corLight: '#FEF0F2',
    corBorder: '#F5C0C8',
    destaque: false,
    badge: '👑 Acesso total',
    link: 'https://pay.kiwify.com.br/7Uv50vO',
    descricao: 'Acesso completo + suporte prioritário',
    recursos: [
      '✅ Todos os 10 protocolos',
      '✅ IA ilimitada + fotos ilimitadas',
      '✅ Protocolo Transição (parar a caneta)',
      '✅ Telemedicina integrada',
      '✅ Suplementos dropshipping',
      '✅ Suporte prioritário',
    ],
    bloqueados: [],
  },
];

export default function Planos({ onNavigate, planoAtual = '' }: PlanosProps) {
  const [selecionado, setSelecionado] = useState('plus');
  const plano = PLANOS.find(p => p.id === selecionado) || PLANOS[1];

  const abrirCheckout = () => {
    window.open(plano.link, '_blank');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFCFB',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E2EBE7',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            background: '#F4F6F8',
            border: '1px solid #E2EBE7',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 16,
            color: '#0A1628',
          }}
        >←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#0A1628', letterSpacing: '-0.3px' }}>
            Escolha seu plano
          </div>
          <div style={{ fontSize: 11, color: '#7A9AAF' }}>Cancele quando quiser</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #E6FBF3 0%, #FAFCFB 70%)',
        padding: '20px 16px 16px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#fff',
          border: '1px solid #C8F0E0',
          borderRadius: 20,
          padding: '5px 12px',
          fontSize: 11,
          color: '#009960',
          fontWeight: 700,
          marginBottom: 10,
        }}>
          🔥 Cupom FUNDADOR40 ativo — 40% off nos primeiros 3 meses
        </div>
        <div style={{ fontSize: 13, color: '#3D5A70', lineHeight: 1.6 }}>
          Seu médico te vê 1x por mês.<br />
          <strong style={{ color: '#0A1628' }}>O GLPY está com você os outros 29 dias.</strong>
        </div>
      </div>

      {/* Seletor de planos */}
      <div style={{ padding: '0 16px', overflowX: 'auto' }}>
        <div style={{
          display: 'flex',
          gap: 8,
          paddingBottom: 4,
          marginBottom: 2,
        }}>
          {PLANOS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelecionado(p.id)}
              style={{
                flex: '0 0 auto',
                padding: '8px 16px',
                borderRadius: 20,
                border: selecionado === p.id ? `1.5px solid ${p.cor}` : '1.5px solid #E2EBE7',
                background: selecionado === p.id ? p.corLight : '#fff',
                color: selecionado === p.id ? p.cor : '#7A9AAF',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: 'all .15s',
              }}
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Card do plano selecionado */}
      <div style={{ padding: '12px 16px', flex: 1 }}>
        <div style={{
          background: '#fff',
          border: `2px solid ${plano.cor}`,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${plano.cor}20`,
        }}>
          {/* Cabeçalho do card */}
          <div style={{
            background: plano.corLight,
            padding: '16px 18px 14px',
            borderBottom: `1px solid ${plano.corBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                {plano.badge && (
                  <div style={{
                    display: 'inline-block',
                    background: plano.cor,
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    marginBottom: 6,
                  }}>{plano.badge}</div>
                )}
                <div style={{ fontWeight: 800, fontSize: 22, color: '#0A1628', letterSpacing: '-0.5px' }}>
                  GLPY {plano.nome}
                </div>
                <div style={{ fontSize: 12, color: '#3D5A70', marginTop: 2 }}>{plano.descricao}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 28, color: plano.cor, letterSpacing: '-1px', lineHeight: 1 }}>
                  {plano.preco}
                </div>
                <div style={{ fontSize: 11, color: '#7A9AAF' }}>{plano.periodo}</div>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7A9AAF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
              Incluído neste plano
            </div>
            {plano.recursos.map((r, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: '#0A1628',
                padding: '5px 0',
                borderBottom: i < plano.recursos.length - 1 ? '1px solid #F4F6F8' : 'none',
                lineHeight: 1.4,
              }}>{r}</div>
            ))}

            {plano.bloqueados.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#7A9AAF', textTransform: 'uppercase', letterSpacing: '.08em', margin: '12px 0 8px' }}>
                  Não incluso
                </div>
                {plano.bloqueados.map((r, i) => (
                  <div key={i} style={{
                    fontSize: 12,
                    color: '#7A9AAF',
                    padding: '4px 0',
                    lineHeight: 1.4,
                  }}>{r}</div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Comparativo rápido */}
        <div style={{
          background: '#0A1628',
          borderRadius: 16,
          padding: '14px 16px',
          marginTop: 12,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            Por que vale cada centavo
          </div>
          <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.7 }}>
            Você já gasta <strong style={{ color: '#00C27A' }}>R$1.400/mês</strong> na caneta.<br />
            O GLPY custa <strong style={{ color: '#00C27A' }}>{plano.preco}/mês</strong> para garantir que valeu.
          </div>
        </div>

        {/* Garantia */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#fff',
          border: '1px solid #E2EBE7',
          borderRadius: 12,
          padding: '10px 14px',
          marginTop: 10,
        }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#0A1628' }}>Garantia de 7 dias</div>
            <div style={{ fontSize: 11, color: '#7A9AAF' }}>Não gostou? Devolvemos 100% sem perguntas.</div>
          </div>
        </div>
      </div>

      {/* CTA fixo */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        background: '#fff',
        borderTop: '1px solid #E2EBE7',
        padding: '12px 16px 20px',
      }}>
        <button
          onClick={abrirCheckout}
          style={{
            width: '100%',
            background: plano.cor,
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            padding: '15px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 4px 16px ${plano.cor}40`,
            letterSpacing: '-0.2px',
          }}
        >
          Assinar GLPY {plano.nome} — {plano.preco}/mês →
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#7A9AAF', marginTop: 8 }}>
          Use o cupom <strong style={{ color: '#009960' }}>FUNDADOR40</strong> no checkout · 40% off por 3 meses
        </div>
      </div>
    </div>
  );
}
