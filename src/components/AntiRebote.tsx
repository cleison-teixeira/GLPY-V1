import { motion } from "motion/react";
import { ShieldCheck, ArrowRight, RefreshCw, Lock } from "lucide-react";
import BottomNav from "./BottomNav";

export default function AntiRebote({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const fases = [
    { title: "Manutenção", icon: ShieldCheck, desc: "Estabilização do novo peso" },
    { title: "Transição", icon: RefreshCw, desc: "Ajuste metabólico pós-caneta" },
    { title: "Independência", icon: Lock, desc: "Consolidação dos hábitos" },
  ];

  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-2">Anti-Rebote</h1>
      <p className="text-text-muted mb-8">Protocole de segurança para evitar o retorno do peso.</p>

      <div className="grid gap-4">
        {fases.map((fase, i) => (
          <div key={i} className={`bg-white p-6 rounded-3xl shadow-sm border border-border flex items-center gap-4 ${i === 0 ? "" : "opacity-60"}`}>
            <div className={`p-4 rounded-2xl ${i === 0 ? "bg-primary text-white" : "bg-border/20 text-text-muted"}`}>
              <fase.icon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{fase.title}</h2>
              <p className="text-sm text-text-muted">{fase.desc}</p>
            </div>
            {i === 0 && <ArrowRight className="ml-auto text-primary" />}
          </div>
        ))}
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
