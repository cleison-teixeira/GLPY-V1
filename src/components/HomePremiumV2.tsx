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
  Activity,
  ArrowUpDown
} from "lucide-react";

import glpyLogoSymbol from '@/assets/logos/logo-light.png';
import { useCurrentWeight } from '../hooks/useCurrentWeight';
import { useUserOnboarding } from '../hooks/useUserOnboarding';
import { useNutritionTargets } from '../hooks/useNutritionTargets';
import { useNutritionConsumed } from '../hooks/useNutritionConsumed';
import { useActiveProtocol } from '../hooks/useActiveProtocol';
import { useDailyLimits } from '../hooks/useDailyLimits';
import { saveWeightEntry } from '../core/glpyLocalIntelligence';
import { calculateNextInjection } from '../utils/treatmentUtils';
import { formatDecimalBR, formatLiters, formatMeters, parseBRNumber } from '../utils/formatters';

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
    { id: "altura", label: "Altura", icon: "ArrowUpDown", color: "text-orange-500 bg-orange-50" },
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
  displayValue?: string;
}

function NutritionGoalCard({
  label,
  current,
  target,
  unit,
  color,
  onClick,
  displayValue,
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
        <span className="text-[9px] text-[#3D5A70] font-black uppercase tracking-wide block leading-tight">{label}</span>
        <div className="flex items-baseline mt-0.5 leading-none">
          <span className="text-sm font-black text-[#0A1628] tracking-tight">{displayValue ?? current}</span>
          <span className="text-[10px] text-slate-400 font-extrabold">/{target}{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePremiumV2() {
  // Mobile Frame States
  const [activeTab, setActiveTab] = useState<"inicio" | "protocolos" | "progresso" | "perfil">("inicio");
  
  // Tick de renderização para garantir reatividade total a qualquer mudança de storage
  const [renderTick, setRenderTick] = useState(0);
  useEffect(() => {
    const handleUpdate = () => {
      setRenderTick(t => t + 1);
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('local-storage-change', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('local-storage-change', handleUpdate);
    };
  }, []);

  // Fase 1F.2: dados reais via hooks centralizados
  const currentWeightData = useCurrentWeight();
  const onboarding = useUserOnboarding();
  const nutritionTargets = useNutritionTargets();
  const nutritionConsumed = useNutritionConsumed();
  const activeProtocol = useActiveProtocol();
  const dailyLimits = useDailyLimits();
  const protocolPercent = activeProtocol.totalDays > 0
    ? Math.min(100, Math.round((activeProtocol.currentDay / activeProtocol.totalDays) * 100))
    : 0;

  // Onboarding guard: true se o usuário completou o onboarding com dados reais
  const hasValidProfile = (() => {
    try {
      const raw = localStorage.getItem('glpy_onboarding');
      if (!raw) return false;
      const onb = JSON.parse(raw);
      const peso = parseFloat(String(onb.peso_atual ?? onb.pesoAtual ?? ''));
      const alt  = parseFloat(String(onb.altura ?? ''));
      return !isNaN(peso) && peso > 0 && !isNaN(alt) && alt > 0;
    } catch { return false; }
  })();

  // Medidas corporais reais: true somente se existir pelo menos um valor válido salvo
  const hasRealBodyMeasurements = (() => {
    try {
      const raw = localStorage.getItem('glpy_medidas_corporais');
      if (!raw) return false;
      const m = JSON.parse(raw);
      if (!m || typeof m !== 'object') return false;
      return ['cintura', 'busto', 'coxa', 'panturrilha', 'quadril', 'braco'].some(k => {
        const v = parseFloat(String(m[k] ?? ''));
        return !isNaN(v) && v > 0;
      });
    } catch { return false; }
  })();

  // Protocolo real: true somente se o usuário realmente iniciou um protocolo
  const hasRealActiveProtocol = (() => {
    try {
      for (const key of ['glpy_protocol_day_today', 'glpy_protocol_context', 'glpy_protocolo_ativo']) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const p = JSON.parse(raw);
        const name = String(p?.protocolName ?? p?.nome ?? '').trim();
        if (name) return true;
      }
      return false;
    } catch { return false; }
  })();

  // Reactivity unchained: weightCurrent e weightGoal dinâmicos a partir de hooks e cascades
  const weightCurrent = currentWeightData.weight;
  
  const weightGoal = (() => {
    try {
      const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
      const onbMeta = parseFloat(String(onb.pesoMeta ?? ''));
      if (!isNaN(onbMeta) && onbMeta > 0) return onbMeta;
      const onbSonho = parseFloat(String(onb.peso_sonho ?? ''));
      if (!isNaN(onbSonho) && onbSonho > 0) return onbSonho;
    } catch {}

    const directMeta = onboarding.pesoMeta;
    if (directMeta > 0) return directMeta;

    const fromKey = parseFloat(localStorage.getItem('glpy_peso_sonho') ?? '');
    if (!isNaN(fromKey) && fromKey > 0) return fromKey;

    return 60.0; // Fallback mock final
  })();

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
  const [waterAmount, setWaterAmount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('glpy_agua_hoje');
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      const today = new Date().toISOString().slice(0, 10);
      if (parsed && typeof parsed === 'object' && parsed.date === today) {
        return parseFloat(String(parsed.amount)) || 0;
      }
      return 0;
    } catch { return 0; }
  });

  // Re-sync waterAmount when localStorage changes (e.g., after saving in WaterScreen)
  useEffect(() => {
    const syncWater = () => {
      try {
        const raw = localStorage.getItem('glpy_agua_hoje');
        if (!raw) { setWaterAmount(0); return; }
        const parsed = JSON.parse(raw);
        const today = new Date().toISOString().slice(0, 10);
        if (parsed && typeof parsed === 'object' && parsed.date === today) {
          setWaterAmount(parseFloat(String(parsed.amount)) || 0);
        } else {
          setWaterAmount(0);
        }
      } catch {}
    };
    window.addEventListener('local-storage-change', syncWater);
    window.addEventListener('storage', syncWater);
    return () => {
      window.removeEventListener('local-storage-change', syncWater);
      window.removeEventListener('storage', syncWater);
    };
  }, []);

  // Streak de consecutividade real calculada dinamicamente
  const streakDays = (() => {
    try {
      const raw = localStorage.getItem('glpy_checkin_historico');
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return 0;
      
      const dates = parsed.map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.date) return item.date;
        return '';
      }).filter(Boolean);

      const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
      if (uniqueDates.length === 0) return 0;

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const hasToday = uniqueDates.includes(todayStr);
      const hasYesterday = uniqueDates.includes(yesterdayStr);

      if (!hasToday && !hasYesterday) {
        return 0;
      }

      let streak = 0;
      let currentCheckDate = new Date(hasToday ? todayStr : yesterdayStr);

      while (true) {
        const checkStr = currentCheckDate.toISOString().split('T')[0];
        if (uniqueDates.includes(checkStr)) {
          streak++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch {
      return 0;
    }
  })();

  // Validação dinâmica se check-in foi realizado hoje
  const isCheckInDone = (() => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const rawHoje = localStorage.getItem('glpy_checkin_hoje');
      if (rawHoje) {
        const parsed = JSON.parse(rawHoje);
        if (parsed && (parsed === todayStr || parsed.date === todayStr)) {
          return true;
        }
      }
    } catch {}

    try {
      const rawHist = localStorage.getItem('glpy_checkin_historico');
      if (rawHist) {
        const parsedHist = JSON.parse(rawHist);
        if (Array.isArray(parsedHist)) {
          return parsedHist.some(item => {
            if (typeof item === 'string') return item === todayStr;
            if (item && typeof item === 'object') return item.date === todayStr;
            return false;
          });
        }
      }
    } catch {}

    return false;
  })();

  const [bodyMeasures] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('glpy_medidas_corporais') || '{}') ?? {}; }
    catch { return {}; }
  });
  const [suplementsCount, setSuplementsCount] = useState<number>(mockHomeData.performance.suplements.takenToday);

  // Atividade física registrada no dia atual
  const [todayActivity, setTodayActivity] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('glpy_atividade_hoje');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      const entryDate = parsed.savedAt ? new Date(parsed.savedAt).toISOString().split('T')[0] : '';
      if (entryDate === today) {
        return parsed;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    const handleUpdateActivity = () => {
      try {
        const raw = localStorage.getItem('glpy_atividade_hoje');
        if (!raw) {
          setTodayActivity(null);
          return;
        }
        const parsed = JSON.parse(raw);
        const today = new Date().toISOString().split('T')[0];
        const entryDate = parsed.savedAt ? new Date(parsed.savedAt).toISOString().split('T')[0] : '';
        if (entryDate === today) {
          setTodayActivity(parsed);
        } else {
          setTodayActivity(null);
        }
      } catch {
        setTodayActivity(null);
      }
    };
    window.addEventListener('storage', handleUpdateActivity);
    window.addEventListener('local-storage-change', handleUpdateActivity);
    return () => {
      window.removeEventListener('storage', handleUpdateActivity);
      window.removeEventListener('local-storage-change', handleUpdateActivity);
    };
  }, []);

  // Popups & modals
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [weightInput, setWeightInput] = useState<string>(() => String(currentWeightData.weight));
  const [showGoalModal,  setShowGoalModal]  = useState<boolean>(false);
  const [goalInput,      setGoalInput]      = useState<string>('');
  const [showHeightModal, setShowHeightModal] = useState<boolean>(false);
  const [heightInput, setHeightInput] = useState<string>('');
  const [toasts, setToasts] = useState<QuickToast[]>([]);
  const [confettis, setConfettis] = useState<ConfettiParticle[]>([]);

  // Próxima aplicação de medicamento dinâmica
  const nextInj = calculateNextInjection();

  const displayNextDose = (() => {
    if (nextInj.nextDateFormatted === "Configure") return "Configure";
    if (nextInj.daysRemainingText === "Hoje") return "Hoje";
    if (nextInj.daysRemainingText === "Atrasada") return "Atrasada";
    return `${nextInj.nextDateFormatted} (${nextInj.daysRemainingText})`;
  })();

  // Computed weights — weightStart lido do dados reais do usuário
  const weightStart = (() => {
    try {
      const rs = JSON.parse(localStorage.getItem('glpy_results_summary') || '{}');
      const rsWeight = parseFloat(String(rs.initialWeight ?? ''));
      if (!isNaN(rsWeight) && rsWeight > 0) return rsWeight;
    } catch {}

    try {
      const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
      const onbInitial = parseFloat(String(onb.pesoInicial ?? ''));
      if (!isNaN(onbInitial) && onbInitial > 0) return onbInitial;
      const onbAtual = parseFloat(String(onb.peso_atual ?? ''));
      if (!isNaN(onbAtual) && onbAtual > 0) return onbAtual;
    } catch {}

    const directOnb = onboarding.pesoInicial;
    if (directOnb > 0) return directOnb;

    return weightCurrent; // sem mock — usuário novo parte do peso atual
  })();

  const weightGaining = weightCurrent >= weightStart;
  const lostKg = parseFloat(Math.max(0, weightStart - weightCurrent).toFixed(1));
  const toGoKg = parseFloat(Math.max(0, weightCurrent - weightGoal).toFixed(1));

  const totalRange = weightStart - weightGoal;
  let progressPercent = 0;
  if (weightGaining) {
    progressPercent = 0;
  } else if (totalRange > 0) {
    progressPercent = Math.min(100, Math.max(0, Math.round(((weightStart - weightCurrent) / totalRange) * 100)));
  } else {
    progressPercent = weightCurrent <= weightGoal ? 100 : 0;
  }

  // Data da última pesagem real
  const lastWeightDateText = (() => {
    if (currentWeightData.timestamp) {
      try {
        const d = new Date(currentWeightData.timestamp);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}/${month}/${year}`;
        }
      } catch {}
    }
    return '12/05/2024';
  })();
  const bmi = userHeight > 0
    ? parseFloat((weightCurrent / (userHeight * userHeight)).toFixed(1))
    : null;
  const bmiLabel = bmi === null ? "—"
    : bmi < 18.5 ? "Abaixo do peso"
    : bmi < 25 ? "Normal"
    : bmi < 30 ? "Sobrepeso"
    : "Obesidade";
  const waterRemaining = Math.max(0, targetWaterL - waterAmount);

  // Navigation helper
  const goTo = (path: string) => { window.location.href = path; };

  // Protocol name → preview route
  const PROTOCOL_ROUTE_MAP: Record<string, string> = {
    'Sobrevivendo às Canetas': '/preview/protocolo1',
    sobrevivendoCanetas: '/preview/protocolo1',
    'Efeitos Colaterais': '/preview/protocolo2',
    efeitosColaterais: '/preview/protocolo2',
    'Anti-Queda Capilar': '/preview/protocolo3',
    antiQuedaCabelo: '/preview/protocolo3',
    'Anti-Rebote': '/preview/protocolo4',
    antiRebote: '/preview/protocolo4',
    'anti-rebote': '/preview/protocolo4',
    'Psicologia Emagrecimento': '/preview/protocolo5',
    psicologiaEmagrecimento: '/preview/protocolo5',
    'Alimentação Baixo Apetite': '/preview/protocolo6',
    alimentacaoBaixoApetite: '/preview/protocolo6',
    'Não Perca Músculos': '/preview/protocolo7',
    naoPerdaMusculos: '/preview/protocolo7',
    'Energia Baixa': '/preview/protocolo8',
    energiaBaixa: '/preview/protocolo8',
    'Ajuste Metabólico': '/preview/protocolo9',
    ajusteMetabolico: '/preview/protocolo9',
    'Transição Parar': '/preview/protocolo10',
    transicaoParar: '/preview/protocolo10',
  };

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
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('glpy_agua_hoje', JSON.stringify({ amount: newWater, date: today, updatedAt: new Date().toISOString() }));
      window.dispatchEvent(new Event('local-storage-change'));
      triggerToast(`💧 Registro de Água: +250ml salvos! Agora: ${newWater}L`);
      if (newWater >= targetWaterL) {
        triggerConfetti();
        triggerToast(`🎉 Excelente, ${userName}! Meta de hidratação atingida!`);
      }
    }
  };

  const handleApplyWeight = () => {
    const numeric = parseFloat(weightInput.replace(',', '.'));
    if (!isNaN(numeric) && numeric > 20 && numeric < 300) {
      saveWeightEntry({ weight: numeric });
      window.dispatchEvent(new Event('local-storage-change'));
      setShowWeightModal(false);
      triggerConfetti();
      triggerToast(`⚖️ Peso atualizado para ${numeric} kg! Continue no foco.`);
    } else {
      triggerToast("Digite um peso válido coerente!");
    }
  };

  const handleApplyGoal = () => {
    const numericGoal = parseFloat(goalInput.replace(',', '.'));
    if (!isNaN(numericGoal) && numericGoal > 20 && numericGoal < 300) {
      try {
        const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
        onb.pesoMeta   = numericGoal;
        onb.peso_sonho = numericGoal;
        onb.peso_meta  = numericGoal;
        localStorage.setItem('glpy_onboarding', JSON.stringify(onb));
        localStorage.setItem('glpy_peso_sonho', numericGoal.toFixed(1));
      } catch {}
      window.dispatchEvent(new Event('local-storage-change'));
      setShowGoalModal(false);
      triggerToast(`🎯 Meta atualizada para ${numericGoal} kg!`);
    } else {
      triggerToast("Digite uma meta de peso válida.");
    }
  };

  const handleApplyHeight = () => {
    const s = heightInput.trim().replace(',', '.');
    let numeric = parseFloat(s);
    if (!isNaN(numeric) && numeric > 0) {
      if (numeric > 3) numeric = parseFloat((numeric / 100).toFixed(2));
      try {
        const onb = JSON.parse(localStorage.getItem('glpy_onboarding') || '{}');
        onb.altura = numeric;
        localStorage.setItem('glpy_onboarding', JSON.stringify(onb));
        localStorage.setItem('glpy_altura', numeric.toFixed(2));
      } catch {}
      window.dispatchEvent(new Event('local-storage-change'));
      setShowHeightModal(false);
      triggerToast(`📏 Altura atualizada para ${numeric.toFixed(2).replace('.', ',')} m!`);
    } else {
      triggerToast("Digite uma altura válida (ex: 1,65 ou 165).");
    }
  };

  const handleToggleCheckin = () => {
    goTo('/preview/check-in');
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
      case "ArrowUpDown": return <ArrowUpDown className="w-[18px] h-[18px] text-orange-500" />;
      default: return <Sparkles className="w-[18px] h-[18px] text-emerald-500" />;
    }
  };

  // Safe callback trigger matching simulated keys
  const handleQuickAction = (id: string) => {
    const QUICK_ROUTES: Record<string, string> = {
      agua:     '/preview/water',
      refeicao: '/preview/food-log',
      emocao:   '/preview/emotion',
      medida:   '/preview/body-measurements',
      aplicacao:'/preview/injection',
      foto:     '/preview/photo-timeline',
      checkin:  '/preview/check-in',
    };
    if (id === 'peso') {
      setWeightInput(formatDecimalBR(weightCurrent));
      setShowWeightModal(true);
    } else if (id === 'altura') {
      const h = userHeight > 0 ? userHeight.toFixed(2).replace('.', ',') : '';
      setHeightInput(h);
      setShowHeightModal(true);
    } else if (QUICK_ROUTES[id]) {
      goTo(QUICK_ROUTES[id]);
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

        {/* METRICS & STATUS NOTCH BAR — só no frame desktop; mobile usa a barra real do sistema */}
        <div className="bg-[#FAFCFB] text-[#0A1628] h-[44px] px-6 shrink-0 hidden sm:flex justify-between items-center z-40 select-none relative">
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
                  className={`py-2 px-3 rounded-2xl border flex items-center gap-2 transition active:scale-95 shrink-0 ${isCheckInDone ? 'bg-emerald-50 border-[#00C27A] text-[#00C27A]' : 'bg-white hover:bg-emerald-50 border-[#E2EBE7] hover:border-[#00C27A] text-[#00C27A]'}`}
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
                {!hasValidProfile ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-[#0A1628] leading-tight">
                        Sua jornada GLPY ainda não começou
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full select-none">
                        Pendente
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3D5A70] font-medium leading-relaxed">
                      Complete seu perfil metabólico para liberar sua meta, evolução corporal e plano de proteção anti-rebote.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Peso Atual', 'Meta', 'Altura', 'IMC'] as const).map(l => (
                        <div key={l} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="min-w-0">
                            <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">{l}</span>
                            <span className="text-xs font-black text-slate-300 font-mono block mt-1">—</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { window.location.href = '/'; }}
                      className="w-full bg-[#00C27A] text-white text-sm font-extrabold py-3 rounded-2xl active:opacity-80 transition"
                    >
                      Começar agora
                    </button>
                  </div>
                ) : (
                <>
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
                    {weightGaining ? (
                      <>
                        <p className="text-[10px] font-bold text-[#3D5A70] uppercase tracking-wider block">Ajuste em</p>
                        <div>
                          <span className="text-xl font-black text-[#0A1628] tracking-tight">andamento</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-bold text-[#3D5A70] uppercase tracking-wider block">Você já perdeu</p>
                        <div>
                          <span className="text-2xl font-black text-[#0A1628] tracking-tight font-mono">{formatDecimalBR(lostKg)}</span>
                          <span className="text-xs font-bold text-[#3D5A70] ml-1">kg</span>
                        </div>
                      </>
                    )}
                    <p className="text-[10px] text-[#3D5A70] font-bold block">desde {lastWeightDateText}</p>
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
                      <span className="text-2xl font-black text-[#0A1628] tracking-tight font-mono">{formatDecimalBR(toGoKg)}</span>
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
                    <span>Início ({formatDecimalBR(weightStart)} kg)</span>
                    <span>Meta ({formatDecimalBR(weightGoal)} kg)</span>
                  </div>
                </div>

                {/* Reorganized cards in 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  
                  {/* Peso Atual */}
                  <div
                    onClick={() => { setWeightInput(formatDecimalBR(weightCurrent)); setShowWeightModal(true); }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#00C27A] hover:bg-emerald-50/20 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#00C27A] flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">Peso Atual</span>
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{formatDecimalBR(weightCurrent)} kg</span>
                    </div>
                  </div>

                  {/* Meta — clicável → abre modal de meta */}
                  <div
                    onClick={() => { setGoalInput(formatDecimalBR(weightGoal)); setShowGoalModal(true); }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 transition cursor-pointer active:opacity-70 hover:border-blue-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Flag className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">Meta</span>
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{formatDecimalBR(weightGoal)} kg</span>
                    </div>
                  </div>

                  {/* Altura — clicável → abre modal de altura */}
                  <div
                    onClick={() => { const h = userHeight > 0 ? userHeight.toFixed(2).replace('.', ',') : ''; setHeightInput(h); setShowHeightModal(true); }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 transition cursor-pointer active:opacity-70 hover:border-orange-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F5A623] flex items-center justify-center shrink-0">
                      <Ruler className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#3D5A70] font-extrabold block uppercase leading-none truncate">Altura</span>
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{userHeight > 0 ? formatMeters(userHeight) : '—'}</span>
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
                      <span className="text-xs font-black text-[#0A1628] font-mono block mt-1">{bmi !== null ? formatDecimalBR(bmi) : '—'}</span>
                    </div>
                  </div>

                </div>
                </>
                )}
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

                {!hasValidProfile && (
                  <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1.5">
                      <p className="text-xs font-extrabold text-[#0A1628]">Complete seu perfil para calcular suas metas</p>
                      <p className="text-[10px] text-[#3D5A70] font-medium leading-relaxed">
                        Suas metas de calorias, proteínas, água e proteção anti-rebote serão geradas após o onboarding.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Calorias', 'Proteínas', 'Água'] as const).map(l => (
                        <div key={l} className="bg-slate-50/60 border border-slate-100/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                          <span className="text-[9px] font-extrabold text-[#3D5A70] uppercase tracking-wider">{l}</span>
                          <span className="text-[11px] font-black text-slate-300 font-mono mt-0.5">—</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50/60 border border-slate-100/40 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Protocolo aguardando perfil</span>
                    </div>
                  </div>
                )}

                {hasValidProfile && (<>

                {/* Calories Highlight Card */}
                <div
                  className="bg-gradient-to-r from-orange-500/5 to-rose-500/5 border border-orange-100/40 rounded-2xl p-3 flex justify-between items-center transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600 fill-orange-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-orange-800/80 uppercase tracking-wider block leading-none mb-1">Alvo Calórico do Dia</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#0A1628] tracking-tight font-mono">
                          {(nutritionTargets?.adjustedCaloriesTarget ?? 1446).toLocaleString('pt-BR')}
                        </span>
                        <span className="text-xs font-bold text-orange-600">kcal</span>
                      </div>
                      {(nutritionTargets?.activityCaloriesBurned ?? 0) > 0 && (
                        <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">
                          +{nutritionTargets!.activityCaloriesBurned} kcal atividade
                        </span>
                      )}
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
                    <span className="text-[9px] font-extrabold text-[#3D5A70] uppercase tracking-wider">Proteínas</span>
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
                      faltam {formatLiters(waterRemaining)}L
                    </span>
                  </div>

                  {/* Protocol Chip */}
                  <div
                    className="bg-[#00C27A]/10 border border-[#00C27A]/25 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition"
                  >
                    <span className="text-[9px] font-extrabold text-[#00C27A] uppercase tracking-wider truncate w-full">
                      {hasRealActiveProtocol ? activeProtocol.name : 'PROTOCOLO'}
                    </span>
                    <span className="text-[11px] font-black text-[#0D2C20] font-mono mt-0.5">
                      {hasRealActiveProtocol
                        ? `Dia ${activeProtocol.currentDay}/${activeProtocol.totalDays}`
                        : 'Dia 0/7'}
                    </span>
                  </div>
                </div>
                </>)}
              </div>

              {/* SECTION: EVOLUÇÃO CORPORAL VISUAL SCANNER */}
              <div
                onClick={() => goTo('/preview/body-measurements')}
                className="bg-white rounded-[24px] px-4 pt-3 pb-3 custom-shadow border border-[#E2EBE7]/70 space-y-2 cursor-pointer active:opacity-80 transition"
              >
                {!hasRealBodyMeasurements ? (
                  <div className="space-y-3 py-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-[#0A1628] tracking-tight">Evolução corporal</h3>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full select-none">Pendente</span>
                    </div>
                    <p className="text-[11px] text-[#3D5A70] font-medium leading-relaxed">
                      Registre suas primeiras medidas para acompanhar sua evolução.
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Cintura', 'Busto', 'Coxa', 'Panturrilha'] as const).map(l => (
                        <div key={l} className="p-2 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between">
                          <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1">{l}</span>
                          <span className="text-[12px] font-extrabold text-slate-300 font-mono leading-none">— cm</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.location.href = '/preview/body-measurements'; }}
                      className="w-full text-[10px] font-extrabold text-[#00C27A] uppercase tracking-wide py-1 text-center"
                    >
                      Registrar medidas
                    </button>
                  </div>
                ) : (
                <>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-sm font-extrabold text-[#0A1628] tracking-tight">Evolução corporal</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#3D5A70] mt-0.5 shrink-0" />
                </div>

                <div className="grid grid-cols-12 gap-2 items-stretch">

                  {/* Left values column — stretch para preencher a altura da foto */}
                  <div className="col-span-8 grid grid-cols-2 gap-1.5 auto-rows-fr">

                    <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1">Cintura</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12px] font-extrabold text-[#0A1628] font-mono leading-none whitespace-nowrap">{(() => { const v = parseBRNumber(bodyMeasures.cintura || ''); return (isNaN(v) || v <= 0) ? '—' : formatDecimalBR(v); })()} cm</span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1">Busto</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12px] font-extrabold text-[#0A1628] font-mono leading-none whitespace-nowrap">{(() => { const v = parseBRNumber(bodyMeasures.busto || bodyMeasures.chest || ''); return (isNaN(v) || v <= 0) ? '—' : formatDecimalBR(v); })()} cm</span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1">Coxa</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12px] font-extrabold text-[#0A1628] font-mono leading-none whitespace-nowrap">{(() => { const v = parseBRNumber(bodyMeasures.coxa || bodyMeasures.thigh || ''); return (isNaN(v) || v <= 0) ? '—' : formatDecimalBR(v); })()} cm</span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[8px] text-[#3D5A70] font-bold block uppercase leading-none tracking-wide mb-1">Quadril</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[12px] font-extrabold text-[#0A1628] font-mono leading-none whitespace-nowrap">{(() => { const v = parseBRNumber(bodyMeasures.quadril || bodyMeasures.hip || ''); return (isNaN(v) || v <= 0) ? '—' : formatDecimalBR(v); })()} cm</span>
                      </div>
                    </div>

                  </div>

                  {/* Right visual indicator model with scanner overlay */}
                  <div className="col-span-4 flex justify-center items-center bg-transparent rounded-2xl relative overflow-hidden h-[140px] border border-emerald-100/40 shadow-inner group">
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
                </>
                )}
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
                    onClick={() => goTo('/preview/treatment-settings')}
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-[#F2FAF6] rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0 cursor-pointer active:opacity-80 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00C27A] flex items-center justify-center shrink-0 border border-emerald-100/30">
                        <Syringe className="w-4 h-4 text-[#00C27A] stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0A1628] uppercase tracking-wide truncate">{userMedicamento}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">Próxima aplicação</span>
                      <span className="text-sm font-black text-[#0A1628] block">{displayNextDose}</span>
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
                    onClick={() => goTo('/preview/activity')}
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-blue-50/20 rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0 cursor-pointer active:opacity-80 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/30">
                        <Dumbbell className="w-4 h-4 text-blue-500 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-[#0A1628] uppercase tracking-wide truncate">{mockHomeData.performance.activity.name}</span>
                    </div>

                    {todayActivity ? (
                      <>
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">
                            {todayActivity.activity.charAt(0).toUpperCase() + todayActivity.activity.slice(1)}
                          </span>
                          <span className="text-sm font-black text-[#0A1628] block font-mono">
                            {todayActivity.duration} min
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-white/60 backdrop-blur-xs p-2 rounded-xl border border-[#E2EBE7]/50 text-[10px]">
                          <div>
                            <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Esforço</span>
                            <span className="font-black text-[#0a1628]">{todayActivity.intensity}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#3D5A70] block font-bold uppercase leading-none mb-1">Gasto</span>
                            <span className="font-extrabold text-[#E8445A] bg-red-50 px-1.5 py-0.5 rounded-md text-[9px] block">
                              🔥 {todayActivity.calories} kcal
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#3D5A70] block font-bold uppercase tracking-wider leading-none">Nenhuma atividade hoje</span>
                          <span className="text-sm font-black text-slate-300 block font-mono">—</span>
                        </div>

                        <div
                          className="flex items-center justify-center bg-blue-50/60 p-2 rounded-xl border border-blue-100/30 text-[10px] cursor-pointer active:opacity-70"
                          onClick={() => goTo('/preview/activity')}
                        >
                          <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wide">+ Registrar movimento</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card 3: Suplementação */}
                  <div
                    onClick={() => goTo('/preview/supplements')}
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
                    onClick={() => goTo('/preview/chat-ia')}
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-violet-50/20 rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0 cursor-pointer active:opacity-80 transition"
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
                    onClick={() => goTo('/preview/food-photo')}
                    className="min-w-[200px] w-[200px] bg-gradient-to-b from-white to-pink-50/20 rounded-[22px] p-4 border border-[#E2EBE7] shadow-sm flex flex-col justify-between space-y-3.5 shrink-0 cursor-pointer active:opacity-80 transition"
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
                
                {!hasValidProfile ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                    <p className="text-[10px] font-extrabold text-slate-400">Complete seu perfil para liberar suas metas.</p>
                  </div>
                ) : (
                <div className="grid grid-cols-2 gap-2.5">

                  {/* Proteínas */}
                  <NutritionGoalCard
                    label="Proteínas"
                    current={nutritionConsumed.consumedProtein}
                    target={targetProteinG}
                    unit={mockHomeData.nutrients.protein.unit}
                    color="red"
                  />

                  {/* Carboidratos */}
                  <NutritionGoalCard
                    label="Carboidratos"
                    current={nutritionConsumed.consumedCarbs}
                    target={targetCarbsG}
                    unit={mockHomeData.nutrients.carbs.unit}
                    color="green"
                  />

                  {/* Gordura */}
                  <NutritionGoalCard
                    label="Gordura"
                    current={nutritionConsumed.consumedFat}
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
                    displayValue={formatLiters(waterAmount)}
                  />

                </div>
                )}
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

                {!hasRealActiveProtocol ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-extrabold text-[#0A1628] tracking-tight">Protocolo em andamento</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-[52px] h-[52px] rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Shield className="w-7 h-7 text-slate-300 stroke-[2.2]" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                            Aguardando início
                          </span>
                          <span className="text-[10px] text-slate-400 font-extrabold font-mono">0% concluído</span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-500 block mt-1">
                          Protocolo aguardando início • Dia 0 de 7
                        </span>
                        <div className="h-[5px] bg-[#E2EBE7] rounded-full overflow-hidden mt-1 w-full">
                          <div className="bg-[#00C27A] h-full" style={{ width: '0%' }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#3D5A70] font-medium">
                      Escolha um protocolo para iniciar sua jornada GLPY.
                    </p>
                    <button
                      onClick={() => goTo('/preview/protocols')}
                      className="w-full bg-[#00C27A] text-white text-sm font-extrabold py-2.5 rounded-2xl active:opacity-80 transition"
                    >
                      Começar agora
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-extrabold text-[#0A1628] tracking-tight">Protocolo em andamento</span>
                      <button
                        onClick={() => goTo('/preview/protocols')}
                        className="text-[#00C27A] text-[10px] font-bold tracking-tight uppercase hover:underline"
                      >
                        Ver todos
                      </button>
                    </div>

                    <div
                      onClick={() => goTo(PROTOCOL_ROUTE_MAP[activeProtocol.name] ?? '/preview/protocols')}
                      className="flex items-center gap-3 cursor-pointer active:opacity-80 transition"
                    >
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
                        onClick={() => goTo('/preview/protocols')}
                        className="bg-[#00C27A] hover:bg-[#00A38B] text-white font-extrabold py-2 px-3.5 rounded-xl text-[10px] flex items-center gap-1.5 transition active:scale-95"
                      >
                        <span>Entrar</span>
                        <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* CARD SOCIAL TRAFFIC BANNER */}
              <div
                onClick={() => {
                  if (!hasValidProfile) { window.location.href = '/'; }
                  else { goTo('/preview/protocols'); }
                }}
                className="bg-[#FAFCFB] rounded-2xl p-3.5 border border-dashed border-[#00C27A]/30 text-center flex items-center justify-between transition select-none cursor-pointer active:opacity-80"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base text-[#00C27A]">🌍</span>
                  <span className="text-xs font-extrabold text-[#0A1628] tracking-tight">
                    {(hasValidProfile && hasRealActiveProtocol)
                      ? mockHomeData.social
                      : hasValidProfile
                        ? 'Inicie um protocolo para entrar na jornada GLPY.'
                        : 'Complete seu perfil para entrar na jornada GLPY.'}
                  </span>
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
                    <span className="text-[8px] text-[#3D5A70] font-bold uppercase tracking-wider block">
                      {weightGaining ? 'Ajuste em andamento' : 'Total eliminado até agora'}
                    </span>
                    <span className="text-xl font-black text-[#0A1628] font-mono">
                      {weightGaining ? '—' : `${formatDecimalBR(lostKg)} kg`}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#00C27A] bg-emerald-50 px-2 py-0.5 rounded-full">
                    {weightGaining ? 'Em Ajuste' : 'No Caminho Certo'}
                  </span>
                </div>

                {/* Histórico de peso */}
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center justify-center gap-2 text-center min-h-[80px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico de peso</span>
                  <p className="text-xs text-[#3D5A70] font-medium">Seu progresso será exibido aqui conforme você registrar novos pesos.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50/80 rounded-2xl">
                    <span className="text-slate-400 font-bold block mb-0.5 text-[9px] uppercase tracking-wider">Peso de Partida</span>
                    <span className="font-extrabold text-[#0a1628] text-base font-mono">{formatDecimalBR(weightStart)} kg</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl">
                    <span className="text-slate-400 font-bold block mb-0.5 text-[9px] uppercase tracking-wider">Meta Definida</span>
                    <span className="font-extrabold text-[#0a1628] text-base font-mono">{formatDecimalBR(weightGoal)} kg</span>
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
                  <span className="text-xs font-bold text-[#0A1628]">{userHeight > 0 ? formatMeters(userHeight) : '—'}</span>
                </div>

                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl transition">
                  <span className="text-xs text-[#3D5A70] font-medium">Peso Inicial</span>
                  <span className="text-xs font-bold text-[#0A1628]">{formatDecimalBR(weightStart)} kg</span>
                </div>
              </div>

              <button
                onClick={() => goTo('/preview/body-profile')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E2EBE7] shadow-xs hover:shadow-sm hover:border-[#00C27A]/30 transition active:opacity-70"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00C27A]/10 flex items-center justify-center">
                    <Ruler className="w-4 h-4 text-[#00C27A] stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-[#0A1628]">Editar perfil corporal</span>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>

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
            onClick={() => goTo('/preview/protocols')}
            className="flex flex-col items-center justify-center w-12 h-12 transition text-slate-400 hover:text-slate-600"
          >
            <Shield className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Protocolos</span>
          </button>

          {/* Big center action tab */}
          <button
            onClick={() => goTo('/preview/quick-actions')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00C27A] to-[#00A38B] flex items-center justify-center text-white shadow-lg lg:scale-105 active:scale-95 transition -translate-y-2 cursor-pointer"
          >
            <Plus className="w-6 h-6 text-white stroke-[2.8]" />
          </button>

          <button
            onClick={() => goTo('/preview/results')}
            className="flex flex-col items-center justify-center w-12 h-12 transition text-slate-400 hover:text-slate-600"
          >
            <LineChart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Progresso</span>
          </button>

          <button
            onClick={() => { setActiveTab("perfil"); }}
            className="flex flex-col items-center justify-center w-12 h-12 transition"
          >
            <img
              src={mockHomeData.user.avatarUrl}
              alt="Perfil"
              className={`w-6 h-6 rounded-full object-cover border-2 transition ${activeTab === "perfil" ? "border-[#00C27A]" : "border-slate-300"}`}
            />
            <span className={`text-[9px] font-bold mt-1 ${activeTab === "perfil" ? "text-[#00C27A]" : "text-slate-400"}`}>Perfil</span>
          </button>

        </div>

      </div>

      {/* PESO ATUAL MODAL */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-[#E2EBE7]">
            <h3 className="text-sm font-black text-[#0A1628] text-center mb-1">Registrar peso ⚖️</h3>
            <p className="text-[11px] text-[#3D5A70] text-center mb-4">Início: {formatDecimalBR(weightStart)} kg • Meta atual: {formatDecimalBR(weightGoal)} kg</p>

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
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALTURA MODAL */}
      {showHeightModal && (
        <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-[#E2EBE7]">
            <h3 className="text-sm font-black text-[#0A1628] text-center mb-1">Atualizar altura 📏</h3>
            <p className="text-[11px] text-[#3D5A70] text-center mb-4">Em metros (ex: 1,65) ou centímetros (ex: 165).</p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5 flex items-baseline justify-center gap-2 focus-within:border-[#00C27A] focus-within:bg-white transition">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={heightInput}
                onChange={e => setHeightInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleApplyHeight()}
                placeholder="1,65"
                autoFocus
                className="text-4xl font-black text-[#0A1628] font-mono w-28 text-right bg-transparent outline-none placeholder:text-slate-300"
              />
              <span className="text-lg font-bold text-[#3D5A70]">m</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowHeightModal(false)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-[#0A1628] font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyHeight}
                className="flex-1 py-2.5 text-xs bg-[#00C27A] hover:bg-[#00A38B] text-white font-extrabold rounded-xl transition shadow-sm shadow-[#00C27A]/20"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* META DE PESO MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-[#0A1628]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-5 shadow-2xl border border-[#E2EBE7]">
            <h3 className="text-sm font-black text-[#0A1628] text-center mb-1">Atualizar meta 🎯</h3>
            <p className="text-[11px] text-[#3D5A70] text-center mb-4">Defina o peso que você deseja alcançar com segurança.</p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5 flex items-baseline justify-center gap-2 focus-within:border-[#00C27A] focus-within:bg-white transition">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleApplyGoal()}
                placeholder={formatDecimalBR(weightGoal)}
                autoFocus
                className="text-4xl font-black text-[#0A1628] font-mono w-28 text-right bg-transparent outline-none placeholder:text-slate-300"
              />
              <span className="text-lg font-bold text-[#3D5A70]">kg</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-[#0A1628] font-bold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyGoal}
                className="flex-1 py-2.5 text-xs bg-[#00C27A] hover:bg-[#00A38B] text-white font-extrabold rounded-xl transition shadow-sm shadow-[#00C27A]/20"
              >
                Salvar meta
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}