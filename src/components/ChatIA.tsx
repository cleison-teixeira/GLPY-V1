import { useState, useRef, useEffect } from "react";
import { glpyStore } from "../data/glpyStore";
import { glpyBlackBox } from "../data/glpyBlackBox";
import { CATEGORIES, DOMAINS, SIGNALS, EVENT_TYPES } from "../data/glpyEventCatalog";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, Loader2, ChevronLeft, X } from "lucide-react";
import BottomNav from "./BottomNav";
import { carregarLimitesIA, incrementarMsgIA, carregarContextoIA, type ContextoIA } from "../services/firestore";
import { buildGLPYContextForAI, getGLPYIntelligenceContext } from "../core/glpyLocalIntelligence";
import {
  calculateGLPYDailyTargets, calculateDailyRemaining, buildDailyTargetsForAI,
  type GLPYTargetsInput, type GLPYDailyConsumed,
} from "../core/glpyDailyTargets";
import { buildAIContextFromSnapshot } from "../data/glpyUserSnapshot";
import { detectCravingSignal } from "../data/glpyMissionBridge";
import { getLocalDateKey } from "../utils/formatters";

const LIMITES_INICIAIS: Record<string, number> = { starter: 30, plus: 20, pro: 30, top: 999 };

type Message = { id: number; sender: 'ia' | 'user'; text: string; };

const PROTOCOL_STORAGE_MAP: Record<string, string> = {
  antiRebote: "glpy_antirebote",
  sobrevivendoCanetas: "glpy_sobrevivendo",
  efeitosColaterais: "glpy_efeitos",
  antiQuedaCabelo: "glpy_cabelo",
  psicologiaEmagrecimento: "glpy_psicologia",
  alimentacaoBaixoApetite: "glpy_baixoapetite",
  naoPerdaMusculos: "glpy_musculos",
  energiaBaixa: "glpy_energia",
  ajusteMetabolico: "glpy_metabolico",
  transicaoParar: "glpy_transicao",
};

function getFullUserContext(): string {
  try {
    const sections: string[] = ["PERFIL COMPLETO DO USUÁRIO:"];

    // 1. Protocolo ativo + missões
    const ativo = glpyStore.protocol.getActive();
    if (ativo?.id && ativo?.nome) {
      const progresso = JSON.parse(localStorage.getItem(`glpy_protocolo_${ativo.id}_progresso`) || "null");
      const diasFeitos = progresso?.diasConcluidos?.length ?? 0;
      const totalDias = ativo.totalDias || 7;
      const diaAtual = Math.min(diasFeitos + 1, totalDias);
      const prefix = PROTOCOL_STORAGE_MAP[ativo.id] || `glpy_${ativo.id}`;
      const missoes: number[] = JSON.parse(localStorage.getItem(`${prefix}_missoes`) || "[]");
      sections.push(`Protocolo: ${ativo.nome} — Dia ${diaAtual}/${totalDias}\nMissões de hoje: ${missoes.length}/3 concluídas`);
    }

    // 2. Check-in de hoje
    const c = JSON.parse(localStorage.getItem("glpy_ultimo_checkin") || "null");
    if (c) {
      const sint = c.sintomas?.length ? `\n- Sintomas: ${c.sintomas.join(", ")}` : "";
      sections.push(`Check-in de hoje:\n- Enjoo: ${c.enjoo}/10, Fome: ${c.fome}/10, Energia: ${c.energia}/10${sint}`);

      const rules: string[] = [];
      if (c.enjoo >= 7) rules.push("enjoo alto → refeições leves (caldo, frutas, torradas)");
      if (c.fraqueza >= 7) rules.push("fraqueza alta → proteína + descanso");
      if (c.fome <= 3) rules.push("fome baixa → porções menores, alimentos densos");
      if (c.energia <= 4) rules.push("energia baixa → carboidratos de baixo índice glicêmico");
      if (rules.length > 0) sections.push(`Regras de adaptação:\n${rules.map(r => `- ${r}`).join("\n")}`);
    }

    // 3. Últimas refeições fotografadas
    const fotos: { prato?: string; kcal?: number; proteina?: number; data?: string }[] =
      JSON.parse(localStorage.getItem("glpy_fotos_historico") || "[]");
    if (fotos.length > 0) {
      const linhas = fotos.slice(0, 3).map(f =>
        `- ${f.data || "hoje"}: ${f.prato || "refeição"} — ${f.kcal ?? 0} kcal, ${f.proteina ?? 0}g prot`
      );
      sections.push(`Últimas refeições:\n${linhas.join("\n")}`);
    }

    // 4. Progresso geral
    const streak = parseInt(localStorage.getItem("glpy_streak") || "0", 10);
    const xp = parseInt(localStorage.getItem("glpy_xp") || "0", 10);
    const nivel = parseInt(localStorage.getItem("glpy_nivel") || "1", 10);
    sections.push(`Progresso geral:\n- Streak: ${streak} dias 🔥\n- XP: ${xp} pontos\n- Nível: ${nivel}`);

    return `\n\n${sections.join("\n\n")}\n\nIMPORTANTE: Use TODOS esses dados para dar respostas personalizadas e específicas.`;
  } catch { return ""; }
}

function buildEnrichedGLPYContext(): string {
  try {
    const intelligenceBlock = buildGLPYContextForAI();

    let targetsBlock = "";
    try {
      const ctx = getGLPYIntelligenceContext();
      const todayKey = new Date().toISOString().slice(0, 10);
      const ob = ctx.userProfile.onboarding || {};

      const weightKg: number  = ctx.currentWeight?.weight  || ob.currentWeight  || 0;
      const heightCm: number  = ob.heightCm || ob.height   || 0;
      const ageYears: number  = ob.age      || ob.ageYears  || 0;

      if (weightKg > 0 && heightCm > 0 && ageYears > 0) {
        const targetsInput: GLPYTargetsInput = {
          weightKg,
          heightCm,
          ageYears,
          gender:            ob.gender         || "female",
          activityLevel:     ob.activityLevel  || "lightly_active",
          weightLossPace:    ob.weightLossPace || "equilibrado",
          targetWeightKg:    ob.targetWeightKg || ob.targetWeight,
          activeMedicationDose: ctx.treatment.latestInjection?.dose,
        };

        const todayMeals: any[] = ctx.dailyTracking[todayKey]?.meals ?? [];
        const consumed: GLPYDailyConsumed = {
          calories:     todayMeals.reduce((s: number, m: any) => s + (m.kcal       || 0), 0),
          proteinGrams: todayMeals.reduce((s: number, m: any) => s + (m.proteina   || 0), 0),
          carbsGrams:   todayMeals.reduce((s: number, m: any) => s + (m.carbs      || 0), 0),
          fatGrams:     todayMeals.reduce((s: number, m: any) => s + (m.gordura    || 0), 0),
          waterLiters:  ctx.dailyTracking[todayKey]?.water   || 0,
          mealCount:    todayMeals.length,
        };

        const targets   = calculateGLPYDailyTargets(targetsInput);
        const remaining = calculateDailyRemaining(targets, consumed);
        targetsBlock    = "\n\n" + buildDailyTargetsForAI(targets, consumed, remaining);
      }
    } catch (_) { /* daily targets opcional — não bloqueia */ }

    return intelligenceBlock + targetsBlock;
  } catch (_) {
    // fallback ao contexto legado se a engine falhar
    return getFullUserContext();
  }
}

function sanitizeAIResponse(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")   // **negrito** → texto
    .replace(/__(.+?)__/g, "$1")        // __negrito__ → texto
    .replace(/~~(.+?)~~/g, "$1")        // ~~tachado~~ → texto
    .replace(/^#{1,6}\s+/gm, "")        // # ## ### títulos → sem prefixo
    .replace(/\n{3,}/g, "\n\n")         // 3+ linhas em branco → 2
    .replace(/[ \t]{2,}/g, " ")         // espaços duplicados → 1
    .trim();
}

const QUICK_REPLIES = [
  "O que comer agora?", "Tenho náusea", "Estou desmotivado", "Energia baixa hoje",
];

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function ChatIA({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const nome = localStorage.getItem("glpy_nome") || "você";
  const saudacao = getSaudacao();

  // limpa chave legada de modo inicial; contexto é reconstruído por mensagem em buildEnrichedGLPYContext()
  localStorage.removeItem("glpy_chat_initial_mode");

  const _ativo = (() => { try { return glpyStore.protocol.getActive(); } catch { return null; } })();
  const _fome = (() => { try { const c = JSON.parse(localStorage.getItem("glpy_ultimo_checkin") || "null"); return c?.fome ?? null; } catch { return null; } })();
  const _diaAtual = (() => {
    if (!_ativo?.id) return 1;
    try {
      const p = JSON.parse(localStorage.getItem(`glpy_protocolo_${_ativo.id}_progresso`) || "null");
      return Math.min((p?.diasConcluidos?.length ?? 0) + 1, _ativo.totalDias || 7);
    } catch { return (_ativo.dia ?? 0) + 1; }
  })();

  const initialMessage = _ativo?.nome
    ? `${saudacao}, ${nome}! 👋\n\nVi que você está no Dia ${_diaAtual} do protocolo "${_ativo.nome}". Sua fome hoje está em ${_fome !== null ? `${_fome}/10` : "—"}.\n\nPosso ajudar com alimentação, sintomas ou motivação — o que precisa?`
    : `${saudacao}, ${nome}! 👋\n\nSou a GLPY.IA, sua especialista em GLP-1. Pode me perguntar sobre alimentação, sintomas, motivação ou qualquer dúvida sobre seu tratamento.\n\nComo posso ajudar?`;

  const buildSystemPrompt = (ctx: ContextoIA | null): string => {
    // Bloco prioritário: User Snapshot lê das fontes canônicas reais (glpyStore)
    // Resolve o problema de protocolo/refeições/água invisíveis para a IA
    let snapshotBlock = "";
    try { snapshotBlock = buildAIContextFromSnapshot(7); } catch (_) { /* non-blocking */ }

    // Bloco legado: glpyLocalIntelligence + daily targets (preservado integralmente)
    let legacyBlock = "";
    try { legacyBlock = buildEnrichedGLPYContext(); } catch (_) { /* non-blocking */ }

    // Nota de prioridade: resolve conflito quando legacyBlock diz "Nenhum protocolo" mas snapshot tem dados reais
    const priorityNote = snapshotBlock
      ? '\n\nNOTA: O User Snapshot acima é a fonte AUTORIZADA (dados reais do glpyStore). Se qualquer dado abaixo contradisser o snapshot (protocolo, refeições, água, atividade), IGNORE os dados abaixo e use o User Snapshot.\n'
      : '';

    // Bloco Firestore check-in (preservado, mas protocolo_ativo não sobrescreve snapshot)
    let checkinBlock = "";
    if (ctx) {
      const hoje = new Date().toISOString().slice(0, 10);
      if (ctx.data === hoje) {
        const regras: string[] = [];
        if (ctx.energia < 5)
          regras.push("PRIORIZAR alimentos energéticos (banana, batata-doce, aveia) e descanso.");
        if (ctx.sintomas.includes("Náusea") || ctx.sintomas.includes("Enjôo"))
          regras.push("Sugerir APENAS alimentos leves (caldos, frutas, torradas). Evitar gordura e frituras.");
        if (ctx.fome > 7)
          regras.push("Ajustar jantar com mais proteína (+20g) e fibra para controlar fome noturna.");
        if (ctx.agua && parseFloat(ctx.agua) < 1)
          regras.push("Lembrar hidratação a CADA resposta — usuário bebeu menos de 1L hoje.");

        // Nota: campo protocolo_ativo do Firestore pode estar desatualizado.
        // O User Snapshot acima tem prioridade para protocolo e dados do dia.
        checkinBlock = `

CHECK-IN FIRESTORE (complementar): fome ${ctx.fome}/10, energia ${ctx.energia}/10, humor ${ctx.humor}, sintomas: ${ctx.sintomas.join(", ") || "nenhum"}.${regras.length > 0 ? `\nREGRAS ATIVAS (aplicar em toda resposta):\n${regras.map(r => `- ${r}`).join("\n")}` : ""}`;
      }
    }

    return `Você é GLPY.IA — coach clínica do app GLPY, especialista em GLP-1 (Ozempic, Mounjaro, Saxenda, Wegovy). Você já conhece essa pessoa. Seja direta, acolhedora e firme.
${snapshotBlock}${priorityNote}${legacyBlock}${checkinBlock}

FORMATO — ULTRA MOBILE (obrigatório):
Resposta padrão: no máximo 450 caracteres. No máximo 2 blocos curtos. No máximo 2 ações práticas.
Texto corrido. Sem markdown. NUNCA: ** negrito **, # títulos, tabelas, hífens de lista, blocos de código.
Emoji: no máximo 1, apenas se natural. Não repita snapshot. Cite no máximo 1 ou 2 dados reais.
Não invente dados ausentes — diga "não registrado". Vá direto ao ponto. Sem abertura longa.

Formato padrão (3 linhas, use sempre):
Linha 1: diagnóstico direto.
Linha 2: dado real ou alerta.
Linha 3: próxima ação.

Exemplo correto:
"Direto: isso é craving, não fome real.

Você ainda não registrou refeição hoje.

Agora: beba água e coma proteína leve."

Exemplo errado (nunca faça):
"Analisando sua jornada, percebo que você está em um processo importante..."

EXCEÇÃO: se o usuário pedir "explique", "detalhe", "plano completo" ou "quero entender melhor", pode expandir além do limite.

COMPORTAMENTO POR INTENÇÃO:
Protocolo/missão: nome + dia + o que falta, em 2 linhas. Finalize com 1 ação.
Confronto ("me confronte"): firme e curto — "você fez X. Faltou Y. Faça Z agora."
O que comer: até 2 opções simples. Sem explicação longa.
Fome de doce: reconheça craving, oriente água + proteína, sugira 1 ou 2 opções. Não escreva textão.
Sintoma: empatia curta + 1 ação prática. Se intenso ou persistente: "Procure orientação médica."
Pergunta ampla ou vaga: responda curto e pergunte 1 dado necessário.

LINGUAGEM SEGURA — sempre:
Nunca diagnostique. Nunca prescreva. Nunca sugira ajuste de dose.
Use: "pode estar relacionado", "é comum relatar", "vale observar".
Nunca diga que cura. Nunca garanta emagrecimento. Nunca substitua médico ou nutricionista.

DADOS: use o protocolo do User Snapshot (fonte: glpyStore). Cite nome, dia e missões. Cite consumo de proteína/água só quando relevante.
CRAVING: se snapshot indicar sweet_craving, reconheça e sugira alternativa proteica. Curto.`;
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ia', text: initialMessage }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLimiteModal, setShowLimiteModal] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const plano = localStorage.getItem("glpy_plano") || "starter";
  const [msgsUsadas, setMsgsUsadas] = useState<number>(() => {
    try {
      const today = getLocalDateKey();
      const parsed = glpyStore.aiUsage.get() as any;
      if (!parsed.date || parsed.date !== today) return 0;
      return typeof parsed.used === 'number' ? parsed.used : 0;
    } catch { return 0; }
  });
  const [limiteIA, setLimiteIA] = useState(LIMITES_INICIAIS[plano] ?? 10);
  const [ctxIA, setCtxIA] = useState<ContextoIA | null>(null);

  // Carrega limites do Firestore e aplica reset automático de dia; sincroniza em localStorage
  useEffect(() => {
    carregarLimitesIA(plano)
      .then(({ usadas, limite }) => {
        const today = getLocalDateKey();
        const localParsed = glpyStore.aiUsage.get() as any;
        const localUsed = (localParsed.date === today && typeof localParsed.used === 'number') ? localParsed.used : 0;
        // Nunca regredir: usa o maior entre localStorage e Firestore (evita sobrescrever com 0 se incrementos ainda não chegaram ao Firestore)
        const finalUsadas = Math.max(localUsed, usadas);
        setMsgsUsadas(finalUsadas);
        setLimiteIA(limite);
        glpyStore.aiUsage.save({ date: today, used: finalUsadas, limit: limite, updatedAt: new Date().toISOString() } as any);
        window.dispatchEvent(new Event('local-storage-change'));
      })
      .catch(() => {});
  }, [plano]);

  // Carrega contexto do check-in do Firestore
  useEffect(() => {
    carregarContextoIA().then(setCtxIA).catch(() => {});
  }, []);

  // BUG 14C — Reset scroll horizontal ao montar o componente
  useEffect(() => {
    window.scrollTo({ left: 0, top: window.scrollY });
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }, []);

  // Sprint 17A.2.2 — container agora usa position:fixed (não pode ser scrollado pelo iOS).
  // visualViewport detecta keyboard open apenas para mostrar/ocultar BottomNav/spacer.
  // Não seta altura do container por JS — o flex resolve sozinho dentro do fixed inset-0.
  useEffect(() => {
    // Força o BottomNav a reler a foto de perfil do localStorage na primeira montagem
    window.dispatchEvent(new Event('local-storage-change'));

    const vv = window.visualViewport;
    if (!vv) return;
    const base = vv.height;

    const sync = () => {
      const isOpen = base - vv.height > 150;
      setKeyboardOpen(isOpen);
      if (isOpen) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    };

    vv.addEventListener('resize', sync);
    return () => vv.removeEventListener('resize', sync);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (msgsUsadas >= limiteIA) {
      setShowLimiteModal(true);
      return;
    }

    const userMsg: Message = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    glpyBlackBox.addEvent({
      type: EVENT_TYPES.AI_MESSAGE_SENT, category: CATEGORIES.AI, domain: DOMAINS.AI_CONTEXT,
      signal: SIGNALS.AI_MESSAGE_SENT, screen: 'ChatIA', source: 'manual',
      payload: { used: msgsUsadas + 1, limit: limiteIA },
    });
    // Detecta craving no texto do usuário e registra como sinal comportamental (sem salvar o texto)
    const cravingSignal = detectCravingSignal(text);
    if (cravingSignal) {
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.CRAVING_REPORTED, category: CATEGORIES.SYMPTOM, domain: DOMAINS.PSYCHOLOGY,
        signal: cravingSignal, screen: 'ChatIA', source: 'user_message',
        payload: { signal: cravingSignal },
      });
    }

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      history.push({ role: 'user', content: text });

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(import.meta.env.VITE_DEEPSEEK_KEY || "").trim()}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          max_tokens: 280,
          messages: [
            { role: "system", content: buildSystemPrompt(ctxIA) },
            ...history,
          ],
        }),
      });

      const data = await response.json();
      const iaText = sanitizeAIResponse(data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem. Tente novamente.");

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ia', text: iaText }]);

      // Incrementa no Firestore, atualiza estado local e persiste em localStorage
      const novas = msgsUsadas + 1;
      setMsgsUsadas(novas);
      incrementarMsgIA().catch(() => {});
      const today = getLocalDateKey();
      glpyStore.aiUsage.save({ date: today, used: novas, limit: limiteIA, updatedAt: new Date().toISOString() } as any);
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.AI_RESPONSE_RECEIVED, category: CATEGORIES.AI, domain: DOMAINS.AI_CONTEXT,
        signal: SIGNALS.AI_RESPONSE_RECEIVED, screen: 'ChatIA', source: 'ai',
        payload: { success: true },
      });
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      glpyBlackBox.addEvent({
        type: EVENT_TYPES.AI_RESPONSE_RECEIVED, category: CATEGORIES.AI, domain: DOMAINS.AI_CONTEXT,
        signal: SIGNALS.AI_RESPONSE_RECEIVED, screen: 'ChatIA', source: 'ai',
        payload: { success: false },
      });
      console.error("[ChatIA] DeepSeek fetch error:", {
        message: error instanceof Error ? error.message : String(error),
        key_defined: !!import.meta.env.VITE_DEEPSEEK_KEY,
      });
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ia',
        text: "Ops! Tive um problema de conexão. Verifique sua internet e tente novamente. 🔄",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const limitReached = msgsUsadas >= limiteIA;

  return (
    <div
      className="fixed inset-0 bg-gradient-to-b from-[#E2F1E8] to-[#F3F7F5] text-text-main flex flex-col overflow-hidden overflow-x-hidden md:left-[max(0px,calc(50%-215px))] md:right-[max(0px,calc(50%-215px))] md:rounded-[40px] md:ring-1 md:ring-black/10 md:shadow-[0_24px_64px_rgba(0,0,0,0.14)]"
    >

      {/* Header compacto */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E2EBE7] z-10">
        <button
          onClick={() => { const returnTo = sessionStorage.getItem('glpy_return_to'); sessionStorage.removeItem('glpy_return_to'); onNavigate(returnTo === 'hub' ? 'hub' : 'dashboard'); }}
          className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#0A1628] text-base leading-tight">GLPY IA</p>
          <p className="text-xs text-[#3D5A70]">
            Online ·{limiteIA !== Infinity ? ` ${msgsUsadas}/${limiteIA} msgs` : ' Ilimitado'}
          </p>
        </div>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600 stroke-[2.2]" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#00C27A] rounded-full border-2 border-white animate-pulse" />
        </div>
      </header>

      {/* Mensagens — área scrollável independente */}
      <div className="flex-1 min-h-0 w-full max-w-full min-w-0 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4 space-y-4 box-border">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex w-full max-w-full min-w-0 box-border ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-3.5 rounded-2xl min-w-0 box-border ${
                msg.sender === 'user'
                  ? 'max-w-[84%] bg-primary text-white rounded-tr-sm'
                  : 'max-w-[88%] bg-white border border-border text-text-main rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm p-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs text-text-muted">GLPY.IA está digitando...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Área inferior — fixa, não scrollável */}
      <div className="flex-shrink-0">

        {/* Quick Replies — apenas no início, some após primeira mensagem ou se limite atingido */}
        {messages.length <= 1 && !limitReached && (
          <div className="w-full max-w-full box-border overflow-x-auto overflow-y-hidden py-2">
            <div className="flex gap-2 px-4 w-max">
              {QUICK_REPLIES.map(reply => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:border-primary hover:text-primary transition flex-shrink-0 whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Banner de limite atingido */}
        {limitReached && (
          <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-amber-800 leading-snug">
                Você usou {msgsUsadas}/{limiteIA} mensagens de hoje.
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Faça upgrade para continuar.</p>
            </div>
            <button
              onClick={() => onNavigate('planos')}
              className="flex-shrink-0 bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
            >
              Ver planos
            </button>
          </div>
        )}

        {/* Input */}
        <div
          className="w-full max-w-full min-w-0 box-border px-4 pt-3 bg-background/95 backdrop-blur-sm border-t border-border overflow-hidden"
          style={{ paddingBottom: keyboardOpen ? '8px' : 'max(12px, env(safe-area-inset-bottom, 12px))' }}
        >
          <div className="relative w-full max-w-full min-w-0 box-border flex items-center">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              onFocus={() => {
                // Fallback para browsers sem visualViewport (Chrome desktop, etc.)
                if (!window.visualViewport) setKeyboardOpen(true);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 350);
              }}
              onBlur={() => { if (!window.visualViewport) setTimeout(() => setKeyboardOpen(false), 200); }}
              disabled={limitReached}
              placeholder={limitReached ? 'Limite mensal atingido' : 'Pergunte qualquer coisa...'}
              className="flex-1 min-w-0 w-full box-border py-3 pl-4 pr-14 bg-white border border-[#E2EBE7] rounded-3xl text-base focus:outline-none focus:border-primary transition min-h-[48px] max-h-[120px] resize-none overflow-y-auto disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim() || limitReached}
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              className="absolute right-2 flex-shrink-0 w-9 h-9 flex items-center justify-center bg-primary text-white rounded-[10px] transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Espaço reservado para o BottomNav fixo + safe-area.
            Mantido montado (hidden via CSS) para não remontar o BottomNav e preservar o estado da foto de perfil. */}
        <div
          className={keyboardOpen ? 'hidden' : ''}
          style={{ height: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
          aria-hidden="true"
        />

      </div>

      {/* BottomNav mantido montado (hidden via CSS) — evita perda do estado da foto de perfil ao abrir/fechar teclado */}
      <div className={keyboardOpen ? 'hidden' : ''} aria-hidden={keyboardOpen}>
        <BottomNav active="hub" onNavigate={onNavigate} />
      </div>

      {/* Modal limite atingido */}
      <AnimatePresence>
        {showLimiteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowLimiteModal(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm mb-2 relative"
            >
              <button onClick={() => setShowLimiteModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-muted">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">🤖</div>
                <h2 className="font-bold text-lg text-[#0A1628]">Limite atingido</h2>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Você usou todas as {limiteIA} mensagens de hoje no plano atual.<br />
                  Faça upgrade para continuar conversando com a GLPY.IA.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLimiteModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold text-text-muted"
                >
                  Agora não
                </button>
                <button
                  onClick={() => { setShowLimiteModal(false); onNavigate('planos'); }}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-sm font-semibold"
                >
                  Ver planos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
