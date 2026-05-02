import { motion } from "motion/react";
import { Zap, CircleCheck, Info, ArrowRight } from "lucide-react";
import BottomNav from "./BottomNav";

export default function AlertaInjecao({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border-4 border-red-500 text-center"
      >
        <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-red-600">
          <Zap className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Dia da Aplicação!</h1>
        <p className="text-text-muted mb-8">Sua dose semanal está pronta. Não esqueça de seguir os cuidados recomendados.</p>

        <div className="bg-primary/10 p-4 rounded-2xl flex items-start gap-3 mb-8 text-left">
          <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm"><strong>Dica GLPY:</strong> Hidrate-se bem antes e depois da aplicação para reduzir possíveis náuseas.</p>
        </div>

        <button 
          onClick={() => { alert("Aplicação registrada!"); onNavigate('injecao'); }}
          className="w-full bg-primary text-white p-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-lg"
        >
          Confirmar Aplicação <CircleCheck className="w-5 h-5" />
        </button>
      </motion.div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
