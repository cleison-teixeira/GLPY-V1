import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
  { id: "medicamento", title: "Qual o seu medicamento?", options: ["Ozempic", "Mounjaro", "Saxenda", "Wegovy", "Outro", "Parei recentemente"] },
  { id: "dose", title: "Qual a sua dose atual?", options: ["0.25mg", "0.5mg", "1.0mg", "Outra"] },
  { id: "tempo", title: "Há quanto tempo usa?", options: ["Menos de 1 mês", "1 a 3 meses", "3 a 6 meses", "Mais de 6 meses"] },
  { id: "objetivo", title: "Qual o seu objetivo?", options: ["Emagrecimento", "Manutenção", "Saúde Metabólica"] },
  { id: "modo", title: "Qual o seu modo?", options: ["Focado", "Intensivo", "Equilibrado"] },
];

export default function Onboarding({ onNext }: { onNext: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleNext = (value: string) => {
    setFormData({ ...formData, [steps[currentStep].id]: value });
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("onboardingConcluido", "true");
      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div id="onboarding" className="flex flex-col min-h-screen p-6 bg-background">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index <= currentStep ? "bg-primary flex-grow" : "bg-border w-8"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-grow"
        >
          <h2 className="text-3xl font-bold text-text-main mb-8 leading-tight">
            {steps[currentStep].title}
          </h2>

          <div className="space-y-4">
            {steps[currentStep].options.map((option) => (
              <button
                key={option}
                onClick={() => handleNext(option)}
                className="w-full flex items-center justify-between p-6 bg-white border border-border rounded-pill text-text-main font-medium hover:border-primary transition-all shadow-sm"
              >
                {option}
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Back Button */}
      {currentStep > 0 && (
        <button
          onClick={handleBack}
          className="mt-8 flex items-center justify-center gap-2 text-text-muted font-medium hover:text-text-main"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>
      )}
    </div>
  );
}
