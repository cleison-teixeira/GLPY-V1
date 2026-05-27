// GLPY — AcessoScreen
// Sprint 17B.5 — Tela pós-compra com e-mail de compra travado
//
// Rota: /acesso?email={{buyer_email}}&token=GLPY2026
// Responsabilidades:
//   1. Validar token localmente
//   2. Confirmar plano ativo via /api/acesso/check (server-side — não confia só na URL)
//   3. Exibir estado correto: confirmado / aguardando / não encontrado / token inválido
//   4. Logar usuário com e-mail travado — nunca libera plano baseado apenas na URL

import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth } from '../../firebase.js';
import { syncFromFirestore } from '../../services/firestore';
import glpyLogoLight from '@/assets/logos/logo-light.png';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

// ── Tipos ────────────────────────────────────────────────────────────────────

type CheckStatus = 'loading' | 'token_invalido' | 'plano_ativo' | 'aguardando' | 'nao_encontrado' | 'erro';
type LoginStep   = 'inicial' | 'form_senha' | 'enviando' | 'sucesso' | 'reset_enviado';

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

// ── Planos — label amigável ────────────────────────────────────────────────────

const PLANO_LABEL: Record<string, string> = {
  fundador:  'GLPY Fundador',
  essencial: 'GLPY Essencial',
  pro:       'GLPY Pro',
  top:       'GLPY Top',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const ERROS_AUTH: Record<string, string> = {
  'auth/wrong-password':      'Senha incorreta.',
  'auth/invalid-credential':  'Email ou senha incorretos.',
  'auth/too-many-requests':   'Muitas tentativas. Tente novamente mais tarde.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  'auth/user-disabled':       'Esta conta foi desativada. Entre em contato com o suporte.',
};

function traduzirErroAuth(code: string): string {
  return ERROS_AUTH[code] ?? 'Erro ao entrar. Tente novamente.';
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function AcessoScreen({ user, authLoading }: AcessoScreenProps) {
  const { email, token } = parseParams();

  const [checkStatus, setCheckStatus] = useState<CheckStatus>('loading');
  const [planoNome,   setPlanoNome]   = useState<string | null>(null);
  const [loginStep,   setLoginStep]   = useState<LoginStep>('inicial');
  const [senha,       setSenha]       = useState('');
  const [verSenha,    setVerSenha]    = useState(false);
  const [erroAuth,    setErroAuth]    = useState<string | null>(null);
  const [hintSenha,   setHintSenha]   = useState(false);

  // ── 1. Validar token localmente ───────────────────────────────────────────
  useEffect(() => {
    if (token !== 'GLPY2026') {
      setCheckStatus('token_invalido');
      return;
    }
    if (!email) {
      setCheckStatus('nao_encontrado');
      return;
    }
    verificarPlano();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 2. Verificar plano via endpoint server-side ───────────────────────────
  async function verificarPlano() {
    setCheckStatus('loading');
    try {
      const resp = await fetch(`/api/acesso/check?email=${encodeURIComponent(email!)}&token=${token}`);
      const json = await resp.json();

      if (!json.ok) {
        if (json.error === 'invalid_token') { setCheckStatus('token_invalido'); return; }
        setCheckStatus('erro');
        return;
      }

      if (!json.found) { setCheckStatus('nao_encontrado'); return; }
      if (!json.active) { setCheckStatus('aguardando'); return; }

      setPlanoNome(PLANO_LABEL[json.plano] ?? json.plano ?? 'GLPY');
      setCheckStatus('plano_ativo');
    } catch {
      setCheckStatus('erro');
    }
  }

  // ── 3. Usuário já autenticado — mesmo email → sincronizar e sair da rota ──
  useEffect(() => {
    if (checkStatus !== 'plano_ativo' || authLoading || !user) return;
    if (user.email?.toLowerCase() !== email) return; // e-mail diferente — tratado no JSX
    // Mesmo e-mail — sincronizar plano e redirecionar
    syncFromFirestore()
      .catch(() => {})
      .finally(() => {
        window.history.replaceState({}, '', '/');
        window.location.reload(); // App.tsx vai renderizar o dashboard
      });
  }, [checkStatus, authLoading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 4. Login com e-mail travado ───────────────────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!email || !senha) return;
    setErroAuth(null);
    setLoginStep('enviando');
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // onAuthStateChanged em App.tsx vai sincronizar e navegar
      setLoginStep('sucesso');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      const msg  = traduzirErroAuth(code);
      setErroAuth(msg);
      // Se senha errada, mostrar hint sobre senha padrão
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setHintSenha(true);
      }
      setLoginStep('form_senha');
    }
  }

  // ── 5. Redefinir senha ────────────────────────────────────────────────────
  async function handleResetSenha() {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setLoginStep('reset_enviado');
    } catch {
      setErroAuth('Erro ao enviar e-mail de redefinição. Tente novamente.');
    }
  }

  // ── 6. Sair e entrar com o e-mail da compra ───────────────────────────────
  async function handleSairETrocar() {
    await signOut(auth);
    setLoginStep('form_senha');
    setSenha('');
    setErroAuth(null);
    setHintSenha(false);
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderLogo() {
    return (
      <div className="flex flex-col items-center gap-2 mb-8">
        <img src={glpyLogoLight} alt="GLPY" className="h-10 object-contain" />
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
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md"
        >
          Falar com suporte
        </a>
      </>
    );
  }

  if (checkStatus === 'nao_encontrado') {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-3 mb-6">
          <HelpCircle className="w-12 h-12 text-orange-400" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Assinatura não encontrada</h1>
          <p className="text-sm text-text-muted text-center">
            Não encontramos uma assinatura ativa para <strong className="text-[#0A1628]">{email}</strong>.
            Confirme se está usando o mesmo e-mail da compra.
          </p>
        </div>
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block text-center bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md"
        >
          Falar com suporte
        </a>
      </>
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
          onClick={verificarPlano}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md hover:bg-primary/90 transition"
        >
          Verificar novamente
        </button>
      </>
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
          onClick={verificarPlano}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md"
        >
          Tentar novamente
        </button>
      </>
    );
  }

  // ── Estado: plano_ativo ────────────────────────────────────────────────────

  // Usuário autenticado com e-mail diferente
  if (user && user.email?.toLowerCase() !== email) {
    return renderCard(
      <>
        <div className="flex flex-col items-center gap-3 mb-6">
          <AlertCircle className="w-12 h-12 text-amber-400" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">E-mail diferente</h1>
          <p className="text-sm text-text-muted text-center leading-relaxed">
            Você está conectado como <strong className="text-[#0A1628]">{user.email}</strong>, mas este
            acesso foi comprado com{' '}
            <strong className="text-primary">{email}</strong>.
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
      </>
    );
  }

  // Usuário autenticado com mesmo e-mail → loading (o useEffect acima vai redirecionar)
  if (user && user.email?.toLowerCase() === email) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center gap-5">
        {renderLogo()}
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-white/70 text-sm font-medium">Sincronizando seu plano...</p>
      </div>
    );
  }

  // Usuário NÃO autenticado — mostrar tela de confirmação + login
  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-6">
      {renderLogo()}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-border p-7"
      >
        {/* Cabeçalho confirmação */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          <h1 className="font-bold text-xl text-[#0A1628] text-center">Pagamento confirmado</h1>
          <p className="text-sm text-primary font-semibold text-center">{planoNome}</p>
        </div>

        {/* E-mail da compra */}
        <div className="bg-[#F4F6F8] border border-border rounded-2xl px-4 py-3 mb-5">
          <p className="text-xs text-text-muted font-semibold mb-0.5">Acesso liberado para</p>
          <p className="text-sm font-bold text-[#0A1628] break-all">{email}</p>
        </div>

        <p className="text-xs text-text-muted text-center mb-5 leading-relaxed">
          Para liberar seu plano automaticamente, entre com este mesmo e-mail.
        </p>

        {/* Separador */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-grow h-px bg-border" />
          <span className="text-xs text-text-muted font-medium">Entrar</span>
          <div className="flex-grow h-px bg-border" />
        </div>

        {/* Form de senha */}
        <AnimatePresence mode="wait">
          {loginStep === 'reset_enviado' ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <p className="text-sm text-[#0A1628] font-semibold text-center">
                E-mail de redefinição enviado para{' '}
                <span className="text-primary">{email}</span>
              </p>
              <p className="text-xs text-text-muted text-center">
                Verifique sua caixa de entrada e spam. Após redefinir, volte aqui para entrar.
              </p>
              <button
                onClick={() => { setLoginStep('form_senha'); setErroAuth(null); }}
                className="text-primary text-sm font-semibold hover:underline mt-1"
              >
                Voltar
              </button>
            </motion.div>
          ) : loginStep === 'sucesso' ? (
            <motion.div
              key="sucesso"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted text-center">Carregando seu plano...</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleLogin}
              className="space-y-3"
            >
              {/* E-mail travado */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  E-mail da compra
                </label>
                <input
                  type="email"
                  value={email ?? ''}
                  readOnly
                  className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-sm text-[#0A1628] cursor-not-allowed opacity-80"
                />
              </div>

              {/* Senha */}
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
                    className="w-full px-4 py-3 pr-11 bg-[#F4F6F8] border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  >
                    {verSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erro */}
              <AnimatePresence>
                {erroAuth && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">{erroAuth}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint senha padrão */}
              <AnimatePresence>
                {hintSenha && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed"
                  >
                    Se é seu primeiro acesso ao GLPY, tente a senha <strong>GLPY@2026</strong>.
                    Caso não funcione, redefina sua senha abaixo.
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Botão entrar */}
              <button
                type="submit"
                disabled={loginStep === 'enviando' || !senha}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition disabled:opacity-60 mt-2"
              >
                {loginStep === 'enviando'
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : 'Acessar meu GLPY'
                }
              </button>

              {/* Redefinir senha */}
              <button
                type="button"
                onClick={handleResetSenha}
                className="w-full text-center text-xs text-text-muted hover:text-primary py-1 transition"
              >
                Esqueci minha senha
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="text-xs text-white/40 mt-6 text-center max-w-xs">
        Ao entrar você concorda com os Termos de Uso e Política de Privacidade do GLPY.
      </p>
    </div>
  );
}
