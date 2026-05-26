import { useState } from "react";
import { motion } from "motion/react";
import {
  Flame, Target, MessageSquare, Utensils, Award,
  CheckCircle, Zap, ShoppingBag, Camera, Calendar,
  TrendingUp, Syringe, ChevronRight, RotateCcw, Images, CreditCard
} from "lucide-react";
import BottomNav from "./BottomNav";
import { glpyStore } from "../data/glpyStore";

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  // Bug 3: score dinâmico baseado no check-in de hoje
  const checkinHoje = (() => {
    try { return JSON.parse(localStorage.getItem("glpy_checkin_hoje") || "null"); } catch { return null; }
  })();
  const dailyScore = (() => {
    if (!checkinHoje) return 0;
    let s = 100;
    const fome: number = checkinHoje.fome ?? 5;
    const humor: number | null = checkinHoje.humor ?? null;
    const sintomas: string[] = checkinHoje.sintomas ?? [];
    if (fome >= 8) s -= 20; else if (fome <= 2) s -= 10;
    if (humor !== null) { if (humor <= 1) s -= 20; else if (humor === 2) s -= 10; }
    if (sintomas.includes("Náusea")) s -= 15;
    if (sintomas.includes("Enjôo")) s -= 10;
    if (sintomas.includes("Cansaço")) s -= 10;
    if (sintomas.includes("Energia")) s += 5;
    if (sintomas.includes("Bem-estar")) s += 5;
    if (sintomas.includes("Foco")) s += 5;
    return Math.min(100, Math.max(0, s));
  })();

  const glpyUser = JSON.parse(localStorage.getItem("glpy_user") || "{}");
  const nomeUsuario = localStorage.getItem("glpy_nome")
    || (glpyUser.displayName as string)?.split(" ")[0]
    || (glpyUser.email as string)?.split("@")[0]
    || "";

  const xpTotal = glpyStore.gamification.getXP();
  const nivel = xpTotal < 100 ? 1 : xpTotal < 300 ? 2 : xpTotal < 600 ? 3 : xpTotal < 1000 ? 4 : 5;
  const nivelNomes = ["", "Iniciante", "Explorando", "Adaptado", "Avançado", "Mestre"];
  const xpProxNivel = [100, 300, 600, 1000, Infinity];
  const xpAtualNivel = [0, 100, 300, 600, 1000][nivel - 1];
  const xpPct = nivel < 5
    ? Math.round(((xpTotal - xpAtualNivel) / (xpProxNivel[nivel - 1] - xpAtualNivel)) * 100)
    : 100;

  // Dados do onboarding para validação da dor
  const onboarding = JSON.parse(localStorage.getItem("glpy_onboarding") || "{}");
  const tempoToSemanas: Record<string, number> = {
    "Menos de 1 mês": 2, "1 a 3 meses": 8,
    "3 a 6 meses": 18, "Mais de 6 meses": 30, "Ainda não comecei": 0,
  };
  const semanaUso = tempoToSemanas[onboarding.tempo as string] ?? 4;
  const sexo = localStorage.getItem("glpy_sexo") || (onboarding.sexo as string) || "Feminino";
  const statDor = semanaUso <= 2
    ? "68% dos usuários relatam náusea nas primeiras semanas de tratamento."
    : semanaUso <= 4
    ? "71% sentem fadiga intensa na semana 4 — é o pico de adaptação ao GLP-1."
    : sexo === "Feminino"
    ? "67% das mulheres na semana 5+ relatam queda de cabelo e fadiga. É temporário e tem protocolo."
    : "67% dos usuários na semana 5+ relatam queda de energia. O corpo está se reprogramando.";

  // Protocolo ativo via glpyStore
  const protocoloAtivo = glpyStore.protocol.getActive();

  const diasFeitosProtocolo = (() => {
    if (!protocoloAtivo?.id) return 1;
    try {
      const prog = JSON.parse(localStorage.getItem(`glpy_protocolo_${protocoloAtivo.id}_progresso`) || "null");
      return (prog?.diasConcluidos?.length ?? 0) + 1;
    } catch { return 1; }
  })();

  const streak = glpyStore.gamification.getStreak();

  // Alerta de risco
  const riscoNivel = (dailyScore < 60 || streak < 2) ? "Alto"
    : (dailyScore < 80 || streak < 7) ? "Médio" : "Baixo";

  const riscoTexto = dailyScore < 80
    ? "Você está abaixo da meta de proteína de hoje. Proteína baixa é o principal gatilho do efeito rebote."
    : streak < 3
    ? "Consistência abaixo de 3 dias ativa o mecanismo de recuperação de peso. Mantenha o ritmo hoje."
    : "Score excelente! Mantenha proteína alta e sono regulado para consolidar os resultados.";

  const riscoCor = riscoNivel === "Alto"
    ? { border: "#EF4444", bg: "#FEF2F2", text: "#DC2626" }
    : riscoNivel === "Médio"
    ? { border: "#F59E0B", bg: "#FFFBEB", text: "#D97706" }
    : { border: "#00C27A", bg: "#E6FBF3", text: "#009960" };

  // Bug 12: decisões dinâmicas por protocolo + rotação semanal
  const DECISOES: Record<string, Array<{ acao: string; motivo: string }>> = {
    antiRebote: [
      { acao: "Bater a meta de proteína hoje", motivo: "Proteína alta é o principal sinal de segurança para o metabolismo" },
      { acao: "20 min de caminhada leve", motivo: "Ativa GLUT4 — direciona glicose para músculo, não gordura" },
      { acao: "Dormir 8 horas esta noite", motivo: "Sono ruim aumenta grelina em +30% e triplica a fome amanhã" },
    ],
    sobrevivendoCanetas: [
      { acao: "Comer a cada 3-4 horas", motivo: "Mantém metabolismo ativo mesmo com apetite suprimido pelo GLP-1" },
      { acao: "Registrar todos os sintomas", motivo: "Dados desta semana guiam o ajuste do protocolo" },
      { acao: "Beber 2L de água", motivo: "Desidratação simula fome — o GLP-1 pode mascarar o sinal" },
    ],
    efeitosColaterais: [
      { acao: "Comer antes de tomar a injeção", motivo: "Estômago vazio potencializa náusea no GLP-1" },
      { acao: "Evitar alimentos gordurosos hoje", motivo: "GLP-1 retarda esvaziamento gástrico — gordura piora o desconforto" },
      { acao: "Registrar sintomas de hoje", motivo: "O histórico guia o ajuste da dose com seu médico" },
    ],
    antiQuedaCabelo: [
      { acao: "Garantir 1,5g de proteína por kg corporal", motivo: "Deficiência proteica é a causa #1 de queda de cabelo no GLP-1" },
      { acao: "Tomar biotina e zinco hoje", motivo: "GLP-1 pode comprometer absorção de micronutrientes essenciais" },
      { acao: "Evitar déficit calórico extremo", motivo: "Menos de 1200 kcal acelera queda de cabelo" },
    ],
    psicologiaEmagrecimento: [
      { acao: "Registre 1 vitória do dia hoje", motivo: "Celebrar pequenas conquistas sustenta a motivação a longo prazo" },
      { acao: "Evite comparações no espelho hoje", motivo: "O progresso real é medido em semanas, não dias" },
      { acao: "Converse com alguém sobre sua jornada", motivo: "Suporte social multiplica a adesão ao tratamento" },
    ],
    alimentacaoBaixoApetite: [
      { acao: "Coma mesmo sem fome — 3 refeições mínimo", motivo: "GLP-1 suprime apetite, mas seus músculos precisam de nutrição" },
      { acao: "Prefira alimentos de alta densidade nutricional", motivo: "Pouco volume, máximo de nutrientes por refeição" },
      { acao: "Use o timer de 3h para lembrar de comer", motivo: "Sem lembretes, o GLP-1 faz você esquecer de se alimentar" },
    ],
    naoPerdaMusculos: [
      { acao: "Proteína em todas as refeições (20g+)", motivo: "Leucina estimula síntese proteica e preserva massa magra" },
      { acao: "Fazer exercício de resistência hoje", motivo: "Músculo só é preservado quando é estimulado" },
      { acao: "Não pular o café da manhã", motivo: "Síntese proteica é maior pela manhã — aproveite esse janela" },
    ],
    energiaBaixa: [
      { acao: "Verificar se bebeu água hoje", motivo: "Desidratação leve de 2% causa queda de 20% na energia" },
      { acao: "Comer carboidrato complexo no almoço", motivo: "Sem carboidrato, o cérebro funciona em modo de economia" },
      { acao: "Dormir antes da meia-noite esta noite", motivo: "GH e cortisol são regulados pelo horário do sono" },
    ],
    ajusteMetabolico: [
      { acao: "Pesar-se em jejum e registrar", motivo: "Medições consistentes revelam o padrão metabólico real" },
      { acao: "Manter calorias acima de 1200 hoje", motivo: "Comer muito pouco ativa o modo de poupança metabólica" },
      { acao: "Variar os alimentos para evitar adaptação", motivo: "Mesmos alimentos todo dia = estagnação metabólica" },
    ],
    transicaoParar: [
      { acao: "Manter a proteína alta mesmo sem o GLP-1", motivo: "A proteína é o principal freio do efeito rebote" },
      { acao: "Aumentar gradualmente as calorias (+100 por semana)", motivo: "Aumento brusco de calorias pós-GLP-1 = rebote imediato" },
      { acao: "Registrar fome e saciedade hoje", motivo: "Monitorar sinais de fome é essencial na transição" },
    ],
  };

  const DECISOES_SEMANA: Array<Array<{ acao: string; motivo: string }>> = [
    [ // Dom
      { acao: "Planejar refeições da semana", motivo: "Planejamento elimina decisões ruins na hora da fome" },
      { acao: "Fazer um descanso ativo (caminhada leve)", motivo: "Recuperação ativa é tão importante quanto o exercício" },
      { acao: "Revisar seu progresso da semana", motivo: "Consciência do progresso sustenta a motivação" },
    ],
    [ // Seg
      { acao: "Bater a meta de proteína hoje", motivo: "Segunda é o dia mais crítico para reestabelecer o ritmo" },
      { acao: "Check-in completo de hoje", motivo: "Dados da segunda definem a trajetória da semana" },
      { acao: "Beber 2L de água", motivo: "Hidratação é base de tudo no protocolo GLP-1" },
    ],
    [ // Ter
      { acao: "Exercício de força hoje", motivo: "Terça é o melhor dia para treino de resistência da semana" },
      { acao: "Registrar prato do almoço", motivo: "Consistência no registro é o hábito mais poderoso" },
      { acao: "Zero açúcar refinado hoje", motivo: "Pico de glicose na terça afeta o metabolismo até quinta" },
    ],
    [ // Qua
      { acao: "Ajustar macros se necessário", motivo: "Quarta é o ponto ideal para corrigir a rota semanal" },
      { acao: "Verificar sintomas desta semana", motivo: "Padrões de sintomas aparecem no meio da semana" },
      { acao: "Dormir 8h esta noite", motivo: "Sono da quarta impacta diretamente o metabolismo de gordura" },
    ],
    [ // Qui
      { acao: "Manter proteína e ignorar a fome aumentada", motivo: "Quinta tem pico natural de grelina — é biológico, não fraqueza" },
      { acao: "Caminhada de 20 min após o jantar", motivo: "Blunts o pico de cortisol noturno da quinta" },
      { acao: "Registrar peso hoje", motivo: "Peso da quinta é o mais representativo da semana" },
    ],
    [ // Sex
      { acao: "Preparar proteína para o fim de semana", motivo: "Fim de semana sem prep = mais chance de erro alimentar" },
      { acao: "Checar fome real vs. fome emocional", motivo: "Sexta tem gatilho social forte — consciência é proteção" },
      { acao: "Completar o check-in desta semana", motivo: "Fechar a semana com dados completos otimiza o protocolo" },
    ],
    [ // Sáb
      { acao: "Manter horários de refeição mesmo no sábado", motivo: "Desregular o ritmo no fim de semana = fome dobrada na segunda" },
      { acao: "Priorizar proteína antes de sair", motivo: "Comer proteína antes do social protege de escolhas ruins" },
      { acao: "Registrar o quanto comeu ontem", motivo: "Consciência calórica do sábado é raramente monitorada" },
    ],
  ];

  const diaSemanaIdx = new Date().getDay();
  const decisoes = (protocoloAtivo?.id ? DECISOES[protocoloAtivo.id] : null) || DECISOES_SEMANA[diaSemanaIdx];

  const [decisoesMarcadas, setDecisoesMarcadas] = useState<boolean[]>([false, false, false]);
  const toggleDecisao = (i: number) =>
    setDecisoesMarcadas(prev => prev.map((v, idx) => idx === i ? !v : v));

  // 4 ações principais — destaque visual
  const primaryActions = [
    { name: 'GLPY.IA', icon: MessageSquare, route: 'chatIA', color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
    { name: 'Registrar Prato', icon: Camera, route: 'fotoPrato', color: 'bg-sky-50 text-sky-600', border: 'border-sky-100' },
    { name: 'Check-in', icon: CheckCircle, route: 'checkin', color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
    { name: 'Receitas', icon: Utensils, route: 'receitas', color: 'bg-orange-50 text-orange-500', border: 'border-orange-100' },
  ];

  // Atalhos secundários — linha compacta
  const secondaryActions = [
    { name: 'Progresso', icon: TrendingUp, route: 'progress' },
    { name: 'Injeção', icon: Syringe, route: 'injecao' },
    { name: 'ANVISA', icon: Calendar, route: 'contadorReceita' },
    { name: 'Anti-Rebote', icon: RotateCcw, route: 'antiRebote' },
    { name: 'Fotos', icon: Images, route: 'fotosEvolucao' },
    { name: 'Loja', icon: ShoppingBag, route: 'loja' },
    { name: 'Planos', icon: CreditCard, route: 'planos' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">
      <style>{`
        @keyframes neon-pulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 6px 2px #00C27A88; }
          50%       { opacity: 0.3; transform: scale(1.4); box-shadow: 0 0 10px 4px #00C27A44; }
        }
        .neon-dot { animation: neon-pulse 1.8s ease-in-out infinite; }
      `}</style>
      
      {/* Header — fundo branco limpo */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: "#00C27A" }}>
                <svg width="18" height="16" viewBox="0 0 32 28" fill="none">
                  <path d="M6 22 C6 13 12 6 22 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M22 9 C28 10 30 16 24 21 C18 26 8 25 6 22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M17 5 L22 1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="22" cy="9" r="2.5" fill="#fff"/>
                </svg>
              </div>
              <span className="font-extrabold text-lg text-[#0A1628]">GLPY</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {nomeUsuario ? `${getSaudacao()}, ${nomeUsuario}` : getSaudacao()}
            </h1>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-1 bg-[#F4F6F8] border border-border px-2.5 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-text-main">Nível {nivel} · {nivelNomes[nivel]}</span>
              </div>
              <div className="flex items-center gap-1 bg-[#F4F6F8] border border-border px-2.5 py-1 rounded-full">
                <span className="text-xs font-bold text-text-muted">{xpTotal} XP</span>
              </div>
            </div>
            {/* Barra XP */}
            <div className="w-48 bg-border h-1 rounded-full mt-2">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
          <div className="w-10 h-10 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center">
            <Award className="w-5 h-5 text-text-muted" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">

        {/* Score + Streak — 2 cards lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          {/* Score */}
          <div className="bg-white rounded-2xl border border-border p-4 flex flex-col items-center shadow-sm">
            <div className="relative w-20 h-20 mb-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#E2EBE7" strokeWidth="6" fill="none" />
                <motion.circle
                  cx="40" cy="40" r="32"
                  stroke="#00C27A"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: dailyScore / 100 }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-text-main">
                {dailyScore}%
              </div>
            </div>
            <p className="text-xs text-text-muted font-medium">Score do dia</p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl border border-border p-4 flex flex-col items-center justify-center shadow-sm">
            <Flame className="w-9 h-9 text-orange-500 mb-1" fill="currentColor" />
            <p className="text-3xl font-black text-text-main leading-none">{streak}</p>
            <p className="text-xs text-text-muted font-medium mt-1">dias streak</p>
          </div>
        </div>

        {/* Alerta de Risco */}
        <div
          className="rounded-2xl border p-4 shadow-sm"
          style={{ background: riscoCor.bg, borderColor: riscoCor.border + "99" }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div className="flex-grow">
              <p className="font-bold text-sm" style={{ color: riscoCor.text }}>
                Risco de Rebote: {riscoNivel}
              </p>
              <p className="text-xs text-text-main leading-relaxed mt-1">{riscoTexto}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (riscoNivel === "Alto") localStorage.setItem("glpy_chat_initial_mode", "Diagnóstico");
              onNavigate('chatIA');
            }}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: riscoCor.text }}
          >
            Ver o que fazer →
          </button>
        </div>

        {/* Validação da Dor */}
        <div className="bg-[#0A1628] rounded-2xl p-5">
          <p className="text-white font-bold text-base mb-1">Você não está sozinho nisso.</p>
          <p className="text-primary text-sm font-semibold leading-snug mb-3">{statDor}</p>
          <button
            onClick={() => onNavigate('chatIA')}
            className="text-white/60 text-xs flex items-center gap-1 hover:text-white/90 transition"
          >
            Estamos ajustando seu protocolo para isso →
          </button>
        </div>

        {/* Decisão do Dia */}
        <div className="bg-[#0A1628] rounded-2xl p-5">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-4">Hoje você precisa:</p>
          <div className="space-y-4">
            {decisoes.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDecisao(i)}
                className="w-full flex gap-3 text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    decisoesMarcadas[i] ? 'border-primary bg-primary' : 'border-white/30'
                  }`}
                >
                  {decisoesMarcadas[i] && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-snug transition-all ${
                    decisoesMarcadas[i] ? 'line-through text-white/30' : 'text-white'
                  }`}>
                    {d.acao}
                  </p>
                  <p className="text-xs text-white/45 mt-0.5 leading-snug">{d.motivo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Macros — compacto */}
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Macros de hoje</p>
          <div className="space-y-2.5">
            {[
              { label: "Proteína", value: "80g", total: "120g", pct: 66, color: "bg-emerald-400" },
              { label: "Kcal", value: "1.200", total: "1.800", pct: 66, color: "bg-sky-400" },
              { label: "Água", value: "1.2L", total: "2L", pct: 60, color: "bg-blue-400" },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-text-main">{m.label}</span>
                  <span className="text-text-muted">{m.value} / {m.total}</span>
                </div>
                <div className="w-full bg-[#F4F6F8] h-1.5 rounded-full overflow-hidden">
                  <div className={`${m.color} h-full rounded-full`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta de proteína baixa */}
        {(() => {
          const hoje = new Date().toISOString().slice(0, 10);
          const dataProteina = localStorage.getItem("glpy_proteina_data");
          const proteinaConsumida = dataProteina === hoje
            ? parseInt(localStorage.getItem("glpy_proteina_hoje") || "0", 10)
            : 0;
          const pesoKg = parseFloat(
            (onboarding.peso_atual as string) ||
            localStorage.getItem("glpy_peso_atual") ||
            "75"
          );
          const metaProteina = Math.round(pesoKg * 1.8);
          const threshold = Math.round(metaProteina * 0.8);
          if (proteinaConsumida >= threshold || (dataProteina !== hoje && !checkinHoje)) return null;
          const deficit = metaProteina - proteinaConsumida;
          return (
            <button
              onClick={() => onNavigate('chatIA')}
              className="w-full text-left bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
              <div className="flex-grow">
                <p className="font-bold text-sm text-amber-800">
                  Proteína baixa hoje — risco de perda muscular.
                </p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Adicione {deficit}g até o jantar.
                </p>
                <p className="text-xs text-amber-600 mt-1.5 font-semibold">
                  Perguntar à GLPY.IA o que comer →
                </p>
              </div>
            </button>
          );
        })()}

        {/* Bug 9: Missão Crítica dinâmica por dia da semana */}
        {(() => {
          const MISSOES = [
            { missao: "Beba 2L de água hoje 💧", consequencia: "Desidratação com GLP-1 causa dor de cabeça intensa" },
            { missao: "Bata a meta de proteína hoje 🥩", consequencia: "Proteína baixa hoje = perda muscular e fome triplicada amanhã" },
            { missao: "Durma 8h esta noite 😴", consequencia: "Sono < 7h aumenta grelina em 30% e sabota o GLP-1" },
            { missao: "Evite açúcar refinado hoje 🚫", consequencia: "Um pico de glicose desfaz 3 dias de progresso metabólico" },
            { missao: "Faça 15 min de caminhada hoje 🚶", consequencia: "Sem NEAT, a glicose vai para gordura — não músculo" },
            { missao: "Coma devagar, mastigue bem hoje 🍽️", consequencia: "Comer rápido com GLP-1 = náusea e refluxo garantidos" },
            { missao: "Registre seu prato no app 📸", consequencia: "Sem registro, o erro alimentar se repete sem perceber" },
          ];
          const m = MISSOES[new Date().getDay()];
          return (
            <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">MISSÃO CRÍTICA HOJE ⚠️</p>
                  <p className="font-bold text-sm text-text-main mt-0.5">{m.missao}</p>
                  <p className="text-xs text-red-500 font-medium mt-1">{m.consequencia}</p>
                </div>
                <button
                  onClick={() => onNavigate('checkin')}
                  className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-primary hover:text-white transition"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Protocolo ativo */}
        {protocoloAtivo ? (
          <div className="bg-white rounded-2xl border-2 border-primary p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                {protocoloAtivo.emoji || "⚖️"}
              </div>
              <div className="flex-grow">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">EM ANDAMENTO</span>
                <p className="font-bold text-sm text-text-main mt-1">{protocoloAtivo?.nome}</p>
                <p className="text-xs text-text-muted mt-0.5">Dia {diasFeitosProtocolo}/{protocoloAtivo.totalDias || 7}</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: protocoloAtivo.totalDias || 7 }, (_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < diasFeitosProtocolo - 1 ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
            <button
              onClick={() => onNavigate(protocoloAtivo.id || 'protocolHub')}
              className="w-full bg-primary text-white font-bold py-2.5 rounded-xl text-sm"
            >
              Continuar Protocolo →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#F4F6F8] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                🎯
              </div>
              <div className="flex-grow">
                <p className="text-xs text-text-muted font-medium">Nenhum protocolo ativo</p>
                <p className="font-bold text-sm text-text-main">Escolha um protocolo</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('protocolHub')}
              className="w-full bg-[#0A1628] text-white font-bold py-2.5 rounded-xl text-sm"
            >
              Iniciar Protocolo
            </button>
          </div>
        )}

        {/* Ações principais — 4 cards 2x2 */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {primaryActions.map(action => (
              <button
                key={action.name}
                onClick={() => onNavigate(action.route)}
                className={`bg-white border ${action.border} rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition text-left`}
              >
                <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm text-text-main">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Atalhos secundários — linha horizontal scrollável */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Mais recursos</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {secondaryActions.map(action => (
              <button
                key={action.name}
                onClick={() => onNavigate(action.route)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white border border-border rounded-2xl px-4 py-3 shadow-sm hover:border-primary/30 transition min-w-[72px]"
              >
                <action.icon className="w-5 h-5 text-text-muted" />
                <span className="text-xs font-medium text-text-muted whitespace-nowrap">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
