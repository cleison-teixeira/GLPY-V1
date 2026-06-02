import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import glpyLogoLight from '@/assets/logos/logo-light.png';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

const ERROS: Record<string, string> = {
  "auth/email-already-in-use":   "Este email já está cadastrado.",
  "auth/invalid-email":           "Email inválido.",
  "auth/weak-password":           "Senha muito fraca (mínimo 6 caracteres).",
  "auth/user-not-found":          "Usuário não encontrado.",
  "auth/wrong-password":          "Senha incorreta.",
  "auth/invalid-credential":      "Email ou senha incorretos.",
  "auth/too-many-requests":       "Muitas tentativas. Tente novamente mais tarde.",
  "auth/popup-closed-by-user":    "Login com Google cancelado.",
  "auth/popup-blocked":           "Pop-up bloqueado pelo navegador. Permita pop-ups para este site.",
  "auth/network-request-failed":  "Erro de conexão. Verifique sua internet.",
  "auth/user-disabled":           "Esta conta foi desativada.",
};

function traduzir(code: string) {
  return ERROS[code] ?? "Ocorreu um erro. Tente novamente.";
}

type Modo = "login" | "cadastro" | "recuperar";

export default function Login() {
  const [modo, setModo] = useState<Modo>("login");

  // Login / cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Recuperar senha
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [loadingRecuperar, setLoadingRecuperar] = useState(false);
  const [sucessoRecuperar, setSucessoRecuperar] = useState(false);
  const [erroRecuperar, setErroRecuperar] = useState<string | null>(null);

  const limpar = () => { setErro(null); };

  const irParaRecuperar = () => {
    setModo("recuperar");
    setErro(null);
    setErroRecuperar(null);
    setSucessoRecuperar(false);
    setEmailRecuperar(email); // pré-preenche com o email já digitado
  };

  const voltarParaLogin = () => {
    setModo("login");
    setErroRecuperar(null);
    setSucessoRecuperar(false);
  };

  const handleGoogle = async () => {
    setErro(null);
    setLoadingGoogle(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged em App.tsx cuida do redirecionamento
    } catch (e: unknown) {
      setErro(traduzir((e as { code?: string }).code ?? ""));
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) { setErro("Preencha email e senha."); return; }
    setErro(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (e: unknown) {
      setErro(traduzir((e as { code?: string }).code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { setErro("Digite seu nome."); return; }
    if (!email.trim()) { setErro("Digite seu email."); return; }
    if (senha.length < 6) { setErro("Senha muito curta (mínimo 6 caracteres)."); return; }
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    setErro(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      await updateProfile(cred.user, { displayName: nome.trim() });
    } catch (e: unknown) {
      setErro(traduzir((e as { code?: string }).code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailRecuperar.trim()) { setErroRecuperar("Digite seu email."); return; }
    setErroRecuperar(null);
    setLoadingRecuperar(true);
    try {
      await sendPasswordResetEmail(auth, emailRecuperar.trim());
      setSucessoRecuperar(true);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/invalid-email") {
        setErroRecuperar("Email inválido. Verifique e tente novamente.");
      } else {
        // Resposta genérica por segurança — não revela se o email existe
        setSucessoRecuperar(true);
      }
    } finally {
      setLoadingRecuperar(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <img src={glpyLogoLight} alt="GLPY" className="h-10 w-auto max-w-[180px] object-contain" />
        <p className="text-xs text-text-muted">Sua jornada metabólica inteligente</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-lg border border-border p-7"
      >
        <AnimatePresence mode="wait">

          {/* ── RECUPERAR SENHA ──────────────────────────── */}
          {modo === "recuperar" && (
            <motion.div
              key="recuperar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
            >
              {/* Voltar */}
              <button
                onClick={voltarParaLogin}
                className="flex items-center gap-1.5 text-xs text-text-muted font-semibold mb-5 hover:text-primary transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar para login
              </button>

              {/* Título */}
              <h1 className="font-bold text-xl text-[#0A1628] mb-1">Recuperar senha</h1>
              <p className="text-text-muted text-sm mb-6">
                Enviaremos um link para redefinir sua senha.
              </p>

              {/* Aviso Google */}
              <div className="bg-[#F4F6F8] border border-border rounded-2xl px-4 py-3 mb-5">
                <p className="text-xs text-text-muted leading-relaxed">
                  <span className="font-bold text-[#0A1628]">Entrou com Google?</span>{" "}
                  A senha é gerenciada pela sua conta Google. Use o botão{" "}
                  <span className="font-semibold">"Entrar com Google"</span> ou recupere diretamente
                  em{" "}
                  <span className="font-semibold text-primary">myaccount.google.com</span>.
                </p>
              </div>

              {/* Sucesso */}
              <AnimatePresence>
                {sucessoRecuperar && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-3 mb-4"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold mb-0.5">Link enviado!</p>
                      <p className="text-xs leading-relaxed">
                        Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
                        Verifique também a caixa de spam.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulário (oculto após sucesso) */}
              {!sucessoRecuperar && (
                <form onSubmit={handleRecuperarSenha} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">Email</label>
                    <input
                      type="email"
                      value={emailRecuperar}
                      onChange={e => { setEmailRecuperar(e.target.value); setErroRecuperar(null); }}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-base focus:outline-none focus:border-primary focus:bg-white transition"
                      autoComplete="email"
                      inputMode="email"
                      autoFocus
                    />
                  </div>

                  {/* Erro recuperação */}
                  <AnimatePresence>
                    {erroRecuperar && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed">{erroRecuperar}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loadingRecuperar}
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition disabled:opacity-60 mt-2"
                  >
                    {loadingRecuperar
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : "Enviar link de recuperação"
                    }
                  </button>
                </form>
              )}

              {/* Após sucesso — botão voltar */}
              {sucessoRecuperar && (
                <button
                  onClick={voltarParaLogin}
                  className="w-full border-2 border-border text-[#0A1628] font-bold py-3.5 rounded-2xl hover:border-primary/40 transition mt-2"
                >
                  Voltar para login
                </button>
              )}
            </motion.div>
          )}

          {/* ── LOGIN / CADASTRO ──────────────────────────── */}
          {modo !== "recuperar" && (
            <motion.div
              key="loginCadastro"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18 }}
            >
              {/* Título */}
              <h1 className="font-bold text-xl text-[#0A1628] mb-1">
                {modo === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
              </h1>
              <p className="text-text-muted text-sm mb-6">
                {modo === "login" ? "Entre para continuar sua jornada" : "Comece sua transformação agora"}
              </p>

              {/* Formulário */}
              <form onSubmit={modo === "login" ? handleLogin : handleCadastro} className="space-y-3">

                {/* Nome — só no cadastro */}
                <AnimatePresence>
                  {modo === "cadastro" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-xs font-semibold text-text-muted mb-1.5">Nome completo</label>
                      <input
                        type="text"
                        value={nome}
                        onChange={e => { setNome(e.target.value); limpar(); }}
                        placeholder="Seu nome"
                        className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-base focus:outline-none focus:border-primary focus:bg-white transition"
                        autoComplete="name"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); limpar(); }}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-base focus:outline-none focus:border-primary focus:bg-white transition"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                {/* Senha */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-text-muted">Senha</label>
                    {/* Link "Esqueci minha senha" — visível apenas no login */}
                    {modo === "login" && (
                      <button
                        type="button"
                        onClick={irParaRecuperar}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={verSenha ? "text" : "password"}
                      value={senha}
                      onChange={e => { setSenha(e.target.value); limpar(); }}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 pr-11 bg-[#F4F6F8] border border-border rounded-xl text-base focus:outline-none focus:border-primary focus:bg-white transition"
                      autoComplete={modo === "login" ? "current-password" : "new-password"}
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

                {/* Confirmar senha — só no cadastro */}
                <AnimatePresence>
                  {modo === "cadastro" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-xs font-semibold text-text-muted mb-1.5">Confirmar senha</label>
                      <div className="relative">
                        <input
                          type={verConfirmar ? "text" : "password"}
                          value={confirmar}
                          onChange={e => { setConfirmar(e.target.value); limpar(); }}
                          placeholder="Repita a senha"
                          className="w-full px-4 py-3 pr-11 bg-[#F4F6F8] border border-border rounded-xl text-base focus:outline-none focus:border-primary focus:bg-white transition"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setVerConfirmar(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                        >
                          {verConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Erro login/cadastro */}
                <AnimatePresence>
                  {erro && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed">{erro}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botão principal */}
                <button
                  type="submit"
                  disabled={loading || loadingGoogle}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition disabled:opacity-60 mt-2"
                >
                  {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : modo === "login" ? "Entrar" : "Criar conta"
                  }
                </button>
              </form>

              {/* Alternar modo login/cadastro */}
              <div className="text-center mt-5">
                {modo === "login" ? (
                  <p className="text-sm text-text-muted">
                    Não tem conta?{" "}
                    <button
                      onClick={() => { setModo("cadastro"); setErro(null); }}
                      className="text-primary font-bold hover:underline"
                    >
                      Criar conta
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">
                    Já tem conta?{" "}
                    <button
                      onClick={() => { setModo("login"); setErro(null); }}
                      className="text-primary font-bold hover:underline"
                    >
                      Entrar
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Rodapé */}
      <p className="text-xs text-text-muted mt-8 text-center max-w-xs">
        Ao entrar você concorda com os Termos de Uso e Política de Privacidade do GLPY.
      </p>
    </div>
  );
}
