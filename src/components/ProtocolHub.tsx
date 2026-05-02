import { motion } from "motion/react";
import { Lock, ChevronRight, Home, List, Utensils, User } from "lucide-react";
import BottomNav from "./BottomNav";

type Protocol = {
  id: number;
  title: string;
  emoji: string;
  hook: string;
  status: "active" | "available" | "locked";
  progress?: string;
  requiredPlan?: string;
};
const protocols: Protocol[] = [
  { id: 1, title: "Sobrevivendo às Canetas", emoji: "🔥", hook: "Pare de sofrer nos primeiros dias", status: "active", progress: "Dia 4/7" },
  { id: 2, title: "Controle de Efeitos Colaterais", emoji: "⚠️", hook: "Náusea, intestino, cansaço — resolvidos", status: "available" },
  { id: 3, title: "Anti-Queda de Cabelo", emoji: "💇", hook: "O efeito que mais assusta tem solução", status: "available" },
  { id: 4, title: "Anti-Rebote", emoji: "⚖️", hook: "Se parar, o peso volta. A não ser que...", status: "locked", requiredPlan: "Plus" },
  { id: 5, title: "Psicologia do Emagrecimento", emoji: "🧠", hook: "A fome emocional não é fraqueza", status: "locked", requiredPlan: "Plus" },
  { id: 6, title: "Alimentação Baixo Apetite", emoji: "🍽️", hook: "Alta nutrição com pouca fome", status: "locked", requiredPlan: "Plus" },
  { id: 7, title: "Não Perca Músculo", emoji: "💪", hook: "Emagreça sem perder o que importa", status: "locked", requiredPlan: "Pro" },
  { id: 8, title: "Energia Baixa", emoji: "⚡", hook: "Combate a fadiga que ninguém fala", status: "locked", requiredPlan: "Pro" },
  { id: 9, title: "Ajuste Metabólico", emoji: "🧬", hook: "Evite a desaceleração que sabota tudo", status: "locked", requiredPlan: "Pro" },
  { id: 10, title: "Transição — Parar a Caneta", emoji: "🔁", hook: "O guia definitivo para sair sem engordar", status: "locked", requiredPlan: "Top" },
];

export default function ProtocolHub({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div id="protocol-hub" className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-8">Protocolos</h1>

      <div className="space-y-4">
        {protocols.map((protocol) => (
          <motion.div
            key={protocol.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative p-5 rounded-3xl border ${
              protocol.status === "active"
                ? "border-primary bg-white shadow-lg shadow-primary/10"
                : protocol.status === "available"
                ? "border-primary/20 bg-[#E6FBF3]"
                : "border-border bg-white shadow-sm"
            } ${protocol.status === "locked" ? "opacity-70" : ""}`}
            onClick={() => protocol.status !== "locked" && onNavigate('protocolDay')}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">{protocol.emoji}</div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{protocol.title}</h3>
                    {protocol.status === "locked" && <Lock className="w-5 h-5 text-text-main" />}
                    {protocol.status === "available" && (
                        <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">Disponível</span>
                    )}
                </div>
                <p className="text-text-muted text-sm my-0.5">{protocol.hook}</p>
                {protocol.progress && <p className="text-primary text-sm font-semibold">{protocol.progress}</p>}
                {protocol.requiredPlan && (
                  <div className="flex items-center gap-1 text-alert text-xs font-bold mt-1">
                    <Lock className="w-3 h-3" /> Requer plano {protocol.requiredPlan}
                  </div>
                )}
              </div>
              {protocol.status !== "locked" && <ChevronRight className="text-text-muted" />}
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav active="protocolHub" onNavigate={onNavigate} />
    </div>
  );
}
