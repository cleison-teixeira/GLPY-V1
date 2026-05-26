import { useState, useEffect } from "react";

function readGlpyProfilePhoto(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('glpy_profile_photo');
    if (!raw) return null;
    let base64 = '';
    if (raw.trim().startsWith('{')) {
      const parsed = JSON.parse(raw);
      base64 = parsed?.imageBase64 ?? '';
    } else {
      base64 = raw;
    }
    if (!base64) return null;
    return base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}
import QuickActionModal from "../../components/QuickActionModal";
import {
  Shield,
  ChefHat,
  Users,
  Sparkles,
  ShoppingBag,
  FlaskConical,
  ChevronRight,
  Compass,
  LineChart,
  LayoutGrid,
  Plus,
  Check,
  Instagram,
  Youtube,
  Facebook,
  Music2,
  Zap,
  ChevronLeft,
  Award,
} from "lucide-react";
import glpyLogoLight from '@/assets/logos/logo-light.png';

interface HubScreenProps {
  onNavigate?: (screen: string) => void;
}

interface Toast { id: number; msg: string }

const QUIZ_STEPS = [
  {
    step: 1,
    title: "Objetivo principal",
    question: "Qual área você mais quer proteger durante sua jornada com GLP-1?",
    options: ["Cabelo", "Massa magra", "Intestino", "Energia", "Tudo isso"],
  },
  {
    step: 2,
    title: "Sintomas ou necessidades",
    question: "O que você mais sente ou quer evitar hoje?",
    options: [
      "Queda de cabelo",
      "Fraqueza ou perda de massa",
      "Prisão de ventre ou intestino lento",
      "Cansaço e baixa energia",
      "Náuseas ou desconfortos",
    ],
  },
  {
    step: 3,
    title: "Preferência de compra",
    question: "Qual formato faria mais sentido para você?",
    options: [
      "Compra avulsa",
      "Kit mensal recorrente",
      "Kit trimestral com desconto",
      "Ainda estou pesquisando",
    ],
  },
  {
    step: 4,
    title: "Faixa de investimento",
    question: "Qual faixa de investimento parece justa para uma fórmula clínica personalizada?",
    options: [
      "Até R$ 97",
      "R$ 97 a R$ 147",
      "R$ 147 a R$ 197",
      "Acima de R$ 197 se fizer sentido",
    ],
  },
];

export default function HubScreen({ onNavigate }: HubScreenProps = {}) {
  const goTo = (path: string) => { window.location.href = path; };

  const [showQuickModal,   setShowQuickModal]   = useState(false);
  const [showCienciaModal, setShowCienciaModal] = useState(false);
  const [showLojaModal,    setShowLojaModal]    = useState(false);
  const [quizStep,         setQuizStep]         = useState(0); // 0=overview 1-4=quiz 5=result
  const [currentAnswer,    setCurrentAnswer]    = useState<number | null>(null);
  const [toasts,           setToasts]           = useState<Toast[]>([]);

  const [hubProfileImage, setHubProfileImage] = useState<string | null>(() => readGlpyProfilePhoto());
  const hubSexo = (() => { try { return (localStorage.getItem("glpy_sexo") || "").trim(); } catch { return ""; } })();

  useEffect(() => {
    function onUpdate() { setHubProfileImage(readGlpyProfilePhoto()); }
    window.addEventListener('local-storage-change', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('local-storage-change', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const triggerToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const closeLoja = () => {
    setShowLojaModal(false);
    setQuizStep(0);
    setCurrentAnswer(null);
  };

  const advanceQuiz = () => {
    if (currentAnswer === null) return;
    if (quizStep < 4) {
      setQuizStep(q => q + 1);
      setCurrentAnswer(null);
    } else {
      setQuizStep(5);
      setCurrentAnswer(null);
      const alreadyClaimed = localStorage.getItem('glpy_quiz_cocriacao_xp_claimed') === 'true';
      if (alreadyClaimed) {
        triggerToast('Você já recebeu o XP deste quiz.');
      } else {
        const xpAtual = parseInt(localStorage.getItem('glpy_xp') || '0', 10);
        localStorage.setItem('glpy_xp', String(xpAtual + 50));
        localStorage.setItem('glpy_quiz_cocriacao_xp_claimed', 'true');
        window.dispatchEvent(new Event('local-storage-change'));
        triggerToast('+50 XP adicionados à sua jornada GLPY.');
      }
    }
  };

  const hubCards = [
    {
      id: "protocolos",
      title: "Protocolos",
      subtitle: "Acesse sua jornada guiada",
      Icon: Shield,
      bg: "bg-emerald-50",
      border: "border-emerald-100/60",
      iconBg: "bg-white border border-emerald-100/80",
      iconColor: "text-emerald-600",
      onClick: () => { sessionStorage.setItem('glpy_return_to', 'hub'); onNavigate ? onNavigate("protocolHub") : goTo("/preview/protocols"); },
    },
    {
      id: "receitas",
      title: "Receitas",
      subtitle: "Ideias alinhadas ao seu momento",
      Icon: ChefHat,
      bg: "bg-amber-50",
      border: "border-amber-100/60",
      iconBg: "bg-white border border-amber-100/80",
      iconColor: "text-amber-600",
      onClick: () => { sessionStorage.setItem('glpy_return_to', 'hub'); onNavigate ? onNavigate("recipes") : goTo("/preview/recipes"); },
    },
    {
      id: "celulas",
      title: "Células",
      subtitle: "Conecte-se à sua comunidade",
      Icon: Users,
      bg: "bg-blue-50",
      border: "border-blue-100/60",
      iconBg: "bg-white border border-blue-100/80",
      iconColor: "text-blue-500",
      onClick: () => { sessionStorage.setItem('glpy_return_to', 'hub'); onNavigate ? onNavigate("comunidade") : goTo("/preview/comunidade"); },
    },
    {
      id: "ia",
      title: "GLPY IA",
      subtitle: "Tire dúvidas com base na sua jornada",
      Icon: Sparkles,
      bg: "bg-violet-50",
      border: "border-violet-100/60",
      iconBg: "bg-white border border-violet-100/80",
      iconColor: "text-violet-600",
      onClick: () => { sessionStorage.setItem('glpy_return_to', 'hub'); onNavigate ? onNavigate("chatIA") : goTo("/preview/chat-ia"); },
    },
    {
      id: "ciencia",
      title: "Ciência GLP-1",
      subtitle: "Instagram · TikTok · YouTube · Facebook",
      Icon: FlaskConical,
      bg: "bg-teal-50",
      border: "border-teal-100/60",
      iconBg: "bg-white border border-teal-100/80",
      iconColor: "text-teal-600",
      onClick: () => setShowCienciaModal(true),
    },
    {
      id: "loja",
      title: "Loja GLPY",
      subtitle: "Cocriação de fórmulas clínicas",
      Icon: ShoppingBag,
      bg: "bg-rose-50",
      border: "border-rose-100/60",
      iconBg: "bg-white border border-rose-100/80",
      iconColor: "text-rose-500",
      onClick: () => setShowLojaModal(true),
    },
  ];

  const socialLinks = [
    { name: "Instagram", sub: "Reels, bastidores e histórias reais",    Icon: Instagram, iconColor: "text-pink-500",  iconBg: "bg-white border border-pink-100/80",  bg: "bg-pink-50",  border: "border-pink-100/60"  },
    { name: "TikTok",    sub: "Conteúdos rápidos e virais",             Icon: Music2,    iconColor: "text-slate-700", iconBg: "bg-white border border-slate-100/80", bg: "bg-slate-50", border: "border-slate-100/60" },
    { name: "YouTube",   sub: "Aulas, explicações e ciência aplicada",  Icon: Youtube,   iconColor: "text-red-500",   iconBg: "bg-white border border-red-100/80",   bg: "bg-red-50",   border: "border-red-100/60"   },
    { name: "Facebook",  sub: "Comunidade, posts e lives",              Icon: Facebook,  iconColor: "text-blue-600",  iconBg: "bg-white border border-blue-100/80",  bg: "bg-blue-50",  border: "border-blue-100/60"  },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f3f7f5] flex items-center justify-center p-0 sm:p-4 text-[#0A1628] antialiased">
      <style>{`
        .hub-no-scrollbar::-webkit-scrollbar { display: none; }
        .hub-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes hubSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .hub-slide-up { animation: hubSlideUp 0.28s cubic-bezier(0.32,0.72,0,1); }
      `}</style>

      <div className="relative w-full max-w-[430px] bg-[#FAFCFB] shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:h-[900px] sm:rounded-[36px] sm:border-[8px] sm:border-slate-900">

        {/* Toast */}
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm z-[9999] pointer-events-none flex flex-col-reverse gap-2">
          {toasts.map(t => (
            <div key={t.id} className="bg-slate-900/95 backdrop-blur-sm text-white text-xs py-3 px-4 rounded-xl shadow-2xl border border-white/10 flex items-center gap-3 pointer-events-auto">
              <div className="w-5 h-5 bg-[#00C27A] rounded-full flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white stroke-[2.5]" />
              </div>
              <p className="flex-1 font-medium">{t.msg}</p>
            </div>
          ))}
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto hub-no-scrollbar pb-[80px]">

          {/* Header */}
          <div className="px-5 pt-6 pb-5 bg-white border-b border-[#E2EBE7]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <img src={glpyLogoLight} alt="GLPY" className="w-[84px] h-auto object-contain" />
                <span className="text-[9px] font-bold text-[#00C27A] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  HUB ATIVO
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00C27A] to-[#00A38B] flex items-center justify-center shadow-sm shadow-[#00C27A]/30">
                <LayoutGrid className="w-4 h-4 text-white stroke-[2.2]" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-[#0A1628] tracking-tight">
              HUB
            </h1>
            <p className="text-sm text-[#3D5A70] mt-1 leading-snug">
              Seu centro de protocolos, conteúdo, comunidade e evolução.
            </p>
          </div>

          {/* Cards grid 2×3 */}
          <div className="px-4 pt-5 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {hubCards.map(({ id, title, subtitle, Icon, bg, border, iconBg, iconColor, onClick }) => (
                <button
                  key={id}
                  onClick={onClick}
                  className={`flex flex-col gap-3 p-4 rounded-2xl ${bg} border ${border} active:opacity-80 transition text-left`}
                >
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-5 h-5 ${iconColor} stroke-[2.2]`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-[#0A1628] leading-tight">{title}</p>
                    <p className="text-[10px] text-[#3D5A70] mt-0.5 leading-snug">{subtitle}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 self-end" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom nav */}
        <div
          className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 bg-white/95 backdrop-blur-md border-t border-[#E2EBE7] z-40 cursor-pointer"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="w-full h-[72px] px-6 py-2 flex justify-between items-center">
          <button
            onClick={() => onNavigate ? onNavigate("dashboard") : goTo("/preview/home-premium-v2")}
            className="flex flex-col items-center justify-center w-12 h-12 transition text-slate-400 hover:text-slate-600"
          >
            <Compass className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Início</span>
          </button>

          <button className="flex flex-col items-center justify-center w-12 h-12 text-[#00C27A]">
            <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">HUB</span>
          </button>

          <button
            onClick={() => setShowQuickModal(true)}
            style={{ touchAction: 'manipulation' }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00C27A] to-[#00A38B] flex items-center justify-center text-white shadow-lg active:scale-95 transition -translate-y-2 cursor-pointer"
          >
            <Plus className="w-6 h-6 text-white stroke-[2.8]" />
          </button>

          <button
            onClick={() => onNavigate ? onNavigate("progress") : goTo("/preview/results")}
            className="flex flex-col items-center justify-center w-12 h-12 transition text-slate-400 hover:text-slate-600"
          >
            <LineChart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Progresso</span>
          </button>

          <button
            onClick={() => { sessionStorage.setItem("glpy_restore_tab", "perfil"); onNavigate ? onNavigate("dashboard") : goTo("/preview/home-premium-v2"); }}
            className="flex flex-col items-center justify-center w-12 h-12 transition text-slate-400 hover:text-slate-600"
          >
            {hubProfileImage ? (
              <img src={hubProfileImage} alt="Perfil" className="w-5 h-5 rounded-full object-cover" />
            ) : hubSexo === "Feminino" ? (
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="rounded-full opacity-60">
                <circle cx="16" cy="16" r="16" fill="#00C27A"/>
                <path d="M9.5 13C9.5 8 12.5 6 16 6C19.5 6 22.5 8 22.5 13C22 7.5 19.5 5.5 16 5.5C12.5 5.5 10 7.5 9.5 13Z" fill="white"/>
                <circle cx="16" cy="13.5" r="5" fill="white"/>
                <path d="M6 28C6 22 10.5 19 16 19C21.5 19 26 22 26 28" fill="white"/>
              </svg>
            ) : hubSexo === "Masculino" ? (
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="rounded-full opacity-60">
                <circle cx="16" cy="16" r="16" fill="#00C27A"/>
                <path d="M10 12C10 8 12.5 6 16 6C19.5 6 22 8 22 12L22 9.5C22 7 19.5 5.5 16 5.5C12.5 5.5 10 7 10 9.5Z" fill="white" opacity="0.85"/>
                <circle cx="16" cy="13.5" r="5.5" fill="white"/>
                <path d="M4 28C4 21.5 9.5 18.5 16 18.5C22.5 18.5 28 21.5 28 28" fill="white"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="rounded-full opacity-60">
                <circle cx="16" cy="16" r="16" fill="#00C27A"/>
                <circle cx="16" cy="13" r="5.5" fill="white"/>
                <path d="M5 28C5 21.5 10 18.5 16 18.5C22 18.5 27 21.5 27 28" fill="white"/>
              </svg>
            )}
            <span className="text-[9px] font-bold mt-1">Perfil</span>
          </button>
          </div>
        </div>

        <QuickActionModal
          show={showQuickModal}
          onClose={() => setShowQuickModal(false)}
          onNavigate={onNavigate}
        />

        {/* ── MODAL CIÊNCIA GLP-1 ── */}
        {showCienciaModal && (
          <div
            className="fixed inset-0 bg-[#0A1628]/50 z-[200] flex flex-col justify-end"
            onClick={() => setShowCienciaModal(false)}
          >
            <div
              className="bg-white rounded-t-[28px] w-full max-w-[430px] mx-auto hub-slide-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>
              <div className="px-6 pt-3 pb-4">
                <div className="flex items-center gap-2 mb-0.5">
                  <FlaskConical className="w-4 h-4 text-teal-600 stroke-[2.2]" />
                  <h2 className="text-base font-black text-[#0A1628]">Ciência GLP-1 nas redes</h2>
                </div>
                <p className="text-[11px] text-[#3D5A70] leading-snug">
                  Aprenda em vídeos curtos, aulas e conteúdos práticos do ecossistema GLPY.
                </p>
              </div>
              <div className="px-4 pb-8 space-y-2">
                {socialLinks.map(({ name, sub, Icon, iconColor, iconBg, bg, border }) => (
                  <div key={name} className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl ${bg} border ${border} opacity-60`}>
                    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className={`w-5 h-5 ${iconColor} stroke-[2.2]`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold text-[#0A1628] leading-tight">{name}</p>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Em breve</span>
                      </div>
                      <p className="text-[11px] text-[#3D5A70] mt-0.5 leading-snug">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL LOJA GLPY ── */}
        {showLojaModal && (
          <div
            className="fixed inset-0 bg-[#0A1628]/50 z-[200] flex flex-col justify-end"
            onClick={quizStep === 0 ? closeLoja : undefined}
          >
            <div
              className="bg-white rounded-t-[28px] w-full max-w-[430px] mx-auto hub-slide-up flex flex-col"
              style={{ maxHeight: "92vh" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto hub-no-scrollbar">

                {/* ── OVERVIEW (quizStep === 0) ── */}
                {quizStep === 0 && (
                  <div className="px-6 pt-3 pb-8 space-y-5">
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag className="w-4 h-4 text-rose-500 stroke-[2.2]" />
                        <h2 className="text-base font-black text-[#0A1628]">Loja GLPY</h2>
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full uppercase tracking-widest ml-auto">
                          Pesquisa ativa
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3D5A70] leading-snug">
                        Cocriação de fórmulas clínicas para usuários GLP-1.
                      </p>
                    </div>

                    {/* Quiz intro */}
                    <div className="bg-white border border-[#E2EBE7] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                          Quiz de Cocriação
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                          INTRO
                        </span>
                      </div>

                      <p className="text-sm font-extrabold text-[#0A1628] leading-snug">
                        Ajude a modelar os próximos lotes com preço justo 📦
                      </p>
                      <p className="text-[11px] text-[#3D5A70] leading-relaxed">
                        Não vendemos produtos prontos. Usamos os dados corporativos da comunidade GLPY para calibrar fórmulas perfeitas de suplementação clínica focadas em quem usa canetas de emagrecimento rápido.
                      </p>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] font-black text-[#0A1628] uppercase tracking-wider">
                          O que investigamos com este quiz?
                        </p>
                        <ul className="space-y-1.5">
                          {[
                            "Frequência de compra desejada",
                            "Fórmulas personalizadas adequadas aos efeitos colaterais ativos",
                            "Faixas de investimento justas em solo nacional",
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#00C27A] mt-1.5 shrink-0" />
                              <p className="text-[11px] text-[#3D5A70] leading-snug">{item}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => setQuizStep(1)}
                        className="w-full py-3 bg-gradient-to-r from-[#00C27A] to-[#00A38B] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 active:opacity-90 transition shadow-sm shadow-[#00C27A]/20"
                      >
                        <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                        RESPONDER &amp; GANHAR +50 XP
                      </button>
                    </div>
                  </div>
                )}

                {/* ── QUIZ STEPS 1-4 ── */}
                {quizStep >= 1 && quizStep <= 4 && (() => {
                  const step = QUIZ_STEPS[quizStep - 1];
                  return (
                    <div className="px-6 pt-3 pb-8 space-y-5">
                      {/* Quiz header */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setQuizStep(q => q - 1); setCurrentAnswer(null); }}
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 active:opacity-70 transition"
                        >
                          <ChevronLeft className="w-4 h-4 text-[#0A1628] stroke-[2.2]" />
                        </button>
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-[#3D5A70] uppercase tracking-widest">
                            Passo {quizStep} de 4
                          </p>
                          <p className="text-[11px] font-extrabold text-[#0A1628]">{step.title}</p>
                        </div>
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                          Quiz
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00C27A] to-[#00A38B] rounded-full transition-all duration-300"
                          style={{ width: `${(quizStep / 4) * 100}%` }}
                        />
                      </div>

                      {/* Question */}
                      <p className="text-sm font-extrabold text-[#0A1628] leading-snug">
                        {step.question}
                      </p>

                      {/* Options */}
                      <div className="space-y-2">
                        {step.options.map((opt, i) => {
                          const selected = currentAnswer === i;
                          return (
                            <button
                              key={i}
                              onClick={() => setCurrentAnswer(i)}
                              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition active:opacity-80 ${
                                selected
                                  ? "bg-emerald-50 border-[#00C27A] text-[#0A1628]"
                                  : "bg-white border-[#E2EBE7] text-[#0A1628] hover:border-emerald-200"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                                selected ? "border-[#00C27A] bg-[#00C27A]" : "border-slate-300"
                              }`}>
                                {selected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                              </div>
                              <p className="text-xs font-bold leading-snug">{opt}</p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Advance */}
                      <button
                        onClick={advanceQuiz}
                        disabled={currentAnswer === null}
                        className={`w-full py-3 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition ${
                          currentAnswer !== null
                            ? "bg-gradient-to-r from-[#00C27A] to-[#00A38B] text-white shadow-sm shadow-[#00C27A]/20 active:opacity-90"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {quizStep < 4 ? "Próxima pergunta →" : "Ver resultado →"}
                      </button>
                    </div>
                  );
                })()}

                {/* ── RESULTADO (quizStep === 5) ── */}
                {quizStep === 5 && (
                  <div className="px-6 pt-6 pb-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Award className="w-8 h-8 text-[#00C27A] stroke-[2]" />
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-base font-black text-[#0A1628]">
                        Obrigado por cocriar com a GLPY 💚
                      </h2>
                      <p className="text-[11px] text-[#3D5A70] leading-relaxed max-w-[280px]">
                        Suas respostas ajudam a comunidade GLPY a construir fórmulas mais inteligentes, acessíveis e alinhadas à jornada de quem usa GLP-1.
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#00C27A] stroke-[2.5]" />
                      <p className="text-xs font-extrabold text-[#0A1628]">
                        Você ganhou <span className="text-[#00C27A]">+50 XP</span> simbólicos nesta etapa.
                      </p>
                    </div>

                    <button
                      onClick={closeLoja}
                      className="w-full py-3 bg-gradient-to-r from-[#00C27A] to-[#00A38B] text-white text-xs font-black rounded-xl flex items-center justify-center active:opacity-90 transition shadow-sm shadow-[#00C27A]/20"
                    >
                      Concluir
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
