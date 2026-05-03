import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Minus, Plus } from "lucide-react";

// Verifica se onboarding já foi feito
export function isOnboardingDone(): boolean {
  return localStorage.getItem("glpy_onboarding") !== null;
}

// Recupera dados do onboarding
export function getOnboardingData() {
  const data = localStorage.getItem("glpy_onboarding");
  return data ? JSON.parse(data) : null;
}

type Step = {
  id: string;
  title: string;
  subtitle?: string;
  type: "options" | "number";
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
};

const STEPS: Step[] = [
  {
    id: "medicamento",
    title: "Qual o seu medicamento?",
    subtitle: "Vamos personalizar seu protocolo",
    type: "options",
    options: ["Ozempic", "Mounjaro", "Saxenda", "Wegovy", "Outro", "Parei recentemente"],
  },
  {
    id: "dose",
    title: "Qual a sua dose atual?",
    subtitle: "Usamos isso para ajustar suas recomendações",
    type: "options",
    options: ["0.25mg", "0.5mg", "1.0mg", "2.5mg", "5mg", "Outra"],
  },
  {
    id: "tempo",
    title: "Há quanto tempo usa?",
    type: "options",
    options: ["Menos de 1 mês", "1 a 3 meses", "3 a 6 meses", "Mais de 6 meses", "Ainda não comecei"],
  },
  {
    id: "objetivo",
    title: "Qual o seu objetivo?",
    subtitle: "Isso define seu protocolo principal",
    type: "options",
    options: ["Emagrecimento", "Manutenção do peso", "Saúde metabólica", "Controle do diabetes"],
  },
  {
    id: "altura",
    title: "Qual a sua altura?",
    subtitle: "Para calcular seu IMC e metas",
    type: "number",
    unit: "cm",
    min: 140,
    max: 220,
    step: 1,
    default: 165,
  },
  {
    id: "peso_atual",
    title: "Qual o seu peso atual?",
    subtitle: "Ponto de partida para acompanhar seu progresso",
    type: "number",
    unit: "kg",
    min: 40,
    max: 250,
    step: 0.5,
    default: 85,
  },
  {
    id: "peso_sonho",
    title: "Qual o seu peso dos sonhos?",
    subtitle: "Vamos projetar sua jornada até lá",
    type: "number",
    unit: "kg",
    min: 40,
    max: 200,
    step: 0.5,
    default: 70,
  },
  {
    id: "modo",
    title: "Como prefere acompanhar?",
    subtitle: "Você pode mudar isso depois",
    type: "options",
    options: ["🧘 Equilibrado — no meu ritmo", "🔥 Intensivo — quero acelerar", "💚 Gentil — passo a passo"],
  },
];

export default function Onboarding({ onNext }: { onNext: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [numberValue, setNumberValue] = useState<number>(
    STEPS[0].default ?? 165
  );

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Calcula projeção de perda (semanas)
  const getProjection = () => {
    const pesoAtual = Number(formData.peso_atual ?? 85);
    const pesoSonho = Number(formData.peso_sonho ?? 70);
    const diff = pesoAtual - pesoSonho;
    if (diff <= 0) return null;
    const semanas = Math.round(diff / 0.5); // ~0.5kg/semana com GLP-1
    return { diff: diff.toFixed(1), semanas };
  };

  const handleOption = (value: string) => {
    const newData = { ...formData, [step.id]: value };
    setFormData(newData);
    advance(newData);
  };

  const handleNumber = () => {
    const newData = { ...formData, [step.id]: numberValue };
    setFormData(newData);
    // Atualiza default da próxima etapa numérica
    const nextStep = STEPS[currentStep + 1];
    if (nextStep?.type === "number" && nextStep.default) {
      setNumberValue(nextStep.default);
    }
    advance(newData);
  };

  const advance = (data: Record<string, string | number>) => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = STEPS[currentStep + 1];
      if (nextStep.type === "number") {
        setNumberValue(nextStep.default ?? 165);
      }
      setCurrentStep(currentStep + 1);
    } else {
      // Salva tudo no localStorage — não vai rodar de novo
      localStorage.setItem("glpy_onboarding", JSON.stringify(data));
      localStorage.setItem("glpy_peso_atual", String(data.peso_atual));
      localStorage.setItem("glpy_peso_sonho", String(data.peso_sonho));
      localStorage.setItem("glpy_altura", String(data.altura));
      localStorage.setItem("glpy_medicamento", String(data.medicamento));
      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevStep = STEPS[currentStep - 1];
      if (prevStep.type === "number") {
        setNumberValue(Number(formData[prevStep.id] ?? prevStep.default));
      }
    }
  };

  const projection = step.id === "peso_sonho" && formData.peso_atual
    ? getProjection()
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Barra de progresso */}
      <div className="px-5 pt-12 pb-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-muted font-medium">
            {currentStep + 1} de {STEPS.length}
          </span>
          <span className="text-xs text-primary font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="bg-primary h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-grow px-5 pt-8 pb-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-grow flex flex-col"
          >
            {/* Título */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-text-main leading-tight mb-1">
                {step.title}
              </h2>
              {step.subtitle && (
                <p className="text-text-muted text-sm">{step.subtitle}</p>
              )}
            </div>

            {/* Opções */}
            {step.type === "options" && step.options && (
              <div className="space-y-3">
                {step.options.map((option) => (
                  <motion.button
                    key={option}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOption(option)}
                    className="w-full flex items-center justify-between p-4 bg-white border border-border rounded-2xl text-text-main font-medium hover:border-primary hover:bg-primary/2 transition-all shadow-sm"
                  >
                    <span>{option}</span>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input numérico */}
            {step.type === "number" && (
              <div className="flex flex-col items-center flex-grow justify-center">
                {/* Controle */}
                <div className="flex items-center gap-6 mb-6">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNumberValue(v => Math.max(step.min ?? 0, parseFloat((v - (step.step ?? 1)).toFixed(1))))}
                    className="w-14 h-14 bg-white border border-border rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Minus className="w-5 h-5 text-text-main" />
                  </motion.button>

                  <div className="text-center">
                    <motion.span
                      key={numberValue}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-6xl font-black text-text-main"
                    >
                      {numberValue % 1 === 0 ? numberValue : numberValue.toFixed(1)}
                    </motion.span>
                    <p className="text-text-muted text-lg mt-1">{step.unit}</p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setNumberValue(v => Math.min(step.max ?? 999, parseFloat((v + (step.step ?? 1)).toFixed(1))))}
                    className="w-14 h-14 bg-white border border-border rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Plus className="w-5 h-5 text-text-main" />
                  </motion.button>
                </div>

                {/* Projeção após peso dos sonhos */}
                {step.id === "peso_sonho" && formData.peso_atual && (
                  (() => {
                    const diff = Number(formData.peso_atual) - numberValue;
                    if (diff > 0) {
                      const semanas = Math.round(diff / 0.5);
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center mb-4 w-full"
                        >
                          <p className="text-xs text-text-muted mb-1">Sua projeção GLPY</p>
                          <p className="font-bold text-primary text-sm">
                            -{diff.toFixed(1)}kg em aprox. {semanas} semanas
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            com suporte GLP-1 + protocolos
                          </p>
                        </motion.div>
                      );
                    }
                    return null;
                  })()
                )}

                {/* IMC preview */}
                {step.id === "peso_atual" && formData.altura && (
                  (() => {
                    const altura = Number(formData.altura) / 100;
                    const imc = (numberValue / (altura * altura)).toFixed(1);
                    return (
                      <div className="bg-[#F4F6F8] border border-border rounded-2xl p-3 text-center w-full mb-4">
                        <p className="text-xs text-text-muted">Seu IMC atual</p>
                        <p className="font-bold text-text-main text-lg">{imc}</p>
                      </div>
                    );
                  })()
                )}

                {/* Botão confirmar */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNumber}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base mt-4"
                >
                  Confirmar {numberValue % 1 === 0 ? numberValue : numberValue.toFixed(1)}{step.unit} →
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botão voltar */}
      {currentStep > 0 && (
        <div className="px-5 pb-8">
          <button
            onClick={handleBack}
            className="w-full flex items-center justify-center gap-2 text-text-muted text-sm font-medium py-3 hover:text-text-main transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}
