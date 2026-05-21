import { useState, useRef } from "react";
import { GLPY_MEDICATION_OPTIONS } from "../data/glpyMedicationOptions";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { saveUserProfile } from "../services/firestore";
import { saveWeightEntry } from "../core/glpyLocalIntelligence";

export function isOnboardingDone(): boolean {
  return localStorage.getItem("glpy_onboarding") !== null;
}

export function getOnboardingData() {
  const data = localStorage.getItem("glpy_onboarding");
  return data ? JSON.parse(data) : null;
}

type StepType = "options" | "number" | "text" | "phone" | "date" | "dose";

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
    options: [...GLPY_MEDICATION_OPTIONS],
  },
  {
    id: "dose",
    title: "Qual a sua dose atual?",
    subtitle: "Usamos isso para ajustar suas recomendações",
    type: "dose",
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

export function normalizeDose(raw: string): string | null {
  const cleaned = raw.trim().replace(/mg$/i, '').replace(',', '.').trim();
  const val = parseFloat(cleaned);
  if (isNaN(val) || val <= 0) return null;
  return `${val} mg`;
}

function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function dateDisplayToISO(display: string): string | null {
  const digits = display.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function isoToDateDisplay(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
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
  const [numberText, setNumberText] = useState<string>("");
  const [textValue, setTextValue] = useState("");
  const [dateText, setDateText] = useState("");
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
    const val = parseFloat(numberText.replace(',', '.'));
    if (isNaN(val)) { setTextError("Digite um valor válido."); return; }
    if (step.min !== undefined && val < step.min) {
      setTextError(`Mínimo: ${step.min} ${step.unit}`);
      return;
    }
    if (step.max !== undefined && val > step.max) {
      setTextError(`Máximo: ${step.max} ${step.unit}`);
      return;
    }
    setTextError("");
    const newData = { ...formData, [step.id]: val };
    setFormData(newData);
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
    const isoDate = dateDisplayToISO(dateText);
    if (!isoDate) { setTextError("Digite a data completa no formato dd/mm/aaaa."); return; }
    const idade = calcularIdade(isoDate);
    if (idade < 16 || idade > 100) { setTextError("Data inválida ou fora do intervalo permitido."); return; }
    setTextError("");
    const newData = { ...formData, data_nascimento: isoDate, idade };
    setFormData(newData);
    setDateText("");
    advance(newData);
  };

  const handleDose = () => {
    const normalized = normalizeDose(numberText);
    if (!normalized) { setTextError("Digite sua dose atual para continuar."); return; }
    setTextError("");
    const newData = { ...formData, dose: normalized };
    setFormData(newData);
    advance(newData);
  };

  const advance = (data: Record<string, string | number>) => {
    if (currentStep < STEPS.length - 1) {
      const next = STEPS[currentStep + 1];
      if (next.type === "number" || next.type === "dose") setNumberText("");
      if (next.type === "text" || next.type === "phone") setTextValue("");
      if (next.type === "date") setDateText("");
      setTextError("");
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
      if (data.dose)        localStorage.setItem("glpy_dose",        String(data.dose));

      // Popula glpy_latest_weight e histórico com o peso inicial do onboarding
      const pesoInicial = typeof data.peso_atual === 'number' ? data.peso_atual : parseFloat(String(data.peso_atual));
      if (!isNaN(pesoInicial) && pesoInicial > 0) {
        saveWeightEntry({ weight: pesoInicial });
      }

      // Sincroniza no Firestore (merge — não sobrescreve plano ou outros campos)
      const glpyUser = JSON.parse(localStorage.getItem("glpy_user") || "{}");
      const uid = glpyUser.uid ?? null;
      console.log('Perfil salvo:', { nome: data.nome, uid });
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
      }).catch(console.error);

      onNext();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTextError("");
      const prev = STEPS[currentStep - 1];
      if (prev.type === "number") {
        const stored = formData[prev.id];
        setNumberText(stored !== undefined ? String(stored) : "");
      }
      if (prev.type === "dose") {
        const stored = String(formData["dose"] ?? "");
        setNumberText(stored.replace(/\s*mg$/i, '').trim());
      }
      if (prev.type === "text" || prev.type === "phone") {
        setTextValue(String(formData[prev.id] ?? ""));
      }
      if (prev.type === "date") {
        setDateText(isoToDateDisplay(String(formData["data_nascimento"] ?? "")));
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

            {/* ── DATE input (dd/mm/aaaa digitável) ── */}
            {step.type === "date" && (
              <div className="space-y-4">
                <div className="bg-white border-2 border-border focus-within:border-primary rounded-2xl px-4 pt-3 pb-4 shadow-sm transition">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                    dd / mm / aaaa
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={dateText}
                    onChange={e => { setDateText(maskDate(e.target.value)); setTextError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleDate()}
                    placeholder="00/00/0000"
                    maxLength={10}
                    autoFocus
                    className="w-full text-text-main text-3xl font-black tracking-widest bg-transparent outline-none placeholder:text-text-muted/30 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                  />
                </div>

                {dateText.length === 10 && (() => {
                  const isoDate = dateDisplayToISO(dateText);
                  if (!isoDate) return null;
                  const idade = calcularIdade(isoDate);
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

            {/* ── NUMBER (input digitável com teclado numérico) ── */}
            {step.type === "number" && (
              <div className="flex flex-col flex-grow justify-center gap-5">

                {/* Input card */}
                <div className="bg-white border-2 border-border focus-within:border-primary rounded-3xl px-6 py-8 flex flex-col items-center gap-1 shadow-sm transition">
                  <div className="flex items-baseline gap-3">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={numberText}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9.,]/g, '');
                        setNumberText(raw);
                        setTextError("");
                      }}
                      onKeyDown={e => e.key === "Enter" && handleNumber()}
                      placeholder={String(step.default ?? '')}
                      autoFocus
                      className="text-6xl font-black text-text-main w-36 text-right bg-transparent outline-none placeholder:text-text-muted/25 leading-none"
                    />
                    <span className="text-3xl font-bold text-text-muted/50 shrink-0 pb-1">
                      {step.unit}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted/50 mt-2">
                    Digite entre {step.min} e {step.max} {step.unit}
                  </p>
                </div>

                {/* IMC preview — aparece quando peso_atual tem valor válido */}
                {step.id === "peso_atual" && formData.altura && (() => {
                  const h = Number(formData.altura) / 100;
                  const w = parseFloat(numberText.replace(',', '.'));
                  if (isNaN(w) || w <= 0 || h <= 0) return null;
                  const imc = (w / (h * h)).toFixed(1);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/5 border border-primary/15 rounded-2xl p-3 text-center"
                    >
                      <p className="text-xs text-text-muted">Seu IMC estimado</p>
                      <p className="font-bold text-text-main text-lg">{imc}</p>
                    </motion.div>
                  );
                })()}

                {textError && <p className="text-red-500 text-sm px-1">{textError}</p>}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNumber}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base"
                >
                  Confirmar →
                </motion.button>
              </div>
            )}

            {/* ── DOSE input (digitável, canônico) ── */}
            {step.type === "dose" && (
              <div className="flex flex-col flex-grow justify-center gap-5">
                <div className="bg-white border-2 border-border focus-within:border-primary rounded-3xl px-6 py-8 flex flex-col items-center gap-1 shadow-sm transition">
                  <div className="flex items-baseline gap-3">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={numberText}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9.,]/g, '');
                        setNumberText(raw);
                        setTextError("");
                      }}
                      onKeyDown={e => e.key === "Enter" && handleDose()}
                      placeholder="0"
                      autoFocus
                      className="text-6xl font-black text-text-main w-36 text-right bg-transparent outline-none placeholder:text-text-muted/25 leading-none"
                    />
                    <span className="text-3xl font-bold text-text-muted/50 shrink-0 pb-1">mg</span>
                  </div>
                  <p className="text-xs text-text-muted/50 mt-2">Exemplo: 0.25 · 0.5 · 1 · 2.5 · 5</p>
                </div>
                {textError && <p className="text-red-500 text-sm px-1">{textError}</p>}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDose}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base"
                >
                  Confirmar →
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
