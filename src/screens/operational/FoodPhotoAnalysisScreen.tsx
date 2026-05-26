// GLPY — Food Photo Analysis Screen
// BUG 15B: Tela de análise de foto do prato — mock local, sem FatSecret real, sem salvar ainda
//
// Fluxo de estados:
//   idle → captured → analyzing → results
//
// ⚠️  Dados mockados — FatSecret real e persistência em BUG 15C.
//     NÃO salva em glpy_refeicoes_hoje.
//     NÃO altera FoodLogScreen, useNutritionConsumed, HomePremiumV2.

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, Upload, ChevronLeft, Loader2, CheckCircle, AlertTriangle,
  RotateCcw, Coffee, Utensils, Moon, Apple, Sparkles, Zap, Check,
} from 'lucide-react';

import type {
  FatSecretFoodItem,
  FatSecretAnalysisResult,
  FatSecretMealType,
  NormalizedMealFromPhoto,
} from '../../services/fatsecret';
import { normalizeFatSecretResult } from '../../services/fatsecret';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'captured' | 'analyzing' | 'results';

export interface FoodPhotoAnalysisScreenProps {
  onBack?: () => void;
  /**
   * Chamado com NormalizedMealFromPhoto quando o usuário clica "Salvar".
   * ⚠️  BUG 15C: persistência real em glpy_refeicoes_hoje ainda não implementada.
   *    Por ora o App.tsx apenas navega de volta ao receber essa callback.
   */
  onSave?: (data: NormalizedMealFromPhoto) => void;
}

// ── Mock data — análise realista por combinações de prato ─────────────────────

interface MockAnalysis {
  items:    FatSecretFoodItem[];
  glp1tip:  string;
  aprovado: boolean;
}

const MOCK_ANALYSES: MockAnalysis[] = [
  {
    items: [
      { name: 'Frango grelhado',      calories: 165, protein: 31,   carbs: 0,    fat: 4,    confidence: 0.94, servingDescription: '100g',          externalId: 'fs_001' },
      { name: 'Arroz integral cozido', calories: 112, protein: 2.6,  carbs: 24,   fat: 0.9,  confidence: 0.89, servingDescription: '100g',          externalId: 'fs_002' },
      { name: 'Brócolis no vapor',     calories: 35,  protein: 2.4,  carbs: 7,    fat: 0.4,  confidence: 0.82, servingDescription: '80g',           externalId: 'fs_003' },
    ],
    glp1tip:  'Ótima escolha! Alta proteína + fibras do brócolis prolongam a saciedade do GLP-1. Priorize o frango primeiro no prato.',
    aprovado: true,
  },
  {
    items: [
      { name: 'Omelete de ovos',      calories: 154, protein: 10.6, carbs: 1.6,  fat: 11.5, confidence: 0.91, servingDescription: '2 ovos',        externalId: 'fs_004' },
      { name: 'Queijo minas frescal', calories: 64,  protein: 5.6,  carbs: 1.9,  fat: 4,    confidence: 0.78, servingDescription: '30g',           externalId: 'fs_005' },
      { name: 'Torrada integral',     calories: 71,  protein: 2.7,  carbs: 13,   fat: 0.9,  confidence: 0.85, servingDescription: '2 unidades',    externalId: 'fs_006' },
    ],
    glp1tip:  'Café da manhã proteico! Ovos têm alta biodisponibilidade — ideais para quem tem apetite reduzido pelo GLP-1.',
    aprovado: true,
  },
  {
    items: [
      { name: 'Salada de folhas verdes',   calories: 20,  protein: 1.5,  carbs: 3.5,  fat: 0.3,  confidence: 0.96, servingDescription: '100g',          externalId: 'fs_007' },
      { name: 'Atum em lata (escorrido)', calories: 128, protein: 28.5, carbs: 0,    fat: 1.3,  confidence: 0.88, servingDescription: '100g',          externalId: 'fs_008' },
      { name: 'Azeite de oliva',           calories: 119, protein: 0,    carbs: 0,    fat: 13.5, confidence: 0.73, servingDescription: '1 colher sopa', externalId: 'fs_009' },
    ],
    glp1tip:  'Refeição leve e nutritiva. Atum + folhas + azeite é anti-inflamatório e complementa o efeito do GLP-1.',
    aprovado: true,
  },
  {
    items: [
      { name: 'Iogurte grego natural', calories: 97,  protein: 10,  carbs: 3.6,  fat: 5,   confidence: 0.93, servingDescription: '100g', externalId: 'fs_010' },
      { name: 'Granola sem açúcar',    calories: 200, protein: 5.4, carbs: 32,   fat: 7,   confidence: 0.81, servingDescription: '40g',  externalId: 'fs_011' },
      { name: 'Morango fresco',        calories: 32,  protein: 0.7, carbs: 7.7,  fat: 0.3, confidence: 0.90, servingDescription: '100g', externalId: 'fs_012' },
    ],
    glp1tip:  'Lanche perfeito para GLP-1! Iogurte grego reduz náusea e entrega proteína de forma suave ao estômago.',
    aprovado: true,
  },
  {
    items: [
      { name: 'Pizza de queijo (fatia)', calories: 285, protein: 12, carbs: 36, fat: 10, confidence: 0.87, servingDescription: '1 fatia (107g)', externalId: 'fs_013' },
      { name: 'Refrigerante cola',       calories: 140, protein: 0,  carbs: 38, fat: 0,  confidence: 0.95, servingDescription: '350ml',         externalId: 'fs_014' },
    ],
    glp1tip:  'Atenção! Carboidratos altos + bebida açucarada causam pico de glicose. Com GLP-1, prefira água e reduza a porção.',
    aprovado: false,
  },
  {
    items: [
      { name: 'Salmão grelhado',      calories: 208, protein: 28,  carbs: 0,  fat: 10,  confidence: 0.92, servingDescription: '150g', externalId: 'fs_015' },
      { name: 'Batata-doce assada',   calories: 103, protein: 2.3, carbs: 24, fat: 0.1, confidence: 0.84, servingDescription: '150g', externalId: 'fs_016' },
      { name: 'Abobrinha refogada',   calories: 27,  protein: 1.8, carbs: 5,  fat: 0.4, confidence: 0.79, servingDescription: '100g', externalId: 'fs_017' },
    ],
    glp1tip:  'Excelente! Salmão + batata-doce é uma combinação anti-inflamatória e energética. Ômega-3 apoia a saciedade prolongada do GLP-1.',
    aprovado: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcTotals(items: FatSecretFoodItem[]): FatSecretAnalysisResult['totals'] {
  return {
    calories: Math.round(items.reduce((s, i) => s + (i.calories ?? 0), 0)),
    protein:  Math.round(items.reduce((s, i) => s + (i.protein  ?? 0), 0) * 10) / 10,
    carbs:    Math.round(items.reduce((s, i) => s + (i.carbs    ?? 0), 0) * 10) / 10,
    fat:      Math.round(items.reduce((s, i) => s + (i.fat      ?? 0), 0) * 10) / 10,
  };
}

function fmtNum(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function confidenceBadge(c?: number): string {
  if (c === undefined) return '';
  if (c >= 0.85) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (c >= 0.65) return 'bg-amber-50   text-amber-600   border border-amber-100';
  return                    'bg-red-50    text-red-500     border border-red-100';
}

function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

// ── Meal options ──────────────────────────────────────────────────────────────

const MEAL_OPTIONS: { id: FatSecretMealType; label: string; Icon: typeof Coffee }[] = [
  { id: 'cafe',   label: 'Café',   Icon: Coffee   },
  { id: 'almoco', label: 'Almoço', Icon: Utensils  },
  { id: 'jantar', label: 'Jantar', Icon: Moon      },
  { id: 'lanche', label: 'Lanche', Icon: Apple     },
];

// ── Analyzing steps ───────────────────────────────────────────────────────────

const ANALYSIS_STEPS = [
  'Detectando alimentos no prato',
  'Consultando base nutricional',
  'Calculando macros e calorias',
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function FoodPhotoAnalysisScreen({ onBack, onSave }: FoodPhotoAnalysisScreenProps) {
  const [phase,         setPhase]      = useState<Phase>('idle');
  const [imageUrl,      setImageUrl]   = useState<string | null>(null);
  const [mealType,      setMealType]   = useState<FatSecretMealType>('almoco');
  const [analysis,      setAnalysis]   = useState<(MockAnalysis & { totals: FatSecretAnalysisResult['totals'] }) | null>(null);
  const [analyzingStep, setStep]       = useState(0);

  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // ── File capture ─────────────────────────────────────────────────────────

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setPhase('captured');
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  }

  // ── Mock analysis ─────────────────────────────────────────────────────────

  async function runMockAnalysis() {
    setPhase('analyzing');
    setStep(0);
    for (let i = 1; i <= ANALYSIS_STEPS.length; i++) {
      await delay(750 + i * 80);
      setStep(i);
    }
    await delay(300);
    const mock = MOCK_ANALYSES[Math.floor(Math.random() * MOCK_ANALYSES.length)];
    setAnalysis({ ...mock, totals: calcTotals(mock.items) });
    setPhase('results');
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function reset() {
    setPhase('idle');
    setImageUrl(null);
    setAnalysis(null);
    setStep(0);
  }

  // ── Save (placeholder — BUG 15C fará persistência real) ──────────────────

  function handleSave() {
    if (!analysis) return;
    const result: FatSecretAnalysisResult = {
      success: true,
      source:  'fatsecret',
      items:   analysis.items,
      totals:  analysis.totals,
    };
    onSave?.(normalizeFatSecretResult(result, mealType));
  }

  // ── Sub-component: Macro pill ─────────────────────────────────────────────

  function MacroPill({ label, value, unit = '', color }: { label: string; value: number; unit?: string; color: string }) {
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
        {label}: {fmtNum(value)}{unit}
      </span>
    );
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
              {phase === 'analyzing' && 'GLPY.IA identificando alimentos...'}
              {phase === 'results'   && 'Análise concluída'}
            </p>
          </div>
          {(phase === 'captured' || phase === 'results') && (
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
              {/* Hero card */}
              <div className="bg-white border border-border rounded-2xl p-6 text-center shadow-sm space-y-3">
                <div className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto border border-primary/10">
                  <Camera size={28} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-base text-[#0A1628]">Foto do Prato</p>
                  <p className="text-xs text-text-muted leading-relaxed mt-1">
                    Tire uma foto da sua refeição. A GLPY.IA identifica os alimentos,
                    calcula os macros e dá uma dica personalizada para o seu protocolo GLP-1.
                  </p>
                </div>
              </div>

              {/* Camera button */}
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

              {/* Gallery button */}
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

              {/* Powered by */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Zap size={10} className="text-text-muted" />
                <span className="text-[11px] text-text-muted">Powered by FatSecret Platform API</span>
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
              {/* Photo preview */}
              <div className="rounded-2xl overflow-hidden shadow-sm">
                <img src={imageUrl} alt="Prato selecionado" className="w-full h-56 object-cover" />
              </div>

              {/* Meal type */}
              <MealTypeSelector />

              {/* Analyze CTA */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={runMockAnalysis}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Analisar com GLPY.IA
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
              {/* Photo with scan overlay */}
              <div className="rounded-2xl overflow-hidden shadow-sm relative">
                <img src={imageUrl} alt="Prato" className="w-full h-56 object-cover" />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                    <Loader2 size={28} className="text-white animate-spin" />
                  </div>
                  <p className="text-white font-bold text-sm">GLPY.IA analisando...</p>
                  <p className="text-white/60 text-xs">Identificando alimentos</p>
                </div>
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-primary"
                  style={{ top: 0 }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.0, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Steps progress */}
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
                      {analysis.items.slice(0, 2).map(i => i.name).join(' + ')}
                      {analysis.items.length > 2 && (
                        <span className="text-text-muted font-normal"> +{analysis.items.length - 2}</span>
                      )}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">{analysis.items.length} alimento(s) detectado(s)</p>
                  </div>
                  <div className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    analysis.aprovado
                      ? 'bg-primary/10 text-primary'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {analysis.aprovado
                      ? <><CheckCircle size={10} /> Ideal GLP-1</>
                      : <>⚠️ Atenção</>
                    }
                  </div>
                </div>
              </div>

              {/* Food items list */}
              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
                  Alimentos identificados
                </p>
                <div className="space-y-2">
                  {analysis.items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.2 }}
                      className="bg-[#F8FAF9] rounded-xl p-3 border border-[#E8EFEc]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#0A1628] leading-tight">{item.name}</p>
                          {item.servingDescription && (
                            <p className="text-[10px] text-text-muted mt-0.5">{item.servingDescription}</p>
                          )}
                        </div>
                        {item.confidence !== undefined && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${confidenceBadge(item.confidence)}`}>
                            {Math.round(item.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {item.calories != null && <MacroPill label="Kcal"  value={Math.round(item.calories)} color="text-red-500    bg-red-50    border-red-100"    />}
                        {item.protein  != null && <MacroPill label="Prot"  value={item.protein}  unit="g"   color="text-primary   bg-primary/8 border-primary/15"  />}
                        {item.carbs    != null && <MacroPill label="Carbs" value={item.carbs}    unit="g"   color="text-amber-600 bg-amber-50  border-amber-100"    />}
                        {item.fat      != null && <MacroPill label="Gord"  value={item.fat}      unit="g"   color="text-violet-600 bg-violet-50 border-violet-100"  />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Total da refeição</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Kcal',  value: analysis.totals.calories,         colorText: 'text-red-500',    colorBg: 'bg-red-50'       },
                    { label: 'Prot',  value: analysis.totals.protein,  unit:'g', colorText: 'text-primary',    colorBg: 'bg-primary/8'    },
                    { label: 'Carbs', value: analysis.totals.carbs,    unit:'g', colorText: 'text-amber-600',  colorBg: 'bg-amber-50'     },
                    { label: 'Gord',  value: analysis.totals.fat,      unit:'g', colorText: 'text-violet-600', colorBg: 'bg-violet-50'    },
                  ].map(m => (
                    <div key={m.label} className={`${m.colorBg} rounded-xl p-2.5 text-center border border-border`}>
                      <p className={`font-black text-lg ${m.colorText} leading-none`}>
                        {fmtNum(m.value)}{m.unit ?? ''}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meal type (editável em results) */}
              <MealTypeSelector />

              {/* GLPY IA tip */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={13} className="text-primary flex-shrink-0" />
                  <span className="text-xs font-bold text-primary">Dica GLPY.IA</span>
                </div>
                <p className="text-sm text-[#0A1628] leading-relaxed">{analysis.glp1tip}</p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-1">
                {/* Save — BUG 15C badge */}
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Salvar na refeição
                  </motion.button>
                  <span className="absolute -top-2 right-3 bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                    BUG 15C
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="w-full bg-white border border-border text-text-main font-semibold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
                >
                  <Camera size={15} /> Nova foto
                </motion.button>
              </div>

              {/* Mock disclaimer */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <strong>Dados mockados</strong> — análise real via FatSecret Platform API e salvamento em
                  refeições chegam no BUG 15C.
                </p>
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
