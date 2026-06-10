// GLPY — Página de Vendas Pública
// Rota: / (raiz) para visitantes não autenticados
// Autenticados são redirecionados para o app via App.tsx

import { useEffect, useState } from 'react';
import {
  CheckCircle2, Brain, Droplets, UtensilsCrossed, Camera, Scale, Syringe,
  Heart, Dumbbell, BarChart3, ClipboardList, ChevronDown, ChevronUp,
  Sparkles, Shield, Zap, Menu, X,
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

// ── Dados estáticos ───────────────────────────────────────────────────────────

const PROTOCOLOS = [
  { emoji: '💉', nome: 'Sobrevivendo às Canetas' },
  { emoji: '🩺', nome: 'Controle de Efeitos Colaterais' },
  { emoji: '💇', nome: 'Anti-Queda de Cabelo' },
  { emoji: '⚖️', nome: 'Anti-Rebote' },
  { emoji: '🧠', nome: 'Psicologia do Emagrecimento' },
  { emoji: '🥗', nome: 'Alimentação para Baixo Apetite' },
  { emoji: '💪', nome: 'Não Perca os Músculos' },
  { emoji: '⚡', nome: 'Energia Baixa' },
  { emoji: '📊', nome: 'Ajuste Metabólico' },
  { emoji: '🔄', nome: 'Transição — Parar a Caneta' },
];

const FEATURES = [
  { icon: Brain,          label: 'IA GLPY para dúvidas da jornada' },
  { icon: Droplets,       label: 'Registro de água diária' },
  { icon: UtensilsCrossed, label: 'Refeições e proteína' },
  { icon: Camera,         label: 'Foto do prato com análise' },
  { icon: Scale,          label: 'Peso e medidas corporais' },
  { icon: Syringe,        label: 'Aplicação da caneta' },
  { icon: Heart,          label: 'Sintomas e emoções' },
  { icon: Dumbbell,       label: 'Atividade física' },
  { icon: BarChart3,      label: 'Progresso visual' },
  { icon: ClipboardList,  label: 'Checklist diário' },
];

const DORES = [
  'Medo de engordar tudo de volta ao pausar a caneta',
  'Perda de massa magra sem acompanhamento adequado',
  'Dúvidas sobre o que comer com apetite reduzido',
  'Sintomas e efeitos colaterais sem orientação prática',
  'Ansiedade e culpa sem suporte emocional estruturado',
  'Falta de uma rotina simples para acompanhar tudo',
];

const FAQ_ITEMS = [
  {
    q: 'O GLPY substitui médico ou nutricionista?',
    a: 'Não. O GLPY é uma ferramenta educativa e de acompanhamento comportamental. Sempre siga as orientações do seu médico e nutricionista.',
  },
  {
    q: 'Preciso estar usando a caneta para usar o GLPY?',
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
];

// ── Sub-componente FAQ ────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0 py-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="text-sm font-semibold text-[#0A1628] leading-snug">{q}</span>
        {open
          ? <ChevronUp   className="w-4 h-4 text-primary flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        }
      </button>
      {open && <p className="mt-2 text-sm text-text-muted leading-relaxed">{a}</p>}
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
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="flex-shrink-0">
            <img src={glpyLogoDark} alt="GLPY" className="h-8 w-auto" />
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-muted">
            <a href="#como-funciona" className="hover:text-primary transition">Como funciona</a>
            <a href="#protocolos"    className="hover:text-primary transition">Protocolos</a>
            <a href="#planos"        className="hover:text-primary transition">Planos</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold text-text-muted hover:text-primary transition">
              Entrar
            </a>
            <a
              href={CHECKOUT.semestral}
              onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
              className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition shadow-sm"
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
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-text-muted hover:text-primary py-1">Como funciona</a>
            <a href="#protocolos"    onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-text-muted hover:text-primary py-1">Protocolos</a>
            <a href="#planos"        onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-text-muted hover:text-primary py-1">Planos</a>
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
                className="text-center bg-primary text-white text-sm font-bold py-2.5 rounded-xl hover:bg-primary/90 transition"
              >
                Começar agora
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="bg-[#0A1628] text-white px-5 py-20 md:py-28 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <img src={glpyLogoLight} alt="GLPY" className="h-12 w-auto mx-auto" />

          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            O app da jornada <span className="text-primary">GLP-1</span>
          </h1>

          <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
            Protocolos, IA e rotina diária para quem usa ou usou canetas emagrecedoras e quer proteger sua evolução.
          </p>

          <p className="text-sm text-white/50 leading-relaxed">
            A caneta pode ajudar no começo. Mas é a rotina que protege o resultado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={CHECKOUT.semestral}
              onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
              className="w-full sm:w-auto bg-primary text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-primary/90 transition shadow-lg"
            >
              Começar agora
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto border-2 border-white/30 text-white font-semibold text-base px-8 py-4 rounded-2xl hover:border-white/60 hover:bg-white/5 transition"
            >
              Já comprei — Acessar minha conta
            </a>
          </div>
        </div>
      </section>

      {/* ── Dor ─────────────────────────────────────────────────────── */}
      <section id="como-funciona" className="px-5 py-16 md:py-20 bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628] leading-tight">
              O que ninguém te conta<br className="hidden sm:block" /> sobre a jornada com a caneta
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DORES.map((dor, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-border shadow-sm">
                <span className="w-5 h-5 flex-shrink-0 mt-0.5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">!</span>
                <p className="text-sm text-[#0A1628] font-medium leading-snug">{dor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solução ──────────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> A solução
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">
            O GLPY organiza sua jornada<br className="hidden sm:block" /> em um só lugar
          </h2>
          <p className="text-text-muted leading-relaxed max-w-xl mx-auto text-sm md:text-base">
            Um app criado para quem usa ou usou canetas GLP-1 e quer manter a evolução com rotina, clareza e suporte diário — sem depender da memória ou de anotações soltas.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-left">
            {[
              'IA GLPY para tirar dúvidas',
              'Registros diários estruturados',
              'Protocolos práticos com duração',
              'Acompanhamento da caneta',
              'Sintomas, emoções e progresso',
              'Checklist diário de rotina',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-[#F4F6F8] rounded-xl p-3 border border-border">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-[#0A1628] leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O que tem dentro ─────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-[#F4F6F8]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">O que tem dentro do GLPY</h2>
            <p className="text-text-muted text-sm mt-2">Tudo em um app. Sem planilha, sem caderno, sem anotar no WhatsApp.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-border shadow-sm flex flex-col items-center gap-2 text-center">
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-3">
              <Shield className="w-3.5 h-3.5" /> 10 protocolos incluídos
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">Protocolos práticos da jornada</h2>
            <p className="text-text-muted text-sm mt-2 max-w-md mx-auto">
              Cada protocolo é um guia estruturado com checklist diário e conteúdo aplicável à sua realidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROTOCOLOS.map(({ emoji, nome }, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#F4F6F8] rounded-2xl px-4 py-3 border border-border">
                <span className="text-xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="text-xs text-text-muted font-medium">Protocolo {i + 1}</p>
                  <p className="text-sm font-bold text-[#0A1628] leading-tight">{nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ───────────────────────────────────────────────────── */}
      <section id="planos" className="px-5 py-16 md:py-20 bg-[#0A1628]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 text-white">
            <h2 className="text-2xl md:text-3xl font-black">Escolha seu plano</h2>
            <p className="text-white/60 text-sm mt-2">Acesso completo a todos os recursos — sem limite de funcionalidades por plano.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

            {/* Essencial */}
            <div className="bg-white rounded-3xl p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Entrada simples</p>
                <p className="text-xl font-black text-[#0A1628] mt-1">Essencial</p>
                <div className="mt-2">
                  <span className="text-3xl font-black text-[#0A1628]">R$49,90</span>
                  <span className="text-base font-semibold text-text-muted">/mês</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Recorrência mensal</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {['Acesso completo ao app', 'IA GLPY ilimitada', '10 protocolos incluídos', 'Todos os registros', 'Cancele quando quiser'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#0A1628]">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT.essencial}
                onClick={(e) => { e.preventDefault(); handleCheckout('essencial'); }}
                className="w-full text-center border-2 border-primary text-primary font-bold py-3 rounded-2xl hover:bg-primary hover:text-white transition"
              >
                Começar no Essencial
              </a>
            </div>

            {/* Semestral — destaque */}
            <div className="bg-primary rounded-3xl p-6 flex flex-col gap-4 shadow-xl relative md:-mt-2 md:mb-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-[#0A1628] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Mais recomendado
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wide">6 meses de acesso</p>
                <p className="text-xl font-black text-white mt-1">Semestral</p>
                <div className="mt-2">
                  <span className="text-3xl font-black text-white">R$249,90</span>
                </div>
                <p className="text-xs text-white/70 mt-1">Equivale a R$41,65/mês · Pagamento único</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {['Acesso por 180 dias', 'IA GLPY ilimitada', '10 protocolos incluídos', 'Todos os registros', 'Pagamento único'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-white/70 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT.semestral}
                onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
                className="w-full text-center bg-white text-primary font-bold py-3 rounded-2xl hover:bg-white/90 transition"
              >
                Começar no Semestral
              </a>
            </div>

            {/* Anual */}
            <div className="bg-white rounded-3xl p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Melhor economia</p>
                <p className="text-xl font-black text-[#0A1628] mt-1">Anual</p>
                <div className="mt-2">
                  <span className="text-3xl font-black text-[#0A1628]">R$447,00</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Equivale a R$37,25/mês · Pagamento único</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {['Acesso por 365 dias', 'IA GLPY ilimitada', '10 protocolos incluídos', 'Todos os registros', 'Pagamento único'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#0A1628]">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT.anual}
                onClick={(e) => { e.preventDefault(); handleCheckout('anual'); }}
                className="w-full text-center border-2 border-primary text-primary font-bold py-3 rounded-2xl hover:bg-primary hover:text-white transition"
              >
                Começar no Anual
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── Autoridade ───────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-white">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5" /> Estrutura
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">
            Uma estrutura criada para<br className="hidden sm:block" /> apoiar uma nova categoria
          </h2>
          <p className="text-text-muted leading-relaxed text-sm md:text-base max-w-xl mx-auto">
            O GLPY foi desenvolvido para apoiar pessoas que usam ou usaram canetas GLP-1 com rotina, clareza e acompanhamento diário — organizando o que o médico recomenda, mas não tem tempo de monitorar todos os dias.
          </p>
          <div className="text-xs text-text-muted bg-[#F4F6F8] border border-border rounded-xl px-4 py-3 max-w-lg mx-auto leading-relaxed">
            O GLPY é uma ferramenta educativa e de acompanhamento comportamental. Não substitui orientação médica, nutricional ou psicológica. Sempre siga as recomendações do seu profissional de saúde.
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-[#F4F6F8]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#0A1628]">Perguntas frequentes</h2>
          </div>
          <div className="bg-white rounded-2xl border border-border px-5 shadow-sm">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────── */}
      <section className="px-5 py-16 md:py-20 bg-[#0A1628] text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl md:text-3xl font-black text-white">Comece sua rotina hoje</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Acesso completo ao app, IA GLPY e todos os protocolos a partir de R$49,90/mês.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={CHECKOUT.semestral}
              onClick={(e) => { e.preventDefault(); handleCheckout('semestral'); }}
              className="w-full sm:w-auto bg-primary text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-primary/90 transition shadow-lg"
            >
              Começar agora
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto border-2 border-white/30 text-white font-semibold text-base px-8 py-4 rounded-2xl hover:border-white/60 hover:bg-white/5 transition"
            >
              Já tenho conta
            </a>
          </div>
        </div>
      </section>

      {/* ── Rodapé ───────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-border px-5 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <img src={glpyLogoDark} alt="GLPY" className="h-7 w-auto" />
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Ferramenta educativa e de acompanhamento comportamental. Não substitui orientação médica, nutricional ou psicológica.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-text-muted">
              <a href="/login"      className="hover:text-primary transition">Entrar</a>
              <a href="/acesso"     className="hover:text-primary transition">Acesso pós-compra</a>
              <a href="/termos"     className="hover:text-primary transition">Termos de Uso</a>
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
