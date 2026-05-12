import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const VIDEOS: Record<number, string> = {
  1: "https://glpy.b-cdn.net/PROTOCOLO-3-ANTI-QUEDA-DE-CABELO/dia1-anti-queda-de-cabelo.mp4",
  2: "https://glpy.b-cdn.net/PROTOCOLO-3-ANTI-QUEDA-DE-CABELO/dia2-anti-queda-de-cabelo.mp4",
  3: "https://glpy.b-cdn.net/PROTOCOLO-3-ANTI-QUEDA-DE-CABELO/dia3-anti-queda-de-cabelo.mp4",
  4: "https://glpy.b-cdn.net/PROTOCOLO-3-ANTI-QUEDA-DE-CABELO/dia4-anti-queda-de-cabelo.mp4",
  5: "https://glpy.b-cdn.net/PROTOCOLO-3-ANTI-QUEDA-DE-CABELO/dia5-anti-queda-de-cabelo.mp4",
  6: "https://glpy.b-cdn.net/PROTOCOLO-3-ANTI-QUEDA-DE-CABELO/dia6-anti-queda-de-cabelo.mp4",
  7: "https://glpy.b-cdn.net/PROTOCOLO-3-ANTI-QUEDA-DE-CABELO/dia7-anti-queda-de-cabelo.mp4",
};

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🥚", nome: "Omelete Capilar com Castanha-do-Pará",
    kcal: 320, proteina: 26, carbs: 5, gordura: 22,
    categoria: "Café da manhã",
    desc: "Biotina dos ovos + selênio das castanhas + zinc do queijo. Os três nutrientes mais críticos para o ciclo capilar em uma única refeição.",
    ingredientes: ["3 ovos inteiros", "2 castanhas-do-pará picadas", "30g queijo minas", "Espinafre 1 punhado", "Azeite 1 fio"],
    preparo: "Bata os ovos. Salteie o espinafre brevemente. Faça o omelete com todos os ingredientes. Sirva com as castanhas por cima.",
    glp1tip: "Os ovos contêm biotina (B7) na forma mais biodisponível. Evite consumir clara crua — a avidina crua bloqueia a absorção de biotina. Sempre cozido.",
    dias: [1, 3, 5],
  },
  {
    id: 2, emoji: "🐟", nome: "Salmão Grelhado com Quinoa",
    kcal: 420, proteina: 38, carbs: 32, gordura: 14,
    categoria: "Almoço",
    desc: "Ômega-3 do salmão reduz a inflamação do couro cabeludo. Quinoa é o único grão com todos os aminoácidos essenciais para síntese de queratina.",
    ingredientes: ["150g filé de salmão", "100g quinoa cozida", "Limão e ervas finas", "Azeite extra-virgem", "Rúcula à vontade"],
    preparo: "Grelhe o salmão 4 min cada lado. Sirva sobre quinoa com rúcula, limão e azeite.",
    glp1tip: "O salmão tem DHA e EPA que reduzem a prostaglandina E2 — mediador inflamatório que acelera a queda no telogen effluvium. 3x por semana é o ideal.",
    dias: [2, 4, 7],
  },
  {
    id: 3, emoji: "🫘", nome: "Dal de Lentilha com Espinafre",
    kcal: 310, proteina: 18, carbs: 42, gordura: 7,
    categoria: "Almoço · Jantar",
    desc: "Ferro biodisponível (não-heme) do espinafre + vitamina C do tomate para absorção. Ferritina baixa é a causa mais comum de queda de cabelo — e mais subestimada.",
    ingredientes: ["150g lentilha vermelha", "2 xícaras espinafre fresco", "1 tomate picado", "Cúrcuma, cominho, alho", "200ml caldo de legumes"],
    preparo: "Cozinhe lentilha com especiarias. Adicione espinafre nos últimos 5 min. Finalize com tomate fresco.",
    glp1tip: "Vitamina C do tomate aumenta absorção do ferro não-heme em até 3x. Sempre combine ferro vegetal + vitamina C na mesma refeição.",
    dias: [1, 4, 6],
  },
  {
    id: 4, emoji: "🥜", nome: "Mix Capilar de Sementes",
    kcal: 220, proteina: 7, carbs: 12, gordura: 17,
    categoria: "Lanche",
    desc: "Sementes de abóbora têm o maior teor de zinco entre os alimentos vegetais. Girassol entrega vitamina E que protege os fios da oxidação.",
    ingredientes: ["20g sementes de abóbora", "20g sementes de girassol", "10g linhaça dourada", "1 col chá azeite extra-virgem", "Pitada de sal rosa"],
    preparo: "Misture tudo. Pode ser comido puro ou polvilhado sobre iogurte, salada ou sopas.",
    glp1tip: "30g de semente de abóbora = 3mg de zinco = 27% da necessidade diária. A deficiência de zinco é a segunda causa mais comum de queda no GLP-1 depois da ferritina.",
    dias: [3, 5, 7],
  },
  {
    id: 5, emoji: "🥩", nome: "Contrafilé com Brócolis no Vapor",
    kcal: 390, proteina: 42, carbs: 12, gordura: 18,
    categoria: "Jantar",
    desc: "Carne vermelha tem zinco heme (alta absorção) + ferro heme + B12 + creatina. O prato mais completo para nutrição capilar em uma porção.",
    ingredientes: ["150g contrafilé grelhado", "150g brócolis no vapor", "Alho, sal e pimenta", "Azeite 1 fio"],
    preparo: "Grelhe o contrafilé ao ponto. Vapore o brócolis por 5 min (não demais — perde vitamina C). Sirva com alho.",
    glp1tip: "O zinco da carne vermelha tem absorção 40% maior que o vegetal. 3-4 porções semanais cobrem 80% da necessidade de zinco sem suplementação.",
    dias: [2, 6],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "Telogen effluvium: a ciência por trás da queda no GLP-1",
    video: "Seu cabelo está caindo mais.\n\nIsso não é efeito colateral do remédio.\n\nÉ efeito do emagrecimento rápido.\n\nQualquer perda de mais de 5kg em 3 meses pode causar telogen effluvium — uma fase de queda acelerada onde 30-40% dos fios entram em fase de repouso simultaneamente.\n\nA boa notícia:\n\nÉ reversível.\nTem prazo definido.\nE você pode reduzir a intensidade com nutrição certa.",
    explicacao: "O telogen effluvium ocorre quando um estresse fisiológico (neste caso, déficit calórico e perda de peso rápida) sinaliza ao folículo capilar para interromper o crescimento e entrar na fase de queda (telogen). Isso acontece 2-3 meses após o estresse inicial, e a recuperação começa após 6-12 meses.",
    missoes: [
      { texto: "Proteína acima de {proteina}g hoje", sub: "Queratina é proteína — cabelo precisa de aminoácidos" },
      { texto: "Ferro + vitamina C na mesma refeição", sub: "Ferritina baixa é a causa #1 de queda de cabelo" },
      { texto: "Zinco em pelo menos uma refeição", sub: "Semente de abóbora, carne vermelha ou ostra" },
    ],
    checkin: ["Queda moderada, vou me cuidar", "Queda intensa — muito assustador", "Queda ainda não percebida", "Queda estabilizou"],
    ia: {
      "Queda moderada, vou me cuidar": "A decisão de agir preventivamente é a melhor que pode tomar. Nutrição capilar reduz significativamente a intensidade e duração do telogen effluvium.",
      "Queda intensa — muito assustador": "Sei que é assustador. Mas o cabelo vai crescer de volta — sempre cresce. O protocolo de hoje vai reduzir a perda já nas próximas semanas.",
      "Queda ainda não percebida": "Ação preventiva é melhor que reativa. Continue o protocolo — você está protegendo seus fios antes da queda começar.",
      "Queda estabilizou": "Estabilização é o primeiro sinal de recuperação! Continue com nutrição capilar para acelerar o fase de crescimento.",
    },
    receita_id: 3,
    recompensa: "Base capilar iniciada 💆",
    xp: 30,
  },
  {
    n: 2, titulo: "Proteína: o tijolo de cada fio de cabelo",
    video: "O cabelo é 95% queratina.\n\nQueratina é proteína.\n\nQuando você come menos — o corpo faz uma lista de prioridades:\n1. Coração\n2. Pulmão\n3. Fígado\n4. Músculo\n5. Cabelo\n\nCabelo está no final da lista.\n\nQualquer déficit proteico, por menor que seja, o cabelo paga primeiro.\n\nHoje: proteína acima de tudo.",
    explicacao: "A queratina é composta principalmente de cisteína, glicina e prolina. Durante o déficit calórico do GLP-1, a síntese de queratina compete com a síntese de proteínas musculares e enzimáticas — e perde. A ingestão proteica acima de 1.5g/kg/dia garante aminoácidos suficientes para cabelo E músculo.",
    missoes: [
      { texto: "Proteína completa nas 3 refeições principais", sub: "Ovo, frango, peixe ou carne — não proteína vegetal isolada" },
      { texto: "Metionina: 1 ovo + 30g queijo + 30g carne hoje", sub: "Aminoácido sulfurado essencial para queratina" },
      { texto: "Colágeno hidrolisado: 10g no café ou vitamina", sub: "Fornece glicina e prolina específicos para fios" },
    ],
    checkin: ["Bati {proteina}g de proteína", "Dificuldade de comer proteína suficiente", "Inclui colágeno hoje", "Entendi a conexão proteína-cabelo"],
    ia: {
      "Bati {proteina}g de proteína": "Proteína adequada já está ativando a síntese de queratina. Em 4-6 semanas você vai sentir a diferença na textura dos fios.",
      "Dificuldade de comer proteína suficiente": "Whey proteico é aliado: 30g de proteína em 200ml. Adicione no café, no iogurte ou na aveia. Sem sabor e sem náusea.",
      "Inclui colágeno hoje": "Colágeno tipo I fornece os aminoácidos exatos que o folículo capilar precisa. Continue todos os dias.",
      "Entendi a conexão proteína-cabelo": "Entendimento é o primeiro passo. Agora execute — a consistência proteica por 60 dias faz a diferença real.",
    },
    receita_id: 2,
    recompensa: "Base proteica capilar estabelecida 🧬",
    xp: 35,
  },
  {
    n: 3, titulo: "Zinco: o mineral que salva os fios",
    video: "O zinco é o nutriente mais estudado para queda de cabelo.\n\nAtua em TRÊS vias:\n1. Síntese proteica do folículo\n2. Metabolismo da 5-alfa-redutase (que transforma testosterona em DHT)\n3. Reparação do DNA da célula capilar\n\nDeficiência de zinco:\nQueda acelerada. Fios finos. Recuperação lenta.\n\nZinco adequado:\nFolículo forte. Ciclo capilar normal. Fios mais grossos.",
    explicacao: "O zinco inibe a enzima 5-alfa-redutase, que converte testosterona em DHT. DHT elevado é o principal hormônio de queda androgenética. Durante o GLP-1, o estresse metabólico aumenta a atividade desta enzima — o zinco é o bloqueador natural mais estudado.",
    missoes: [
      { texto: "Meta de zinco hoje: 11mg (homens) ou 8mg (mulheres)", sub: "Carne vermelha, ostra ou semente de abóbora" },
      { texto: "Vitamina A com a refeição do zinco", sub: "Aumenta absorção de zinco em 50%" },
      { texto: "Sem álcool — reduz absorção de zinco em 40%", sub: "Qualquer bebida alcoólica cancela o suplemento" },
    ],
    checkin: ["Comi alimento rico em zinco", "Sinto o couro cabeludo mais sensível", "Queda menor esta semana", "Adicionei suplemento de zinco"],
    ia: {
      "Comi alimento rico em zinco": "Zinco alimentar tem absorção 3x melhor que suplemento. Continue priorizando a fonte alimentar.",
      "Sinto o couro cabeludo mais sensível": "Sensibilidade no couro cabeludo pode indicar inflamação ativa. Adicione salmão 3x/semana — o ômega-3 é anti-inflamatório capilar.",
      "Queda menor esta semana": "Redução da queda já na primeira semana é um sinal excelente de que o protocolo está funcionando.",
      "Adicionei suplemento de zinco": "Se for zinco suplementar, prefira zinco quelato ou glicinato — absorção 60% maior que óxido de zinco. Tome com alimento para evitar náusea.",
    },
    receita_id: 4,
    recompensa: "Zinco ativado 🌿",
    xp: 30,
  },
  {
    n: 4, titulo: "Biotina: a verdade sobre o suplemento mais vendido",
    video: "Biotina é o suplemento de cabelo mais vendido do mundo.\n\nE o mais mal compreendido.\n\nA biotina funciona SE você tem deficiência.\nSe não tem deficiência — não faz nada para o cabelo.\n\nE a maioria das pessoas não tem deficiência de biotina.\n\nMas VOCÊ pode ter.\n\nPor que?\n\nO GLP-1 reduz drasticamente a ingestão de ovos, frango e nozes — as maiores fontes de biotina.\n\nSe você está comendo menos desde que começou o tratamento, suplementar faz sentido.",
    explicacao: "A biotina (B7) é cofatora de enzimas carboxilases envolvidas na síntese de ácidos graxos do fio e no metabolismo de aminoácidos sulfurados. A deficiência causa queda, unhas quebradiças e dermatite seborreica. Durante déficit calórico, risco de depleção é real.",
    missoes: [
      { texto: "Ovos hoje — pelo menos 2 unidades inteiras", sub: "1 ovo = 10mcg biotina, a forma mais biodisponível" },
      { texto: "Verificar se seu multivitamínico tem biotina", sub: "30-100mcg/dia é suficiente se a dieta for restrita" },
      { texto: "Nozes ou amêndoas no lanche de hoje", sub: "Biotina vegetal + ômega-3 = proteção dupla" },
    ],
    checkin: ["Comi ovos hoje", "Tomei suplemento de biotina", "Unhas melhorando junto", "Cabelo com menos oleosidade"],
    ia: {
      "Comi ovos hoje": "2 ovos inteiros cobrem 40% da necessidade diária de biotina. Mais eficaz e mais barato que qualquer suplemento.",
      "Tomei suplemento de biotina": "Lembre: biotina em doses altas (>5mg) pode interferir em exames de TSH e troponina. Informe seu médico se for fazer exames.",
      "Unhas melhorando junto": "Cabelo e unhas usam as mesmas proteínas estruturais. Melhora nas unhas é um marcador confiável de que a nutrição capilar está funcionando.",
      "Cabelo com menos oleosidade": "Menos oleosidade indica regulação do sebo do couro cabeludo — relacionado à melhora do zinco e das vitaminas B.",
    },
    receita_id: 1,
    recompensa: "Biotina e B vitaminas otimizadas 🧬",
    xp: 30,
  },
  {
    n: 5, titulo: "Ferro e ferritina: a conexão esquecida",
    video: "A causa mais comum de queda de cabelo em mulheres.\n\nA mais negligenciada pelos médicos.\n\nA mais fácil de corrigir com nutrição.\n\nFerritina baixa.\n\nFerritina é a proteína que armazena ferro no organismo.\n\nQuando a ferritina cai abaixo de 30 ng/ml — o folículo capilar começa a fechar.\n\nNo GLP-1, a redução da ingestão alimentar faz isso acontecer em semanas.",
    explicacao: "A ferritina abaixo de 40 ng/ml está associada a queda de cabelo mesmo na ausência de anemia. O folículo capilar é um dos tecidos de maior demanda de ferro no organismo — quando os estoques caem, o corpo redireciona o ferro para órgãos vitais e o cabelo sofre primeiro.",
    missoes: [
      { texto: "Solicitar exame de ferritina na próxima consulta", sub: "Ferritina < 40 ng/ml = suplementação necessária" },
      { texto: "Vitamina C em toda refeição com ferro", sub: "Triplica a absorção do ferro não-heme" },
      { texto: "Evitar café e chá nas 2h após a refeição ferrosa", sub: "Taninos bloqueiam absorção em até 70%" },
    ],
    checkin: ["Já tenho exame de ferritina", "Vou pedir o exame", "Comi ferro hoje + vitamina C", "Sei que minha ferritina é baixa"],
    ia: {
      "Já tenho exame de ferritina": "Ótimo. Se estiver abaixo de 40 ng/ml, converse com seu médico sobre suplementação. A reposição leva 3-6 meses para resultado capilar.",
      "Vou pedir o exame": "Peça ferritina + ferro sérico + transferrina + VCM. Esse painel completo mapeia toda a situação do ferro.",
      "Comi ferro hoje + vitamina C": "Combinação certa! Continue esse padrão todos os dias. O corpo não armazena bem a vitamina C, então precisa na mesma refeição.",
      "Sei que minha ferritina é baixa": "Se já sabe que é baixa, a suplementação deve ser feita com acompanhamento médico. Sulfato ferroso é eficaz mas pode causar náusea — tome com alimento.",
    },
    receita_id: 3,
    recompensa: "Ferro e ferritina mapeados 🔬",
    xp: 35,
  },
  {
    n: 6, titulo: "Cuidado externo: o que fazer no couro cabeludo",
    video: "Nutrição interna é 70% do resultado.\n\nMas os 30% externos também importam.\n\nQuando o couro cabeludo está inflamado — a queda acelera.\n\nO GLP-1 não causa inflamação diretamente.\nMas o estresse, o déficit calórico e a alteração hormonal criam o ambiente certo para ela.\n\nHoje: o protocolo externo.",
    explicacao: "O microbioma do couro cabeludo influencia o ciclo capilar. Champôs com sulfatos agressivos, calor excessivo e falta de massagem reduzem a circulação local e o pH ideal. A massagem capilar de 4 minutos/dia por 24 semanas aumentou a espessura dos fios em estudo japonês publicado no Eplasty.",
    missoes: [
      { texto: "Massagem capilar de 4 min (com as pontas dos dedos)", sub: "Aumenta circulação — comprovado em estudo de 24 semanas" },
      { texto: "Champô sem sulfato esta semana", sub: "SLS irrita o couro cabeludo inflamado" },
      { texto: "Temperatura máxima do chuveiro: morna", sub: "Água quente abre a cutícula e aumenta a quebra" },
    ],
    checkin: ["Fiz a massagem capilar", "Troquei o champô", "Cabelo parece mais forte", "Couro cabeludo menos sensível"],
    ia: {
      "Fiz a massagem capilar": "4 minutos por dia. Consistência por 24 semanas. Os estudos são claros: funciona, mas precisa de tempo.",
      "Troquei o champô": "Champôs com ketoconazol 1% têm efeito anti-inflamatório adicional no couro cabeludo. Pode pedir ao dermatologista se a queda for intensa.",
      "Cabelo parece mais forte": "Fios mais fortes são o primeiro sinal de que os folículos estão recebendo mais nutrientes. A redução da queda vem depois.",
      "Couro cabeludo menos sensível": "Sensibilidade reduzida = inflamação local reduzida. O protocolo interno + externo está funcionando.",
    },
    receita_id: 4,
    recompensa: "Protocolo externo ativado 💆",
    xp: 30,
  },
  {
    n: 7, titulo: "A queda vai parar. Veja o cronograma exato.",
    video: "Deixa eu te dar algo que poucos médicos explicam:\n\nO cronograma real do telogen effluvium.\n\nMês 1-3: Queda aumenta\nMês 3-4: Queda no pico\nMês 4-6: Queda começa a reduzir\nMês 6-12: Crescimento de novos fios visível\nMês 12-18: Cabelo completamente recuperado\n\nIsso com nutrição adequada.\nSem a nutrição: o prazo dobra.\n\nVocê escolheu fazer certo.",
    explicacao: "O ciclo capilar humano dura em média 3-6 anos (fase anágena), seguido de 2-3 semanas de transição (catágena) e 3-4 meses de queda (telógena). No telogen effluvium, mais folículos entram na fase telógena simultaneamente. A recuperação é a fase anágena sendo reiniciada — e a nutrição adequada acelera esse processo.",
    missoes: [
      { texto: "Revisar o protocolo de 6 dias — o que funcionou mais", sub: "Leve as melhores práticas para o hábito permanente" },
      { texto: "Foto do cabelo hoje para comparar em 3 meses", sub: "O progresso real é invisível dia a dia" },
      { texto: "Definir 3 hábitos capilares permanentes", sub: "Massagem, proteína e zinco são os não-negociáveis" },
    ],
    checkin: ["Completei os 7 dias", "Mais confiante sobre a queda", "Aprendi muito sobre nutrição capilar", "Vou manter o protocolo"],
    ia: {
      "Completei os 7 dias": "7 dias de protocolo capilar estruturado. Você criou a base nutricional que a maioria negligencia — e vai ver a diferença.",
      "Mais confiante sobre a queda": "Conhecimento transforma o medo em ação. A queda é temporária — a nutrição que você aprendeu é permanente.",
      "Aprendi muito sobre nutrição capilar": "Zinco, biotina, ferro, proteína e ômega-3 — você agora tem o protocolo completo.",
      "Vou manter o protocolo": "A consistência por 6 meses vai transformar completamente o estado dos seus fios. O cabelo que cresce agora é mais forte que o que caiu.",
    },
    receita_id: 5,
    recompensa: "PROTOCOLO ANTI-QUEDA COMPLETO 🏆",
    xp: 100,
  },
];

export default function Protocolo3({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={3}
      emoji="💇"
      nome="Anti-Queda de Cabelo"
      storageKey="glpy_cabelo"
      receitas={RECEITAS}
      dias={DIAS}
      videos={VIDEOS}
      onNavigate={onNavigate}
    />
  );
}
