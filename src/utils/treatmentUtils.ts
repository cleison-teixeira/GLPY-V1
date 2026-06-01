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
    const startDateStr        = glpyStore.treatment.getTreatmentStartDate();
    let lastDate: Date | null = null;
    const hasInjectionHistory = !!(lastInjection?.savedAt);

    if (hasInjectionHistory) {
      lastDate = new Date(lastInjection.savedAt);
      lastDate.setHours(0, 0, 0, 0);
    } else if (startDateStr) {
      lastDate = parseLocalDate(startDateStr);
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

    // Caso especial: Mensal + applicationMonthDay → próxima ocorrência desse dia do mês
    if (frequency === 'Mensal') {
      const monthDay = glpyStore.treatment.getApplicationMonthDay();
      // Fallback: dia da data de início do tratamento
      const startDayFallback = startDateStr ? parseInt(startDateStr.split('-')[2], 10) : null;
      const targetDay = monthDay ?? (startDayFallback && !isNaN(startDayFallback) ? startDayFallback : null);

      if (targetDay && targetDay >= 1 && targetDay <= 31) {
        const y = today.getFullYear();
        const m = today.getMonth();
        const daysInCurrentMonth = new Date(y, m + 1, 0).getDate();
        const effectiveDayThisMonth = Math.min(targetDay, daysInCurrentMonth);
        const candidateThisMonth    = new Date(y, m, effectiveDayThisMonth);
        candidateThisMonth.setHours(0, 0, 0, 0);

        let nextDate: Date;
        if (candidateThisMonth >= today) {
          nextDate = candidateThisMonth;
        } else {
          const nm = m + 1 > 11 ? 0 : m + 1;
          const ny = m + 1 > 11 ? y + 1 : y;
          const daysInNextMonth    = new Date(ny, nm + 1, 0).getDate();
          const effectiveDayNextMonth = Math.min(targetDay, daysInNextMonth);
          nextDate = new Date(ny, nm, effectiveDayNextMonth);
          nextDate.setHours(0, 0, 0, 0);
        }

        const diffDaysNext = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let nextDateFormatted = formatPortugueseDate(nextDate);
        let daysRemainingText = '';
        if (diffDaysNext === 0)      { daysRemainingText = 'Hoje'; nextDateFormatted = 'Hoje'; }
        else if (diffDaysNext === 1) daysRemainingText = 'Amanhã';
        else if (diffDaysNext < 0)   daysRemainingText = 'Atrasada';
        else                         daysRemainingText = `em ${diffDaysNext} dias`;

        return {
          hasHistory: hasInjectionHistory,
          nextDateFormatted,
          daysRemainingText,
          lastDateFormatted: lastDateText,
          frequencyDays: 30,
        };
      }
    }

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

/**
 * Retorna texto motivacional com o tempo em tratamento baseado em treatmentStartDate.
 * Retorna null se data não estiver configurada ou se ocorrer erro.
 */
export function calcTreatmentDuration(): string | null {
  try {
    const startDateStr = glpyStore.treatment.getTreatmentStartDate();
    if (!startDateStr) return null;
    const startDate = parseLocalDate(startDateStr);
    if (!startDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;

    const d = Math.max(1, diffDays);
    if (d <= 6) {
      return `Em tratamento há ${d} ${d === 1 ? 'dia' : 'dias'}`;
    } else if (d <= 30) {
      const weeks = Math.floor(d / 7);
      return `Em tratamento há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      const months = Math.floor(d / 30);
      return `Em tratamento há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
  } catch {
    return null;
  }
}
