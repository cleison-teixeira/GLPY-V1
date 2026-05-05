import { motion } from "motion/react";
import { Calendar, AlertTriangle, ArrowRight, CheckCircle, Clock, Shield, ChevronLeft } from "lucide-react";
import BottomNav from "./BottomNav";

export default function ContadorReceita({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const issuedDate = new Date("2026-02-14");
  const totalDays = 90;
  const today = new Date();
  const diffTime = today.getTime() - issuedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - diffDays);
  const daysUsed = Math.min(totalDays, diffDays);
  const progress = Math.min(100, (daysUsed / totalDays) * 100);
  const expiryDate = new Date(issuedDate);
  expiryDate.setDate(expiryDate.getDate() + totalDays);

  const isUrgent = daysRemaining <= 14;
  const isCritical = daysRemaining <= 7;
  const isOk = daysRemaining > 30;
  const needsRenewalBanner = daysRemaining < 30;

  const ringColor = isCritical ? "#E8445A" : isUrgent ? "#F5A623" : "#00C27A";
  const statusLabel = isCritical ? "Crítico" : isUrgent ? "Renovar em breve" : "Em dia";
  const statusBg = isCritical ? "bg-red-50 border-red-200" : isUrgent ? "bg-amber-50 border-amber-200" : "bg-[#E6FBF3] border-primary/20";
  const statusText = isCritical ? "text-red-700" : isUrgent ? "text-amber-700" : "text-primary";

  // Formata data para PT-BR
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const alertDate = new Date(expiryDate);
  alertDate.setDate(alertDate.getDate() - 14);

  return (
    <div className="min-h-screen bg-background text-text-main pb-24">
      <div className="p-5">

        {/* Banner urgência ANVISA */}
        {needsRenewalBanner && (
          <motion.div
            animate={isUrgent ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
            transition={isUrgent ? { repeat: Infinity, duration: 1.4, ease: "easeInOut" } : {}}
            className="bg-red-600 text-white rounded-2xl p-4 mb-5 shadow-md"
          >
            <p className="font-black text-sm leading-snug">
              ⚠️ SUA RECEITA VENCE EM {daysRemaining} DIAS
            </p>
            <p className="text-red-100 text-xs mt-1 leading-relaxed">
              Se vencer, você pode ficar sem o medicamento — a farmácia é obrigada a recusar a venda.
            </p>
            <button
              onClick={() => onNavigate('emBreve')}
              className="mt-3 w-full bg-white text-red-600 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5"
            >
              Renovar agora — 1 clique <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => onNavigate('dashboard')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
              <ChevronLeft className="w-4 h-4 text-text-muted" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">Contador ANVISA</h1>
              </div>
              <p className="text-text-muted text-sm">Controle de validade da receita — 90 dias</p>
            </div>
          </div>
        </header>

        {/* Status chip */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-6 ${statusBg} ${statusText}`}>
          {isOk
            ? <CheckCircle className="w-3.5 h-3.5" />
            : <AlertTriangle className="w-3.5 h-3.5" />
          }
          {statusLabel}
        </div>

        {/* Anel principal */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-56 h-56">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E2EBE7" strokeWidth="8" />
              {/* Progress */}
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - progress / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-black"
                style={{ color: ringColor }}
              >
                {daysRemaining}
              </motion.span>
              <span className="text-text-muted text-sm">dias restantes</span>
              <span className="text-text-muted text-xs mt-0.5">{daysUsed} de {totalDays} usados</span>
            </div>
          </div>

          {/* Barra linear */}
          <div className="w-full mt-4 bg-border h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: ringColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between w-full mt-1">
            <span className="text-xs text-text-muted">Emitida</span>
            <span className="text-xs text-text-muted">Vence</span>
          </div>
        </div>

        {/* Alerta urgente */}
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border mb-5 ${isCritical ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />
              <div>
                <p className={`font-bold text-sm ${isCritical ? 'text-red-700' : 'text-amber-700'}`}>
                  {isCritical ? "⚠️ Receita vence em menos de 7 dias!" : "Renovação necessária em breve"}
                </p>
                <p className={`text-xs mt-1 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                  Sem receita válida a farmácia não pode vender o medicamento. Agende uma consulta agora.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Linha do tempo */}
        <div className="bg-white border border-border rounded-2xl p-4 mb-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4">Linha do tempo</h3>

          <div className="space-y-4">
            {/* Emitida */}
            <div className="flex gap-3 items-start">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary mt-0.5" />
                <div className="w-0.5 h-8 bg-border mt-1" />
              </div>
              <div>
                <p className="font-semibold text-sm">Receita emitida</p>
                <p className="text-xs text-text-muted">{fmt(issuedDate)}</p>
                <p className="text-xs text-primary font-medium">Dia 0 de 90</p>
              </div>
              <Calendar className="w-4 h-4 text-primary ml-auto mt-0.5" />
            </div>

            {/* Alerta */}
            <div className="flex gap-3 items-start">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mt-0.5 ${today >= alertDate ? 'bg-amber-400' : 'bg-border'}`} />
                <div className="w-0.5 h-8 bg-border mt-1" />
              </div>
              <div>
                <p className="font-semibold text-sm">Alerta de renovação</p>
                <p className="text-xs text-text-muted">{fmt(alertDate)}</p>
                <p className={`text-xs font-medium ${today >= alertDate ? 'text-amber-500' : 'text-text-muted'}`}>
                  {today >= alertDate ? "⚡ Hoje — 14 dias de antecedência" : "14 dias antes do vencimento"}
                </p>
              </div>
              <Clock className="w-4 h-4 text-amber-400 ml-auto mt-0.5" />
            </div>

            {/* Vencimento */}
            <div className="flex gap-3 items-start">
              <div className={`w-3 h-3 rounded-full mt-0.5 ${daysRemaining === 0 ? 'bg-red-500' : 'bg-border'}`} />
              <div>
                <p className="font-semibold text-sm">Receita vence</p>
                <p className="text-xs text-text-muted">{fmt(expiryDate)}</p>
                <p className="text-xs text-red-500 font-medium">Sem receita = sem medicamento</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-red-400 ml-auto mt-0.5" />
            </div>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white border border-border rounded-2xl p-4 mb-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Histórico de receitas</h3>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-medium">Nov/25 → Fev/26</p>
              <p className="text-xs text-text-muted">Mounjaro 5mg · 90 dias</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
              ✓ usada por 90 dias
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Fev/26 → Mai/26</p>
              <p className="text-xs text-text-muted">Mounjaro 5mg · 90 dias</p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              ⏳ atual
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('emBreve')}
            className="w-full bg-primary text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition"
          >
            🏥 Buscar Telemedicina <ArrowRight className="w-4 h-4" />
          </motion.button>
          <button
            onClick={() => onNavigate('emBreve')}
            className="w-full bg-white border border-border text-text-main p-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary transition"
          >
            🔔 Ativar lembrete de renovação
          </button>
        </div>

      </div>
      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
