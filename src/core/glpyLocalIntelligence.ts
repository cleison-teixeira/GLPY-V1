// GLPY Local Intelligence Store
// Camada centralizada de inteligência local tolerante a falhas.
// Proporciona leitura, agregação e formatação do contexto completo do usuário para a IA.

export interface WeightEntry {
  weight: number;
  date?: string;
  timestamp?: string;
}

export interface WaterEntry {
  amount: number;
  date?: string;
  timestamp?: string;
}

export interface FoodEntry {
  prato: string;
  kcal: number;
  proteina: number;
  carbs: number;
  gordura: number;
  image?: string;
  date?: string;
  timestamp?: string;
}

export interface InjectionEntry {
  dose: string;
  local: string;
  symptomsAfter?: string[];
  date?: string;
  timestamp?: string;
}

export interface SymptomsEntry {
  symptoms: string[];
  severity?: Record<string, number>;
  date?: string;
  timestamp?: string;
}

export interface EmotionEntry {
  emotion: string;
  notes?: string;
  date?: string;
  timestamp?: string;
}

export interface ActivityEntry {
  type: string;
  duration: number;
  intensity: string;
  kcalBurned?: number;
  date?: string;
  timestamp?: string;
}

export interface BodyMeasurementsEntry {
  waist?: number; // cintura
  hip?: number;   // quadril
  chest?: number; // peitoral
  arms?: number;  // braços
  date?: string;
  timestamp?: string;
}

export interface PhotoProgressEntry {
  image: string;
  tag: string;
  date?: string;
  timestamp?: string;
}

export interface CheckInEntry {
  fome: number;
  saciedade: number;
  humor: number | string;
  sintomas: string[];
  enjoo?: number;
  fraqueza?: number;
  energia?: number;
  peso?: number | string;
  date?: string;
  timestamp?: string;
}

export interface ProtocolContextEntry {
  id: string;
  nome: string;
  emoji: string;
  totalDias: number;
  dia: number;
  missoesConcluidas?: number;
  missoesTexto?: string[];
}

export interface ProtocolDayMission {
  id: string;
  texto: string;
  sub?: string;
  status: "concluida" | "pendente";
}

export interface ProtocolDayRecipe {
  id: number | string;
  emoji?: string;
  nome: string;
  kcal?: number;
  proteina?: number;
  carbs?: number;
  gordura?: number;
  categoria?: string;
}

export interface ProtocolDayTrackingEntry {
  protocolId: string;
  protocolName: string;
  protocolEmoji?: string;
  totalDays: number;
  day: number;
  date?: string;
  timestamp?: string;
  missions?: ProtocolDayMission[];
  selectedCheckins?: string[];
  recipeOfDay?: ProtocolDayRecipe | null;
  dayStatus?: "em_andamento" | "concluido" | "bloqueado" | "pendente";
  xpEarned?: number;
  behavioralSignals?: string[];
}

export interface DailyTrackingDay {
  date: string;
  weight?: number;
  water?: number;
  meals?: FoodEntry[];
  injections?: InjectionEntry[];
  symptoms?: string[];
  emotion?: string;
  activity?: ActivityEntry[];
  measurements?: BodyMeasurementsEntry;
  checkin?: CheckInEntry;
  protocolDay?: ProtocolDayTrackingEntry;
}

// Auxiliares de leitura e gravação segura
function safeParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) as T : fallback;
  } catch (err) {
    console.warn(`[GLPY Local Intelligence] Falha ao parsear chave ${key}:`, err);
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[GLPY Local Intelligence] Erro ao gravar chave ${key}:`, err);
  }
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getFormattedDateBR(): string {
  return new Date().toLocaleDateString('pt-BR'); // DD/MM/YYYY
}

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODOS DE SALVAMENTO SEGURO
// ─────────────────────────────────────────────────────────────────────────────

// 1. saveWeightEntry(entry)
export function saveWeightEntry(entry: WeightEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_latest_weight
  safeWrite("glpy_latest_weight", fullEntry);

  // glpy_peso_atual (legado compatibilidade string)
  localStorage.setItem("glpy_peso_atual", entry.weight.toFixed(1));

  // glpy_weight_history
  const history = safeParse<WeightEntry[]>("glpy_weight_history", []);
  history.unshift(fullEntry);
  safeWrite("glpy_weight_history", history.slice(0, 100)); // Limita a 100 registros

  // glpy_results_summary
  const summary = safeParse<Record<string, any>>("glpy_results_summary", {});
  if (!summary.initialWeight) {
    // Prioridade: peso inicial do onboarding (peso no momento do cadastro),
    // não o peso atual que está sendo registrado agora.
    const onbInitialWeight = (() => {
      try {
        const onb = safeParse<Record<string, any>>("glpy_onboarding", {});
        const candidates = [
          parseFloat(String(onb.pesoInicial  ?? '')),
          parseFloat(String(onb.peso_inicial ?? '')),
          parseFloat(String(onb.pesoAtual    ?? '')),
          parseFloat(String(onb.peso_atual   ?? '')),
        ];
        return candidates.find(n => !isNaN(n) && n > 20 && n < 300) ?? null;
      } catch {
        return null;
      }
    })();
    summary.initialWeight = onbInitialWeight ?? entry.weight;
  }
  summary.latestWeight = entry.weight;
  summary.weightChange = (summary.initialWeight - entry.weight);
  summary.updatedAt = timestamp;
  safeWrite("glpy_results_summary", summary);

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  tracking[date].weight = entry.weight;
  safeWrite("glpy_daily_tracking", tracking);
}

// 2. saveWaterEntry(entry)
export function saveWaterEntry(entry: WaterEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_today_water
  safeWrite("glpy_today_water", fullEntry);

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  tracking[date].water = (tracking[date].water || 0) + entry.amount;
  safeWrite("glpy_daily_tracking", tracking);
}

// 3. saveFoodEntry(entry)
export function saveFoodEntry(entry: FoodEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_today_food
  const todayFood = safeParse<FoodEntry[]>("glpy_today_food", []);
  todayFood.unshift(fullEntry);
  safeWrite("glpy_today_food", todayFood);

  // glpy_fotos_historico (quando houver imagem/foto)
  if (entry.image) {
    const legacyHistory = safeParse<any[]>("glpy_fotos_historico", []);
    legacyHistory.unshift({
      prato: entry.prato,
      kcal: entry.kcal,
      proteina: entry.proteina,
      data: getFormattedDateBR(),
      image: entry.image,
      timestamp
    });
    safeWrite("glpy_fotos_historico", legacyHistory.slice(0, 50));
  }

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  if (!tracking[date].meals) {
    tracking[date].meals = [];
  }
  tracking[date].meals!.unshift(fullEntry);
  safeWrite("glpy_daily_tracking", tracking);
}

// 4. saveInjectionEntry(entry)
export function saveInjectionEntry(entry: InjectionEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_latest_injection
  safeWrite("glpy_latest_injection", fullEntry);

  // glpy_injection_history
  const history = safeParse<InjectionEntry[]>("glpy_injection_history", []);
  history.unshift(fullEntry);
  safeWrite("glpy_injection_history", history.slice(0, 50));

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  if (!tracking[date].injections) {
    tracking[date].injections = [];
  }
  tracking[date].injections!.unshift(fullEntry);
  safeWrite("glpy_daily_tracking", tracking);
}

// 5. saveSymptomsEntry(entry)
export function saveSymptomsEntry(entry: SymptomsEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_today_symptoms
  safeWrite("glpy_today_symptoms", fullEntry);

  // glpy_symptoms_history
  const history = safeParse<SymptomsEntry[]>("glpy_symptoms_history", []);
  history.unshift(fullEntry);
  safeWrite("glpy_symptoms_history", history.slice(0, 50));

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  tracking[date].symptoms = entry.symptoms;
  safeWrite("glpy_daily_tracking", tracking);
}

// 6. saveEmotionEntry(entry)
export function saveEmotionEntry(entry: EmotionEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_today_emotion
  safeWrite("glpy_today_emotion", fullEntry);

  // glpy_emotion_history
  const history = safeParse<EmotionEntry[]>("glpy_emotion_history", []);
  history.unshift(fullEntry);
  safeWrite("glpy_emotion_history", history.slice(0, 50));

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  tracking[date].emotion = entry.emotion;
  safeWrite("glpy_daily_tracking", tracking);
}

// 7. saveActivityEntry(entry)
export function saveActivityEntry(entry: ActivityEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_today_activity — upsert: uma atividade principal por dia em V1
  const todayAct = safeParse<ActivityEntry[]>("glpy_today_activity", []);
  const otherDays = todayAct.filter(e => e.date !== date);
  safeWrite("glpy_today_activity", [fullEntry, ...otherDays]);

  // glpy_activity_history
  const history = safeParse<ActivityEntry[]>("glpy_activity_history", []);
  history.unshift(fullEntry);
  safeWrite("glpy_activity_history", history.slice(0, 50));

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  if (!tracking[date].activity) {
    tracking[date].activity = [];
  }
  tracking[date].activity = [fullEntry]; // upsert: substitui atividade do dia
  safeWrite("glpy_daily_tracking", tracking);
}

// 8. saveBodyMeasurementsEntry(entry)
export function saveBodyMeasurementsEntry(entry: BodyMeasurementsEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_latest_measurements
  safeWrite("glpy_latest_measurements", fullEntry);

  // glpy_measurements_history
  const history = safeParse<BodyMeasurementsEntry[]>("glpy_measurements_history", []);
  history.unshift(fullEntry);
  safeWrite("glpy_measurements_history", history.slice(0, 50));

  // glpy_results_summary
  const summary = safeParse<Record<string, any>>("glpy_results_summary", {});
  if (entry.waist) {
    if (!summary.initialWaist) summary.initialWaist = entry.waist;
    summary.latestWaist = entry.waist;
    summary.waistLoss = (summary.initialWaist - entry.waist);
  }
  if (entry.hip) {
    if (!summary.initialHip) summary.initialHip = entry.hip;
    summary.latestHip = entry.hip;
    summary.hipLoss = (summary.initialHip - entry.hip);
  }
  safeWrite("glpy_results_summary", summary);
}

// 9. savePhotoProgressEntry(entry)
export function savePhotoProgressEntry(entry: PhotoProgressEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_photo_progress
  const progressList = safeParse<PhotoProgressEntry[]>("glpy_photo_progress", []);
  progressList.unshift(fullEntry);
  safeWrite("glpy_photo_progress", progressList.slice(0, 20));

  // glpy_results_summary
  const summary = safeParse<Record<string, any>>("glpy_results_summary", {});
  if (!summary.photoList) {
    summary.photoList = [];
  }
  summary.photoList.unshift({ image: entry.image, tag: entry.tag, date: getFormattedDateBR() });
  summary.photoCount = summary.photoList.length;
  safeWrite("glpy_results_summary", summary);
}

// 10. saveCheckInEntry(entry)
export function saveCheckInEntry(entry: CheckInEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const fullEntry = { ...entry, date, timestamp };

  // glpy_ultimo_checkin (formato legado compatível com ChatIA)
  const legacyCheckin = {
    data: getFormattedDateBR(),
    enjoo: entry.enjoo !== undefined ? entry.enjoo : (entry.sintomas.includes("Enjôo") ? 8 : entry.sintomas.includes("Náusea") ? 7 : 1),
    fraqueza: entry.fraqueza !== undefined ? entry.fraqueza : (entry.sintomas.includes("Cansaço") ? 8 : 1),
    fome: entry.fome,
    energia: entry.energia !== undefined ? entry.energia : entry.saciedade,
    peso: entry.peso ? entry.peso.toString() : (localStorage.getItem("glpy_peso_atual") || "75.0"),
    sintomas: entry.sintomas,
  };
  safeWrite("glpy_ultimo_checkin", legacyCheckin);

  // glpy_checkin_history
  const history = safeParse<any[]>("glpy_checkin_history", []);
  history.unshift(fullEntry);
  safeWrite("glpy_checkin_history", history.slice(0, 60));

  // glpy_daily_tracking
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  tracking[date].checkin = fullEntry;
  safeWrite("glpy_daily_tracking", tracking);
}

// 11. saveProtocolContext(entry)
export function saveProtocolContext(entry: ProtocolContextEntry): void {
  // glpy_protocolo_ativo (formato legado compatível)
  const legacyActive = {
    id: entry.id,
    nome: entry.nome,
    emoji: entry.emoji,
    totalDias: entry.totalDias,
    dia: entry.dia,
  };
  safeWrite("glpy_protocolo_ativo", legacyActive);

  // glpy_current_protocol_day
  localStorage.setItem("glpy_current_protocol_day", String(entry.dia));

  // glpy_missoes_texto_hoje
  if (entry.missoesTexto) {
    safeWrite("glpy_missoes_texto_hoje", entry.missoesTexto);
  }

  // glpy_protocol_context
  safeWrite("glpy_protocol_context", entry);
}

// 12. saveProtocolDayTracking(entry)
export function saveProtocolDayTracking(entry: ProtocolDayTrackingEntry): void {
  const date = entry.date || getTodayKey();
  const timestamp = entry.timestamp || new Date().toISOString();
  const existingToday = safeParse<ProtocolDayTrackingEntry | null>("glpy_protocol_day_today", null);

  const fullEntry: ProtocolDayTrackingEntry = {
    ...existingToday,
    ...entry,
    date,
    timestamp,
    missions: entry.missions || existingToday?.missions || [],
    selectedCheckins: entry.selectedCheckins || existingToday?.selectedCheckins || [],
    recipeOfDay: entry.recipeOfDay !== undefined ? entry.recipeOfDay : existingToday?.recipeOfDay || null,
    dayStatus: entry.dayStatus || existingToday?.dayStatus || "em_andamento",
    behavioralSignals: entry.behavioralSignals || existingToday?.behavioralSignals || [],
  };

  safeWrite("glpy_protocol_day_today", fullEntry);

  const history = safeParse<ProtocolDayTrackingEntry[]>("glpy_protocol_day_history", []);
  const nextHistory = [
    fullEntry,
    ...history.filter(item => !(item.date === date && item.protocolId === fullEntry.protocolId && item.day === fullEntry.day)),
  ];
  safeWrite("glpy_protocol_day_history", nextHistory.slice(0, 90));

  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (!tracking[date]) {
    tracking[date] = { date };
  }
  tracking[date].protocolDay = fullEntry;
  safeWrite("glpy_daily_tracking", tracking);
}

// 13. clearTodayConsumption() — zera apenas refeições e água do dia atual
export function clearTodayConsumption(): void {
  const todayKey = getTodayKey();

  // Zera meals e water de hoje em glpy_daily_tracking; mantém peso, protocolo, etc.
  const tracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  if (tracking[todayKey]) {
    tracking[todayKey].meals = [];
    tracking[todayKey].water = 0;
    safeWrite("glpy_daily_tracking", tracking);
  }

  // Remove entradas de hoje de glpy_today_food (lista cumulativa sem escopo de data)
  const todayFood = safeParse<FoodEntry[]>("glpy_today_food", []);
  const filteredFood = todayFood.filter(f => f.date !== todayKey);
  safeWrite("glpy_today_food", filteredFood);

  // Limpa glpy_today_water se for do dia atual
  const todayWater = safeParse<WaterEntry | null>("glpy_today_water", null);
  if (todayWater?.date === todayKey) {
    localStorage.removeItem("glpy_today_water");
  }
}

// 14. getGLPYIntelligenceContext()
export function getGLPYIntelligenceContext() {
  const todayKey = getTodayKey();

  const userProfile = {
    nome: localStorage.getItem("glpy_nome") || "você",
    email: localStorage.getItem("glpy_email") || "",
    onboarding: safeParse<any>("glpy_onboarding", {}),
    plano: localStorage.getItem("glpy_plano") || "starter",
    xp: parseInt(localStorage.getItem("glpy_xp") || "0", 10),
    streak: parseInt(localStorage.getItem("glpy_streak") || "0", 10),
    nivel: parseInt(localStorage.getItem("glpy_nivel") || "1", 10),
  };

  const treatment = {
    latestInjection: safeParse<any>("glpy_latest_injection", null),
    injectionHistory: safeParse<any[]>("glpy_injection_history", []),
  };

  const currentWeight = safeParse<any>("glpy_latest_weight", null);
  const weightHistory = safeParse<any[]>("glpy_weight_history", []);
  const resultsSummary = safeParse<any>("glpy_results_summary", {});
  const activeProtocol = safeParse<any>("glpy_protocolo_ativo", null);
  const currentProtocolDay = parseInt(localStorage.getItem("glpy_current_protocol_day") || "1", 10);
  const todayMissionsText = safeParse<string[]>("glpy_missoes_texto_hoje", []);
  const protocolDayToday = safeParse<ProtocolDayTrackingEntry | null>("glpy_protocol_day_today", null);
  const protocolDayHistory = safeParse<ProtocolDayTrackingEntry[]>("glpy_protocol_day_history", []);

  const dailyTracking = safeParse<Record<string, DailyTrackingDay>>("glpy_daily_tracking", {});
  const todayProtocolDay = dailyTracking[todayKey]?.protocolDay || protocolDayToday;
  
  const symptoms = {
    today: safeParse<any>("glpy_today_symptoms", null),
    history: safeParse<any[]>("glpy_symptoms_history", []),
  };

  const emotion = {
    today: safeParse<any>("glpy_today_emotion", null),
    history: safeParse<any[]>("glpy_emotion_history", []),
  };

  const activity = {
    today: safeParse<ActivityEntry[]>("glpy_today_activity", []),
    history: safeParse<ActivityEntry[]>("glpy_activity_history", []),
  };

  const food = {
    today: safeParse<FoodEntry[]>("glpy_today_food", []),
    history: safeParse<any[]>("glpy_fotos_historico", []),
  };

  const photos = safeParse<PhotoProgressEntry[]>("glpy_photo_progress", []);
  
  const measurements = {
    latest: safeParse<BodyMeasurementsEntry>("glpy_latest_measurements", null),
    history: safeParse<BodyMeasurementsEntry[]>("glpy_measurements_history", []),
  };

  const checkins = {
    latest: safeParse<any>("glpy_ultimo_checkin", null),
    history: safeParse<any[]>("glpy_checkin_history", []),
  };

  const warnings: string[] = [];
  if (!currentWeight) warnings.push("Sem registro de peso recente.");
  if (!activeProtocol) warnings.push("Nenhum protocolo ativo selecionado.");
  if (treatment.injectionHistory.length === 0) warnings.push("Sem histórico de aplicação de injeção registrado.");
  if (food.today.length === 0) warnings.push("Nenhuma refeição registrada hoje.");
  if (!symptoms.today) warnings.push("Sem sintomas registrados hoje.");
  if (!emotion.today) warnings.push("Sem registro de humor/emoções hoje.");
  if (activeProtocol && !todayProtocolDay) warnings.push("Sem execução do protocolo registrada hoje.");

  return {
    userProfile,
    treatment,
    currentWeight,
    weightHistory,
    resultsSummary,
    activeProtocol,
    currentProtocolDay,
    todayMissionsText,
    protocolDayToday: todayProtocolDay,
    protocolDayHistory,
    dailyTracking,
    symptoms,
    emotion,
    activity,
    food,
    photos,
    measurements,
    checkins,
    warnings,
  };
}

// 14. buildGLPYContextForAI()
export function buildGLPYContextForAI(): string {
  try {
    const ctx = getGLPYIntelligenceContext();
    const todayKey = getTodayKey();
    const todayTrack: Partial<DailyTrackingDay> = ctx.dailyTracking[todayKey] || {};
    const sections: string[] = ["=== GLPY LOCAL INTELLIGENCE STORE ==="];

    // 1. Perfil
    sections.push(`Usuário: ${ctx.userProfile.nome} (Plano: ${ctx.userProfile.plano.toUpperCase()})\nStreak: ${ctx.userProfile.streak} dias 🔥 | XP: ${ctx.userProfile.xp} (Nível ${ctx.userProfile.nivel})`);

    // 2. Protocolo Ativo
    if (ctx.activeProtocol?.nome) {
      const total = ctx.activeProtocol.totalDias || 7;
      const dia = ctx.currentProtocolDay || ctx.activeProtocol.dia || 1;
      let prtStr = `Protocolo Ativo: ${ctx.activeProtocol.nome} — Dia ${dia}/${total}`;
      if (ctx.protocolDayToday?.missions && ctx.protocolDayToday.missions.length > 0) {
        prtStr += `\nExecução do Protocolo Hoje: ${ctx.protocolDayToday.dayStatus || "em_andamento"}`;
        prtStr += `\nMissões de hoje:\n${ctx.protocolDayToday.missions.map((m, idx) => `  ${idx + 1}. [${m.status === "concluida" ? "x" : " "}] ${m.texto}`).join("\n")}`;
        if (ctx.protocolDayToday.selectedCheckins && ctx.protocolDayToday.selectedCheckins.length > 0) {
          prtStr += `\nCheck-in do protocolo: ${ctx.protocolDayToday.selectedCheckins.join(", ")}`;
        }
        if (ctx.protocolDayToday.recipeOfDay?.nome) {
          const recipe = ctx.protocolDayToday.recipeOfDay;
          prtStr += `\nReceita do dia: ${recipe.nome}${recipe.kcal ? ` (${recipe.kcal} kcal, ${recipe.proteina || 0}g prot)` : ""}`;
        }
        if (ctx.protocolDayToday.behavioralSignals && ctx.protocolDayToday.behavioralSignals.length > 0) {
          prtStr += `\nSinais comportamentais: ${ctx.protocolDayToday.behavioralSignals.join("; ")}`;
        }
      } else if (ctx.todayMissionsText && ctx.todayMissionsText.length > 0) {
        prtStr += `\nMissões de hoje:\n${ctx.todayMissionsText.map((m, idx) => `  ${idx + 1}. [ ] ${m}`).join("\n")}`;
      }
      sections.push(prtStr);
    } else {
      sections.push("Protocolo Ativo: Nenhum selecionado.");
    }

    // 3. Peso & Evolução
    if (ctx.currentWeight?.weight) {
      let wtStr = `Peso Atual: ${ctx.currentWeight.weight} kg`;
      if (ctx.resultsSummary?.initialWeight) {
        const diff = ctx.resultsSummary.initialWeight - ctx.currentWeight.weight;
        if (diff > 0) {
          wtStr += ` (Emagreceu total de ${diff.toFixed(1)} kg desde o início)`;
        } else if (diff < 0) {
          wtStr += ` (Ganho de ${Math.abs(diff).toFixed(1)} kg desde o início)`;
        }
      }
      sections.push(wtStr);
    }

    // 4. Injeção
    if (ctx.treatment.latestInjection) {
      sections.push(`Última Injeção GLP-1: Dose ${ctx.treatment.latestInjection.dose} no local ${ctx.treatment.latestInjection.local} em ${ctx.treatment.latestInjection.date}`);
    }

    // 5. Consumo metabólico hoje
    const todayStr: string[] = ["Logs Metabólicos de Hoje:"];
    if (todayTrack.water) {
      todayStr.push(`- Ingestão de Água: ${todayTrack.water}L consumidos`);
    } else {
      todayStr.push("- Ingestão de Água: 0L consumidos hoje.");
    }
    
    if (ctx.food.today && ctx.food.today.length > 0) {
      const foodLines = ctx.food.today.map(f => `  * ${f.prato}: ${f.kcal} kcal, ${f.proteina}g prot, ${f.carbs}g carb, ${f.gordura}g gord`);
      todayStr.push(`- Refeições Hoje:\n${foodLines.join("\n")}`);
    } else {
      todayStr.push("- Refeições Hoje: Nenhuma cadastrada.");
    }

    if (ctx.activity.today && ctx.activity.today.length > 0) {
      const actLines = ctx.activity.today.map(a => `  * ${a.type} por ${a.duration} min (${a.intensity})`);
      todayStr.push(`- Exercícios Hoje:\n${actLines.join("\n")}`);
    }

    sections.push(todayStr.join("\n"));

    // 6. Sintomas & Humor
    const symStr: string[] = ["Status Clínico & Emocional de Hoje:"];
    if (ctx.symptoms.today?.symptoms && ctx.symptoms.today.symptoms.length > 0) {
      symStr.push(`- Sintomas: ${ctx.symptoms.today.symptoms.join(", ")}`);
    } else {
      symStr.push("- Sintomas: Nenhum sintoma severo reportado.");
    }
    if (ctx.emotion.today?.emotion) {
      const emotionParts: string[] = [`- Humor/Estado: ${ctx.emotion.today.emotion}`];
      if ((ctx.emotion.today as any).emotionalEnergy) {
        emotionParts.push(`Energia: ${(ctx.emotion.today as any).emotionalEnergy}`);
      }
      if ((ctx.emotion.today as any).notes) {
        emotionParts.push(`Observação: ${(ctx.emotion.today as any).notes}`);
      }
      symStr.push(emotionParts.join(" | "));
    }

    sections.push(symStr.join("\n"));

    // 7. Warnings
    if (ctx.warnings.length > 0) {
      sections.push(`Lembretes/Lacunas Clínicas:\n${ctx.warnings.map(w => `  [!] ${w}`).join("\n")}`);
    }

    return `\n\n${sections.join("\n\n")}\n\nIMPORTANTE: Adapte seu tom médico-comportamental e nutricional a esses dados unificados acima para guiar suas respostas.`;
  } catch (err) {
    return `\n\nErro ao compilar Local Intelligence Context: ${err}`;
  }
}
