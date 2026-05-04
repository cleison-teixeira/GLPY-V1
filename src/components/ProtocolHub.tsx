import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Lock, Play } from "lucide-react";
import BottomNav from "./BottomNav";

type Protocolo = {
  id: string;
  rota: string;
  n: number;
  emoji: string;
  nome: string;
  desc: string;
  dias: number;
  desbloqueado: boolean;
  cor: string;
  corLight: string;
};

const PROTOCOLOS: Protocolo[] = [
  {
    id: "antiRebote", rota: "antiRebote", n: 4,
    emoji: "⚖️", nome: "Anti-Rebote",
    desc: "Trave o efeito rebote em 7 dias com ciência",
    dias: 7, desbloqueado: true, cor: "#00C27A", corLight: "#E6FBF3",
  },
  {
    id: "sobrevivendo", rota: "protocolDay", n: 1,
    emoji: "💉", nome: "Sobrevivendo às Canetas",
    desc: "Protocolo de adaptação — primeiras semanas",
    dias: 7, desbloqueado: true, cor: "#7660FF", corLight: "#F0EEFF",
  },
  {
    id: "nutricao", rota: "protocolDay", n: 2,
    emoji: "🥗", nome: "Nutrição Anti-Perda Muscular",
    desc: "Preserva músculo durante o emagrecimento rápido",
    dias: 7, desbloqueado: true, cor: "#F5A623", corLight: "#FFF8ED",
  },
  {
    id: "cabelo", rota: "planos", n: 3,
    emoji: "🧠", nome: "Anti-Queda de Cabelo",
    desc: "Protocolo nutricional para queda causada por GLP-1",
    dias: 7, desbloqueado: false, cor: "#E8445A", corLight: "#FEF0F2",
  },
  {
    id: "sono", rota: "planos", n: 5,
    emoji: "😴", nome: "Sono e Recuperação",
    desc: "Melhora o sono prejudicado pelo GLP-1",
    dias: 7, desbloqueado: false, cor: "#3B82F6", corLight: "#EFF6FF",
  },
  {
    id: "massa", rota: "planos", n: 6,
    emoji: "💪", nome: "Massa Muscular no GLP-1",
    desc: "Construa músculo enquanto emagrece",
    dias: 7, desbloqueado: false, cor: "#10B981", corLight: "#ECFDF5",
  },
  {
    id: "hormonal", rota: "planos", n: 7,
    emoji: "🧬", nome: "Regulação Hormonal",
    desc: "Equilibra os hormônios impactados pelo tratamento",
    dias: 7, desbloqueado: false, cor: "#8B5CF6", corLight: "#F5F3FF",
  },
  {
    id: "metabolica", rota: "planos", n: 8,
    emoji: "🫁", nome: "Saúde Metabólica",
    desc: "Otimiza resistência à insulina e inflamação",
    dias: 7, desbloqueado: false, cor: "#EC4899", corLight: "#FDF2F8",
  },
  {
    id: "manutencao", rota: "planos", n: 9,
    emoji: "📊", nome: "Manutenção Inteligente",
    desc: "Estratégias para manter o peso após a meta",
    dias: 14, desbloqueado: false, cor: "#F59E0B", corLight: "#FFFBEB",
  },
  {
    id: "transicao", rota: "planos", n: 10,
    emoji: "🔄", nome: "Transição — Parar a Caneta",
    desc: "Como sair do GLP-1 sem recuperar o peso",
    dias: 21, desbloqueado: false, cor: "#EF4444", corLight: "#FEF2F2",
  },
];

export default function ProtocolHub({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [confirmar, setConfirmar] = useState<Protocolo | null>(null);

  const idAtivo = (() => {
    const raw = localStorage.getItem("glpy_protocolo_ativo");
    return raw ? JSON.parse(raw).id : "antiRebote";
  })();

  const handleClick = (p: Protocolo) => {
    if (!p.desbloqueado) {
      onNavigate("planos");
      return;
    }
    if (p.id === idAtivo) {
      onNavigate(p.rota);
    } else {
      setConfirmar(p);
    }
  };

  const confirmarTroca = () => {
    if (!confirmar) return;
    localStorage.setItem("glpy_protocolo_ativo", JSON.stringify({
      id: confirmar.id,
      nome: confirmar.nome,
      emoji: confirmar.emoji,
      totalDias: confirmar.dias,
    }));
    setConfirmar(null);
    onNavigate(confirmar.rota);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border">
        <h1 className="font-black text-2xl text-[#0A1628] leading-tight">Protocolos</h1>
        <p className="text-sm text-text-muted mt-1">Ciência aplicada ao tratamento GLP-1</p>
      </div>

      {/* Lista */}
      <div className="px-4 pt-4 space-y-3">
        {PROTOCOLOS.map((p) => {
          const isAtivo = p.id === idAtivo;
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: p.desbloqueado ? 0.98 : 1 }}
              onClick={() => handleClick(p)}
              className="w-full text-left"
            >
              <div
                className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                style={{ borderColor: isAtivo ? p.cor : p.desbloqueado ? p.cor + "40" : "#E2EBE7" }}
              >
                {/* Número */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base font-black"
                  style={{ background: p.desbloqueado ? p.corLight : "#F4F6F8", color: p.desbloqueado ? p.cor : "#9CB3BF" }}
                >
                  {p.n}
                </div>

                {/* Emoji + Texto */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none">{p.emoji}</span>
                    <p className={`font-bold text-sm truncate ${p.desbloqueado ? "text-[#0A1628]" : "text-text-muted"}`}>
                      {p.nome}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 leading-snug line-clamp-1">{p.desc}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs" style={{ color: p.desbloqueado ? p.cor : "#9CB3BF" }}>
                      {p.dias} dias
                    </p>
                    {isAtivo && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: p.corLight, color: p.cor }}
                      >
                        ▶ Em andamento
                      </span>
                    )}
                  </div>
                </div>

                {/* Ação */}
                <div className="flex-shrink-0">
                  {!p.desbloqueado
                    ? <Lock className="w-4 h-4 text-text-muted opacity-50" />
                    : isAtivo
                    ? <Play className="w-4 h-4" style={{ color: p.cor }} />
                    : <ChevronRight className="w-5 h-5" style={{ color: p.cor }} />
                  }
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <BottomNav active="protocolHub" onNavigate={onNavigate} />

      {/* Modal de confirmação de troca */}
      <AnimatePresence>
        {confirmar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setConfirmar(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm mb-2"
            >
              <div className="text-center mb-5">
                <span className="text-5xl">{confirmar.emoji}</span>
                <h2 className="font-bold text-lg mt-3 text-[#0A1628]">Trocar de protocolo?</h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Deseja trocar para <strong className="text-[#0A1628]">{confirmar.nome}</strong>?<br />
                  Seu progresso atual será pausado.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmar(null)}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold text-text-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarTroca}
                  className="flex-1 py-3.5 rounded-2xl text-white text-sm font-semibold"
                  style={{ background: confirmar.cor }}
                >
                  Trocar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
