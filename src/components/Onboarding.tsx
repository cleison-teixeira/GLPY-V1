import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Minus, Plus } from "lucide-react";
import { saveUserProfile } from "../services/firestore";

export function isOnboardingDone(): boolean {
  return localStorage.getItem("glpy_onboarding") !== null;
}

export function getOnboardingData() {
  const data = localStorage.getItem("glpy_onboarding");
  return data ? JSON.parse(data) : null;
}

type StepType = "options" | "number" | "text" | "phone" | "date";

type Step = {
  id: string;
  title: string;
  subtitle?: string;
  type: StepType;
  options?: string[];
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
};

const STEPS: Step[] = [
  {
    id: "nome",
    title: "Como você se chama?",
    subtitle: "Vamos personalizar tudo para você",
    type: "text",
    placeholder: "Seu nome completo",
  },
  {
    id: "whatsapp",
    title: "Qual seu WhatsApp?",
    subtitle: "Para te enviar lembretes importantes do tratamento",
    type: "phone",
    placeholder: "(11) 99999-9999",
  },
  {
    id: "data_nascimento",
    title: "Qual sua data de nascimento?",
    subtitle: "Usamos para personalizar seu protocolo por faixa etária",
    type: "date",
  },
  {
    id: "sexo",
    title: "Qual o seu sexo?",
    subtitle: "Ajuda a personalizar seu protocolo hormonal",
    type: "options",
    options: ["Feminino", "Masculino"],
  },
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

function calcularIdade(dataNasc: string): number {
  const nasc = new Date(dataNasc);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export default function Onboarding({ onNext }: { onNext: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [numberValue, setNumberValue] = useState<number>(STEPS[0].default ?? 165);
  const [textValue, setTextValue] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [textError, setTextError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleOption = (value: string) => {
    const newData = { ...formData, [step.id]: value };
    setFormData(newData);
    advance(newData);
  };

  const handleNumber = () => {
    const newData = { ...formData, [step.id]: numberValue };
    setFormData(newData);
    const nextStep = STEPS[currentStep + 1];
    if (nextStep?.type === "number" && nextStep.default) {
      setNumberValue(nextStep.default);
    }
    advance(newData);
  };

  const handleText = () => {
    const val = textValue.trim();
    if (!val) { setTextError("Por favor, preencha este campo."); return; }
    setTextError("");
    const newData = { ...formData, [step.id]: val };
    setFormData(newData);
    setTextValue("");
    advance(newData);
  };

  const handlePhone = () => {
    const digits = textValue.replace(/\D/g, "");
    if (digits.length < 10) { setTextError("Digite um número válido com DDD."); return; }
    setTextError("");
    const newData = { ...formData, [step.id]: textValue };
    setFormData(newData);
    setTextValue("");
    advance(newData);
  };

  const handleDate = () => {
    if (!dateValue) { setTextError("Selecione uma data."); return; }
    const idade = calcularIdade(dateValue);
    if (idade < 16 || idade > 100) { setTextError("Data inválida."); return; }
    setTextError("");
    const newData = { ...formData, data_nascimento: dateValue, idade };
    setFormData(newData);
    setDateValue("");
    advance(newData);
  };

  const advance = (data: Record<string, string | number>) => {
    if (currentStep < STEPS.length - 1) {
      const next = STEPS[currentStep + 1];
      if (next.type === "number") setNumberValue(next.default ?? 165);
      if (next.type === "text" || next.type === "phone") setTextValue("");
      if (next.type === "date") setDateValue("");
      setCurrentStep(currentStep + 1);
    } else {
      // Finaliza onboarding
      localStorage.setItem("glpy_onboarding", JSON.stringify(data));
      if (data.nome)   localStorage.setItem("glpy_nome", String(data.nome));
      if (data.sexo)   localStorage.setItem("glpy_sexo", String(data.sexo));
      if (data.peso_atual) localStorage.setItem("glpy_peso_atual", String(data.peso_atual));
      if (data.peso_sonho) localStorage.setItem("glpy_peso_sonho", String(data.peso_sonho));
      if (data.altura) localStorage.setItem("glpy_altura", String(data.altura));
      if (data.medicamento) localStorage.setItem("glpy_medicamento", String(data.medicamento));

      // Sincroniza no Firestore em background (não bloqueia)
      const glpyUser = JSON.parse(localStorage.getItem("glpy_user") || "{}");
      saveUserProfile({
        onboarding: data,
        nome: data.nome,
        whatsapp: data.whatsapp,
        dataNascimento: data.data_nascimento,
        idade: data.idade,
        email: glpyUser.email ?? null,
        displayName: glpyUser.displayName ?? null,
        primeiroAcesso: false,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});

      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTextError("");
      const prev = STEPS[currentStep - 1];
      if (prev.type === "number") {
        setNumberValue(Number(formData[prev.id] ?? prev.default));
      }
      if (prev.type === "text" || prev.type === "phone") {
        setTextValue(String(formData[prev.id] ?? ""));
      }
      if (prev.type === "date") {
        setDateValue(String(formData["data_nascimento"] ?? ""));
      }
    }
  };

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
            {/* Logo no primeiro passo */}
            {currentStep === 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: "#00C27A" }}>
                  <svg width="18" height="16" viewBox="0 0 32 28" fill="none">
                    <path d="M6 22 C6 13 12 6 22 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M22 9 C28 10 30 16 24 21 C18 26 8 25 6 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M17 5 L22 1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="22" cy="9" r="2.5" fill="#fff"/>
                  </svg>
                </div>
                <span className="font-extrabold text-2xl text-[#0A1628]">GLPY</span>
              </div>
            )}

            {/* Título */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-text-main leading-tight mb-1">
                {step.title}
              </h2>
              {step.subtitle && (
                <p className="text-text-muted text-sm">{step.subtitle}</p>
              )}
            </div>

            {/* ── TEXT input ── */}
            {step.type === "text" && (
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={textValue}
                  onChange={e => { setTextValue(e.target.value); setTextError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleText()}
                  placeholder={step.placeholder}
                  autoFocus
                  className="w-full bg-white border-2 border-border rounded-2xl px-4 py-4 text-text-main text-base font-medium placeholder:text-text-muted focus:outline-none focus:border-primary transition"
                />
                {textError && <p className="text-red-500 text-xs px-1">{textError}</p>}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleText}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base"
                >
                  Continuar →
                </motion.button>
              </div>
            )}

            {/* ── PHONE input ── */}
            {step.type === "phone" && (
              <div className="space-y-4">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={textValue}
                  onChange={e => {
                    setTextValue(maskPhone(e.target.value));
                    setTextError("");
                  }}
                  onKeyDown={e => e.key === "Enter" && handlePhone()}
                  placeholder={step.placeholder}
                  autoFocus
                  className="w-full bg-white border-2 border-border rounded-2xl px-4 py-4 text-text-main text-base font-medium placeholder:text-text-muted focus:outline-none focus:border-primary transition tracking-wider"
                />
                {textError && <p className="text-red-500 text-xs px-1">{textError}</p>}
                <p className="text-xs text-text-muted px-1">
                  🔒 Seus dados são privados e usados apenas para suporte ao tratamento.
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePhone}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base"
                >
                  Continuar →
                </motion.button>
              </div>
            )}

            {/* ── DATE input ── */}
            {step.type === "date" && (
              <div className="space-y-4">
                <input
                  type="date"
                  value={dateValue}
                  onChange={e => { setDateValue(e.target.value); setTextError(""); }}
                  max={new Date().toISOString().split("T")[0]}
                  min="1920-01-01"
                  className="w-full bg-white border-2 border-border rounded-2xl px-4 py-4 text-text-main text-base font-medium focus:outline-none focus:border-primary transition"
                />
                {dateValue && (() => {
                  const idade = calcularIdade(dateValue);
                  if (idade >= 16 && idade <= 100) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/5 border border-primary/15 rounded-2xl p-3 text-center"
                      >
                        <p className="text-sm font-bold text-primary">{idade} anos</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Protocolo ajustado para sua faixa etária
                        </p>
                      </motion.div>
                    );
                  }
                  return null;
                })()}
                {textError && <p className="text-red-500 text-xs px-1">{textError}</p>}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDate}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base"
                >
                  Continuar →
                </motion.button>
              </div>
            )}

            {/* ── OPTIONS ── */}
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

            {/* ── NUMBER ── */}
            {step.type === "number" && (
              <div className="flex flex-col items-center flex-grow justify-center">
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


                {/* IMC preview */}
                {step.id === "peso_atual" && formData.altura && (() => {
                  const altura = Number(formData.altura) / 100;
                  const imc = (numberValue / (altura * altura)).toFixed(1);
                  return (
                    <div className="bg-[#F4F6F8] border border-border rounded-2xl p-3 text-center w-full mb-4">
                      <p className="text-xs text-text-muted">Seu IMC atual</p>
                      <p className="font-bold text-text-main text-lg">{imc}</p>
                    </div>
                  );
                })()}

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
