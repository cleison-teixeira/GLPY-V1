import { motion } from "motion/react";
import { Camera, Plus, ChevronLeft } from "lucide-react";
import BottomNav from "./BottomNav";

const fotos = [
  { data: "01 Mai", url: "https://images.unsplash.com/photo-1549476464-37392f717541?w=400&q=80" },
  { data: "01 Abr", url: "https://images.unsplash.com/photo-1549476464-37392f717541?w=400&q=80" }, // Mock same image
];

export default function FotosEvolucao({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3 mb-5">
        <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div>
          <h1 className="font-black text-xl text-[#0A1628]">Fotos de Evolução</h1>
          <p className="text-xs text-text-muted">Sua timeline pessoal de conquistas</p>
        </div>
      </div>
      <div className="p-6">

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
    </div>
  );
}
