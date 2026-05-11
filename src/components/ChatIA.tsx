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
type Mode = "Nutri" | "Coach" | "Diagnóstico";

function getUserContext() {
  const onboarding = JSON.parse(localStorage.getItem("glpy_onboarding") || "{}");
  const checkin = JSON.parse(localStorage.getItem("glpy_checkin_hoje") || "{}");
  const streak = parseInt(localStorage.getItem("glpy_streak") || "0", 10);
  const tempoToSemanas: Record<string, number> = {
    "Menos de 1 mês": 2, "1 a 3 meses": 8,
    "3 a 6 meses": 18, "Mais de 6 meses": 30, "Ainda não comecei": 0,
  };
  return {
    nome: (onboarding.nome as string) || "você",
    medicamento: (onboarding.medicamento as string) || "GLP-1",
    dose: (onboarding.dose as string) || "",
    semana: tempoToSemanas[onboarding.tempo as string] ?? 4,
    peso: parseFloat(String(onboarding.peso_atual || 80)),
    streak,
    protocolo: (checkin.protocolo as string) || "Sobrevivendo às Canetas",
    diaProtocolo: (checkin.diaProtocolo as number) || 1,
    fome: (checkin.fome as number) ?? 5,
    // Bug 11: saciedade (não energia) é o campo salvo no check-in
    energia: (checkin.saciedade as number) ?? 5,
    sintomas: (checkin.sintomas as string[]) || [],
  };
}

const QUICK_REPLIES: Record<Mode, string[]> = {
  Nutri: ["Sim, quero a receita", "Tenho náusea", "O que comer no almoço?", "Bati minha meta de proteína?"],
  Coach: ["Estou desmotivado", "Quero manter o streak", "Me ajuda a focar", "Hoje foi difícil"],
  Diagnóstico: ["Estou com muita fome", "Energia baixa hoje", "Tive náusea", "Me sinto bem"],
};

export default function ChatIA({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const ctx = getUserContext();

  const alertaPreditivo = ctx.fome > 7 && ctx.energia < 5
    ? `\n⚠️ ALERTA PREDITIVO CRÍTICO: Fome ${ctx.fome}/10 + energia ${ctx.energia}/10 = risco real de compulsão noturna nas próximas horas. Aborde isso proativamente na resposta.`
    : ctx.fome > 7
    ? `\n⚠️ Fome acima de 7 — usuário pode ceder a alimentos ruins em breve. Seja proativo.`
    : ctx.energia < 4
    ? `\n⚠️ Energia muito baixa — verifique hidratação e proteína do dia.`
    : "";

  const regraFinal = `\n\nREGRA OBRIGATÓRIA: Termine SEMPRE com uma ação específica e concreta para as próximas 2 horas (nunca genérica como "cuide-se" ou "mantenha o foco"). Formato: "Próximas 2 horas: [ação exata]".`;

  const SYSTEM_PROMPTS: Record<Mode, string> = {
    Nutri: `Você é a GLPY.IA no modo Nutricionista. Responda em português brasileiro de forma empática, direta e prática.
Contexto do usuário:
- Nome: ${ctx.nome}
- Medicamento: ${ctx.medicamento} ${ctx.dose}
- Semana ${ctx.semana} de tratamento
- Peso atual: ${ctx.peso}kg
- Protocolo ativo: ${ctx.protocolo} (Dia ${ctx.diaProtocolo}/7)
- Fome hoje: ${ctx.fome}/10
- Energia hoje: ${ctx.energia}/10
- Sintomas: ${ctx.sintomas.length ? ctx.sintomas.join(", ") : "nenhum relatado"}
${alertaPreditivo}

Foque em: refeições, macros, receitas, hidratação e alimentação adaptada ao GLP-1.
Se score < 60: priorize ajuste alimentar urgente na resposta.
Respostas curtas e práticas. Máximo 3 parágrafos. Use emojis com moderação.${regraFinal}`,

    Coach: `Você é a GLPY.IA no modo Coach. Responda em português brasileiro com energia positiva e motivação real.
Contexto do usuário:
- Nome: ${ctx.nome}
- ${ctx.streak} dias de streak 🔥
- Protocolo: ${ctx.protocolo} (Dia ${ctx.diaProtocolo}/7)
- Fome hoje: ${ctx.fome}/10
- Energia hoje: ${ctx.energia}/10
- Score de hoje: 75%
${alertaPreditivo}

Foque em: motivação, celebração de conquistas, consistência e mindset.
Se fome > 7 e energia < 5: o foco principal é evitar compulsão — seja direto sobre isso.
Respostas energéticas mas honestas. Máximo 2 parágrafos.${regraFinal}`,

    Diagnóstico: `Você é a GLPY.IA no modo Diagnóstico. Analise os sinais do usuário e entregue diagnóstico preciso com recomendações imediatas.
Contexto do usuário:
- Nome: ${ctx.nome}
- Medicamento: ${ctx.medicamento} ${ctx.dose}
- Semana ${ctx.semana} de tratamento
- Fome hoje: ${ctx.fome}/10
- Energia: ${ctx.energia}/10
- Sintomas: ${ctx.sintomas.length ? ctx.sintomas.join(", ") : "nenhum relatado"}
${alertaPreditivo}

Análise preditiva obrigatória:
- Fome > 7 + energia < 5 = risco de compulsão noturna — alerte o usuário diretamente
- Score < 60 = ajuste alimentar urgente necessário
- Faça 1 pergunta de acompanhamento por vez. Seja analítico e preciso.${regraFinal}`,
  };

  // Bug 8: lê modo inicial do localStorage (setado pelo Dashboard ao clicar em Risco Alto)
  const _savedMode = localStorage.getItem("glpy_chat_initial_mode");
  const _initialMode: Mode = (_savedMode === "Nutri" || _savedMode === "Coach" || _savedMode === "Diagnóstico")
    ? (_savedMode as Mode) : "Nutri";
  if (_savedMode) localStorage.removeItem("glpy_chat_initial_mode");

  const INITIAL_TEXTS: Record<Mode, string> = {
    Nutri: `Oi ${ctx.nome}! 👋 Estou no modo Nutricionista.\n\nVi que você está no Dia ${ctx.diaProtocolo} do protocolo "${ctx.protocolo}" e sua fome hoje está em ${ctx.fome}/10.\n\nComo posso te ajudar agora?`,
    Coach: `Modo Coach ativo 🔵\n\n${ctx.streak} dias de streak — isso é incrível, ${ctx.nome}! 🔥\n\nEstou aqui para te manter motivado e consistente. Como você está se sentindo hoje?`,
    Diagnóstico: `Modo Diagnóstico ativo 🔴\n\nVou analisar seus dados e entregar um diagnóstico direto.\n\nFome atual: ${ctx.fome}/10 · Saciedade: ${ctx.energia}/10 · Streak: ${ctx.streak} dias\n\nQual sintoma está te preocupando agora?`,
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ia', text: INITIAL_TEXTS[_initialMode] }
  ]);
  const [mode, setMode] = useState<Mode>(_initialMode);
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

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    const modeMessages: Record<Mode, string> = {
      Nutri: `Modo Nutricionista ativo 🟡\n\nSou sua nutricionista especialista em GLP-1. Posso ajudar com refeições, macros, receitas e alimentação adaptada ao ${ctx.medicamento}. O que precisa?`,
      Coach: `Modo Coach ativo 🔵\n\n${ctx.streak} dias de streak — isso é incrível, ${ctx.nome}! 🔥\n\nEstou aqui para te manter motivado e consistente. Como você está se sentindo hoje?`,
      Diagnóstico: `Modo Diagnóstico ativo 🔴\n\nVou fazer algumas perguntas para entender melhor como você está hoje e ajustar suas recomendações.\n\nPrimeiro: como está sua disposição agora, de 1 a 10?`,
    };
    setMessages([{ id: Date.now(), sender: 'ia', text: modeMessages[newMode] }]);
  };

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
          "Authorization": `Bearer ${import.meta.env.DEEPSEEK_KEY || ""}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          max_tokens: 500,
          messages: [
            { role: "system", content: SYSTEM_PROMPTS[mode] },
            ...history,
          ],
        }),
      });

      const data = await response.json();
      const iaText = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem. Tente novamente.";

      const iaMsg: Message = { id: Date.now() + 1, sender: 'ia', text: iaText };
      setMessages(prev => [...prev, iaMsg]);
      incrementarMsgs();
    } catch (error) {
      const errMsg: Message = {
        id: Date.now() + 1,
        sender: 'ia',
        text: "Ops! Tive um problema de conexão. Verifique sua internet e tente novamente. 🔄",
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm p-4 border-b border-border z-10">
        {/* Bug 6: removida logo duplicada — só GLPY.IA */}
        <div className="flex items-center gap-3 mb-3">
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

        {/* Modos */}
        <div className="flex gap-2">
          {(["Nutri", "Coach", "Diagnóstico"] as const).map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                mode === m
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white border border-border text-text-muted"
              }`}
            >
              {m === "Nutri" ? "🟡 Nutri" : m === "Coach" ? "🔵 Coach" : "🔴 Diagnóstico"}
            </button>
          ))}
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

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
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
        {QUICK_REPLIES[mode].map(reply => (
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
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Pergunte qualquer coisa..."
            className="flex-grow p-3.5 bg-white border border-border rounded-full text-sm focus:outline-none focus:border-primary transition"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-primary text-white p-3.5 rounded-full shadow-md hover:bg-primary/90 transition disabled:opacity-50"
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
