// GLPY — Mission Bridge
// Sprint 17A: classifica missões de protocolo por tipo via palavras-chave.
// Não altera texto da UI. Não inventa dados. Só cataloga comportamento.

import { MISSION_TYPES, MISSION_TYPE_TO_SIGNAL } from './glpyEventCatalog';

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
  suggestScreen?:    string; // tela sugerida para o usuário ir depois
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
