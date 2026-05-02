import { motion } from "motion/react";
import BottomNav from "./BottomNav";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function PlanoSemanal({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">Plano Semanal</h1>
      <p className="text-text-muted mb-8 text-sm">Seu protocolo personalizado gerado pela GLPY.IA para esta semana.</p>
      
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
  );
}
