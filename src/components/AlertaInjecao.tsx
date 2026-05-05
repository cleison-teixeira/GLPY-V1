import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, CheckCircle, Utensils } from "lucide-react";
import BottomNav from "./BottomNav";

export default function AlertaInjecao({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const hoje = new Date().toISOString().split('T')[0];
  const [registrado, setRegistrado] = useState(
    localStorage.getItem("glpy_ultima_aplicacao") === hoje
  );

  const registrar = () => {
    localStorage.setItem("glpy_ultima_aplicacao", hoje);
    setRegistrado(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3">
        <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div>
          <h1 className="font-black text-xl text-[#0A1628]">Dia da Caneta 💉</h1>
          <p className="text-xs text-text-muted">Protocolo de aplicação semanal</p>
        </div>
      </div>

      <div className="p-5 space-y-4">

        {/* Anúncio principal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-600 rounded-2xl p-5 text-center text-white shadow-lg"
        >
          <div className="text-5xl mb-3">💉</div>
          <h2 className="text-2xl font-black leading-tight tracking-tight">HOJE É DIA DE APLICAÇÃO</h2>
          <p className="text-red-100 text-sm mt-2 leading-relaxed">
            Siga o protocolo abaixo para minimizar efeitos colaterais
          </p>
        </motion.div>

        {/* O que NÃO fazer */}
        <div className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-red-500 font-black text-sm">✕</span>
            </div>
            <h3 className="font-bold text-sm text-red-700">O que NÃO fazer hoje</h3>
          </div>
          <div className="space-y-3">
            {[
              { item: "Café forte", motivo: "Aumenta náusea pós-aplicação" },
              { item: "Refeição gordurosa", motivo: "Gordura alta potencializa enjoo" },
              { item: "Álcool", motivo: "Intensifica efeitos colaterais" },
              { item: "Exercício intenso", motivo: "Pode causar tontura e mal-estar" },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 bg-red-50 border border-red-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs font-bold">✕</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A1628]">{n.item}</p>
                  <p className="text-xs text-text-muted">{n.motivo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O que fazer */}
        <div className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#E6FBF3] rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-sm text-primary">O que fazer hoje</h3>
          </div>
          <div className="space-y-3">
            {[
              { item: "Refeição leve antes da aplicação", motivo: "Reduz náusea pós-dose" },
              { item: "Beba 3L de água (mínimo)", motivo: "Hidratação alta é anti-nauseante" },
              { item: "Descanso de 4h pós-aplicação", motivo: "Evite atividade intensa logo após" },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0A1628]">{n.item}</p>
                  <p className="text-xs text-text-muted">{n.motivo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plano alimentar do dia */}
        <div className="bg-[#0A1628] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-white">Plano alimentar — dia de caneta</h3>
          </div>
          <div className="space-y-3.5">
            {[
              { hora: "Café da manhã", refeicao: "Iogurte grego + 1 fruta leve", obs: "Leve, anti-náusea" },
              { hora: "Almoço", refeicao: "Frango grelhado + arroz branco + legumes cozidos", obs: "Proteína limpa, sem gordura" },
              { hora: "Snack", refeicao: "Biscoito de arroz + queijo branco", obs: "Saciar sem sobrecarregar" },
              { hora: "Jantar", refeicao: "Sopa leve ou omelete 2 ovos", obs: "Digestão fácil pós-dose" },
            ].map((r, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                <div>
                  <p className="text-xs font-bold text-primary">{r.hora}</p>
                  <p className="text-sm text-white leading-snug">{r.refeicao}</p>
                  <p className="text-xs text-white/50">{r.obs}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão registrar */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={registrar}
          disabled={registrado}
          className={`w-full p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition ${
            registrado
              ? 'bg-primary/15 text-primary border border-primary/30 cursor-default'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          {registrado ? 'Aplicação registrada ✓' : 'Registrar aplicação feita'}
        </motion.button>

      </div>
      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
