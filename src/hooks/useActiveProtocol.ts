import { useState } from 'react';
import { glpyStore } from '../data/glpyStore';

export interface ActiveProtocolData {
  name: string;
  currentDay: number;
  totalDays: number;
}

const FALLBACK: ActiveProtocolData = {
  name: '',
  currentDay: 1,
  totalDays: 7,
};

function readActiveProtocol(): ActiveProtocolData {
  try {
    const rawDayToday   = localStorage.getItem('glpy_protocol_day_today');
    const rawContext    = localStorage.getItem('glpy_protocol_context');
    const rawAtivo      = (() => { const v = glpyStore.protocol.getActive(); return v ? JSON.stringify(v) : null; })();
    const rawCurrentDay = localStorage.getItem('glpy_current_protocol_day');

    let name      = '';
    let totalDays = 0;
    let currentDay = 0;

    // 1. glpy_protocol_day_today (ProtocolDayTrackingEntry)
    //    Fonte mais recente: protocolName / totalDays / day
    if (rawDayToday) {
      const p: Record<string, unknown> = JSON.parse(rawDayToday);
      const n = String(p.protocolName ?? '').trim();
      if (n) name = n;
      const t = Number(p.totalDays);
      if (t > 0) totalDays = t;
      const d = Number(p.day);
      if (d >= 1) currentDay = d;
    }

    // 2. glpy_protocol_context (ProtocolContextEntry)
    //    Campos reais: nome / totalDias / dia
    if (rawContext && (!name || !totalDays || !currentDay)) {
      const p: Record<string, unknown> = JSON.parse(rawContext);
      if (!name) {
        const n = String(p.nome ?? '').trim();
        if (n) name = n;
      }
      if (!totalDays) {
        const t = Number(p.totalDias);
        if (t > 0) totalDays = t;
      }
      if (!currentDay) {
        const d = Number(p.dia);
        if (d >= 1) currentDay = d;
      }
    }

    // 3. glpy_protocolo_ativo (formato legado, gravado por saveProtocolContext)
    //    Campos reais: nome / totalDias / dia
    if (rawAtivo && (!name || !totalDays || !currentDay)) {
      const p: Record<string, unknown> = JSON.parse(rawAtivo);
      if (!name) {
        const n = String(p.nome ?? '').trim();
        if (n) name = n;
      }
      if (!totalDays) {
        const t = Number(p.totalDias);
        if (t > 0) totalDays = t;
      }
      if (!currentDay) {
        const d = Number(p.dia);
        if (d >= 1) currentDay = d;
      }
    }

    // 4. glpy_current_protocol_day — fallback apenas para o dia
    if (!currentDay && rawCurrentDay) {
      const d = parseInt(rawCurrentDay, 10);
      if (!isNaN(d) && d >= 1) currentDay = d;
    }

    return {
      name:       name       || FALLBACK.name,
      totalDays:  totalDays  || FALLBACK.totalDays,
      currentDay: currentDay || FALLBACK.currentDay,
    };
  } catch {
    return FALLBACK;
  }
}

export function useActiveProtocol(): ActiveProtocolData {
  const [data] = useState<ActiveProtocolData>(readActiveProtocol);
  return data;
}
