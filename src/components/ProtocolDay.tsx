import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Play, ShoppingBag, Award } from "lucide-react";
import confetti from "canvas-confetti";
import BottomNav from "./BottomNav";

export default function ProtocolDay({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [completed, setCompleted] = useState(false);
  const [hungriness, setHungriness] = useState<string | null>(null);

  const handleComplete = () => {
    setCompleted(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <ChevronLeft className="w-6 h-6 text-text-muted cursor-pointer" onClick={() => onNavigate('protocolHub')} />
        <div className="flex-grow">
          <h1 className="font-bold text-lg">Protocolo 1 · Dia 4 de 7</h1>
          <div className="flex gap-1 mt-1">
             {[1,2,3].map(i => <div key={i} className="w-3 h-3 bg-primary rounded-full" />)}
             <div className="w-3 h-3 bg-primary rounded-full"></div>
             {[5,6,7].map(i => <div key={i} className="w-3 h-3 bg-border rounded-full" />)}
          </div>
        </div>
      </header>

      {/* Video Placeholder */}
      <div className="relative aspect-video bg-text-main rounded-3xl overflow-hidden mb-6 flex items-center justify-center">
        <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          35 segundos
        </div>
        <button className="bg-primary/90 text-white p-4 rounded-full shadow-lg">
          <Play className="w-8 h-8 fill-white" />
        </button>
        <div className="absolute bottom-4 left-4 text-white font-bold">Controle da Fome Oculta</div>
      </div>

      {/* Missions */}
      <section className="mb-6">
        <h2 className="font-bold text-lg mb-4">Missões do dia</h2>
        <div className="space-y-4">
          {[
            { title: "Zero açúcar líquido", desc: "Suco, refri, isotônico — fora" },
            { title: "Proteína em todas", desc: "No mínimo 20g por refeição" },
            { title: "Caminhada leve", desc: "15 min após almoço" }
          ].map((m, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white border border-border rounded-2xl items-center">
              <input type="checkbox" className="w-6 h-6 rounded-md border-border text-primary focus:ring-primary" />
              <div>
                <p className="font-bold">{m.title}</p>
                <p className="text-sm text-text-muted">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recipe */}
      <section className="mb-6 bg-[#E6FBF3] p-6 rounded-3xl border border-primary/20">
        <h2 className="font-bold text-lg mb-1">Receita: Omelete Fit</h2>
        <p className="text-sm text-text-muted mb-4">Prato rico em fibras e saciedade.</p>
        <button className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-pill shadow-sm">
          <ShoppingBag className="w-4 h-4" /> Comprar ingredientes
        </button>
      </section>

      {/* Check-in */}
      <section className="mb-6">
        <h2 className="font-bold text-lg mb-4">Como está sua fome hoje?</h2>
        <div className="grid grid-cols-2 gap-2">
          {["Muito alta", "Alta", "Controlada", "Sem fome"].map(opt => (
            <button 
              key={opt}
              onClick={() => setHungriness(opt)}
              className={`p-3 rounded-2xl border ${hungriness === opt ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}
            >
              {opt}
            </button>
          ))}
        </div>
        {hungriness && (
          <div className="mt-4 p-4 bg-primary/10 rounded-2xl text-primary text-sm font-medium">
            GLPY.IA: Entendido! Mantendo o foco em proteínas para estabilizar essa saciedade.
          </div>
        )}
      </section>

      {/* Reward */}
      <section className="mb-8 p-6 bg-alert/10 border border-alert/20 rounded-3xl flex items-center gap-4">
        <div className="bg-alert text-white p-3 rounded-full"><Award className="w-6 h-6" /></div>
        <div>
          <p className="font-bold text-alert">Continue o ritmo!</p>
          <p className="text-xs text-text-muted">A consistência é chave para seu resultado.</p>
          <p className="font-bold text-primary mt-1 text-lg">+20 XP</p>
        </div>
      </section>

      {/* Conclusion Button */}
      <button 
        onClick={handleComplete}
        disabled={completed}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-pill font-bold text-white shadow-lg ${completed ? 'bg-text-muted' : 'bg-primary hover:bg-primary/90'}`}
      >
        {completed ? "Dia 4 Concluído" : "✅ Concluir Dia 4"}
      </button>

      <BottomNav active="protocolHub" onNavigate={onNavigate} />
    </div>
  );
}
