import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, Trash2, LogOut, Copy, Check } from "lucide-react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import {
  revogarAcesso,
  listarAcessosManuais,
  type Grant,
} from "../services/firestore";

// ── Constantes ────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = "cleisonimarketing@gmail.com";

const PLANOS = [
  { value: "fundador",  label: "Fundador — R$19,90/mês" },
  { value: "essencial", label: "Essencial — R$49,90/mês" },
  { value: "semestral", label: "Semestral — R$249,90" },
  { value: "anual",     label: "Anual — R$447,00" },
  { value: "pro",       label: "Pro" },
] as const;

const ORIGENS = [
  { value: "pix_manual_whatsapp", label: "Pix Manual (WhatsApp)" },
  { value: "admin_manual",        label: "Admin Manual" },
  { value: "cortesia",            label: "Cortesia" },
  { value: "teste_interno",       label: "Teste Interno" },
  { value: "anfitria_celula",     label: "Anfitriã de Célula" },
  { value: "embaixadora_glpy",    label: "Embaixadora GLPY" },
] as const;

const PRAZOS = [
  { value: "7d",           label: "7 dias" },
  { value: "15d",          label: "15 dias" },
  { value: "30d",          label: "30 dias" },
  { value: "90d",          label: "90 dias" },
  { value: "vitalicio",    label: "Sem expiração" },
  { value: "personalizado", label: "Personalizado" },
] as const;

const PRAZO_DIAS: Record<string, number> = {
  "7d": 7, "15d": 15, "30d": 30, "90d": 90,
};

// Prazo padrão por origem
const ORIGEM_PRAZO_DEFAULT: Record<string, string> = {
  pix_manual_whatsapp: "30d",
  admin_manual:        "vitalicio",
  cortesia:            "personalizado",
  teste_interno:       "7d",
  anfitria_celula:     "90d",
  embaixadora_glpy:    "90d",
};

const PLANO_LABELS: Record<string, string> = {
  fundador:  "Fundador",
  essencial: "Essencial",
  semestral: "Semestral",
  anual:     "Anual",
  pro:       "Pro",
  top:       "Top",
  plus:      "Plus",
  starter:   "Starter",
};

const ORIGEM_LABELS: Record<string, string> = {
  pix_manual_whatsapp: "Pix WhatsApp",
  admin_manual:        "Admin Manual",
  cortesia:            "Cortesia",
  teste_interno:       "Teste Interno",
  anfitria_celula:     "Anfitriã de Célula",
  embaixadora_glpy:    "Embaixadora GLPY",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtBR(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildLink(email: string) {
  return `https://glpy.com.br/acesso?email=${encodeURIComponent(email)}&token=GLPY2026`;
}

function calcularExpiracao(prazo: string, prazoCustomDate: string): Date | null {
  if (prazo === "vitalicio") return null;
  if (prazo === "personalizado") {
    if (!prazoCustomDate) return null;
    return new Date(prazoCustomDate + "T23:59:59");
  }
  const dias = PRAZO_DIAS[prazo];
  if (!dias) return null;
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d;
}

function buildWhatsAppMsg(
  email: string,
  plano: string,
  origem: string,
  prazo: string,
  dataExp: Date | null,
): string {
  const link = buildLink(email);
  const planoLabel = PLANO_LABELS[plano] ?? plano;
  const footer = `\n\nAcesse:\n${link}\n\nClique em 'Criar / redefinir minha senha' e entre com o mesmo e-mail informado na compra.\n\nQualquer dificuldade, me chama aqui.`;
  const dateStr = dataExp ? fmtBR(dataExp) : "";
  const dias = PRAZO_DIAS[prazo];

  let intro: string;
  switch (origem) {
    case "pix_manual_whatsapp":
      intro = dias
        ? `Seu acesso GLPY ${planoLabel} foi liberado por ${dias} dias 💚`
        : `Seu acesso GLPY ${planoLabel} foi liberado 💚`;
      break;
    case "cortesia":
      intro = dateStr
        ? `Seu acesso cortesia ao GLPY foi liberado até ${dateStr} 💚`
        : `Seu acesso cortesia ao GLPY foi liberado 💚`;
      break;
    case "teste_interno":
      intro = dateStr
        ? `Seu acesso de teste ao GLPY foi liberado até ${dateStr} 💚`
        : `Seu acesso de teste ao GLPY foi liberado 💚`;
      break;
    case "anfitria_celula":
      intro = dateStr
        ? `Seu acesso como Anfitriã de Célula GLPY foi liberado até ${dateStr} 💚`
        : `Seu acesso como Anfitriã de Célula GLPY foi liberado 💚`;
      break;
    case "embaixadora_glpy":
      intro = dateStr
        ? `Seu acesso como Embaixadora GLPY foi liberado até ${dateStr} 💚`
        : `Seu acesso como Embaixadora GLPY foi liberado 💚`;
      break;
    default:
      intro = `Seu acesso GLPY foi liberado 💚`;
  }

  return intro + footer;
}

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copiado!" : label}
    </button>
  );
}

type SuccessData = {
  email: string;
  nome: string;
  plano: string;
  origem: string;
  prazo: string;
  dataExp: Date | null;
  link: string;
  whatsappMsg: string;
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function AdminPanel({ onNavigate }: { onNavigate: (s: string) => void }) {
  // Auth
  const [verificando,  setVerificando]  = useState(true);
  const [autorizado,   setAutorizado]   = useState(false);
  const [negado,       setNegado]       = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState<string | null>(null);

  // Form
  const [nome,           setNome]           = useState("");
  const [email,          setEmail]          = useState("");
  const [telefone,       setTelefone]       = useState("");
  const [plano,          setPlano]          = useState("fundador");
  const [origem,         setOrigem]         = useState("pix_manual_whatsapp");
  const [prazo,          setPrazo]          = useState(ORIGEM_PRAZO_DEFAULT["pix_manual_whatsapp"]);
  const [prazoCustomDate, setPrazoCustomDate] = useState("");
  const [valorPago,      setValorPago]      = useState("");
  const [observacao,     setObservacao]     = useState("");
  const [comprovanteUrl, setComprovanteUrl] = useState("");

  // Panel
  const [loading,       setLoading]       = useState(false);
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const [successData,   setSuccessData]   = useState<SuccessData | null>(null);
  const [grants,        setGrants]        = useState<Grant[]>([]);
  const [loadingGrants, setLoadingGrants] = useState(false);
  const [revogando,     setRevogando]     = useState<string | null>(null);

  // Auto-ajuste de prazo quando origem muda
  useEffect(() => {
    setPrazo(ORIGEM_PRAZO_DEFAULT[origem] ?? "30d");
    setPrazoCustomDate("");
  }, [origem]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.email === ADMIN_EMAIL) {
        setAutorizado(true);
        setNegado(false);
        setLoadingGrants(true);
        listarAcessosManuais()
          .then(setGrants)
          .catch(() => {})
          .finally(() => setLoadingGrants(false));
      } else if (user) {
        setNegado(true);
        setAutorizado(false);
      } else {
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
    } catch {
      setLoginError("Falha ao abrir o login com Google. Tente novamente.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLiberar = async () => {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo)   { setErrorMsg("Informe o e-mail do cliente."); return; }
    if (!nome.trim())  { setErrorMsg("Informe o nome do cliente."); return; }
    if (prazo === "personalizado" && !prazoCustomDate) {
      setErrorMsg("Informe a data de expiração para o prazo personalizado.");
      return;
    }

    const dataExp = calcularExpiracao(prazo, prazoCustomDate);
    const accessType: "temporario" | "sem_expiracao" | "personalizado" =
      prazo === "vitalicio"    ? "sem_expiracao"  :
      prazo === "personalizado" ? "personalizado" : "temporario";
    const durationDays = PRAZO_DIAS[prazo] ?? null;

    setLoading(true);
    setErrorMsg(null);
    setSuccessData(null);

    try {
      // Obter ID token do admin para autenticação server-side
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Sessão expirada. Faça login novamente.");

      console.log("[admin] chamando /api/admin/manual-access", {
        email: emailLimpo, plano, origem, prazo, accessType, durationDays,
        dataExpiracao: dataExp?.toISOString() ?? null,
      });

      const resp = await fetch("/api/admin/manual-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          nome:           nome.trim(),
          email:          emailLimpo,
          telefone:       telefone.trim(),
          plano,
          origem,
          valorPago:      valorPago.trim(),
          observacao:     observacao.trim(),
          comprovanteUrl: comprovanteUrl.trim(),
          accessType,
          durationDays,
          dataExpiracao:  dataExp?.toISOString() ?? null,
          adminEmail:     auth.currentUser?.email ?? ADMIN_EMAIL,
        }),
      });

      const result = await resp.json() as { ok: boolean; error?: string; code?: string; action?: string; uid?: string };

      console.log("[admin] resposta /api/admin/manual-access:", result);

      if (!result.ok) {
        const detalhe = result.error ? ` (${result.error})` : "";
        const msgErro =
          result.error === "unauthorized"   ? "Sessão inválida. Faça login novamente." :
          result.error === "forbidden"      ? "Acesso negado: apenas o admin pode liberar acessos." :
          result.error === "missing_email"  ? "E-mail inválido." :
          result.error === "missing_nome"   ? "Nome obrigatório." :
          result.error === "invalid_token"  ? "Token de sessão inválido. Faça logout e login novamente." :
          `Erro ao liberar acesso${detalhe}`;
        throw new Error(msgErro);
      }

      const link = buildLink(emailLimpo);
      const whatsappMsg = buildWhatsAppMsg(emailLimpo, plano, origem, prazo, dataExp);

      console.log("[admin] acesso liberado com sucesso:", { uid: result.uid, action: result.action, link });

      setSuccessData({ email: emailLimpo, nome: nome.trim(), plano, origem, prazo, dataExp, link, whatsappMsg });

      setNome(""); setEmail(""); setTelefone("");
      setValorPago(""); setObservacao(""); setComprovanteUrl("");

      listarAcessosManuais().then(setGrants).catch(() => {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao liberar acesso. Verifique o console.";
      setErrorMsg(msg);
      console.error("[admin] handleLiberar erro:", e);
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

  // ── Verificando ───────────────────────────────────────────────────────────
  if (verificando) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // ── Acesso negado ─────────────────────────────────────────────────────────
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

  // ── Login ─────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-[#F4F6F8] pb-16">

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

        {/* ── Formulário ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Liberar acesso manual Pix</p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">
              Nome do cliente <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Maria Silva"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">
              E-mail do cliente <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">WhatsApp / Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              placeholder="(48) 99999-9999"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
            />
          </div>

          {/* Plano + Origem */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">
                Plano <span className="text-red-400">*</span>
              </label>
              <select
                value={plano}
                onChange={e => setPlano(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-3 text-sm bg-[#F4F6F8] focus:outline-none focus:border-primary"
              >
                {PLANOS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">
                Origem <span className="text-red-400">*</span>
              </label>
              <select
                value={origem}
                onChange={e => setOrigem(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-3 text-sm bg-[#F4F6F8] focus:outline-none focus:border-primary"
              >
                {ORIGENS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prazo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-muted">
              Prazo de acesso <span className="text-red-400">*</span>
            </label>
            <select
              value={prazo}
              onChange={e => { setPrazo(e.target.value); setPrazoCustomDate(""); }}
              className="w-full border border-border rounded-xl px-3 py-3 text-sm bg-[#F4F6F8] focus:outline-none focus:border-primary"
            >
              {PRAZOS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            {/* Data personalizada */}
            <AnimatePresence>
              {prazo === "personalizado" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-text-muted">
                      Data de expiração <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={prazoCustomDate}
                      onChange={e => setPrazoCustomDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview de expiração */}
            {prazo !== "vitalicio" && prazo !== "personalizado" && (
              <p className="text-xs text-text-muted px-1">
                Expira em: {fmt(calcularExpiracao(prazo, "") ?? new Date())}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">Valor pago</label>
            <input
              type="text"
              value={valorPago}
              onChange={e => setValorPago(e.target.value)}
              placeholder="R$19,90"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">Observação</label>
            <input
              type="text"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Ex: Compra via grupo WhatsApp"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">Link do comprovante (opcional)</label>
            <input
              type="url"
              value={comprovanteUrl}
              onChange={e => setComprovanteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary bg-[#F4F6F8]"
            />
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
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200"
              >
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Resultado de sucesso ────────────────────────────────────────── */}
        <AnimatePresence>
          {successData && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-primary/20 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-primary">
                    Acesso {PLANO_LABELS[successData.plano] ?? successData.plano} liberado
                  </p>
                  <p className="text-xs text-text-muted">
                    {successData.nome} · {ORIGEM_LABELS[successData.origem] ?? successData.origem}
                    {successData.dataExp
                      ? ` · até ${fmtBR(successData.dataExp)}`
                      : " · sem expiração"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Link de acesso</p>
                <div className="bg-[#F4F6F8] rounded-xl px-3 py-2.5 text-xs text-text-main font-mono break-all leading-relaxed">
                  {successData.link}
                </div>
                <CopyButton text={successData.link} label="Copiar link de acesso" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Mensagem WhatsApp</p>
                <div className="bg-[#F4F6F8] rounded-xl px-3 py-2.5 text-xs text-text-main whitespace-pre-line leading-relaxed">
                  {successData.whatsappMsg}
                </div>
                <CopyButton text={successData.whatsappMsg} label="Copiar mensagem WhatsApp" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Histórico de liberações ─────────────────────────────────────── */}
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
            <div className="space-y-4">
              {grants.map(g => {
                const grantLink = buildLink(g.email);
                const grantWhatsApp = buildWhatsAppMsg(g.email, g.plano, g.origem ?? "admin_manual", g.duracao ?? "vitalicio", g.dataExpiracao);
                return (
                  <div key={g.id} className="py-3 border-b border-border last:border-0 space-y-2">
                    {/* Nome + email + revogar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0A1628] truncate">
                          {g.nome ?? g.email}
                        </p>
                        <p className="text-xs text-text-muted truncate">{g.email}</p>
                        {g.telefone && (
                          <p className="text-xs text-text-muted">{g.telefone}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRevogar(g)}
                        disabled={revogando === g.id}
                        className="flex-shrink-0 p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                        title="Revogar acesso"
                      >
                        {revogando === g.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                        {PLANO_LABELS[g.plano] ?? g.plano}
                      </span>
                      {g.origem && (
                        <span className="text-xs bg-[#F4F6F8] text-text-muted px-2 py-0.5 rounded-full">
                          {ORIGEM_LABELS[g.origem] ?? g.origem}
                        </span>
                      )}
                      {g.valorPago && (
                        <span className="text-xs text-text-muted font-medium">{g.valorPago}</span>
                      )}
                    </div>

                    {/* Prazo */}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      {g.dataExpiracao
                        ? <span>Expira: <strong className="text-text-main">{fmt(g.dataExpiracao)}</strong></span>
                        : <span className="text-green-600 font-medium">Sem expiração</span>
                      }
                      {g.durationDays && (
                        <span className="text-text-muted/60">({g.durationDays} dias)</span>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-text-muted">em {fmt(g.liberadoEm)}</p>
                      <CopyButton text={grantLink} label="Copiar link" />
                      <CopyButton text={grantWhatsApp} label="Copiar WhatsApp" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
