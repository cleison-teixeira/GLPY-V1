import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, Loader2, ChevronLeft, X } from "lucide-react";
import BottomNav from "./BottomNav";
import glpyLogoLight from '@/assets/logos/logo-light.png';
import { carregarLimitesIA, incrementarMsgIA, carregarContextoIA, type ContextoIA } from "../services/firestore";
import { buildGLPYContextForAI, getGLPYIntelligenceContext } from "../core/glpyLocalIntelligence";
import {
  calculateGLPYDailyTargets, calculateDailyRemaining, buildDailyTargetsForAI,
  type GLPYTargetsInput, type GLPYDailyConsumed,
} from "../core/glpyDailyTargets";

const LIMITES_INICIAIS: Record<string, number> = { starter: 10, plus: 20, pro: 30, top: 999 };

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
    const ativo = JSON.parse(localStorage.getItem("glpy_protocolo_ativo") || "null");
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

  const _ativo = (() => { try { return JSON.parse(localStorage.getItem("glpy_protocolo_ativo") || "null"); } catch { return null; } })();
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

        checkinBlock = `

CHECK-IN DE HOJE: fome ${ctx.fome}/10, energia ${ctx.energia}/10, humor ${ctx.humor}, sintomas: ${ctx.sintomas.join(", ") || "nenhum"}, água: ${ctx.agua ?? "não informada"}.
PROTOCOLO ATIVO: ${ctx.protocolo_ativo ?? "nenhum"}, dia ${ctx.dia_protocolo}/7.${regras.length > 0 ? `\nREGRAS ATIVAS (aplicar em toda resposta):\n${regras.map(r => `- ${r}`).join("\n")}` : ""}`;
      }
    }

    return `Você é GLPY.IA — uma coach clínica acolhedora do app GLPY, especialista em apoio nutricional e comportamental para quem usa GLP-1 (Ozempic, Mounjaro, Saxenda, Wegovy). Seu tom é humano, simples, seguro e motivador — nunca técnico demais, nunca parece relatório.
${buildEnrichedGLPYContext()}${checkinBlock}

FORMATO — REGRAS ABSOLUTAS:
NUNCA use markdown. Isso significa: sem ** negrito **, sem * itálico *, sem ~~ tachado ~~, sem # títulos, sem ## subtítulos, sem tabelas, sem blocos de código, sem hífens de lista markdown.
Escreva texto corrido e simples, como uma mensagem de WhatsApp. Use números para listas: "1. / 2. / 3.". Emoji: no máximo 1 por resposta, apenas se natural.

Exemplos corretos (use este estilo):
- "Você está no Dia 1 do Anti-Rebote."  NÃO: "**Dia 1** do Anti-Rebote"
- "Você consumiu 35g de proteína."       NÃO: "**35g** de proteína"
- "Missão concluída: proteína em todas as refeições."  NÃO: "~~Proteína em TODAS as refeições~~"
- "Beba em pequenos goles frequentes."   NÃO: "**goles pequenos e frequentes**"

Estrutura ideal (nunca mais que isso):
1 frase com dados reais do usuário
3 ações numeradas, curtas e concretas
1 alerta seguro se necessário
"Próximas 2 horas: [ação exata]."

LINGUAGEM SEGURA — sempre:
Nunca diagnostique. Nunca prescreva. Nunca sugira ajuste de dose. Nunca afirme causa clínica fechada.
Use: "pode estar relacionado", "é comum algumas pessoas relatarem", "vale observar".
Se sintoma for intenso ou persistente: "Se persistir ou piorar, procure orientação médica."

MISSÕES: cite protocolo, dia atual e as 3 missões. Celebre o que foi feito. Incentive o que falta com leveza.
PROTEÍNA / ÁGUA: cite quanto consumiu e quanto falta (use os números do contexto). Sugira 1 ação simples agora.
NÁUSEA / CANSAÇO: reconheça, sugira água em pequenos goles, refeição leve, evitar volume grande. Alerta médico se persistir.`;
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
      const currentMonth = new Date().toISOString().slice(0, 7);
      const raw = localStorage.getItem('glpy_ai_usage');
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      if (parsed.month !== currentMonth) return 0;
      return typeof parsed.used === 'number' ? parsed.used : 0;
    } catch { return 0; }
  });
  const [limiteIA, setLimiteIA] = useState(LIMITES_INICIAIS[plano] ?? 10);
  const [ctxIA, setCtxIA] = useState<ContextoIA | null>(null);

  // Carrega limites do Firestore e aplica reset automático de mês; sincroniza em localStorage
  useEffect(() => {
    carregarLimitesIA(plano)
      .then(({ usadas, limite }) => {
        setMsgsUsadas(usadas);
        setLimiteIA(limite);
        const currentMonth = new Date().toISOString().slice(0, 7);
        localStorage.setItem('glpy_ai_usage', JSON.stringify({ month: currentMonth, used: usadas, limit: limite, updatedAt: new Date().toISOString() }));
        window.dispatchEvent(new Event('local-storage-change'));
      })
      .catch(() => {});
  }, [plano]);

  // Carrega contexto do check-in do Firestore
  useEffect(() => {
    carregarContextoIA().then(setCtxIA).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          max_tokens: 500,
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
      const currentMonth = new Date().toISOString().slice(0, 7);
      localStorage.setItem('glpy_ai_usage', JSON.stringify({ month: currentMonth, used: novas, limit: limiteIA, updatedAt: new Date().toISOString() }));
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E2F1E8] to-[#F3F7F5] text-text-main flex flex-col pb-24 max-w-[430px] mx-auto md:rounded-[40px] md:ring-1 md:ring-black/10 md:shadow-[0_24px_64px_rgba(0,0,0,0.14)]">

      {/* Header */}
      <header className="sticky top-0 bg-white px-5 pt-6 pb-5 border-b border-[#E2EBE7] z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => { const returnTo = sessionStorage.getItem('glpy_return_to'); sessionStorage.removeItem('glpy_return_to'); onNavigate(returnTo === 'hub' ? 'hub' : 'dashboard'); }} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0">
              <ChevronLeft className="w-4 h-4 text-text-muted" />
            </button>
            <img src={glpyLogoLight} alt="GLPY" className="w-[84px] h-auto object-contain" />
          </div>

          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-violet-600 stroke-[2.2]" />
            </div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#00C27A] rounded-full border-2 border-white animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-[#0A1628] tracking-tight">
          GLPY IA
        </h1>
        <p className="text-sm text-[#3D5A70] mt-1">
          Online ·{limiteIA !== Infinity ? ` ${msgsUsadas}/${limiteIA} msgs` : ' Ilimitado'}
        </p>
      </header>

      {/* Mensagens */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-3.5 rounded-2xl max-w-[82%] ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-white border border-border text-text-main rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
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

      {/* Quick Replies */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {QUICK_REPLIES.map(reply => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            className="px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium hover:border-primary hover:text-primary transition flex-shrink-0"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Banner de limite atingido */}
      {msgsUsadas >= limiteIA && (
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="flex-grow min-w-0">
            <p className="text-sm font-bold text-amber-800 leading-snug">
              Você usou {msgsUsadas}/{limiteIA} mensagens do mês.
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
      <div className="sticky bottom-16 px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            onFocus={() => {
              setKeyboardOpen(true);
              setTimeout(() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 300);
            }}
            onBlur={() => setTimeout(() => setKeyboardOpen(false), 150)}
            placeholder="Pergunte qualquer coisa..."
            className="w-full py-3 pl-4 pr-14 bg-white border border-[#E2EBE7] rounded-3xl text-sm focus:outline-none focus:border-primary transition min-h-[48px] max-h-[120px] resize-none overflow-y-auto"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{ top: '50%', transform: 'translateY(-50%)' }}
            className="absolute right-2 w-9 h-9 flex items-center justify-center bg-primary text-white rounded-[10px] transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!keyboardOpen && <BottomNav active="hub" onNavigate={onNavigate} />}

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
                  Você usou todas as {limiteIA} mensagens do mês no plano atual.<br />
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
