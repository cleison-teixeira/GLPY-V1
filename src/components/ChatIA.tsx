import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, Loader2, ChevronLeft, X } from "lucide-react";
import BottomNav from "./BottomNav";

const LIMITES_IA: Record<string, number> = { starter: 10, plus: 20, pro: 30, top: Infinity };

function getMsgsUsadas(): number {
  const mesAtual = new Date().toISOString().slice(0, 7);
  const mes = localStorage.getItem("glpy_ia_msgs_mes");
  if (mes !== mesAtual) return 0;
  return parseInt(localStorage.getItem("glpy_ia_msgs_usadas") || "0", 10);
}

function incrementarMsgs() {
  const mesAtual = new Date().toISOString().slice(0, 7);
  const count = getMsgsUsadas() + 1;
  localStorage.setItem("glpy_ia_msgs_mes", mesAtual);
  localStorage.setItem("glpy_ia_msgs_usadas", String(count));
}

type Message = { id: number; sender: 'ia' | 'user'; text: string; };

const PROTOCOL_STORAGE_MAP: Record<string, string> = {
  antiRebote: "glpy_antirebote",
  sobrevivendoCanetas: "glpy_sobrevivendo",
  efeitosColaterais: "glpy_efeitos",
  antiQuedaCabelo: "glpy_cabelo",
  psicologiaEmagrecimento: "glpy_psicologia",
  alimentacaoBaixoApetite: "glpy_baixoapetite",
  naoPerdaMusculos: "glpy_musculos",
  energiaBaixa: "glpy_energia",
  ajusteMetabolico: "glpy_metabolico",
  transicaoParar: "glpy_transicao",
};

function getFullUserContext(): string {
  try {
    const sections: string[] = ["PERFIL COMPLETO DO USUÁRIO:"];

    // 1. Protocolo ativo + missões
    const ativo = JSON.parse(localStorage.getItem("glpy_protocolo_ativo") || "null");
    if (ativo?.id && ativo?.nome) {
      const progresso = JSON.parse(localStorage.getItem(`glpy_protocolo_${ativo.id}_progresso`) || "null");
      const diasFeitos = progresso?.diasConcluidos?.length ?? 0;
      const totalDias = ativo.totalDias || 7;
      const diaAtual = Math.min(diasFeitos + 1, totalDias);
      const prefix = PROTOCOL_STORAGE_MAP[ativo.id] || `glpy_${ativo.id}`;
      const missoes: number[] = JSON.parse(localStorage.getItem(`${prefix}_missoes`) || "[]");
      sections.push(`Protocolo: ${ativo.nome} — Dia ${diaAtual}/${totalDias}\nMissões de hoje: ${missoes.length}/3 concluídas`);
    }

    // 2. Check-in de hoje
    const c = JSON.parse(localStorage.getItem("glpy_ultimo_checkin") || "null");
    if (c) {
      const sint = c.sintomas?.length ? `\n- Sintomas: ${c.sintomas.join(", ")}` : "";
      sections.push(`Check-in de hoje:\n- Enjoo: ${c.enjoo}/10, Fome: ${c.fome}/10, Energia: ${c.energia}/10${sint}`);

      const rules: string[] = [];
      if (c.enjoo >= 7) rules.push("enjoo alto → refeições leves (caldo, frutas, torradas)");
      if (c.fraqueza >= 7) rules.push("fraqueza alta → proteína + descanso");
      if (c.fome <= 3) rules.push("fome baixa → porções menores, alimentos densos");
      if (c.energia <= 4) rules.push("energia baixa → carboidratos de baixo índice glicêmico");
      if (rules.length > 0) sections.push(`Regras de adaptação:\n${rules.map(r => `- ${r}`).join("\n")}`);
    }

    // 3. Últimas refeições fotografadas
    const fotos: { prato?: string; kcal?: number; proteina?: number; data?: string }[] =
      JSON.parse(localStorage.getItem("glpy_fotos_historico") || "[]");
    if (fotos.length > 0) {
      const linhas = fotos.slice(0, 3).map(f =>
        `- ${f.data || "hoje"}: ${f.prato || "refeição"} — ${f.kcal ?? 0} kcal, ${f.proteina ?? 0}g prot`
      );
      sections.push(`Últimas refeições:\n${linhas.join("\n")}`);
    }

    // 4. Progresso geral
    const streak = parseInt(localStorage.getItem("glpy_streak") || "0", 10);
    const xp = parseInt(localStorage.getItem("glpy_xp") || "0", 10);
    const nivel = parseInt(localStorage.getItem("glpy_nivel") || "1", 10);
    sections.push(`Progresso geral:\n- Streak: ${streak} dias 🔥\n- XP: ${xp} pontos\n- Nível: ${nivel}`);

    return `\n\n${sections.join("\n\n")}\n\nIMPORTANTE: Use TODOS esses dados para dar respostas personalizadas e específicas.`;
  } catch { return ""; }
}

const QUICK_REPLIES = [
  "O que comer agora?", "Tenho náusea", "Estou desmotivado", "Energia baixa hoje",
];

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function ChatIA({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const nome = localStorage.getItem("glpy_nome") || "você";
  const saudacao = getSaudacao();
  const fullCtx = getFullUserContext();

  // limpa chave legada de modo inicial
  localStorage.removeItem("glpy_chat_initial_mode");

  const _ativo = (() => { try { return JSON.parse(localStorage.getItem("glpy_protocolo_ativo") || "null"); } catch { return null; } })();
  const _fome = (() => { try { const c = JSON.parse(localStorage.getItem("glpy_ultimo_checkin") || "null"); return c?.fome ?? null; } catch { return null; } })();
  const _diaAtual = (() => {
    if (!_ativo?.id) return 1;
    try {
      const p = JSON.parse(localStorage.getItem(`glpy_protocolo_${_ativo.id}_progresso`) || "null");
      return Math.min((p?.diasConcluidos?.length ?? 0) + 1, _ativo.totalDias || 7);
    } catch { return (_ativo.dia ?? 0) + 1; }
  })();

  const initialMessage = _ativo?.nome
    ? `${saudacao}, ${nome}! 👋\n\nVi que você está no Dia ${_diaAtual} do protocolo "${_ativo.nome}". Sua fome hoje está em ${_fome !== null ? `${_fome}/10` : "—"}.\n\nPosso ajudar com alimentação, sintomas ou motivação — o que precisa?`
    : `${saudacao}, ${nome}! 👋\n\nSou a GLPY.IA, sua especialista em GLP-1. Pode me perguntar sobre alimentação, sintomas, motivação ou qualquer dúvida sobre seu tratamento.\n\nComo posso ajudar?`;

  const SYSTEM_PROMPT = `Você é GLPY.IA — a inteligência artificial do app GLPY, especialista em GLP-1 (Ozempic, Mounjaro, Saxenda, Wegovy).

Você é ao mesmo tempo:
- 🟡 Nutricionista: adapta alimentação ao protocolo e sintomas
- 🔵 Coach: motiva, celebra conquistas, mantém streak
- 🔴 Diagnóstico: identifica sintomas, adapta protocolo, alerta riscos
${fullCtx}

IMPORTANTE:
- Adapte seu tom ao contexto da pergunta
- Se falam de comida → nutricionista
- Se falam de motivação → coach
- Se relatam sintoma → diagnóstico
- Use TODOS os dados do perfil para personalizar
- Seja direta, empática, científica sem jargão
- Celebre vitórias, não julgue falhas
- Termine SEMPRE com uma ação específica e concreta para as próximas 2 horas. Formato: "Próximas 2 horas: [ação exata]".`;

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ia', text: initialMessage }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLimiteModal, setShowLimiteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const plano = localStorage.getItem("glpy_plano") || "starter";
  const limiteIA = LIMITES_IA[plano] ?? 10;
  const msgsUsadas = getMsgsUsadas();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (msgsUsadas >= limiteIA) {
      setShowLimiteModal(true);
      return;
    }

    const userMsg: Message = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      history.push({ role: 'user', content: text });

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(import.meta.env.VITE_DEEPSEEK_KEY || "").trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          max_tokens: 500,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
          ],
        }),
      });

      const data = await response.json();
      const iaText = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem. Tente novamente.";

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ia', text: iaText }]);
      incrementarMsgs();
    } catch (error) {
      console.error("[ChatIA] DeepSeek fetch error:", {
        message: error instanceof Error ? error.message : String(error),
        key_defined: !!import.meta.env.VITE_DEEPSEEK_KEY,
      });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ia',
        text: "Ops! Tive um problema de conexão. Verifique sua internet e tente novamente. 🔄",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col pb-24">

      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm p-4 border-b border-border z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div className="flex items-center gap-2 flex-grow">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-base">GLPY.IA</h1>
              <p className="text-text-muted text-xs">
                Online ·{limiteIA !== Infinity ? ` ${msgsUsadas}/${limiteIA} msgs` : ' Ilimitado'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-3.5 rounded-2xl max-w-[82%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white border border-border text-text-main rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm p-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-text-muted">GLPY.IA está digitando...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {QUICK_REPLIES.map(reply => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:border-primary hover:text-primary transition flex-shrink-0"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-16 px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="relative pb-12">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Pergunte qualquer coisa..."
            className="w-full p-3.5 pr-12 bg-white border border-border rounded-2xl text-sm focus:outline-none focus:border-primary transition min-h-[40px] max-h-[120px] resize-none overflow-y-auto"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="absolute bottom-2 right-2 w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BottomNav active="chatIA" onNavigate={onNavigate} />

      {/* Modal limite atingido */}
      <AnimatePresence>
        {showLimiteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowLimiteModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm mb-2 relative"
            >
              <button onClick={() => setShowLimiteModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-muted">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🤖</div>
                <h2 className="font-bold text-lg text-[#0A1628]">Limite atingido</h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Você usou todas as {limiteIA} mensagens do mês no plano atual.<br />
                  Faça upgrade para continuar conversando com a GLPY.IA.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLimiteModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold text-text-muted"
                >
                  Agora não
                </button>
                <button
                  onClick={() => { setShowLimiteModal(false); onNavigate('planos'); }}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-sm font-semibold"
                >
                  Ver planos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
