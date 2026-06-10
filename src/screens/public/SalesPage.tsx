// GLPY — Página de Vendas Pública — Sprint Visual Premium
// Rota: / (raiz) para visitantes não autenticados

import { useEffect, useState } from 'react';
import {
  CheckCircle2, Brain, Droplets, UtensilsCrossed, Camera, Scale, Syringe,
  Heart, Dumbbell, BarChart3, ClipboardList, ChevronDown, ChevronUp,
  Sparkles, Shield, Zap, Menu, X, ArrowRight, Users,
} from 'lucide-react';
import glpyLogoDark  from '@/assets/logos/logo-dark.png';
import glpyLogoLight from '@/assets/logos/logo-light.png';
import { trackPageView, trackViewContent, trackInitiateCheckout } from '../../services/metaPixel';

// ── Checkout links oficiais HeroSpark ─────────────────────────────────────────

const CHECKOUT = {
  essencial: 'https://pay.herospark.com/glpy-essencial-524492',
  semestral: 'https://pay.herospark.com/glpy-semestral-526680',
  anual:     'https://pay.herospark.com/glpy-anual-526681',
} as const;

const PRIMARY = '#00C27A';

// ── Dados estáticos ───────────────────────────────────────────────────────────

const PROTOCOLOS: { emoji: string; nome: string; destaque: boolean }[] = [
  { emoji: '💉', nome: 'Sobrevivendo às Canetas',           destaque: false },
  { emoji: '🩺', nome: 'Controle de Efeitos Colaterais',    destaque: false },
  { emoji: '💇', nome: 'Anti-Queda de Cabelo',              destaque: false },
  { emoji: '⚖️', nome: 'Anti-Rebote',                       destaque: true  },
  { emoji: '🧠', nome: 'Psicologia do Emagrecimento',        destaque: false },
  { emoji: '🥗', nome: 'Alimentação para Baixo Apetite',    destaque: true  },
  { emoji: '💪', nome: 'Não Perca os Músculos',             destaque: true  },
  { emoji: '⚡', nome: 'Energia Baixa',                     destaque: false },
  { emoji: '📊', nome: 'Ajuste Metabólico',                 destaque: false },
  { emoji: '🔄', nome: 'Transição — Parar a Caneta',        destaque: true  },
];

const DORES = [
  { emoji: '😰', texto: 'Medo do rebote ao pausar ou parar a caneta' },
  { emoji: '💪', texto: 'Perda de massa magra sem acompanhamento adequado' },
  { emoji: '🥗', texto: 'Baixo apetite e pouca proteína no dia a dia' },
  { emoji: '🍽️', texto: 'Dúvidas sobre o que comer na jornada' },
  { emoji: '🤢', texto: 'Sintomas e efeitos colaterais sem orientação prática' },
  { emoji: '😔', texto: 'Ansiedade e culpa sem suporte emocional estruturado' },
  { emoji: '💉', texto: 'Esquecimento da próxima aplicação da caneta' },
  { emoji: '📊', texto: 'Falta de acompanhamento visual da evolução' },
];

const PASSOS = [
  {
    num: '01',
    titulo: 'Responda sua rotina',
    texto: 'Peso, objetivo, medicamento, dose, sintomas e hábitos atuais.',
    icon: ClipboardList,
  },
  {
    num: '02',
    titulo: 'Receba uma jornada guiada',
    texto: 'Metas, protocolos, registros e acompanhamento diário personalizados.',
    icon: Sparkles,
  },
  {
    num: '03',
    titulo: 'Proteja sua evolução',
    texto: 'Acompanhe água, refeições, aplicação, sintomas, emoções, peso e progresso.',
    icon: Shield,
  },
];

const APP_SCREENS = [
  {
    titulo: 'Home diária',
    descricao: 'Checklist de rotina com progresso em tempo real',
    emoji: '🏠',
    cor: '#1A2D45',
    tags: ['Protocolo ativo', 'Água do dia', 'Check-in feito'],
  },
  {
    titulo: 'Protocolos',
    descricao: '10 protocolos com duração, passos e checklist diário',
    emoji: '📋',
    cor: '#1A2D45',
    tags: ['Anti-Rebote', 'Não Perca os Músculos', 'Dia 12 de 30'],
  },
  {
    titulo: 'IA GLPY',
    descricao: 'Respostas sobre a jornada GLP-1 disponíveis 24h',
    emoji: '✦',
    cor: '#0D2A1E',
    tags: ['Dúvidas sobre caneta', 'Sintomas e efeitos', 'Alimentação'],
  },
  {
    titulo: 'Foto do prato',
    descricao: 'Registre refeições e acompanhe proteína diária',
    emoji: '📸',
    cor: '#1A2D45',
    tags: ['Análise da refeição', 'Proteína estimada', 'Histórico visual'],
  },
  {
    titulo: 'Evolução',
    descricao: 'Peso, medidas e fotos de progresso organizados',
    emoji: '📊',
    cor: '#1A2D45',
    tags: ['Gráfico de peso', 'Comparativo de fotos', 'Linha do tempo'],
  },
  {
    titulo: 'Aplicação da caneta',
    descricao: 'Dose, local e alerta da próxima aplicação',
    emoji: '💉',
    cor: '#1A2530',
    tags: ['Histórico de doses', 'Alerta de aplicação', 'Local de aplicação'],
  },
];

const FEATURES = [
  { icon: Brain,           label: 'IA GLPY para dúvidas da jornada' },
  { icon: Droplets,        label: 'Registro de água diária' },
  { icon: UtensilsCrossed, label: 'Refeições e proteína' },
  { icon: Camera,          label: 'Foto do prato com análise' },
  { icon: Scale,           label: 'Peso e medidas corporais' },
  { icon: Syringe,         label: 'Aplicação da caneta' },
  { icon: Heart,           label: 'Sintomas e emoções' },
  { icon: Dumbbell,        label: 'Atividade física' },
  { icon: BarChart3,       label: 'Progresso visual' },
  { icon: ClipboardList,   label: 'Checklist diário' },
];

const FAQ_ITEMS = [
  {
    q: 'O GLPY substitui médico ou nutricionista?',
    a: 'Não. O GLPY é uma ferramenta educativa e de acompanhamento comportamental. Sempre siga as orientações do seu médico e nutricionista.',
  },
  {
    q: 'Preciso estar usando caneta para usar o GLPY?',
    a: 'Não. O GLPY também é útil para quem está em manutenção ou em transição após o uso da caneta.',
  },
  {
    q: 'O acesso é liberado automaticamente?',
    a: 'Após o pagamento confirmado, você recebe o link de acesso pelo e-mail usado na compra. O acesso é liberado pelo próprio link — sem esperar aprovação manual.',
  },
  {
    q: 'Posso acessar pelo celular?',
    a: 'Sim. O GLPY foi projetado para uso diário pelo celular, com checklist rápido, registros simples e IA disponível a qualquer momento.',
  },
  {
    q: 'O que acontece depois da compra?',
    a: 'Você recebe um e-mail com o link de acesso ao GLPY. Ao clicar, crie sua conta e o onboarding vai configurar sua jornada em poucos minutos.',
  },
];

// ── Sub-componentes ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left gap-4 py-5"
      >
        <span className="text-sm font-semibold text-[#0A1628] leading-snug">{q}</span>
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ background: open ? PRIMARY : '#F0F4F2', color: open ? '#fff' : '#3D5A70' }}
        >
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>
      {open && <p className="pb-5 text-sm text-text-muted leading-relaxed">{a}</p>}
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative flex justify-center items-center py-10 lg:py-4">

      {/* Floating cards — desktop only */}
      <div className="hidden lg:block absolute" style={{ left: -8, top: 48, zIndex: 20 }}>
        <div className="bg-white rounded-2xl px-3 py-2.5 shadow-xl border border-border flex items-center gap-2.5 whitespace-nowrap">
          <span className="text-lg">🛡️</span>
          <div>
            <p className="text-[11px] font-bold text-[#0A1628]">Protocolo Anti-Rebote</p>
            <p className="text-[10px] text-text-muted">Dia 12 de 30</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute" style={{ right: -8, top: 120, zIndex: 20 }}>
        <div className="bg-white rounded-2xl px-3 py-2.5 shadow-xl border border-border flex items-center gap-2.5 whitespace-nowrap">
          <span className="text-lg">✦</span>
          <div>
            <p className="text-[11px] font-bold text-[#0A1628]">IA GLPY 24h</p>
            <p className="text-[10px] text-text-muted">Pergunte agora</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute" style={{ left: -8, top: '52%', zIndex: 20 }}>
        <div className="bg-white rounded-2xl px-3 py-2.5 shadow-xl border border-border flex items-center gap-2.5 whitespace-nowrap">
          <span className="text-lg">💉</span>
          <div>
            <p className="text-[11px] font-bold text-[#0A1628]">Aplicação registrada</p>
            <p className="text-[10px] text-text-muted">hoje, 08:30</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute" style={{ right: -8, bottom: 80, zIndex: 20 }}>
        <div className="bg-white rounded-2xl px-3 py-2.5 shadow-xl border border-border flex items-center gap-2.5 whitespace-nowrap">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-[11px] font-bold text-[#0A1628]">Evolução visual</p>
            <p className="text-[11px] font-bold" style={{ color: PRIMARY }}>−4,2 kg</p>
          </div>
        </div>
      </div>

      {/* Phone shell */}
      <div className="relative" style={{ width: 256, flexShrink: 0 }}>

        {/* Glow */}
        <div
          className="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-25"
          style={{ background: PRIMARY, transform: 'scale(0.85) translateY(8%)' }}
        />

        {/* Frame */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 40,
            background: '#111820',
            border: '2px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Dynamic island */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 2, background: '#0D1B2A' }}>
            <div style={{ width: 90, height: 20, background: '#111820', borderRadius: 999 }} />
          </div>

          {/* Screen */}
          <div style={{ background: '#0D1B2A', padding: '4px 12px 0' }}>

            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 6px' }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>9:41</span>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>●●●●</span>
              </div>
            </div>

            {/* Greeting */}
            <div style={{ paddingBottom: 8 }}>
              <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>BOM DIA ✦</p>
              <p style={{ fontSize: 15, color: '#fff', fontWeight: 800, lineHeight: 1.3 }}>Sua rotina de hoje</p>
            </div>

            {/* Progress */}
            <div style={{ background: '#1A2D45', borderRadius: 14, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                    background: `conic-gradient(${PRIMARY} 0% 60%, rgba(255,255,255,0.07) 60% 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1A2D45', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>60%</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>3 de 5 tarefas</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Continue assim!</p>
                </div>
              </div>
            </div>

            {/* Water */}
            <div style={{ background: '#1A2D45', borderRadius: 14, padding: '8px 12px', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, background: 'rgba(59,130,246,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12 }}>💧</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>Água</p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>1,8L / 3L</p>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
                    <div style={{ width: '60%', height: '100%', background: '#3b82f6', borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Protein */}
            <div style={{ background: '#1A2D45', borderRadius: 14, padding: '8px 12px', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, background: 'rgba(0,194,122,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12 }}>🥩</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>Proteína</p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>68g / 130g</p>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
                    <div style={{ width: '52%', height: '100%', background: PRIMARY, borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Injection */}
            <div style={{ background: '#1A2D45', borderRadius: 14, padding: '8px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, background: 'rgba(168,85,247,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12 }}>💉</span>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>Próx. aplicação</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>em 3 dias</p>
                </div>
              </div>
              <span style={{ fontSize: 9, background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '2px 7px', borderRadius: 999, fontWeight: 700 }}>quinta</span>
            </div>

            {/* AI */}
            <div style={{ background: `rgba(0,194,122,0.08)`, border: `1px solid rgba(0,194,122,0.2)`, borderRadius: 14, padding: '8px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: `rgba(0,194,122,0.15)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: PRIMARY, fontSize: 13, fontWeight: 800 }}>
                ✦
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>IA GLPY</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Pergunte qualquer coisa</p>
              </div>
            </div>

            {/* Protocol */}
            <div style={{ background: `linear-gradient(135deg, rgba(0,194,122,0.15) 0%, rgba(0,194,122,0.04) 100%)`, border: `1px solid rgba(0,194,122,0.2)`, borderRadius: 14, padding: '10px 12px', marginBottom: 4 }}>
              <p style={{ fontSize: 8, color: PRIMARY, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PROTOCOLO ATIVO</p>
              <p style={{ fontSize: 13, color: '#fff', fontWeight: 800, marginTop: 3 }}>Anti-Rebote</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Dia 12 de 30</p>
            </div>

          </div>

          {/* Home bar */}
          <div style={{ background: '#0D1B2A', display: 'flex', justifyContent: 'center', padding: '10px 0 14px' }}>
            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 999 }} />
          </div>
        </div>
      </div>

      {/* Mobile floating tags (below phone) */}
      <div className="lg:hidden flex flex-wrap justify-center gap-2 mt-6 absolute bottom-0 left-0 right-0 px-4">
        {['🛡️ Anti-Rebote', '✦ IA GLPY', '💉 Aplicação', '📊 Evolução'].map((t, i) => (
          <span key={i} className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
            {t}
          </span>
        ))}
      </div>

    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function SalesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    trackPageView();
    trackViewContent({ content_name: 'GLPY Home', content_category: 'landing_page' });
  }, []);

  function handleCheckout(plan: keyof typeof CHECKOUT) {
    trackInitiateCheckout({ content_name: `GLPY ${plan}`, plan });
    window.location.href = CHECKOUT[plan];
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="flex-shrink-0">
            <img src={glpyLogoDark} alt="GLPY" className="h-8 w-auto" />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-text-muted">
            <a href="#como-funciona" className="hover:text-primary transition">Como funciona</a>
            <a href="#protocolos"    className="hover:text-primary transition">Protocolos</a>
            <a href="#planos"        className="hover:text-primary transition">Planos</a>
            <a href="#afiliados"     className="hover:text-primary transition">Afiliados</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold text-text-muted hover:text-primary transition">
              Entrar
            </a>
            <a
              href={CHECKOUT.semestral}
              onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
              className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-sm"
            >
              Começar agora
            </a>
          </div>

          <button
            className="md:hidden p-2 text-text-muted"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-white px-5 py-4 space-y-3">
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-text-muted hover:text-primary py-1.5">Como funciona</a>
            <a href="#protocolos"    onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-text-muted hover:text-primary py-1.5">Protocolos</a>
            <a href="#planos"        onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-text-muted hover:text-primary py-1.5">Planos</a>
            <a href="#afiliados"     onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-text-muted hover:text-primary py-1.5">Afiliados</a>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/login"
                className="text-center text-sm font-semibold text-text-muted border border-border rounded-xl py-2.5 hover:border-primary hover:text-primary transition"
              >
                Já comprei — Entrar
              </a>
              <a
                href={CHECKOUT.semestral}
                onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
                className="text-center bg-primary text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition"
              >
                Começar agora
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-[#0A1628] text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Coluna esquerda */}
          <div className="space-y-6 lg:space-y-7">
            <span className="inline-flex items-center gap-2 bg-primary/15 text-primary text-xs font-bold px-4 py-2 rounded-full border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Para quem usa ou usou canetas emagrecedoras
            </span>

            <div className="space-y-3">
              <img src={glpyLogoLight} alt="GLPY" className="h-10 w-auto" />
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                O app da jornada<br />
                <span className="text-primary">GLP-1</span>
              </h1>
            </div>

            <p className="text-base md:text-lg text-white/75 leading-relaxed max-w-lg">
              Protocolos, IA e rotina diária para proteger sua evolução antes, durante e depois da caneta.
            </p>

            <p className="text-sm text-white/45 italic leading-relaxed">
              A caneta pode ajudar no começo. Mas é a rotina que protege o resultado.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href={CHECKOUT.semestral}
                onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold text-base px-7 py-4 rounded-2xl hover:opacity-90 transition shadow-lg shadow-primary/30"
              >
                Começar agora <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/20 text-white/80 font-semibold text-base px-7 py-4 rounded-2xl hover:border-white/40 hover:text-white transition"
              >
                Já comprei — Acessar minha conta
              </a>
            </div>

            <div className="flex items-center gap-6 pt-2">
              {[
                { num: '10', label: 'Protocolos incluídos' },
                { num: 'IA',  label: 'GLPY disponível 24h' },
                { num: '∞',   label: 'Recursos no app' },
              ].map(({ num, label }, i) => (
                <div key={i} className="text-center">
                  <p className="text-xl font-black text-primary leading-none">{num}</p>
                  <p className="text-[10px] text-white/45 mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna direita — mockup */}
          <div className="flex justify-center lg:justify-end relative lg:pr-8">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── Como funciona em 3 passos ────────────────────────────────── */}
      <section id="como-funciona" className="px-5 py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              <Zap className="w-3.5 h-3.5" /> Como funciona
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">
              Comece em 3 passos simples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Linha conectora — desktop */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-0.5 bg-border" />

            {PASSOS.map(({ num, titulo, texto, icon: Icon }, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm border border-border"
                    style={{ background: i === 1 ? PRIMARY : '#F4F6F8' }}
                  >
                    <Icon className="w-8 h-8" style={{ color: i === 1 ? '#fff' : PRIMARY }} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center"
                    style={{ background: i === 1 ? PRIMARY : '#0A1628', color: '#fff' }}
                  >
                    {num.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="font-black text-[#0A1628] mb-1">{titulo}</p>
                  <p className="text-sm text-text-muted leading-relaxed">{texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dor mais forte ───────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-[#F4F6F8]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628] leading-tight">
              A caneta ajuda.<br className="hidden sm:block" /> Mas sem rotina, muita gente se perde no caminho.
            </h2>
            <p className="text-text-muted text-sm mt-3 max-w-xl mx-auto">
              Esses são os desafios mais comuns de quem está na jornada com GLP-1.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DORES.map(({ emoji, texto }, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-border shadow-sm flex flex-col items-start gap-3 hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">{emoji}</span>
                <p className="text-sm font-semibold text-[#0A1628] leading-snug">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Veja o GLPY por dentro ───────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              <Sparkles className="w-3.5 h-3.5" /> O app por dentro
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">Veja o GLPY por dentro</h2>
            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
              Tudo em um app. Sem planilha, sem caderno, sem anotar no WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {APP_SCREENS.map(({ titulo, descricao, emoji, tags }, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Mini app screen header */}
                <div
                  className="px-4 py-5"
                  style={{ background: '#0D1B2A' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 34, height: 34, background: 'rgba(0,194,122,0.15)', border: '1px solid rgba(0,194,122,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {emoji}
                    </div>
                    <p style={{ fontSize: 12, color: '#fff', fontWeight: 800 }}>{titulo}</p>
                  </div>
                  {/* Mini bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tags.map((tag, j) => (
                      <div key={j} style={{ background: '#1A2D45', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: PRIMARY, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Card label */}
                <div className="bg-white px-4 py-3">
                  <p className="text-xs text-text-muted leading-snug">{descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ──────────────────────────────────────────── */}
      <section className="px-5 py-14 bg-[#F4F6F8]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-text-muted uppercase tracking-widest mb-6">
            Tudo que você precisa no mesmo lugar
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-border shadow-sm flex flex-col items-center gap-2.5 text-center hover:border-primary/40 transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-[#0A1628] leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Protocolos ───────────────────────────────────────────────── */}
      <section id="protocolos" className="px-5 py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
              <Shield className="w-3.5 h-3.5" /> 10 protocolos incluídos
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">Protocolos práticos da jornada</h2>
            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
              Cada protocolo é um guia estruturado com checklist diário e conteúdo aplicável à sua realidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROTOCOLOS.map(({ emoji, nome, destaque }, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 border transition-colors ${
                  destaque
                    ? 'bg-[#0A1628] border-primary/30'
                    : 'bg-[#F4F6F8] border-border hover:border-primary/30'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${destaque ? 'text-primary/70' : 'text-text-muted'}`}>
                    Protocolo {i + 1}
                    {destaque && <span className="ml-2 bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[9px] font-bold">Destaque</span>}
                  </p>
                  <p className={`text-sm font-bold leading-tight ${destaque ? 'text-white' : 'text-[#0A1628]'}`}>{nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ───────────────────────────────────────────────────── */}
      <section id="planos" className="px-5 py-16 md:py-20 bg-[#0A1628]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 text-white">
            <div className="inline-flex items-center gap-2 bg-primary/15 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> Acesso completo
            </div>
            <h2 className="text-2xl md:text-3xl font-black">Escolha seu plano</h2>
            <p className="text-white/50 text-sm mt-2">Acesso completo a todos os recursos — sem limite por plano.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

            {/* Essencial */}
            <div className="bg-[#112240] rounded-3xl p-6 flex flex-col gap-5 border border-white/10 hover:border-white/20 transition-colors">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Entrada simples</p>
                <p className="text-2xl font-black text-white mt-2">Essencial</p>
                <div className="mt-3">
                  <span className="text-4xl font-black text-white">R$49,90</span>
                  <span className="text-sm font-semibold text-white/50">/mês</span>
                </div>
                <p className="text-xs text-white/40 mt-1">Recorrência mensal · Cancele quando quiser</p>
              </div>
              <ul className="space-y-2 flex-1">
                {['Acesso completo ao app', 'IA GLPY ilimitada', '10 protocolos incluídos', 'Todos os registros diários', 'Cancele quando quiser'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT.essencial}
                onClick={(e) => { e.preventDefault(); handleCheckout('essencial'); }}
                className="w-full text-center border-2 border-white/20 text-white font-bold py-3.5 rounded-2xl hover:border-primary hover:text-primary transition"
              >
                Começar no Essencial
              </a>
            </div>

            {/* Semestral — destaque */}
            <div
              className="rounded-3xl p-6 flex flex-col gap-5 relative shadow-2xl md:-mt-4 md:mb-4"
              style={{
                background: 'linear-gradient(145deg, #00C27A 0%, #009e63 100%)',
                boxShadow: '0 20px 60px rgba(0,194,122,0.35)',
              }}
            >
              {/* Badge */}
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-[#0A1628] text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/10">
                  ⭐ Mais recomendado
                </span>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider">6 meses de acesso</p>
                <p className="text-2xl font-black text-white mt-2">Semestral</p>
                <div className="mt-3">
                  <span className="text-4xl font-black text-white">R$249,90</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-white/70">Equivale a</span>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">R$41,65/mês</span>
                </div>
                <p className="text-xs text-white/60 mt-1">Pagamento único</p>
              </div>
              <ul className="space-y-2 flex-1">
                {['Acesso por 180 dias', 'IA GLPY ilimitada', '10 protocolos incluídos', 'Todos os registros diários', 'Pagamento único sem renovação'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-white/70 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT.semestral}
                onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
                className="w-full text-center bg-white text-[#009e63] font-black py-4 rounded-2xl hover:bg-white/90 transition text-base shadow-lg"
              >
                Começar no Semestral
              </a>
            </div>

            {/* Anual */}
            <div className="bg-[#112240] rounded-3xl p-6 flex flex-col gap-5 border border-white/10 hover:border-white/20 transition-colors">
              <div>
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Melhor economia</p>
                <p className="text-2xl font-black text-white mt-2">Anual</p>
                <div className="mt-3">
                  <span className="text-4xl font-black text-white">R$447,00</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-white/50">Equivale a</span>
                  <span className="bg-white/10 text-white/80 text-xs font-bold px-2 py-0.5 rounded-full">R$37,25/mês</span>
                </div>
                <p className="text-xs text-white/40 mt-1">Pagamento único · 365 dias</p>
              </div>
              <ul className="space-y-2 flex-1">
                {['Acesso por 365 dias', 'IA GLPY ilimitada', '10 protocolos incluídos', 'Todos os registros diários', 'Pagamento único sem renovação'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT.anual}
                onClick={(e) => { e.preventDefault(); handleCheckout('anual'); }}
                className="w-full text-center border-2 border-primary/40 text-primary font-bold py-3.5 rounded-2xl hover:bg-primary hover:text-white hover:border-primary transition"
              >
                Começar no Anual
              </a>
            </div>

          </div>

          <p className="text-center text-xs text-white/30 mt-6">
            Pagamento processado por HeroSpark. Acesso liberado automaticamente após confirmação.
          </p>
        </div>
      </section>

      {/* ── Afiliados ────────────────────────────────────────────────── */}
      <section id="afiliados" className="px-5 py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#F4F6F8] rounded-3xl border border-border p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                <Users className="w-3.5 h-3.5" /> Para afiliados
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#0A1628] leading-tight">
                Uma estrutura pronta para vender uma nova categoria
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">
                O GLPY une aplicativo, protocolos, IA, rotina diária, checkout e automação de acesso em uma oferta simples de explicar e fácil de apresentar.
              </p>
              <a
                href="#planos"
                className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-bold px-6 py-3.5 rounded-2xl hover:opacity-90 transition text-sm"
              >
                Quero conhecer o GLPY <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Brain,        label: 'IA integrada ao app' },
                { icon: Shield,       label: 'Protocolos prontos' },
                { icon: Zap,          label: 'Acesso automático' },
                { icon: BarChart3,    label: 'Oferta clara de vender' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-border flex flex-col items-center text-center gap-2 shadow-sm">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-[#0A1628] leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-[#F4F6F8]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">Perguntas frequentes</h2>
            <p className="text-text-muted text-sm mt-2">Tudo que você precisa saber antes de começar.</p>
          </div>
          <div className="bg-white rounded-2xl border border-border px-6 shadow-sm">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

          {/* Aviso educativo */}
          <div className="mt-6 bg-white rounded-2xl border border-border px-5 py-4 text-xs text-text-muted leading-relaxed text-center">
            ⚠️ O GLPY é uma ferramenta educativa e de acompanhamento comportamental. Não substitui orientação médica, nutricional ou psicológica. Sempre siga as recomendações do seu profissional de saúde.
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-24 bg-[#0A1628] text-center relative overflow-hidden">
        {/* Glow decorativo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 40% at 50% 80%, rgba(0,194,122,0.12) 0%, transparent 70%)` }}
        />
        <div className="max-w-xl mx-auto space-y-6 relative">
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Comece sua rotina hoje
          </h2>
          <p className="text-white/55 text-sm leading-relaxed">
            Acesso completo ao app, IA GLPY e todos os protocolos a partir de R$49,90/mês.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={CHECKOUT.semestral}
              onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-bold text-base px-8 py-4 rounded-2xl hover:opacity-90 transition"
              style={{ boxShadow: '0 0 40px rgba(0,194,122,0.3)' }}
            >
              Começar agora <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto border-2 border-white/20 text-white font-semibold text-base px-8 py-4 rounded-2xl hover:border-white/40 hover:bg-white/5 transition"
            >
              Já tenho conta
            </a>
          </div>
        </div>
      </section>

      {/* ── Rodapé ───────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-border px-5 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <img src={glpyLogoDark} alt="GLPY" className="h-7 w-auto" />
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Ferramenta educativa e de acompanhamento comportamental. Não substitui orientação médica, nutricional ou psicológica.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-xs text-text-muted">
              <a href="/login"       className="hover:text-primary transition">Entrar</a>
              <a href="/acesso"      className="hover:text-primary transition">Acesso pós-compra</a>
              <a href="/termos"      className="hover:text-primary transition">Termos de Uso</a>
              <a href="/privacidade" className="hover:text-primary transition">Política de Privacidade</a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-text-muted">
            © {new Date().getFullYear()} GLPY. Todos os direitos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}
