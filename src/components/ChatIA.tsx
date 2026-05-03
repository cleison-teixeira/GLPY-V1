import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, Loader2 } from "lucide-react";
import BottomNav from "./BottomNav";

type Message = { id: number; sender: 'ia' | 'user'; text: string; };
type Mode = "Nutri" | "Coach" | "Diagnóstico";

// Contexto do usuário — depois virá do Firebase/estado global
const USER_CONTEXT = {
  nome: "Cleison",
  medicamento: "Mounjaro",
  dose: "5mg",
  semana: 6,
  peso: 83,
  streak: 34,
  protocolo: "Sobrevivendo às Canetas",
  diaProtocolo: 4,
  fome: 7,
  energia: 5,
  sintomas: ["náusea leve"],
};

const SYSTEM_PROMPTS: Record<Mode, string> = {
  Nutri: `Você é a GLPY.IA no modo Nutricionista. Responda em português brasileiro de forma empática, direta e prática.
Contexto do usuário:
- Nome: ${USER_CONTEXT.nome}
- Medicamento: ${USER_CONTEXT.medicamento} ${USER_CONTEXT.dose}
- Semana ${USER_CONTEXT.semana} de tratamento
- Peso atual: ${USER_CONTEXT.peso}kg
- Protocolo ativo: ${USER_CONTEXT.protocolo} (Dia ${USER_CONTEXT.diaProtocolo}/7)
- Fome hoje: ${USER_CONTEXT.fome}/10
- Energia hoje: ${USER_CONTEXT.energia}/10
- Sintomas: ${USER_CONTEXT.sintomas.join(", ")}

Foque em: refeições, macros, receitas, hidratação e alimentação adaptada ao GLP-1.
Respostas curtas e práticas. Máximo 3 parágrafos. Use emojis com moderação.`,

  Coach: `Você é a GLPY.IA no modo Coach. Responda em português brasileiro com energia positiva e motivação real.
Contexto do usuário:
- Nome: ${USER_CONTEXT.nome}
- ${USER_CONTEXT.streak} dias de streak 🔥
- Protocolo: ${USER_CONTEXT.protocolo} (Dia ${USER_CONTEXT.diaProtocolo}/7)
- Score de hoje: 75%

Foque em: motivação, celebração de conquistas, consistência e mindset.
Respostas energéticas mas honestas. Máximo 2 parágrafos.`,

  Diagnóstico: `Você é a GLPY.IA no modo Diagnóstico. Faça perguntas inteligentes para entender o estado do usuário e adapte as recomendações.
Contexto do usuário:
- Nome: ${USER_CONTEXT.nome}
- Medicamento: ${USER_CONTEXT.medicamento} ${USER_CONTEXT.dose}
- Fome hoje: ${USER_CONTEXT.fome}/10
- Energia: ${USER_CONTEXT.energia}/10
- Sintomas: ${USER_CONTEXT.sintomas.join(", ")}

Foque em: diagnóstico do dia, identificação de problemas, ajustes no protocolo.
Faça 1 pergunta por vez. Seja analítico e preciso.`,
};

const QUICK_REPLIES: Record<Mode, string[]> = {
  Nutri: ["Sim, quero a receita", "Tenho náusea", "O que comer no almoço?", "Bati minha meta de proteína?"],
  Coach: ["Estou desmotivado", "Quero manter o streak", "Me ajuda a focar", "Hoje foi difícil"],
  Diagnóstico: ["Estou com muita fome", "Energia baixa hoje", "Tive náusea", "Me sinto bem"],
};

export default function ChatIA({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ia',
      text: `Oi ${USER_CONTEXT.nome}! 👋 Estou no modo Nutricionista.\n\nVi que você está no Dia ${USER_CONTEXT.diaProtocolo} do protocolo "${USER_CONTEXT.protocolo}" e sua fome hoje está em ${USER_CONTEXT.fome}/10.\n\nComo posso te ajudar agora?`
    }
  ]);
  const [mode, setMode] = useState<Mode>("Nutri");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Muda mensagem inicial ao trocar de modo
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    const modeMessages: Record<Mode, string> = {
      Nutri: `Modo Nutricionista ativo 🟡\n\nSou sua nutricionista especialista em GLP-1. Posso ajudar com refeições, macros, receitas e alimentação adaptada ao ${USER_CONTEXT.medicamento}. O que precisa?`,
      Coach: `Modo Coach ativo 🔵\n\n${USER_CONTEXT.streak} dias de streak — isso é incrível, ${USER_CONTEXT.nome}! 🔥\n\nEstou aqui para te manter motivado e consistente. Como você está se sentindo hoje?`,
      Diagnóstico: `Modo Diagnóstico ativo 🔴\n\nVou fazer algumas perguntas para entender melhor como você está hoje e ajustar suas recomendações.\n\nPrimeiro: como está sua disposição agora, de 1 a 10?`,
    };
    setMessages([{ id: Date.now(), sender: 'ia', text: modeMessages[newMode] }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Monta histórico para a API
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      history.push({ role: 'user', content: text });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 500,
          system: SYSTEM_PROMPTS[mode],
          messages: history,
        }),
      });

      const data = await response.json();
      const iaText = data.content?.[0]?.text || "Desculpe, não consegui processar sua mensagem. Tente novamente.";

      const iaMsg: Message = { id: Date.now() + 1, sender: 'ia', text: iaText };
      setMessages(prev => [...prev, iaMsg]);
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
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base">GLPY.IA</h1>
            <p className="text-text-muted text-xs">Online · Especialista GLP-1</p>
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
    </div>
  );
}
