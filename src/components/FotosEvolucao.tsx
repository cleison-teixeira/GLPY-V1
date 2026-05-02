import { motion } from "motion/react";
import { Camera, Plus } from "lucide-react";
import BottomNav from "./BottomNav";

const fotos = [
  { data: "01 Mai", url: "https://images.unsplash.com/photo-1549476464-37392f717541?w=400&q=80" },
  { data: "01 Abr", url: "https://images.unsplash.com/photo-1549476464-37392f717541?w=400&q=80" }, // Mock same image
];

export default function FotosEvolucao({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-2">Fotos de Evolução</h1>
      <p className="text-text-muted mb-8">Sua timeline pessoal de conquistas.</p>

      <div className="grid grid-cols-2 gap-4">
        {fotos.map((foto, i) => (
          <div key={i} className="bg-white p-2 rounded-2xl shadow-sm border border-border">
            <img src={foto.url} alt={`Evolução ${foto.data}`} className="w-full h-48 object-cover rounded-xl mb-2" />
            <p className="font-bold text-center">{foto.data}</p>
          </div>
        ))}
        
        <button className="bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl h-64 flex flex-col items-center justify-center gap-2 text-primary">
          <Plus className="w-10 h-10" />
          <span className="font-bold">Nova Foto</span>
        </button>
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
