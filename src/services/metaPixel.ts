// GLPY — Meta Pixel Service
// Sprint 17B.18 — Pixel base + InitiateCheckout + eventos de funil
//
// Pixel ID: 1213243594080057
// IMPORTANTE: Token da API de Conversões NÃO é usado aqui.
// Purchase: Sprint 17B.19.
// Dados sensíveis (email, nome, peso, saúde) NUNCA são enviados.

declare global {
  interface Window {
    fbq: ((method: string, event: string, params?: Record<string, unknown>) => void) & {
      push:       (...args: unknown[]) => void;
      loaded:     boolean;
      version:    string;
      queue:      unknown[][];
      callMethod?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = '1213243594080057';

function safe(method: string, event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.fbq) return;
  try {
    if (params !== undefined) window.fbq(method, event, params);
    else window.fbq(method, event);
  } catch { /* silently ignore if fbq fails */ }
}

export function trackPageView():                              void { safe('track', 'PageView'); }
export function trackViewContent(p?: Record<string, unknown>): void { safe('track', 'ViewContent', p); }
export function trackInitiateCheckout(p?: Record<string, unknown>): void { safe('track', 'InitiateCheckout', p); }
export function trackLead(p?: Record<string, unknown>):       void { safe('track', 'Lead', p); }
export function trackCompleteRegistration(p?: Record<string, unknown>): void { safe('track', 'CompleteRegistration', p); }
export function trackStartOnboarding():     void { safe('trackCustom', 'StartOnboarding'); }
export function trackCompleteOnboarding():  void { safe('trackCustom', 'CompleteOnboarding'); }
export function trackMetaEvent(name: string, p?: Record<string, unknown>): void { safe('trackCustom', name, p); }

// Parâmetros oficiais por plano — sem dados pessoais
export const PLANO_PIXEL_PARAMS: Record<string, Record<string, unknown>> = {
  fundador: { content_name: 'GLPY Fundador',  content_category: 'subscription', value: 19.90, currency: 'BRL', plan: 'fundador'  },
  essencial: { content_name: 'GLPY Essencial', content_category: 'subscription', value: 29.90, currency: 'BRL', plan: 'essencial' },
  pro:       { content_name: 'GLPY Pro',        content_category: 'subscription', value: 59.90, currency: 'BRL', plan: 'pro'       },
};
