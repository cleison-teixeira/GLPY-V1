/**
 * GLPY — Treatment and Injection Utilities
 * Lógica centralizada para cálculo de datas e frequências da medicação.
 */

import { glpyStore } from '../data/glpyStore';

// Índice JS de dia da semana para cada valor canônico
const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

// Converte YYYY-MM-DD em Date local (sem deslocamento de fuso)
function parseLocalDate(isoStr: string): Date | null {
  const parts = isoStr.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export interface NextInjectionInfo {
  hasHistory: boolean;
  nextDateFormatted: string; // ex: "Qui, 21 mai"
  daysRemainingText: string; // ex: "em 3 dias", "Hoje", "Atrasada", "Configure"
  lastDateFormatted: string; // ex: "há 4 dias", "ontem", "hoje", "Sem registro"
  frequencyDays: number;
}

/**
 * Formata uma data no estilo "Qui, 21 mai" em português.
 */
export function formatPortugueseDate(date: Date): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  
  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  
  return `${dayName}, ${dayNum} ${monthName}`;
}

/**
 * Calcula a próxima aplicação com base no histórico glpy_injecao_ultima e frequência.
 */
export function calculateNextInjection(): NextInjectionInfo {
  const defaultInfo: NextInjectionInfo = {
    hasHistory: false,
    nextDateFormatted: "Configure",
    daysRemainingText: "Tratamento",
    lastDateFormatted: "Sem registro",
    frequencyDays: 7
  };

  try {
    const lastInjection = glpyStore.treatment.getUltimaInjecao();
    const frequency     = glpyStore.treatment.getFrequencia();

    // Determinar intervalo em dias
    let interval = 7;
    if (frequency === 'Diária')                                    interval = 1;
    else if (frequency === 'Semanal')                              interval = 7;
    else if (frequency === 'A cada 10 dias')                       interval = 10;
    else if (frequency === 'Quinzenal' || frequency === 'A cada 14 dias') interval = 14;
    else if (frequency === 'Mensal')                               interval = 30;
    else if (frequency === 'Personalizada') {
      const customDaysRaw = glpyStore.treatment.getFrequenciaPersonalizadaDias() || '7';
      const parsedDays    = parseInt(customDaysRaw, 10);
      interval = isNaN(parsedDays) || parsedDays <= 0 ? 7 : parsedDays;
    }

    // Resolver data base: última injeção > treatmentStartDate > sem dados
    let lastDate: Date | null = null;
    const hasInjectionHistory = !!(lastInjection?.savedAt);

    if (hasInjectionHistory) {
      lastDate = new Date(lastInjection.savedAt);
      lastDate.setHours(0, 0, 0, 0);
    } else {
      const startDateStr = glpyStore.treatment.getTreatmentStartDate();
      if (startDateStr) lastDate = parseLocalDate(startDateStr);
    }

    if (!lastDate) return defaultInfo;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Dias desde a data base
    const diffTimeSinceLast = today.getTime() - lastDate.getTime();
    const diffDaysSinceLast = Math.floor(diffTimeSinceLast / (1000 * 60 * 60 * 24));
    let lastDateText = 'Sem registro';
    if (diffDaysSinceLast === 0)      lastDateText = 'hoje';
    else if (diffDaysSinceLast === 1) lastDateText = 'ontem';
    else if (diffDaysSinceLast > 1)   lastDateText = `há ${diffDaysSinceLast} dias`;
    else                              lastDateText = 'hoje';

    // Caso especial: Semanal + applicationWeekday → próxima ocorrência do dia configurado
    if (frequency === 'Semanal') {
      const weekday = glpyStore.treatment.getApplicationWeekday();
      if (weekday && WEEKDAY_INDEX[weekday] !== undefined) {
        const targetDay = WEEKDAY_INDEX[weekday];
        const diff      = (targetDay - today.getDay() + 7) % 7;
        const nextDate  = new Date(today);
        nextDate.setDate(today.getDate() + diff);
        nextDate.setHours(0, 0, 0, 0);

        const diffDaysNext  = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let nextDateFormatted = formatPortugueseDate(nextDate);
        let daysRemainingText = '';
        if (diffDaysNext === 0)       { daysRemainingText = 'Hoje'; nextDateFormatted = 'Hoje'; }
        else if (diffDaysNext === 1)  daysRemainingText = 'Amanhã';
        else                          daysRemainingText = `em ${diffDaysNext} dias`;

        return {
          hasHistory: hasInjectionHistory,
          nextDateFormatted,
          daysRemainingText,
          lastDateFormatted: lastDateText,
          frequencyDays: 7,
        };
      }
    }

    // Cálculo padrão: lastDate + interval
    const nextDate = new Date(lastDate.getTime() + interval * 24 * 60 * 60 * 1000);
    nextDate.setHours(0, 0, 0, 0);

    const diffTimeNext = nextDate.getTime() - today.getTime();
    const diffDaysNext = Math.round(diffTimeNext / (1000 * 60 * 60 * 24));

    let daysRemainingText = '';
    let nextDateFormatted = formatPortugueseDate(nextDate);
    if (diffDaysNext === 0)      { daysRemainingText = 'Hoje'; nextDateFormatted = 'Hoje'; }
    else if (diffDaysNext === 1) daysRemainingText = 'Amanhã';
    else if (diffDaysNext < 0)   daysRemainingText = 'Atrasada';
    else                         daysRemainingText = `em ${diffDaysNext} dias`;

    return {
      hasHistory: hasInjectionHistory,
      nextDateFormatted,
      daysRemainingText,
      lastDateFormatted: lastDateText,
      frequencyDays: interval,
    };
  } catch (error) {
    console.error('[GLPY] Erro ao calcular próxima injeção:', error);
    return defaultInfo;
  }
}
