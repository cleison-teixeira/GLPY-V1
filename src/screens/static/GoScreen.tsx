// GLPY — GoScreen
// Sprint 17B.18 — Rotas /go/:plano
//
// Fluxo: dispara InitiateCheckout → preserva UTMs → redireciona para checkout HeroSpark
// Pixel ID: 1213243594080057
// Token Meta: NÃO usado aqui (Sprint 17B.19)

import { useEffect, useState } from 'react';
import { trackInitiateCheckout, PLANO_PIXEL_PARAMS } from '../../services/metaPixel';

const CHECKOUT_URLS: Record<string, string> = {
  fundador:  'https://pay.herospark.com/glpy-fundador-524346',
  essencial: 'https://pay.herospark.com/glpy-essencial-524492',
  pro:       'https://pay.herospark.com/glpy-pro-524494',
};

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

function extractUtms(search: string): string {
  const inbound = new URLSearchParams(search);
  const out = new URLSearchParams();
  for (const key of UTM_PARAMS) {
    const val = inbound.get(key);
    if (val) out.set(key, val);
  }
  const str = out.toString();
  return str ? '?' + str : '';
}

function getPlanFromPath(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1]?.toLowerCase() ?? '';
}

export default function GoScreen() {
  const [status, setStatus] = useState<'tracking' | 'redirecting' | 'invalid'>('tracking');
  const plan = getPlanFromPath();
  const checkoutBase = CHECKOUT_URLS[plan];

  useEffect(() => {
    if (!checkoutBase) { setStatus('invalid'); return; }

    // Dispara InitiateCheckout antes do redirect
    trackInitiateCheckout(PLANO_PIXEL_PARAMS[plan]);
    setStatus('redirecting');

    // Preserva UTMs da URL de entrada no link de checkout
    const utms = extractUtms(window.location.search);
    const destination = checkoutBase + utms;

    const timer = setTimeout(() => {
      window.location.href = destination;
    }, 600);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <p className="text-white/60 text-sm">Plano não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[#00C27A] border-t-transparent rounded-full animate-spin" />
      <p className="text-white/70 text-sm">Preparando seu checkout...</p>
    </div>
  );
}
