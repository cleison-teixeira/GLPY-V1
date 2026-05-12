import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const VIDEOS: Record<number, string> = {
  1: "https://glpy.b-cdn.net/PROTOCOLO-6-ALIMENTACAO-PARA-BAIXO-APETITE/dia1-alimentacao-para-baixo-apetite.mp4",
  2: "https://glpy.b-cdn.net/PROTOCOLO-6-ALIMENTACAO-PARA-BAIXO-APETITE/dia2-alimentacao-para-baixo-apetite.mp4",
  3: "https://glpy.b-cdn.net/PROTOCOLO-6-ALIMENTACAO-PARA-BAIXO-APETITE/dia3-alimentacao-para-baixo-apetite.mp4",
  4: "https://glpy.b-cdn.net/PROTOCOLO-6-ALIMENTACAO-PARA-BAIXO-APETITE/dia4-alimentacao-para-baixo-apetite.mp4",
  5: "https://glpy.b-cdn.net/PROTOCOLO-6-ALIMENTACAO-PARA-BAIXO-APETITE/dia5-alimentacao-para-baixo-apetite.mp4",
  6: "https://glpy.b-cdn.net/PROTOCOLO-6-ALIMENTACAO-PARA-BAIXO-APETITE/dia6-alimentacao-para-baixo-apetite.mp4",
  7: "https://glpy.b-cdn.net/PROTOCOLO-6-ALIMENTACAO-PARA-BAIXO-APETITE/dia7-alimentacao-para-baixo-apetite.mp4",
};

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🥑", nome: "Bowl Denso de Abacate com Ovo e Salmão",
    kcal: 480, proteina: 32, carbs: 8, gordura: 36,
    categoria: "Almoço · Alta densidade",
    desc: "Máxima nutrição em volume mínimo. Gordura do abacate + proteína do salmão + lecitina do ovo = 480 kcal em uma tigela pequena que cabe no estômago em GLP-1.",
    ingredientes: ["1 abacate médio", "2 ovos poché", "80g salmão defumado", "Limão, sal e pimenta", "Sementes de gergelim"],
    preparo: "Abra o abacate. Faça os ovos poché (3 min em água com vinagre). Monte no abacate com salmão. Finalize com limão e gergelim.",
    glp1tip: "O abacate tem 77% das calorias de gordura — a macromolécula mais densa (9 kcal/g vs 4 kcal/g de proteína). Perfeito para atingir calorias com volume mínimo.",
    dias: [1, 3, 6],
  },
  {
    id: 2, emoji: "🧀", nome: "Cottage com Frutas Vermelhas e Granola",
    kcal: 290, proteina: 22, carbs: 28, gordura: 9,
    categoria: "Café da manhã · Lanche",
    desc: "200ml de volume com 22g de proteína. Cottage é a proteína mais concentrada por volume entre os laticínios — ideal para estômago com capacidade reduzida.",
    ingredientes: ["150g cottage", "Frutas vermelhas a gosto", "2 col sopa granola sem açúcar", "1 col chá mel"],
    preparo: "Monte em copo ou tigela: cottage + frutas + granola + mel. Pronto em 2 minutos.",
    glp1tip: "Cottage tem caseína — proteína de digestão lenta que libera aminoácidos por 5-7h. Ideal para o café da manhã quando o apetite para almoço é incerto.",
    dias: [1, 4, 7],
  },
  {
    id: 3, emoji: "🥜", nome: "Mini Wrap Proteico de Pasta de Amendoim",
    kcal: 350, proteina: 18, carbs: 34, gordura: 16,
    categoria: "Lanche · Café da manhã",
    desc: "150ml de volume, alta caloria e proteína. Pasta de amendoim tem 6g de proteína por colher + gordura monoinsaturada que estabiliza a glicose.",
    ingredientes: ["1 wrap integral pequeno", "2 col sopa pasta de amendoim integral", "1 banana pequena fatiada", "1 col chá mel"],
    preparo: "Espalhe a pasta de amendoim no wrap. Coloque as fatias de banana. Regue com mel. Enrole e coma.",
    glp1tip: "Banana imatura tem amido resistente que alimenta o microbioma e tem menor pico glicêmico. Quanto mais verde, melhor para saciedade prolongada.",
    dias: [2, 5],
  },
  {
    id: 4, emoji: "🥩", nome: "Mini Steak com Manteiga Ghee",
    kcal: 420, proteina: 38, carbs: 0, gordura: 28,
    categoria: "Jantar · Alta densidade",
    desc: "A refeição mais densa em nutrientes por grama. Carne vermelha + ghee entrega ferro, zinc, B12, creatina e gordura saturada de alta biodisponibilidade em porção mínima.",
    ingredientes: ["120g contrafilé ou maminha", "1 col chá manteiga ghee", "Alho e ervas frescas", "Sal grosso"],
    preparo: "Sele o steak em frigideira bem quente com ghee (2 min cada lado para mal passado). Finalize com alho e ervas.",
    glp1tip: "O ghee tem ácido butírico que é o combustível preferencial das células do cólon — importante para quem tem constipação no GLP-1. Também facilita a absorção das vitaminas lipossolúveis da carne.",
    dias: [3, 6],
  },
  {
    id: 5, emoji: "🫐", nome: "Smoothie Ultra-Nutritivo",
    kcal: 380, proteina: 30, carbs: 38, gordura: 12,
    categoria: "Qualquer horário · Apetite zero",
    desc: "Para quando não consegue comer nada sólido. 380 kcal e 30g de proteína em 300ml — o máximo de nutrição no menor volume.",
    ingredientes: ["30g whey proteico", "1 banana pequena", "100g mirtilo congelado", "1 col sopa pasta de amêndoa", "150ml leite de coco", "Gelo"],
    preparo: "Bata tudo no liquidificador por 30 segundos. Beba em 20-30 min (não de uma vez — risco de distensão).",
    glp1tip: "Beber smoothie devagar em pequenos goles ativa os receptores de saciedade do intestino delgado de forma mais eficiente que beber rápido. Mínimo 15 min para 300ml.",
    dias: [2, 4, 7],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "Apetite baixo não é falha — é o GLP-1 funcionando perfeitamente",
    video: "Você não está com fome.\n\nIsso é o melhor sinal possível de que o tratamento funciona.\n\nMas aqui está o problema:\n\nSem apetite, a maioria come menos de 800 kcal por dia.\n\nAbaixo de 800 kcal — o músculo começa a ser destruído.\nAbaixo de 800 kcal — o metabolismo desacelera permanentemente.\nAbaixo de 800 kcal — a queda de cabelo acelera.\n\nVocê precisa comer sem fome.\nE este protocolo vai te ensinar exatamente como.",
    explicacao: "A supressão de apetite pelo GLP-1 é mediada por múltiplos mecanismos: receptores no hipotálamo, retardo do esvaziamento gástrico e redução do glucagon. Quando o apetite cai abaixo de 1.000 kcal/dia, o organismo entra em modo de preservação, reduzindo a taxa metabólica basal e catabolizando massa muscular. A nutrição estratégica resolve isso.",
    missoes: [
      { texto: "Meta mínima de 1.000 kcal hoje — independente da fome", sub: "Não pela dieta — pela preservação do metabolismo" },
      { texto: "Proteína em cada refeição mesmo que pequena", sub: "Meta: {proteina}g distribuídos ao longo do dia" },
      { texto: "Priorizar alimentos de alta densidade calórica", sub: "Abacate, nozes, azeite, pasta de amêndoa" },
    ],
    checkin: ["Consegui 1.000 kcal sem fome", "Comi menos de 800 kcal", "Difícil comer sem apetite", "Encontrei alimentos que funcionam"],
    ia: {
      "Consegui 1.000 kcal sem fome": "Excelente! Comer sem fome é uma habilidade — e você está praticando. O metabolismo agradece.",
      "Comi menos de 800 kcal": "Amanhã vamos ajustar. Smoothie proteico de 380 kcal em 300ml é a solução — beba mesmo sem fome, como remédio.",
      "Difícil comer sem apetite": "Normal. Programe alarmes para cada 3h e tenha o smoothie pronto na geladeira. A primeiro semana é a mais difícil.",
      "Encontrei alimentos que funcionam": "Ótimo! Liste esses alimentos — eles vão ser sua base nos próximos meses.",
    },
    receita_id: 1,
    recompensa: "Nutrição estratégica iniciada 🎯",
    xp: 30,
  },
  {
    n: 2, titulo: "A lei da densidade: 1 colher = máxima nutrição",
    video: "Com estômago que aceita pouco,\nCada caloria precisa trabalhar mais.\n\nÉ o conceito de densidade nutricional:\n\nNão importa apenas quanto você come.\nImporta o que cada grama entrega.\n\n1 col sopa de azeite = 120 kcal\n1 col sopa de açúcar = 50 kcal\n\nQual você escolhe?\n\nHoje: cada garfada vai ser selecionada para entregar máxima nutrição.",
    explicacao: "Densidade calórica (kcal/g) e densidade nutricional (micronutrientes/kcal) são métricas opostas que precisam ser balanceadas. Para quem tem apetite suprimido pelo GLP-1, o ideal são alimentos de alta densidade calórica E alta densidade nutricional: gorduras saudáveis, proteínas concentradas e superalimentos.",
    missoes: [
      { texto: "Adicionar azeite ou manteiga ghee em TODA refeição", sub: "+120 kcal por colher sopa sem aumentar volume" },
      { texto: "Trocar alimentos aquosos por concentrados", sub: "Fruta fresca → pasta de fruta. Leite → iogurte grego" },
      { texto: "Calcular densidade: kcal ÷ gramas de cada alimento principal", sub: "Objetivo: > 2 kcal/g nas refeições" },
    ],
    checkin: ["Aumentei a densidade das refeições", "Adicionei gordura boa hoje", "Atingi 1.200 kcal com pouco volume", "Ainda abaixo do necessário"],
    ia: {
      "Aumentei a densidade das refeições": "Gordura saudável é o hack mais eficiente para atingir calorias com volume mínimo. Continue.",
      "Adicionei gordura boa hoje": "Azeite, abacate, nozes e ghee — são as quatro adições que mais aumentam kcal sem aumentar volume. Escolha sempre pelo menos uma.",
      "Atingi 1.200 kcal com pouco volume": "1.200 kcal com baixo apetite é uma vitória real. Você descobriu como nutrir o corpo mesmo quando ele não pede.",
      "Ainda abaixo do necessário": "Tudo bem — é um processo. Tente adicionar 1 col sopa de pasta de amêndoa no café e 1 fio de azeite extra no almoço. +200 kcal sem esforço.",
    },
    receita_id: 3,
    recompensa: "Mestre da densidade nutricional 🔬",
    xp: 35,
  },
  {
    n: 3, titulo: "Timing estratégico: quando comer supera quanto comer",
    video: "Para quem tem apetite baixo,\nO momento de comer é mais importante que a quantidade.\n\nSeu corpo tem janelas de maior absorção:\n\n30-45 min após acordar — pico de cortisol, alta absorção.\nApós atividade física — janela anabólica.\n30 min antes de dormir — síntese proteica noturna.\n\nSe você só consegue comer 3 pequenas refeições,\nEssas são as 3 janelas certas.",
    explicacao: "A cronobiologia da nutrição mostra que o mesmo alimento tem efeito diferente dependendo do horário. A manhã tem maior sensibilidade à insulina (melhor para carboidratos), o pós-treino tem captação muscular de proteína elevada, e a noite tem liberação de GH que usa proteína para reparação muscular.",
    missoes: [
      { texto: "Primeira refeição em até 45 min após acordar", sub: "Janela de cortisol = máxima absorção matinal" },
      { texto: "Proteína imediatamente após qualquer exercício", sub: "Janela anabólica: até 45 min pós-atividade" },
      { texto: "Caseína ou cottage 30 min antes de dormir", sub: "Proteína noturna = síntese muscular durante o sono" },
    ],
    checkin: ["Comi no horário do cortisol", "Proteína pós-exercício feita", "Lanche noturno proteico", "Timing melhorou minha energia"],
    ia: {
      "Comi no horário do cortisol": "Café da manhã nas primeiras 45 minutos ativa o metabolismo e reduz os picos de cortisol do resto do dia.",
      "Proteína pós-exercício feita": "Janela anabólica aproveitada. O músculo está captando aminoácidos com eficiência máxima agora.",
      "Lanche noturno proteico": "20-30g de caseína antes de dormir aumenta a síntese proteica noturna em 22% — estudo do Journal of Nutrition 2012.",
      "Timing melhorou minha energia": "Energia estável ao longo do dia é o resultado direto de alimentação nos momentos certos.",
    },
    receita_id: 4,
    recompensa: "Timing nutricional otimizado ⏱️",
    xp: 35,
  },
  {
    n: 4, titulo: "Micronutrientes: os invisíveis que ditam sua energia",
    video: "Você pode atingir 1.200 kcal por dia.\n\nE ainda assim se sentir péssimo.\n\nPor quê?\n\nPorque as calorias podem estar chegando sem os micronutrientes que fazem tudo funcionar.\n\nVitamina D. Magnésio. B12. Zinco. Ferro.\n\nCom pouco apetite, a ingestão desses nutrientes cai drasticamente.\n\nHoje você vai mapear e corrigir.",
    explicacao: "Durante a restrição calórica com baixo apetite, os micronutrientes são os primeiros a ficarem deficientes. Vitamina D, magnésio e B12 têm papel direto na síntese de energia celular (ATP) e na função mitocondrial. A deficiência se manifesta como fadiga, baixa imunidade e humor deprimido.",
    missoes: [
      { texto: "Multivitamínico completo hoje se não estiver tomando", sub: "Seguro de micronutrientes durante apetite baixo" },
      { texto: "Vitamina D + gordura (absorção depende de lipídios)", sub: "10-20 min de sol OU 2.000 UI suplementado" },
      { texto: "Magnésio: nozes, sementes ou suplemento", sub: "300-400mg/dia — eletrólito mais depleto no déficit" },
    ],
    checkin: ["Incluí multivitamínico hoje", "Tomei sol ou vitamina D", "Atingi magnésio pela alimentação", "Notei diferença na energia"],
    ia: {
      "Incluí multivitamínico hoje": "Multivitamínico é o safety net da nutrição restritiva. Não substitui alimento real, mas garante base mínima.",
      "Tomei sol ou vitamina D": "10 min de sol no rosto e braços às 10-14h = 1.000-4.000 UI de vitamina D3. É gratuito e mais eficiente que qualquer suplemento.",
      "Atingi magnésio pela alimentação": "Magnésio alimentar tem melhor absorção que suplementado. Continue priorizando nozes, sementes e leguminosas.",
      "Notei diferença na energia": "Energia melhorada com micronutrientes é a prova de que havia deficiência. Continue o protocolo.",
    },
    receita_id: 2,
    recompensa: "Micronutrientes mapeados 🔬",
    xp: 30,
  },
  {
    n: 5, titulo: "Como atingir 1.200 kcal sem sentir que está comendo",
    video: "O objetivo de hoje é provar para você mesmo:\n\nÉ possível atingir 1.200 kcal sem forçar nenhuma refeição grande.\n\nO segredo é a distribuição em 6 pequenos momentos:\n\n7h: Smoothie proteico — 380 kcal\n10h: Pasta de amêndoa com banana — 200 kcal\n13h: Bowl de abacate com ovo — 300 kcal\n16h: Cottage com frutas — 180 kcal\n19h: Mini steak com legumes — 300 kcal\n21h: Iogurte grego — 150 kcal\n\nTotal: 1.510 kcal\nVolume máximo por momento: 200ml",
    explicacao: "6 refeições de 200ml de volume distribuídas ao longo de 14 horas entregam mais que 1.200 kcal sem nunca estressar a capacidade gástrica reduzida pelo GLP-1. A chave é ter os alimentos preparados com antecedência para eliminar a barreira de preparo quando o apetite está zero.",
    missoes: [
      { texto: "Preparar 2 refeições futuras com antecedência hoje", sub: "Smoothie pronto na geladeira. Abacate cortado." },
      { texto: "Alarme a cada 2.5 horas para lembrar de comer", sub: "Sem alarme, apetite zero = refeição pulada" },
      { texto: "Contar calorias hoje — só hoje", sub: "Visibilidade dos números cria consciência real" },
    ],
    checkin: ["Atingi 1.200 kcal hoje", "Preparei refeições com antecedência", "Alarmes funcionaram", "Descobri que era mais fácil que pensei"],
    ia: {
      "Atingi 1.200 kcal hoje": "1.200 kcal com baixo apetite é a vitória mais difícil deste protocolo. Você provou que é possível.",
      "Preparei refeições com antecedência": "Meal prep é a estratégia número 1 para quem tem apetite baixo. Comida pronta = barreira zero = chance de comer.",
      "Alarmes funcionaram": "Alimentação por horário, não por fome. Para apetite suprimido, essa é a única estratégia que funciona consistentemente.",
      "Descobri que era mais fácil que pensei": "Quando a estratégia é certa, o esforço é menor. Continue com o sistema que funcionou hoje.",
    },
    receita_id: 5,
    recompensa: "1.200 kcal dominados 🎯",
    xp: 40,
  },
  {
    n: 6, titulo: "Superalimentos GLP-1: os 7 que você precisa conhecer",
    video: "Com apetite baixo, cada alimento precisa fazer mais.\n\nOs 7 superalimentos do GLP-1:\n\n1. Ovos — proteína completa + leucina + biotina\n2. Salmão — ômega-3 + vitamina D + proteína\n3. Abacate — gordura densa + potássio + folato\n4. Lentilha — ferro + proteína + fibra + folato\n5. Espinafre — magnésio + ferro + vitamina K\n6. Castanha-do-pará — selênio (2 unidades = 100% IDR)\n7. Iogurte grego — caseína + probióticos + cálcio\n\nCom esses 7 — você tem 80% da nutrição necessária.",
    explicacao: "Esses 7 alimentos foram selecionados por ter o maior índice de densidade nutricional (micronutrientes por caloria) entre os alimentos acessíveis. No contexto do GLP-1, onde o volume aceito é limitado, maximizar a densidade nutricional de cada porção é a estratégia mais eficiente.",
    missoes: [
      { texto: "Incluir pelo menos 4 dos 7 superalimentos hoje", sub: "Cobertura ampla de micronutrientes com volume mínimo" },
      { texto: "2 castanhas-do-pará no café da manhã", sub: "100% de selênio — detalhe que 99% ignora" },
      { texto: "Espinafre em pelo menos 1 refeição", sub: "Magnésio + ferro + vitamina K em 1 punhado" },
    ],
    checkin: ["Incluí 4+ superalimentos", "As 2 castanhas-do-pará feitas", "Espinafre na refeição", "Cardápio mais fácil do que esperava"],
    ia: {
      "Incluí 4+ superalimentos": "4 superalimentos por dia cobrem a maioria dos micronutrientes críticos. Com 7, você está no nível de otimização máxima.",
      "As 2 castanhas-do-pará feitas": "2 castanhas. Todos os dias. 100% do selênio. É o menor hábito com maior retorno nutricional que existe.",
      "Espinafre na refeição": "1 punhado de espinafre tem mais magnésio que a maioria dos suplementos de magnésio. E mais ferro que muitos alimentos 'ferrosos'.",
      "Cardápio mais fácil do que esperava": "A nutrição estratégica com poucos alimentos certos é mais simples que dietas complexas. Continue na simplicidade.",
    },
    receita_id: 1,
    recompensa: "Superalimentos dominados 🌟",
    xp: 35,
  },
  {
    n: 7, titulo: "Sustentabilidade nutricional com baixo apetite permanente",
    video: "Para muitas pessoas, o apetite baixo do GLP-1 é permanente.\n\nE isso é uma oportunidade — não um problema.\n\nVocê tem 7 dias de prática em nutrir o corpo sem fome.\n\nVocê sabe quais alimentos funcionam.\nVocê tem o sistema de alarmes.\nVocê conhece os superalimentos.\n\nEsse sistema que você criou esta semana — é para a vida.",
    explicacao: "A sustentabilidade nutricional com apetite cronicamente suprimido requer um sistema, não força de vontade. O sistema inclui: lista de alimentos de alta densidade nutricional, horários fixos de alimentação, preparo antecipado e suplementação de segurança. Com o sistema implementado, a nutrição se torna automática.",
    missoes: [
      { texto: "Criar lista definitiva dos 10 alimentos que funcionam para você", sub: "Personalização é mais poderosa que regra geral" },
      { texto: "Planejar a próxima semana com esses alimentos", sub: "Sistema pronto = decisão automática" },
      { texto: "Avaliar: o que aprendeu sobre seu corpo esta semana?", sub: "Autoconhecimento nutricional é permanente" },
    ],
    checkin: ["Completei os 7 dias", "Tenho meu sistema funcionando", "Aprendi a comer sem fome", "Confio que vou manter a nutrição"],
    ia: {
      "Completei os 7 dias": "7 dias de nutrição estratégica com apetite baixo. Você dominou o desafio mais subestimado do GLP-1.",
      "Tenho meu sistema funcionando": "Um sistema funcional é o único que se mantém a longo prazo. Você construiu o seu — agora é só executar.",
      "Aprendi a comer sem fome": "Comer por horário e por nutrição, não por fome — essa é a habilidade que vai proteger seu metabolismo para sempre.",
      "Confio que vou manter a nutrição": "Confiança baseada em evidência de 7 dias bem executados. Essa é a diferença entre esperança e certeza.",
    },
    receita_id: 2,
    recompensa: "PROTOCOLO NUTRICIONAL COMPLETO 🏆",
    xp: 100,
  },
];

export default function Protocolo6({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={6}
      emoji="🥗"
      nome="Alimentação para Baixo Apetite"
      storageKey="glpy_baixoapetite"
      receitas={RECEITAS}
      dias={DIAS}
      videos={VIDEOS}
      onNavigate={onNavigate}
    />
  );
}
