import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import glpyLogoLight from '@/assets/logos/logo-light.png';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

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

export default function Login() {
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const limpar = () => { setErro(null); };

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
        {/* Título */}
        <h1 className="font-bold text-xl text-[#0A1628] mb-1">
          {modo === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
        </h1>
        <p className="text-text-muted text-sm mb-6">
          {modo === "login" ? "Entre para continuar sua jornada" : "Comece sua transformação agora"}
        </p>

        {/* Botão Google */}
        <button
          onClick={handleGoogle}
          disabled={loadingGoogle || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border rounded-2xl font-semibold text-sm text-[#0A1628] hover:border-primary/40 hover:bg-primary/2 transition disabled:opacity-60 mb-5"
        >
          {loadingGoogle ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Entrar com Google
        </button>

        {/* Separador */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-grow h-px bg-border" />
          <span className="text-xs text-text-muted font-medium">ou</span>
          <div className="flex-grow h-px bg-border" />
        </div>

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
                  className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
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
              className="w-full px-4 py-3 bg-[#F4F6F8] border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              autoComplete="email"
              inputMode="email"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={verSenha ? "text" : "password"}
                value={senha}
                onChange={e => { setSenha(e.target.value); limpar(); }}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 pr-11 bg-[#F4F6F8] border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
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
                    className="w-full px-4 py-3 pr-11 bg-[#F4F6F8] border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
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

          {/* Erro */}
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

        {/* Alternar modo */}
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

      {/* Rodapé */}
      <p className="text-xs text-text-muted mt-8 text-center max-w-xs">
        Ao entrar você concorda com os Termos de Uso e Política de Privacidade do GLPY.
      </p>
    </div>
  );
}
