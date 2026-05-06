import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, ShoppingBag, CheckCircle2, Circle, Award, Share2 } from "lucide-react";
import BottomNav from "./BottomNav";

function calcMetas(peso: number, altura: number) {
  const tmb = 10 * peso + 6.25 * altura - 5 * 30 - 161;
  const tdee = tmb * 1.2;
  const kcal = Math.round(tdee - 500);
  const proteina = Math.round(peso * 1.8);
  const gordura = Math.round((kcal * 0.25) / 9);
  const carbs = Math.round((kcal - proteina * 4 - gordura * 9) / 4);
  const agua = Math.round(peso * 35);
  return { kcal, proteina, gordura, carbs, agua };
}

export interface Receita {
  id: number;
  emoji: string;
  nome: string;
  kcal: number;
  proteina: number;
  carbs: number;
  gordura: number;
  categoria: string;
  desc: string;
  ingredientes: string[];
  preparo: string;
  glp1tip: string;
  dias: number[];
}

export interface Dia {
  n: number;
  titulo: string;
  video: string;
  explicacao: string;
  missoes: { texto: string; sub: string }[];
  checkin: string[];
  ia: Record<string, string>;
  receita_id: number;
  recompensa: string;
  xp: number;
}

interface Props {
  n: number;
  emoji: string;
  nome: string;
  storageKey: string;
  receitas: Receita[];
  dias: Dia[];
  onNavigate: (screen: string) => void;
}

export default function ProtocoloBase({ n, emoji, nome, storageKey, receitas, dias, onNavigate }: Props) {
  const [diaAtual, setDiaAtual] = useState<number>(() =>
    parseInt(localStorage.getItem(`${storageKey}_dia`) || "0", 10)
  );
  const [aba, setAba] = useState<"protocolo" | "receitas">("protocolo");
  const [checkinSelecionado, setCheckinSelecionado] = useState<string | null>(null);
  const [missoesMarcadas, setMissoesMarcadas] = useState<number[]>(() => {
    const s = localStorage.getItem(`${storageKey}_missoes`);
    return s ? JSON.parse(s) : [];
  });
  const [concluido, setConcluido] = useState<boolean>(() =>
    localStorage.getItem(`${storageKey}_concluido`) === "true"
  );
  const [receitaAberta, setReceitaAberta] = useState<number | null>(null);

  useEffect(() => { localStorage.setItem(`${storageKey}_dia`, String(diaAtual)); }, [diaAtual, storageKey]);
  useEffect(() => { localStorage.setItem(`${storageKey}_missoes`, JSON.stringify(missoesMarcadas)); }, [missoesMarcadas, storageKey]);
  useEffect(() => { localStorage.setItem(`${storageKey}_concluido`, String(concluido)); }, [concluido, storageKey]);

  const peso = parseFloat(localStorage.getItem("glpy_peso_atual") || "75");
  const altura = parseFloat(localStorage.getItem("glpy_altura") || "165");
  const metas = calcMetas(peso, altura);

  const dia = dias[diaAtual];
  const receita = receitas.find(r => r.id === dia.receita_id)!;
  const receitaDetalhe = receitaAberta !== null ? receitas.find(r => r.id === receitaAberta) : null;

  const toggleMissao = (i: number) => {
    setMissoesMarcadas(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const formatMissao = (texto: string) =>
    texto.replace("{proteina}", String(metas.proteina)).replace("{agua}", String(metas.agua));

  const handleConcluir = () => {
    setConcluido(true);
    setCheckinSelecionado(null);
    setMissoesMarcadas([]);
  };

  const handleShare = async () => {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const el = document.getElementById("protocol-share-card");
      if (!el) return;
      const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "progresso-glpy.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ title: `${emoji} ${nome} — Dia ${diaAtual + 1}/7`, files: [file] });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "progresso-glpy.png"; a.click();
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch {}
  };

  const proximoDia = () => {
    if (diaAtual < 6) {
      setDiaAtual(diaAtual + 1);
      setConcluido(false);
      setCheckinSelecionado(null);
      setMissoesMarcadas([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">

      {/* Header */}
      <div id="protocol-share-card" className="bg-white px-5 pt-12 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => onNavigate("protocolHub")} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div className="flex-grow">
            <p className="text-xs text-text-muted font-medium">Protocolo {n}</p>
            <h1 className="font-bold text-base leading-tight">{emoji} {nome}</h1>
          </div>
          <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
            Dia {diaAtual + 1}/7
          </div>
          <button onClick={handleShare} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center">
            <Share2 className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="flex gap-1.5">
          {dias.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDiaAtual(i); setConcluido(false); setCheckinSelecionado(null); setMissoesMarcadas([]); }}
              className={`h-2 flex-1 rounded-full transition-all ${i <= diaAtual ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          {(["protocolo", "receitas"] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${aba === a ? "bg-primary text-white" : "bg-[#F4F6F8] text-text-muted"}`}>
              {a === "protocolo" ? "📋 Protocolo" : "🍳 Receitas"}
            </button>
          ))}
        </div>
      </div>

      {/* Metas */}
      <div className="px-5 pt-4">
        <div className="bg-white border border-border rounded-2xl p-3 mb-4 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Suas metas de hoje</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Kcal", value: metas.kcal, color: "text-red-500" },
              { label: "Prot", value: `${metas.proteina}g`, color: "text-primary" },
              { label: "Gord", value: `${metas.gordura}g`, color: "text-violet-500" },
              { label: "Água", value: `${Math.round(metas.agua / 1000 * 10) / 10}L`, color: "text-sky-500" },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className={`font-black text-base ${m.color}`}>{m.value}</p>
                <p className="text-xs text-text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {aba === "protocolo" && (
          <motion.div key="protocolo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 space-y-4 pb-4">

            <div className="bg-[#0A1628] rounded-2xl p-4">
              <p className="text-xs text-primary font-bold mb-1">Dia {dia.n}</p>
              <h2 className="font-bold text-white text-base leading-snug">{dia.titulo}</h2>
            </div>

            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="relative bg-[#0A1628] h-40 flex items-center justify-center">
                <div className="absolute top-3 right-3 bg-white/10 text-white text-xs px-2 py-1 rounded-full">35s</div>
                <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-white fill-white" />
                </button>
                <div className="absolute bottom-3 left-3 text-white text-xs font-medium opacity-70">Roteiro do dia</div>
              </div>
              <div className="p-4">
                <p className="text-sm text-text-muted leading-relaxed italic whitespace-pre-line">{dia.video}</p>
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Por que isso importa</p>
              <p className="text-sm text-text-main leading-relaxed">{dia.explicacao}</p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Missões do dia</p>
              <div className="space-y-2.5">
                {dia.missoes.map((m, i) => {
                  const done = missoesMarcadas.includes(i);
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => toggleMissao(i)}
                      className={`w-full flex gap-3 p-3 rounded-xl border text-left transition-all ${done ? "bg-primary/5 border-primary/20" : "bg-[#F4F6F8] border-transparent"}`}>
                      {done
                        ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        : <Circle className="w-5 h-5 text-border flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-sm font-semibold ${done ? "line-through text-text-muted" : "text-text-main"}`}>{m.texto}</p>
                        <p className="text-xs text-text-muted mt-0.5">{formatMissao(m.sub)}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#E6FBF3] border border-primary/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Receita do dia</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{receita.emoji}</span>
                <div className="flex-grow">
                  <p className="font-bold text-sm text-text-main">{receita.nome}</p>
                  <p className="text-xs text-text-muted">{receita.kcal} kcal · {receita.proteina}g prot</p>
                </div>
                <button onClick={() => { setReceitaAberta(receita.id); setAba("receitas"); }}
                  className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-full">
                  Ver →
                </button>
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Check-in do dia</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {dia.checkin.map(opt => (
                  <button key={opt} onClick={() => setCheckinSelecionado(opt)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${checkinSelecionado === opt ? "bg-primary text-white border-primary" : "bg-[#F4F6F8] border-transparent text-text-main"}`}>
                    {opt}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {checkinSelecionado && dia.ia[checkinSelecionado] && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                    <div className="flex gap-2 mb-1"><span>🤖</span><span className="text-xs font-bold text-primary">GLPY.IA</span></div>
                    <p className="text-xs text-text-main leading-relaxed">{dia.ia[checkinSelecionado]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-bold text-amber-700 text-sm">{dia.recompensa}</p>
                <p className="text-xs text-amber-600 mt-0.5">+{dia.xp} XP ao concluir</p>
              </div>
            </div>

            {!concluido ? (
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleConcluir}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base">
                ✅ Concluir Dia {dia.n}
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center">
                  <p className="font-bold text-primary">🏆 +{dia.xp} XP conquistados!</p>
                  {diaAtual < 6
                    ? <p className="text-xs text-text-muted mt-1">Dia {diaAtual + 2} desbloqueado</p>
                    : <p className="text-xs text-text-muted mt-1">Protocolo completo!</p>}
                </div>
                {diaAtual < 6 ? (
                  <button onClick={proximoDia}
                    className="w-full bg-[#0A1628] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                    Ir para o Dia {diaAtual + 2} <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => onNavigate("protocolHub")}
                    className="w-full bg-[#0A1628] text-white font-bold py-4 rounded-2xl">
                    🏆 Ver próximo protocolo
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {aba === "receitas" && (
          <motion.div key="receitas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4 space-y-3 pt-2">
            {receitaDetalhe ? (
              <div className="space-y-3">
                <button onClick={() => setReceitaAberta(null)} className="flex items-center gap-2 text-sm text-text-muted font-medium">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                  <div className="text-center mb-4">
                    <span className="text-5xl">{receitaDetalhe.emoji}</span>
                    <h2 className="font-bold text-xl mt-2">{receitaDetalhe.nome}</h2>
                    <p className="text-xs text-text-muted mt-1">{receitaDetalhe.categoria}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: "Kcal", v: receitaDetalhe.kcal, c: "text-red-500", bg: "bg-red-50" },
                      { l: "Prot", v: `${receitaDetalhe.proteina}g`, c: "text-primary", bg: "bg-primary/8" },
                      { l: "Carbs", v: `${receitaDetalhe.carbs}g`, c: "text-amber-500", bg: "bg-amber-50" },
                      { l: "Gord", v: `${receitaDetalhe.gordura}g`, c: "text-violet-500", bg: "bg-violet-50" },
                    ].map(m => (
                      <div key={m.l} className={`${m.bg} rounded-xl p-2.5 text-center`}>
                        <p className={`font-black text-base ${m.c}`}>{m.v}</p>
                        <p className="text-xs text-text-muted">{m.l}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">{receitaDetalhe.desc}</p>
                  <div className="mb-4">
                    <p className="font-bold text-sm mb-2">Ingredientes</p>
                    {receitaDetalhe.ingredientes.map((ing, i) => (
                      <div key={i} className="flex gap-2 py-1.5 border-b border-border last:border-0">
                        <span className="text-primary text-xs mt-0.5">•</span>
                        <span className="text-sm text-text-main">{ing}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4">
                    <p className="font-bold text-sm mb-2">Preparo</p>
                    <p className="text-sm text-text-muted leading-relaxed">{receitaDetalhe.preparo}</p>
                  </div>
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                    <div className="flex gap-2 mb-1"><span>🤖</span><span className="text-xs font-bold text-primary">GLPY.IA</span></div>
                    <p className="text-xs text-text-main leading-relaxed">{receitaDetalhe.glp1tip}</p>
                  </div>
                </div>
                <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md">
                  <ShoppingBag className="w-4 h-4" /> Comprar ingredientes — PedeZap
                </button>
              </div>
            ) : (
              receitas.map(r => (
                <button key={r.id} onClick={() => setReceitaAberta(r.id)}
                  className="w-full bg-white border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3 text-left hover:border-primary/30 transition">
                  <span className="text-3xl flex-shrink-0">{r.emoji}</span>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-text-main">{r.nome}</p>
                    <p className="text-xs text-text-muted">{r.kcal} kcal · {r.proteina}g prot · {r.categoria}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {r.dias.includes(diaAtual + 1) && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Hoje</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="protocolHub" onNavigate={onNavigate} />
    </div>
  );
}
