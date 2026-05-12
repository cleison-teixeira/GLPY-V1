import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Play, ShoppingBag, Award, CheckCircle2, Circle } from "lucide-react";
import confetti from "canvas-confetti";
import BottomNav from "./BottomNav";

const MISSIONS = [
  { id: 1, title: "Zero açúcar líquido", desc: "Suco, refri, isotônico — fora por hoje", icon: "🚫" },
  { id: 2, title: "Proteína em todas as refeições", desc: "No mínimo 20g por refeição", icon: "🥩" },
  { id: 3, title: "Caminhada leve", desc: "15 minutos após o almoço", icon: "🚶‍♀️" },
];

const HUNGER_RESPONSES: Record<string, string> = {
  "Muito alta": "Fome muito alta no Mounjaro pode indicar baixa ingestão de proteína. Priorize 30g+ na próxima refeição e beba 500ml de água agora. Isso reduz o sinal de fome em 20-30 minutos. 💧",
  "Alta": "Fome alta é normal nos primeiros dias. Seu corpo ainda está se adaptando. Faça um lanche proteico agora: iogurte grego + 1 fruta. Vai segurar até a próxima refeição. 🥣",
  "Controlada": "Perfeito! Fome controlada significa que o protocolo está funcionando. Mantenha o ritmo de refeições a cada 3-4h para não deixar subir. ✅",
  "Sem fome": "Sem fome é comum com o Mounjaro, mas cuidado: coma mesmo sem fome. Seu corpo precisa dos nutrientes. Uma refeição pequena a cada 3h é obrigatória. ⚠️",
};

type Progresso = { diaAtual: number; diasConcluidos: number[]; dataInicio: string };

export default function ProtocolDay({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const protocoloAtivo = (() => {
    try { return JSON.parse(localStorage.getItem("glpy_protocolo_ativo") || "{}"); } catch { return {}; }
  })();
  const protocoloId = protocoloAtivo.id || "default";
  const protocoloNome = protocoloAtivo.nome || "Protocolo";
  const totalDias: number = protocoloAtivo.totalDias || 7;
  const progressoKey = `glpy_protocolo_${protocoloId}_progresso`;

  const loadProgresso = (): Progresso => {
    try {
      const raw = localStorage.getItem(progressoKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { diaAtual: 1, diasConcluidos: [], dataInicio: new Date().toISOString().slice(0, 10) };
  };

  const [progresso, setProgresso] = useState<Progresso>(loadProgresso);
  const [checkedMissions, setCheckedMissions] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [protocoloConcluido, setProtocoloConcluido] = useState(false);
  const [hungriness, setHungriness] = useState<string | null>(null);
  const [showXP, setShowXP] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);

  const diaAtual = progresso.diaAtual;
  const diasConcluidos = progresso.diasConcluidos;

  const toggleMission = (id: number) => {
    if (completed) return;
    const isChecking = !checkedMissions.includes(id);
    setCheckedMissions(prev => isChecking ? [...prev, id] : prev.filter(m => m !== id));
    if (isChecking) {
      setXpTotal(prev => prev + 10);
      setShowXP(false);
      setTimeout(() => setShowXP(true), 50);
      setTimeout(() => setShowXP(false), 1500);
    }
  };

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    setXpTotal(prev => prev + 20);

    const novasConcluidas = [...diasConcluidos, diaAtual];
    const novoDia = diaAtual + 1;
    const novoProgresso: Progresso = {
      diaAtual: novoDia,
      diasConcluidos: novasConcluidas,
      dataInicio: progresso.dataInicio,
    };
    localStorage.setItem(progressoKey, JSON.stringify(novoProgresso));
    setProgresso(novoProgresso);

    if (diaAtual >= totalDias) {
      setProtocoloConcluido(true);
      confetti({ particleCount: 300, spread: 120, origin: { y: 0.6 }, colors: ['#00C27A', '#00E5A0', '#ffffff', '#FFD700'] });
      setTimeout(() => onNavigate('checkin'), 3500);
    } else {
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, colors: ['#00C27A', '#00E5A0', '#ffffff'] });
    }
  };

  const missoesPct = checkedMissions.length / MISSIONS.length;

  return (
    <div className="min-h-screen bg-background text-text-main pb-24">

      {/* XP flutuante */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -40 }}
            exit={{ opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 bg-primary text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg pointer-events-none"
          >
            +10 XP ⚡
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5 pb-6">
        {/* Header com progresso */}
        <header className="flex items-center gap-3 mb-5">
          <button onClick={() => onNavigate('protocolHub')} className="p-2 rounded-full bg-white border border-border">
            <ChevronLeft className="w-5 h-5 text-text-muted" />
          </button>
          <div className="flex-grow">
            <h1 className="font-bold text-base">{protocoloNome} · Dia {diaAtual} de {totalDias}</h1>
            <div className="flex gap-1.5 mt-1.5">
              {Array.from({ length: totalDias }, (_, i) => i + 1).map(dia => (
                <div
                  key={dia}
                  className={`h-2 flex-1 rounded-full transition-all flex items-center justify-center ${
                    diasConcluidos.includes(dia)
                      ? 'bg-primary'
                      : dia === diaAtual
                      ? 'bg-primary/40'
                      : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-1">{diasConcluidos.length}/{totalDias} dias concluídos</p>
          </div>
          {xpTotal > 0 && (
            <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
              +{xpTotal} XP
            </div>
          )}
        </header>

        {/* Dias concluídos */}
        {diasConcluidos.length > 0 && (
          <div className="mb-4 flex gap-1.5 flex-wrap">
            {Array.from({ length: totalDias }, (_, i) => i + 1).map(dia => (
              <span
                key={dia}
                className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                  diasConcluidos.includes(dia)
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : dia === diaAtual
                    ? 'bg-white text-text-main border-border font-black ring-2 ring-primary/30'
                    : 'bg-white text-text-muted border-border opacity-50'
                }`}
              >
                {diasConcluidos.includes(dia) ? `✅ ${dia}` : dia === diaAtual ? `▶ ${dia}` : dia}
              </span>
            ))}
          </div>
        )}

        {/* Progresso das missões */}
        {checkedMissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-primary/5 border border-primary/15 rounded-2xl p-3 flex items-center gap-3"
          >
            <div className="flex-grow bg-border h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full"
                animate={{ width: `${missoesPct * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="text-xs font-bold text-primary whitespace-nowrap">
              {checkedMissions.length}/{MISSIONS.length} missões
            </span>
          </motion.div>
        )}

        {/* Vídeo */}
        <div className="relative aspect-video bg-text-main rounded-2xl overflow-hidden mb-5 flex items-center justify-center">
          <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            35s
          </div>
          <motion.button whileTap={{ scale: 0.95 }} className="bg-primary/90 text-white p-4 rounded-full shadow-lg">
            <Play className="w-7 h-7 fill-white" />
          </motion.button>
          <div className="absolute bottom-3 left-3 text-white font-bold text-sm">
            Controle da Fome Oculta
          </div>
        </div>

        {/* Missões */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-3">Missões do dia</h2>
          <div className="space-y-2.5">
            {MISSIONS.map(m => {
              const checked = checkedMissions.includes(m.id);
              return (
                <motion.button
                  key={m.id}
                  onClick={() => toggleMission(m.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex gap-3 p-4 rounded-2xl border text-left transition-all ${
                    checked ? 'bg-primary/5 border-primary/25' : 'bg-white border-border'
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{m.icon}</span>
                  <div className="flex-grow">
                    <p className={`font-bold text-sm ${checked ? 'line-through text-text-muted' : ''}`}>{m.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{m.desc}</p>
                  </div>
                  {checked
                    ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    : <Circle className="w-5 h-5 text-border flex-shrink-0 mt-0.5" />
                  }
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Receita do dia */}
        <section className="mb-5 bg-[#E6FBF3] p-4 rounded-2xl border border-primary/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Receita do dia</p>
              <h3 className="font-bold text-base mb-1">🍳 Omelete Fit</h3>
              <p className="text-xs text-text-muted mb-3">Rico em proteína · 28g prot · 240 kcal</p>
              <button className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-full text-sm shadow-sm">
                <ShoppingBag className="w-4 h-4" /> Comprar ingredientes
              </button>
            </div>
            <span className="text-4xl">🥚</span>
          </div>
        </section>

        {/* Check-in de fome */}
        <section className="mb-5">
          <h2 className="font-bold text-base mb-3">Como está sua fome hoje?</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {["Muito alta", "Alta", "Controlada", "Sem fome"].map(opt => (
              <motion.button
                key={opt}
                whileTap={{ scale: 0.97 }}
                onClick={() => setHungriness(opt)}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                  hungriness === opt ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-main'
                }`}
              >
                {opt}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {hungriness && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 bg-white border border-border rounded-2xl shadow-sm"
              >
                <div className="flex gap-2 mb-2">
                  <span className="text-base">🤖</span>
                  <span className="text-xs font-bold text-primary">GLPY.IA</span>
                </div>
                <p className="text-sm text-text-main leading-relaxed">{HUNGER_RESPONSES[hungriness]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Recompensa */}
        <section className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
          <div className="bg-amber-400 text-white p-2.5 rounded-full flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <p className="font-bold text-amber-700 text-sm">Continue o ritmo!</p>
            <p className="text-xs text-amber-600 mt-0.5">Conclua o dia para ganhar a recompensa</p>
          </div>
          <div className="text-primary font-bold text-lg">+20 XP</div>
        </section>

        {/* Botão concluir */}
        <motion.button
          onClick={handleComplete}
          disabled={completed}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white shadow-lg text-base transition-all ${
            completed ? 'bg-primary/50' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {completed
            ? <><CheckCircle2 className="w-5 h-5" /> Dia {diaAtual - 1} Concluído! 🎉</>
            : `✅ Concluir Dia ${diaAtual}`
          }
        </motion.button>

        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center"
            >
              {protocoloConcluido ? (
                <>
                  <p className="font-bold text-primary text-lg">🏆 Protocolo concluído!</p>
                  <p className="text-xs text-text-muted mt-1">Parabéns! Redirecionando para o check-in final...</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-primary">🏆 +20 XP conquistados!</p>
                  <p className="text-xs text-text-muted mt-1">Dia {diaAtual} desbloqueado. Até amanhã!</p>
                  <button
                    onClick={() => onNavigate('protocolHub')}
                    className="mt-3 text-primary font-semibold text-sm underline"
                  >
                    Voltar aos protocolos →
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav active="protocolHub" onNavigate={onNavigate} />
    </div>
  );
}
