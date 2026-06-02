// GLPY — Helper centralizado de WhatsApp de suporte
// Sprint 17B.40.1
// Uso: buildSupportWhatsappUrl({ email: emailEfetivo })
// Número: 5548988371216 — não alterar sem instrução explícita

export const SUPPORT_WHATSAPP_NUMBER = '5548988371216';

export function buildSupportWhatsappUrl(params?: {
  email?: string | null;
  context?: 'acesso' | 'paywall' | 'email_diferente' | 'pagamento_confirmado' | 'erro';
}): string {
  const email = params?.email?.trim();

  const baseMessage = email
    ? `Olá, acabei de comprar o GLPY e preciso de ajuda para liberar meu acesso. Meu e-mail de compra é: ${email}`
    : `Olá, acabei de comprar o GLPY e preciso de ajuda para liberar meu acesso.`;

  return `https://api.whatsapp.com/send/?phone=${SUPPORT_WHATSAPP_NUMBER}&text=${encodeURIComponent(baseMessage)}&type=phone_number&app_absent=0`;
}
