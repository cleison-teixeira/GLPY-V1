import React, { useState, useEffect } from "react";
import {
  Bell,
  Flame,
  Check,
  Flag,
  Ruler,
  ChevronRight,
  Syringe,
  Dumbbell,
  Pill,
  Droplet,
  GlassWater,
  Smile,
  Scale,
  Camera,
  Compass,
  LineChart,
  User,
  Shield,
  Sparkles,
  Plus,
  Utensils,
  Activity
} from "lucide-react";

import glpyLogoSymbol from '@/assets/logos/logo-light.png';
import { useCurrentWeight } from '../hooks/useCurrentWeight';
import { useUserOnboarding } from '../hooks/useUserOnboarding';
import { useNutritionTargets } from '../hooks/useNutritionTargets';
import { useActiveProtocol } from '../hooks/useActiveProtocol';
import { useDailyLimits } from '../hooks/useDailyLimits';
import { saveWeightEntry } from '../core/glpyLocalIntelligence';

// TODO Fase 1F.2:
// Substituir mockHomeData por dados derivados de:
// - getGLPYIntelligenceContext()
// - calculateDailyRemaining()
// - getProtocolRegistryItem()
// - Protocol Day Tracking

// Mock data estruturado de forma limpa e isolada no topo
export const mockHomeData = {
  user: {
    name: "Usuário GLPY",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120&h=120",
    streakCoins: 12,
    weightCurrent: 72.6,
    weightGoal: 60.0,
    weightStart: 80.0,
    weightLost: 7.4,
    height: 1.65,
    lastUpdate: "12/05/2024"
  },
  evolution: {
    cintura: { current: 91, change: -5, unit: "cm" },
    busto: { current: 91, change: -1, unit: "cm" },
    coxa: { current: 53, change: -4, unit: "cm" },
    panturrilha: { current: 41, change: -1, unit: "cm" },
    days: 22
  },
  performance: {
    glp1: { name: "GLP-1 / Medicação", nextDose: "Amanhã", currentDose: "1,0 mg", sideEffect: "Leves" },
    activity: { name: "Atividade Física", stepsToday: 7842, stepsGoal: 10000, trainingThisWeek: 3, trainingGoal: 5, consistencyDays: 6 },
    suplements: { name: "Suplementação", activeCount: 4, takenToday: 3, nextTime: "Magnésio" }
  },
  nutrients: {
    protein: { current: 35, target: 120, unit: "g", percent: 29 },
    carbs: { current: 35, target: 230, unit: "g", percent: 15 },
    fat: { current: 10, target: 52, unit: "g", percent: 19 },
    water: { current: 0.8, target: 2.8, unit: "L", percent: 29 },
    calories: { remaining: 1446, target: 2200, consumed: 754, unit: "kcal" }
  },
  actions: [
    { id: "agua", label: "Água", icon: "GlassWater", color: "text-blue-500 bg-blue-50" },
    { id: "refeicao", label: "Refeição", icon: "Utensils", color: "text-emerald-500 bg-emerald-50" },
    { id: "emocao", label: "Emoção", icon: "Smile", color: "text-amber-500 bg-amber-50" },
    { id: "peso", label: "Peso", icon: "Scale", color: "text-[#00C27A] bg-[#00C27A]/10" },
    { id: "medida", label: "Medida", icon: "Ruler", color: "text-teal-500 bg-teal-50" },
    { id: "aplicacao", label: "Aplicação", icon: "Syringe", color: "text-purple-500 bg-purple-50" },
    { id: "foto", label: "Foto corporal", icon: "Camera", color: "text-pink-500 bg-pink-50" },
    { id: "checkin", label: "Check-in", icon: "Check", color: "text-emerald-500 bg-emerald-50" }
  ],
  protocol: {
    name: "Anti-Rebote",
    module: "Dia 1 de 7",
    currentDay: 1,
    totalDays: 7,
    percentage: 14
  },
  social: "128.450 kg eliminados sem rebote 🔥"
};

// ─────────────────────────────────────────────────────────────────────────────

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
}

interface QuickToast {
  id: number;
  msg: string;
}

interface NutritionGoalCardProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: "red" | "green" | "amber" | "blue";
  onClick?: () => void;
}

function NutritionGoalCard({
  label,
  current,
  target,
  unit,
  color,
  onClick
}: NutritionGoalCardProps) {
  const colorMap = {
    red: {
      text: "text-[#E8445A]",
      stroke: "stroke-[#E8445A]",
      bgStroke: "stroke-[#FDF2F4]",
      iconBg: "bg-red-50",
      accentBorder: "group-hover:border-red-200"
    },
    green: {
      text: "text-[#00C27A]",
      stroke: "stroke-[#00C27A]",
      bgStroke: "stroke-[#EEFBF6]",
      iconBg: "bg-emerald-50",
      accentBorder: "group-hover:border-emerald-200"
    },
    amber: {
      text: "text-[#F5A623]",
      stroke: "stroke-[#F5A623]",
      bgStroke: "stroke-[#FFFDF5]",
      iconBg: "bg-amber-50",
      accentBorder: "group-hover:border-amber-200"
    },
    blue: {
      text: "text-blue-500",
      stroke: "stroke-blue-500",
      bgStroke: "stroke-blue-50",
      iconBg: "bg-blue-50",
      accentBorder: "group-hover:border-blue-200"
    }
  };

  const theme = colorMap[color];
  const percentage = Math.min(100, Math.round((current / target) * 100));

  const radius = 18;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const renderIcon = () => {
    switch (color) {
      case "red":
        return <Flame className="w-3.5 h-3.5 text-[#E8445A] stroke-[2.5]" />;
      case "green":
        return <Utensils className="w-3.5 h-3.5 text-[#00C27A] stroke-[2.5]" />;
      case "amber":
        return <Activity className="w-3.5 h-3.5 text-[#F5A623] stroke-[2.5]" />;
      case "blue":
        return <GlassWater className="w-3.5 h-3.5 text-blue-500 stroke-[2.5]" />;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`group bg-white rounded-2xl p-3 border border-[#E2EBE7]/70 shadow-xs hover:shadow-sm transition-all duration-300 flex items-center gap-2.5 min-w-0 select-none ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${theme.accentBorder}`}
    >
      <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
        <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            className={`${theme.bgStroke}`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            className={`${theme.stroke} transition-all duration-500`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center ${theme.iconBg}`}>
            {renderIcon()}
          </div>
        </div>
      </div>

      <div className="min-w-0 text-left flex-1">
        <span className="text-[10px] text-[#3D5A70] font-black uppercase tracking-wider block leading-tight">{label}</span>
        <div className="flex items-baseline mt-0.5 leading-none">
          <span className="text-sm font-black text-[#0A1628] tracking-tight">{current}</span>
          <span className="text-[10px] text-slate-400 font-extrabold">/{target}{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePremiumV2() {
  // Mobile Frame States
  const [activeTab, setActiveTab] = useState<"inicio" | "protocolos" | "progresso" | "perfil">("inicio");
  
  // Fase 1F.2: dados reais via hooks centralizados
  const currentWeightData = useCurrentWeight();
  const onboarding = useUserOnboarding();
  const nutritionTargets = useNutritionTargets();
  const activeProtocol = useActiveProtocol();
  const dailyLimits = useDailyLimits();
  const protocolPercent = activeProtocol.totalDays > 0
    ? Math.min(100, Math.round((activeProtocol.currentDay / activeProtocol.totalDays) * 100))
    : 0;
  const [weightCurrent, setWeightCurrent] = useState<number>(() => currentWeightData.weight);
  const weightGoal = onboarding.pesoMeta;
  const userHeight = onboarding.altura;
  const userName = onboarding.nome;
  const userDose = onboarding.dose || '—';
  const userMedicamento = onboarding.medicamento || mockHomeData.performance.glp1.name;

  // Metas-alvo nutricionais: reais se disponíveis, mock como fallback
  const targetProteinG  = nutritionTargets?.proteinGrams  ?? mockHomeData.nutrients.protein.target;
  const targetCarbsG    = nutritionTargets?.carbsGrams     ?? mockHomeData.nutrients.carbs.target;
  const targetFatG      = nutritionTargets?.fatGrams       ?? mockHomeData.nutrients.fat.target;
  const targetWaterL    = nutritionTargets?.waterLiters    ?? mockHomeData.nutrients.water.target;

  // Interactive UI state proxies
  const [waterAmount, setWaterAmount] = useState<number>(mockHomeData.nutrients.water.current);
  const [isCheckInDone, setIsCheckInDone] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(mockHomeData.user.streakCoins);
  const [suplementsCount, setSuplementsCount] = useState<number>(mockHomeData.performance.suplements.takenToday);

  // Popups & modals
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [weightInput, setWeightInput] = useState<string>(() => String(currentWeightData.weight));
  const [showHubModal, setShowHubModal] = useState<boolean>(false);
  const [showPlusDrawer, setShowPlusDrawer] = useState<boolean>(false);
  const [toasts, setToasts] = useState<QuickToast[]>([]);
  const [confettis, setConfettis] = useState<ConfettiParticle[]>([]);

  // Computed weights — weightStart permanece mockado; goal/height/name são reais
  const lostKg = parseFloat((mockHomeData.user.weightStart - weightCurrent).toFixed(1));
  const toGoKg = parseFloat(Math.max(0, weightCurrent - weightGoal).toFixed(1));
  const totalRange = mockHomeData.user.weightStart - weightGoal;
  const progressPercent = totalRange > 0
    ? Math.min(100, Math.max(0, Math.round((lostKg / totalRange) * 100)))
    : 0;
  const bmi = userHeight > 0
    ? parseFloat((weightCurrent / (userHeight * userHeight)).toFixed(1))
    : null;
  const bmiLabel = bmi === null ? "—"
    : bmi < 18.5 ? "Abaixo do peso"
    : bmi < 25 ? "Normal"
    : bmi < 30 ? "Sobrepeso"
    : "Obesidade";
  const waterRemaining = Math.max(0, targetWaterL - waterAmount);

  // Live Toast dispatcher
  const triggerToast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Instant Confetti explosion particle simulation
  const triggerConfetti = () => {
    const colors = ["#00C27A", "#3B82F6", "#F5A623", "#E8445A", "#A855F7", "#10B981"];
    const newConfettis: ConfettiParticle[] = [];
    for (let i = 0; i < 45; i++) {
      newConfettis.push({
        id: Math.random() + Date.now(),
        x: 50,
        y: 80,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5,
        speedY: -(Math.random() * 10 + 8),
        speedX: (Math.random() * 10 - 5),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() * 8 - 4)
      });
    }
    setConfettis((prev) => [...prev, ...newConfettis]);
  };

  useEffect(() => {
    if (confettis.length > 0) {
      const interval = setInterval(() => {
        setConfettis((prev) =>
          prev
            .map((c) => ({
              ...c,
              x: c.x + c.speedX * 0.4,
              y: c.y + c.speedY * 0.4 + 1.2,
              speedY: c.speedY + 0.4,
              rotation: c.rotation + c.rotationSpeed
            }))
            .filter((c) => c.y < 110 && c.x > -15 && c.x < 115)
        );
      }, 30);
      return () => clearInterval(interval);
    }
  }, [confettis]);

  // Click handler helpers
  const handleAddWater = () => {
    const newWater = parseFloat((waterAmount + 0.25).toFixed(2));
    if (newWater <= 5.0) {
      setWaterAmount(newWater);
      triggerToast(`💧 Registro de Água: +250ml salvos! Agora: ${newWater}L`);
      if (newWater >= targetWaterL) {
        triggerConfetti();
        triggerToast(`🎉 Excelente, ${userName}! Meta de hidratação atingida!`);
      }
    }
  };

  const handleApplyWeight = () => {
    const numeric = parseFloat(weightInput);
    if (!isNaN(numeric) && numeric > 45 && numeric < 150) {
      setWeightCurrent(numeric);
      saveWeightEntry({ weight: numeric });
      setShowWeightModal(false);
      triggerConfetti();
      triggerToast(`⚖️ Peso atualizado para ${numeric} kg! Continue no foco.`);
    } else {
      triggerToast("Digite um peso válido coerente!");
    }
  };

  const handleToggleCheckin = () => {
    const nextVal = !isCheckInDone;
    setIsCheckInDone(nextVal);
    if (nextVal) {
      setStreakDays(prev => prev + 1);
      triggerConfetti();
      triggerToast("🔥 Check-In Concluído! Sequência protegida de 13 dias!");
    } else {
      setStreakDays(prev => Math.max(12, prev - 1));
      triggerToast("Status de check-in cancelado.");
    }
  };

  const handleSuplementTake = () => {
    if (suplementsCount < mockHomeData.performance.suplements.activeCount) {
      setSuplementsCount(prev => prev + 1);
      triggerToast(`💊 Suplementação registrada! (${suplementsCount + 1}/${mockHomeData.performance.suplements.activeCount})`);
    } else {
      setSuplementsCount(0);
      triggerToast("Suplementos redefinidos para o dia.");
    }
  };

  // Helper mapping icon identification strings to lucide elements
  const renderActionIcon = (iconName: string) => {
    switch (iconName) {
      case "GlassWater": return <GlassWater className="w-[18px] h-[18px] text-blue-500" />;
      case "Utensils": return <Utensils className="w-[18px] h-[18px] text-[#00C27A]" />;
      case "Smile": return <Smile className="w-[18px] h-[18px] text-amber-500" />;
      case "Scale": return <Scale className="w-[18px] h-[18px] text-[#00C27A]" />;
      case "Ruler": return <Ruler className="w-[18px] h-[18px] text-teal-500" />;
      case "Syringe": return <Syringe className="w-[18px] h-[18px] text-purple-500" />;
      case "Camera": return <Camera className="w-[18px] h-[18px] text-pink-500" />;
      case "Check": return <Check className="w-[18px] h-[18px] text-emerald-500" />;
      default: return <Sparkles className="w-[18px] h-[18px] text-emerald-500" />;
    }
  };

  // Safe callback trigger matching simulated keys
  const handleQuickAction = (id: string) => {
    switch (id) {
      case "agua":
        handleAddWater();
        break;
      case "peso":
        setWeightInput(weightCurrent.toString());
        setShowWeightModal(true);
        break;
      case "checkin":
        handleToggleCheckin();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f7f5] flex items-center justify-center p-0 sm:p-4 text-[#0A1628] antialiased">
      {/* Dynamic inline styles for premium clinic custom scanner simulation */}
      <style>{`
        @keyframes scannerBar {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-scanner-bar {
          animation: scannerBar 4.5s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-shadow {
          box-shadow: 0 4px 20px -2px rgba(10, 22, 40, 0.05), 0 2px 8px -1px rgba(10, 22, 40, 0.03);
        }
      `}</style>
      
      {/* MOBILE CONTAINER - PREMIUM CHASSIS */}
      <div 
        className="relative w-full max-w-[430px] bg-[#FAFCFB] shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:h-[900px] sm:rounded-[36px] sm:border-[8px] sm:border-slate-900"
      >
        
        {/* LIGHTWEIGHT IMMERSIVE CONFETTI CANVAS INTERCEPTOR */}
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-50 overflow-hidden">
          {confettis.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute",
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                transform: `rotate(${c.rotation}deg)`,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                opacity: 0.9,
                transition: "top 0.03s linear, left 0.03s linear"
              }}
            />
          ))}
        </div>

        {/* TOAST SYSTEM FEEDSTACK — absolute dentro do container relative, sempre acima da bottom nav */}
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-sm z-[9999] pointer-events-none flex flex-col-reverse gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/95 backdrop-blur-sm text-white text-xs py-3 px-4 rounded-xl shadow-2xl border border-white/10 flex items-center gap-3 pointer-events-auto animate-[fadeSlideUp_0.25s_ease-out]"
            >
              <div className="w-5 h-5 bg-[#00C27A] rounded-full flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white stroke-[2.5]" />
              </div>
              <p className="flex-1 font-medium">{t.msg}</p>
            </div>
          ))}
        </div>

        {/* METRICS & STATUS NOTCH BAR */}
        <div className="bg-[#FAFCFB] text-[#0A1628] h-[44px] px-6 shrink-0 flex justify-between items-center z-40 select-none relative">
          <span className="text-xs font-bold font-mono text-[#0A1628]">9:41</span>
          
          <div className="flex items-center gap-2 text-[#0A1628]">
            <svg className="w-[17px] h-[11px]" viewBox="0 0 17 11" fill="currentColor">
              <rect x="0" y="8" width="2" height="3" rx="0.5" />
              <rect x="4" y="6" width="2" height="5" rx="0.5" />
              <rect x="8" y="4" width="2" height="7" rx="0.5" />
              <rect x="12" y="2" width="2" height="9" rx="0.5" />
              <rect x="16" y="0" width="2" height="11" rx="0.5" />
            </svg>
            <div className="flex items-center gap-0.5">
              <div className="w-[20px] h-[10px] rounded-[3px] border border-current p-[1px] flex">
                <div className="bg-[#00C27A] flex-1 rounded-[1.5px]" />
              </div>
              <div className="w-[1.5px] h-[4px] bg-current rounded-r-[1px]" />
            </div>
          </div>
        </div>

        {/* SCROLLABLE APP MAIN V2 BODY FEED */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#FAFCFB] pb-24">
          
          {/* TAB: INICIO */}
          {activeTab === "inicio" && (
            <div className="px-5 pt-2 space-y-6">
              
              {/* TOP HEADER */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img 
                    src={glpyLogoSymbol} 
                    alt="GLPY" 
                    className="h-12 w-auto object-contain shrink-0" 
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="group relative p-2.5 rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition"
                  >
                    <Bell className="w-5 h-5 text-[#3D5A70]" />
                    <span className="absolute top-1 right-1 w-[15px] h-[15px] bg-[#E8445A] rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white">
                      6
                    </span>
                  </button>
                  
                  <div 
                    onClick={() => setActiveTab("perfil")} 
                    className="relative cursor-pointer transition active:scale-95 hover:opacity-90"
                  >
                    <img 
                      src={mockHomeData.user.avatarUrl}
                      alt={userName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00C27A] rounded-full border-2 border-white" />
                  </div>
                </div>
              </div>

              {/* HEADING ACCENTS AND STREAK COUNTER */}
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-extrabold text-[#0A1628] tracking-tight">Olá, {userName}! 👋</h2>
                  <p className="text-[#3D5A70] text-xs font-semibold">Foco hoje, liberdade amanhã.</p>
                </div>

                <button 
                  onClick={handleToggleCheckin}
                  className="bg-white hover:bg-emerald-50 text-[#00C27A] py-2 px-3 rounded-2xl border border-[#E2EBE7] flex items-center gap-2 hover:border-[#00C27A] transition active:scale-95 shrink-0"
                >
                  <div className="relative">
                    <Flame className="w-5 h-5 text-[#E8445A] fill-[#E8445A]" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-extrabold text-[#0D2C20] block leading-none font-mono">🔥 {streakDays} dias</span>
                    <span className="text-[9px] text-[#3D5A70] font-bold block mt-0.5">Sequência atual</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#3D5A70] ml-1" />
                </button>
              </div>

              {/* TRANSFORM PROGRESS WEIGHT PROGRESSIVE WIDGET */}
              <div className="bg-white rounded-[24px] p-4 custom-shadow border border-[#E2EBE7]/70 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-[#0A1628] leading-tight flex items-center gap-1">
                    Sua transformação está acontecendo! <span className="text-[#00C27A]">✨</span>
                  </h3>
                  <span className="text-[9px] font-bold text-[#00C27A] bg-emerald-50 px-2.5 py-0.5 rounded-full select-none">
                    Ativa
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  
                  {/* Left stats */}
                  <div className="col-span-4 space-y-0.5">
                    <p className="text-[10px] font-bold text-[#3D5A70] uppercase tracking-wider block">Você já perdeu</p>
                    <div>
                      <span className="text-2xl font-black text-[#0A1628] tracking-tight font-mono">{lostKg}</span>
                      <span className="text-xs font-bold text-[#3D5A70] ml-1">kg</span>
                    </div>
                    <p className="text-[10px] text-[#3D5A70] font-bold block">desde {mockHomeData.user.lastUpdate}</p>
                  </div>

                  {/* SVG progress circle widget */}
                  <div className="col-span-4 flex justify-center">
                    <div className="relative w-18 h-18">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#00C27A]"
                          strokeDasharray={`${progressPercent}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col justify-center items-center">
                        <span className="text-sm font-black text-[#0A1628] font-mono leading-none">{progressPercent}%</span>
                        <span className="text-[7px] text-[#3D5A70] font-bold tracking-[0.2px] uppercase mt-0.5 text-center leading-none">objetivo</span>
                      </div>
                    </div>
                  </div>

                  {/* Right remaining value box */}
                  <div className="col-span-4 text-right space-y-0.5">
                    <p className="text-[10px] font-bold text-[#3D5A70] uppercase tracking-wider block">Faltam</p>
                    <div>
                      <span className="text-2xl font-black text-[#0A1628] tracking-tight font-mono">{toGoKg}</span>
                      <span className="text-xs font-bold text-[#3D5A70] ml-1">kg</span>
                    </div>
                    <p className="text-[10px] text-[#3D5A70] font-bold block">para sua meta</p>
                  </div>
                </div>

                {/* Central slider progress bar */}
                <div className="space-y-1">
                  <div className="relative w-full h-[6px] bg-[#E2EBE7] rounded-full overflow-visible">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#00C27A] rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progressPercent}%` }}
                    />
                    <div 
                      className="absolute w-4 h-4 bg-white border-[3px] border-[#00C27A] rounded-full top-1/2 -translate-y-1/2 -ml-2 shadow-sm transition-all duration-500 ease-out"
                      style={{ left: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#3D5A70] font-bold uppercase tracking-wider">
                    <span>Início ({mockHomeData.user.weightStart} kg)</span>
                    <span>Meta ({weightGoal} kg)</span>
                  </div>
                </div>

                {/* Reorganized cards in 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  
                  {/* Peso Atual */}
                  <div 
                    onClick={() => { setWeightInput(weightCurrent.toString()); setShowWeightModal(true); }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#00C27A] hover:bg-emerald-50/20 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#00C27A] flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">Peso Atual</span>
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{weightCurrent} kg</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Flag className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">Meta</span>
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{weightGoal} kg</span>
                    </div>
                  </div>

                  {/* Altura */}
                  <div
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F5A623] flex items-center justify-center shrink-0">
                      <Ruler className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">Altura</span>
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{userHeight} m</span>
                    </div>
                  </div>

                  {/* IMC */}
                  <div
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">IMC</span>
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{bmi ?? "—"}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION: SEU ALVO METABÓLICO DE HOJE (Fase 1F.1B / Refined) */}
              <div className="bg-white rounded-[24px] p-5 custom-shadow border border-[#E2EBE7]/70 space-y-4">
                <div className="flex justify-between items-center gap-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[15px] shrink-0">🔥</span>
                    <h3 className="text-[12.5px] font-extrabold text-[#0A1628] tracking-tighter whitespace-nowrap truncate">
                      Seu alvo metabólico de hoje
                    </h3>
                  </div>
                  <span className="text-[7.5px] font-bold text-[#00C27A] bg-emerald-50 px-1.5 py-0.5 rounded-md font-mono shrink-0 select-none">
                    Proteção Metabólica
                  </span>
                </div>

                {/* Calories Highlight Card */}
                <div
                  className="bg-gradient-to-r from-orange-500/5 to-rose-500/5 border border-orange-100/40 rounded-2xl p-3 flex justify-between items-center transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600 fill-orange-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-orange-800/80 uppercase tracking-wider block leading-none mb-1">Calorias Restantes</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#0A1628] tracking-tight font-mono">1.446</span>
                        <span className="text-xs font-bold text-orange-600">kcal</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full select-none font-mono">
                    Margem Segura
                  </span>
                </div>

                {/* Three Sub-chips Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Protein Chip */}
                  <div
                    className="bg-emerald-50/60 border border-emerald-100/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition"
                  >
                    <span className="text-[9px] font-extrabold text-[#3D5A70] uppercase tracking-wider">Proteína</span>
                    <span className="text-[11px] font-black text-[#00C27A] font-mono mt-0.5 truncate w-full">
                      faltam 85g
                    </span>
                  </div>

                  {/* Water Chip */}
                  <div
                    className="bg-blue-50/60 border border-blue-100/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition"
                  >
                    <span className="text-[9px] font-extrabold text-[#3D5A70] uppercase tracking-wider">Água</span>
                    <span className="text-[11px] font-black text-blue-500 font-mono mt-0.5 truncate w-full">
                      faltam {waterRemaining.toFixed(1)}L
                    </span>
                  </div>

                  {/* Protocol Chip */}
                  <div
                    className="bg-[#00C27A]/10 border border-[#00C27A]/25 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition"
                  >
                    <span className="text-[9px] font-extrabold text-[#00C27A] uppercase tracking-wider truncate w-full">
                      {activeProtocol.name}
                    </span>
                    <span className="text-[11px] font-black text-[#0D2C20] font-mono mt-0.5">
                      Dia {activeProtocol.currentDay}/{activeProtocol.totalDays}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: EVOLUÇÃO CORPORAL VISUAL SCANNER */}
              <div className="bg-white rounded-[24px] p-4 custom-shadow border border-[#E2EBE7]/70 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#0A1628] tracking-tight">Evolução corporal</h3>
                    <span className="text-[10px] font-bold bg-[#E2EBE7] text-teal-800 px-2.5 py-0.5 rounded-full font-mono select-none">
                      -{mockHomeData.evolution.days} dias de foco
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#3D5A70]" />
                </div>

                <div className="grid grid-cols-12 gap-3 items-center">
                  
                  {/* Left values column */}
                  <div className="col-span-8 grid grid-cols-2 gap-2">
                    
                    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1.5">Cintura</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-extrabold text-[#0A1628] font-mono leading-none">{mockHomeData.evolution.cintura.current} {mockHomeData.evolution.cintura.unit}</span>
                        <span className="text-[9px] font-black text-[#00C27A] bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none shrink-0">{mockHomeData.evolution.cintura.change} cm</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1.5">Busto</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-extrabold text-[#0A1628] font-mono leading-none">{mockHomeData.evolution.busto.current} {mockHomeData.evolution.busto.unit}</span>
                        <span className="text-[9px] font-black text-[#00C27A] bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none shrink-0">{mockHomeData.evolution.busto.change} cm</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1.5">Coxa</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-extrabold text-[#0A1628] font-mono leading-none">{mockHomeData.evolution.coxa.current} {mockHomeData.evolution.coxa.unit}</span>
                        <span className="text-[9px] font-black text-[#00C27A] bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none shrink-0">{mockHomeData.evolution.coxa.change} cm</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1.5">Panturrilha</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[13px] font-extrabold text-[#0A1628] font-mono leading-none">{mockHomeData.evolution.panturrilha.current} {mockHomeData.evolution.panturrilha.unit}</span>
                        <span className="text-[9px] font-black text-[#00C27A] bg-emerald-50 px-1.5 py-0.5 rounded-md leading-none shrink-0">{mockHomeData.evolution.panturrilha.change} cm</span>
                      </div>
                    </div>

                  </div>

                  {/* Right visual indicator model with scanner overlay */}
                  <div className="col-span-4 flex justify-center items-center bg-transparent rounded-2xl relative overflow-hidden h-[155px] border border-emerald-100/40 shadow-inner group">
                    <img 
                      src="https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?auto=format&fit=crop&q=80&w=250&h=400"
                      alt="Silhueta saudável"
                      className="absolute inset-0 w-full h-full object-cover brightness-[0.85] contrast-[1.05] transition-all duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A1628]/60 opacity-65" />
                    
                    {/* Glowing Markers */}
                    {/* Busto marker */}
                    <div className="absolute top-[28%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border border-white"></span>
                      </span>
                    </div>

                    {/* Cintura marker */}
                    <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00C27A] border border-white"></span>
                      </span>
                    </div>

                    {/* Coxa marker */}
                    <div className="absolute top-[68%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-white"></span>
                      </span>
                    </div>

                    {/* Clinical scanner bar animation */}
                    <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C27A]/85 to-transparent shadow-[0_0_8px_#00C27A] animate-scanner-bar" />
                  </div>

                </div>
              </div>

              {/* SECTION: CENTRO DE PERFORMANCE */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold text-[#0A1628] tracking-tight">Centro de Performance</h3>
                  <div className="flex items-center gap-1 text-[10px] text-[#3D5A70] font-bold">
                    <span>Deslize para ver mais</span>
                    <ChevronRight className="w-3 h-3 text-[#3D5A70]" />
                  </div>
                </div>

                {/* Horizontal scrolling performance cards */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5 select-none">
                  
                  {/* Card 1: Medicação */}
                  <div
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-[#F2FAF6] rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00C27A] flex items-center justify-center shrink-0 border border-emerald-100/30">
                        <Syringe className="w-4 h-4 text-[#00C27A] stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0A1628] uppercase tracking-wide truncate">{userMedicamento}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">Próxima aplicação</span>
                      <span className="text-sm font-black text-[#0A1628] block">{mockHomeData.performance.glp1.nextDose}</span>
                    </div>

                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-[#E2EBE7]/50 text-[10px]">
                      <div>
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Dose</span>
                        <span className="font-black text-[#0a1628] font-mono">{userDose}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Efeitos</span>
                        <span className="font-extrabold text-[#00C27A] bg-emerald-50 px-1.5 py-0.5 rounded-md text-[9px] block">
                          😊 {mockHomeData.performance.glp1.sideEffect}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Atividade Física */}
                  <div
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-blue-50/20 rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/30">
                        <Dumbbell className="w-4 h-4 text-blue-500 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0A1628] uppercase tracking-wide truncate">{mockHomeData.performance.activity.name}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">Passos hoje</span>
                      <span className="text-sm font-black text-[#0A1628] block font-mono">
                        {mockHomeData.performance.activity.stepsToday} <span className="text-[10px] text-slate-400 font-bold">/ {mockHomeData.performance.activity.stepsGoal}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-[#E2EBE7]/50 text-[10px]">
                      <div>
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Treino</span>
                        <span className="font-black text-[#0a1628] font-mono">{mockHomeData.performance.activity.trainingThisWeek}/{mockHomeData.performance.activity.trainingGoal}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Foco</span>
                        <span className="font-extrabold text-[#F5A623] bg-orange-50 px-1.5 py-0.5 rounded-md text-[9px] block">
                          🔥 {mockHomeData.performance.activity.consistencyDays}d
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Suplementação */}
                  <div 
                    onClick={handleSuplementTake} 
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-purple-50/20 rounded-[22px] p-4 border border-[#E2EBE7] hover:border-purple-400 shadow-sm transition-all duration-305 flex flex-col justify-between space-y-3.5 shrink-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/30">
                        <Pill className="w-4 h-4 text-purple-600 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0A1628] uppercase tracking-wide truncate">{mockHomeData.performance.suplements.name}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">Protocolo ativo</span>
                      <span className="text-sm font-black text-[#0A1628] block">{mockHomeData.performance.suplements.activeCount} suplementos</span>
                    </div>

                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-[#E2EBE7]/50 text-[10px]">
                      <div>
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Doses</span>
                        <span className="font-black text-[#0a1628] font-mono">
                          {suplementsCount} / {mockHomeData.performance.suplements.activeCount}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Próximo</span>
                        <span className="font-extrabold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md text-[9px] block font-mono">
                          {mockHomeData.performance.suplements.nextTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Assistente IA */}
                  <div
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-violet-50/20 rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100/30">
                        <Sparkles className="w-4 h-4 text-violet-600 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0A1628] uppercase tracking-wide truncate">Assistente IA</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">Mensagens no mês</span>
                      <span className="text-sm font-black text-[#0A1628] block font-mono">
                        {dailyLimits.iaUsadas} <span className="text-[10px] text-slate-400 font-bold">/ {dailyLimits.iaLimite}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-[#E2EBE7]/50 text-[10px]">
                      <div>
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Usadas</span>
                        <span className="font-black text-[#0a1628] font-mono">{dailyLimits.iaUsadas}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Restam</span>
                        <span className="font-extrabold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md text-[9px] block font-mono">
                          {Math.max(0, dailyLimits.iaLimite - dailyLimits.iaUsadas)} msgs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Foto do Prato */}
                  <div
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-pink-50/20 rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center shrink-0 border border-pink-100/30">
                        <Camera className="w-4 h-4 text-pink-500 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0A1628] uppercase tracking-wide truncate">Foto do Prato</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">Análises hoje</span>
                      <span className="text-sm font-black text-[#0A1628] block font-mono">
                        {dailyLimits.fotosUsadas} <span className="text-[10px] text-slate-400 font-bold">/ {dailyLimits.fotosLimite}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-[#E2EBE7]/50 text-[10px]">
                      <div>
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Usadas</span>
                        <span className="font-black text-[#0a1628] font-mono">{dailyLimits.fotosUsadas}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Restam</span>
                        <span className="font-extrabold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md text-[9px] block font-mono">
                          {Math.max(0, dailyLimits.fotosLimite - dailyLimits.fotosUsadas)} fotos
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD: METAS DIÁRIAS DE NUTRIÇÃO */}
              <div className="bg-white rounded-[24px] px-3.5 py-4 custom-shadow border border-[#E2EBE7]/70 space-y-3">
                <span className="text-[13px] font-extrabold text-[#0A1628] tracking-tight block px-0.5">Metas diárias de nutrição</span>
                
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Proteína */}
                  <NutritionGoalCard
                    label="Proteína"
                    current={mockHomeData.nutrients.protein.current}
                    target={targetProteinG}
                    unit={mockHomeData.nutrients.protein.unit}
                    color="red"
                  />

                  {/* Carboidratos */}
                  <NutritionGoalCard
                    label="Carbs"
                    current={mockHomeData.nutrients.carbs.current}
                    target={targetCarbsG}
                    unit={mockHomeData.nutrients.carbs.unit}
                    color="green"
                  />

                  {/* Gordura */}
                  <NutritionGoalCard
                    label="Gordura"
                    current={mockHomeData.nutrients.fat.current}
                    target={targetFatG}
                    unit={mockHomeData.nutrients.fat.unit}
                    color="amber"
                  />

                  {/* Água */}
                  <NutritionGoalCard
                    label="Água"
                    current={waterAmount}
                    target={targetWaterL}
                    unit={mockHomeData.nutrients.water.unit}
                    color="blue"
                    onClick={handleAddWater}
                  />

                </div>
              </div>

              {/* COMPACTED ACTIONS & PROTOCOL WRAPPER (Fase 1F.1B / Refinement) */}
              <div className="space-y-2">
                
                {/* SECTION: AÇÕES RÁPIDAS ROLLER */}
                <div className="space-y-1">
                  <span className="text-[13px] font-extrabold text-[#0A1628] tracking-tight block">Ações rápidas</span>
                  
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none">
                    {mockHomeData.actions.map((act) => (
                      <button 
                        key={act.id} 
                        onClick={() => handleQuickAction(act.id)}
                        className="min-w-[52px] w-[52px] hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center space-y-0.5 shrink-0 cursor-pointer"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${act.color} shadow-xs border border-slate-50/50`}>
                          {renderActionIcon(act.icon)}
                        </div>
                        <span className="text-[9px] text-[#3D5A70] font-extrabold text-center block truncate w-full">{act.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION: PROTOCOLO EM ANDAMENTO */}
                <div className="bg-white rounded-[24px] p-4 custom-shadow border border-[#E2EBE7]/70 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-[#0A1628] tracking-tight">Protocolo em andamento</span>
                  <button 
                    onClick={() => setShowHubModal(true)} 
                    className="text-[#00C27A] text-[10px] font-bold tracking-tight uppercase hover:underline"
                  >
                    Ver todos
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-tr from-[#00C27A] to-[#00A38B] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Shield className="w-7 h-7 text-white stroke-[2.2]" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold bg-[#E2EBE7] text-emerald-800 px-2 py-0.5 rounded-full">
                        {activeProtocol.name}
                      </span>
                      <span className="text-[10px] text-[#3D5A70] font-extrabold font-mono">
                        {protocolPercent}% concluído
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-[#0A1628] block mt-1">
                      {activeProtocol.name} • Dia {activeProtocol.currentDay} de {activeProtocol.totalDays}
                    </span>
                    <div className="h-[5px] bg-[#E2EBE7] rounded-full overflow-hidden mt-1 w-full">
                      <div className="bg-[#00C27A] h-full" style={{ width: `${protocolPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Promotional direct link */}
                <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/5 rounded-2xl p-3 border border-emerald-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-extrabold text-teal-950">Acesse o GLPY HUB</h4>
                    <p className="text-[9px] text-[#3D5A70] font-bold">Protocolos, receitas e inteligência de dose.</p>
                  </div>
                  <button 
                    onClick={() => setShowHubModal(true)}
                    className="bg-[#00C27A] hover:bg-[#00A38B] text-white font-extrabold py-2 px-3.5 rounded-xl text-[10px] flex items-center gap-1.5 transition active:scale-95"
                  >
                    <span>Entrar</span>
                    <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>

              </div>
            </div>

            {/* CARD SOCIAL TRAFFIC BANNER */}
              <div
                className="bg-[#FAFCFB] rounded-2xl p-3.5 border border-dashed border-[#00C27A]/30 text-center flex items-center justify-between transition select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base text-[#00C27A]">🌍</span>
                  <span className="text-xs font-extrabold text-[#0A1628] tracking-tight">{mockHomeData.social}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

            </div>
          )}

          {/* TAB: PROTOCOLOS */}
          {activeTab === "protocolos" && (
            <div className="px-5 pt-3 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-black text-[#0A1628]">Hub de Protocolos GLPY</h2>
                <span className="text-[9px] bg-[#00C27A] text-white px-2 py-0.5 rounded-full font-bold">PREMIUM</span>
              </div>

              <div className="bg-gradient-to-br from-[#0A1628] to-[#122A4E] rounded-3xl p-5 text-white space-y-3 shadow-lg">
                <span className="text-[8px] font-bold tracking-widest bg-emerald-500/20 text-[#00C27A] px-2.5 py-1 rounded-full uppercase">Protocolos Ativos Vivos</span>
                <h3 className="text-base font-extrabold">Seu metabolismo no piloto automático</h3>
                <p className="text-xs text-slate-300 leading-relaxed">Desenvolvido com o acompanhamento médico de {userName}, ajustado para evitar a perda muscular e queda de cabelo durante o uso das Canetas.</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-[#0A1628] uppercase tracking-wider block">Disponíveis em seu plano:</h3>
                
                <div className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 items-center hover:border-[#00C27A] transition cursor-pointer">
                  <span className="text-2xl">🔥</span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#0A1628]">Sobrevivendo às Canetas</h4>
                    <p className="text-[10px] text-[#3D5A70]">Pare de sofrer nos primeiros dias de aplicação</p>
                    <div className="h-[4px] bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#00C27A]" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-[#E2EBE7] text-teal-800 px-2.5 py-0.5 rounded-full">Pronto</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 items-center hover:border-[#00C27A] transition cursor-pointer">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-[#0A1628]">Controle de Efeitos Colaterais</h4>
                    <p className="text-[10px] text-[#3D5A70]">Evitando náuseas, cansaço e constipação intestinal diariamente</p>
                    <div className="h-[4px] bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#00C27A]" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-[#E2EBE7] text-teal-800 px-2.5 py-0.5 rounded-full">Pronto</span>
                </div>

                <div className="bg-emerald-50/40 border border-[#00C27A]/30 rounded-2xl p-3 flex gap-3 items-center hover:bg-emerald-50 transition cursor-pointer">
                  <span className="text-2xl">⚖️</span>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-emerald-950">Guia Prático Anti-Rebote</h4>
                    <p className="text-[10px] text-emerald-800">Seu protocolo operacional ativo de manutenção muscular</p>
                    <div className="h-[4px] bg-emerald-100 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-[#00C27A]" style={{ width: "42%" }} />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-[#00C27A] text-white px-2.5 py-0.5 rounded-full">Ativo</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB: PROGRESSO */}
          {activeTab === "progresso" && (
            <div className="px-5 pt-3 space-y-4">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-lg font-black text-[#0A1628]">Evolução Corporal & Gráficos</h2>
              </div>

              <div className="bg-white rounded-3xl p-4 border border-slate-100 custom-shadow space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[8px] text-[#3D5A70] font-bold uppercase tracking-wider block">Total eliminado até agora</span>
                    <span className="text-xl font-black text-[#0A1628] font-mono">{lostKg} kg</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#00C27A] bg-emerald-50 px-2 py-0.5 rounded-full">No Caminho Certo</span>
                </div>

                {/* Histórico de peso */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center justify-center gap-2 text-center min-h-[80px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico de peso</span>
                  <p className="text-xs text-[#3D5A70] font-medium">Seu progresso será exibido aqui conforme você registrar novos pesos.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50/80 rounded-2xl">
                    <span className="text-slate-400 font-bold block mb-0.5 text-[9px] uppercase tracking-wider">Peso de Partida</span>
                    <span className="font-extrabold text-[#0a1628] text-base font-mono">80.0 kg</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl">
                    <span className="text-slate-400 font-bold block mb-0.5 text-[9px] uppercase tracking-wider">Meta Definida</span>
                    <span className="font-extrabold text-[#0a1628] text-base font-mono">{weightGoal} kg</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: PERFIL */}
          {activeTab === "perfil" && (
            <div className="px-5 pt-3 space-y-4">
              <div className="text-center space-y-2 py-4">
                <div className="relative inline-block mx-auto">
                  <img 
                    src={mockHomeData.user.avatarUrl}
                    alt={userName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#00C27A] rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0A1628]">{userName} Premium V2</h3>
                  <p className="text-xs text-[#00C27A] bg-[#00C27A]/10 px-3 py-1 rounded-full inline-block font-bold">Membro Premium Fundador</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block p-1">Suas Informações</span>
                
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl transition">
                  <span className="text-xs text-[#3D5A70] font-medium">Nome Completo</span>
                  <span className="text-xs font-bold text-[#0A1628]">{userName}</span>
                </div>

                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl transition">
                  <span className="text-xs text-[#3D5A70] font-medium">Medicação Atual</span>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">Ozempic 1,0mg</span>
                </div>

                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl transition">
                  <span className="text-xs text-[#3D5A70] font-medium">Altura</span>
                  <span className="text-xs font-bold text-[#0A1628]">{userHeight} m</span>
                </div>

                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl transition">
                  <span className="text-xs text-[#3D5A70] font-medium">Peso Inicial</span>
                  <span className="text-xs font-bold text-[#0A1628]">{mockHomeData.user.weightStart} kg</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAFCFB] rounded-2xl border border-dashed border-[#E2EBE7] text-center">
                <span className="text-xs font-bold block mb-1 text-slate-700">Contrato de Segurança Garantido</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">Suas informações e fotos de evolução corporal são 100% privadas e acessivas apenas em seu ambiente local de aplicativo.</p>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM FIXED premium navigation */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E2EBE7] h-[72px] px-6 py-2 flex justify-between items-center z-40">
          
          <button 
            onClick={() => { setActiveTab("inicio"); }}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === "inicio" ? "text-[#00C27A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Compass className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Início</span>
          </button>

          <button 
            onClick={() => { setActiveTab("protocolos"); }}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === "protocolos" ? "text-[#00C27A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Shield className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Protocolos</span>
          </button>

          {/* Big center action tab */}
          <button 
            onClick={() => { setShowPlusDrawer(true); }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00C27A] to-[#00A38B] flex items-center justify-center text-white shadow-lg lg:scale-105 active:scale-95 transition -translate-y-2 cursor-pointer"
          >
            <Plus className="w-6 h-6 text-white stroke-[2.8]" />
          </button>

          <button 
            onClick={() => { setActiveTab("progresso"); }}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === "progresso" ? "text-[#00C27A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LineChart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Progresso</span>
          </button>

          <button 
            onClick={() => { setActiveTab("perfil"); }}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === "perfil" ? "text-[#00C27A]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Perfil</span>
          </button>

        </div>

      </div>

      {/* WEIGHT COMPILER ADJUSTMENT MODAL */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-[#E2EBE7]">
            <h3 className="text-sm font-black text-[#0A1628] text-center mb-1">Registrar Peso Atual ⚖️</h3>
            <p className="text-[11px] text-[#3D5A70] text-center mb-4">Seu ponto inicial: {mockHomeData.user.weightStart} kg • Meta: {weightGoal} kg</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5 flex items-baseline justify-center gap-2 focus-within:border-[#00C27A] focus-within:bg-white transition">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleApplyWeight()}
                placeholder="0"
                autoFocus
                className="text-4xl font-black text-[#0A1628] font-mono w-28 text-right bg-transparent outline-none placeholder:text-slate-300"
              />
              <span className="text-lg font-bold text-[#3D5A70]">kg</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowWeightModal(false)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-[#0A1628] font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleApplyWeight}
                className="flex-1 py-2.5 text-xs bg-[#00C27A] hover:bg-[#00A38B] text-white font-extrabold rounded-xl transition shadow-sm shadow-[#00C27A]/20"
              >
                Salvar Peso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROTOCOLS POPUP LIST */}
      {showHubModal && (
        <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAFCFB] rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-[#E2EBE7] flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-[#0A1628] uppercase tracking-wider">GLPY HUB DE PROTOCOLOS</span>
              <button 
                onClick={() => setShowHubModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 no-scrollbar">
              <div className="bg-gradient-to-tr from-[#00C27A] to-[#00A38B] rounded-2xl p-4 text-white shadow-md space-y-1">
                <span className="text-[8px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full inline-block">Protocolo ativo</span>
                <h4 className="text-sm font-extrabold pt-1">{activeProtocol.name}</h4>
                <p className="text-[11px] font-bold text-white/90">Dia {activeProtocol.currentDay} de {activeProtocol.totalDays}</p>
                <div className="h-[4px] bg-white/20 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-white/70 rounded-full" style={{ width: `${protocolPercent}%` }} />
                </div>
              </div>

              <p className="text-[11px] text-[#3D5A70] leading-relaxed">
                Continue sua jornada guiada com protocolos, metas e inteligência GLPY.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => setShowHubModal(false)}
                  className="w-full p-3 bg-white rounded-xl border border-slate-100 hover:border-[#00C27A] transition flex justify-between items-center text-xs font-bold text-slate-800"
                >
                  <span>Continuar protocolo</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => setShowHubModal(false)}
                  className="w-full p-3 bg-white rounded-xl border border-slate-100 hover:border-[#00C27A] transition flex justify-between items-center text-xs font-bold text-slate-800"
                >
                  <span>Ver todos os protocolos</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={() => setShowHubModal(false)}
                  className="w-full p-3 bg-white rounded-xl border border-slate-100 hover:border-[#00C27A] transition flex justify-between items-center text-xs font-bold text-slate-800"
                >
                  <span>Falar com a IA GLPY</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK DRAWER LAUNCH */}
      {showPlusDrawer && (
        <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-[#E2EBE7]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-black text-[#0A1628] uppercase tracking-wider">Ações de registro rápido</span>
              <button onClick={() => setShowPlusDrawer(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                onClick={() => { handleAddWater(); setShowPlusDrawer(false); }}
                className="p-3 bg-blue-50/50 hover:bg-blue-50/80 rounded-xl border border-blue-100/50 flex flex-col items-center gap-1.5 transition text-xs"
              >
                <GlassWater className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-blue-800">Beber Água</span>
              </button>

              <button 
                onClick={() => { setShowPlusDrawer(false); setWeightInput(weightCurrent.toString()); setShowWeightModal(true); }}
                className="p-3 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-xl border border-emerald-100/50 flex flex-col items-center gap-1.5 transition text-xs"
              >
                <Scale className="w-5 h-5 text-[#00C27A]" />
                <span className="font-bold text-emerald-800">Registrar Peso</span>
              </button>

              <button 
                onClick={() => { handleToggleCheckin(); setShowPlusDrawer(false); }}
                className="p-3 bg-orange-50/50 hover:bg-orange-50/85 rounded-xl border border-orange-100/50 flex flex-col items-center gap-1.5 transition text-xs col-span-2"
              >
                <Flame className="w-5 h-5 text-[#E8445A]" />
                <span className="font-bold text-orange-800">Garantir Check-In Diário</span>
              </button>
            </div>

            <button 
              onClick={() => setShowPlusDrawer(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#0a1628] rounded-xl text-xs font-bold transition"
            >
              Fechar Panel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}