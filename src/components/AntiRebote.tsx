// v3 - Firestore sync + once-per-day guard
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ShoppingBag, CheckCircle2, Circle, Award } from "lucide-react";
import BottomNav from "./BottomNav";
import { dispararConfetti, dispararConfettiFinal } from "../utils/confetti";
import { saveAntiReboteProgress, loadAntiReboteProgress } from "../services/firestore";

// ─── CÁLCULO DE METAS PERSONALIZADAS ───────────────────────────────────────
function calcMetas(peso: number, altura: number) {
  // Mifflin-St Jeor (feminino — avatar principal)
  const tmb = 10 * peso + 6.25 * altura - 5 * 30 - 161;
  const tdee = tmb * 1.2; // sedentário com GLP-1
  const kcal = Math.round(tdee - 500); // déficit para -0.5kg/semana
  const proteina = Math.round(peso * 1.8); // preservação muscular
  const gordura = Math.round((kcal * 0.25) / 9);
  const carbs = Math.round((kcal - proteina * 4 - gordura * 9) / 4);
  const agua = Math.round(peso * 35); // ml
  return { kcal, proteina, gordura, carbs, agua };
}

// ─── RECEITAS DO PROTOCOLO ─────────────────────────────────────────────────
const RECEITAS = [
  {
    id: 1, emoji: "🥗", nome: "Bowl Anti-Rebote",
    kcal: 380, proteina: 35, carbs: 28, gordura: 12,
    categoria: "Almoço · Jantar",
    desc: "A receita mais importante do protocolo. Alta proteína + gordura boa = saciedade longa sem pico de glicose.",
    ingredientes: ["120g frango grelhado", "50g arroz integral cozido", "¼ abacate", "Rúcula à vontade", "Azeite 1 fio", "Sal e limão"],
    preparo: "Grelhe o frango temperado. Monte o bowl com arroz, rúcula, frango fatiado e abacate. Regue com azeite e limão.",
    glp1tip: "Coma o frango primeiro — a proteína no início da refeição maximiza a saciedade do GLP-1.",
    dias: [1, 2, 3],
  },
  {
    id: 2, emoji: "🥚", nome: "Omelete Anti-Fraqueza",
    kcal: 280, proteina: 24, carbs: 4, gordura: 18,
    categoria: "Café da manhã",
    desc: "Proteína completa + gordura boa logo cedo. Estabiliza a glicose e evita a fraqueza das primeiras horas.",
    ingredientes: ["3 ovos", "30g queijo minas", "Espinafre 1 punhado", "Azeite 1 fio", "Sal e pimenta"],
    preparo: "Bata os ovos com sal. Refogue o espinafre rapidamente. Faça o omelete em fogo médio, recheie com queijo e espinafre.",
    glp1tip: "Ovos têm leucina — o aminoácido mais importante para preservar músculo durante emagrecimento rápido.",
    dias: [1, 4, 7],
  },
  {
    id: 3, emoji: "🥤", nome: "Shake Proteico Anti-Náusea",
    kcal: 260, proteina: 28, carbs: 22, gordura: 5,
    categoria: "Qualquer horário · Náusea",
    desc: "Para os dias difíceis. Nutrição completa sem esforço do estômago — perfeito quando a náusea aparece.",
    ingredientes: ["30g whey baunilha", "200ml leite de aveia", "1 banana pequena", "1 col chá canela", "3 cubos gelo"],
    preparo: "Bata tudo no liquidificador por 30 segundos. Beba devagar, em pequenos goles.",
    glp1tip: "Canela estabiliza a glicose e reduz o enjoo. Beba frio — temperatura baixa também ajuda na náusea.",
    dias: [2, 5],
  },
  {
    id: 4, emoji: "🍗", nome: "Frango com Batata-Doce",
    kcal: 420, proteina: 42, carbs: 38, gordura: 8,
    categoria: "Almoço · Pós-treino",
    desc: "A combinação clássica de preservação muscular. Carboidrato complexo + proteína magra = músculo protegido.",
    ingredientes: ["150g frango grelhado", "150g batata-doce cozida", "Brócolis 1 xícara", "Azeite 1 fio", "Alho e ervas"],
    preparo: "Cozinhe a batata-doce. Grelhe o frango com alho e ervas. Vapore o brócolis. Monte o prato e regue com azeite.",
    glp1tip: "Batata-doce tem índice glicêmico médio — libera energia gradualmente, evitando a fome emocional da tarde.",
    dias: [3, 6],
  },
  {
    id: 5, emoji: "🍫", nome: "Mousse de Cacau Proteico",
    kcal: 180, proteina: 18, carbs: 14, gordura: 6,
    categoria: "Sobremesa · Lanche",
    desc: "Para quando bate a vontade de doce. Satisfaz sem quebrar o protocolo — e ainda entrega proteína.",
    ingredientes: ["200g iogurte grego", "1 col sopa cacau em pó", "1 col chá mel", "Morangos para decorar"],
    preparo: "Misture o iogurte com cacau e mel até ficar homogêneo. Leve à geladeira por 30 min. Sirva com morangos.",
    glp1tip: "Cacau puro tem teobromina que melhora o humor — importante pois o GLP-1 pode causar apatia nas primeiras semanas.",
    dias: [4, 7],
  },
];

// ─── 7 DIAS DO PROTOCOLO ───────────────────────────────────────────────────
const DIAS = [
  {
    n: 1, titulo: "O erro invisível que começa agora",
    video: "O rebote não acontece quando você para. Ele começa agora.\n\nToda vez que você deixa de nutrir seu corpo, ele se prepara para recuperar tudo depois.\n\nSeu metabolismo já está recalculando. Seus hormônios de fome já estão aumentando.\n\nHoje você começa a impedir isso. E vai levar 7 dias para travar esse mecanismo.",
    explicacao: "Durante o emagrecimento rápido com GLP-1, seu metabolismo desacelera, os sinais de fome aumentam e sua prioridade biológica vira recuperar energia perdida. Se você não corrigir isso agora, vai engordar rápido, perder músculo e ter compulsão intensa.",
    missoes: [
      { texto: "Proteína em TODAS as refeições", sub: "Meta: {proteina}g hoje — sinal de segurança para o corpo" },
      { texto: "Zero açúcar líquido", sub: "Suco, refri, isotônico — pico de glicose alimenta o rebote" },
      { texto: "3 refeições com horário fixo", sub: "Regularidade = sinal de que não há escassez" },
    ],
    checkin: ["Senti vontade de doce fora de hora", "Fome em horário incomum", "Ansiedade ligada à comida", "Nenhuma compulsão hoje"],
    ia: {
      "Senti vontade de doce fora de hora": "Seu corpo está tentando compensar o período de restrição — é fisiológico. Amanhã vamos ajustar a gordura boa para aumentar a saciedade.",
      "Fome em horário incomum": "Sinal de que o metabolismo está acordando. Bom sinal! Adicione 1 castanha do pará no próximo lanche.",
      "Ansiedade ligada à comida": "O GLP-1 pode amplificar emoções nas primeiras semanas. Tente 5 respirações profundas antes de comer.",
      "Nenhuma compulsão hoje": "Excelente — você está travando o mecanismo do rebote. O Dia 3 é o ponto crítico, mantenha o foco.",
    },
    receita_id: 1,
    recompensa: "Você começou a travar o efeito rebote 🔒",
    xp: 30,
  },
  {
    n: 2, titulo: "Construindo o escudo metabólico",
    video: "Seu metabolismo é como uma fogueira.\n\nSe você joga muito combustível de uma vez — não queima bem.\nSe não joga nada por horas — apaga.\n\nA estratégia de hoje é manter a chama acesa o tempo todo.\n\nPequenas refeições frequentes não são para quem quer emagrecer. São para quem quer manter o que já emagreceu.",
    explicacao: "O GLP-1 já reduz sua fome, mas seu metabolismo precisa de sinal constante de que há energia disponível. Comer a cada 3-4h — mesmo pequenas quantidades — mantém o metabolismo ativo e evita a desaceleração que causa o rebote.",
    missoes: [
      { texto: "Comer a cada 3-4 horas", sub: "Mesmo sem fome — um lanche pequeno já basta" },
      { texto: "Lanche proteico entre almoço e jantar", sub: "Iogurte grego ou castanhas — simples e eficiente" },
      { texto: "Beber {agua}ml de água", sub: "Desidratação ativa falsos sinais de fome" },
    ],
    checkin: ["Consegui comer nos horários", "Senti energia estável", "Tive fome excessiva", "Esqueci de comer"],
    ia: {
      "Consegui comer nos horários": "Perfeito! Você está sinalizando segurança para o seu metabolismo. Continue assim no Dia 3.",
      "Senti energia estável": "Energia estável = metabolismo funcionando. Exatamente o que queremos no Anti-Rebote.",
      "Tive fome excessiva": "Fome alta no Dia 2 pode indicar déficit proteico. Adicione mais 20g de proteína amanhã.",
      "Esqueci de comer": "Configure alarmes no celular para cada 3h. Seu corpo precisa do sinal, mesmo que você não sinta fome.",
    },
    receita_id: 3,
    recompensa: "Escudo metabólico ativado ⚡",
    xp: 30,
  },
  {
    n: 3, titulo: "O ponto crítico — a virada ou a recaída",
    video: "Dia 3 é o mais importante desse protocolo.\n\nEstudos mostram que é quando o metabolismo toma a primeira decisão: continuar desacelerando — ou começar a acelerar de novo.\n\nEssa decisão depende do que você faz HOJE.\n\nSe você mantiver proteína alta, refeições estruturadas e zero açúcar, seu corpo vai começar a entender que o período de crise passou.\n\nE vai parar de se preparar para o rebote.",
    explicacao: "O Dia 3 é o ponto de inflexão metabólica. Seu corpo está decidindo se deve continuar em modo de crise (acumular gordura) ou voltar ao modo normal. A consistência hoje vale mais do que os últimos 2 dias juntos.",
    missoes: [
      { texto: "Bater a meta proteica hoje — sem falta", sub: "Calcule: {proteina}g — hoje não há exceção" },
      { texto: "20 minutos de caminhada leve", sub: "Ativa o GLUT4 — leva glicose para o músculo, não para a gordura" },
      { texto: "Dormir 8 horas esta noite", sub: "Privação de sono ativa a grelina — +30% de fome amanhã" },
    ],
    checkin: ["Bati minha meta de proteína", "Fiz a caminhada", "Senti compulsão hoje", "Dia difícil mas resisti"],
    ia: {
      "Bati minha meta de proteína": "Você tomou a decisão certa no dia mais importante. Seu metabolismo está recalibrando agora.",
      "Fiz a caminhada": "20 minutos ativam mais GLUT4 do que 1h de academia intensa. Simples e poderoso.",
      "Senti compulsão hoje": "Compulsão no Dia 3 é esperada — é o pico da reação metabólica. Se resistiu, você virou o jogo.",
      "Dia difícil mas resisti": "Resistir no Dia 3 é o que separa os 27% que mantêm o peso dos 73% que recuperam. Você está no grupo certo.",
    },
    receita_id: 4,
    recompensa: "Virada metabólica conquistada 🔄",
    xp: 50,
  },
  {
    n: 4, titulo: "Regulando os hormônios da fome",
    video: "Existe um hormônio que ninguém te conta.\n\nA grelina — o hormônio da fome.\n\nDurante o uso do GLP-1, ela fica suprimida.\nQuando você para — ou reduz a dose — ela volta. Com força total.\n\nHoje você vai aprender a dominá-la antes que ela domine você.",
    explicacao: "A grelina aumenta com: sono ruim, estresse, refeições irregulares e carboidrato refinado. Os 3 inimigos do Anti-Rebote são exatamente esses. Controlar a grelina é controlar a fome pós-medicamento.",
    missoes: [
      { texto: "8 horas de sono — comece a preparar agora", sub: "1h sem tela antes de dormir reduz grelina em 23%" },
      { texto: "5 minutos de respiração antes de comer", sub: "Ativa o sistema parassimpático — estado ideal para saciedade" },
      { texto: "Zero carboidrato refinado hoje", sub: "Pão branco, biscoito, massa — ativam pico de grelina 2h depois" },
    ],
    checkin: ["Dormi bem ontem", "Fiz a respiração", "Comi carboidrato refinado", "Senti fome controlada"],
    ia: {
      "Dormi bem ontem": "Sono de qualidade é o suplemento mais poderoso que existe. Continue priorizando.",
      "Fiz a respiração": "5 minutos de respiração ativam o nervo vago — que literalmente sinaliza saciedade para o cérebro.",
      "Comi carboidrato refinado": "Não se culpe — anote o que comeu e vamos ajustar amanhã. O aprendizado também faz parte.",
      "Senti fome controlada": "Grelina regulada! Você está dominando o hormônio mais difícil do período pós-GLP-1.",
    },
    receita_id: 2,
    recompensa: "Hormônios da fome sob controle 🧬",
    xp: 30,
  },
  {
    n: 5, titulo: "Treinando o metabolismo para trabalhar por você",
    video: "Seu metabolismo desacelerou durante o emagrecimento rápido.\n\nIsso é normal. Esperado.\n\nO que você vai fazer hoje vai fazer ele acordar novamente.\n\nNão é academia pesada. Não é dieta maluca.\n\nÉ o princípio mais simples da fisiologia:\nMúsculo queima caloria em repouso. Gordura não.\n\nHoje — você começa a construir seu motor interno.",
    explicacao: "Cada kg de músculo queima 13 kcal por dia em repouso. Parece pouco, mas 5kg de músculo = 65 kcal/dia = 2.000 kcal/mês sem fazer nada. Esse é o segredo de quem mantém o peso a longo prazo.",
    missoes: [
      { texto: "10 agachamentos + 10 flexões modificadas", sub: "Ativa os maiores músculos do corpo em 5 minutos" },
      { texto: "Ovo no café da manhã — obrigatório", sub: "Leucina do ovo é o aminoácido mais anabólico que existe" },
      { texto: "Proteína nas 3 refeições — {proteina}g total", sub: "Sem proteína, o exercício não constrói músculo" },
    ],
    checkin: ["Fiz os exercícios", "Comi ovo no café", "Bati a proteína", "Senti o corpo mais disposto"],
    ia: {
      "Fiz os exercícios": "10 agachamentos ativam glúteo, quadríceps e isquiotibiais — os 3 maiores grupos musculares. Eficiência máxima.",
      "Comi ovo no café": "A leucina do ovo inicia a síntese proteica muscular em até 30 minutos após o consumo. Timing perfeito.",
      "Bati a proteína": "Com proteína + exercício, você está construindo o motor que vai queimar caloria em repouso. Poderoso.",
      "Senti o corpo mais disposto": "Disposição aumentada no Dia 5 é sinal de que o metabolismo está acelerando. Continue!",
    },
    receita_id: 3,
    recompensa: "Motor metabólico ligado 💪",
    xp: 40,
  },
  {
    n: 6, titulo: "Construindo a identidade de quem mantém",
    video: "Quem mantém o peso não faz dieta.\n\nQuem mantém o peso tem uma identidade.\n\nEles se veem como pessoas saudáveis — não como pessoas tentando emagrecer.\n\nEssa mudança sutil na forma como você se define é a diferença entre 6 meses e vida inteira.\n\nHoje — você começa a construir essa nova identidade.",
    explicacao: "Pesquisas de comportamento mostram que a identidade é mais poderosa que a disciplina. Quem diz 'eu sou uma pessoa saudável' toma decisões diferentes de quem diz 'estou tentando ser saudável'. Hoje você muda esse script interno.",
    missoes: [
      { texto: "Escrever 3 escolhas saudáveis desta semana", sub: "Evidência concreta de quem você está se tornando" },
      { texto: "Tirar foto de evolução (privada)", sub: "Registro visual é a prova mais poderosa de progresso" },
      { texto: "Planejar as refeições de amanhã agora", sub: "Quem planeja escolhe com a mente. Quem não planeja escolhe com a fome." },
    ],
    checkin: ["Escrevi minhas conquistas", "Tirei foto de evolução", "Planejei amanhã", "Me senti orgulhoso hoje"],
    ia: {
      "Escrevi minhas conquistas": "Evidências escritas de progresso são 3x mais motivadoras do que metas futuras. Guarda esse registro.",
      "Tirei foto de evolução": "Em 30 dias você vai agradecer por ter registrado. A foto é a prova do que sua disciplina criou.",
      "Planejei amanhã": "Planejamento alimentar reduz em 60% as decisões impulsivas. Você está usando ciência do comportamento.",
      "Me senti orgulhoso hoje": "Orgulho próprio é o combustível mais duradouro. Muito mais poderoso que motivação externa.",
    },
    receita_id: 4,
    recompensa: "Nova identidade sendo construída 🧠",
    xp: 30,
  },
  {
    n: 7, titulo: "O rebote foi travado. Agora é manutenção.",
    video: "Sete dias atrás, seu corpo estava se preparando para recuperar tudo.\n\nHoje — esse mecanismo foi interrompido.\n\nVocê alimentou seu músculo quando ele precisava.\nVocê regulou seus hormônios quando eles queriam te sabotar.\nVocê construiu uma rotina quando o caos era mais fácil.\n\n73% das pessoas que param o GLP-1 recuperam o peso em 12 meses.\n\nVocê não vai ser essa estatística.\nVocê está no grupo dos 27%.\nE esse grupo não para aqui.",
    explicacao: "O protocolo Anti-Rebote de 7 dias criou 3 adaptações: seu metabolismo está mais ativo, seus hormônios de fome estão mais regulados e você tem evidências concretas de que consegue. Essa é a base para os próximos meses.",
    missoes: [
      { texto: "Revisar os 6 dias anteriores", sub: "O que funcionou melhor? Leve isso para a vida" },
      { texto: "Definir sua meta para o próximo mês", sub: "Quem tem meta específica tem 3x mais chance de manter" },
      { texto: "Compartilhar seu resultado", sub: "Comprometimento público é o reforço mais poderoso" },
    ],
    checkin: ["Completei os 7 dias", "Me sinto diferente", "Aprendi algo importante", "Quero continuar"],
    ia: {
      "Completei os 7 dias": "Você fez algo que 73% das pessoas nunca fazem. O anti-rebote está ativado. Parabéns.",
      "Me sinto diferente": "Esse 'diferente' é bioquímico — seus hormônios, seu metabolismo e sua identidade mudaram nos últimos 7 dias.",
      "Aprendi algo importante": "O maior aprendizado do Anti-Rebote é que manter é uma habilidade, não uma sorte. E você aprendeu.",
      "Quero continuar": "O próximo protocolo vai amplificar tudo que você construiu aqui. Você está pronto.",
    },
    receita_id: 5,
    recompensa: "PROTOCOLO ANTI-REBOTE COMPLETO 🏆",
    xp: 100,
  },
];

const VIDEOS: Record<number, string> = {
  1: "https://glpy.b-cdn.net/protocolo-anti-rebote/dia1-anti-rebote.mp4",
  2: "https://glpy.b-cdn.net/protocolo-anti-rebote/dia2-anti-rebote.mp4",
  3: "https://glpy.b-cdn.net/protocolo-anti-rebote/dia3-anti-rebote.mp4",
  4: "https://glpy.b-cdn.net/protocolo-anti-rebote/dia4-anti-rebote.mp4",
  5: "https://glpy.b-cdn.net/protocolo-anti-rebote/dia5-anti-rebote.mp4",
  6: "https://glpy.b-cdn.net/protocolo-anti-rebote/dia6-anti-rebote.mp4",
  7: "https://glpy.b-cdn.net/protocolo-anti-rebote/dia7-anti-rebote.mp4",
};

export default function AntiRebote({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const progressoKey = "glpy_protocolo_antiRebote_progresso";

  // ── Progress state (synced to Firestore + localStorage) ──
  const [diaAtual, setDiaAtual] = useState(0);
  const [diasConcluidos, setDiasConcluidos] = useState<number[]>([]);
  const [dataUltimoCheck, setDataUltimoCheck] = useState<string | null>(null);

  // ── Session-only state ──
  const [aba, setAba] = useState<"protocolo" | "receitas">("protocolo");
  const [checkinSelecionado, setCheckinSelecionado] = useState<string | null>(null);
  const [missoesMarcadas, setMissoesMarcadas] = useState<number[]>([]);
  const [concluido, setConcluido] = useState(false); // acabou de completar nesta sessão
  const [receitaAberta, setReceitaAberta] = useState<number | null>(null);
  const [protocoloConcluido, setProtocoloConcluido] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpValor, setXpValor] = useState(0);
  const [videoAssistido, setVideoAssistido] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Carrega progresso: Firestore → localStorage → padrão ──
  useEffect(() => {
    const fromLocalStorage = () => {
      try {
        const raw = localStorage.getItem(progressoKey);
        if (!raw) return;
        const p = JSON.parse(raw);
        if (typeof p.diaAtual === "number") setDiaAtual(p.diaAtual);
        if (Array.isArray(p.diasConcluidos)) setDiasConcluidos(p.diasConcluidos);
        if (p.dataUltimoCheck) setDataUltimoCheck(p.dataUltimoCheck);
      } catch {}
    };

    loadAntiReboteProgress()
      .then(data => {
        if (data) {
          setDiaAtual(data.diaAtual);
          setDiasConcluidos(data.diasCompletos);
          setDataUltimoCheck(data.dataUltimoCheck);
          try {
            const raw = localStorage.getItem(progressoKey);
            const existing = raw ? JSON.parse(raw) : {};
            localStorage.setItem(progressoKey, JSON.stringify({
              ...existing,
              diaAtual: data.diaAtual,
              diasConcluidos: data.diasCompletos,
              dataUltimoCheck: data.dataUltimoCheck,
            }));
          } catch {}
        } else {
          fromLocalStorage();
        }
      })
      .catch(fromLocalStorage);
  }, []);

  // ── Mantém glpy_protocolo_ativo sincronizado ──
  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem("glpy_protocolo_ativo") || "{}");
      localStorage.setItem("glpy_protocolo_ativo", JSON.stringify({
        ...existing,
        id: "antiRebote",
        nome: "Anti-Rebote",
        emoji: "⚖️",
        totalDias: 7,
        dia: diaAtual + 1,
      }));
    } catch {}
  }, [diaAtual]);

  const peso = parseFloat(localStorage.getItem("glpy_peso_atual") || "75");
  const altura = parseFloat(localStorage.getItem("glpy_altura") || "165");
  const metas = calcMetas(peso, altura);

  const videoUrl = VIDEOS[diaAtual + 1] ?? "";

  const handlePlay = () => {
    setVideoAssistido(true);
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    v?.requestFullscreen?.() ?? v?.webkitEnterFullscreen?.();
  };

  const dia = DIAS[diaAtual];
  const receita = RECEITAS.find(r => r.id === dia.receita_id)!;
  const receitaDetalhe = receitaAberta !== null ? RECEITAS.find(r => r.id === receitaAberta) : null;

  // ── Derivados para controle do botão ──
  const hoje = new Date().toISOString().slice(0, 10);
  const jaConcluidoHoje = dataUltimoCheck === hoje;
  const diaJaFeito = diasConcluidos.includes(diaAtual + 1);

  const toggleMissao = (i: number) => {
    setMissoesMarcadas(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const formatMissao = (texto: string) =>
    texto.replace("{proteina}", String(metas.proteina)).replace("{agua}", String(metas.agua));

  const handleConcluir = () => {
    if (jaConcluidoHoje || diaJaFeito) return;

    const agora = new Date().toISOString().slice(0, 10);
    setConcluido(true);
    setCheckinSelecionado(null);
    setMissoesMarcadas([]);

    const diaCompletado = diaAtual + 1; // 1-indexado
    const novasConcluidas = diasConcluidos.includes(diaCompletado)
      ? diasConcluidos
      : [...diasConcluidos, diaCompletado];
    const proximoDiaIdx = diaAtual < 6 ? diaAtual + 1 : diaAtual;

    setDiasConcluidos(novasConcluidas);
    setDataUltimoCheck(agora);

    // XP float + confetti
    const xpDia = DIAS[diaAtual].xp;
    setXpValor(xpDia);
    setShowXP(true);
    setTimeout(() => setShowXP(false), 1500);
    if (diaAtual === 6) { dispararConfettiFinal(); } else { dispararConfetti(); }

    // Navegar para check-in após confetti (todos os dias)
    localStorage.setItem("glpy_checkin_from_protocol", JSON.stringify({
      protocolo: "Anti-Rebote",
      dia: diaAtual + 1,
      xp_ganho: xpDia,
    }));
    setTimeout(() => onNavigate('checkin'), 1500);

    // Salva no Firestore (diaAtual já avança para o próximo)
    saveAntiReboteProgress({
      diaAtual: proximoDiaIdx,
      dataUltimoCheck: agora,
      diasCompletos: novasConcluidas,
    }).catch(() => {});

    // Espelho no localStorage
    try {
      const raw = localStorage.getItem(progressoKey);
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(progressoKey, JSON.stringify({
        ...existing,
        diaAtual: proximoDiaIdx,
        diasConcluidos: novasConcluidas,
        dataUltimoCheck: agora,
      }));
    } catch {}

    if (diaAtual === 6) {
      localStorage.removeItem("glpy_protocolo_ativo");
      setProtocoloConcluido(true);
    }
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

      {/* XP flutuante */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 bg-primary text-white font-black text-2xl px-6 py-3 rounded-2xl shadow-xl pointer-events-none"
          >
            +{xpValor} XP ⚡
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => onNavigate('protocolHub')} className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div className="flex-grow">
            <p className="text-xs text-text-muted font-medium">Protocolo 4</p>
            <h1 className="font-bold text-base leading-tight">⚖️ Anti-Rebote</h1>
          </div>
          <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
            Dia {diaAtual + 1}/7
          </div>
        </div>

        {/* Barra 7 dias */}
        <div className="flex gap-1.5">
          {DIAS.map((_, i) => (
            <button key={i} onClick={() => { setDiaAtual(i); setConcluido(false); setCheckinSelecionado(null); setMissoesMarcadas([]); }}
              className={`h-2 flex-1 rounded-full transition-all ${i <= diaAtual ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Abas */}
        <div className="flex gap-2 mt-3">
          {(["protocolo", "receitas"] as const).map(a => (
            <button key={a} onClick={() => setAba(a)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${aba === a ? 'bg-primary text-white' : 'bg-[#F4F6F8] text-text-muted'}`}>
              {a === "protocolo" ? "📋 Protocolo" : "🍳 Receitas"}
            </button>
          ))}
        </div>
      </div>

      {/* Metas personalizadas */}
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

        {/* ABA PROTOCOLO */}
        {aba === "protocolo" && (
          <motion.div key="protocolo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 space-y-4 pb-4">

            {/* Título do dia */}
            <div className="bg-[#0A1628] rounded-2xl p-4">
              <p className="text-xs text-primary font-bold mb-1">Dia {dia.n}</p>
              <h2 className="font-bold text-white text-base leading-snug">{dia.titulo}</h2>
            </div>

            {/* Vídeo */}
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                playsInline
                {...({ 'webkit-playsinline': 'true' } as Record<string, string>)}
                preload="auto"
                onPlay={handlePlay}
                onLoadedMetadata={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0.1;
                }}
                style={{
                  width: '100%',
                  aspectRatio: '9/16',
                  maxHeight: '55vh',
                  borderRadius: '16px',
                  background: '#0A1628',
                  objectFit: 'contain',
                  objectPosition: 'top',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,194,122,0.15)',
                  display: 'block',
                }}
              />
            ) : (
              <div className="flex items-center justify-center rounded-2xl bg-[#0A1628]" style={{ minHeight: '420px', maxHeight: '60vh' }}>
                <p className="text-white/60 text-sm">Vídeo em breve 🎬</p>
              </div>
            )}

            {/* Explicação */}
            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Por que isso importa</p>
              <p className="text-sm text-text-main leading-relaxed">{dia.explicacao}</p>
            </div>

            {/* Missões */}
            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Missões do dia</p>
              <div className="space-y-2.5">
                {dia.missoes.map((m, i) => {
                  const done = missoesMarcadas.includes(i);
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => toggleMissao(i)}
                      className={`w-full flex gap-3 p-3 rounded-xl border text-left transition-all ${done ? 'bg-primary/5 border-primary/20' : 'bg-[#F4F6F8] border-transparent'}`}>
                      {done ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /> : <Circle className="w-5 h-5 text-border flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-sm font-semibold ${done ? 'line-through text-text-muted' : 'text-text-main'}`}>{m.texto}</p>
                        <p className="text-xs text-text-muted mt-0.5">{formatMissao(m.sub)}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Receita do dia */}
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

            {/* Check-in */}
            <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Check-in do dia</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {dia.checkin.map(opt => (
                  <button key={opt} onClick={() => setCheckinSelecionado(opt)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${checkinSelecionado === opt ? 'bg-primary text-white border-primary' : 'bg-[#F4F6F8] border-transparent text-text-main'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {checkinSelecionado && dia.ia[checkinSelecionado as keyof typeof dia.ia] && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/15 rounded-xl p-3">
                    <div className="flex gap-2 mb-1"><span>🤖</span><span className="text-xs font-bold text-primary">GLPY.IA</span></div>
                    <p className="text-xs text-text-main leading-relaxed">{dia.ia[checkinSelecionado as keyof typeof dia.ia]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recompensa */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-bold text-amber-700 text-sm">{dia.recompensa}</p>
                <p className="text-xs text-amber-600 mt-0.5">+{dia.xp} XP ao concluir</p>
              </div>
            </div>

            {/* Botão — 4 estados */}
            {diaJaFeito && !concluido ? (
              // Dia já concluído anteriormente (navegou de volta via barra)
              <div className="bg-primary/5 border border-primary/15 rounded-2xl py-4 text-center">
                <p className="font-bold text-primary text-sm">✅ Dia {dia.n} já concluído</p>
                <p className="text-xs text-text-muted mt-1">Selecione outro dia na barra acima</p>
              </div>
            ) : concluido ? (
              // Acabou de concluir nesta sessão
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center">
                  {protocoloConcluido ? (
                    <>
                      <p className="font-bold text-primary text-lg">🏆 Protocolo concluído!</p>
                      <p className="text-xs text-text-muted mt-1">Redirecionando para o check-in...</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-primary">🏆 +{dia.xp} XP conquistados!</p>
                      <p className="text-xs text-text-muted mt-1">Dia {diaAtual + 2} desbloqueado</p>
                    </>
                  )}
                </div>
                {!protocoloConcluido && (
                  diaAtual < 6 ? (
                    <button onClick={proximoDia}
                      className="w-full bg-[#0A1628] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                      Ir para o Dia {diaAtual + 2} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => onNavigate('protocolHub')}
                      className="w-full bg-[#0A1628] text-white font-bold py-4 rounded-2xl">
                      🏆 Ver próximo protocolo
                    </button>
                  )
                )}
              </motion.div>
            ) : jaConcluidoHoje ? (
              // Já completou um dia hoje — bloqueado até amanhã
              <div className="w-full bg-[#F4F6F8] border border-border rounded-2xl py-4 text-center">
                <p className="text-sm font-semibold text-text-muted">⏰ Volte amanhã para continuar</p>
                <p className="text-xs text-text-muted mt-1">1 dia por dia — você já cumpriu o de hoje</p>
              </div>
            ) : (
              // Disponível para completar
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleConcluir}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-md text-base">
                ✅ Concluir Dia {dia.n}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ABA RECEITAS */}
        {aba === "receitas" && (
          <motion.div key="receitas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4 space-y-3 pt-2">
            {receitaDetalhe ? (
              // Detalhe da receita
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
              // Lista de receitas
              RECEITAS.map(r => (
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
