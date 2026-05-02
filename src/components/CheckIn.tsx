import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, Check } from "lucide-react";
import BottomNav from "./BottomNav";

export default function CheckIn({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [weight, setWeight] = useState(80.5);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [hunger, setHunger] = useState(5);
  const [satiety, setSatiety] = useState(5);
  const [mood, setMood] = useState<number | null>(null);
  const [showXp, setShowXp] = useState(false);

  const symptomOptions = ["Náusea", "Cansaço", "Enjôo", "Bem-estar", "Energia", "Foco"];

  const handleSave = () => {
    setShowXp(true);
    setTimeout(() => setShowXp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Check-in de Hoje ✅</h1>
        <p className="text-text-muted">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      {/* Peso */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">Peso atual (kg)</h2>
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-border">
          <button onClick={() => setWeight(Math.max(0, weight - 0.1))} className="p-3 bg-background rounded-full"><Minus /></button>
          <span className="text-4xl font-bold">{weight.toFixed(1)}</span>
          <button onClick={() => setWeight(weight + 0.1)} className="p-3 bg-background rounded-full"><Plus /></button>
        </div>
      </section>

      {/* Sintomas */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">Como você está?</h2>
        <div className="grid grid-cols-2 gap-2">
            {symptomOptions.map(s => (
                <button key={s} onClick={() => setSymptoms(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s])} 
                    className={`p-3 rounded-2xl border ${symptoms.includes(s) ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}>
                    {s}
                </button>
            ))}
        </div>
      </section>

      {/* Sliders */}
      <section className="mb-8 space-y-6">
        <div>
            <label className="font-bold text-sm">Nível de fome: {hunger}</label>
            <input type="range" min="0" max="10" value={hunger} onChange={(e) => setHunger(parseInt(e.target.value))} className="w-full accent-primary" />
        </div>
        <div>
            <label className="font-bold text-sm">Nível de saciedade: {satiety}</label>
            <input type="range" min="0" max="10" value={satiety} onChange={(e) => setSatiety(parseInt(e.target.value))} className="w-full accent-primary" />
        </div>
      </section>

      {/* Humor */}
      <section className="mb-8">
        <h2 className="font-bold text-lg mb-4">Humor hoje</h2>
        <div className="flex justify-between text-4xl">
            {["😞", "😕", "😐", "🙂", "😄"].map((e, i) => (
                <button key={i} onClick={() => setMood(i)} className={`p-2 rounded-2xl ${mood === i ? 'bg-primary/20' : ''}`}>{e}</button>
            ))}
        </div>
      </section>

      {/* Salvar */}
      <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-bold rounded-pill shadow-lg mb-6">
        <Check className="w-5 h-5" /> Salvar Check-in ✅
      </button>

      {/* XP Animation */}
      <AnimatePresence>
        {showXp && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: -50 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-primary bg-white p-6 rounded-3xl shadow-xl">+10 XP</span>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}