import { motion } from "motion/react";
import { ShoppingBag, Star, ArrowRight, ChevronLeft } from "lucide-react";
import BottomNav from "./BottomNav";

const produtos = [
  { nome: "Whey Protein 900g", marca: "Integral Médica", preco: "R$ 129,90", img: "https://images.unsplash.com/photo-1593095948071-48743fc245d8?w=200&q=80" },
  { nome: "Creatina 300g", marca: "Max Titanium", preco: "R$ 89,90", img: "https://images.unsplash.com/photo-1584735935682-2f2077d2c475?w=200&q=80" },
  { nome: "Multivitamínico", marca: "Growth", preco: "R$ 49,90", img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80" },
];

export default function Loja({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3 mb-5">
        <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div>
          <h1 className="font-black text-xl text-[#0A1628]">Loja GLPY</h1>
          <p className="text-xs text-text-muted">Suplementos selecionados</p>
        </div>
      </div>
      <div className="p-6">

      <div className="grid grid-cols-1 gap-4">
        {produtos.map((produto, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-border flex items-center gap-4">
            <img src={produto.img} alt={produto.nome} className="w-20 h-20 object-cover rounded-2xl" />
            <div className="flex-grow">
              <h2 className="font-bold">{produto.nome}</h2>
              <p className="text-sm text-text-muted mb-1">{produto.marca}</p>
              <p className="font-bold text-primary">{produto.preco}</p>
            </div>
            <button className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 transition">
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 p-6 rounded-3xl border border-amber-200">
        <h3 className="font-bold text-amber-900 mb-2">Precisa de algo específico?</h3>
        <p className="text-sm text-amber-800 mb-4">Fale com nossos especialistas via WhatsApp</p>
        <button className="w-full bg-amber-500 text-white p-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition">
          Chamar no PedeZap <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
