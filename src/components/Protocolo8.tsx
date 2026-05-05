import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🥩", nome: "Fígado Bovino com Cebola Caramelizada",
    kcal: 310, proteina: 30, carbs: 14, gordura: 14,
    categoria: "Almoço · Jantar",
    desc: "O alimento mais denso em ferro heme, B12 e B6 do planeta. 100g de fígado bovino tem 6x mais ferro que filé mignon e 70mcg de B12 — 2.916% da IDR.",
    ingredientes: ["150g fígado bovino fatiado", "2 cebolas médias", "Alho, louro, sal e pimenta", "Azeite 1 fio", "Limão"],
    preparo: "Marine o fígado no limão por 15 min. Caramelize a cebola em fogo baixo por 20 min. Sele o fígado 2 min cada lado. Sirva com a cebola.",
    glp1tip: "B12 do fígado é a forma metilcobalamina — a mais biodisponível. Absorção do fígado de B12 é 3x melhor que do suplemento ciano-cobalamina.",
    dias: [1, 4, 6],
  },
  {
    id: 2, emoji: "🐟", nome: "Sardinha Fresca com Tomate e Ervas",
    kcal: 340, proteina: 32, carbs: 8, gordura: 20,
    categoria: "Almoço",
    desc: "Sardinha tem B12 + ômega-3 + ferro + vitamina D — os quatro nutrientes mais deficientes em quem tem fadiga no GLP-1. Uma refeição, quatro soluções.",
    ingredientes: ["200g sardinha fresca ou 2 latas em azeite", "Tomate picado", "Cebola roxa", "Limão, azeite e ervas frescas"],
    preparo: "Grelhe as sardinhas frescas (4 min cada lado) ou sirva a lata direto. Monte com tomate, cebola e ervas.",
    glp1tip: "Vitamina D da sardinha é a D3 — mesma forma produzida pelo sol, 87% mais eficaz que D2 dos suplementos vegetais. 100g de sardinha = 250 UI de D3.",
    dias: [2, 5],
  },
  {
    id: 3, emoji: "🥦", nome: "Sopa Energizante de Lentilha",
    kcal: 290, proteina: 16, carbs: 42, gordura: 6,
    categoria: "Jantar · Fadiga",
    desc: "Lentilha tem o maior teor de folato entre as leguminosas — essencial para síntese de ATP. Espinafre entrega magnésio que ativa 300 enzimas do metabolismo energético.",
    ingredientes: ["150g lentilha vermelha", "100g espinafre", "1 cenoura", "Cúrcuma, cominho, alho", "Caldo de legumes 500ml"],
    preparo: "Cozinhe a lentilha com especiarias por 20 min. Adicione cenoura em cubo e espinafre. Bata metade para textura cremosa.",
    glp1tip: "Cúrcuma + pimenta preta ativa a curcumina que tem ação mitocondrial comprovada — aumenta biogênese mitocondrial, melhorando produção de energia celular.",
    dias: [1, 3, 7],
  },
  {
    id: 4, emoji: "🫐", nome: "Smoothie de Espinafre com Tâmaras",
    kcal: 320, proteina: 22, carbs: 44, gordura: 6,
    categoria: "Café da manhã · Fadiga",
    desc: "Para os dias de fadiga intensa. As tâmaras têm glicose natural de rápida absorção + potássio + ferro. O espinafre entrega magnésio sem amargor no smoothie.",
    ingredientes: ["2 punhados espinafre baby", "3 tâmaras sem caroço", "25g whey baunilha", "200ml leite de coco", "Gelo"],
    preparo: "Bata tudo no liquidificador. O espinafre não tem sabor no smoothie — funciona como booster nutricional invisível.",
    glp1tip: "Tâmaras têm índice glicêmico médio apesar do sabor doce — o alto teor de fibra retarda a absorção. Energia rápida sem pico de insulina.",
    dias: [2, 4, 6],
  },
  {
    id: 5, emoji: "☕", nome: "Café com MCT e Colágeno",
    kcal: 210, proteina: 10, carbs: 2, gordura: 18,
    categoria: "Café da manhã · Energia matinal",
    desc: "MCT (ácidos graxos de cadeia média) são convertidos em cetona pelo fígado em 3h — combustível cerebral de rápida disponibilidade. Colágeno fornece glicina para síntese de ATP.",
    ingredientes: ["200ml café espresso ou coado forte", "1 col sopa óleo de coco ou MCT", "10g colágeno hidrolisado", "Opcional: 1 col chá manteiga ghee"],
    preparo: "Bata o café quente com MCT e colágeno no liquidificador por 20 segundos. Fica cremoso e espumado.",
    glp1tip: "MCT é convertido em acetil-CoA diretamente, sem necessidade de carnitina — entra na mitocôndria mais rápido que qualquer gordura. Ideal para energia rápida sem pico de glicose.",
    dias: [3, 5, 7],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "Fadiga no GLP-1: o triângulo ferro-B12-sono",
    video: "Você está cansado.\n\nNão é frescura.\nNão é falta de motivação.\n\nÉ bioquímica.\n\n3 causas mais comuns de fadiga no GLP-1:\n\n1. Ferro baixo — o transportador de oxigênio caiu\n2. B12 baixo — a mitocôndria não produz energia direito\n3. Sono ruim — a recuperação não aconteceu\n\nO protocolo de 7 dias vai resolver cada uma.",
    explicacao: "A fadiga no GLP-1 tem causas múltiplas e simultâneas. O déficit calórico reduz a ingestão de ferro e B12. A perda de peso rápida aumenta a demanda de B12 para síntese de novas células. O sono pode ser perturbado por câimbras (magnésio) ou refluxo noturno. Identificar a causa específica é o primeiro passo.",
    missoes: [
      { texto: "Solicitar hemograma + ferro sérico + B12 + vitamina D", sub: "Exames básicos que revelam 80% das causas de fadiga" },
      { texto: "Fígado ou sardinha esta semana (ferro + B12)", sub: "As duas melhores fontes alimentares dos dois nutrientes" },
      { texto: "Higiene do sono: apagar telas 1h antes de dormir", sub: "Luz azul suprime melatonina — prejudica recuperação" },
    ],
    checkin: ["Fadiga intensa hoje", "Fadiga moderada, consigo funcionar", "Energia ok nos primeiros 2h", "Identificei quando fico mais cansado"],
    ia: {
      "Fadiga intensa hoje": "Fadiga intensa sugere deficiência real — não é normal nem aceitável. Peça os exames o quanto antes.",
      "Fadiga moderada, consigo funcionar": "Fadiga moderada responde bem ao protocolo nutricional desta semana. Os resultados aparecem em 2-3 semanas.",
      "Energia ok nos primeiros 2h": "Energia que cai ao longo do dia sugere hipoglicemia reativa. Solução: carboidrato de baixo IG no café da manhã.",
      "Identificei quando fico mais cansado": "Excelente! Horário específico de fadiga indica causa específica. Tarde → glicose. Manhã → sono. Constante → ferro/B12.",
    },
    receita_id: 3,
    recompensa: "Causas de fadiga mapeadas 🔬",
    xp: 30,
  },
  {
    n: 2, titulo: "Ferro: o mineral que o GLP-1 drena silenciosamente",
    video: "O GLP-1 não drena ferro diretamente.\n\nMas o faz indiretamente:\n\nComo você está comendo menos carne vermelha?\nComo você está bebendo chá após as refeições?\nComo sua ingestão de vitamina C reduziu?\n\nEssas três mudanças — comuns em quem está no GLP-1 —\nPodem reduzir a absorção de ferro em 60-80%.\n\nE a ferritina cai.\nE a hemoglobina cai.\nE você fica cansado.",
    explicacao: "A deficiência de ferro começa meses antes de aparecer no hemograma como anemia. A ferritina abaixo de 30 ng/ml já causa sintomas: fadiga, falta de ar, dificuldade de concentração e queda de cabelo. A absorção do ferro não-heme (vegetal) é 3-5% vs 15-35% do ferro heme (carne) — priorizar fonte animal é fundamental.",
    missoes: [
      { texto: "Vitamina C em TODA refeição com ferro", sub: "Suco de limão ou tomate fresco triplica a absorção" },
      { texto: "Sem chá ou café nas 2h após refeição ferrosa", sub: "Taninos bloqueiam ferro — o erro mais comum" },
      { texto: "Carne vermelha pelo menos 2x esta semana", sub: "Ferro heme: absorção 15-35% vs 3-5% do vegetal" },
    ],
    checkin: ["Incluí vitamina C com o ferro", "Evitei chá após a refeição", "Comi carne vermelha hoje", "Entendi por que estava errando"],
    ia: {
      "Incluí vitamina C com o ferro": "Ácido ascórbico reduz o ferro de Fe3+ para Fe2+ — a forma que os enterócitos absorvem. Simples e poderoso.",
      "Evitei chá após a refeição": "Taninos do chá e café inibem a ferritina e reduzem absorção em 60-70%. Espere mínimo 1h após comer.",
      "Comi carne vermelha hoje": "Ferro heme passa direto pela mucosa intestinal sem necessitar de conversão — absorção garantida independente do pH gástrico.",
      "Entendi por que estava errando": "Autoconhecimento é a primeira correção. O próximo passo é aplicar consistentemente por 30 dias para restaurar os estoques.",
    },
    receita_id: 1,
    recompensa: "Protocolo de ferro otimizado ⚡",
    xp: 35,
  },
  {
    n: 3, titulo: "Vitamina B12: a vitamina que quase todos precisam suplementar",
    video: "A deficiência de B12 é a mais sub-diagnosticada no Brasil.\n\nE no GLP-1, o risco dobra.\n\nPor quê?\n\nO GLP-1 reduz a produção de ácido gástrico.\nO ácido gástrico é necessário para separar B12 do alimento.\n\nSem ácido suficiente — a B12 passa sem ser absorvida.\n\nSolução: B12 sublingual (passa direto para a corrente sanguínea).\nOu: injeção mensal de B12 (prescrita pelo médico).\nOu: doses alimentares muito altas (fígado, sardinha).",
    explicacao: "A B12 é cofatora essencial da síntese de mielina, da produção de hemácias e do ciclo do metionina-homocisteína. Deficiência causa anemia megaloblástica, neuropatia periférica e fadiga profunda. GLP-1 reduz o fator intrínseco e o ácido gástrico necessários para absorção — monitoramento regular é essencial.",
    missoes: [
      { texto: "Pesquisar B12 sublingual ou metilcobalamina", sub: "Bypass gástrico = absorção garantida independente de HCl" },
      { texto: "Fígado bovino OU sardinha esta semana", sub: "As únicas fontes com B12 em quantidade terapêutica" },
      { texto: "Verificar se faz exame de B12 há mais de 6 meses", sub: "Deficiência subclínica aparece antes dos sintomas" },
    ],
    checkin: ["Já tomo B12 sublingual", "Vou pesquisar a suplementação", "Comi fígado ou sardinha", "Nunca fiz exame de B12"],
    ia: {
      "Já tomo B12 sublingual": "Sublingual é o formato ideal para quem usa GLP-1 — não depende do fator intrínseco gástrico para absorção.",
      "Vou pesquisar a suplementação": "Metilcobalamina sublingual (1000mcg/dia) é o protocolo padrão. Barato, seguro e eficaz.",
      "Comi fígado ou sardinha": "100g de fígado bovino = 70mcg de B12 — doses alimentares terapêuticas. Continue 2-3x/semana.",
      "Nunca fiz exame de B12": "Peça B12 sérica + homocisteína. Homocisteína elevada é o marcador mais precoce de deficiência funcional de B12.",
    },
    receita_id: 2,
    recompensa: "B12 e metabolismo energético otimizados 🧬",
    xp: 35,
  },
  {
    n: 4, titulo: "O protocolo de sono para maximizar a energia diurna",
    video: "O sono é o suplemento gratuito mais poderoso que existe.\n\n1h a menos de sono:\n+26% de cortisol\n+24% de grelina\n-20% de leptina\n\nEssas mudanças hormonais:\nAumentam fome.\nReduzem saciedade.\nElimina o efeito do GLP-1.\n\nOtimizar o sono não é opcional no tratamento.\nÉ parte do protocolo.",
    explicacao: "Durante o sono profundo (ondas delta), o GH (hormônio do crescimento) é liberado em pulso, ativando síntese muscular e oxidação de gordura. Privação de sono reduz a sensibilidade à insulina em 24h — revertendo parte dos benefícios do GLP-1. 7-9 horas com boa arquitetura de sono é tão importante quanto a medicação.",
    missoes: [
      { texto: "Temperatura do quarto entre 18-20°C", sub: "Temperatura ideal para sono profundo e GH" },
      { texto: "Sem tela 1h antes de dormir — regra absoluta", sub: "Luz azul suprime melatonina por até 3h" },
      { texto: "Magnésio glicinato 300mg antes de dormir", sub: "Relaxa musculatura e facilita ondas delta" },
    ],
    checkin: ["Dormi 7-9h esta noite", "Acordei descansado", "Sono fragmentado ou difícil", "Câimbras me acordaram"],
    ia: {
      "Dormi 7-9h esta noite": "Sono adequado = GH máximo = queima de gordura + síntese muscular noturna. Os resultados aparecem no longo prazo.",
      "Acordei descansado": "Sono reparador é o estado onde o GLP-1 potencializa mais. Seu metabolismo trabalhou 8h durante o sono.",
      "Sono fragmentado ou difícil": "Sono fragmentado sugere cortisol elevado. Protocolo: banho quente (não muito quente) 1h antes de dormir.",
      "Câimbras me acordaram": "Câimbras = deficiência de magnésio ou potássio. Magnésio glicinato 300mg ao dormir resolve em 2-3 dias.",
    },
    receita_id: 4,
    recompensa: "Sono e recuperação otimizados 🌙",
    xp: 35,
  },
  {
    n: 5, titulo: "Hidratação inteligente: eletrólitos, não só água",
    video: "Beber 2L de água por dia.\n\nTodo mundo sabe isso.\n\nMas ninguém te conta que água pura sem eletrólitos\nPode piorar a fadiga.\n\nEliminar eletrólitos pela urina enquanto bebe muita água\nCria um estado chamado hiponatremia leve —\nQue manifesta como fadiga, névoa mental e câimbras.\n\nA solução é simples:\nAdicione eletrólitos à sua água.",
    explicacao: "O GLP-1 tem leve efeito diurético via redução do peptídeo natriurético. Com menos apetite, a ingestão de sódio, potássio e magnésio também cai. A combinação leva à depleção de eletrólitos que prejudica a condução nervosa, a contração muscular e a produção de energia celular.",
    missoes: [
      { texto: "Adicionar pitada de sal rosa e limão na água", sub: "Sódio + potássio básico — eletrólito caseiro" },
      { texto: "Água de coco pura (200ml) após exercício", sub: "O melhor repositor natural de potássio" },
      { texto: "Meta: {agua}ml de líquidos hoje — com eletrólitos", sub: "Contar qualquer líquido: chá, caldo, smoothie" },
    ],
    checkin: ["Hidratei com eletrólitos", "Senti diferença na energia", "Dificuldade em beber suficiente", "Câimbras melhoraram"],
    ia: {
      "Hidratei com eletrólitos": "Eletrólitos adequados = condução nervosa eficiente = menos fadiga e névoa mental. Continue.",
      "Senti diferença na energia": "Melhora de energia em poucas horas após hidratação com eletrólitos é o sinal clássico de depleção leve sendo corrigida.",
      "Dificuldade em beber suficiente": "Tente beber 1 copo a cada hora de acordo com um alarme — em vez de tentar tomar grandes volumes de uma vez.",
      "Câimbras melhoraram": "Câimbras reduzidas = eletrólitos normalizando. Continue com magnésio à noite e sal na água durante o dia.",
    },
    receita_id: 5,
    recompensa: "Eletrólitos e hidratação inteligente 💧",
    xp: 30,
  },
  {
    n: 6, titulo: "Tireoide e GLP-1: a conexão que ninguém te conta",
    video: "A perda de peso rápida pode afetar a tireoide.\n\nNão diretamente — mas pela cadeia de efeitos:\n\nDéficit calórico → T4 se converte menos em T3 ativo\nT3 baixo → metabolismo lento → fadiga\n\nE os sintomas de T3 baixo são idênticos aos do GLP-1:\nCansaço. Cabelo caindo. Pele seca. Humor baixo.\n\nComo saber se é tireoide ou adaptação?\n\nExame. Só o exame revela.",
    explicacao: "A restrição calórica reduz a atividade da deiodinase tipo 1 e 2, enzimas que convertem T4 em T3. O resultado é T3 baixo com TSH normal — o 'hipotireoidismo de baixa T3' ou síndrome do T3 baixo. Não é tratado com levotiroxina, mas melhora com restauração calórica e reposição de selênio e zinco.",
    missoes: [
      { texto: "Solicitar T3 livre, T4 livre e TSH na próxima consulta", sub: "TSH normal não descarta síndrome do T3 baixo" },
      { texto: "Selênio: 2 castanhas-do-pará hoje", sub: "Cofator das deiodinases — essencial para conversão T4→T3" },
      { texto: "Evitar dieta abaixo de 1.000 kcal (piora T3 baixo)", sub: "Déficit extremo = menos T3 = mais fadiga" },
    ],
    checkin: ["Tenho histórico de problema de tireoide", "Vou pedir exame de tireoide", "Comi as castanhas-do-pará", "Sintomas parecem ser de tireoide"],
    ia: {
      "Tenho histórico de problema de tireoide": "Com histórico de tireoide, monitoramento durante o GLP-1 é obrigatório. Peça T3L, T4L, TSH e Anti-TPO a cada 6 meses.",
      "Vou pedir exame de tireoide": "Exame completo: TSH + T4 livre + T3 livre. Peça os 3 — TSH isolado pode estar normal mesmo com T3 baixo.",
      "Comi as castanhas-do-pará": "2 castanhas = 100% do selênio diário = cofator das deiodinases que convertem T4 em T3. Hábito simples, impacto real.",
      "Sintomas parecem ser de tireoide": "Se suspeita de tireoide, relate todos os sintomas ao médico na próxima consulta. Seja específico: fadiga, queda de cabelo, intolerância ao frio.",
    },
    receita_id: 1,
    recompensa: "Tireoide e metabolismo monitorados 🔬",
    xp: 35,
  },
  {
    n: 7, titulo: "O protocolo de energia sustentável pós-adaptação",
    video: "7 dias.\n\nVocê mapeou suas fontes de fadiga.\nVocê otimizou ferro e B12.\nVocê melhorou o sono.\nVocê entendeu a hidratação com eletrólitos.\nVocê monitorou a tireoide.\n\nEste é o protocolo completo de energia no GLP-1.\n\nNão é sprint.\nÉ maraton.\n\nOs resultados aparecem em 2-6 semanas.\nMas o trabalho começa hoje.",
    explicacao: "A recuperação energética no GLP-1 segue uma curva temporal: ferro e B12 levam 4-8 semanas para restaurar os estoques. Sono otimizado melhora em 3-7 dias. Eletrólitos melhoram em horas. Tireoide em 4-12 semanas. Ter expectativas realistas e monitorar os marcadores certos é o que diferencia quem mantém a energia de quem continua cansado.",
    missoes: [
      { texto: "Criar rotina matinal de energia: 10 min sol + café MCT + proteína", sub: "Os 3 ativadores de energia mais potentes da manhã" },
      { texto: "Agendar exames de ferro + B12 + vitamina D", sub: "Monitoramento é a base do protocolo sustentável" },
      { texto: "Escolher 3 hábitos deste protocolo para manter permanentemente", sub: "Consistência supera perfeição" },
    ],
    checkin: ["Completei os 7 dias", "Energia melhorou vs Dia 1", "Identifiquei minha causa principal de fadiga", "Tenho plano para manter energia"],
    ia: {
      "Completei os 7 dias": "7 dias de protocolo de energia completo. Você agora sabe como nutrir sua mitocôndria — a fábrica de energia de cada célula.",
      "Energia melhorou vs Dia 1": "Melhora em 7 dias é sinal de que a causa era nutricional. Continue o protocolo — os resultados ampliam nas próximas semanas.",
      "Identifiquei minha causa principal de fadiga": "Causa identificada é causa que pode ser corrigida. Você está no caminho certo.",
      "Tenho plano para manter energia": "Plano = sistema = sustentabilidade. Parabéns por transformar uma semana em estratégia de vida.",
    },
    receita_id: 3,
    recompensa: "PROTOCOLO DE ENERGIA COMPLETO 🏆",
    xp: 100,
  },
];

export default function Protocolo8({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={8}
      emoji="⚡"
      nome="Energia Baixa"
      storageKey="glpy_energia"
      receitas={RECEITAS}
      dias={DIAS}
      onNavigate={onNavigate}
    />
  );
}
