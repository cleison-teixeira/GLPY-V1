import { motion } from "motion/react";
import { Flame, Target, MessageSquare, Utensils, Award, CheckCircle, Zap, ShoppingBag, Camera } from "lucide-react";
import BottomNav from "./BottomNav";

export default function Dashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const dailyScore = 75; // Mock score

  return (
    <div id="dashboard" className="min-h-screen bg-background text-text-main p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-text-muted text-sm font-medium">Bom dia,</p>
          <h1 className="text-2xl font-bold">Cleison</h1>
          {/* Level Chip and Progress */}
          <div className="flex items-center gap-2 bg-white rounded-pill px-3 py-1 border border-border mt-2 w-fit">
            <Zap className="w-4 h-4 text-alert" />
            <span className="text-xs font-semibold text-text-main">Nível 3 · Adaptado · 340 XP</span>
          </div>
          <div className="w-full max-w-[200px] bg-border h-1.5 rounded-full mt-2">
            <div className="bg-primary h-full w-[40%] rounded-full"></div>
          </div>
        </div>
        <div className="bg-primary/10 text-primary p-2 rounded-full">
          <Award className="w-6 h-6" />
        </div>
      </header>

      {/* Daily Stats Section: Including Score and Streak */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center">
          <div className="relative w-24 h-24 mb-2">
            <svg className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" className="stroke-border" strokeWidth="8" fill="none" />
              <motion.circle
                cx="48" cy="48" r="40"
                className="stroke-primary"
                strokeWidth="8"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: dailyScore / 100 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">{dailyScore}%</div>
          </div>
          <p className="text-text-muted text-xs">Score do dia</p>
        </div>

        {/* Streak Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center justify-center">
          <Flame className="w-10 h-10 text-primary animate-fire mb-2" fill="currentColor" />
          <p className="text-3xl font-bold">34</p>
          <p className="text-text-muted text-xs">dias streak</p>
        </div>
      </div>
      
      {/* Quick Check-in Button */}
      <button onClick={() => onNavigate('checkin')} className="w-full bg-primary text-white font-bold p-4 rounded-3xl shadow-lg mb-8 flex items-center justify-center gap-2 hover:bg-primary/90 transition">
        <CheckCircle className="w-5 h-5" />
        Registrar Check-in Diário
      </button>

      {/* Macros Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-8">
        <h2 className="text-lg font-bold mb-4">Macros</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium text-text-main mb-1"><span>Proteína</span><span className="text-text-muted">80/120g</span></div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden"><div className="bg-primary h-full w-[66%] rounded-full"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-medium text-text-main mb-1"><span>Kcal</span><span className="text-text-muted">1200/1800</span></div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden"><div className="bg-primary h-full w-[66%] rounded-full"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-medium text-text-main mb-1"><span>Água</span><span className="text-text-muted">1.2/2L</span></div>
            <div className="w-full bg-border h-2 rounded-full overflow-hidden"><div className="bg-primary h-full w-[60%] rounded-full"></div></div>
          </div>
        </div>
      </div>

      {/* Daily Mission Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-8 flex items-center justify-between"
      >
        <div className="flex gap-4 items-center">
          <div className="bg-alert/10 text-alert p-3 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">Missão do Dia</h3>
            <p className="text-text-muted text-sm">Beba 2L de água hoje 💧</p>
          </div>
        </div>
        <button className="bg-primary text-white font-bold p-3 rounded-2xl shadow-md">
          <CheckCircle className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Active Protocol */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-8 relative overflow-hidden"
      >
        <div className="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold mb-1">Sobrevivendo às Canetas</h3>
        <p className="text-text-muted text-sm mb-4">Dia 4 de 7 · Protocolo Inicial</p>
        <button onClick={() => onNavigate('protocolDay')} className="text-primary font-semibold flex items-center gap-1 text-sm bg-primary/5 px-4 py-2 rounded-pill hover:bg-primary/10 transition">
           Visualizar Missões <CheckCircle className="w-4 h-4 ml-1" />
        </button>
      </motion.div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold mb-4">Ações Rápidas</h2>
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: 'GLPY.IA', icon: MessageSquare, route: 'chatIA' },
          { name: 'Registrar Prato', icon: Camera, route: 'fotoPrato' },
          { name: 'Plano Semanal', icon: Target, route: 'planoSemanal' },
          { name: 'Receitas', icon: Utensils, route: 'receitas' },
          { name: 'Injeção', icon: Zap, route: 'injecao' },
          { name: 'Contador ANVISA', icon: CheckCircle, route: 'contadorReceita' },
          { name: 'Alerta Injeção', icon: Zap, route: 'alertaInjecao' },
          { name: 'Progresso', icon: Flame, route: 'progress' },
          { name: 'Anti-Rebote', icon: Award, route: 'antiRebote' },
          { name: 'Fotos Evolução', icon: Award, route: 'fotosEvolucao' },
          { name: 'Loja', icon: ShoppingBag, route: 'loja' },
        ].map((action) => (
          <button key={action.name} onClick={() => onNavigate(action.route)} className="bg-white p-4 rounded-3xl shadow-sm border border-border flex flex-col items-center gap-2 hover:border-primary transition">
            <action.icon className="w-6 h-6 text-primary" />
            <span className="text-xs font-medium text-center">{action.name}</span>
          </button>
        ))}
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
