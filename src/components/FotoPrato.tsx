import { useState } from "react";
import { motion } from "motion/react";
import { Camera, Upload, Loader2, Check } from "lucide-react";
import BottomNav from "./BottomNav";

export default function FotoPrato({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ kcal: number, prot: number } | null>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({ kcal: 450, prot: 35 });
    }, 2000);
  };

  return (
    <div id="foto-prato" className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-8">Foto do Prato</h1>
      
      {!image ? (
        <div className="flex flex-col gap-6">
            <div className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-text-muted hover:border-primary transition cursor-pointer">
                <Camera className="w-12 h-12" />
                <p>Tirar foto</p>
            </div>
            <div className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-text-muted hover:border-primary transition cursor-pointer">
                <Upload className="w-12 h-12" />
                <p>Upload da galeria</p>
            </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
           <img src={image} alt="Prato" className="w-full h-64 object-cover rounded-3xl" />
           <button 
             onClick={handleAnalyze} 
             disabled={analyzing}
             className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-pill"
           >
             {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analisar Macros"}
           </button>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-border">
          <h2 className="font-bold text-lg mb-4">Resultado da IA</h2>
          <div className="flex gap-4">
              <div className="bg-urgent/10 text-center p-4 rounded-2xl flex-1 border border-urgent/20"><p className="text-urgent font-bold text-lg">{result.kcal}</p><p className="text-xs text-urgent/80 font-bold">kcal</p></div>
              <div className="bg-primary/10 text-center p-4 rounded-2xl flex-1 border border-primary/20"><p className="text-primary font-bold text-lg">{result.prot}g</p><p className="text-xs text-primary/80 font-bold">prot</p></div>
            </div>
        </motion.div>
      )}

      <BottomNav active="recipes" onNavigate={onNavigate} />
    </div>
  );
}
