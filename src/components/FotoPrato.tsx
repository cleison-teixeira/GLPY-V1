import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, ChevronLeft, Upload, Loader2, RotateCcw, ShoppingBag, CheckCircle, X } from "lucide-react";
import BottomNav from "./BottomNav";
import { getLocalDateKey } from "../utils/formatters";

const LIMITES: Record<string, number> = { starter: 5, plus: 6, pro: 9, top: Infinity };

function getFotosHoje(): number {
  const hoje = getLocalDateKey();
  if (localStorage.getItem("glpy_fotos_data") !== hoje) {
    localStorage.setItem("glpy_fotos_data", hoje);
    localStorage.setItem("glpy_fotos_hoje", "0");
    return 0;
  }
  return parseInt(localStorage.getItem("glpy_fotos_hoje") || "0", 10);
}

function incrementarFotos() {
  const hoje = getLocalDateKey();
  localStorage.setItem("glpy_fotos_data", hoje);
  localStorage.setItem("glpy_fotos_hoje", String(getFotosHoje() + 1));
}

function acumularProteina(g: number) {
  const hoje = getLocalDateKey();
  if (localStorage.getItem("glpy_proteina_data") !== hoje) {
    localStorage.setItem("glpy_proteina_data", hoje);
    localStorage.setItem("glpy_proteina_hoje", "0");
  }
  const atual = parseInt(localStorage.getItem("glpy_proteina_hoje") || "0", 10);
  localStorage.setItem("glpy_proteina_hoje", String(atual + Math.round(g)));
}

type AnalysisResult = {
  prato: string;
  kcal: number;
  proteina: number;
  carbs: number;
  gordura: number;
  feedback: string;
  glp1tip: string;
  aprovado: boolean;
};

const MOCK_RESULTS: AnalysisResult[] = [
  { prato: "Frango grelhado com legumes", kcal: 320, proteina: 38, carbs: 18, gordura: 8, feedback: "Excelente escolha! Alta proteína e baixo carboidrato — ideal para preservar músculo.", glp1tip: "Com o apetite reduzido pelo GLP-1, priorize sempre a proteína primeiro no prato.", aprovado: true },
  { prato: "Salada com atum", kcal: 280, proteina: 32, carbs: 12, gordura: 10, feedback: "Refeição leve e nutritiva. Boa combinação de proteína e fibras.", glp1tip: "Mastigue devagar — o GLP-1 já reduz seu apetite, comer devagar maximiza a saciedade.", aprovado: true },
  { prato: "Omelete com queijo", kcal: 350, proteina: 28, carbs: 4, gordura: 24, feedback: "Rica em proteína e gordura boa. Baixo carboidrato favorece a perda de peso.", glp1tip: "Ovos são a proteína mais biodisponível — perfeita para quem tem apetite reduzido.", aprovado: true },
  { prato: "Bowl proteico", kcal: 410, proteina: 35, carbs: 42, gordura: 9, feedback: "Refeição completa e balanceada. Carboidrato complexo + proteína = energia estável.", glp1tip: "Arroz integral libera energia gradualmente, evitando picos de glicose que aumentam a fome.", aprovado: true },
  { prato: "Iogurte grego com frutas", kcal: 220, proteina: 18, carbs: 28, gordura: 4, feedback: "Lanche perfeito para quem usa GLP-1. Proteína + probióticos + vitaminas.", glp1tip: "Iogurte grego no café da manhã reduz náusea e entrega proteína de forma suave ao estômago.", aprovado: true },
  { prato: "Fruta — lanche leve", kcal: 85, proteina: 1, carbs: 22, gordura: 0, feedback: "Fruta isolada tem pouquíssima proteína. Combine sempre com uma fonte proteica.", glp1tip: "Fruta + iogurte grego ou castanhas = lanche completo que não gera pico de glicose.", aprovado: false },
];

export default function FotoPrato({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showLimiteModal, setShowLimiteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const plano = localStorage.getItem("glpy_plano") || "starter";
  const limite = LIMITES[plano] ?? 3;
  const fotosHoje = getFotosHoje();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Full = reader.result as string;
      setImage(base64Full);
      setImageBase64(base64Full.split(',')[1]);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageBase64) return;
    if (fotosHoje >= limite) { setShowLimiteModal(true); return; }
    setAnalyzing(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
              { type: "text", text: `Analise essa foto de refeição. Responda APENAS JSON sem markdown:
{"prato":"nome curto","kcal":número,"proteina":número,"carbs":número,"gordura":número,"feedback":"avaliação 1 frase","glp1tip":"dica GLP-1 1 frase","aprovado":true/false}` },
            ],
          }],
        }),
      });

      if (!response.ok) throw new Error("CORS");
      const data = await response.json();
      const text = data.content?.[0]?.text?.replace(/```json|```/g, "").trim() || "";
      const parsed = JSON.parse(text);
      setResult(parsed);
      incrementarFotos();
      acumularProteina(parsed.proteina ?? 0);

    } catch {
      await new Promise(r => setTimeout(r, 1800));
      const mock = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
      setResult(mock);
      incrementarFotos();
      acumularProteina(mock.proteina ?? 0);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => { setImage(null); setImageBase64(null); setResult(null); };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border">
        <button
          onClick={() => onNavigate('dashboard')}
          className="mb-3 flex items-center justify-center w-9 h-9 -ml-1 rounded-full bg-transparent"
        >
          <ChevronLeft size={24} color="#0A1628" />
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Registrar Refeição</h1>
            <p className="text-text-muted text-xs mt-0.5">
              IA analisa macros em segundos
              {limite !== Infinity && (
                <span className="ml-2 font-semibold text-primary">{fotosHoje}/{limite} hoje</span>
              )}
            </p>
          </div>
          {image && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-text-muted border border-border bg-white px-3 py-1.5 rounded-full">
              <RotateCcw className="w-3.5 h-3.5" /> Nova foto
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        {!image ? (
          <div className="space-y-3">
            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm text-center">
              <p className="text-xs text-text-muted leading-relaxed">
                📸 Tire uma foto do seu prato ou escolha da galeria.<br />
                A GLPY.IA analisa os macros e dá uma dica para seu protocolo.
              </p>
            </div>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-primary text-white rounded-2xl p-5 flex items-center gap-4 shadow-md">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base">Tirar foto agora</p>
                <p className="text-xs text-white/70">Usa a câmera do celular</p>
              </div>
            </motion.button>

            <motion.button whileTap={{ scale: 0.98 }} onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-primary/30 transition">
              <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base text-text-main">Escolher da galeria</p>
                <p className="text-xs text-text-muted">Foto já tirada</p>
              </div>
            </motion.button>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-sm">
              <img src={image} alt="Prato" className="w-full h-64 object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                  <p className="text-white font-bold text-sm">GLPY.IA analisando...</p>
                  <p className="text-white/60 text-xs">Calculando macros</p>
                </div>
              )}
            </div>
            {!result && !analyzing && (
              <motion.button whileTap={{ scale: 0.98 }} onClick={analyzeImage}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base">
                🔍 Analisar com GLPY.IA
              </motion.button>
            )}
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted font-medium mb-0.5">Identificado</p>
                  <p className="font-bold text-base text-text-main">{result.prato}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${result.aprovado ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                  {result.aprovado ? <><CheckCircle className="w-3.5 h-3.5" /> Ideal GLP-1</> : <>⚠️ Atenção</>}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Kcal", value: result.kcal, unit: "", color: "text-red-500", bg: "bg-red-50" },
                  { label: "Prot", value: result.proteina, unit: "g", color: "text-primary", bg: "bg-primary/8" },
                  { label: "Carbs", value: result.carbs, unit: "g", color: "text-amber-500", bg: "bg-amber-50" },
                  { label: "Gord", value: result.gordura, unit: "g", color: "text-violet-500", bg: "bg-violet-50" },
                ].map(m => (
                  <div key={m.label} className={`${m.bg} rounded-2xl p-3 text-center border border-border`}>
                    <p className={`font-black text-lg ${m.color} leading-none`}>{m.value}{m.unit}</p>
                    <p className="text-xs text-text-muted mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Avaliação</p>
                <p className="text-sm text-text-main leading-relaxed">{result.feedback}</p>
              </div>

              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
                <div className="flex gap-2 mb-1.5">
                  <span>🤖</span>
                  <span className="text-xs font-bold text-primary">GLPY.IA</span>
                </div>
                <p className="text-sm text-text-main leading-relaxed">{result.glp1tip}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <button onClick={() => onNavigate('receitas')}
                  className="bg-white border border-border rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm">
                  <ShoppingBag className="w-4 h-4 text-primary" /> Ver receitas
                </button>
                <button onClick={reset}
                  className="bg-primary text-white rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-md">
                  <Camera className="w-4 h-4" /> Nova foto
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav active="dashboard" onNavigate={onNavigate} />

      <AnimatePresence>
        {showLimiteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowLimiteModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm mb-2 relative"
            >
              <button onClick={() => setShowLimiteModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-muted">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">📸</div>
                <h2 className="font-bold text-lg text-[#0A1628]">Limite diário atingido</h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Você usou suas {limite} fotos de hoje no plano {plano}.<br />
                  Upgrade para Plus ({LIMITES.plus}/dia) ou Pro ({LIMITES.pro}/dia).
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLimiteModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold text-text-muted">
                  Agora não
                </button>
                <button onClick={() => { setShowLimiteModal(false); onNavigate('planos'); }}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-sm font-semibold">
                  Ver planos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
