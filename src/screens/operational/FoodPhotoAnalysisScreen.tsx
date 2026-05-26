// GLPY — Food Photo Analysis Screen
// BUG 15C.1: Conectado ao Gemini Vision via /api/gemini-food-vision
//            Detecta alimentos na imagem — macros virão da FatSecret no BUG 15D.
//            Não salva em glpy_refeicoes_hoje ainda.
//
// Fluxo de estados:
//   idle → captured → analyzing → results | error

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, Upload, ChevronLeft, Loader2, CheckCircle, AlertTriangle,
  RotateCcw, Coffee, Utensils, Moon, Apple, Sparkles, Zap, Check,
} from 'lucide-react';

import {
  detectFoodsFromPhoto,
  type DetectedFood,
} from '../../services/geminiFoodVision';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'captured' | 'analyzing' | 'results' | 'error';
type MealType = 'cafe' | 'almoco' | 'jantar' | 'lanche';

type GeminiAnalysis = {
  foods:   DetectedFood[];
  summary: string;
};

export interface FoodPhotoAnalysisScreenProps {
  onBack?: () => void;
  /** Reservado para BUG 15D — persistência real em glpy_refeicoes_hoje. */
  onSave?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function confidenceBadge(c: number): string {
  if (c >= 0.85) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (c >= 0.65) return 'bg-amber-50   text-amber-600   border border-amber-100';
  return                  'bg-red-50    text-red-500     border border-red-100';
}

function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

// Reduz a imagem para 800px máx e converte para JPEG 0.82 antes de enviar à API.
// Necessário: Vercel Functions têm limite de 4.5 MB por requisição.
async function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX   = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w     = Math.round(img.width  * scale);
      const h     = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      resolve(dataUrl.split(',')[1] ?? dataUrl);
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = url;
  });
}

// ── Meal options ──────────────────────────────────────────────────────────────

const MEAL_OPTIONS: { id: MealType; label: string; Icon: typeof Coffee }[] = [
  { id: 'cafe',   label: 'Café',   Icon: Coffee   },
  { id: 'almoco', label: 'Almoço', Icon: Utensils  },
  { id: 'jantar', label: 'Jantar', Icon: Moon      },
  { id: 'lanche', label: 'Lanche', Icon: Apple     },
];

const ANALYSIS_STEPS = [
  'Detectando alimentos no prato',
  'Identificando ingredientes prováveis',
  'Verificando resultados',
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function FoodPhotoAnalysisScreen({ onBack }: FoodPhotoAnalysisScreenProps) {
  const [phase,         setPhase]         = useState<Phase>('idle');
  const [imageUrl,      setImageUrl]      = useState<string | null>(null);
  const [imageBase64,   setImageBase64]   = useState<string | null>(null);
  const [mealType,      setMealType]      = useState<MealType>('almoco');
  const [analysis,      setAnalysis]      = useState<GeminiAnalysis | null>(null);
  const [analyzingStep, setStep]          = useState(0);
  const [errorMessage,  setErrorMessage]  = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // ── File capture ─────────────────────────────────────────────────────────

  function handleFile(file: File) {
    setImageUrl(null);
    setImageBase64(null);
    setPhase('captured');
    setAnalysis(null);
    setSavedFeedback(false);
    setErrorMessage(null);
    compressImageToBase64(file)
      .then(b64 => {
        setImageBase64(b64);
        setImageUrl(`data:image/jpeg;base64,${b64}`);
      })
      .catch(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setImageUrl(dataUrl);
          setImageBase64(dataUrl.split(',')[1] ?? dataUrl);
        };
        reader.readAsDataURL(file);
      });
  }

  // ── Gemini analysis ───────────────────────────────────────────────────────

  async function runAnalysis() {
    if (!imageBase64) return;
    setPhase('analyzing');
    setStep(0);
    setErrorMessage(null);
    setSavedFeedback(false);

    const apiPromise = detectFoodsFromPhoto(imageBase64);

    for (let i = 1; i <= ANALYSIS_STEPS.length; i++) {
      await delay(800 + i * 120);
      setStep(i);
    }

    const result = await apiPromise;

    if (!result.ok) {
      setErrorMessage(result.error);
      setPhase('error');
      return;
    }

    setAnalysis({ foods: result.detectedFoods, summary: result.summary });
    setPhase('results');
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function reset() {
    setPhase('idle');
    setImageUrl(null);
    setImageBase64(null);
    setAnalysis(null);
    setStep(0);
    setErrorMessage(null);
    setSavedFeedback(false);
  }

  // ── Confirm (BUG 15D: persistência real) ─────────────────────────────────

  function handleSave() {
    setSavedFeedback(true);
  }

  // ── Sub-component: Meal type selector ────────────────────────────────────

  function MealTypeSelector() {
    return (
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Tipo de refeição</p>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_OPTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setMealType(id)}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl text-xs font-semibold transition-all border ${
                mealType === id
                  ? 'bg-primary/8 border-primary text-primary shadow-sm'
                  : 'bg-[#F4F6F8] border-border text-text-muted hover:border-primary/40'
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full max-w-full bg-[#F4F6F8] text-text-main overflow-x-hidden">

      {/* ─ Header ─ */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F4F6F8] flex-shrink-0"
            aria-label="Voltar"
          >
            <ChevronLeft size={20} color="#0A1628" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#0A1628] text-base leading-tight">Análise do Prato</p>
            <p className="text-xs text-text-muted">
              {phase === 'idle'      && 'Tire uma foto para analisar'}
              {phase === 'captured'  && 'Foto selecionada — pronto para analisar'}
              {phase === 'analyzing' && 'Consultando Gemini Vision...'}
              {phase === 'results'   && 'Alimentos identificados'}
              {phase === 'error'     && 'Erro na análise'}
            </p>
          </div>
          {(phase === 'captured' || phase === 'results' || phase === 'error') && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-text-muted border border-border bg-white px-3 py-1.5 rounded-full flex-shrink-0"
            >
              <RotateCcw size={12} /> Nova foto
            </button>
          )}
        </div>
      </div>

      {/* ─ Content ─ */}
      <div className="px-5 py-5 pb-28 space-y-4">
        <AnimatePresence mode="wait">

          {/* ──────────────────── IDLE ──────────────────── */}
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="bg-white border border-border rounded-2xl p-6 text-center shadow-sm space-y-3">
                <div className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto border border-primary/10">
                  <Camera size={28} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-base text-[#0A1628]">Foto do Prato</p>
                  <p className="text-xs text-text-muted leading-relaxed mt-1">
                    Tire uma foto da sua refeição. O GLPY identifica os alimentos
                    automaticamente com Inteligência Artificial.
                  </p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => cameraRef.current?.click()}
                className="w-full bg-primary text-white rounded-2xl p-5 flex items-center gap-4 shadow-md"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera size={22} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base">Tirar foto agora</p>
                  <p className="text-xs text-white/70">Usa a câmera do celular</p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => galleryRef.current?.click()}
                className="w-full bg-white border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Upload size={22} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base text-[#0A1628]">Escolher da galeria</p>
                  <p className="text-xs text-text-muted">Foto já tirada</p>
                </div>
              </motion.button>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Zap size={10} className="text-text-muted" />
                <span className="text-[11px] text-text-muted">Powered by Gemini Vision</span>
              </div>
            </motion.div>
          )}

          {/* ──────────────────── CAPTURED ──────────────────── */}
          {phase === 'captured' && imageUrl && (
            <motion.div
              key="captured"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-2xl overflow-hidden shadow-sm">
                <img src={imageUrl} alt="Prato selecionado" className="w-full h-56 object-cover" />
              </div>

              <MealTypeSelector />

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={runAnalysis}
                disabled={!imageBase64}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={18} />
                Analisar prato
              </motion.button>
            </motion.div>
          )}

          {/* ──────────────────── ANALYZING ──────────────────── */}
          {phase === 'analyzing' && imageUrl && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="rounded-2xl overflow-hidden shadow-sm relative">
                <img src={imageUrl} alt="Prato" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                    <Loader2 size={28} className="text-white animate-spin" />
                  </div>
                  <p className="text-white font-bold text-sm">Analisando refeição...</p>
                  <p className="text-white/60 text-xs">Gemini Vision</p>
                </div>
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-primary"
                  style={{ top: 0 }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.0, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm space-y-3">
                {ANALYSIS_STEPS.map((label, i) => {
                  const done    = analyzingStep > i;
                  const current = analyzingStep === i;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? 'bg-primary' : 'bg-[#E8EFEc]'
                      }`}>
                        {done    && <Check size={10} className="text-white" strokeWidth={3} />}
                        {current && <Loader2 size={10} className="text-text-muted animate-spin" />}
                      </div>
                      <span className={`text-sm transition-colors ${
                        done ? 'text-[#0A1628] font-medium' : 'text-text-muted'
                      }`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ──────────────────── ERROR ──────────────────── */}
          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white border border-red-100 rounded-2xl p-6 text-center shadow-sm space-y-4">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                  <AlertTriangle size={26} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-[#0A1628] text-base">
                    Não conseguimos analisar automaticamente agora.
                  </p>
                  {errorMessage && (
                    <p className="text-xs text-text-muted mt-2 leading-relaxed">{errorMessage}</p>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPhase('captured')}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} /> Tentar novamente
                </motion.button>
                <button
                  onClick={reset}
                  className="text-xs text-text-muted underline"
                >
                  Escolher outra foto
                </button>
              </div>
            </motion.div>
          )}

          {/* ──────────────────── RESULTS ──────────────────── */}
          {phase === 'results' && analysis && imageUrl && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* Identity card */}
              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 p-3.5">
                  <img
                    src={imageUrl}
                    alt="Prato"
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wide mb-0.5">Identificado</p>
                    <p className="font-bold text-sm text-[#0A1628] leading-snug">
                      {analysis.foods.slice(0, 2).map(f => f.name).join(' + ')}
                      {analysis.foods.length > 2 && (
                        <span className="text-text-muted font-normal"> +{analysis.foods.length - 2}</span>
                      )}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">{analysis.foods.length} alimento(s) detectado(s)</p>
                  </div>
                </div>
                {analysis.summary && (
                  <div className="px-3.5 pb-3.5">
                    <p className="text-[11px] text-text-muted leading-relaxed italic">"{analysis.summary}"</p>
                  </div>
                )}
              </div>

              {/* Food items list */}
              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
                  Alimentos identificados
                </p>
                <div className="space-y-2">
                  {analysis.foods.map((food, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.2 }}
                      className="bg-[#F8FAF9] rounded-xl p-3 border border-[#E8EFEc]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#0A1628] leading-tight">{food.name}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{food.portionGuess}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${confidenceBadge(food.confidence)}`}>
                          {Math.round(food.confidence * 100)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Meal type */}
              <MealTypeSelector />

              {/* Info sobre próximos passos */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <AlertTriangle size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Alimentos identificados pela IA. Os macros e calorias serão calculados em breve.
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                {savedFeedback ? (
                  <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl py-4 px-5 flex items-center gap-3">
                    <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-semibold leading-snug">
                      Na próxima etapa, isso será salvo no seu registro de refeição.
                    </p>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Confirmar refeição
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="w-full bg-white border border-border text-text-main font-semibold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
                >
                  <Camera size={15} /> Nova foto
                </motion.button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ─ Hidden inputs ─ */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
