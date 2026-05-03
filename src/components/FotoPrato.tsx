import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, Loader2, RotateCcw, ShoppingBag, CheckCircle } from "lucide-react";
import BottomNav from "./BottomNav";

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

export default function FotoPrato({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImage(base64);
      setImageFile(base64.split(',')[1]); // só o base64 puro
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeWithClaude = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setError(null);

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
          max_tokens: 600,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageFile,
                },
              },
              {
                type: "text",
                text: `Analise essa foto de refeição e responda APENAS em JSON válido, sem markdown, sem explicação:

{
  "prato": "nome curto do prato",
  "kcal": número estimado de calorias,
  "proteina": gramas de proteína,
  "carbs": gramas de carboidratos,
  "gordura": gramas de gordura,
  "feedback": "avaliação nutricional em 1 frase curta",
  "glp1tip": "dica específica para quem usa GLP-1 sobre esse prato em 1 frase",
  "aprovado": true ou false (se é adequado para quem usa GLP-1)
}

Seja preciso nas estimativas baseado no que vê na imagem.`,
              },
            ],
          }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const parsed: AnalysisResult = JSON.parse(text);
      setResult(parsed);
    } catch (err) {
      setError("Não consegui analisar a imagem. Tente novamente com uma foto mais clara.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Registrar Refeição</h1>
            <p className="text-text-muted text-xs mt-0.5">IA analisa macros em segundos</p>
          </div>
          {image && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-text-muted border border-border bg-white px-3 py-1.5 rounded-full">
              <RotateCcw className="w-3.5 h-3.5" /> Nova foto
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {/* Área da foto */}
        {!image ? (
          <div className="space-y-3">
            {/* Instrução */}
            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-text-muted text-center leading-relaxed">
                📸 Tire uma foto do seu prato ou escolha da galeria.<br />
                A GLPY.IA analisa os macros e dá uma dica para seu protocolo.
              </p>
            </div>

            {/* Câmera */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => cameraInputRef.current?.click()}
              className="w-full bg-primary text-white rounded-2xl p-5 flex items-center gap-4 shadow-md"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base">Tirar foto agora</p>
                <p className="text-xs text-white/70">Usa a câmera do celular</p>
              </div>
            </motion.button>

            {/* Galeria */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-primary/30 transition"
            >
              <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-base text-text-main">Escolher da galeria</p>
                <p className="text-xs text-text-muted">Foto já tirada</p>
              </div>
            </motion.button>

            {/* Inputs ocultos */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview da foto */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm">
              <img src={image} alt="Prato" className="w-full h-64 object-cover" />
              {analyzing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                  <p className="text-white font-bold text-sm">GLPY.IA analisando...</p>
                </div>
              )}
            </div>

            {/* Botão analisar */}
            {!result && !analyzing && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={analyzeWithClaude}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base"
              >
                🔍 Analisar com GLPY.IA
              </motion.button>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Resultado */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Nome + status */}
              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted font-medium mb-0.5">Identificado</p>
                  <p className="font-bold text-base text-text-main">{result.prato}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  result.aprovado
                    ? 'bg-primary/10 text-primary'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {result.aprovado
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Ideal GLP-1</>
                    : <>⚠️ Atenção</>
                  }
                </div>
              </div>

              {/* Macros 4 cards */}
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

              {/* Feedback */}
              <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Avaliação nutricional</p>
                <p className="text-sm text-text-main leading-relaxed">{result.feedback}</p>
              </div>

              {/* Dica GLP-1 */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
                <div className="flex gap-2 mb-1.5">
                  <span className="text-base">🤖</span>
                  <span className="text-xs font-bold text-primary">GLPY.IA — dica para seu protocolo</span>
                </div>
                <p className="text-sm text-text-main leading-relaxed">{result.glp1tip}</p>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate('receitas')}
                  className="bg-white border border-border rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-text-main shadow-sm hover:border-primary/30 transition"
                >
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Ver receitas
                </button>
                <button
                  onClick={reset}
                  className="bg-primary text-white rounded-2xl p-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  Nova foto
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
