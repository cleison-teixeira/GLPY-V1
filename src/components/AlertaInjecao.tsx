import { motion } from "motion/react";
import { Zap, CircleCheck, Info, ArrowRight, ChevronLeft } from "lucide-react";
import BottomNav from "./BottomNav";

export default function AlertaInjecao({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24 flex flex-col">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3">
        <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <h1 className="font-black text-xl text-[#0A1628]">Alerta de Injeção</h1>
      </div>
      <div className="flex-grow flex items-center justify-center p-6">
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
    </div>
  );
}
