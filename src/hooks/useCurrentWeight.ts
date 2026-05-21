import { useState } from 'react';

export interface CurrentWeightData {
  weight: number;
  timestamp: string | null;
  source: 'latest_weight' | 'peso_atual' | 'onboarding' | 'fallback';
}

const FALLBACK_WEIGHT = 72.6;

function readCurrentWeight(): CurrentWeightData {
  try {
    const latestRaw = localStorage.getItem('glpy_latest_weight');
    if (latestRaw) {
      const latest: Record<string, unknown> = JSON.parse(latestRaw);
      const w = typeof latest.weight === 'number' ? latest.weight : NaN;
      if (!isNaN(w) && w > 20 && w < 300) {
        return {
          weight: w,
          timestamp:
            (latest.timestamp as string | null) ??
            (latest.date as string | null) ??
            null,
          source: 'latest_weight',
        };
      }
    }

    const fromKey = parseFloat(localStorage.getItem('glpy_peso_atual') ?? '');
    if (!isNaN(fromKey) && fromKey > 20 && fromKey < 300) {
      return { weight: fromKey, timestamp: null, source: 'peso_atual' };
    }

    const onb: Record<string, unknown> = JSON.parse(
      localStorage.getItem('glpy_onboarding') ?? '{}',
    );
    const fromOnb = parseFloat(String(onb.peso_atual ?? ''));
    if (!isNaN(fromOnb) && fromOnb > 20 && fromOnb < 300) {
      return { weight: fromOnb, timestamp: null, source: 'onboarding' };
    }
  } catch {}

  return { weight: FALLBACK_WEIGHT, timestamp: null, source: 'fallback' };
}

export function useCurrentWeight(): CurrentWeightData {
  const [data] = useState<CurrentWeightData>(readCurrentWeight);
  return data;
}
