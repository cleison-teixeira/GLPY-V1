import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, Check, Flame, ChevronLeft } from "lucide-react";
import confetti from "canvas-confetti";
import BottomNav from "./BottomNav";
import { saveCheckin, saveGamification } from "../services/firestore";

const SYMPTOM_OPTIONS = [
  { label: "Náusea", emoji: "🤢" },
  { label: "Cansaço", emoji: "😴" },
  { label: "Enjôo", emoji: "😵" },
  { label: "Bem-estar", emoji: "😊" },
  { label: "Energia", emoji: "⚡" },
  { label: "Foco", emoji: "🎯" },
];

const MOOD_OPTIONS = ["😞", "😕", "😐", "🙂", "😄"];

// Gera resposta da GLPY.IA baseada nos dados do check-in
const getIAResponse = (hunger: number, mood: number | null, symptoms: string[]): string => {
  const hasNausea = symptoms.includes("Náusea") || symptoms.includes("Enjôo");
  const hasEnergy = symptoms.includes("Energia");
  const hasTiredness = symptoms.includes("Cansaço");

  if (hasNausea) {
    return "Náusea detectada 🤢 — Amanhã priorize refeições líquidas e menores. Shake proteico + fruta é ideal. Evite frituras e alimentos muito temperados nas próximas 24h.";
  }
  if (hunger >= 8) {
    return `Fome em ${hunger}/10 é sinal de alerta ⚠️ — Seu corpo pode estar com déficit proteico. Adicione mais 20g de proteína no jantar hoje. Amanhã ajusto seu plano alimentar.`;
  }
  if (hunger <= 2) {
    return "Fome muito baixa 👀 — Lembre-se: mesmo sem fome você precisa comer. O Mounjaro suprime o apetite, mas seus músculos precisam de proteína. Coma mesmo que pouco.";
  }
  if (hasTiredness && !hasEnergy) {
    return "Cansaço registrado 😴 — Pode ser sinal de baixa ingestão calórica ou má qualidade de sono. Verifique se está comendo pelo menos 3 refeições hoje e tente dormir 8h.";
  }
  if (mood !== null && mood <= 1) {
    return "Percebi que o humor está baixo hoje 💙 — Isso é mais comum do que parece com o GLP-1. O remédio pode afetar o humor nas primeiras semanas. Se persistir, me conta.";
  }
  if (hasEnergy && hunger >= 4 && hunger <= 7) {
    return "Dia equilibrado! ✅ Fome controlada + energia boa = protocolo funcionando. Continue assim amanhã. Você está no caminho certo!";
  }
  return "Check-in registrado! 💚 Seus dados foram salvos e vou usar para personalizar suas recomendações de amanhã. Mantenha o streak!";
};

export default function CheckIn({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const onboarding = JSON.parse(localStorage.getItem("glpy_onboarding") || "{}");
  const pesoInicial = parseFloat((onboarding.peso_atual as string) || "83.0");

  const [weight, setWeight] = useState(pesoInicial || 83.0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [hunger, setHunger] = useState(5);
  const [satiety, setSatiety] = useState(5);
  const [mood, setMood] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [iaResponse, setIaResponse] = useState<string | null>(null);

  const streakAtual = parseInt(localStorage.getItem("glpy_streak") || "0", 10);

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]);
  };

  const handleSave = () => {
    if (saved) return;
    setSaved(true);
    setShowXP(true);
    setIaResponse(getIAResponse(hunger, mood, symptoms));
    setTimeout(() => setShowXP(false), 2000);

    const today = new Date().toLocaleDateString('pt-BR');
    const checkinData = {
      data: today,
      peso: weight.toFixed(1),
      fome: hunger,
      saciedade: satiety,
      humor: mood,
      sintomas: symptoms,
    };
    localStorage.setItem("glpy_checkin_hoje", JSON.stringify(checkinData));

    const historico: unknown[] = JSON.parse(localStorage.getItem("glpy_checkin_historico") || "[]");
    historico.unshift(checkinData);
    localStorage.setItem("glpy_checkin_historico", JSON.stringify(historico.slice(0, 30)));

    // streak
    const ultimoCheckin = localStorage.getItem("glpy_checkin_data");
    const novoStreak = ultimoCheckin === today ? streakAtual : streakAtual + 1;
    localStorage.setItem("glpy_streak", String(novoStreak));
    localStorage.setItem("glpy_checkin_data", today);

    // XP +10
    const xpAtual = parseInt(localStorage.getItem("glpy_xp") || "0", 10);
    const novoXP = xpAtual + 10;
    localStorage.setItem("glpy_xp", String(novoXP));

    // Sincroniza no Firestore
    const nivelCalc = novoXP < 100 ? 1 : novoXP < 300 ? 2 : novoXP < 600 ? 3 : novoXP < 1000 ? 4 : 5;
    saveCheckin(checkinData).catch(() => {});
    saveGamification({ xp: novoXP, streak: novoStreak, nivel: nivelCalc }).catch(() => {});

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#00C27A', '#ffffff'],
    });
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div className="min-h-screen bg-background text-text-main pb-24">

      {/* XP flutuante */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 bg-primary text-white font-black text-2xl px-6 py-3 rounded-2xl shadow-xl pointer-events-none"
          >
            +10 XP ⚡
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
              <ChevronLeft className="w-4 h-4 text-text-muted" />
            </button>
            <h1 className="text-xl font-bold">Check-in de Hoje ✅</h1>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-text-muted text-sm capitalize">{today}</span>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4" fill="currentColor" />
              <span className="font-bold text-sm">{streakAtual}</span>
            </div>
          </div>
        </header>

        {/* Peso */}
        <section className="mb-6">
          <h2 className="font-bold text-sm text-text-muted uppercase tracking-wide mb-3">Peso atual</h2>
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm">
            <button
              onClick={() => setWeight(w => Math.max(30, parseFloat((w - 0.1).toFixed(1))))}
              className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-4xl font-black text-text-main">{weight.toFixed(1)}</span>
              <span className="text-lg text-text-muted ml-1">kg</span>
            </div>
            <button
              onClick={() => setWeight(w => parseFloat((w + 0.1).toFixed(1)))}
              className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Sintomas */}
        <section className="mb-6">
          <h2 className="font-bold text-sm text-text-muted uppercase tracking-wide mb-3">Como você está?</h2>
          <div className="grid grid-cols-3 gap-2">
            {SYMPTOM_OPTIONS.map(s => {
              const active = symptoms.includes(s.label);
              return (
                <motion.button
                  key={s.label}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleSymptom(s.label)}
                  className={`p-3 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1 transition-all ${
                    active ? 'bg-primary text-white border-primary' : 'bg-white border-border'
                  }`}
                >
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-xs">{s.label}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Sliders */}
        <section className="mb-6 space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-bold text-sm">Nível de fome</label>
              <span className={`font-black text-sm ${hunger >= 8 ? 'text-red-500' : hunger <= 2 ? 'text-blue-500' : 'text-primary'}`}>
                {hunger}/10
              </span>
            </div>
            <input
              type="range" min="0" max="10" value={hunger}
              onChange={e => setHunger(parseInt(e.target.value))}
              className="w-full accent-primary h-2"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Sem fome</span>
              <span>Muita fome</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-bold text-sm">Nível de saciedade</label>
              <span className="font-black text-sm text-primary">{satiety}/10</span>
            </div>
            <input
              type="range" min="0" max="10" value={satiety}
              onChange={e => setSatiety(parseInt(e.target.value))}
              className="w-full accent-primary h-2"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>Vazio</span>
              <span>Cheio</span>
            </div>
          </div>
        </section>

        {/* Humor */}
        <section className="mb-6">
          <h2 className="font-bold text-sm text-text-muted uppercase tracking-wide mb-3">Humor hoje</h2>
          <div className="flex justify-between bg-white border border-border rounded-2xl p-3">
            {MOOD_OPTIONS.map((emoji, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMood(i)}
                className={`text-3xl p-2 rounded-xl transition-all ${mood === i ? 'bg-primary/15 scale-110' : ''}`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Resposta GLPY.IA */}
        <AnimatePresence>
          {iaResponse && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-white border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🤖</span>
                <span className="text-xs font-bold text-primary">GLPY.IA — baseado no seu check-in</span>
              </div>
              <p className="text-sm text-text-main leading-relaxed">{iaResponse}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão salvar */}
        <motion.button
          onClick={handleSave}
          disabled={saved}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 py-4 font-bold text-white rounded-2xl shadow-lg text-base transition-all ${
            saved ? 'bg-primary/50' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          <Check className="w-5 h-5" />
          {saved ? "Check-in Salvo! +10 XP" : "Salvar Check-in ✅"}
        </motion.button>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-xs text-text-muted">
              🔥 Streak mantido! Volte amanhã para não perder os <strong>{streakAtual + 1} dias</strong>.
            </p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-3 text-primary font-semibold text-sm underline"
            >
              Voltar ao início →
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
