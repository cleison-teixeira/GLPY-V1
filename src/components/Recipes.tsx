import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ShoppingBag, CheckCircle } from "lucide-react";
import BottomNav from "./BottomNav";
import { GLPYHeader } from "./ui";

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
  {
    id: 1, nome: "Panqueca Proteica de Aveia", categoria: "Emagrecimento", emoji: "🥞",
    kcal: 280, proteina: 22, carbs: 18, gordura: 8,
    ingredientes: ["2 ovos inteiros", "4 colheres de aveia em flocos", "1 scoop de whey sabor baunilha (30g)", "1 banana pequena madura", "Canela a gosto"],
    preparo: "1. Amasse a banana com garfo. 2. Misture todos os ingredientes até formar uma massa homogênea. 3. Aqueça frigideira antiaderente em fogo médio-baixo com fio de azeite. 4. Despeje porções médias e cozinhe 2 min de cada lado. 5. Sirva com frutas vermelhas ou mel.",
  },
  {
    id: 2, nome: "Bowl Anti-Rebote", categoria: "Emagrecimento", emoji: "🥗",
    kcal: 380, proteina: 35, carbs: 22, gordura: 14,
    ingredientes: ["150g de frango grelhado desfiado", "50g de quinoa cozida", "½ abacate pequeno (70g)", "Folhas de rúcula a vontade", "½ tomate cereja", "Limão, sal e azeite extravirgem"],
    preparo: "1. Cozinhe a quinoa conforme embalagem (fica pronta em 15 min). 2. Grelhe o frango temperado com sal, pimenta e alho em pó. 3. Monte o bowl: quinoa na base, frango, abacate fatiado, rúcula e tomates. 4. Tempere com suco de limão, fio de azeite e sal. 5. Consuma imediatamente.",
  },
  {
    id: 3, nome: "Frango com Batata-Doce", categoria: "Emagrecimento", emoji: "🍗",
    kcal: 420, proteina: 38, carbs: 35, gordura: 9,
    ingredientes: ["200g de filé de frango", "150g de batata-doce", "1 colher de azeite", "Alho, sal, páprica e orégano"],
    preparo: "1. Corte a batata-doce em cubos e asse no forno a 200°C por 25 min com fio de azeite e sal. 2. Tempere o frango com alho amassado, páprica, orégano e sal. 3. Grelhe em frigideira quente 5-7 min de cada lado. 4. Sirva com a batata e legumes cozidos.",
  },
  {
    id: 4, nome: "Omelete Fit de Espinafre", categoria: "Proteína", emoji: "🍳",
    kcal: 240, proteina: 28, carbs: 4, gordura: 12,
    ingredientes: ["3 ovos inteiros", "1 xícara de espinafre fresco", "30g de queijo cottage", "½ tomate picado", "Sal, pimenta e azeite"],
    preparo: "1. Bata os ovos com sal e pimenta. 2. Refogue espinafre no azeite por 2 min até murchar. 3. Despeje os ovos sobre o espinafre. 4. Adicione tomate e cottage. 5. Dobre ao meio quando as bordas firmarem. Cozinhe mais 1 min e sirva.",
  },
  {
    id: 5, nome: "Peito de Peru com Ovo", categoria: "Proteína", emoji: "🥚",
    kcal: 210, proteina: 30, carbs: 2, gordura: 9,
    ingredientes: ["3 fatias de peito de peru (80g)", "2 ovos mexidos", "Folhas de alface", "Tomate", "Mostarda sem açúcar"],
    preparo: "1. Mexa os ovos em frigideira antiaderente com sal. 2. Disponha as fatias de peito de peru. 3. Monte o prato com alface, tomate e uma colher de mostarda. Refeição pronta em 5 minutos.",
  },
  {
    id: 6, nome: "Shake Anti-Fraqueza", categoria: "Energia", emoji: "🥤",
    kcal: 290, proteina: 26, carbs: 24, gordura: 6,
    ingredientes: ["200ml de leite vegetal (amêndoas ou aveia)", "1 scoop de whey baunilha (30g)", "1 banana pequena congelada", "1 colher de pasta de amendoim integral", "Cubos de gelo"],
    preparo: "1. Congele a banana com antecedência (mínimo 2h). 2. Coloque todos os ingredientes no liquidificador. 3. Bata por 30 segundos até cremoso. 4. Consuma imediatamente — ideal como pré-treino ou café da manhã rápido.",
  },
  {
    id: 7, nome: "Café Proteico com Aveia", categoria: "Energia", emoji: "☕",
    kcal: 260, proteina: 18, carbs: 28, gordura: 7,
    ingredientes: ["200ml de café coado forte (frio)", "1 scoop de whey sabor café ou chocolate", "4 colheres de aveia em flocos finos", "100ml de leite desnatado", "Gelo"],
    preparo: "1. Prepare o café e deixe esfriar. 2. Bata no liquidificador com o leite, whey e gelo. 3. Sirva sobre a aveia no copo. 4. Misture com colher antes de beber. Ótimo para manhãs sem fome (efeito GLP-1).",
  },
  {
    id: 8, nome: "Mousse de Cacau com Whey", categoria: "Doce Fit", emoji: "🍫",
    kcal: 185, proteina: 19, carbs: 12, gordura: 5,
    ingredientes: ["200g de iogurte grego integral (0% adição de açúcar)", "1 scoop de whey chocolate (25g)", "1 colher de cacau em pó 100%", "Gotas de adoçante steviosídeo", "Granola sem açúcar para finalizar (opcional)"],
    preparo: "1. Misture iogurte, whey e cacau em um pote com garfo ou fouet. 2. Ajuste o dulçor com adoçante. 3. Leve à geladeira por 30 min para firmar. 4. Finalize com granola antes de servir. Guarda bem por até 2 dias na geladeira.",
  },
  {
    id: 9, nome: "Sorvete de Banana com Whey", categoria: "Doce Fit", emoji: "🍌",
    kcal: 200, proteina: 20, carbs: 22, gordura: 3,
    ingredientes: ["2 bananas maduras congeladas", "1 scoop de whey baunilha (25g)", "2 colheres de leite desnatado", "Canela a gosto"],
    preparo: "1. Congele as bananas fatiadas (mínimo 4h, idealmente de véspera). 2. Coloque no processador com leite e whey. 3. Processe até cremoso — raspe as bordas se necessário. 4. Sirva imediatamente (textura de sorvete mole) ou leve ao freezer por mais 1h.",
  },
  {
    id: 10, nome: "Shake Verde Detox", categoria: "Shakes", emoji: "🌿",
    kcal: 195, proteina: 22, carbs: 16, gordura: 4,
    ingredientes: ["1 xícara de espinafre fresco (40g)", "½ pepino com casca", "½ limão (suco)", "1 scoop de whey sabor neutro ou baunilha", "200ml de água de coco", "1 pedaço de gengibre (1cm)"],
    preparo: "1. Higienize bem o espinafre e o pepino. 2. Bata todos os ingredientes no liquidificador por 40 segundos. 3. Não coe para preservar as fibras. 4. Beba imediatamente — antioxidantes se degradam em contato com o ar.",
  },
  {
    id: 11, nome: "Shake Pós-Treino Rápido", categoria: "Shakes", emoji: "💪",
    kcal: 310, proteina: 32, carbs: 28, gordura: 6,
    ingredientes: ["1 scoop de whey concentrado ou isolado (30g)", "250ml de leite semidesnatado", "1 banana média (100g)", "1 colher de mel puro", "Gelo a gosto"],
    preparo: "1. Bata tudo no liquidificador por 20 segundos. 2. Consuma nos primeiros 30 minutos após o treino — esse é a janela ideal de absorção de proteína e carboidrato. 3. Se não tiver liquidificador, use coqueteleira com banana amassada.",
  },
  {
    id: 12, nome: "Shake Noturno Anti-Catabolismo", categoria: "Shakes", emoji: "🌙",
    kcal: 220, proteina: 24, carbs: 10, gordura: 8,
    ingredientes: ["200ml de leite integral morno", "1 scoop de caseína ou whey (25g)", "1 colher de pasta de amendoim integral", "Canela e baunilha"],
    preparo: "1. Aqueça o leite (não ferver). 2. Misture a proteína no leite morno com fouet. 3. Adicione pasta de amendoim e temperos. 4. Beba 30 min antes de dormir. A caseína libera aminoácidos lentamente — perfeito para proteger o músculo durante o sono.",
  },
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
    <div id="recipes" className="min-h-screen bg-[#F4F6F8] text-text-main pb-24 max-w-[430px] mx-auto md:rounded-[40px] md:ring-1 md:ring-black/10 md:shadow-[0_24px_64px_rgba(0,0,0,0.14)] md:overflow-hidden">
      <div className="bg-white px-5 pt-6 border-b border-border mb-5">
        <GLPYHeader
          title="Receitas"
          subtitle="Receitas do protocolo"
          showBranding={true}
          onBack={() => {
            const returnTo = sessionStorage.getItem('glpy_return_to');
            sessionStorage.removeItem('glpy_return_to');
            onNavigate(returnTo === 'hub' ? 'hub' : 'dashboard');
          }}
        />
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
            className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background z-50 md:rounded-[40px] md:ring-1 md:ring-black/10 md:shadow-[0_24px_64px_rgba(0,0,0,0.14)] md:overflow-hidden"
          >
            <div className="h-full overflow-y-auto p-6">
              <button onClick={() => setSelectedRecipe(null)} className="mb-6"><ChevronLeft /></button>
              <div className="text-5xl mb-4 bg-border/20 p-5 rounded-3xl w-fit mx-auto">{selectedRecipe.emoji}</div>
              <h2 className="text-2xl font-bold mb-4">{selectedRecipe.nome}</h2>
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
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-primary text-primary font-bold py-4 rounded-pill mb-6"><CheckCircle className="w-5 h-5" /> Marcar como feita</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
      <BottomNav active="receitas" onNavigate={onNavigate} />
    </div>
  );
}
