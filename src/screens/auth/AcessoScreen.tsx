// GLPY — AcessoScreen
// Sprint 17B.5  — Tela pós-compra com e-mail de compra travado
// Sprint 17B.11 — Tratamento de {{buyer_email}} ausente + WhatsApp real
//
// Rota: /acesso?email={{buyer_email}}&token=GLPY2026
// Responsabilidades:
//   1. Validar token localmente
//   2. Confirmar plano ativo via /api/acesso/check (server-side — não confia só na URL)
//   3. Exibir estado correto: confirmado / aguardando / não encontrado / token inválido
//   4. Logar usuário com e-mail travado — nunca libera plano baseado apenas na URL
//   5. Sprint 17B.11: detecta {{buyer_email}} não substituído e pede e-mail manualmente

import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.js';
import { syncFromFirestore } from '../../services/firestore';
import glpyLogoLight from '@/assets/logos/logo-light.png';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

// ── Tipos ────────────────────────────────────────────────────────────────────

type CheckStatus =
  | 'loading'
  | 'token_invalido'
  | 'email_ausente'
  | 'plano_ativo'
  | 'aguardando'
  | 'nao_encontrado'
  | 'erro';

type LoginStep = 'inicial' | 'form_senha' | 'enviando' | 'sucesso' | 'reset_enviado' | 'enviando_reset';

interface AcessoScreenProps {
  user:        User | null;
  authLoading: boolean;
}

// ── Params da URL ─────────────────────────────────────────────────────────────

function parseParams(): { email: string | null; token: string | null } {
  const p = new URLSearchParams(window.location.search);
  return {
    email: p.get('email')?.trim().toLowerCase() ?? null,
    token: p.get('token')?.trim() ?? null,
  };
}

// Sprint 17B.11: detecta e-mail literal não substituído (ex: "{{buyer_email}}")
function isPlaceholderEmail(email: string | null): boolean {
  if (!email || !email.trim()) return false;
  return email.includes('{{') || email.includes('}}');
}

// ── Suporte WhatsApp ──────────────────────────────────────────────────────────

const SUPORTE_WHATSAPP = '5548988371216';

function suporteUrl(emailHint?: string | null): string {
  const msg = `Olá, acabei de comprar o GLPY e preciso de ajuda para liberar meu acesso. Meu e-mail de compra é: ${emailHint ?? ''}`;
  return `https://wa.me/${SUPORTE_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

// ── Planos — label amigável ────────────────────────────────────────────────────

const PLANO_LABEL: Record<string, string> = {
  fundador:  'GLPY Fundador',
  essencial: 'GLPY Essencial',
  pro:       'GLPY Pro',
  top:       'GLPY Top',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const ERROS_AUTH: Record<string, string> = {
  'auth/wrong-password':         'Senha incorreta.',
  'auth/invalid-credential':     'Email ou senha incorretos.',
  'auth/too-many-requests':      'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'auth/user-disabled':          'Esta conta foi desativada. Entre em contato com o suporte.',
};

function traduzirErroAuth(code: string): string {
  return ERROS_AUTH[code] ?? 'Erro ao entrar. Tente novamente.';
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function AcessoScreen({ user, authLoading }: AcessoScreenProps) {
  const { email: emailParam, token } = parseParams();

  // Sprint 17B.11: emailEfetivo é null quando {{buyer_email}} não foi substituído.
  // Será populado quando o usuário digitar o e-mail manualmente.
  const [emailEfetivo, setEmailEfetivo] = useState<string | null>(
    isPlaceholderEmail(emailParam) ? null : emailParam,
  );
  const [emailManual, setEmailManual] = useState('');

  const [checkStatus, setCheckStatus] = useState<CheckStatus>('loading');
  const [planoNome,   setPlanoNome]   = useState<string | null>(null);
  const [loginStep,   setLoginStep]   = useState<LoginStep>('inicial');
  const [senha,       setSenha]       = useState('');
  const [verSenha,    setVerSenha]    = useState(false);
  const [erroAuth,    setErroAuth]    = useState<string | null>(null);
  const [reenviando,  setReenviando]  = useState(false);
  const [reenviado,   setReenviado]   = useState(false);

  // ── 1. Validar token e detectar e-mail inválido/ausente ──────────────────
  useEffect(() => {
    if (token !== 'GLPY2026') {
      setCheckStatus('token_invalido');
      return;
    }
    // Sprint 17B.11: detecta {{buyer_email}} literal ou e-mail ausente
    if (!emailParam || isPlaceholderEmail(emailParam)) {
      setCheckStatus('email_ausente');
      return;
    }
    verificarPlano();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Verificar plano via endpoint server-side (com timeout 10s) ──────────
  async function verificarPlano(emailOverride?: string) {
    const emailToUse = emailOverride ?? emailEfetivo;
    if (!emailToUse) return;
    setCheckStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const resp = await fetch(
        `/api/acesso/check?email=${encodeURIComponent(emailToUse)}&token=${token}`,
        { signal: controller.signal },
      );
      const json = await resp.json();

      if (!json.ok) {
        if (json.error === 'invalid_token') { setCheckStatus('token_invalido'); return; }
        setCheckStatus('erro');
        return;
      }

      if (!json.found)  { setCheckStatus('nao_encontrado'); return; }
      if (!json.active) { setCheckStatus('aguardando');     return; }

      setPlanoNome(PLANO_LABEL[json.plano] ?? json.plano ?? 'GLPY');
      setCheckStatus('plano_ativo');
    } catch (err: unknown) {
      setCheckStatus('erro');
      if ((err as { name?: string })?.name !== 'AbortError') {
        console.error('[acesso/check] fetch error:', err);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  // ── 3. Usuário já autenticado — mesmo email → sincronizar e sair da rota ──
  useEffect(() => {
    if (checkStatus !== 'plano_ativo' || authLoading || !user) return;
    if (user.email?.toLowerCase() !== emailEfetivo) return;
    syncFromFirestore()
      .catch(() => {})
      .finally(() => {
        window.history.replaceState({}, '', '/');
        window.location.reload();
      });
  }, [checkStatus, authLoading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 4. Criar senha — envia link seguro via Firebase ──────────────────────
  async function handleCriarSenha() {
    if (!emailEfetivo) return;
    setErroAuth(null);
    setLoginStep('enviando_reset');
    try {
      await sendPasswordResetEmail(auth, emailEfetivo);
      setReenviado(false);
      setLoginStep('reset_enviado');
    } catch {
      setErroAuth('Não conseguimos enviar o link. Verifique sua conexão e tente novamente.');
      setLoginStep('inicial');
    }
  }

  async function handleReenviarLink() {
    if (!emailEfetivo || reenviando) return;
    setReenviando(true);
    setReenviado(false);
    try {
      await sendPasswordResetEmail(auth, emailEfetivo);
      setReenviado(true);
    } catch {
      setErroAuth('Erro ao reenviar o link. Tente novamente.');
    } finally {
      setReenviando(false);
    }
  }

  // ── 5. Login com e-mail travado ───────────────────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!emailEfetivo || !senha) return;
    setErroAuth(null);
    setLoginStep('enviando');
    try {
      await signInWithEmailAndPassword(auth, emailEfetivo, senha);
      setLoginStep('sucesso');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      setErroAuth(traduzirErroAuth(code));
      setLoginStep('form_senha');
    }
  }

  // ── 6. Sair e entrar com o e-mail da compra ───────────────────────────────
  async function handleSairETrocar() {
    await signOut(auth);
    setLoginStep('inicial');
    setSenha('');
    setErroAuth(null);
  }

  // ── 7. Google login em /acesso — valida e-mail da compra ─────────────────
  async function handleGoogleLogin() {
    if (!emailEfetivo) return;
    setErroAuth(null);
    setLoginStep('enviando');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleEmail = result.user.email?.toLowerCase() ?? '';

      if (googleEmail !== emailEfetivo) {
        await signOut(auth);
        setErroAuth(
          `Você entrou com ${result.user.email}, mas este acesso foi comprado com ${emailEfetivo}. Use o Google com o e-mail correto ou entre com senha.`,
        );
        setLoginStep('inicial');
        return;
      }

      setLoginStep('sucesso');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setLoginStep('inicial');
      } else {
        setErroAuth('Não foi possível entrar com o Google. Tente novamente.');
        setLoginStep('inicial');
      }
    }
  }

  // ── 8. Sprint 17B.11: Submeter e-mail digitado manualmente ───────────────
  async function handleEmailManual(e: FormEvent) {
    e.preventDefault();
    const trimmed = emailManual.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setErroAuth('Digite um e-mail válido.');
      return;
    }
    setErroAuth(null);
    setEmailEfetivo(trimmed);
    await verificarPlano(trimmed);
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderLogo() {
    return (
      <div className="flex flex-col items-center gap-2 mb-8">
        <img src={glpyLogoLight} alt="GLPY" className="h-10 w-auto max-w-[180px] object-contain" />
      </div>
    );
  }

  function renderCard(children: React.ReactNode) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-6">
        {renderLogo()}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-border p-7"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  // ── Estados de erro / loading ─────────────────────────────────────────────

  if (checkStatus === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center gap-5">
        {renderLogo()}
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white/70 text-sm font-medium">Verificando seu acesso...</p>
      </div>
    );
  }

  if (checkStatus === 'token_invalido') {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-3 mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Link inválido</h1>
          <p className="text-sm text-text-muted text-center">
            Este link de acesso é inválido ou expirou. Use o link original enviado por e-mail após a compra.
          </p>
        </div>
        <a
          href={suporteUrl(emailEfetivo)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md"
        >
          Falar com suporte
        </a>
      </>,
    );
  }

  // Sprint 17B.11: e-mail ausente ou literal {{buyer_email}} — pede manualmente
  if (checkStatus === 'email_ausente') {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-2 mb-5">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Pagamento confirmado</h1>
          <p className="text-sm text-text-muted text-center leading-relaxed">
            Recebemos sua compra, mas não conseguimos identificar automaticamente o e-mail nesta página.
            Digite abaixo o mesmo e-mail usado na compra para liberar seu acesso.
          </p>
        </div>
        <form onSubmit={handleEmailManual} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">E-mail usado na compra</label>
            <input
              type="email"
              value={emailManual}
              onChange={e => { setEmailManual(e.target.value); setErroAuth(null); }}
              placeholder="seu@email.com"
              inputMode="email"
              autoComplete="email"
              autoFocus
              className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-base focus:outline-none focus:border-primary focus:bg-white transition"
            />
          </div>
          {erroAuth && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{erroAuth}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={!emailManual.trim()}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition disabled:opacity-60"
          >
            Liberar meu acesso
          </button>
        </form>
        <a
          href={suporteUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-text-muted hover:text-primary mt-4 transition"
        >
          Precisa de ajuda? Falar com suporte
        </a>
      </>,
    );
  }

  if (checkStatus === 'nao_encontrado') {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-3 mb-6">
          <HelpCircle className="w-12 h-12 text-orange-400" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Assinatura não encontrada</h1>
          <p className="text-sm text-text-muted text-center leading-relaxed">
            Não encontramos uma assinatura ativa para este e-mail. Confira se digitou o mesmo e-mail usado na compra ou fale com o suporte.
          </p>
          {emailEfetivo && (
            <p className="text-xs text-slate-400 text-center break-all">
              E-mail verificado: <strong className="text-[#0A1628]">{emailEfetivo}</strong>
            </p>
          )}
        </div>
        <a
          href={suporteUrl(emailEfetivo)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md"
        >
          Falar com suporte
        </a>
        <button
          onClick={() => { setEmailManual(''); setErroAuth(null); setCheckStatus('email_ausente'); }}
          className="w-full text-center text-xs text-text-muted hover:text-primary py-2 mt-2 transition"
        >
          Tentar com outro e-mail
        </button>
      </>,
    );
  }

  if (checkStatus === 'aguardando') {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-3 mb-6">
          <Clock className="w-12 h-12 text-amber-400" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Aguardando confirmação</h1>
          <p className="text-sm text-text-muted text-center">
            Se você pagou via Pix, aguarde alguns instantes para o banco confirmar o pagamento e toque em verificar novamente.
          </p>
        </div>
        <button
          onClick={() => verificarPlano()}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-primary/90 transition"
        >
          Verificar novamente
        </button>
      </>,
    );
  }

  if (checkStatus === 'erro') {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-3 mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Erro temporário</h1>
          <p className="text-sm text-text-muted text-center">Não conseguimos verificar seu acesso. Tente novamente.</p>
        </div>
        <button
          onClick={() => verificarPlano()}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md"
        >
          Tentar novamente
        </button>
      </>,
    );
  }

  // ── Estado: plano_ativo ────────────────────────────────────────────────────

  // Usuário autenticado com e-mail diferente
  if (user && user.email?.toLowerCase() !== emailEfetivo) {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-3 mb-6">
          <AlertCircle className="w-12 h-12 text-amber-400" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">E-mail diferente</h1>
          <p className="text-sm text-text-muted text-center leading-relaxed">
            Você está conectado como <strong className="text-[#0A1628]">{user.email}</strong>, mas este
            acesso foi comprado com{' '}
            <strong className="text-primary">{emailEfetivo}</strong>.
            Para liberar automaticamente, entre com o e-mail da compra.
          </p>
        </div>
        <button
          onClick={handleSairETrocar}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-primary/90 transition"
        >
          Sair e entrar com o e-mail da compra
        </button>
        <button
          onClick={() => { window.history.replaceState({}, '', '/'); window.location.reload(); }}
          className="w-full mt-3 text-sm text-text-muted py-2 hover:text-primary transition"
        >
          Continuar com minha conta atual
        </button>
      </>,
    );
  }

  // Usuário autenticado com mesmo e-mail → loading (o useEffect acima vai redirecionar)
  if (user && user.email?.toLowerCase() === emailEfetivo) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center gap-5">
        {renderLogo()}
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white/70 text-sm font-medium">Sincronizando seu plano...</p>
      </div>
    );
  }

  // Usuário NÃO autenticado — tela de confirmação + fluxo de acesso
  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-6">
      {renderLogo()}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-border p-7"
      >
        {/* Cabeçalho confirmação — sempre visível */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Pagamento confirmado ✅</h1>
          <p className="text-sm text-text-muted text-center leading-relaxed">
            Seu acesso ao <strong className="text-primary">{planoNome}</strong> está liberado para:
          </p>
          <p className="text-sm font-bold text-[#0A1628] text-center break-all">{emailEfetivo}</p>
        </div>

        {/* Área dinâmica por loginStep */}
        <AnimatePresence mode="wait">

          {/* ── Inicial: criar / entrar / Google ────────────────────────── */}
          {loginStep === 'inicial' && (
            <motion.div key="inicial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-xs text-text-muted text-center leading-relaxed">
                Para proteger sua conta, crie ou redefina sua senha de acesso.
              </p>

              {erroAuth && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">{erroAuth}</p>
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-2xl font-semibold text-sm text-[#0A1628] hover:border-primary/40 hover:bg-primary/5 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-grow h-px bg-border" />
                <span className="text-xs text-text-muted font-medium">ou com senha</span>
                <div className="flex-grow h-px bg-border" />
              </div>

              <button
                onClick={handleCriarSenha}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition"
              >
                Criar / redefinir minha senha
              </button>

              <div className="flex flex-col items-center gap-1 pt-1">
                <p className="text-xs text-text-muted">Já defini minha senha?</p>
                <button
                  onClick={() => { setErroAuth(null); setLoginStep('form_senha'); }}
                  className="text-sm text-primary font-bold hover:underline transition"
                >
                  Entrar no GLPY
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Enviando link de criação de senha ────────────────────── */}
          {loginStep === 'enviando_reset' && (
            <motion.div key="enviando_reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted text-center">Enviando link seguro...</p>
            </motion.div>
          )}

          {/* ── Link enviado ─────────────────────────────────────────── */}
          {loginStep === 'reset_enviado' && (
            <motion.div key="reset_enviado" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-bold text-[#0A1628] text-center">Link enviado!</p>
              <p className="text-xs text-text-muted text-center leading-relaxed">
                Enviamos um link seguro para você criar sua senha em{' '}
                <strong className="text-primary">{emailEfetivo}</strong>.
              </p>
              <p className="text-xs text-text-muted text-center leading-relaxed">
                Verifique sua <strong>caixa de entrada</strong>, <strong>spam</strong>,{' '}
                <strong>promoções</strong> ou <strong>lixo eletrônico</strong>.
              </p>
              <p className="text-xs text-text-muted text-center">
                Após criar sua senha, toque em <strong>"Já defini minha senha, entrar"</strong>.
              </p>

              {erroAuth && (
                <div className="w-full flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">{erroAuth}</p>
                </div>
              )}

              {reenviado && (
                <p className="text-xs text-emerald-600 font-semibold text-center">Link reenviado com sucesso!</p>
              )}

              <button
                onClick={() => { setErroAuth(null); setLoginStep('form_senha'); }}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-primary/90 transition mt-1"
              >
                Já defini minha senha, entrar
              </button>

              <button
                onClick={handleReenviarLink}
                disabled={reenviando}
                className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-3 rounded-2xl hover:bg-primary/5 transition disabled:opacity-60"
              >
                {reenviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {reenviando ? 'Reenviando...' : 'Reenviar link de acesso'}
              </button>

              <button
                onClick={() => { setErroAuth(null); setLoginStep('inicial'); }}
                className="text-xs text-text-muted hover:text-primary transition"
              >
                Voltar
              </button>
            </motion.div>
          )}

          {/* ── Formulário de login (e-mail travado) ─────────────────── */}
          {(loginStep === 'form_senha' || loginStep === 'enviando') && (
            <motion.form
              key="form_senha"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleLogin}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">E-mail da compra</label>
                <input
                  type="email"
                  value={emailEfetivo ?? ''}
                  readOnly
                  className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-base text-[#0A1628] cursor-not-allowed opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={verSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => { setSenha(e.target.value); setErroAuth(null); }}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    autoFocus
                    className="w-full px-4 py-3 pr-11 bg-[#F4F6F8] border border-border rounded-xl text-base focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                  <button type="button" onClick={() => setVerSenha(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {erroAuth && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">{erroAuth}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loginStep === 'enviando' || !senha}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition disabled:opacity-60 mt-2"
              >
                {loginStep === 'enviando' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Acessar meu GLPY'}
              </button>

              <button type="button" onClick={handleCriarSenha}
                className="w-full text-center text-xs text-text-muted hover:text-primary py-1 transition"
              >
                Esqueci minha senha — enviar novo link
              </button>

              <button type="button" onClick={() => { setErroAuth(null); setLoginStep('inicial'); setSenha(''); }}
                className="w-full text-center text-xs text-text-muted hover:text-primary py-0.5 transition"
              >
                Voltar
              </button>
            </motion.form>
          )}

          {/* ── Sucesso: aguardando onAuthStateChanged ────────────────── */}
          {loginStep === 'sucesso' && (
            <motion.div key="sucesso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted text-center">Carregando seu plano...</p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      <p className="text-xs text-white/40 mt-6 text-center max-w-xs">
        Ao entrar você concorda com os{" "}
        <a href="/termos" className="underline hover:text-white/60 transition">Termos de Uso</a>
        {" "}e{" "}
        <a href="/privacidade" className="underline hover:text-white/60 transition">Política de Privacidade</a>
        {" "}do GLPY.
      </p>
      <p className="text-[10px] text-white/30 mt-2 text-center max-w-xs leading-relaxed">
        O GLPY é uma ferramenta educativa e de acompanhamento comportamental. Não substitui orientação médica, nutricional ou psicológica.
      </p>
    </div>
  );
}
