// GLPY — glpyStore
// BUG 16A: camada canônica de dados — localStorage apenas.
//
// Regras:
// - Não migra telas existentes neste bug (BUG 16B+ farão isso tela por tela).
// - Não usa Firebase.
// - Preserva todas as chaves atuais do localStorage sem renomear.
// - Mantém compatibilidade total com dados já salvos.
// - Todas as escritas disparam local-storage-change via localStorageAdapter.

import {
  readJSON,
  writeJSON,
  readString,
  writeString,
  removeKey,
  emitStorageChange,
} from './localStorageAdapter';
import { getLocalDateKey } from '../utils/formatters';

import type {
  GlpyProfile,
  GlpyProfilePhoto,
  GlpyMeal,
  GlpyWater,
  GlpyEmotion,
  GlpyActivity,
  GlpyCheckIn,
  GlpyBodyMeasurements,
  GlpyTreatment,
  GlpyAIUsage,
  GlpyActiveProtocol,
} from './types';

// ── Chaves canônicas (não renomear) ──────────────────────────────────────────

const KEYS = {
  onboarding:          'glpy_onboarding',
  nome:                'glpy_nome',
  email:               'glpy_email',
  altura:              'glpy_altura',
  pesoAtual:           'glpy_peso_atual',
  pesoSonho:           'glpy_peso_sonho',
  medicamento:         'glpy_medicamento',
  profilePhoto:        'glpy_profile_photo',
  aguaHoje:            'glpy_agua_hoje',
  refeicoesHoje:       'glpy_refeicoes_hoje',
  emocaoHoje:          'glpy_emocao_hoje',
  todayEmotion:        'glpy_today_emotion',
  atividadeHoje:       'glpy_atividade_hoje',
  todayActivity:       'glpy_today_activity',
  checkinHoje:         'glpy_checkin_hoje',
  checkinHistorico:    'glpy_checkin_historico',
  aiUsage:             'glpy_ai_usage',
  medidasCorporais:    'glpy_medidas_corporais',
  protocoloAtivo:               'glpy_protocolo_ativo',
  activeProtocol:               'glpy_active_protocol',
  frequencia:                   'glpy_frequencia',
  dose:                         'glpy_dose',
  frequenciaPersonalizadaDias:  'glpy_frequencia_personalizada_dias',
  injecaoUltima:                'glpy_injecao_ultima',
  injecaoLocais:                'glpy_injecao_locais',
  ultimaAplicacao:              'glpy_ultima_aplicacao',
  injectionEffectsToday:        'glpy_injection_effects_today',
  injectionEffectsHistory:      'glpy_injection_effects_history',
  injectionHistory:             'glpy_injection_history',
  xp:                           'glpy_xp',
  streak:                       'glpy_streak',
  nivel:                        'glpy_nivel',
  quizCocriacaoXpClaimed:       'glpy_quiz_cocriacao_xp_claimed',
  bodyPhotos:                   'glpy_body_photos',
  resultsSummary:               'glpy_results_summary',
  latestWeight:                 'glpy_latest_weight',
  medidasIniciais:              'glpy_medidas_iniciais',
  treatmentStartDate:           'glpy_treatment_start_date',
  applicationWeekday:           'glpy_application_weekday',
  applicationMonthDay:          'glpy_application_month_day',
} as const;

// ── Helpers internos ─────────────────────────────────────────────────────────

function todayKey(): string {
  return getLocalDateKey();
}

// ── 1. profile ────────────────────────────────────────────────────────────────

const profile = {
  get(): GlpyProfile {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onb: any = readJSON(KEYS.onboarding, {});
    return {
      uid:           readString('glpy_uid') || undefined,
      name:          readString(KEYS.nome)  || onb?.nome || onb?.name || undefined,
      email:         readString(KEYS.email) || onb?.email || undefined,
      height:        parseFloat(readString(KEYS.altura))  || onb?.altura  || undefined,
      currentWeight: parseFloat(readString(KEYS.pesoAtual)) || onb?.peso_atual || onb?.pesoAtual || undefined,
      goalWeight:    parseFloat(readString(KEYS.pesoSonho)) || onb?.peso_sonho || onb?.pesoSonho || undefined,
      medication:    readString(KEYS.medicamento) || onb?.medicamento || undefined,
      onboarding:    onb,
    };
  },

  update(partial: Partial<GlpyProfile>): void {
    if (partial.name       != null) writeJSON(KEYS.nome,        partial.name);
    if (partial.email      != null) writeJSON(KEYS.email,       partial.email);
    if (partial.height     != null) writeJSON(KEYS.altura,      partial.height);
    if (partial.currentWeight != null) writeJSON(KEYS.pesoAtual, partial.currentWeight);
    if (partial.goalWeight != null) writeJSON(KEYS.pesoSonho,   partial.goalWeight);
    if (partial.medication != null) writeJSON(KEYS.medicamento, partial.medication);
    if (partial.onboarding != null) writeJSON(KEYS.onboarding,  partial.onboarding);
    emitStorageChange();
  },

  getProfilePhoto(): GlpyProfilePhoto | null {
    const raw = readString(KEYS.profilePhoto);
    if (!raw) return null;
    try {
      if (raw.trim().startsWith('{')) {
        // formato canônico: { imageBase64, updatedAt }
        const parsed = JSON.parse(raw) as Partial<GlpyProfilePhoto>;
        if (parsed?.imageBase64) return parsed as GlpyProfilePhoto;
        return null;
      }
      // formato legado: string base64 direta
      return {
        imageBase64: raw,
        updatedAt:   '',
      };
    } catch {
      return null;
    }
  },

  saveProfilePhoto(photo: GlpyProfilePhoto): void {
    writeJSON(KEYS.profilePhoto, photo);
  },

  removeProfilePhoto(): void {
    removeKey(KEYS.profilePhoto);
  },
};

// ── 2. meals ─────────────────────────────────────────────────────────────────

// Normaliza campos antigos e novos para o formato canônico GlpyMeal.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMeal(raw: any): GlpyMeal {
  const calories = parseFloat(String(raw.calories ?? raw.calorias      ?? 0)) || 0;
  const protein  = parseFloat(String(raw.protein  ?? raw.proteina ?? raw.proteinas ?? 0)) || 0;
  const carbs    = parseFloat(String(raw.carbs    ?? raw.carboidratos  ?? 0)) || 0;
  const fat      = parseFloat(String(raw.fat      ?? raw.gordura ?? raw.gorduras   ?? 0)) || 0;
  const nome     = String(raw.nome ?? raw.name ?? raw.description ?? raw.descricao ?? '');
  const descricao = raw.descricao ?? raw.description ?? undefined;

  // Derivar date / createdAt a partir dos campos disponíveis
  let date      = '';
  let createdAt = '';

  if (typeof raw.date === 'string' && raw.date.length >= 10) {
    date      = raw.date.slice(0, 10);
    createdAt = raw.createdAt ?? new Date(date).toISOString();
  } else if (typeof raw.createdAt === 'string' && raw.createdAt.length >= 10) {
    createdAt = raw.createdAt;
    date      = raw.createdAt.slice(0, 10);
  } else if (raw.savedAt) {
    const d = new Date(raw.savedAt);
    date      = getLocalDateKey(d);
    createdAt = d.toISOString();
  } else {
    // sem campo de data — tratar como hoje (compatibilidade com dados antigos)
    date      = todayKey();
    createdAt = new Date().toISOString();
  }

  return {
    ...raw,          // preserva campos extras (detectedFoods, glp1Analysis, etc.)
    id:        raw.id ?? String(raw.savedAt ?? Date.now()),
    nome,
    descricao,
    tipo:      raw.tipo ?? (raw.source === 'FoodPhotoAnalysisScreen' ? 'foto_ia' : 'manual'),
    origem:    raw.origem ?? raw.source ?? 'FoodLogScreen',
    calories,
    protein,
    carbs,
    fat,
    createdAt,
    date,
    savedAt:   raw.savedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isToday(raw: any, today = todayKey()): boolean {
  if (typeof raw.date === 'string'      && raw.date.length >= 10)
    return raw.date.slice(0, 10) === today;
  if (typeof raw.createdAt === 'string' && raw.createdAt.length >= 10)
    return raw.createdAt.slice(0, 10) === today;
  if (raw.savedAt)
    return getLocalDateKey(new Date(raw.savedAt)) === today;
  return true; // sem data → compatibilidade com dados antigos
}

const meals = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll(): GlpyMeal[] {
    return readJSON<any[]>(KEYS.refeicoesHoje, []).map(normalizeMeal);
  },

  getToday(): GlpyMeal[] {
    const today = todayKey();
    return readJSON<any[]>(KEYS.refeicoesHoje, [])
      .filter(e => isToday(e, today))
      .map(normalizeMeal);
  },

  saveMeal(meal: GlpyMeal): void {
    const existing = readJSON<any[]>(KEYS.refeicoesHoje, []);
    // Deduplicação por ID — impede duplo salvamento mesmo que o caller chame duas vezes
    if (meal.id && existing.some((e: any) => e.id === meal.id)) return;
    existing.push(meal);
    writeJSON(KEYS.refeicoesHoje, existing);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateAll(meals: any[]): void {
    writeJSON(KEYS.refeicoesHoje, meals);
  },

  normalizeMeal,
  isToday,
};

// ── 3. water ──────────────────────────────────────────────────────────────────

const water = {
  getToday(): GlpyWater | null {
    return readJSON<GlpyWater | null>(KEYS.aguaHoje, null);
  },

  saveToday(value: GlpyWater): void {
    writeJSON(KEYS.aguaHoje, value);
  },
};

// ── 4. emotion ───────────────────────────────────────────────────────────────

const emotion = {
  getToday(): GlpyEmotion | null {
    return readJSON<GlpyEmotion | null>(KEYS.emocaoHoje, null);
  },

  saveToday(value: GlpyEmotion): void {
    writeJSON(KEYS.emocaoHoje, value);
    // glpy_today_emotion é uma segunda chave espelhada usada por alguns componentes
    if (value.mood != null) {
      writeJSON(KEYS.todayEmotion, {
        emotion:         value.mood,
        emotionalEnergy: value.energy,
        notes:           value.note ?? '',
        date:            value.date ?? todayKey(),
        savedAt:         new Date().toISOString(),
      });
    }
  },
};

// ── 5. activity ───────────────────────────────────────────────────────────────

function normalizeActivityCalories(obj: Record<string, unknown>): number {
  for (const field of ['activityCaloriesBurned', 'kcalBurned', 'calories', 'kcal', 'burnedCalories', 'estimatedCalories']) {
    const v = parseFloat(String(obj[field] ?? ''));
    if (!isNaN(v) && v > 0) return v;
  }
  return 0;
}

const activity = {
  getToday(): GlpyActivity | null {
    const today = todayKey();

    // Single-object format (glpy_atividade_hoje — legacy ActivityScreen write)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const single = readJSON<any>(KEYS.atividadeHoje, null);
    let singleCals = 0;
    let singleIsToday = false;
    if (single && typeof single === 'object') {
      const entryDate = single.savedAt
        ? getLocalDateKey(new Date(single.savedAt))
        : (single.date ?? '');
      if (entryDate === today) {
        singleIsToday = true;
        singleCals = normalizeActivityCalories(single as Record<string, unknown>);
      }
    }

    // Array format (glpy_today_activity — glpyLocalIntelligence saveActivityEntry write)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = readJSON<any>(KEYS.todayActivity, null);
    let arrCals = 0;
    if (Array.isArray(arr) && arr.length > 0) {
      arrCals = arr
        .filter((e: Record<string, unknown>) => e.date === today)
        .reduce((sum: number, e: Record<string, unknown>) => sum + normalizeActivityCalories(e), 0);
    }

    if (!singleIsToday && arrCals === 0) return null;

    const activityCaloriesBurned = arrCals > 0 ? arrCals : singleCals;
    const base = singleIsToday ? single : {};
    return { ...base, activityCaloriesBurned } as GlpyActivity;
  },

  saveToday(value: GlpyActivity): void {
    writeJSON(KEYS.atividadeHoje, value);
    // glpy_today_activity é gerenciado pelo saveActivityEntry (array) — não sobrescrever aqui
  },
};

// ── 6. checkin ────────────────────────────────────────────────────────────────

const checkin = {
  getToday(): GlpyCheckIn | null {
    return readJSON<GlpyCheckIn | null>(KEYS.checkinHoje, null);
  },

  saveToday(value: GlpyCheckIn): void {
    writeJSON(KEYS.checkinHoje, value);
  },

  getHistory(): GlpyCheckIn[] {
    return readJSON<GlpyCheckIn[]>(KEYS.checkinHistorico, []);
  },

  saveHistory(value: GlpyCheckIn[]): void {
    writeJSON(KEYS.checkinHistorico, value);
  },
};

// ── 7. bodyMeasurements ───────────────────────────────────────────────────────

const bodyMeasurements = {
  get(): GlpyBodyMeasurements | null {
    return readJSON<GlpyBodyMeasurements | null>(KEYS.medidasCorporais, null);
  },

  save(value: GlpyBodyMeasurements): void {
    writeJSON(KEYS.medidasCorporais, value);
  },
};

// ── 8. treatment ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const treatment = {
  // Configurações do tratamento (plain strings)
  getMedication(): string                      { return readString(KEYS.medicamento, 'Mounjaro®'); },
  saveMedication(v: string): void              { writeString(KEYS.medicamento, v); },
  getDose(): string                            { return readString(KEYS.dose, '2,5 mg'); },
  saveDose(v: string): void                    { writeString(KEYS.dose, v); },
  getFrequencia(): string                      { return readString(KEYS.frequencia, 'Semanal'); },
  saveFrequencia(v: string): void              { writeString(KEYS.frequencia, v); },
  getFrequenciaPersonalizadaDias(): string     { return readString(KEYS.frequenciaPersonalizadaDias, '7'); },
  saveFrequenciaPersonalizadaDias(v: string): void { writeString(KEYS.frequenciaPersonalizadaDias, v); },

  // Última injeção (JSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getUltimaInjecao(): any                      { return readJSON<any>(KEYS.injecaoUltima, null); },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveUltimaInjecao(v: any): void              { writeJSON(KEYS.injecaoUltima, v); },

  // Locais de injeção (JSON array)
  getLocaisInjecao(): string[]                 { return readJSON<string[]>(KEYS.injecaoLocais, []); },
  saveLocaisInjecao(v: string[]): void         { writeJSON(KEYS.injecaoLocais, v); },

  // Última aplicação — date string (AlertaInjecao)
  getUltimaAplicacao(): string                 { return readString(KEYS.ultimaAplicacao, ''); },
  saveUltimaAplicacao(v: string): void         { writeString(KEYS.ultimaAplicacao, v); },

  // Efeitos colaterais (JSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEfeitosHoje(): any                        { return readJSON<any>(KEYS.injectionEffectsToday, null); },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveEfeitosHoje(v: any): void                { writeJSON(KEYS.injectionEffectsToday, v); },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEfeitosHistorico(): any[]                 { return readJSON<any[]>(KEYS.injectionEffectsHistory, []); },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveEfeitosHistorico(v: any[]): void         { writeJSON(KEYS.injectionEffectsHistory, v); },

  // Data de início do tratamento (YYYY-MM-DD) — null se não definido
  getTreatmentStartDate(): string | null        { const v = readString(KEYS.treatmentStartDate, ''); return v || null; },
  saveTreatmentStartDate(v: string | null): void {
    if (v) writeString(KEYS.treatmentStartDate, v);
    else   removeKey(KEYS.treatmentStartDate);
  },

  // Dia da semana da aplicação para frequência semanal (monday/tuesday/...)
  getApplicationWeekday(): string | null        { const v = readString(KEYS.applicationWeekday, ''); return v || null; },
  saveApplicationWeekday(v: string | null): void {
    if (v) writeString(KEYS.applicationWeekday, v);
    else   removeKey(KEYS.applicationWeekday);
  },

  // Dia do mês da aplicação para frequência mensal (1–31)
  getApplicationMonthDay(): number | null {
    const v = parseInt(readString(KEYS.applicationMonthDay, ''), 10);
    return isNaN(v) || v < 1 || v > 31 ? null : v;
  },
  saveApplicationMonthDay(v: number | null): void {
    if (v !== null) writeString(KEYS.applicationMonthDay, String(v));
    else            removeKey(KEYS.applicationMonthDay);
  },

  // Histórico de aplicações (compatível com glpy_injection_history da IA)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInjectionHistory(): any[]                 { return readJSON<any[]>(KEYS.injectionHistory, []); },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addInjectionRecord(record: { id: string; medication: string; dose: string; local: string; date: string; timestamp: string; savedAt: number }): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = readJSON<any[]>(KEYS.injectionHistory, []);
    if (history.some((e: any) => e.id === record.id)) return; // deduplicação
    writeJSON(KEYS.injectionHistory, [record, ...history].slice(0, 50));
  },

  // Legado — mantido por compatibilidade (não usado externamente)
  get(): GlpyTreatment | null                  { return readJSON<GlpyTreatment | null>(KEYS.medicamento, null); },
  save(value: GlpyTreatment): void             { writeJSON(KEYS.medicamento, value); },
};

// ── 9. aiUsage ────────────────────────────────────────────────────────────────

const aiUsage = {
  get(): GlpyAIUsage {
    return readJSON<GlpyAIUsage>(KEYS.aiUsage, { used: 0, limit: 30 });
  },

  save(value: GlpyAIUsage): void {
    writeJSON(KEYS.aiUsage, value);
  },

  increment(): void {
    const current = aiUsage.get();
    aiUsage.save({ ...current, used: current.used + 1, updatedAt: new Date().toISOString() });
  },
};

// ── 10. protocol ──────────────────────────────────────────────────────────────

const protocol = {
  getActive(): GlpyActiveProtocol | null {
    // tenta glpy_active_protocol primeiro, depois glpy_protocolo_ativo
    return (
      readJSON<GlpyActiveProtocol | null>(KEYS.activeProtocol,  null) ??
      readJSON<GlpyActiveProtocol | null>(KEYS.protocoloAtivo,  null)
    );
  },

  saveActive(value: GlpyActiveProtocol): void {
    writeJSON(KEYS.activeProtocol,  value);
    writeJSON(KEYS.protocoloAtivo,  value);
  },

  removeActive(): void {
    removeKey(KEYS.activeProtocol);
    removeKey(KEYS.protocoloAtivo);
  },
};

// ── 11. gamification ──────────────────────────────────────────────────────────

const gamification = {
  getXP(): number {
    const v = parseInt(readString(KEYS.xp, '0'), 10);
    return isNaN(v) ? 0 : v;
  },
  saveXP(value: number): void {
    writeString(KEYS.xp, String(value));
  },
  addXP(amount: number): void {
    gamification.saveXP(gamification.getXP() + amount);
  },
  getStreak(): number {
    const v = parseInt(readString(KEYS.streak, '0'), 10);
    return isNaN(v) ? 0 : v;
  },
  saveStreak(value: number): void {
    writeString(KEYS.streak, String(value));
  },
  getLevel(): number {
    const v = parseInt(readString(KEYS.nivel, '1'), 10);
    return isNaN(v) ? 1 : v;
  },
  saveLevel(value: number): void {
    writeString(KEYS.nivel, String(value));
  },
  getQuizCocriacaoClaimed(): boolean {
    return readString(KEYS.quizCocriacaoXpClaimed, '') === 'true';
  },
  saveQuizCocriacaoClaimed(value: boolean): void {
    writeString(KEYS.quizCocriacaoXpClaimed, value ? 'true' : 'false');
  },
};

// ── 12. progress ──────────────────────────────────────────────────────────────

const progress = {
  getBodyPhotos(): any[]                      { return readJSON<any[]>(KEYS.bodyPhotos, []); },
  saveBodyPhotos(value: any[]): void          { writeJSON(KEYS.bodyPhotos, value); },
  addBodyPhoto(photo: any): void              { writeJSON(KEYS.bodyPhotos, [...progress.getBodyPhotos(), photo]); },
  getResultsSummary(): Record<string, any>    { return readJSON<Record<string, any>>(KEYS.resultsSummary, {}); },
  saveResultsSummary(value: Record<string, any>): void { writeJSON(KEYS.resultsSummary, value); },
  getLatestWeight(): any                      { return readJSON<any>(KEYS.latestWeight, null); },
  saveLatestWeight(value: any): void          { writeJSON(KEYS.latestWeight, value); },
  getInitialMeasurements(): Record<string, any> | null { return readJSON<Record<string, any> | null>(KEYS.medidasIniciais, null); },
  saveInitialMeasurements(value: Record<string, any>): void { writeJSON(KEYS.medidasIniciais, value); },
  // Salva medidas iniciais somente se não houver baseline com campos de medida válidos.
  // Mais robusto que !getInitialMeasurements() — protege contra {} vazio que bloqueia a condição.
  ensureInitialMeasurements(value: Record<string, any>): boolean {
    const existing = readJSON<Record<string, any> | null>(KEYS.medidasIniciais, null);
    const MEASURE_FIELDS = ['cintura', 'waist', 'quadril', 'hip', 'coxa', 'thigh', 'busto', 'chest', 'panturrilha', 'calf'];
    const hasBaseline = existing != null && MEASURE_FIELDS.some(k => {
      const v = parseFloat(String(existing[k] ?? ''));
      return !isNaN(v) && v > 0;
    });
    if (hasBaseline) return false;
    writeJSON(KEYS.medidasIniciais, value);
    return true;
  },
};

// ── Export ────────────────────────────────────────────────────────────────────

export const glpyStore = {
  profile,
  meals,
  water,
  emotion,
  activity,
  checkin,
  bodyMeasurements,
  treatment,
  aiUsage,
  protocol,
  gamification,
  progress,
};
