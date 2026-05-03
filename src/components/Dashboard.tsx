import { motion } from "motion/react";
import {
  Flame, Target, MessageSquare, Utensils, Award,
  CheckCircle, Zap, ShoppingBag, Camera, Calendar,
  TrendingUp, Syringe, ChevronRight, RotateCcw, Images
} from "lucide-react";
import BottomNav from "./BottomNav";

export default function Dashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const dailyScore = 75;

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
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      
      {/* Header — fundo branco limpo */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
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
          onClick={() => onNavigate('protocolDay')}
          className="bg-white rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-primary/30 transition"
        >
          <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
            🔥
          </div>
          <div className="flex-grow">
            <p className="text-xs text-text-muted font-medium">Protocolo ativo</p>
            <p className="font-bold text-sm text-text-main">Sobrevivendo às Canetas</p>
            {/* Progresso 7 dias */}
            <div className="flex gap-1 mt-1.5">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-1">Dia 4 de 7</p>
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
