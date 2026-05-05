import { useState } from "react";
import { motion } from "motion/react";
import {
  Flame, Target, MessageSquare, Utensils, Award,
  CheckCircle, Zap, ShoppingBag, Camera, Calendar,
  TrendingUp, Syringe, ChevronRight, RotateCcw, Images, CreditCard
} from "lucide-react";
import BottomNav from "./BottomNav";

export default function Dashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const dailyScore = 75;

  // Protocolo ativo via localStorage
  const protocoloAtivoRaw = localStorage.getItem("glpy_protocolo_ativo");
  const protocoloAtivo = protocoloAtivoRaw
    ? JSON.parse(protocoloAtivoRaw)
    : { id: "antiRebote", nome: "Anti-Rebote", emoji: "⚖️", totalDias: 7 };

  const diaAtualProtocolo = (() => {
    if (protocoloAtivo.id === "antiRebote") {
      return parseInt(localStorage.getItem("glpy_antirebote_dia") || "0", 10);
    }
    return parseInt(localStorage.getItem("glpy_protocolo_dia") || "0", 10);
  })();

  const streak = parseInt(localStorage.getItem("glpy_streak") || "34", 10);

  // Alerta de risco
  const riscoNivel = (dailyScore < 60 || streak < 2) ? "Alto"
    : (dailyScore < 80 || streak < 7) ? "Médio" : "Baixo";

  const riscoTexto = dailyScore < 80
    ? "Você está abaixo da meta de proteína de hoje. Proteína baixa é o principal gatilho do efeito rebote."
    : streak < 3
    ? "Consistência abaixo de 3 dias ativa o mecanismo de recuperação de peso. Mantenha o ritmo hoje."
    : "Score excelente! Mantenha proteína alta e sono regulado para consolidar os resultados.";

  const riscoCor = riscoNivel === "Alto"
    ? { border: "#EF4444", bg: "#FEF2F2", text: "#DC2626" }
    : riscoNivel === "Médio"
    ? { border: "#F59E0B", bg: "#FFFBEB", text: "#D97706" }
    : { border: "#00C27A", bg: "#E6FBF3", text: "#009960" };

  // Decisões do dia por protocolo
  const DECISOES: Record<string, Array<{ acao: string; motivo: string }>> = {
    antiRebote: [
      { acao: "Bater a meta de proteína hoje", motivo: "Proteína alta é o principal sinal de segurança para o metabolismo" },
      { acao: "20 min de caminhada leve", motivo: "Ativa GLUT4 — direciona glicose para músculo, não gordura" },
      { acao: "Dormir 8 horas esta noite", motivo: "Sono ruim aumenta grelina em +30% e triplica a fome amanhã" },
    ],
    sobrevivendo: [
      { acao: "Comer a cada 3-4 horas", motivo: "Mantém metabolismo ativo mesmo com apetite suprimido pelo GLP-1" },
      { acao: "Registrar todos os sintomas", motivo: "Dados desta semana guiam o ajuste do protocolo" },
      { acao: "Beber 2L de água", motivo: "Desidratação simula fome — o GLP-1 pode mascarar o sinal" },
    ],
    nutricao: [
      { acao: "Proteína completa nas 3 refeições", motivo: "Leucina é essencial para síntese muscular com déficit calórico" },
      { acao: "Fonte de gordura boa no almoço", motivo: "Ômega-3 reduz inflamação causada pelo emagrecimento rápido" },
      { acao: "Zero carboidrato refinado hoje", motivo: "Pico de glicose sabota a preservação muscular" },
    ],
  };

  const decisoes = DECISOES[protocoloAtivo.id] || [
    { acao: "Completar o check-in diário", motivo: "Dados consistentes tornam o protocolo mais preciso" },
    { acao: "Bater a meta de proteína", motivo: "Proteína é a âncora de todo o protocolo GLPY" },
    { acao: "Zero açúcar refinado hoje", motivo: "Picos de glicose ativam o mecanismo de rebote" },
  ];

  const [decisoesMarcadas, setDecisoesMarcadas] = useState<boolean[]>([false, false, false]);
  const toggleDecisao = (i: number) =>
    setDecisoesMarcadas(prev => prev.map((v, idx) => idx === i ? !v : v));

  // 4 ações principais — destaque visual
  const primaryActions = [
    { name: 'GLPY.IA', icon: MessageSquare, route: 'chatIA', color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
    { name: 'Registrar Prato', icon: Camera, route: 'fotoPrato', color: 'bg-sky-50 text-sky-600', border: 'border-sky-100' },
    { name: 'Check-in', icon: CheckCircle, route: 'checkin', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { name: 'Receitas', icon: Utensils, route: 'receitas', color: 'bg-orange-50 text-orange-500', border: 'border-orange-100' },
  ];

  // Atalhos secundários — linha compacta
  const secondaryActions = [
    { name: 'Progresso', icon: TrendingUp, route: 'progress' },
    { name: 'Injeção', icon: Syringe, route: 'injecao' },
    { name: 'ANVISA', icon: Calendar, route: 'contadorReceita' },
    { name: 'Anti-Rebote', icon: RotateCcw, route: 'antiRebote' },
    { name: 'Fotos', icon: Images, route: 'fotosEvolucao' },
    { name: 'Loja', icon: ShoppingBag, route: 'loja' },
    { name: 'Planos', icon: CreditCard, route: 'planos' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      <style>{`
        @keyframes neon-pulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 6px 2px #00C27A88; }
          50%       { opacity: 0.3; transform: scale(1.4); box-shadow: 0 0 10px 4px #00C27A44; }
        }
        .neon-dot { animation: neon-pulse 1.8s ease-in-out infinite; }
      `}</style>
      
      {/* Header — fundo branco limpo */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C9 3 6 6.5 6 10.5C6 15 9 18.5 12 21C15 18.5 18 15 18 10.5C18 6.5 15 3 12 3Z" fill="#00C27A"/>
                <path d="M12 8C12 11 10 13 10 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="font-black text-lg tracking-tight text-[#0A1628]">GLPY</span>
            </div>
            <p className="text-text-muted text-sm">Bom dia,</p>
            <h1 className="text-2xl font-bold tracking-tight">Cleison</h1>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-1 bg-[#F4F6F8] border border-border px-2.5 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-text-main">Nível 3 · Adaptado</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F4F6F8] border border-border px-2.5 py-1 rounded-full">
                <span className="text-xs font-bold text-text-muted">340 XP</span>
              </div>
            </div>
            {/* Barra XP */}
            <div className="w-48 bg-border h-1 rounded-full mt-2">
              <div className="bg-amber-400 h-full w-[40%] rounded-full" />
            </div>
          </div>
          <div className="w-10 h-10 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center">
            <Award className="w-5 h-5 text-text-muted" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">

        {/* Score + Streak — 2 cards lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          {/* Score */}
          <div className="bg-white rounded-2xl border border-border p-4 flex flex-col items-center shadow-sm">
            <div className="relative w-20 h-20 mb-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#E2EBE7" strokeWidth="6" fill="none" />
                <motion.circle
                  cx="40" cy="40" r="32"
                  stroke="#00C27A"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: dailyScore / 100 }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-text-main">
                {dailyScore}%
              </div>
            </div>
            <p className="text-xs text-text-muted font-medium">Score do dia</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl border border-border p-4 flex flex-col items-center justify-center shadow-sm">
            <Flame className="w-9 h-9 text-orange-500 mb-1" fill="currentColor" />
            <p className="text-3xl font-black text-text-main leading-none">34</p>
            <p className="text-xs text-text-muted font-medium mt-1">dias streak</p>
          </div>
        </div>

        {/* Alerta de Risco */}
        <div
          className="rounded-2xl border p-4 shadow-sm"
          style={{ background: riscoCor.bg, borderColor: riscoCor.border + "99" }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div className="flex-grow">
              <p className="font-bold text-sm" style={{ color: riscoCor.text }}>
                Risco de Rebote: {riscoNivel}
              </p>
              <p className="text-xs text-text-main leading-relaxed mt-1">{riscoTexto}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('chatIA')}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: riscoCor.text }}
          >
            Ver o que fazer →
          </button>
        </div>

        {/* Decisão do Dia */}
        <div className="bg-[#0A1628] rounded-2xl p-5">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-4">Hoje você precisa:</p>
          <div className="space-y-4">
            {decisoes.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDecisao(i)}
                className="w-full flex gap-3 text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    decisoesMarcadas[i] ? 'border-primary bg-primary' : 'border-white/30'
                  }`}
                >
                  {decisoesMarcadas[i] && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-snug transition-all ${
                    decisoesMarcadas[i] ? 'line-through text-white/30' : 'text-white'
                  }`}>
                    {d.acao}
                  </p>
                  <p className="text-xs text-white/45 mt-0.5 leading-snug">{d.motivo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Macros — compacto */}
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Macros de hoje</p>
          <div className="space-y-2.5">
            {[
              { label: "Proteína", value: "80g", total: "120g", pct: 66, color: "bg-emerald-400" },
              { label: "Kcal", value: "1.200", total: "1.800", pct: 66, color: "bg-sky-400" },
              { label: "Água", value: "1.2L", total: "2L", pct: 60, color: "bg-blue-400" },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-text-main">{m.label}</span>
                  <span className="text-text-muted">{m.value} / {m.total}</span>
                </div>
                <div className="w-full bg-[#F4F6F8] h-1.5 rounded-full overflow-hidden">
                  <div className={`${m.color} h-full rounded-full`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missão do dia */}
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-grow">
            <p className="text-xs text-text-muted font-medium">Missão do dia</p>
            <p className="font-bold text-sm text-text-main">Beba 2L de água hoje 💧</p>
            <p className="text-xs text-text-muted">expira em 4h</p>
          </div>
          <button
            onClick={() => onNavigate('checkin')}
            className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-primary hover:text-white transition"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Protocolo ativo */}
        <div
          onClick={() => onNavigate(protocoloAtivo.id || 'protocolHub')}
          className="bg-white rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-primary/30 transition"
        >
          <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
            {protocoloAtivo.emoji || "⚖️"}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="neon-dot inline-block w-2 h-2 rounded-full"
                style={{ background: "#00C27A" }}
              />
              <p className="text-xs text-text-muted font-medium">Protocolo ativo</p>
            </div>
            <p className="font-bold text-sm text-text-main">{protocoloAtivo.nome || "Anti-Rebote"}</p>
            <div className="flex gap-1 mt-1.5">
              {Array.from({ length: protocoloAtivo.totalDias || 7 }, (_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < diaAtualProtocolo ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-1">
              Dia {diaAtualProtocolo + 1} de {protocoloAtivo.totalDias || 7}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
        </div>

        {/* Ações principais — 4 cards 2x2 */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {primaryActions.map(action => (
              <button
                key={action.name}
                onClick={() => onNavigate(action.route)}
                className={`bg-white border ${action.border} rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition text-left`}
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-text-main">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Atalhos secundários — linha horizontal scrollável */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Mais recursos</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {secondaryActions.map(action => (
              <button
                key={action.name}
                onClick={() => onNavigate(action.route)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white border border-border rounded-2xl px-4 py-3 shadow-sm hover:border-primary/30 transition min-w-[72px]"
              >
                <action.icon className="w-5 h-5 text-text-muted" />
                <span className="text-xs font-medium text-text-muted whitespace-nowrap">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
