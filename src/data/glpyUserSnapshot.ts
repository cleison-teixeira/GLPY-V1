// GLPY — User Snapshot / AI Context
// Sprint 17A.1: lê de glpyStore (fonte canônica real) + glpyBlackBox (sinais comportamentais)
// e gera contexto estruturado para a IA.
//
// Regras de privacidade:
// - Não salva texto livre completo de conversa IA
// - Não salva imagem/base64
// - Não inventa dados ausentes (usa "não registrado" explicitamente)
// - Não emite local-storage-change (leitura pura)

import { glpyStore } from './glpyStore';
import { glpyBlackBox } from './glpyBlackBox';
import { CATEGORIES } from './glpyEventCatalog';
import type { GlpyBlackBoxEvent } from './types';
import { getLocalDateKey } from '../utils/formatters';

function todayKey(): string {
  return getLocalDateKey();
}

function safeGet<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface TodaySnapshot {
  date: string;

  // Identidade
  name:        string;
  medication:  string;
  dose:        string;
  weightKg:    number | null;
  goalWeightKg: number | null;
  heightCm:    number | null;

  // Refeições (lê de glpy_refeicoes_hoje — fonte real do FoodLogScreen)
  mealsCount:  number;
  totalCalories: number;
  totalProtein:  number;
  totalCarbs:    number;
  totalFat:      number;
  meals: Array<{ nome: string; calories: number; protein: number; tipo: string }>;

  // Água (lê de glpy_agua_hoje — fonte real do WaterScreen)
  waterLiters: number | null;

  // Atividade (lê de glpy_atividade_hoje + glpy_today_activity)
  activityDone:    boolean;
  activityType:    string | null;
  activityDuration: number | null; // minutos
  activityCalories: number | null;

  // Check-in
  checkInDone:    boolean;
  dayFeeling:     string | null;
  checkInStreak:  number;

  // Emoção
  emotionMood:   string | null;
  emotionEnergy: number | null;

  // Sintomas/efeitos
  symptoms:    string[];
  noSymptoms:  boolean;

  // Aplicação/injeção
  injectionDone: boolean;
  injectionDate: string | null;

  // IA
  aiMessagesUsed:  number;
  aiMessagesLimit: number;

  // Protocolo
  protocolId:     string | null;
  protocolName:   string | null;
  protocolDay:    number | null;
  protocolTotal:  number | null;
  protocolDayCompleted: boolean;
  missionsToday:  Array<{ texto: string; status: 'concluida' | 'pendente' }>;
  missionsDoneCount:    number;
  missionsPendingCount: number;
  protocolCheckinSelected: string | null;

  // Black Box — eventos de hoje
  todayEventTypes: string[];
  hasSweetCraving: boolean;
  cravingText:     string | null;

  // Evolução corporal
  bodyMeasuresCurrent:  { cintura?: number; busto?: number; coxa?: number; quadril?: number; panturrilha?: number };
  bodyMeasuresInitial:  { cintura?: number; busto?: number; coxa?: number; quadril?: number; panturrilha?: number };
  bodyMeasuresDiffs:    { cintura?: number; busto?: number; coxa?: number; quadril?: number; panturrilha?: number; totalCm: number };
  hasCurrentMeasurements: boolean;
  hasInitialMeasurements: boolean;
  hasBodyEvolution:       boolean;
}

export interface BehavioralInsights {
  lowProteinRisk:          boolean; // < 60% da meta
  lowWaterRisk:            boolean; // < 1L
  sedentaryDay:            boolean; // sem atividade hoje
  sweetCraving:            boolean;
  sideEffectAttention:     boolean; // tem sintomas hoje
  protocolEngaged:         boolean; // abriu protocolo hoje
  missionWithoutRealRecord: boolean; // missão marcada sem registro real
  reboundAttention:        boolean; // eventos de medo de rebote recentes
  muscleLossAttention:     boolean;
  hairLossAttention:       boolean;
  inconsistentTracking:    boolean; // dias sem registro nos últimos 7
  gaps: string[];           // lacunas explícitas em linguagem natural
}

export interface RecentSummary {
  days: number;
  daysWithMeals:     number;
  daysWithWater:     number;
  daysWithActivity:  number;
  daysWithCheckin:   number;
  daysWithEmotion:   number;
  avgCalories:       number | null;
  avgProtein:        number | null;
  avgWater:          number | null;
  topEmotions:       string[];
  topSymptoms:       string[];
  missionEventsCount: number;
}

// ── buildTodaySnapshot ────────────────────────────────────────────────────────

export function buildTodaySnapshot(): TodaySnapshot {
  const today = todayKey();

  // Perfil
  const profile     = safeGet(() => glpyStore.profile.get(), {} as any);
  const name        = safeGet(() => profile.name || localStorage.getItem('glpy_nome') || 'você', 'você');
  const medication  = safeGet(() => glpyStore.treatment.getMedication(), 'não informado');
  const dose        = safeGet(() => glpyStore.treatment.getDose(), 'não informada');
  const weightEntry = safeGet(() => glpyStore.progress.getLatestWeight(), null) as any;
  const weightKg    = weightEntry?.weight ? parseFloat(String(weightEntry.weight)) : (profile.currentWeight || null);
  const goalWeightKg = profile.goalWeight || null;
  const heightCm    = profile.height || null;

  // Refeições — lê de glpy_refeicoes_hoje (fonte real do FoodLogScreen)
  const allMeals    = safeGet(() => glpyStore.meals.getToday(), []);
  const mealsCount  = allMeals.length;
  const totalCalories = allMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein  = allMeals.reduce((s, m) => s + (m.protein  || 0), 0);
  const totalCarbs    = allMeals.reduce((s, m) => s + (m.carbs    || 0), 0);
  const totalFat      = allMeals.reduce((s, m) => s + (m.fat      || 0), 0);
  const meals = allMeals.map(m => ({
    nome:     m.nome || 'Refeição',
    calories: m.calories || 0,
    protein:  m.protein  || 0,
    tipo:     m.tipo     || 'manual',
  }));

  // Água — lê de glpy_agua_hoje (fonte real do WaterScreen)
  const waterEntry  = safeGet(() => glpyStore.water.getToday(), null) as any;
  const waterLiters = (waterEntry?.date === today) ? parseFloat(String(waterEntry.amount || 0)) : null;

  // Atividade — glpyStore.activity lê de ambas as chaves (glpy_atividade_hoje + glpy_today_activity)
  const actEntry    = safeGet(() => glpyStore.activity.getToday(), null) as any;
  const activityDone    = !!actEntry;
  const activityType    = actEntry?.activity || actEntry?.type || null;
  const activityDuration = actEntry?.duration ? parseInt(String(actEntry.duration), 10) : null;
  const activityCalories = actEntry?.activityCaloriesBurned || actEntry?.kcalBurned || null;

  // Check-in
  const checkinToday = safeGet(() => glpyStore.checkin.getToday() as any, null);
  const checkInDone  = !!(checkinToday?.date === today);
  const dayFeeling   = checkinToday?.dayFeeling || null;
  const checkInStreak = safeGet(() => {
    const hist = glpyStore.checkin.getHistory() as any[];
    if (!Array.isArray(hist) || hist.length === 0) return 0;
    const dates = hist.map((i: any) => (typeof i === 'string' ? i : i?.date)).filter(Boolean);
    const unique = Array.from(new Set(dates)).sort((a: any, b: any) => b.localeCompare(a)) as string[];
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const yStr = getLocalDateKey(yest);
    const hasToday = unique.includes(today);
    const hasYest  = unique.includes(yStr);
    if (!hasToday && !hasYest) return 0;
    let streak = 0;
    const startStr = hasToday ? today : yStr;
    const [sy, sm, sd] = startStr.split('-').map(Number);
    let d = new Date(sy, sm - 1, sd); // construtor local — evita UTC midnight
    while (true) {
      const s = getLocalDateKey(d);
      if (unique.includes(s)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return streak;
  }, 0);

  // Emoção
  const emotionEntry = safeGet(() => glpyStore.emotion.getToday() as any, null);
  const emotionIsToday = emotionEntry?.savedAt
    ? getLocalDateKey(new Date(emotionEntry.savedAt)) === today
    : false;
  const emotionMood   = emotionIsToday ? (emotionEntry?.mood || null) : null;
  const emotionEnergy = emotionIsToday ? (emotionEntry?.energy ?? null) : null;

  // Sintomas
  const efeitosEntry = safeGet(() => glpyStore.treatment.getEfeitosHoje() as any, null);
  const symptomsIsToday = efeitosEntry?.date === today;
  const symptoms   = symptomsIsToday ? (Array.isArray(efeitosEntry?.symptoms) ? efeitosEntry.symptoms : []) : [];
  const noSymptoms = symptomsIsToday ? !!(efeitosEntry?.noSymptoms) : false;

  // Aplicação
  const injEntry     = safeGet(() => glpyStore.treatment.getUltimaInjecao() as any, null);
  const injDate      = injEntry?.savedAt ? getLocalDateKey(new Date(injEntry.savedAt)) : (injEntry?.date || null);
  const injectionDone = injDate === today;

  // IA
  const aiData    = safeGet(() => glpyStore.aiUsage.get() as any, { used: 0, limit: 30 });
  const aiIsToday = aiData?.date === today;
  const aiMessagesUsed  = aiIsToday ? (aiData.used || 0) : 0;
  const aiMessagesLimit = aiData.limit || 30;

  // Protocolo — glpyStore.protocol lê de glpy_active_protocol e glpy_protocolo_ativo
  const activeProto = safeGet(() => glpyStore.protocol.getActive() as any, null);
  const protocolId    = activeProto?.id   || null;
  const protocolName  = activeProto?.nome || null;
  const protocolTotal = activeProto?.totalDias || null;

  // Progresso do protocolo — determina o dia ativo REAL
  // Regra: se completou hoje (dataUltimoCheck === hoje), dia ativo = último dia concluído.
  // O próximo dia só vira activeDay quando for amanhã.
  const protocolProgressRaw = safeGet(() => {
    if (!protocolId) return null;
    const raw = localStorage.getItem(`glpy_protocolo_${protocolId}_progresso`);
    return raw ? JSON.parse(raw) : null;
  }, null) as any;
  const diasFeitos        = protocolProgressRaw?.diasConcluidos?.length ?? 0;
  const completedToday    = !!(protocolProgressRaw?.dataUltimoCheck === today && diasFeitos > 0);
  const protocolDayCompleted = completedToday;

  const protocolDay = (() => {
    if (!protocolId) return null;
    if (completedToday) return Math.min(diasFeitos, protocolTotal ?? 7);
    return Math.min(diasFeitos + 1, protocolTotal ?? 7);
  })();

  // Missões de hoje — lê de glpy_protocol_day_today (salvo por ProtocoloBase/AntiRebote.persistProtocolDay)
  const protoDayRaw = safeGet(() => {
    const raw = localStorage.getItem('glpy_protocol_day_today');
    return raw ? JSON.parse(raw) : null;
  }, null) as any;
  const protoDayIsToday = protoDayRaw?.date === today;
  // Quando dayStatus === 'bloqueado', o registro aponta para o PRÓXIMO dia — não são missões de hoje
  const isDayBlocked = protoDayRaw?.dayStatus === 'bloqueado';
  const missionsToday: Array<{ texto: string; status: 'concluida' | 'pendente' }> =
    (protoDayIsToday && !isDayBlocked)
      ? (protoDayRaw?.missions || []).map((m: any) => ({ texto: m.texto || '', status: m.status || 'pendente' }))
      : [];
  const missionsDoneCount    = missionsToday.filter(m => m.status === 'concluida').length;
  const missionsPendingCount = missionsToday.filter(m => m.status === 'pendente').length;
  const protocolCheckinSelected = (protoDayIsToday && !isDayBlocked)
    ? (Array.isArray(protoDayRaw?.selectedCheckins) ? protoDayRaw.selectedCheckins[0] || null : null)
    : null;

  // Evolução corporal
  const rawCurrent = safeGet(() => glpyStore.bodyMeasurements.get() ?? {}, {}) as Record<string, any>;
  const rawInitial = safeGet(() => glpyStore.progress.getInitialMeasurements() ?? {}, {}) as Record<string, any>;
  const toM = (v: any): number | undefined => { const n = parseFloat(String(v ?? '')); return (!isNaN(n) && n > 0) ? n : undefined; };
  const bodyMeasuresCurrent = {
    cintura:     toM(rawCurrent.cintura  ?? rawCurrent.waist),
    busto:       toM(rawCurrent.busto    ?? rawCurrent.chest),
    coxa:        toM(rawCurrent.coxa     ?? rawCurrent.thigh),
    quadril:     toM(rawCurrent.quadril  ?? rawCurrent.hip),
    panturrilha: toM(rawCurrent.panturrilha ?? rawCurrent.calf),
  };
  const bodyMeasuresInitial = {
    cintura:     toM(rawInitial.cintura  ?? rawInitial.waist),
    busto:       toM(rawInitial.busto    ?? rawInitial.chest),
    coxa:        toM(rawInitial.coxa     ?? rawInitial.thigh),
    quadril:     toM(rawInitial.quadril  ?? rawInitial.hip),
    panturrilha: toM(rawInitial.panturrilha ?? rawInitial.calf),
  };
  const diffOf = (cur?: number, ini?: number): number | undefined =>
    (cur !== undefined && ini !== undefined && ini > 0) ? parseFloat((ini - cur).toFixed(2)) : undefined;
  const dCintura     = diffOf(bodyMeasuresCurrent.cintura,     bodyMeasuresInitial.cintura);
  const dBusto       = diffOf(bodyMeasuresCurrent.busto,       bodyMeasuresInitial.busto);
  const dCoxa        = diffOf(bodyMeasuresCurrent.coxa,        bodyMeasuresInitial.coxa);
  const dQuadril     = diffOf(bodyMeasuresCurrent.quadril,     bodyMeasuresInitial.quadril);
  const dPanturrilha = diffOf(bodyMeasuresCurrent.panturrilha, bodyMeasuresInitial.panturrilha);
  const totalCm = [dCintura, dBusto, dCoxa, dQuadril, dPanturrilha]
    .reduce((s: number, v) => s + (v ?? 0), 0 as number);
  const bodyMeasuresDiffs = { cintura: dCintura, busto: dBusto, coxa: dCoxa, quadril: dQuadril, panturrilha: dPanturrilha, totalCm: parseFloat(totalCm.toFixed(2)) };
  const hasCurrentMeasurements = Object.values(bodyMeasuresCurrent).some(v => v !== undefined);
  const hasInitialMeasurements = Object.values(bodyMeasuresInitial).some(v => v !== undefined);
  const hasBodyEvolution = hasCurrentMeasurements && hasInitialMeasurements &&
    Object.values(bodyMeasuresDiffs).some(v => typeof v === 'number' && v !== 0);

  // Black Box — eventos de hoje
  const todayEvents: GlpyBlackBoxEvent[] = safeGet(() => glpyBlackBox.getTodayEvents(), []);
  const todayEventTypes = Array.from(new Set(todayEvents.map(e => e.type)));

  // Craving — detecta nos eventos e no check-in selecionado do protocolo
  const cravingEvent = todayEvents.find(e =>
    e.signal === 'sweet_craving' || e.signal === 'hunger_craving' || e.type === 'craving_reported'
  );
  const hasSweetCraving = !!cravingEvent || (
    !!(protocolCheckinSelected) &&
    ['doce', 'açúcar', 'acucar', 'fome', 'chocolate', 'craving'].some(kw =>
      (protocolCheckinSelected || '').toLowerCase().includes(kw)
    )
  );
  const cravingText = cravingEvent ? null : (hasSweetCraving ? protocolCheckinSelected : null);

  return {
    date: today, name, medication, dose, weightKg, goalWeightKg, heightCm,
    mealsCount, totalCalories, totalProtein, totalCarbs, totalFat, meals,
    waterLiters,
    activityDone, activityType, activityDuration, activityCalories,
    checkInDone, dayFeeling, checkInStreak,
    emotionMood, emotionEnergy,
    symptoms, noSymptoms,
    injectionDone, injectionDate: injDate,
    aiMessagesUsed, aiMessagesLimit,
    protocolId, protocolName, protocolDay, protocolTotal, protocolDayCompleted,
    missionsToday, missionsDoneCount, missionsPendingCount, protocolCheckinSelected,
    todayEventTypes, hasSweetCraving, cravingText,
    bodyMeasuresCurrent, bodyMeasuresInitial, bodyMeasuresDiffs,
    hasCurrentMeasurements, hasInitialMeasurements, hasBodyEvolution,
  };
}

// ── buildRecentSnapshot ───────────────────────────────────────────────────────

export function buildRecentSnapshot(days = 7): RecentSummary {
  const events = safeGet(() => glpyBlackBox.getRecentEvents(days), []);

  const byDate: Record<string, GlpyBlackBoxEvent[]> = {};
  for (const e of events) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }

  let daysWithMeals = 0, daysWithWater = 0, daysWithActivity = 0, daysWithCheckin = 0, daysWithEmotion = 0;
  let totalCalSum = 0, totalProtSum = 0, totalWaterSum = 0;
  let calDays = 0, protDays = 0, waterDays = 0;

  for (const dateStr of Object.keys(byDate)) {
    const dayEvts = byDate[dateStr];
    if (dayEvts.some(e => e.type === 'meal_saved' || e.type === 'food_photo_confirmed')) {
      daysWithMeals++;
      const calEvt = dayEvts.find(e => e.type === 'meal_saved' || e.type === 'food_photo_confirmed');
      if (calEvt?.payload?.calories) { totalCalSum += calEvt.payload.calories; calDays++; }
      if (calEvt?.payload?.protein)  { totalProtSum += calEvt.payload.protein; protDays++; }
    }
    if (dayEvts.some(e => e.type === 'water_updated')) {
      daysWithWater++;
      const wEvt = dayEvts.filter(e => e.type === 'water_updated').slice(-1)[0];
      if (wEvt?.payload?.totalMlToday) { totalWaterSum += wEvt.payload.totalMlToday; waterDays++; }
    }
    if (dayEvts.some(e => e.type === 'activity_saved'))  daysWithActivity++;
    if (dayEvts.some(e => e.type === 'checkin_completed')) daysWithCheckin++;
    if (dayEvts.some(e => e.type === 'emotion_logged'))   daysWithEmotion++;
  }

  // Top emoções e sintomas dos eventos recentes
  const emotionSignals = events.filter(e => e.category === CATEGORIES.EMOTION).map(e => e.signal).filter(Boolean) as string[];
  const symptomSignals = events.filter(e => e.category === CATEGORIES.SIDE_EFFECTS).flatMap(e => e.payload?.symptomKeys || []);
  const topEmotions = Array.from(new Set(emotionSignals)).slice(0, 3);
  const topSymptoms = Array.from(new Set(symptomSignals)).slice(0, 5);
  const missionEventsCount = events.filter(e => e.type === 'mission_completed').length;

  return {
    days,
    daysWithMeals, daysWithWater, daysWithActivity, daysWithCheckin, daysWithEmotion,
    avgCalories:  calDays  > 0 ? Math.round(totalCalSum  / calDays)  : null,
    avgProtein:   protDays > 0 ? Math.round(totalProtSum / protDays) : null,
    avgWater:     waterDays > 0 ? parseFloat((totalWaterSum / waterDays / 1000).toFixed(1)) : null,
    topEmotions,
    topSymptoms,
    missionEventsCount,
  };
}

// ── buildBehavioralInsights ───────────────────────────────────────────────────

export function buildBehavioralInsights(days = 7): BehavioralInsights {
  const snap    = buildTodaySnapshot();
  const recent  = buildRecentSnapshot(days);
  const events7 = safeGet(() => glpyBlackBox.getRecentEvents(days), []);

  // Meta de proteína estimada (simples — 1,6g/kg ou fallback 80g)
  const protGoal = snap.weightKg ? Math.round(snap.weightKg * 1.6) : 80;

  const lowProteinRisk   = snap.mealsCount > 0 && snap.totalProtein < protGoal * 0.6;
  const lowWaterRisk     = snap.waterLiters !== null ? snap.waterLiters < 1.0 : false;
  const sedentaryDay     = !snap.activityDone;
  const sweetCraving     = snap.hasSweetCraving;
  const sideEffectAttention = snap.symptoms.length > 0;
  const protocolEngaged  = snap.todayEventTypes.includes('protocol_day_opened') || snap.missionsDoneCount > 0;

  const missionWithoutRealRecord = (() => {
    const missionSyncEvents = events7.filter(e =>
      e.type === 'mission_synced_to_meal' || e.type === 'mission_synced_to_water' || e.type === 'mission_synced_to_activity'
    );
    const missionCompletedToday = events7.filter(e => e.type === 'mission_completed' && e.date === snap.date);
    return missionCompletedToday.length > 0 && missionSyncEvents.filter(e => e.date === snap.date).length === 0;
  })();

  const reboundAttention = events7.some(e =>
    e.signal === 'fear_of_rebound' || (e.payload?.symptomKeys || []).includes('weight_gain')
  );
  const muscleLossAttention = events7.some(e =>
    e.signal === 'fear_of_muscle_loss' || e.signal === 'muscle_loss_risk'
  );
  const hairLossAttention = events7.some(e =>
    e.signal === 'hair_loss_reported' || e.signal === 'hair_loss' || e.type === 'hair_loss_reported'
  );

  // Tracking inconsistente: < 3 dias com registro nas últimas 7 dias
  const inconsistentTracking = recent.daysWithMeals < 3 && recent.daysWithCheckin < 3;

  // Lacunas em linguagem natural
  const gaps: string[] = [];
  if (snap.mealsCount === 0)              gaps.push('Nenhuma refeição registrada hoje.');
  if (snap.totalProtein < protGoal * 0.5 && snap.mealsCount > 0) gaps.push(`Proteína baixa: ${snap.totalProtein}g de ${protGoal}g estimado.`);
  if (!snap.waterLiters || snap.waterLiters < 1) gaps.push('Hidratação insuficiente — menos de 1L registrado.');
  if (!snap.activityDone)                 gaps.push('Nenhuma atividade física registrada hoje.');
  if (!snap.checkInDone)                  gaps.push('Check-in de hoje ainda não concluído.');
  if (snap.protocolName && snap.missionsDoneCount === 0) gaps.push(`Protocolo "${snap.protocolName}" ativo mas nenhuma missão concluída hoje.`);
  if (snap.protocolName && snap.missionsDoneCount > 0 && missionWithoutRealRecord) {
    gaps.push('Missão marcada no protocolo mas sem registro real correspondente (refeição/água/atividade).');
  }

  return {
    lowProteinRisk, lowWaterRisk, sedentaryDay, sweetCraving,
    sideEffectAttention, protocolEngaged, missionWithoutRealRecord,
    reboundAttention, muscleLossAttention, hairLossAttention,
    inconsistentTracking, gaps,
  };
}

// ── buildAIContextFromSnapshot ────────────────────────────────────────────────

export function buildAIContextFromSnapshot(days = 7): string {
  try {
    const snap     = buildTodaySnapshot();
    const insights = buildBehavioralInsights(days);
    const recent   = buildRecentSnapshot(days);
    const lines: string[] = ['=== GLPY USER SNAPSHOT (fonte: glpyStore canônico) ==='];

    // 1. Identidade
    const id: string[] = [`Usuário: ${snap.name}`];
    if (snap.medication && snap.dose)        id.push(`Medicamento: ${snap.medication} ${snap.dose}`);
    if (snap.weightKg)                        id.push(`Peso atual: ${snap.weightKg} kg`);
    if (snap.goalWeightKg)                    id.push(`Peso meta: ${snap.goalWeightKg} kg`);
    if (snap.weightKg && snap.goalWeightKg)   id.push(`Falta emagrecer: ${Math.max(0, snap.weightKg - snap.goalWeightKg).toFixed(1)} kg`);
    lines.push(id.join(' | '));

    // 2. Protocolo ativo — PRIORIDADE MÁXIMA
    if (snap.protocolName) {
      const p: string[] = [
        `Protocolo ATIVO: ${snap.protocolName} — Dia ${snap.protocolDay ?? '?'}/${snap.protocolTotal ?? 7}`,
      ];
      if (snap.protocolDayCompleted) {
        // Dia concluído hoje — próximo bloqueado até amanhã
        p.push(`Status do dia: CONCLUÍDO hoje. Todas as missões foram realizadas.`);
        p.push(`Missões restantes hoje: 0 (dia encerrado).`);
        p.push(`Próximo: Dia ${(snap.protocolDay ?? 0) + 1} — BLOQUEADO até amanhã.`);
        p.push(`INSTRUÇÃO: Se o usuário perguntar quais missões faltam hoje, responder que NENHUMA falta — o dia foi concluído. NÃO listar missões do Dia ${(snap.protocolDay ?? 0) + 1} como pendentes hoje.`);
      } else if (snap.missionsToday.length > 0) {
        p.push(`Missões de hoje (${snap.missionsDoneCount}/${snap.missionsToday.length} concluídas):`);
        snap.missionsToday.forEach(m => {
          p.push(`  ${m.status === 'concluida' ? '[x]' : '[ ]'} ${m.texto}`);
        });
      } else {
        p.push('Missões: não acessadas hoje (usuário não abriu o protocolo).');
      }
      if (snap.protocolCheckinSelected) {
        p.push(`Check-in do protocolo selecionado: "${snap.protocolCheckinSelected}"`);
      }
      lines.push(p.join('\n'));
    } else {
      lines.push('Protocolo ATIVO: Nenhum selecionado.');
    }

    // 3. Hoje — refeições (fonte real: glpy_refeicoes_hoje)
    const food: string[] = ['Alimentação de hoje:'];
    if (snap.mealsCount > 0) {
      food.push(`  Total: ${snap.mealsCount} refeição(ões) | ${snap.totalCalories} kcal | ${snap.totalProtein}g prot | ${snap.totalCarbs}g carb | ${snap.totalFat}g gord`);
      snap.meals.forEach(m => food.push(`  - ${m.nome}: ${m.calories} kcal, ${m.protein}g prot [${m.tipo}]`));
    } else {
      food.push('  Nenhuma refeição registrada hoje.');
    }
    lines.push(food.join('\n'));

    // 4. Água (fonte real: glpy_agua_hoje)
    if (snap.waterLiters !== null) {
      lines.push(`Hidratação hoje: ${snap.waterLiters.toFixed(1)}L${snap.waterLiters >= 2.0 ? ' ✓ meta atingida' : ' (meta: 2L)'}`);
    } else {
      lines.push('Hidratação hoje: não registrada.');
    }

    // 5. Atividade
    if (snap.activityDone) {
      const parts = [`Atividade hoje: ${snap.activityType || 'atividade'}`];
      if (snap.activityDuration) parts.push(`${snap.activityDuration} min`);
      if (snap.activityCalories) parts.push(`~${snap.activityCalories} kcal`);
      lines.push(parts.join(', '));
    } else {
      lines.push('Atividade hoje: não registrada.');
    }

    // 6. Evolução corporal
    if (snap.hasCurrentMeasurements) {
      const bodyLines: string[] = ['Evolução corporal:'];
      const medFields: Array<[string, keyof typeof snap.bodyMeasuresCurrent]> = [
        ['Cintura', 'cintura'], ['Busto', 'busto'], ['Coxa', 'coxa'], ['Quadril', 'quadril'], ['Panturrilha', 'panturrilha'],
      ];
      for (const [label, key] of medFields) {
        const cur = snap.bodyMeasuresCurrent[key];
        const ini = snap.bodyMeasuresInitial[key];
        const dif = snap.bodyMeasuresDiffs[key];
        if (cur === undefined) continue;
        if (ini !== undefined && dif !== undefined && dif !== 0) {
          const arrow = dif > 0 ? `↓ ${dif.toFixed(1)} cm` : `↑ ${Math.abs(dif).toFixed(1)} cm`;
          bodyLines.push(`  ${label}: ${ini} cm → ${cur} cm (${arrow})`);
        } else {
          bodyLines.push(`  ${label}: ${cur} cm`);
        }
      }
      if (snap.hasBodyEvolution && snap.bodyMeasuresDiffs.totalCm !== 0) {
        bodyLines.push(`  Total reduzido: ${snap.bodyMeasuresDiffs.totalCm.toFixed(1)} cm`);
      }
      if (!snap.hasInitialMeasurements) {
        bodyLines.push('  Medidas iniciais não registradas — sem base para comparação.');
      }
      lines.push(bodyLines.join('\n'));
    } else {
      lines.push('Evolução corporal: medidas não registradas.');
    }

    // 7. Emoção e estado
    const emotional: string[] = ['Estado emocional:'];
    if (snap.emotionMood)   emotional.push(`  Humor: ${snap.emotionMood}`);
    if (snap.emotionEnergy !== null) emotional.push(`  Energia: ${snap.emotionEnergy}/5`);
    if (snap.dayFeeling)    emotional.push(`  Dia: ${snap.dayFeeling}`);
    if (snap.hasSweetCraving) emotional.push('  ⚠ Sinal de fome de doce/craving registrado hoje.');
    if (emotional.length === 1) emotional.push('  Sem registro de humor hoje.');
    lines.push(emotional.join('\n'));

    // 8. Sintomas/efeitos
    if (snap.symptoms.length > 0) {
      lines.push(`Sintomas hoje: ${snap.symptoms.join(', ')}`);
    } else if (snap.noSymptoms) {
      lines.push('Sintomas hoje: Nenhum sintoma relatado.');
    } else {
      lines.push('Sintomas hoje: não registrados.');
    }

    // 9. Aplicação e check-in
    const adherence: string[] = [];
    adherence.push(`Aplicação GLP-1: ${snap.injectionDone ? 'registrada hoje' : (snap.injectionDate ? `última em ${snap.injectionDate}` : 'não registrada')}`);
    adherence.push(`Check-in de hoje: ${snap.checkInDone ? `concluído (${snap.dayFeeling || ''})` : 'pendente'}`);
    if (snap.checkInStreak > 0) adherence.push(`Sequência: ${snap.checkInStreak} dias`);
    lines.push(adherence.join(' | '));

    // 10. Lacunas do dia
    if (insights.gaps.length > 0) {
      lines.push('Lacunas de hoje:\n' + insights.gaps.map(g => `  [!] ${g}`).join('\n'));
    }

    // 11. Sinais comportamentais ativos
    const signals: string[] = [];
    if (insights.lowProteinRisk)          signals.push('low_protein_risk');
    if (insights.lowWaterRisk)            signals.push('low_water_risk');
    if (insights.sedentaryDay)            signals.push('sedentary_day');
    if (insights.sweetCraving)            signals.push('sweet_craving');
    if (insights.sideEffectAttention)     signals.push('side_effect_attention');
    if (insights.protocolEngaged)         signals.push('protocol_engaged');
    if (insights.missionWithoutRealRecord) signals.push('mission_without_real_record');
    if (insights.reboundAttention)        signals.push('rebound_attention');
    if (insights.muscleLossAttention)     signals.push('muscle_loss_attention');
    if (insights.hairLossAttention)       signals.push('hair_loss_attention');
    if (insights.inconsistentTracking)    signals.push('inconsistent_tracking');
    if (signals.length > 0) {
      lines.push(`Sinais comportamentais ativos: ${signals.join(', ')}`);
    }

    // 12. Resumo 7 dias
    const recentParts: string[] = [
      `Últimos ${recent.days} dias:`,
      `  Refeições: ${recent.daysWithMeals}/${recent.days} dias`,
      `  Água: ${recent.daysWithWater}/${recent.days} dias`,
      `  Atividade: ${recent.daysWithActivity}/${recent.days} dias`,
      `  Check-in: ${recent.daysWithCheckin}/${recent.days} dias`,
    ];
    if (recent.avgCalories)  recentParts.push(`  Média kcal: ${recent.avgCalories}`);
    if (recent.avgProtein)   recentParts.push(`  Média proteína: ${recent.avgProtein}g`);
    if (recent.avgWater)     recentParts.push(`  Média água: ${recent.avgWater}L`);
    if (recent.topEmotions.length > 0) recentParts.push(`  Emoções frequentes: ${recent.topEmotions.join(', ')}`);
    if (recent.topSymptoms.length > 0) recentParts.push(`  Sintomas frequentes: ${recent.topSymptoms.join(', ')}`);
    if (recent.missionEventsCount > 0) recentParts.push(`  Missões concluídas: ${recent.missionEventsCount}`);
    lines.push(recentParts.join('\n'));

    lines.push('IMPORTANTE: Use esses dados para respostas personalizadas. Nunca invente dados ausentes — use "não registrado".');

    return '\n\n' + lines.join('\n\n') + '\n\n';
  } catch (err) {
    return `\n\n[UserSnapshot error: ${err}]\n\n`;
  }
}
