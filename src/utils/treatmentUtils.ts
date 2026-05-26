/**
 * GLPY — Treatment and Injection Utilities
 * Lógica centralizada para cálculo de datas e frequências da medicação.
 */

import { glpyStore } from '../data/glpyStore';

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
    if (!lastInjection) {
      return defaultInfo;
    }
    const savedAt = lastInjection.savedAt;
    if (!savedAt) {
      return defaultInfo;
    }

    // Determinar frequência
    const frequency = glpyStore.treatment.getFrequencia();
    let interval = 7; // Padrão semanal

    if (frequency === 'Diária') {
      interval = 1;
    } else if (frequency === 'Semanal') {
      interval = 7;
    } else if (frequency === 'A cada 10 dias') {
      interval = 10;
    } else if (frequency === 'Quinzenal' || frequency === 'A cada 14 dias') {
      interval = 14;
    } else if (frequency === 'Mensal') {
      interval = 30;
    } else if (frequency === 'Personalizada') {
      const customDaysRaw = glpyStore.treatment.getFrequenciaPersonalizadaDias() || '7';
      const parsedDays = parseInt(customDaysRaw, 10);
      interval = isNaN(parsedDays) || parsedDays <= 0 ? 7 : parsedDays;
    }

    // Configurar datas normalizadas (apenas dia/mês/ano)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = new Date(savedAt);
    lastDate.setHours(0, 0, 0, 0);

    // Calcular dias desde a última aplicação
    const diffTimeSinceLast = today.getTime() - lastDate.getTime();
    const diffDaysSinceLast = Math.floor(diffTimeSinceLast / (1000 * 60 * 60 * 24));

    let lastDateText = "Sem registro";
    if (diffDaysSinceLast === 0) {
      lastDateText = "hoje";
    } else if (diffDaysSinceLast === 1) {
      lastDateText = "ontem";
    } else if (diffDaysSinceLast > 1) {
      lastDateText = `há ${diffDaysSinceLast} dias`;
    } else {
      // Se por acaso estiver no futuro (ex: fuso horário ou teste)
      lastDateText = "hoje";
    }

    // Calcular próxima data
    const nextDate = new Date(lastDate.getTime() + interval * 24 * 60 * 60 * 1000);
    nextDate.setHours(0, 0, 0, 0);

    const diffTimeNext = nextDate.getTime() - today.getTime();
    const diffDaysNext = Math.round(diffTimeNext / (1000 * 60 * 60 * 24));

    let daysRemainingText = "";
    let nextDateFormatted = formatPortugueseDate(nextDate);

    if (diffDaysNext === 0) {
      daysRemainingText = "Hoje";
      nextDateFormatted = "Hoje";
    } else if (diffDaysNext === 1) {
      daysRemainingText = "Amanhã";
    } else if (diffDaysNext < 0) {
      daysRemainingText = "Atrasada";
    } else {
      daysRemainingText = `em ${diffDaysNext} dias`;
    }

    return {
      hasHistory: true,
      nextDateFormatted,
      daysRemainingText,
      lastDateFormatted: lastDateText,
      frequencyDays: interval
    };
  } catch (error) {
    console.error('[GLPY] Erro ao calcular próxima injeção:', error);
    return defaultInfo;
  }
}
