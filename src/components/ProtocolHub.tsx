import { motion } from "motion/react";
import { ChevronRight, Lock } from "lucide-react";
import BottomNav from "./BottomNav";

const PROTOCOLOS = [
  {
    id: "antiRebote",
    n: 4,
    emoji: "⚖️",
    nome: "Anti-Rebote",
    desc: "Trave o efeito rebote em 7 dias com ciência",
    dias: 7,
    desbloqueado: true,
    cor: "#00C27A",
    corLight: "#E6FBF3",
  },
  {
    id: "protocolDay",
    n: 1,
    emoji: "💉",
    nome: "Sobrevivendo às Canetas",
    desc: "Protocolo de adaptação — primeiras semanas",
    dias: 7,
    desbloqueado: true,
    cor: "#7660FF",
    corLight: "#F0EEFF",
  },
  {
    id: "protocolDay",
    n: 2,
    emoji: "🥗",
    nome: "Nutrição Anti-Perda Muscular",
    desc: "Preserva músculo durante o emagrecimento rápido",
    dias: 7,
    desbloqueado: true,
    cor: "#F5A623",
    corLight: "#FFF8ED",
  },
  {
    id: "planos",
    n: 3,
    emoji: "🧠",
    nome: "Anti-Queda de Cabelo",
    desc: "Protocolo nutricional para queda causada por GLP-1",
    dias: 7,
    desbloqueado: false,
    cor: "#E8445A",
    corLight: "#FEF0F2",
  },
  {
    id: "planos",
    n: 5,
    emoji: "😴",
    nome: "Sono e Recuperação",
    desc: "Melhora o sono prejudicado pelo GLP-1",
    dias: 7,
    desbloqueado: false,
    cor: "#3B82F6",
    corLight: "#EFF6FF",
  },
  {
    id: "planos",
    n: 6,
    emoji: "💪",
    nome: "Massa Muscular no GLP-1",
    desc: "Construa músculo enquanto emagrece",
    dias: 7,
    desbloqueado: false,
    cor: "#10B981",
    corLight: "#ECFDF5",
  },
  {
    id: "planos",
    n: 7,
    emoji: "🧬",
    nome: "Regulação Hormonal",
    desc: "Equilibra os hormônios impactados pelo tratamento",
    dias: 7,
    desbloqueado: false,
    cor: "#8B5CF6",
    corLight: "#F5F3FF",
  },
  {
    id: "planos",
    n: 8,
    emoji: "🫁",
    nome: "Saúde Metabólica",
    desc: "Otimiza resistência à insulina e inflamação",
    dias: 7,
    desbloqueado: false,
    cor: "#EC4899",
    corLight: "#FDF2F8",
  },
  {
    id: "planos",
    n: 9,
    emoji: "📊",
    nome: "Manutenção Inteligente",
    desc: "Estratégias para manter o peso após a meta",
    dias: 14,
    desbloqueado: false,
    cor: "#F59E0B",
    corLight: "#FFFBEB",
  },
  {
    id: "planos",
    n: 10,
    emoji: "🔄",
    nome: "Transição — Parar a Caneta",
    desc: "Como sair do GLP-1 sem recuperar o peso",
    dias: 21,
    desbloqueado: false,
    cor: "#EF4444",
    corLight: "#FEF2F2",
  },
];

export default function ProtocolHub({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border">
        <h1 className="font-black text-2xl text-[#0A1628] leading-tight">Protocolos</h1>
        <p className="text-sm text-text-muted mt-1">Ciência aplicada ao tratamento GLP-1</p>
      </div>

      {/* Lista */}
      <div className="px-4 pt-4 space-y-3">
        {PROTOCOLOS.map((p, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: p.desbloqueado ? 0.98 : 1 }}
            onClick={() => onNavigate(p.desbloqueado ? p.id : "planos")}
            className="w-full text-left"
          >
            <div
              className="bg-white border rounded-2xl p-4 flex items-center gap-3 shadow-sm"
              style={{ borderColor: p.desbloqueado ? p.cor + "40" : "#E2EBE7" }}
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
                <p className="text-xs mt-1" style={{ color: p.desbloqueado ? p.cor : "#9CB3BF" }}>
                  {p.dias} dias
                </p>
              </div>

              {/* Ação */}
              <div className="flex-shrink-0">
                {p.desbloqueado
                  ? <ChevronRight className="w-5 h-5" style={{ color: p.cor }} />
                  : <Lock className="w-4 h-4 text-text-muted opacity-50" />
                }
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <BottomNav active="protocolHub" onNavigate={onNavigate} />
    </div>
  );
}
