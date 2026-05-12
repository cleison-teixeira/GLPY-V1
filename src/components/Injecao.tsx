import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, ChevronLeft, RotateCcw } from "lucide-react";
import BottomNav from "./BottomNav";
import { dispararConfetti } from "../utils/confetti";

type HistItem = { id: string; label: string; data: string };

const PONTOS = [
  { id: "abd-esq",   label: "Abdômen Esq.", cx: 70,  cy: 218, desc: "5cm à esquerda do umbigo" },
  { id: "abd-dir",   label: "Abdômen Dir.", cx: 130, cy: 218, desc: "5cm à direita do umbigo" },
  { id: "coxa-esq",  label: "Coxa Esq.",    cx: 46,  cy: 345, desc: "Face anterior da coxa esquerda" },
  { id: "coxa-dir",  label: "Coxa Dir.",    cx: 154, cy: 345, desc: "Face anterior da coxa direita" },
  { id: "braco-esq", label: "Braço Esq.",   cx: 22,  cy: 138, desc: "Lateral do braço esquerdo" },
  { id: "braco-dir", label: "Braço Dir.",   cx: 178, cy: 138, desc: "Lateral do braço direito" },
];

const hoje = new Date().toISOString().split('T')[0];
const fmtData = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export default function Injecao({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [historico, setHistorico] = useState<HistItem[]>(() => {
    const s = localStorage.getItem("glpy_injecao_locais");
    return s ? JSON.parse(s) : [];
  });
  const [toast, setToast] = useState<string | null>(null);
  const [infoAtivo, setInfoAtivo] = useState<string | null>(null);
  const [showXP, setShowXP] = useState(false);

  const usadosHoje = new Set(historico.filter(h => h.data === hoje).map(h => h.id));

  const ultimoUso = (id: string) => {
    const item = historico.find(h => h.id === id);
    return item ? fmtData(item.data) : null;
  };

  const clicarPonto = (p: typeof PONTOS[0]) => {
    if (infoAtivo === p.id) { setInfoAtivo(null); return; }
    if (usadosHoje.has(p.id)) { setInfoAtivo(p.id); return; }
    const novoItem: HistItem = { id: p.id, label: p.label, data: hoje };
    const novo = [novoItem, ...historico.filter(h => !(h.id === p.id && h.data === hoje))].slice(0, 28);
    setHistorico(novo);
    localStorage.setItem("glpy_injecao_locais", JSON.stringify(novo));
    setInfoAtivo(p.id);
    setToast(`✓ ${p.label} marcado para hoje`);
    setTimeout(() => setToast(null), 2500);

    // Confetti + XP ao registrar aplicação
    dispararConfetti();
    const xpAtual = parseInt(localStorage.getItem("glpy_xp") || "0", 10);
    localStorage.setItem("glpy_xp", String(xpAtual + 5));
    setShowXP(true);
    setTimeout(() => setShowXP(false), 1500);
  };

  const proximoRecomendado = (() => {
    if (historico.length === 0) return PONTOS[0];
    const lastId = historico[0]?.id;
    const idx = PONTOS.findIndex(p => p.id === lastId);
    return PONTOS[(idx + 1) % PONTOS.length];
  })();

  const ultimos7 = historico.slice(0, 7);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">

      {/* XP flutuante */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 bg-primary text-white font-black text-2xl px-6 py-3 rounded-2xl shadow-xl pointer-events-none"
          >
            +5 XP ⚡
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3">
        <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div>
          <h1 className="font-black text-xl text-[#0A1628]">Controle de Injeção</h1>
          <p className="text-xs text-text-muted">Toque no local de hoje para registrar</p>
        </div>
      </div>

      <div className="p-5 space-y-4">

        {/* Próxima dose */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-grow">
            <p className="text-xs text-text-muted font-medium">Próxima dose</p>
            <p className="font-bold text-sm text-[#0A1628]">05 de Maio · 08:00</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted font-medium">Recomendado hoje</p>
            <p className="text-xs font-bold text-primary">{proximoRecomendado.label}</p>
          </div>
        </div>

        {/* SVG Silhueta */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
            Locais de Aplicação — toque para registrar
          </p>

          <div className="flex justify-center">
            <svg
              viewBox="0 0 200 440"
              style={{ maxHeight: 360, width: '100%', maxWidth: 200 }}
              aria-label="Silhueta corporal com pontos de injeção"
            >
              <defs>
                <style>{`
                  @keyframes ring-pulse {
                    0%, 100% { r: 13; opacity: 0.35; }
                    50% { r: 17; opacity: 0.12; }
                  }
                `}</style>
              </defs>

              {/* ── SILHUETA ── */}
              {/* Cabeça */}
              <ellipse cx="100" cy="34" rx="22" ry="26" fill="#C8D4D0" />
              {/* Cabelo */}
              <ellipse cx="100" cy="18" rx="24" ry="13" fill="#5C3D2E" />
              <rect x="78" y="14" width="9" height="32" rx="4.5" fill="#5C3D2E" />
              <rect x="113" y="14" width="9" height="32" rx="4.5" fill="#5C3D2E" />
              {/* Pescoço */}
              <rect x="92" y="58" width="16" height="17" rx="3" fill="#C8D4D0" />
              {/* Torso superior */}
              <path d="M46 75 Q58 66 92 70 L108 70 Q142 66 154 75 Q170 90 168 138 L160 170 Q142 184 100 184 Q58 184 40 170 L32 138 Q30 90 46 75Z" fill="#C8D4D0" />
              {/* Braço esquerdo */}
              <path d="M44 82 Q26 94 18 130 Q12 160 20 195" stroke="#C8D4D0" strokeWidth="24" strokeLinecap="round" fill="none" />
              {/* Braço direito */}
              <path d="M156 82 Q174 94 182 130 Q188 160 180 195" stroke="#C8D4D0" strokeWidth="24" strokeLinecap="round" fill="none" />
              {/* Torso inferior */}
              <path d="M40 168 Q34 210 32 248 L168 248 Q166 210 160 168Z" fill="#C8D4D0" />
              {/* Quadril */}
              <path d="M32 246 Q24 272 22 288 L178 288 Q176 272 168 246Z" fill="#C8D4D0" />
              {/* Perna esquerda */}
              <path d="M22 286 Q16 320 16 360 Q16 400 22 430 L72 430 Q72 400 72 360 Q74 320 78 286Z" fill="#C8D4D0" />
              {/* Perna direita */}
              <path d="M178 286 Q184 320 184 360 Q184 400 178 430 L128 430 Q128 400 128 360 Q126 320 122 286Z" fill="#C8D4D0" />

              {/* ── PONTOS DE INJEÇÃO ── */}
              {PONTOS.map(p => {
                const usado = usadosHoje.has(p.id);
                const ativo = infoAtivo === p.id;
                return (
                  <g key={p.id} onClick={() => clicarPonto(p)} style={{ cursor: 'pointer' }}>
                    {/* Anel pulsante (só quando não usado) */}
                    {!usado && (
                      <circle cx={p.cx} cy={p.cy} r="13" fill="#00C27A" opacity="0.25">
                        <animate attributeName="r" values="11;16;11" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.08;0.3" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Ponto principal */}
                    <circle
                      cx={p.cx} cy={p.cy} r="9"
                      fill={usado ? "#E8445A" : "#00C27A"}
                      stroke="white" strokeWidth="2.5"
                    />
                    {/* Ícone interno */}
                    {usado
                      ? <text x={p.cx} y={p.cy + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">✓</text>
                      : <circle cx={p.cx} cy={p.cy} r="3" fill="white" opacity="0.9" />
                    }
                    {/* Tooltip / balloon quando ativo */}
                    {ativo && (
                      <g>
                        <rect
                          x={p.cx > 100 ? p.cx - 90 : p.cx + 12}
                          y={p.cy - 22}
                          width={78} height={26} rx="6"
                          fill="#0A1628"
                        />
                        <text
                          x={p.cx > 100 ? p.cx - 51 : p.cx + 51}
                          y={p.cy - 12}
                          textAnchor="middle" fill="white" fontSize="8" fontWeight="600"
                        >
                          {usado ? `Último: ${fmtData(hoje)}` : p.label}
                        </text>
                        <text
                          x={p.cx > 100 ? p.cx - 51 : p.cx + 51}
                          y={p.cy - 3}
                          textAnchor="middle" fill="#00C27A" fontSize="7"
                        >
                          {p.desc}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legenda */}
          <div className="flex items-center justify-center gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-text-muted">Disponível</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-text-muted">Usado hoje</span>
            </div>
          </div>
        </div>

        {/* Recomendação de rotação */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-primary">Rotação recomendada</p>
            <p className="text-sm font-semibold text-[#0A1628]">{proximoRecomendado.label}</p>
            <p className="text-xs text-text-muted">{proximoRecomendado.desc}</p>
          </div>
        </div>

        {/* Histórico últimos 7 */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">
            Últimas 7 aplicações
          </p>
          {ultimos7.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Nenhuma aplicação registrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {ultimos7.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-[#0A1628]">{h.label}</span>
                  </div>
                  <span className="text-xs text-text-muted">{fmtData(h.data)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Histórico de datas com próxima dose */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Agenda de doses</p>
          {[
            { data: "05 Mai", local: "Abdômen Dir.", status: "próxima" },
            { data: "28 Abr", local: "Abdômen Esq.", status: "feita" },
            { data: "21 Abr", local: "Coxa Esq.", status: "feita" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-[#0A1628]">{item.data}</p>
                <p className="text-xs text-text-muted">{item.local}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                item.status === 'próxima'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-[#F4F6F8] text-text-muted'
              }`}>
                {item.status === 'próxima' ? '→ Próxima' : '✓ Feita'}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
