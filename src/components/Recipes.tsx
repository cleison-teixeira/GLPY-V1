import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ShoppingBag, CheckCircle } from "lucide-react";
import BottomNav from "./BottomNav";

const GlpyLogo = () => (
  <div className="flex items-center gap-1.5">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 4 7 4 13c0 4.4 3.6 8 8 8s8-3.6 8-8c0-6-8-11-8-11z" fill="#00C27A"/>
      <path d="M12 10v5M9.5 12.5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span className="font-black text-lg tracking-tight text-[#0A1628]">GLPY</span>
  </div>
);

type Recipe = {
  id: number;
  nome: string;
  categoria: string;
  emoji: string;
  kcal: number;
  proteina: number;
  carbs: number;
  gordura: number;
  ingredientes: string[];
  preparo: string;
};

const recipes: Recipe[] = [
  { id: 1, nome: "Panqueca Proteica", categoria: "Emagrecimento", emoji: "🥞", kcal: 280, proteina: 22, carbs: 15, gordura: 8, ingredientes: ["Ovo", "Aveia", "Whey"], preparo: "Misturar tudo e grelhar..." },
  { id: 2, nome: "Shake Anti-Fraqueza", categoria: "Energia", emoji: "🥤", kcal: 280, proteina: 26, carbs: 20, gordura: 6, ingredientes: ["Leite vegetal", "Whey", "Banana"], preparo: "Bater tudo no liquidificador..." },
  { id: 3, nome: "Bowl Anti-Rebote", categoria: "Emagrecimento", emoji: "🥗", kcal: 380, proteina: 35, carbs: 25, gordura: 15, ingredientes: ["Frango", "Quinoa", "Abacate"], preparo: "Montar o bowl..." },
  { id: 4, nome: "Mousse de Cacau", categoria: "Doce Fit", emoji: "🍫", kcal: 180, proteina: 18, carbs: 10, gordura: 5, ingredientes: ["Iogurte Grego", "Cacau"], preparo: "Misturar e gelar..." },
  { id: 5, nome: "Omelete Fit", categoria: "Proteína", emoji: "🍳", kcal: 240, proteina: 28, carbs: 5, gordura: 10, ingredientes: ["3 Ovos", "Espinafre"], preparo: "Grelhar omelete..." },
  { id: 6, nome: "Sorvete de Banana", categoria: "Doce Fit", emoji: "🍌", kcal: 200, proteina: 20, carbs: 25, gordura: 2, ingredientes: ["Banana congelada", "Whey"], preparo: "Triturar..." },
];

const categories = ["Emagrecimento", "Proteína", "Energia", "Doce Fit", "Shakes"];

export default function Recipes({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("Emagrecimento");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(r => 
    r.categoria === activeCategory && 
    r.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="recipes" className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div>
            <GlpyLogo />
            <p className="text-xs text-text-muted">Receitas do protocolo</p>
          </div>
        </div>
      </div>
      <div className="px-5">

      {/* Search Filter */}
      <input 
        type="text" 
        placeholder="Buscar receita..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-3 rounded-full border border-border mb-6 focus:outline-none focus:border-primary"
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-pill text-xs font-bold whitespace-nowrap transition-all ${activeCategory === c ? "bg-primary text-white" : "bg-white border border-border"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredRecipes.map(r => (
          <motion.div key={r.id} onClick={() => setSelectedRecipe(r)} className="bg-white p-4 rounded-3xl shadow-sm border border-border cursor-pointer hover:border-primary transition">
            <div className="text-4xl mb-3 bg-border/20 p-3 rounded-2xl w-fit">{r.emoji}</div>
            <h3 className="font-bold text-sm mb-1">{r.nome}</h3>
            <div className="flex gap-2 mt-3">
              <div className="bg-urgent/10 text-urgent px-2 py-1 rounded-lg text-[10px] font-bold">{r.kcal} kcal</div>
              <div className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-[10px] font-bold">{r.proteina}g prot</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 bg-background z-50 p-6 overflow-y-auto"
          >
            <button onClick={() => setSelectedRecipe(null)} className="mb-6"><ChevronLeft /></button>
            <div className="text-8xl mb-6 bg-border/20 p-8 rounded-3xl w-fit mx-auto">{selectedRecipe.emoji}</div>
            <h2 className="text-3xl font-bold mb-4">{selectedRecipe.nome}</h2>
            <div className="flex gap-4 mb-6">
              <div className="bg-urgent/10 text-center p-3 rounded-2xl flex-1 border border-urgent/20"><p className="text-urgent font-bold text-lg">{selectedRecipe.kcal}</p><p className="text-xs text-urgent/80 font-bold">kcal</p></div>
              <div className="bg-primary/10 text-center p-3 rounded-2xl flex-1 border border-primary/20"><p className="text-primary font-bold text-lg">{selectedRecipe.proteina}g</p><p className="text-xs text-primary/80 font-bold">prot</p></div>
            </div>
            
            <h3 className="font-bold mb-2">Ingredientes</h3>
            <ul className="list-disc list-inside text-sm text-text-muted mb-6">
              {selectedRecipe.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
            
            <h3 className="font-bold mb-2">Preparo</h3>
            <p className="text-sm text-text-muted mb-8">{selectedRecipe.preparo}</p>

            <button className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-pill mb-4"><ShoppingBag className="w-5 h-5" /> Comprar ingredientes</button>
            <button className="w-full flex items-center justify-center gap-2 bg-white border border-primary text-primary font-bold py-4 rounded-pill mb-24"><CheckCircle className="w-5 h-5" /> Marcar como feita</button>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
      <BottomNav active="recipes" onNavigate={onNavigate} />
    </div>
  );
}
