import { useState } from "react";
import { motion } from "motion/react";
import { Send, Bot } from "lucide-react";
import BottomNav from "./BottomNav";

type Message = { id: number; sender: 'ia' | 'user'; text: string; };

const initialMessages: Message[] = [
  { id: 1, sender: 'ia', text: "Oi Cleison! Vi que você marcou fome alta hoje.\nVamos ajustar seu jantar — quanto tempo tem para comer?" },
  { id: 2, sender: 'user', text: "Uns 20 minutos" },
  { id: 3, sender: 'ia', text: "Perfeito. Omelete com 3 ovos + salada folha.\nRápido, 28g proteína, zero açúcar. Quer a receita?" }
];

export default function ChatIA({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [mode, setMode] = useState<"Nutri" | "Coach" | "Diagnóstico">("Nutri");

  return (
    <div id="chat-ia" className="min-h-screen bg-background text-text-main flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/90 backdrop-blur-sm p-6 border-b border-border z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg">GLPY.IA</h1>
            <p className="text-text-muted text-xs">Online · Especialista GLP-1</p>
          </div>
        </div>
        
        {/* Modes */}
        <div className="flex gap-2">
          {(["Nutri", "Coach", "Diagnóstico"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-pill text-xs font-bold transition-all ${
                mode === m ? "bg-primary text-white" : "bg-white border border-border"
              }`}
            >
              {m === "Nutri" ? "🟡 Nutri" : m === "Coach" ? "🔵 Coach" : "🔴 Diagnóstico"}
            </button>
          ))}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-grow p-6 space-y-6">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`p-4 rounded-2xl max-w-[80%] ${
              msg.sender === 'user' 
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-primary/10 text-text-main rounded-tl-none'
            }`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Replies */}
      <div className="px-6 pb-4 flex gap-2 overflow-x-auto whitespace-nowrap">
        {["Sim, quero", "Tenho náusea", "E amanhã?", "Ver receita"].map(reply => (
          <button key={reply} className="px-4 py-2 bg-white border border-border rounded-pill text-xs font-medium hover:border-primary transition">
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-20 px-6 py-4 bg-background/90 backdrop-blur-sm border-t border-border">
        <div className="flex gap-2">
          <input type="text" placeholder="Pergunte qualquer coisa..." className="flex-grow p-4 bg-white border border-border rounded-pill" />
          <button className="bg-primary text-white p-4 rounded-full shadow-lg">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
