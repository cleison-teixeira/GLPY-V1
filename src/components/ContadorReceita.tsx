import { motion } from "motion/react";
import { Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import BottomNav from "./BottomNav";

export default function ContadorReceita({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const issuedDate = new Date("2026-03-15");
  const totalDays = 90;
  const today = new Date();
  const diffTime = today.getTime() - issuedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - diffDays);
  const progress = Math.min(100, (diffDays / totalDays) * 100);

  const isUrgent = daysRemaining <= 14;

  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">Contador ANVISA</h1>

      {/* Ring Chart */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
           <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
             <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-border" strokeWidth="3" />
             <motion.circle 
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${progress} 100` }}
                transition={{ duration: 1 }}
                cx="18" cy="18" r="15.915" fill="none" className={`stroke-primary`} strokeWidth="3" strokeDasharray={`${progress} 100`} />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{daysRemaining}</span>
              <span className="text-text-muted">dias restantes</span>
           </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-6">
        <div className="flex items-center gap-3 mb-4">
           <Calendar className="text-primary" />
           <div>
             <p className="text-sm text-text-muted">Receita emitida em</p>
             <p className="font-bold">15 de Março, 2026</p>
           </div>
        </div>
        {isUrgent && (
           <div className="bg-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-900">
              <AlertTriangle className="w-6 h-6" />
              <p className="font-medium text-sm">Sua receita está perto de vencer. Renove com um médico.</p>
           </div>
        )}
      </div>

      {/* CTA */}
      <button className="w-full bg-primary text-white p-4 rounded-full font-bold text-center flex items-center justify-center gap-2 hover:bg-primary/90 transition">
        Renovar Receita (Telemedicina) <ArrowRight className="w-5 h-5" />
      </button>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
