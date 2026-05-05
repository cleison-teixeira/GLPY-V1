import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import BottomNav from "./BottomNav";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function PlanoSemanal({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3 mb-5">
        <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div>
          <h1 className="font-black text-xl text-[#0A1628]">Plano Semanal</h1>
          <p className="text-xs text-text-muted">Protocolo personalizado pela GLPY.IA</p>
        </div>
      </div>
      <div className="p-6">
      
      <div className="grid gap-4">
        {dias.map((dia, index) => (
          <motion.div 
            key={dia} 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-border flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-primary text-white' : 'bg-border/20'}`}>
              {dia[0]}
            </div>
            <div>
              <h3 className="font-bold text-sm">Foco do dia {dia}</h3>
              <p className="text-xs text-text-muted">Meta: +proteína, -carbs simples</p>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
