/**
 * GLPY — Tela de Planos (HeroSpark)
 * Sprint 17B.5.4
 * Sprint 17B.40 — bloco de conta atual + logout para usuário sem plano
 */

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import { hasActiveAccess } from '../core/accessControl';
import { trackViewContent } from '../services/metaPixel';

interface PlanosProps {
  onNavigate: (tela: string) => void;
  planoAtual?: string;
}

// Rotas /go — disparam InitiateCheckout antes do checkout HeroSpark
const FUNDADOR_LINK  = '/go/fundador';
const ESSENCIAL_LINK = '/go/essencial';
const PRO_LINK       = '/go/pro';

const FUNDADOR_RECURSOS = [
  '✅ Todos os 10 protocolos clínicos',
  '✅ Dashboard com macros personalizados',
  '✅ Check-in diário com GLPY.IA',
  '✅ Análise de prato por foto',
  '✅ Registro de injeção e alertas',
  '✅ Plano semanal personalizado',
  '✅ Fotos de evolução',
  '✅ Streak e sistema de XP',
];

const OUTROS_PLANOS = [
  { nome: 'Essencial', preco: 'R$29,90', cor: '#7660FF', corLight: '#F0EEFF', corBorder: '#D4CEFB', link: ESSENCIAL_LINK },
  { nome: 'Pro',       preco: 'R$59,90', cor: '#F5A623', corLight: '#FFF8ED', corBorder: '#FFE4A0', link: PRO_LINK },
];

export default function Planos({ onNavigate }: PlanosProps) {
  const [emailAtual, setEmailAtual] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    trackViewContent({ content_name: 'Planos GLPY', content_category: 'subscription' });
    const email = auth.currentUser?.email || localStorage.getItem('glpy_email') || null;
    setEmailAtual(email);
  }, []);

  async function handleSairTrocarConta() {
    setSaindo(true);
    try {
      // Limpa cache de sessão/plano antes do signOut para não herdar estado antigo
      localStorage.removeItem('glpy_email');
      localStorage.removeItem('glpy_nome');
      // App.tsx onAuthStateChanged limpa glpy_user, glpy_plano, glpy_access_control
      await signOut(auth);
      // Após signOut, onAuthStateChanged redireciona para <Login /> automaticamente
    } catch {
      setSaindo(false);
    }
  }

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
        {hasActiveAccess() && (
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
        )}
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
        <div style={{ fontSize: 13, color: '#3D5A70', lineHeight: 1.6 }}>
          Seu médico te vê 1x por mês.<br />
          <strong style={{ color: '#0A1628' }}>O GLPY está com você os outros 29 dias.</strong>
        </div>
      </div>

      {/* Sprint 17B.40 — bloco de conta atual para usuário sem plano ativo */}
      {emailAtual && !hasActiveAccess() && (
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{
            background: '#FFF8ED',
            border: '1.5px solid #FFE4A0',
            borderRadius: 14,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: '#7A9AAF', marginBottom: 3 }}>
              Conta atual
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', wordBreak: 'break-all', marginBottom: 5 }}>
              {emailAtual}
            </div>
            <div style={{ fontSize: 12, color: '#92500A', lineHeight: 1.5, marginBottom: 10 }}>
              Este e-mail ainda não possui assinatura ativa no GLPY. Se você já comprou, entre com o e-mail usado na compra.
            </div>
            <button
              onClick={handleSairTrocarConta}
              disabled={saindo}
              style={{
                width: '100%',
                background: '#0A1628',
                color: '#fff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                padding: '10px',
                borderRadius: 10,
                border: 'none',
                cursor: saindo ? 'not-allowed' : 'pointer',
                opacity: saindo ? 0.7 : 1,
              }}
            >
              {saindo ? 'Saindo...' : 'Sair e entrar com outro e-mail'}
            </button>
            <a
              href={`https://wa.me/5548991410761?text=${encodeURIComponent(`Olá, comprei o GLPY mas estou vendo a tela de planos. Pode me ajudar? Meu e-mail é: ${emailAtual ?? ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: 11,
                color: '#7A9AAF',
                marginTop: 8,
                textDecoration: 'underline',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Comprou e não conseguiu acessar? Suporte no WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Plano Fundador — ativo */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          background: '#fff',
          border: '2px solid #00C27A',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 20px #00C27A20',
        }}>
          {/* Cabeçalho */}
          <div style={{
            background: '#E6FBF3',
            padding: '16px 18px 14px',
            borderBottom: '1px solid #C8F0E0',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  background: '#00C27A',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                  marginBottom: 6,
                }}>⭐ Oferta de lançamento</div>
                <div style={{ fontWeight: 800, fontSize: 22, color: '#0A1628', letterSpacing: '-0.5px' }}>
                  GLPY Fundador
                </div>
                <div style={{ fontSize: 12, color: '#3D5A70', marginTop: 2 }}>
                  Acesso completo durante o lançamento
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 28, color: '#00C27A', letterSpacing: '-1px', lineHeight: 1 }}>
                  R$19,90
                </div>
                <div style={{ fontSize: 11, color: '#7A9AAF' }}>/mês</div>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7A9AAF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
              Incluído neste plano
            </div>
            {FUNDADOR_RECURSOS.map((r, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: '#0A1628',
                padding: '5px 0',
                borderBottom: i < FUNDADOR_RECURSOS.length - 1 ? '1px solid #F4F6F8' : 'none',
                lineHeight: 1.4,
              }}>{r}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Outros planos disponíveis */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#7A9AAF', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
          Outros planos
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {OUTROS_PLANOS.map(p => (
            <div key={p.nome} style={{
              flex: 1,
              background: '#fff',
              border: `1.5px solid ${p.corBorder}`,
              borderRadius: 14,
              padding: '12px 14px',
            }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0A1628' }}>GLPY {p.nome}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: p.cor, marginTop: 2 }}>{p.preco}</div>
              <div style={{ fontSize: 10, color: '#7A9AAF' }}>/mês</div>
              <button
                onClick={() => window.open(p.link, '_blank')}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 8,
                  background: p.corLight,
                  color: p.cor,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '5px 0',
                  borderRadius: 8,
                  border: `1px solid ${p.corBorder}`,
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >Ver plano →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Valor */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          background: '#0A1628',
          borderRadius: 16,
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            Por que vale cada centavo
          </div>
          <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.7 }}>
            Você já gasta <strong style={{ color: '#00C27A' }}>R$1.400/mês</strong> na caneta.<br />
            O GLPY custa <strong style={{ color: '#00C27A' }}>R$19,90/mês</strong> para garantir que valeu.
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
          marginBottom: 16,
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
          onClick={() => window.open(FUNDADOR_LINK, '_blank')}
          style={{
            width: '100%',
            background: '#00C27A',
            color: '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            padding: '15px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px #00C27A40',
            letterSpacing: '-0.2px',
          }}
        >
          Assinar GLPY Fundador — R$19,90/mês →
        </button>
      </div>
    </div>
  );
}
