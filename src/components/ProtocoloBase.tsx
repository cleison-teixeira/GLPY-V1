import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Award, Share2 } from "lucide-react";
import BottomNav from "./BottomNav";
import { GLPYHeader } from "./ui";
import { dispararConfetti, dispararConfettiFinal } from "../utils/confetti";
import { playSound } from "../utils/sounds";
import { salvarProgressoProtocolo, carregarProgressoProtocolo, saveProtocolProgress } from "../services/firestore";
import { saveProtocolContext, saveProtocolDayTracking } from "../core/glpyLocalIntelligence";
import { glpyStore } from "../data/glpyStore";
import { glpyBlackBox } from "../data/glpyBlackBox";
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from "../data/glpyEventCatalog";
import { classifyMission, missionTypeToSignal, syncMissionToStore, detectCravingSignal, getMissionActionSuggestion } from "../data/glpyMissionBridge";
import { getLocalDateKey } from "../utils/formatters";
import { useNutritionTargets } from "../hooks/useNutritionTargets";


export interface Receita {
  id: number;
  emoji: string;
  nome: string;
  kcal: number;
  proteina: number;
  carbs: number;
  gordura: number;
  categoria: string;
  desc: string;
  ingredientes: string[];
  preparo: string;
  glp1tip: string;
  dias: number[];
}

export interface Dia {
  n: number;
  titulo: string;
  video: string;
  explicacao: string;
  missoes: { texto: string; sub: string }[];
  checkin: string[];
  ia: Record<string, string>;
  receita_id: number;
  recompensa: string;
  xp: number;
}

const PROTOCOL_POSTERS: Record<string, string> = {
  sobrevivendoCanetas:     '/protocol-posters/sobrevivendo-canetas.png',
  efeitosColaterais:       '/protocol-posters/controle-efeitos-colaterais.png',
  antiQuedaCabelo:         '/protocol-posters/anti-queda-cabelo.png',
  psicologiaEmagrecimento: '/protocol-posters/psicologia-emagrecimento.png',
  alimentacaoBaixoApetite: '/protocol-posters/alimentacao-baixo-apetite.png',
  naoPerdaMusculos:        '/protocol-posters/nao-perca-musculo.png',
  energiaBaixa:            '/protocol-posters/energia-baixa.png',
  ajusteMetabolico:        '/protocol-posters/ajuste-metabolico.png',
  transicaoParar:          '/protocol-posters/transicao-caneta.png',
};
const DEFAULT_PROTOCOL_POSTER = '/protocol-posters/anti-rebote.png';

const STORAGE_KEY_TO_ID: Record<string, string> = {
  "glpy_sobrevivendo": "sobrevivendoCanetas",
  "glpy_efeitos": "efeitosColaterais",
  "glpy_cabelo": "antiQuedaCabelo",
  "glpy_psicologia": "psicologiaEmagrecimento",
  "glpy_baixoapetite": "alimentacaoBaixoApetite",
  "glpy_musculos": "naoPerdaMusculos",
  "glpy_energia": "energiaBaixa",
  "glpy_metabolico": "ajusteMetabolico",
  "glpy_transicao": "transicaoParar",
};

interface Props {
  n: number;
  emoji: string;
  nome: string;
  storageKey: string;
  receitas: Receita[];
  dias: Dia[];
  videos: Record<number, string>;
  firestoreId?: string;
  onNavigate: (screen: string) => void;
}

export default function ProtocoloBase({ n, emoji, nome, storageKey, receitas, dias, videos, firestoreId, onNavigate }: Props) {
  // Em rotas /preview/protocolo* não alteramos localStorage de produção nem chamamos Firestore
  const isPreviewMode = window.location.pathname.startsWith('/preview/protocolo');

  const protocoloId = STORAGE_KEY_TO_ID[storageKey] ?? storageKey;
  const posterUrl = PROTOCOL_POSTERS[protocoloId] ?? DEFAULT_PROTOCOL_POSTER;
  const progressoKey = `glpy_protocolo_${protocoloId}_progresso`;

  const [diaAtual, setDiaAtual] = useState<number>(() =>
    parseInt(localStorage.getItem(`${storageKey}_dia`) || "0", 10)
  );
  const [aba, setAba] = useState<"protocolo" | "receitas">("protocolo");
  const [checkinSelecionado, setCheckinSelecionado] = useState<string | null>(null);
  const [missoesMarcadas, setMissoesMarcadas] = useState<number[]>(() => {
    const s = localStorage.getItem(`${storageKey}_missoes`);
    return s ? JSON.parse(s) : [];
  });
  const [concluido, setConcluido] = useState(false);
  const [receitaAberta, setReceitaAberta] = useState<number | null>(null);
  const [diasConcluidos, setDiasConcluidos] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(progressoKey);
      return raw ? (JSON.parse(raw).diasConcluidos || []) : [];
    } catch { return []; }
  });
  const [dataUltimoCheck, setDataUltimoCheck] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem(progressoKey);
      return raw ? (JSON.parse(raw).dataUltimoCheck || null) : null;
    } catch { return null; }
  });
  const [protocoloConcluido, setProtocoloConcluido] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpValor, setXpValor] = useState(0);
  const [videoAssistido, setVideoAssistido] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { localStorage.setItem(`${storageKey}_dia`, String(diaAtual)); }, [diaAtual, storageKey]);
  useEffect(() => { localStorage.setItem(`${storageKey}_missoes`, JSON.stringify(missoesMarcadas)); }, [missoesMarcadas, storageKey]);
  useEffect(() => {
    if (isPreviewMode) return; // Preview: não altera protocolo ativo nem chama Firestore
    try {
      const existing = glpyStore.protocol.getActive() ?? {};
      glpyStore.protocol.saveActive({ ...existing, id: protocoloId, nome, emoji, totalDias: dias.length, dia: diaAtual } as any);
    } catch {}
    // Sempre atualizar qual protocolo está ativo em glpy_protocol_day_today ao abrir
    // (sem guard de jaConcluidoHoje — garante que Home e botão (+) reflitam o protocolo correto)
    saveProtocolDayTracking({
      protocolId: protocoloId,
      protocolName: nome,
      protocolEmoji: emoji,
      totalDays: dias.length,
      day: dias[Math.min(diaAtual, dias.length - 1)]?.n ?? (diaAtual + 1),
      dayStatus: "em_andamento",
    });
    saveProtocolProgress({
      protocoloId,
      protocoloNome: nome,
      diaAtual: diaAtual + 1,
      totalDias: dias.length,
    }).catch(() => {});
    glpyBlackBox.addEvent({
      type: EVENT_TYPES.PROTOCOL_STARTED, category: CATEGORIES.PROTOCOL, domain: DOMAINS.ADHERENCE,
      signal: SIGNALS.PROTOCOL_STARTED, screen: 'ProtocoloBase', source: 'manual',
      payload: { protocolId: protocoloId, protocolName: nome },
    });
    glpyBlackBox.addEvent({
      type: EVENT_TYPES.PROTOCOL_DAY_OPENED, category: CATEGORIES.PROTOCOL, domain: DOMAINS.ADHERENCE,
      signal: SIGNALS.PROTOCOL_DAY_OPENED, screen: 'ProtocoloBase', source: 'manual',
      payload: { protocolId: protocoloId, day: diaAtual + 1 },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Firestore load (apenas quando firestoreId é fornecido)
  useEffect(() => {
    if (!firestoreId || isPreviewMode) return; // Preview: não carrega do Firestore
    carregarProgressoProtocolo(firestoreId)
      .then(data => {
        if (data) {
          const diaCarregado = (data.diasCompletos && data.diasCompletos.length > 0)
            ? Math.min(Math.max(...data.diasCompletos) + 1, 7)
            : (data.diaAtual ?? 0);
          setDiaAtual(diaCarregado);
          setDiasConcluidos(data.diasCompletos);
          // espelha no localStorage para que o ProtocolHub leia corretamente
          try {
            const raw = localStorage.getItem(progressoKey);
            const existing = raw ? JSON.parse(raw) : {};
            localStorage.setItem(progressoKey, JSON.stringify({
              ...existing,
              diaAtual: diaCarregado,
              diasConcluidos: data.diasCompletos,
            }));
            localStorage.setItem(`${storageKey}_dia`, String(diaCarregado));
          } catch {}
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nutritionTargets = useNutritionTargets();
  const metas = (() => {
    if (nutritionTargets) {
      return {
        kcal:     nutritionTargets.caloriesTarget,
        proteina: nutritionTargets.proteinGrams,
        gordura:  nutritionTargets.fatGrams,
        carbs:    nutritionTargets.carbsGrams,
        agua:     Math.round(nutritionTargets.waterLiters * 1000),
      };
    }
    const _p = parseFloat(localStorage.getItem("glpy_peso_atual") || "75");
    const _k = Math.max(800, Math.round((10 * _p + 6.25 * 165 - 5 * 30 - 161) * 1.2 - 500));
    const _pr = Math.round(_p * 1.8);
    const _g = Math.round((_k * 0.25) / 9);
    return { kcal: _k, proteina: _pr, gordura: _g, carbs: Math.round((_k - _pr * 4 - _g * 9) / 4), agua: Math.round(_p * 35) };
  })();

  const formatMissao = (texto: string) =>
    texto.replace("{proteina}", String(metas.proteina)).replace("{agua}", String(metas.agua));

  const buildProtocolDayPackage = (dayIdx: number) => {
    const d = dias[dayIdx];
    if (!d) return null;
    const r = receitas.find(rec => rec.id === d.receita_id) || null;
    const hoje_ = getLocalDateKey();
    const isDayDone = diasConcluidos.includes(dayIdx);
    const isCurrentViewedDay = dayIdx === diaAtual;
    let status: 'em_andamento' | 'concluido' | 'bloqueado' | 'pendente';
    if (isDayDone) { status = 'concluido'; }
    else if (isCurrentViewedDay && dataUltimoCheck !== hoje_) { status = 'em_andamento'; }
    else if (dayIdx > diaAtual) { status = 'bloqueado'; }
    else { status = 'pendente'; }
    const missions = d.missoes.map((m, i) => ({
      title: formatMissao(m.texto),
      description: formatMissao(m.sub),
      completed: isCurrentViewedDay ? missoesMarcadas.includes(i) : isDayDone,
    }));
    let selectedCheckin: string | null = isCurrentViewedDay
      ? (checkinSelecionado ? formatMissao(checkinSelecionado) : null)
      : null;
    if (!isCurrentViewedDay && isDayDone) {
      try {
        const last = JSON.parse(localStorage.getItem('glpy_protocol_checkin_last') || 'null');
        if (last?.protocolId === protocoloId && last?.day === d.n)
          selectedCheckin = last.checkin ? formatMissao(last.checkin) : null;
      } catch {}
    }
    return {
      protocolId: protocoloId, protocolName: nome,
      day: d.n, totalDays: dias.length, title: d.titulo, status, missions,
      checkinsAvailable: d.checkin.map(c => formatMissao(c)), selectedCheckin,
      recipe: r ? { title: r.nome, kcal: r.kcal, protein: r.proteina, carbs: r.carbs, fat: r.gordura } : null,
    };
  };

  useEffect(() => {
    try {
      const prevIdx = diaAtual - 1;
      const nextIdx = diaAtual + 1;
      localStorage.setItem('glpy_protocol_context_v1', JSON.stringify({
        protocolId: protocoloId, protocolName: nome,
        previousDay: prevIdx >= 0 ? buildProtocolDayPackage(prevIdx) : null,
        currentDay: buildProtocolDayPackage(diaAtual),
        nextDay: nextIdx < dias.length ? buildProtocolDayPackage(nextIdx) : null,
        updatedAt: new Date().toISOString(),
      }));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaAtual, diasConcluidos, missoesMarcadas, checkinSelecionado, concluido, dataUltimoCheck, metas.proteina, metas.agua]);

  const videoUrl = videos[diaAtual + 1] ?? "";

  const handlePlay = () => {
    setVideoAssistido(true);
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    v?.requestFullscreen?.() ?? v?.webkitEnterFullscreen?.();
  };

  useEffect(() => { setVideoStarted(false); }, [diaAtual]);

  const diaIndex = Math.min(Math.max(diaAtual, 0), dias.length - 1);
  const dia = dias[diaIndex];
  if (!dia) return <div>Carregando...</div>;
  const receita = receitas.find(r => r.id === dia.receita_id);
  const receitaDetalhe = receitaAberta !== null ? receitas.find(r => r.id === receitaAberta) : null;

  const hoje = getLocalDateKey();
  const jaConcluidoHoje = dataUltimoCheck === hoje;
  const globalLock = (() => { try { return JSON.parse(localStorage.getItem('glpy_protocol_global_daily_lock') || 'null'); } catch { return null; } })();
  const bloqueadoPorOutroProtocolo = globalLock?.date === hoje && globalLock?.protocolId !== protocoloId;
  const diaJaFeito = diasConcluidos.includes(diaAtual);

  const buildProtocolMissions = (marked: number[]) =>
    dia.missoes.map((m, i) => ({
      id: `${protocoloId}-dia-${dia.n}-missao-${i + 1}`,
      texto: formatMissao(m.texto),
      sub: formatMissao(m.sub),
      status: marked.includes(i) ? "concluida" as const : "pendente" as const,
    }));

  const buildBehavioralSignals = (marked: number[], checkin: string | null) => {
    const missionSignals = buildProtocolMissions(marked)
      .filter(m => m.status === "concluida")
      .map(m => `Missão concluída: ${m.texto}`);
    return checkin ? [...missionSignals, `Check-in selecionado: ${checkin}`] : missionSignals;
  };

  const persistProtocolDay = (
    marked: number[] = missoesMarcadas,
    checkin: string | null = checkinSelecionado,
    status: "em_andamento" | "concluido" | "bloqueado" | "pendente" = "em_andamento",
    xpEarned?: number
  ) => {
    saveProtocolContext({
      id: protocoloId,
      nome,
      emoji,
      totalDias: dias.length,
      dia: dia.n,
      missoesConcluidas: marked.length,
      missoesTexto: dia.missoes.map(m => formatMissao(m.texto)),
    });
    saveProtocolDayTracking({
      protocolId: protocoloId,
      protocolName: nome,
      protocolEmoji: emoji,
      totalDays: dias.length,
      day: dia.n,
      missions: buildProtocolMissions(marked),
      selectedCheckins: checkin ? [formatMissao(checkin)] : [],
      recipeOfDay: receita ? {
        id: receita.id,
        emoji: receita.emoji,
        nome: receita.nome,
        kcal: receita.kcal,
        proteina: receita.proteina,
        carbs: receita.carbs,
        gordura: receita.gordura,
        categoria: receita.categoria,
      } : null,
      dayStatus: status,
      xpEarned,
      behavioralSignals: buildBehavioralSignals(marked, checkin),
    });
  };

  useEffect(() => {
    if (jaConcluidoHoje && !concluido) return;
    persistProtocolDay(missoesMarcadas, checkinSelecionado, concluido ? "concluido" : "em_andamento", concluido ? dia.xp : undefined);
  }, [diaAtual, receita?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMissao = (i: number) => {
    if (jaConcluidoHoje || diaJaFeito || bloqueadoPorOutroProtocolo) return;
    const isChecking  = !missoesMarcadas.includes(i);
    const missionTitle = dia.missoes[i]?.texto ?? '';
    const missionId   = `${protocoloId}-dia-${dia.n}-missao-${i + 1}`;
    const missionType = classifyMission(missionTitle);

    if (isChecking) {
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.MISSION_COMPLETED, category: CATEGORIES.MISSION, domain: DOMAINS.ADHERENCE,
        signal: missionTypeToSignal(missionType), screen: 'ProtocoloBase', source: 'protocol_mission',
        payload: { protocolId: protocoloId, day: dia.n, missionId, missionType },
      });
      // Sinergia real: sincroniza com glpyStore apenas quando há valor numérico explícito no texto.
      // Missões de hidratação (water) NÃO sincronizam automaticamente — usuário registra água
      // pela ação própria na Home. Marcar a missão apenas marca o checklist do protocolo.
      const missionTextFormatted = formatMissao(missionTitle);
      const syncResult = missionType === 'hydration'
        ? { synced: false, syncType: 'none' as const }
        : syncMissionToStore(missionType, missionTextFormatted, true, {
            protocolId: protocoloId,
            day: dia.n,
            missionId,
          });
      if (syncResult.synced && syncResult.syncType === 'meal') {
        glpyBlackBox.addEvent({
          type: EVENT_TYPES.MISSION_SYNCED_TO_MEAL, category: CATEGORIES.MISSION, domain: DOMAINS.NUTRITION,
          signal: SIGNALS.MISSION_SYNCED_TO_MEAL, screen: 'ProtocoloBase', source: 'protocol_mission',
          payload: { protocolId: protocoloId, day: dia.n, missionId, reason: syncResult.reason },
        });
        window.dispatchEvent(new Event('local-storage-change'));
      } else if (syncResult.synced && syncResult.syncType === 'water') {
        glpyBlackBox.addEvent({
          type: EVENT_TYPES.MISSION_SYNCED_TO_WATER, category: CATEGORIES.MISSION, domain: DOMAINS.METABOLISM,
          signal: SIGNALS.MISSION_SYNCED_TO_WATER, screen: 'ProtocoloBase', source: 'protocol_mission',
          payload: { protocolId: protocoloId, day: dia.n, missionId, reason: syncResult.reason },
        });
        window.dispatchEvent(new Event('local-storage-change'));
      } else if (syncResult.synced && syncResult.syncType === 'activity') {
        glpyBlackBox.addEvent({
          type: EVENT_TYPES.MISSION_SYNCED_TO_ACTIVITY, category: CATEGORIES.MISSION, domain: DOMAINS.MOVEMENT,
          signal: SIGNALS.MISSION_SYNCED_TO_ACTIVITY, screen: 'ProtocoloBase', source: 'protocol_mission',
          payload: { protocolId: protocoloId, day: dia.n, missionId, reason: syncResult.reason },
        });
        window.dispatchEvent(new Event('local-storage-change'));
      } else if (!syncResult.synced) {
        glpyBlackBox.addEvent({
          type: EVENT_TYPES.MISSION_WITHOUT_REAL_RECORD, category: CATEGORIES.MISSION, domain: DOMAINS.ADHERENCE,
          signal: SIGNALS.MISSION_WITHOUT_REAL_RECORD, screen: 'ProtocoloBase', source: 'protocol_mission',
          payload: { protocolId: protocoloId, day: dia.n, missionId, missionType },
        });
      }
      // Registra sugestão de navegação quando missão não criou registro automático
      const actionSuggestion = getMissionActionSuggestion(missionType);
      if (actionSuggestion.suggestScreen && !syncResult.synced) {
        glpyBlackBox.addEvent({
          type: EVENT_TYPES.MISSION_REQUIRES_REAL_RECORD, category: CATEGORIES.MISSION, domain: DOMAINS.ADHERENCE,
          signal: SIGNALS.MISSION_REQUIRES_REAL_RECORD, screen: 'ProtocoloBase', source: 'protocol_mission',
          payload: { protocolId: protocoloId, day: dia.n, missionId, missionType, suggestScreen: actionSuggestion.suggestScreen },
        });
      }
    } else {
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.MISSION_UNCHECKED, category: CATEGORIES.MISSION, domain: DOMAINS.ADHERENCE,
        signal: SIGNALS.MISSION_UNCHECKED, screen: 'ProtocoloBase', source: 'protocol_mission',
        payload: { protocolId: protocoloId, day: dia.n, missionId },
      });
    }

    setMissoesMarcadas(prev => {
      const next = prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
      persistProtocolDay(next, checkinSelecionado, "em_andamento");
      return next;
    });
  };

  const handleSelectCheckin = (option: string) => {
    if (jaConcluidoHoje || diaJaFeito || bloqueadoPorOutroProtocolo) return;
    setCheckinSelecionado(option);
    persistProtocolDay(missoesMarcadas, option, "em_andamento");
    // Detecta craving no texto da opção selecionada e emite evento comportamental
    const cravingSignal = detectCravingSignal(option);
    if (cravingSignal) {
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.CRAVING_REPORTED, category: CATEGORIES.SYMPTOM, domain: DOMAINS.PSYCHOLOGY,
        signal: cravingSignal, screen: 'ProtocoloBase', source: 'protocol_checkin',
        payload: { protocolId: protocoloId, day: dia.n },
      });
    }
  };

  const handleConcluir = () => {
    if (jaConcluidoHoje || diaJaFeito || bloqueadoPorOutroProtocolo) return;
    playSound('concluir');
    const xpDia = dia.xp ?? 30;
    const agora = getLocalDateKey();
    persistProtocolDay(missoesMarcadas, checkinSelecionado, "concluido", xpDia);
    setDataUltimoCheck(agora);
    setConcluido(true);

    // Persiste check-in específico do protocolo para a IA
    localStorage.setItem('glpy_protocol_checkin_last', JSON.stringify({
      protocolId: protocoloId,
      protocolName: nome,
      day: dia.n,
      date: agora,
      checkin: checkinSelecionado ? formatMissao(checkinSelecionado) : null,
    }));
    try {
      localStorage.setItem('glpy_protocol_global_daily_lock', JSON.stringify({
        date: agora,
        protocolId: protocoloId,
        protocolName: nome,
        day: dia.n,
        completedAt: agora,
      }));
    } catch {}

    // Persiste missões do próximo dia para a IA responder "amanhã"
    const nextDayIdx = diaAtual + 1;
    const nextDia = dias[nextDayIdx];
    if (nextDia) {
      localStorage.setItem('glpy_protocol_next_day', JSON.stringify({
        protocolId: protocoloId,
        day: nextDia.n,
        missions: nextDia.missoes.map(m => formatMissao(m.texto)),
      }));
    }

    setCheckinSelecionado(null);
    setMissoesMarcadas([]);

    // XP float + confetti
    setXpValor(xpDia);
    setShowXP(true);
    setTimeout(() => setShowXP(false), 1500);
    if (diaAtual === 6) { dispararConfettiFinal(); } else { dispararConfetti(); }

    const diaCompletado = diaAtual;
    const novasConcluidas = (diasConcluidos.includes(diaCompletado) ? diasConcluidos : [...diasConcluidos, diaCompletado]).slice(0, 7);
    setDiasConcluidos(novasConcluidas);

    const proximoDiaIdx = Math.min(diaAtual + 1, 7);

    // Avança o estado local imediatamente (garante que o remount carregue o dia certo)
    setDiaAtual(proximoDiaIdx);
    localStorage.setItem(`${storageKey}_dia`, String(proximoDiaIdx));

    const dataInicio = (() => {
      try { return JSON.parse(localStorage.getItem(progressoKey) || "{}").dataInicio || agora; } catch { return agora; }
    })();
    localStorage.setItem(progressoKey, JSON.stringify({
      diaAtual: proximoDiaIdx,
      diasConcluidos: novasConcluidas,
      dataUltimoCheck: agora,
      dataInicio,
    }));

    localStorage.setItem("glpy_checkin_from_protocol", JSON.stringify({
      protocolo: nome,
      dia: diaAtual + 1,
      xp_ganho: xpDia,
    }));

    // Salva no Firestore (apenas quando firestoreId é fornecido)
    if (firestoreId) {
      salvarProgressoProtocolo(firestoreId, {
        diaAtual: proximoDiaIdx,
        dataUltimoCheck: agora,
        diasCompletos: novasConcluidas,
      }).catch((err) => console.error('[Protocolo] erro Firestore:', err));
    }

    if (diaAtual === 6) {
      glpyStore.protocol.removeActive();
      setProtocoloConcluido(true);
    }
    setTimeout(() => {
      if (onNavigate) onNavigate('checkin');
    }, 1500);
  };

  const handleShare = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const el = document.getElementById("protocol-share-card");
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "progresso-glpy.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: `${emoji} ${nome} — Dia ${diaAtual + 1}/7`, files: [file] });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "progresso-glpy.png"; a.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch {}
  };

  const proximoDia = () => {
    if (diaAtual < 6) {
      const novoDia = diaAtual + 1;
      setDiaAtual(novoDia);
      setConcluido(false);
      setCheckinSelecionado(null);
      setMissoesMarcadas([]);
      try {
        const raw = localStorage.getItem(progressoKey);
        const prev = raw ? JSON.parse(raw) : {};
        localStorage.setItem(progressoKey, JSON.stringify({ ...prev, diaAtual: novoDia }));
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24 max-w-[430px] mx-auto md:rounded-[40px] md:ring-1 md:ring-black/10 md:shadow-[0_24px_64px_rgba(0,0,0,0.14)] md:overflow-hidden">

      {/* XP flutuante */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 bg-primary text-white font-black text-2xl px-6 py-3 rounded-2xl shadow-xl pointer-events-none"
          >
            +{xpValor} XP ⚡
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Global */}
      <div id="protocol-share-card" className="bg-white px-5 pt-6 pb-4 border-b border-border">
        <div className="mb-3">
          <GLPYHeader
            title={`${emoji} ${nome}`}
            subtitle={`Protocolo ${n}`}
            showBranding={true}
            onBack={() => onNavigate("protocolHub")}
            rightAction={
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                  Dia {diaAtual + 1}/7
                </div>
                <button onClick={handleShare} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            }
          />
        </div>

        <div className="flex gap-1.5">
          {dias.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i > diaAtual) return; // dia futuro — bloqueado até concluir o atual
                setDiaAtual(i); setConcluido(false); setCheckinSelecionado(null); setMissoesMarcadas([]);
              }}
              className={`h-2 flex-1 rounded-full transition-all ${i <= diaAtual ? "bg-primary" : "bg-border opacity-40 cursor-not-allowed"}`}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          {(["protocolo", "receitas"] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${aba === a ? "bg-primary text-white" : "bg-[#F4F6F8] text-text-muted"}`}>
              {a === "protocolo" ? "📋 Protocolo" : "🍳 Receitas"}
            </button>
          ))}
        </div>
      </div>

      {/* Metas */}
      <div className="px-5 pt-4">
        <div className="bg-white border border-border rounded-2xl p-3 mb-4 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Suas metas de hoje</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Kcal", value: metas.kcal, color: "text-red-500" },
              { label: "Prot", value: `${metas.proteina}g`, color: "text-primary" },
              { label: "Gord", value: `${metas.gordura}g`, color: "text-violet-500" },
              { label: "Água", value: `${Math.round(metas.agua / 1000 * 10) / 10}L`, color: "text-sky-500" },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className={`font-black text-base ${m.color}`}>{m.value}</p>
                <p className="text-xs text-text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {aba === "protocolo" && (
          <motion.div key="protocolo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 space-y-4 pb-4">

            <div className="bg-[#0A1628] rounded-2xl p-4">
              <p className="text-xs text-primary font-bold mb-1">Dia {dia.n}</p>
              <h2 className="font-bold text-white text-base leading-snug">{dia.titulo}</h2>
            </div>

            {videoUrl ? (
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', minHeight: '180px' }}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  {...({ 'webkit-playsinline': 'true' } as Record<string, string>)}
                  preload="none"
                  onPlay={handlePlay}
                  style={{
                    width: '100%',
                    minHeight: '420px',
                    maxHeight: '60vh',
                    borderRadius: '16px',
                    background: '#0A1628',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,194,122,0.15)',
                    display: 'block',
                  }}
                />
                {!videoStarted && (
                  <div
                    onClick={() => { setVideoStarted(true); videoRef.current?.play(); }}
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '16px',
                      background: `linear-gradient(rgba(10,22,40,0.60) 0%, rgba(10,22,40,0.72) 100%), url('${posterUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', zIndex: 2,
                      minHeight: '420px', maxHeight: '60vh',
                    }}
                  >
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      border: '2.5px solid #6AD28F',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      <div style={{
                        width: 0, height: 0, borderStyle: 'solid',
                        borderWidth: '12px 0 12px 22px',
                        borderColor: 'transparent transparent transparent #6AD28F',
                        marginLeft: 4,
                      }} />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'system-ui,sans-serif', margin: 0 }}>
                      GLPY · Toque para assistir
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl bg-[#0A1628]" style={{ minHeight: '420px', maxHeight: '60vh' }}>
                <p className="text-white/60 text-sm">Vídeo em breve 🎬</p>
              </div>
            )}

            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Por que isso importa</p>
              <p className="text-sm text-text-main leading-relaxed">{dia.explicacao}</p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Missões do dia</p>
              <div className="space-y-2.5">
                {dia.missoes.map((m, i) => {
                  const done = missoesMarcadas.includes(i);
                  const mType = classifyMission(m.texto);
                  const suggestion = getMissionActionSuggestion(mType);
                  return (
                    <div key={i}>
                      <motion.button whileTap={{ scale: 0.98 }} onClick={() => toggleMissao(i)}
                        className={`w-full flex gap-3 p-3 rounded-xl border text-left transition-all ${done ? "bg-primary/5 border-primary/20" : "bg-[#F4F6F8] border-transparent"}`}>
                        {done
                          ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          : <Circle className="w-5 h-5 text-border flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className={`text-sm font-semibold ${done ? "line-through text-text-muted" : "text-text-main"}`}>{formatMissao(m.texto)}</p>
                          <p className="text-xs text-text-muted mt-0.5">{formatMissao(m.sub)}</p>
                        </div>
                      </motion.button>
                      <AnimatePresence>
                        {done && suggestion.suggestScreen && mType !== 'hydration' && (
                          <motion.button
                            key={`action-${i}`}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => {
                              glpyBlackBox.addEvent({
                                type: EVENT_TYPES.MISSION_ACTION_SUGGESTED, category: CATEGORIES.MISSION, domain: DOMAINS.ADHERENCE,
                                signal: SIGNALS.MISSION_ACTION_SUGGESTED, screen: 'ProtocoloBase', source: 'protocol_mission',
                                payload: { missionType: mType, suggestScreen: suggestion.suggestScreen },
                              });
                              onNavigate(suggestion.suggestScreen!);
                            }}
                            className="mt-1.5 ml-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/8 border border-primary/20 rounded-full hover:bg-primary/15 transition-colors"
                          >
                            → {suggestion.actionLabel}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#E6FBF3] border border-primary/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Receita do dia</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{receita.emoji}</span>
                <div className="flex-grow">
                  <p className="font-bold text-sm text-text-main">{receita?.nome}</p>
                  <p className="text-xs text-text-muted">{receita.kcal} kcal · {receita.proteina}g prot</p>
                </div>
                <button onClick={() => { setReceitaAberta(receita.id); setAba("receitas"); }}
                  className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-full">
                  Ver →
                </button>
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Check-in do dia</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {dia.checkin.map(opt => (
                  <button key={opt} onClick={() => handleSelectCheckin(opt)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${checkinSelecionado === opt ? "bg-primary text-white border-primary" : "bg-[#F4F6F8] border-transparent text-text-main"}`}>
                    {formatMissao(opt)}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {checkinSelecionado && dia.ia[checkinSelecionado] && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                    <div className="flex gap-2 mb-1"><span>🤖</span><span className="text-xs font-bold text-primary">GLPY.IA</span></div>
                    <p className="text-xs text-text-main leading-relaxed">{dia.ia[checkinSelecionado]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-bold text-amber-700 text-sm">{dia.recompensa}</p>
                <p className="text-xs text-amber-600 mt-0.5">+{dia.xp} XP ao concluir</p>
              </div>
            </div>

            {diaJaFeito && !concluido ? (
              // Dia já concluído anteriormente (navegou de volta via barra)
              <div className="bg-primary/5 border border-primary/15 rounded-2xl py-4 text-center">
                <p className="font-bold text-primary text-sm">✅ Dia {dia.n} já concluído</p>
                <p className="text-xs text-text-muted mt-1">Selecione outro dia na barra acima</p>
              </div>
            ) : concluido ? (
              // Acabou de concluir nesta sessão
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center">
                  {protocoloConcluido ? (
                    <>
                      <p className="font-bold text-primary text-lg">🏆 Protocolo concluído!</p>
                      <p className="text-xs text-text-muted mt-1">Indo para o check-in... 📋</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-primary">🏆 +{dia.xp} XP conquistados!</p>
                      <p className="text-xs text-text-muted mt-1">Indo para o check-in... 📋</p>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (jaConcluidoHoje || bloqueadoPorOutroProtocolo) ? (
              // Bloqueado até amanhã
              <div className="w-full bg-[#F4F6F8] border border-border rounded-2xl py-4 text-center">
                {diaAtual >= dias.length ? (
                  <>
                    <p className="text-sm font-semibold text-text-muted">🏆 Protocolo finalizado</p>
                    <p className="text-xs text-text-muted mt-1">Você concluiu este protocolo. Amanhã você poderá iniciar uma nova jornada ou escolher o próximo protocolo.</p>
                  </>
                ) : bloqueadoPorOutroProtocolo && !jaConcluidoHoje ? (
                  <>
                    <p className="text-sm font-semibold text-text-muted">✅ Você já cumpriu seu protocolo de hoje</p>
                    <p className="text-xs text-text-muted mt-1">Volte amanhã para continuar</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-text-muted">⏰ Volte amanhã para continuar</p>
                    <p className="text-xs text-text-muted mt-1">1 dia por dia — você já cumpriu o de hoje</p>
                  </>
                )}
              </div>
            ) : (
              // Disponível para completar
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleConcluir}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base">
                ✅ Concluir Dia {dia.n}
              </motion.button>
            )}
          </motion.div>
        )}

        {aba === "receitas" && (
          <motion.div key="receitas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4 space-y-3 pt-2">
            {receitaDetalhe ? (
              <div className="space-y-3">
                <button onClick={() => setReceitaAberta(null)} className="flex items-center gap-2 text-sm text-text-muted font-medium">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                  <div className="text-center mb-4">
                    <span className="text-5xl">{receitaDetalhe.emoji}</span>
                    <h2 className="font-bold text-xl mt-2">{receitaDetalhe?.nome}</h2>
                    <p className="text-xs text-text-muted mt-1">{receitaDetalhe.categoria}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: "Kcal", v: receitaDetalhe.kcal, c: "text-red-500", bg: "bg-red-50" },
                      { l: "Prot", v: `${receitaDetalhe.proteina}g`, c: "text-primary", bg: "bg-primary/8" },
                      { l: "Carbs", v: `${receitaDetalhe.carbs}g`, c: "text-amber-500", bg: "bg-amber-50" },
                      { l: "Gord", v: `${receitaDetalhe.gordura}g`, c: "text-violet-500", bg: "bg-violet-50" },
                    ].map(m => (
                      <div key={m.l} className={`${m.bg} rounded-xl p-2.5 text-center`}>
                        <p className={`font-black text-base ${m.c}`}>{m.v}</p>
                        <p className="text-xs text-text-muted">{m.l}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">{receitaDetalhe.desc}</p>
                  <div className="mb-4">
                    <p className="font-bold text-sm mb-2">Ingredientes</p>
                    {receitaDetalhe.ingredientes.map((ing, i) => (
                      <div key={i} className="flex gap-2 py-1.5 border-b border-border last:border-0">
                        <span className="text-primary text-xs mt-0.5">•</span>
                        <span className="text-sm text-text-main">{ing}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4">
                    <p className="font-bold text-sm mb-2">Preparo</p>
                    <p className="text-sm text-text-muted leading-relaxed">{receitaDetalhe.preparo}</p>
                  </div>
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                    <div className="flex gap-2 mb-1"><span>🤖</span><span className="text-xs font-bold text-primary">GLPY.IA</span></div>
                    <p className="text-xs text-text-main leading-relaxed">{receitaDetalhe.glp1tip}</p>
                  </div>
                </div>
              </div>
            ) : (
              receitas.map(r => (
                <button key={r.id} onClick={() => setReceitaAberta(r.id)}
                  className="w-full bg-white border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left hover:border-primary/30 transition">
                  <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-text-main">{r.nome}</p>
                    <p className="text-xs text-text-muted">{r.kcal} kcal · {r.proteina}g prot · {r.categoria}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {r.dias.includes(diaAtual + 1) && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Hoje</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="hub" onNavigate={onNavigate} />
    </div>
  );
}
