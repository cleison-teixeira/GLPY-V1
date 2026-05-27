// GLPY — Mission Bridge
// Sprint 17A: classifica missões de protocolo por tipo via palavras-chave.
// Sprint 17A.1: extrai valores numéricos e sincroniza com glpyStore quando há dado explícito.
// Regras: não altera texto da UI. Não inventa dados. Missão genérica nunca cria macro.

import { MISSION_TYPES, MISSION_TYPE_TO_SIGNAL } from './glpyEventCatalog';
import { glpyStore } from './glpyStore';

// ── Classificação por palavras-chave (PT-BR) ──────────────────────────────────

const KEYWORD_RULES: Array<{ keywords: string[]; type: string }> = [
  {
    keywords: ['foto', 'fotografi', 'antes', 'depois', 'imagem', 'câmera'],
    type: MISSION_TYPES.BODY_PHOTO,
  },
  {
    keywords: ['injeção', 'injecao', 'aplicar', 'aplicação', 'agulha', 'caneta'],
    type: MISSION_TYPES.INJECTION,
  },
  {
    keywords: ['medicamento', 'medicação', 'dose', 'remédio', 'tomar'],
    type: MISSION_TYPES.TREATMENT,
  },
  {
    keywords: ['sintoma', 'efeito', 'colateral', 'náusea', 'nausea', 'enjoo'],
    type: MISSION_TYPES.SYMPTOM_TRACKING,
  },
  {
    keywords: ['medo', 'ansiedade', 'ansios', 'preocup'],
    type: MISSION_TYPES.FEAR_REFLECTION,
  },
  {
    keywords: ['emoção', 'emocao', 'sentimento', 'como você se sente', 'humor'],
    type: MISSION_TYPES.EMOTION,
  },
  {
    keywords: ['sono', 'dormir', 'dormiu', 'insônia', 'insonia', 'descanso'],
    type: MISSION_TYPES.SLEEP,
  },
  {
    keywords: ['caminhar', 'caminhada', 'exercício', 'exercicio', 'atividade', 'treino', 'muscula'],
    type: MISSION_TYPES.ACTIVITY,
  },
  {
    keywords: ['check-in', 'checkin', 'registrar hoje', 'diário'],
    type: MISSION_TYPES.CHECKIN,
  },
  {
    keywords: ['peso', 'balança', 'balanca', 'medida', 'resultado'],
    type: MISSION_TYPES.PROGRESS,
  },
  {
    keywords: ['água', 'agua', 'hidratar', 'hidratação', 'litro', 'ml'],
    type: MISSION_TYPES.HYDRATION,
  },
  {
    keywords: ['registrar refeição', 'registrar refeicao', 'fotografar refeição', 'anotar o que comeu'],
    type: MISSION_TYPES.MEAL_LOG_REQUIRED,
  },
  {
    keywords: ['proteína', 'proteina', 'refeição', 'refeicao', 'comer', 'aliment', 'nutrição', 'nutricao'],
    type: MISSION_TYPES.NUTRITION_BEHAVIOR,
  },
];

/**
 * Classifica uma missão pelo texto do título.
 * Retorna o tipo da missão (MISSION_TYPES) como string.
 * Regra: não altera o texto — apenas lê e classifica.
 */
export function classifyMission(title: string): string {
  const lower = title.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.type;
    }
  }
  return MISSION_TYPES.NUTRITION_BEHAVIOR; // fallback genérico
}

/**
 * Retorna o signal da Black Box para um dado missionType.
 */
export function missionTypeToSignal(missionType: string): string {
  return MISSION_TYPE_TO_SIGNAL[missionType] ?? 'mission_completed';
}

/**
 * Regras de sinergia: quais mission types podem atualizar registros reais.
 * Retorna uma sugestão de ação, sem executar nada — decisão final é do caller.
 */
export interface MissionSynergyHint {
  canUpdateWater:    boolean;
  canUpdateActivity: boolean;
  suggestScreen?:    string;
}

export function getMissionSynergyHint(missionType: string): MissionSynergyHint {
  switch (missionType) {
    case MISSION_TYPES.HYDRATION:
      return { canUpdateWater: true, canUpdateActivity: false };
    case MISSION_TYPES.ACTIVITY:
      return { canUpdateWater: false, canUpdateActivity: true };
    case MISSION_TYPES.MEAL_LOG_REQUIRED:
      return { canUpdateWater: false, canUpdateActivity: false, suggestScreen: 'foodLog' };
    case MISSION_TYPES.BODY_PHOTO:
      return { canUpdateWater: false, canUpdateActivity: false, suggestScreen: 'photoTimeline' };
    case MISSION_TYPES.CHECKIN:
      return { canUpdateWater: false, canUpdateActivity: false, suggestScreen: 'checkin' };
    default:
      return { canUpdateWater: false, canUpdateActivity: false };
  }
}

// ── Extração de valores numéricos ─────────────────────────────────────────────

export interface ExtractedMissionValue {
  proteinG?:   number; // gramas de proteína
  waterMl?:    number; // ml de água (convertido de L se necessário)
  durationMin?: number; // minutos de atividade
  activityType?: string;
}

/**
 * Extrai valor numérico explícito do texto da missão.
 * Regra crítica: só retorna valor quando há número EXPLÍCITO no texto.
 * Missões genéricas (sem número) retornam objeto vazio — nunca criam dados falsos.
 */
export function extractMissionValue(text: string, missionType: string): ExtractedMissionValue {
  const lower = text.toLowerCase();

  if (missionType === MISSION_TYPES.NUTRITION_BEHAVIOR || missionType === MISSION_TYPES.MEAL_LOG_REQUIRED) {
    // Padrões: "53g de proteína", "90g proteína", "proteína: 53g"
    const protMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*g(?:ramas?)?\s*(?:de\s*)?(?:proteína|proteina|prot\b)/i)
      ?? lower.match(/(?:proteína|proteina|prot)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*g/i);
    if (protMatch) {
      const val = parseFloat(protMatch[1].replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 500) return { proteinG: val };
    }
  }

  if (missionType === MISSION_TYPES.HYDRATION) {
    // Padrões: "2L de água", "2000ml", "1,5 litros"
    const mlMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*ml/i);
    if (mlMatch) {
      const val = parseFloat(mlMatch[1].replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 10000) return { waterMl: val };
    }
    const lMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:litros?|l\b)/i);
    if (lMatch) {
      const val = parseFloat(lMatch[1].replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 20) return { waterMl: Math.round(val * 1000) };
    }
  }

  if (missionType === MISSION_TYPES.ACTIVITY) {
    // Padrões: "30 minutos de caminhada", "45 min de treino"
    const durMatch = lower.match(/(\d+)\s*(?:min(?:utos?)?|hrs?|horas?)/i);
    const durMin = durMatch ? parseInt(durMatch[1], 10) : undefined;

    let activityType = 'caminhada';
    if (lower.includes('muscula') || lower.includes('treino') || lower.includes('força')) activityType = 'musculação';
    else if (lower.includes('corr')) activityType = 'corrida';
    else if (lower.includes('bicicleta') || lower.includes('cicl')) activityType = 'bicicleta';
    else if (lower.includes('nata') || lower.includes('piscina')) activityType = 'natação';

    if (durMin && durMin > 0 && durMin < 600) return { durationMin: durMin, activityType };
  }

  return {};
}

// ── Sincronização com glpyStore ───────────────────────────────────────────────

export interface MissionSyncResult {
  synced:    boolean;
  syncType?: 'meal' | 'water' | 'activity' | 'none';
  reason?:   string;
}

/**
 * Cria registro real no glpyStore quando a missão contém valor explícito.
 * Regra crítica: missão genérica (sem valor numérico) → synced: false, nenhum dado criado.
 * Só sincroniza ao MARCAR (isChecking = true). Desmarcar não remove dados.
 */
export function syncMissionToStore(
  missionType: string,
  missionText: string,
  isChecking: boolean,
): MissionSyncResult {
  if (!isChecking) return { synced: false, syncType: 'none', reason: 'unchecking — no data removed' };

  const values = extractMissionValue(missionText, missionType);

  // Proteína explícita → criar refeição protocol_mission
  if (values.proteinG !== undefined) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      glpyStore.meals.saveMeal({
        id:        `protocol_mission_${Date.now()}`,
        nome:      'Proteína registrada no protocolo',
        descricao: missionText.slice(0, 100),
        tipo:      'protocol_mission',
        origem:    'ProtocoloBase',
        calories:  0,
        protein:   values.proteinG,
        carbs:     0,
        fat:       0,
        date:      today,
        createdAt: new Date().toISOString(),
        savedAt:   Date.now(),
      });
      return { synced: true, syncType: 'meal', reason: `protein: ${values.proteinG}g` };
    } catch { return { synced: false, syncType: 'none', reason: 'store write failed' }; }
  }

  // Água explícita → atualizar glpyStore.water
  if (values.waterMl !== undefined) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const existing = glpyStore.water.getToday();
      const prevAmount = (existing?.date === today) ? (parseFloat(String(existing.amount)) || 0) : 0;
      const newAmount = parseFloat((prevAmount + values.waterMl / 1000).toFixed(2));
      glpyStore.water.saveToday({ amount: newAmount, date: today, updatedAt: new Date().toISOString() });
      return { synced: true, syncType: 'water', reason: `water: +${values.waterMl}ml` };
    } catch { return { synced: false, syncType: 'none', reason: 'store write failed' }; }
  }

  // Atividade explícita → atualizar glpyStore.activity
  if (values.durationMin !== undefined) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      glpyStore.activity.saveToday({
        activity:  values.activityType ?? 'caminhada',
        duration:  String(values.durationMin),
        intensity: 'moderada',
        savedAt:   Date.now(),
        date:      today,
      } as any);
      return { synced: true, syncType: 'activity', reason: `activity: ${values.durationMin}min ${values.activityType}` };
    } catch { return { synced: false, syncType: 'none', reason: 'store write failed' }; }
  }

  return { synced: false, syncType: 'none', reason: 'no explicit numeric value in mission text' };
}

// ── Detecção de craving ───────────────────────────────────────────────────────

const CRAVING_KEYWORDS = [
  'fome de doce', 'vontade de doce', 'quero doce', 'fome de açúcar', 'fome de acucar',
  'craving', 'compulsão', 'compulsao', 'vontade de comer', 'fome fora de hora',
  'ansiedade por comida', 'ansiedade por doce', 'vontade de beliscar',
  'fome emocional', 'comi por ansiedade', 'quebrei a dieta',
];

/**
 * Detecta se um texto contém sinal de craving/fome compulsiva.
 * Retorna 'sweet_craving' | 'hunger_craving' | null.
 */
export function detectCravingSignal(text: string): 'sweet_craving' | 'hunger_craving' | null {
  const lower = text.toLowerCase();
  const sweetTerms = ['doce', 'açúcar', 'acucar', 'chocolate', 'sorvete', 'bolo', 'biscoito', 'bolacha'];
  if (CRAVING_KEYWORDS.some(kw => lower.includes(kw))) {
    if (sweetTerms.some(t => lower.includes(t))) return 'sweet_craving';
    return 'hunger_craving';
  }
  return null;
}
