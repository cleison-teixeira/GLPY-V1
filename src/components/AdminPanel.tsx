import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, Trash2, LogOut } from "lucide-react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import emailjs from "@emailjs/browser";
import { auth } from "../firebase.js";
import {
  buscarUidPorEmail,
  criarUsuarioNovo,
  liberarAcesso,
  revogarAcesso,
  listarAcessosManuais,
  type Grant,
} from "../services/firestore";

const EMAILJS_SERVICE  = "service_GLPY";
const EMAILJS_TEMPLATE = "template_GLPY";
const EMAILJS_KEY      = "PUBLIC_KEY_GLPY";

const ADMIN_EMAIL = "cleisonimarketing@gmail.com";

const PLANOS = ["starter", "plus", "pro", "top"] as const;
const DURACOES = [
  { value: "7d",        label: "7 dias" },
  { value: "15d",       label: "15 dias" },
  { value: "30d",       label: "30 dias" },
  { value: "90d",       label: "90 dias" },
  { value: "vitalicio", label: "Vitalício" },
];

const PLANO_LABELS: Record<string, string> = {
  starter: "Starter", plus: "Plus", pro: "Pro", top: "Top",
};

const DURACAO_LABELS: Record<string, string> = {
  "7d": "7 dias", "15d": "15 dias", "30d": "30 dias", "90d": "90 dias", "vitalicio": "Vitalício",
};

function fmt(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminPanel({ onNavigate }: { onNavigate: (s: string) => void }) {
  // Auth state
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [negado, setNegado] = useState(false);

  // Login state
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Admin panel state
  const [email, setEmail] = useState("");
  const [plano, setPlano] = useState<string>("plus");
  const [duracao, setDuracao] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loadingGrants, setLoadingGrants] = useState(false);
  const [revogando, setRevogando] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email === ADMIN_EMAIL) {
        setAutorizado(true);
        setNegado(false);
        // Carrega grants só quando autorizado
        setLoadingGrants(true);
        listarAcessosManuais()
          .then(setGrants)
          .catch(() => {})
          .finally(() => setLoadingGrants(false));
      } else if (user) {
        // Usuário logado mas não é o admin
        setNegado(true);
        setAutorizado(false);
      } else {
        // Não logado — mostra formulário de login
        setAutorizado(false);
        setNegado(false);
      }
      setVerificando(false);
    });
    return () => unsub();
  }, []);

  const handleLoginGoogle = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // onAuthStateChanged vai disparar e atualizar o estado
    } catch {
      setLoginError("Falha ao abrir o login com Google. Tente novamente.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLiberar = async () => {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo) { setMsg({ type: "err", text: "Informe o email do usuário." }); return; }
    setLoading(true);
    setMsg(null);
    try {
      let targetUid = await buscarUidPorEmail(emailLimpo);
      let isNew = false;

      if (!targetUid) {
        // Cria conta Firebase Auth + doc Firestore via app secundário
        targetUid = await criarUsuarioNovo(emailLimpo);
        isNew = true;
      }

      await liberarAcesso(targetUid, emailLimpo, plano, duracao);

      if (isNew) {
        // Envia email de boas-vindas com senha provisória
        emailjs.send(
          EMAILJS_SERVICE,
          EMAILJS_TEMPLATE,
          {
            to_email: emailLimpo,
            to_name: "Usuário",
            plano: PLANO_LABELS[plano] ?? plano,
            senha: "GLPY@2026",
            app_url: "https://glpy.com.br",
          },
          EMAILJS_KEY,
        ).catch(() => {}); // falha silenciosa — não bloqueia o fluxo

        setMsg({ type: "ok", text: `✅ Conta criada e acesso ${PLANO_LABELS[plano]} liberado para ${emailLimpo}. Email com senha enviado!` });
      } else {
        setMsg({ type: "ok", text: `✅ Acesso ${PLANO_LABELS[plano]} liberado para ${emailLimpo}` });
      }

      setEmail("");
      const updated = await listarAcessosManuais();
      setGrants(updated);
    } catch (e) {
      setMsg({ type: "err", text: "Erro ao liberar acesso. Verifique o console." });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevogar = async (grant: Grant) => {
    setRevogando(grant.id);
    try {
      await revogarAcesso(grant.uid, grant.id);
      setGrants(prev => prev.filter(g => g.id !== grant.id));
    } catch (e) {
      console.error(e);
    } finally {
      setRevogando(null);
    }
  };

  // ── Estados de espera e bloqueio ──────────────────────────────────────────

  if (verificando) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (negado) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center gap-4 px-5">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-white font-bold text-lg">Acesso negado</p>
        <p className="text-white/50 text-sm text-center">Esta área é restrita ao administrador do sistema.</p>
        <button
          onClick={() => signOut(auth)}
          className="mt-2 flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-primary text-xs font-bold uppercase tracking-wide">Admin</p>
              <h1 className="text-white font-black text-xl">GLPY Admin</h1>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLoginGoogle}
              disabled={loginLoading}
              className="w-full bg-white text-gray-800 font-semibold py-3.5 rounded-lg flex items-center justify-center gap-3 text-sm border border-white/20 disabled:opacity-60 hover:bg-gray-100 transition"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
                </svg>
              )}
              {loginLoading ? "Aguarde..." : "Entrar com Google"}
            </button>

            <AnimatePresence>
              {loginError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-medium text-center"
                >
                  {loginError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ── Painel admin ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-12">
      {/* Header */}
      <div className="bg-[#0A1628] px-5 pt-14 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-wide">Admin</p>
            <h1 className="text-white font-black text-xl leading-tight">Painel de Acesso</h1>
          </div>
        </div>
        <button
          onClick={() => signOut(auth).then(() => onNavigate("dashboard"))}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 max-w-lg mx-auto">

        {/* Formulário */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Liberar acesso manual</p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">Email do usuário</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Plano</label>
              <select
                value={plano}
                onChange={e => setPlano(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-3 text-sm bg-[#F4F6F8] focus:outline-none focus:border-primary"
              >
                {PLANOS.map(p => (
                  <option key={p} value={p}>{PLANO_LABELS[p]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Duração</label>
              <select
                value={duracao}
                onChange={e => setDuracao(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-3 text-sm bg-[#F4F6F8] focus:outline-none focus:border-primary"
              >
                {DURACOES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <motion.button
            onClick={handleLiberar}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Liberar Acesso"}
          </motion.button>

          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-2 p-3 rounded-xl text-sm font-medium ${
                  msg.type === "ok"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {msg.type === "ok"
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {msg.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lista de acessos */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-4">
            Acessos ativos (últimos 10)
          </p>

          {loadingGrants ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
            </div>
          ) : grants.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Nenhum acesso liberado ainda.</p>
          ) : (
            <div className="space-y-3">
              {grants.map(g => (
                <div
                  key={g.id}
                  className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0A1628] truncate">{g.email}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                        {PLANO_LABELS[g.plano] ?? g.plano}
                      </span>
                      <span className="text-xs text-text-muted">
                        {DURACAO_LABELS[g.duracao] ?? g.duracao}
                      </span>
                      {g.dataExpiracao && (
                        <span className="text-xs text-text-muted">
                          até {fmt(g.dataExpiracao)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">em {fmt(g.liberadoEm)}</p>
                  </div>
                  <button
                    onClick={() => handleRevogar(g)}
                    disabled={revogando === g.id}
                    className="flex-shrink-0 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                    title="Revogar"
                  >
                    {revogando === g.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
