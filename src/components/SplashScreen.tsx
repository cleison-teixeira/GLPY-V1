import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";

export default function SplashScreen({ onNext, onDashboard }: { onNext: () => void, onDashboard: () => void }) {
  useEffect(() => {
    if (localStorage.getItem("onboardingConcluido") === "true") {
      onDashboard();
    }
  }, [onDashboard]);
  
  return (
    <div id="splash-screen" className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: "#00C27A" }}>
            <svg width="24" height="21" viewBox="0 0 32 28" fill="none">
              <path d="M6 22 C6 13 12 6 22 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M22 9 C28 10 30 16 24 21 C18 26 8 25 6 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M17 5 L22 1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="22" cy="9" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <span className="text-5xl font-black tracking-tighter text-[#0A1628]">GLPY</span>
        </div>
        <p className="text-xl text-text-muted mb-12 max-w-xs">
          Sua jornada metabólica inteligente.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-pill text-lg shadow-lg hover:bg-opacity-90 transition-all"
        onClick={onNext}
      >
        Começar Agora
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
