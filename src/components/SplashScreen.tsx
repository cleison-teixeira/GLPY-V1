import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import glpyLogoLight from '@/assets/logos/logo-light.png';

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
        <div className="flex items-center justify-center mb-4">
          <img src={glpyLogoLight} alt="GLPY" className="h-10 w-auto max-w-[180px] object-contain" />
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
