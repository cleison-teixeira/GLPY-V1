import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🥗", nome: "Salada de Manutenção Completa",
    kcal: 480, proteina: 36, carbs: 28, gordura: 24,
    categoria: "Almoço · Manutenção",
    desc: "A refeição de manutenção perfeita: proteína + gordura boa + carboidrato de baixo IG + fibra. Sustenta a saciedade por 4-5h sem GLP-1.",
    ingredientes: ["150g frango grelhado", "1/4 abacate", "50g quinoa cozida", "Folhas verdes variadas", "Tomate, pepino, azeitona", "Azeite extra-virgem + limão"],
    preparo: "Monte com folhas como base. Adicione proteína, quinoa e vegetais. Fatie o abacate. Regue com azeite e limão.",
    glp1tip: "Sem GLP-1, a saciedade depende de gordura + proteína + fibra juntos. Esta salada tem os três — refeição de manutenção mais completa possível.",
    dias: [1, 3, 5, 7],
  },
  {
    id: 2, emoji: "🥚", nome: "Omelete de Manutenção com Queijo e Ervas",
    kcal: 340, proteina: 28, carbs: 4, gordura: 24,
    categoria: "Café da manhã",
    desc: "A refeição de rotina que sustenta sem compulsão. Ovos têm o maior índice de saciabilidade entre os alimentos proteicos — fundamental na ausência do GLP-1.",
    ingredientes: ["3 ovos inteiros", "40g queijo prato ou gruyère", "Cebolinha e salsinha frescas", "Tomate seco picado", "Azeite"],
    preparo: "Bata os ovos com ervas. Faça em fogo baixo até firmar. Recheie com queijo e tomate seco. Dobre e sirva.",
    glp1tip: "3 ovos no café da manhã reduz o consumo calórico no almoço em 18% — demonstrado em estudo controlado. A proteína matinal programa o apetite do dia.",
    dias: [1, 4, 6],
  },
  {
    id: 3, emoji: "🍗", nome: "Frango Refogado Simples",
    kcal: 350, proteina: 40, carbs: 12, gordura: 14,
    categoria: "Almoço · Jantar · Rotina",
    desc: "A proteína da manutenção: simples, rápida, consistente. Alta proteína com sabor neutro que não cansa. O prato mais sustentável da semana.",
    ingredientes: ["180g peito de frango", "Alho, cebola, sal e ervas", "Tomate pelado 1 lata", "Azeite 1 fio"],
    preparo: "Refogue cebola e alho. Adicione o frango em cubos. Junte o tomate pelado e cozinhe até secar. Simples e delicioso.",
    glp1tip: "Proteína de alto valor biológico (frango, ovo, peixe) reduz a grelina pós-refeição por mais horas que proteína vegetal. Fundamental para manutenção sem GLP-1.",
    dias: [2, 5],
  },
  {
    id: 4, emoji: "🥣", nome: "Café da Manhã de Manutenção",
    kcal: 380, proteina: 22, carbs: 42, gordura: 14,
    categoria: "Café da manhã",
    desc: "A rotina matinal sustentável: aveia + proteína + gordura boa. Carboidrato complexo de baixo IG que sustenta energia até o almoço sem pico de glicose.",
    ingredientes: ["5 col sopa aveia grossa", "200ml leite (qualquer tipo)", "1 col sopa pasta de amêndoa", "1 banana pequena", "Canela e nozes"],
    preparo: "Cozinhe a aveia com o leite por 5 min. Adicione pasta de amêndoa e misture. Finalize com banana e nozes.",
    glp1tip: "Beta-glucana da aveia forma gel no estômago que retarda o esvaziamento gástrico — simulando parcialmente o efeito do GLP-1 no tempo de saciedade.",
    dias: [2, 4, 7],
  },
  {
    id: 5, emoji: "🍫", nome: "Mousse Proteica de Coco",
    kcal: 220, proteina: 18, carbs: 16, gordura: 9,
    categoria: "Sobremesa · Lanche · Manutenção",
    desc: "O doce sustentável da manutenção. Proteína alta + gordura boa = sem compulsão. O lanche que substitui o impulso por doce sem comprometer o protocolo.",
    ingredientes: ["150g iogurte grego integral", "15g whey coco ou baunilha", "1 col sopa coco ralado sem açúcar", "1 col chá mel"],
    preparo: "Misture iogurte com whey até homogêneo. Adicione coco ralado e mel. Leve ao frio por 20 min.",
    glp1tip: "Iogurte grego tem caseína e whey naturalmente — digestão dupla que sustenta saciedade por 3-4h. O tratamento mais sustentável para a fome por doce.",
    dias: [3, 6],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "Parar não é fracasso. É a transição mais complexa do tratamento.",
    video: "Parar o GLP-1 é uma das transições mais difíceis da medicina moderna.\n\nNão porque o remédio causa dependência.\nMas porque ele resolve tanto,\nQue parar parece deixar um vácuo.\n\nA fome volta.\nO apetite volta.\nA dopamina alimentar volta.\n\nE se você não tiver um sistema pronto,\nEsse vácuo vai ser preenchido pelos velhos hábitos.\n\nEste protocolo é o sistema.",
    explicacao: "A descontinuação do GLP-1 resulta em normalização gradual dos níveis de grelina, leptina e insulina nas primeiras 4-12 semanas. Estudos mostram que 73% dos pacientes recuperam peso significativo dentro de 12 meses após parar sem intervenção estruturada. Com estrutura nutricional e psicológica adequada, esse número cai para menos de 30%.",
    missoes: [
      { texto: "Escrever: por que estou parando o GLP-1?", sub: "Clareza de motivo é o primeiro suporte psicológico" },
      { texto: "Definir sua meta de manutenção de peso", sub: "Peso específico, não 'quero manter'" },
      { texto: "Listar 3 estratégias aprendidas no tratamento", sub: "Esses aprendizados são seus — o remédio vai, eles ficam" },
    ],
    checkin: ["Estou pronto para a transição", "Tenho medo de recuperar o peso", "Estou confiante com o que aprendi", "Parando por necessidade médica"],
    ia: {
      "Estou pronto para a parada": "Prontidão percebida é o maior preditor de sucesso na transição. Você aprendeu muito — agora vai aplicar.",
      "Tenho medo de recuperar o peso": "Medo é válido e baseado em dados — 73% recuperam. Mas você está no protocolo que coloca você nos 27%.",
      "Estou confiante com o que aprendi": "Confiança baseada em habilidades aprendidas. Esse é o tipo mais sólido de confiança que existe.",
      "Parando por necessidade médica": "Independente do motivo, o protocolo funciona. Seu médico é seu maior aliado nesta transição.",
    },
    receita_id: 1,
    recompensa: "Transição iniciada com consciência 🌟",
    xp: 30,
  },
  {
    n: 2, titulo: "O protocolo de desmame gradual — 12 semanas",
    video: "A pior maneira de parar o GLP-1:\n\nParar de uma vez.\n\nA fome volta de golpe.\nO corpo fica sem sinal de saciedade de repente.\nO cérebro entra em modo de compensação.\n\nA melhor maneira:\n\nDesmame gradual em 8-12 semanas.\n\nReduzir a dose 25% a cada 3-4 semanas.\nO corpo tem tempo de readaptar os próprios mecanismos de saciedade.\nA fome volta — mas devagar. Gerenciável.",
    explicacao: "O desmame gradual permite que os receptores GLP-1R se sensibilizem novamente de forma progressiva, e que o organismo readapte a produção endógena de GIP e GLP-1 nativo. Parar abruptamente cria pico de grelina que pode ser 40% maior que o basal — tornando a compulsão quase inevitável.",
    missoes: [
      { texto: "Discutir o plano de desmame gradual com seu médico", sub: "Redução de dose é decisão médica — sempre com prescrição" },
      { texto: "Estrutura alimentar independente do remédio: 5 refeições fixas", sub: "Horários fixos reduzem pico de grelina" },
      { texto: "Identificar alimentos de alta saciedade sem GLP-1", sub: "Proteína + fibra solúvel são os substitutos naturais" },
    ],
    checkin: ["Conversando com médico sobre desmame", "Já tenho plano de redução de dose", "Preocupado com a fome voltando", "Usando estrutura alimentar fixa"],
    ia: {
      "Conversando com médico sobre desmame": "Certo! Desmame gradual com acompanhamento é o protocolo mais seguro. Nunca reduza dose sozinho.",
      "Já tenho plano de redução de dose": "Com plano claro, a ansiedade sobre a transição diminui. Siga o cronograma sem pressa.",
      "Preocupado com a fome voltando": "Válido. Mas você agora tem ferramentas: proteína alta, fibra, refeições fixas e consciência emocional alimentar.",
      "Usando estrutura alimentar fixa": "Estrutura de horários é o substituto comportamental mais próximo do GLP-1. Continue — especialmente nos primeiros 30 dias.",
    },
    receita_id: 4,
    recompensa: "Plano de desmame estabelecido 📋",
    xp: 35,
  },
  {
    n: 3, titulo: "A fome vai voltar. Prepare-se para quando chegar.",
    video: "Ela vai chegar.\n\nNão como explosão de uma vez.\nMas como maré que sobe gradualmente.\n\nSemana 1 pós-parada: fome mais frequente\nSemana 2-3: apetite normalizado\nSemana 4-6: fome no nível pré-medicação\n\nO que você faz nas Semanas 1-3 determina tudo.\n\nSe você tem o sistema pronto para a fome crescente,\nVocê gerencia.\n\nSe não tem — você cede.",
    explicacao: "A normalização da fome após descontinuação do GLP-1 segue o ritmo de clearance da droga (meia-vida de 5-7 dias para semaglutida, 14 dias para tirzepatida). A fome de grelina normaliza em 4-8 semanas. Nesse período, estratégias comportamentais e nutricionais são essenciais para manutenção.",
    missoes: [
      { texto: "Protocolo anti-fome: proteína + fibra em CADA refeição", sub: "Os dois macros que mais suprimem grelina naturalmente" },
      { texto: "Comer a cada 3-4h (não esperar a fome intensa)", sub: "Fome intensa = decisão impulsiva garantida" },
      { texto: "Identificar a diferença entre fome física e fome por hábito", sub: "Hábito de fome tem horário fixo — não é fisiológico" },
    ],
    checkin: ["Fome voltou mas gerenciável", "Senti fome mais intensa que esperava", "Estratégias de proteína estão ajudando", "Ainda sem diferença notável na fome"],
    ia: {
      "Fome voltou mas gerenciável": "Fome gerenciável é o objetivo. Você tem as ferramentas — continue aplicando.",
      "Senti fome mais intensa que esperava": "Isso pode indicar que o desmame foi rápido demais. Converse com o médico sobre desacelerar o processo.",
      "Estratégias de proteína estão ajudando": "Proteína alta suprime GIP e CCK endógenos — mecanismos de saciedade que o GLP-1 reforçava. Você está ativando os substitutos naturais.",
      "Ainda sem diferença notável na fome": "Pode ainda estar com nível de medicação suficiente para supressão. Monitore semana a semana.",
    },
    receita_id: 2,
    recompensa: "Fome gerenciada sem medicação 💪",
    xp: 40,
  },
  {
    n: 4, titulo: "Psicologia da parada: luto, medo e celebração",
    video: "Parar o GLP-1 pode provocar algo inesperado:\n\nLuto.\n\nLuto pelo controle que o remédio dava.\nLuto pela facilidade de comer pouco.\nLuto pela certeza que ele trazia.\n\nIsso é real.\nIsso é válido.\nE precisa ser nomeado.\n\nMas junto com o luto vem a celebração:\n\nVocê chegou onde queria.\nVocê aprendeu a se nutrir.\nVocê tem habilidades que antes não tinha.\n\nOs dois sentimentos podem coexistir.",
    explicacao: "A transição de parar um medicamento que gerou transformação significativa pode ativar processos de luto (perda de controle, medo de recaída) e ansiedade antecipatória. Estudos de psicologia do comportamento alimentar mostram que nomear e processar essas emoções é o fator mais protetor contra o ciclo de privação-compulsão após a parada.",
    missoes: [
      { texto: "Escrever: o que o GLP-1 me deu que não quero perder?", sub: "Nomear o que você quer proteger" },
      { texto: "Escrever: o que aprendi sobre mim mesmo neste tratamento?", sub: "Esses aprendizados são permanentes" },
      { texto: "Celebrar: uma vitória específica deste tratamento", sub: "Reconhecimento do progresso real" },
    ],
    checkin: ["Sinto luto pelo controle do remédio", "Estou orgulhoso do que conquistei", "Medo de voltarmais ao ponto inicial", "Em paz com a decisão de parar"],
    ia: {
      "Sinto luto pelo controle do remédio": "Luto nomeado é luto que pode ser processado. O que você está deixando: a facilidade. O que você tem: habilidades reais.",
      "Estou orgulhoso do que conquistei": "Orgulho baseado em evidências reais. Você mudou seu corpo, seus hábitos e sua relação com a comida. Isso é permanente.",
      "Medo de voltarmais ao ponto inicial": "Você nunca vai voltar ao ponto inicial — porque você não é mais a mesma pessoa. Seu conhecimento é diferente.",
      "Em paz com a decisão de parar": "Paz é o estado mais poderoso para tomar decisões sobre saúde. Continue com ela.",
    },
    receita_id: 5,
    recompensa: "Psicologia da transição processada 🧠",
    xp: 35,
  },
  {
    n: 5, titulo: "Construindo estrutura sem a muleta do GLP-1",
    video: "O GLP-1 fez muito por você.\n\nMas foi ele — não você.\n\nAgora você vai construir os seus próprios sistemas:\n\nSaciedade → proteína alta + fibra\nControle de apetite → horários fixos\nAnticravings → identificar gatilho + substituição\nMotivação → identidade + comprometimento visível\n\nEsses 4 sistemas funcionam sem remédio.\nFuncionaram antes dele.\nVão funcionar depois.",
    explicacao: "A teoria do Self-Determination de Deci e Ryan mostra que comportamentos sustentáveis precisam ser intrinsecamente motivados (não externamente controlados). A dependência de um medicamento para controle alimentar é motivação externa. Os 4 sistemas propostos ativam motivação intrínseca via competência, autonomia e conexão.",
    missoes: [
      { texto: "Criar seu sistema pessoal de saciedade sem GLP-1", sub: "Qual proteína + fibra nas 3 refeições diárias" },
      { texto: "Definir horários fixos de refeição permanentes", sub: "Horários fixos reduzem grelina circadiana" },
      { texto: "Identificar seu maior risco de recaída e plano de resposta", sub: "Prevenção de recaída começa na antecipação" },
    ],
    checkin: ["Criei meu sistema de saciedade", "Tenho horários fixos definidos", "Identifiquei meu maior risco", "Confiante sem o remédio"],
    ia: {
      "Criei meu sistema de saciedade": "Sistema criado = dependência reduzida. Você está construindo a infraestrutura da manutenção.",
      "Tenho horários fixos definidos": "Horários fixos normalizam o ritmo circadiano da fome — o GLP-1 natural do corpo segue esse ritmo.",
      "Identifiquei meu maior risco": "Risco identificado é risco que pode ser planejado. Prevenção de recaída começa na antecipação honesta.",
      "Confiante sem o remédio": "Confiança construída em cima de sistema, não de esperança. Essa é a diferença.",
    },
    receita_id: 3,
    recompensa: "Sistema de manutenção construído 🏗️",
    xp: 40,
  },
  {
    n: 6, titulo: "Os 90 dias pós-medicamento: plano semana a semana",
    video: "Os 90 dias após parar o GLP-1 são os mais críticos.\n\nSemana 1-2: Fome leve, teste das novas estratégias\nSemana 3-4: Fome normalizada, apetite mais frequente\nSemana 5-8: Novo equilíbrio se estabelece\nSemana 9-12: Manutenção consolidada\n\nEm cada fase, uma ameaça diferente.\nEm cada fase, uma estratégia diferente.\n\nVocê vai ter o mapa completo.",
    explicacao: "Os 90 dias pós-GLP-1 podem ser divididos em 3 fases de adaptação. Fase 1 (0-4 semanas): readaptação fisiológica — fome crescente, metabolismo se reajustando. Fase 2 (4-8 semanas): teste psicológico — gatilhos emocionais voltam com força. Fase 3 (8-12 semanas): consolidação ou recaída — o padrão que se estabelece aqui tende a persistir.",
    missoes: [
      { texto: "Check-in semanal de peso: toda segunda-feira", sub: "Semanal filtra as variações naturais diárias" },
      { texto: "Limite de flutuação: +2kg acima do alvo = volta ao protocolo", sub: "Gatilho precoce evita recaída de 10kg" },
      { texto: "Suporte: médico + nutricionista nos primeiros 90 dias", sub: "Acompanhamento profissional triplica o sucesso" },
    ],
    checkin: ["Tenho plano para os próximos 90 dias", "Defini meu limite de flutuação de peso", "Tenho suporte profissional", "Comprometido com os check-ins semanais"],
    ia: {
      "Tenho plano para os próximos 90 dias": "Plano de 90 dias é o que separa quem mantém de quem recupera. Você está no grupo certo.",
      "Defini meu limite de flutuação de peso": "+2kg é o gatilho padrão recomendado por especialistas em manutenção. Ação precoce evita espirais.",
      "Tenho suporte profissional": "Acompanhamento profissional nos primeiros 90 dias aumenta a taxa de manutenção de 27% para mais de 60%. Vale cada consulta.",
      "Comprometido com os check-ins semanais": "Check-in semanal é o espelho honesto. Sem ele, as mudanças graduais passam despercebidas até ser grande demais.",
    },
    receita_id: 1,
    recompensa: "Plano de 90 dias estabelecido 📅",
    xp: 40,
  },
  {
    n: 7, titulo: "Manutenção permanente: o sistema de vida que funciona",
    video: "Você chegou até aqui.\n\nVocê aprendeu sobre a adaptação do Dia 1.\nVocê aprendeu a gerenciar efeitos colaterais.\nVocê protegeu seu músculo.\nVocê entendeu sua psicologia alimentar.\nVocê reconfigurou seu metabolismo.\nE agora está completando a maior transição do tratamento.\n\nO GLP-1 foi uma ferramenta.\nO que você construiu com ela — isso é permanente.\n\nIsso é seu.",
    explicacao: "A manutenção permanente não depende de disciplina — depende de sistema. Estudos do National Weight Control Registry (banco de dados dos 5% que mantêm o peso por 5+ anos) mostram padrões consistentes: café da manhã diário, pesagem frequente, atividade física regular e televisão limitada. Estrutura supera força de vontade.",
    missoes: [
      { texto: "Escrever seu sistema de manutenção definitivo", sub: "1 página: o que você vai fazer para sempre" },
      { texto: "Comprometimento público: contar para alguém", sub: "Comprometimento social aumenta adesão em 40%" },
      { texto: "Celebrar: você fez os 10 protocolos GLPY", sub: "Reconhecer conquistas é parte do sistema" },
    ],
    checkin: ["Completei os 7 dias", "Tenho meu sistema de vida definido", "Me sinto capaz de manter sozinho", "Transformei minha relação com saúde"],
    ia: {
      "Completei os 7 dias": "10 protocolos. Cada um construindo sobre o anterior. Você tem o conhecimento completo do tratamento GLP-1.",
      "Tenho meu sistema de vida definido": "Sistema documentado é sistema que persiste mesmo nos dias difíceis. O papel não esquece quando a motivação cai.",
      "Me sinto capaz de manter sozinho": "Autonomia é o objetivo final de qualquer bom tratamento. Você não precisa mais da medicação para ser quem você se tornou.",
      "Transformei minha relação com saúde": "Essa transformação é a mais permanente de todas. Corpo muda — relação com saúde define toda a trajetória.",
    },
    receita_id: 4,
    recompensa: "TODOS OS PROTOCOLOS GLPY COMPLETOS 🏆🎉",
    xp: 150,
  },
];

export default function Protocolo10({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={10}
      emoji="🔄"
      nome="Transição — Parar a Caneta"
      storageKey="glpy_transicao"
      receitas={RECEITAS}
      dias={DIAS}
      onNavigate={onNavigate}
    />
  );
}
