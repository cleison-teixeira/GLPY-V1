import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const VIDEOS: Record<number, string> = {
  1: "https://glpy.b-cdn.net/PROTOCOLO-5-PSICOLOGIA-DO-EMAGRECIMENTO/dia1-psicologia-do-emagrecimento.mp4",
  2: "https://glpy.b-cdn.net/PROTOCOLO-5-PSICOLOGIA-DO-EMAGRECIMENTO/dia2-psicologia-do-emagrecimento.mp4",
  3: "https://glpy.b-cdn.net/PROTOCOLO-5-PSICOLOGIA-DO-EMAGRECIMENTO/dia3-psicologia-do-emagrecimento.mp4",
  4: "https://glpy.b-cdn.net/PROTOCOLO-5-PSICOLOGIA-DO-EMAGRECIMENTO/dia4-psicologia-do-emagrecimento.mp4",
  5: "https://glpy.b-cdn.net/PROTOCOLO-5-PSICOLOGIA-DO-EMAGRECIMENTO/dia5-psicologia-do-emagrecimento.mp4",
  6: "https://glpy.b-cdn.net/PROTOCOLO-5-PSICOLOGIA-DO-EMAGRECIMENTO/dia6-psicologia-do-emagrecimento.mp4",
  7: "https://glpy.b-cdn.net/PROTOCOLO-5-PSICOLOGIA-DO-EMAGRECIMENTO/dia7-psicologia-do-emagrecimento.mp4",
};

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🍫", nome: "Chocolate Negro com Nozes",
    kcal: 240, proteina: 5, carbs: 18, gordura: 18,
    categoria: "Lanche · Ansiedade alimentar",
    desc: "O lanche anti-compulsão mais poderoso. Cacau puro ativa os receptores de serotonina e anandamida — os mesmos que a compulsão por doce tenta ativar.",
    ingredientes: ["3 quadradinhos chocolate 70%+", "15g nozes picadas", "Pitada canela"],
    preparo: "Coma devagar, saboreando cada quadradinho. 5 minutos para comer — sem tela, sem distração.",
    glp1tip: "Comer conscientemente ativa mais receptores de prazer que comer rápido com a mesma quantidade. A neurociência do prazer é sobre presença, não volume.",
    dias: [1, 4, 6],
  },
  {
    id: 2, emoji: "🥗", nome: "Salada do Bom Humor",
    kcal: 320, proteina: 24, carbs: 18, gordura: 18,
    categoria: "Almoço",
    desc: "Triptofano do peru/frango converte em serotonina no cérebro. Folhas verde-escuras têm folato que regula a síntese de dopamina.",
    ingredientes: ["120g peito de peru grelhado", "Rúcula + espinafre + alface roxa", "Frutas vermelhas (morango, mirtilo)", "Sementes de abóbora", "Azeite + vinagre balsâmico"],
    preparo: "Monte a salada com as folhas, adicione o peru fatiado, as frutas e as sementes. Regue com azeite e balsâmico.",
    glp1tip: "Folhas verde-escuras têm magnésio que regula os receptores NMDA do humor. Deficiência de magnésio é extremamente comum em dietas restritivas e causa ansiedade.",
    dias: [2, 5, 7],
  },
  {
    id: 3, emoji: "🫐", nome: "Parfait Anti-Ansiedade",
    kcal: 280, proteina: 18, carbs: 32, gordura: 8,
    categoria: "Café da manhã · Lanche",
    desc: "O iogurte grego tem triptofano + probióticos que fazem o eixo intestino-cérebro funcionar melhor. 90% da serotonina do corpo é produzida no intestino.",
    ingredientes: ["150g iogurte grego integral", "1 col sopa granola sem açúcar", "Frutas vermelhas frescas", "1 col chá mel", "Hortelã fresca"],
    preparo: "Monte em camadas: iogurte, granola, frutas. Finalize com mel e hortelã. Coma sentado, sem pressa.",
    glp1tip: "O intestino produz 95% da serotonina do corpo via células enterocromafins. Probióticos do iogurte grego estimulam essa produção — comendo conscientemente potencializa o efeito.",
    dias: [1, 3, 6],
  },
  {
    id: 4, emoji: "🥜", nome: "Pasta de Castanha-do-Pará com Banana",
    kcal: 310, proteina: 8, carbs: 38, gordura: 16,
    categoria: "Lanche · Fome emocional",
    desc: "Para a fome emocional de doce. Selênio das castanhas é cofator da conversão de T4 em T3 — hormônio tireoidiano que regula humor e energia.",
    ingredientes: ["2 castanhas-do-pará", "1 col sopa pasta de amêndoa", "1 banana amassada", "Aveia 2 col sopa", "Canela"],
    preparo: "Amasse a banana. Misture com pasta de amêndoa e aveia. Pique as castanhas por cima. Sirva com canela.",
    glp1tip: "2 castanhas-do-pará = 100% da necessidade diária de selênio. A deficiência de selênio causa hipotireoidismo subclínico — que manifesta como depressão leve e compulsão por carboidrato.",
    dias: [3, 5],
  },
  {
    id: 5, emoji: "🍵", nome: "Golden Milk Proteico",
    kcal: 220, proteina: 20, carbs: 14, gordura: 7,
    categoria: "Pré-cama · Ansiedade noturna",
    desc: "Cúrcuma tem curcumina com ação comprovada em receptores BDNF do cérebro — o mesmo mecanismo dos antidepressivos. Whey caseinato fornece triptofano de liberação lenta.",
    ingredientes: ["20g whey caseinato baunilha", "250ml leite vegetal morno", "1 col chá cúrcuma", "Pitada pimenta preta", "1 col chá mel"],
    preparo: "Aqueça o leite. Misture a cúrcuma e pimenta preta (piperina ativa a curcumina 20x). Adicione o whey e mel. Beba quente antes de dormir.",
    glp1tip: "Pimenta preta com cúrcuma não é opcional — a piperina aumenta a biodisponibilidade da curcumina em 2.000%. Sem pimenta, a cúrcuma praticamente não age.",
    dias: [2, 4, 7],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "Você não tem fraqueza de caráter. Você tem bioquímica cerebral.",
    video: "O maior mito do emagrecimento:\n\nQue quem fracassa é porque não tem força de vontade.\n\nIsso é mentira.\n\nQuando você tem compulsão por carboidrato à noite,\nnão é fraqueza.\n\nÉ o seu núcleo accumbens respondendo à baixa dopamina.\n\nQuando você come demais sob estresse,\nnão é sabotagem.\n\nÉ o cortisol ativando receptores de recompensa no cérebro.\n\nHoje: entenda a bioquímica para poder mudar.",
    explicacao: "A compulsão alimentar é mediada pelo sistema dopaminérgico do núcleo accumbens. Durante o déficit calórico, os níveis de dopamina caem, e o cérebro busca alimentos de alta densidade calórica como compensação. O GLP-1 ajuda ao reduzir esses sinais — mas a psicologia da alimentação ainda precisa ser trabalhada.",
    missoes: [
      { texto: "Registrar um episódio de fome emocional hoje (sem julgamento)", sub: "Hora, gatilho, sentimento, alimento escolhido" },
      { texto: "5 min de respiração diafragmática antes de comer", sub: "Ativa parassimpático — reduz cortisol 23%" },
      { texto: "Identificar sua emoção no momento da fome", sub: "Tédio? Ansiedade? Estresse? Solidão?" },
    ],
    checkin: ["Identifiquei um gatilho hoje", "Senti compulsão e cedi", "Resisti à compulsão", "Não tive fome emocional hoje"],
    ia: {
      "Identifiquei um gatilho hoje": "Consciência do gatilho é o passo mais difícil — e você já fez. Isso é neuroplasticidade em ação.",
      "Senti compulsão e cedi": "Não existe 'ceder' no protocolo — existe aprendizado. O que você comeu, quando, por qual emoção? Esses dados são ouro.",
      "Resisti à compulsão": "Resistir constrói novas conexões neurais. Cada vez que você pausa e escolhe diferente, o caminho antigo fica mais fraco.",
      "Não tive fome emocional hoje": "O GLP-1 suprime parte dos sinais de compulsão. Aproveite essa clareza para identificar seus padrões sem interferência emocional.",
    },
    receita_id: 3,
    recompensa: "Autoconhecimento bioquímico iniciado 🧠",
    xp: 30,
  },
  {
    n: 2, titulo: "Mapeando seus gatilhos emocionais",
    video: "Gatilhos emocionais não são aleatórios.\n\nTêm padrão.\nTêm horário.\nTêm contexto.\n\nAs 3 perguntas que revelam tudo:\n\n1. Em qual situação você come sem fome?\n2. Qual sentimento aparece 10 min antes?\n3. O que você está tentando não sentir?\n\nResponder essas perguntas vale mais do que qualquer dieta.",
    explicacao: "A fome emocional segue padrões previsíveis relacionados ao ritmo circadiano do cortisol (pico às 8h e 20h) e aos horários de menor dopamina (fim de tarde). Mapear esses padrões permite intervenções preventivas — antes que o impulso tome controle.",
    missoes: [
      { texto: "Fazer o diário emocional alimentar por 24h", sub: "Cada refeição: fome real (1-10) + emoção presente" },
      { texto: "Identificar os 3 alimentos de conforto", sub: "Salgado/doce/crocante? Qual textura te conforta?" },
      { texto: "Descobrir o horário de maior vulnerabilidade", sub: "Tarde? Noite? Após estresse específico?" },
    ],
    checkin: ["Percebi meu padrão de gatilho", "Meu horário crítico é à noite", "Estresse do trabalho é meu gatilho", "Solidão desencadeia minha fome"],
    ia: {
      "Percebi meu padrão de gatilho": "Padrão identificado é padrão que pode ser interrompido. Qual foi o gatilho? Vamos criar uma estratégia específica.",
      "Meu horário crítico é à noite": "Noite é o horário de menor willpower — é fisiológico, não fraqueza. Protocolo: jantar proteico + ritual de fechamento do dia antes das 21h.",
      "Estresse do trabalho é meu gatilho": "Estresse crônico eleva cortisol, que sinaliza para comer alimentos calóricos. Solução: 10 respirações antes de abrir a geladeira após o trabalho.",
      "Solidão desencadeia minha fome": "Solidão ativa os mesmos centros de dor física no cérebro. Comer alivia temporariamente porque ativa dopamina. Substituição: ligar para alguém antes de comer.",
    },
    receita_id: 2,
    recompensa: "Mapa de gatilhos criado 🗺️",
    xp: 35,
  },
  {
    n: 3, titulo: "Fome emocional vs fome fisiológica: como distinguir",
    video: "Existe um teste de 5 segundos para descobrir se sua fome é real.\n\nPergunta: Você comeria brócolis agora?\n\nSe a resposta for SIM — é fome fisiológica.\nSe a resposta for NÃO — é fome emocional.\n\nFome fisiológica aceita qualquer alimento.\nFome emocional exige algo específico.\n\nEssa distinção muda tudo.",
    explicacao: "A fome fisiológica (hipotálamo) e a fome emocional (sistema límbico) são processadas em regiões cerebrais diferentes. A fisiológica responde a qualquer alimento nutritivo. A emocional é específica — busca o alimento associado ao conforto pela memória afetiva. O GLP-1 reduz a fome fisiológica, mas não age diretamente na emocional.",
    missoes: [
      { texto: "Aplicar o teste do brócolis antes de TODA refeição", sub: "30 segundos que mudam a decisão" },
      { texto: "Esperar 10 min quando sentir fome súbita", sub: "Fome fisiológica aumenta. Emocional passa ou diminui." },
      { texto: "Substituto de conforto não alimentar", sub: "Caminhada, banho quente, música — o que te acalma?" },
    ],
    checkin: ["Usei o teste do brócolis", "Descobri que era fome emocional", "Consegui esperar os 10 min", "Substituí comida por outra atividade"],
    ia: {
      "Usei o teste do brócolis": "Cada vez que aplica o teste, você está fortalecendo o córtex pré-frontal — a parte do cérebro que toma decisões racionais.",
      "Descobri que era fome emocional": "Consciência sem julgamento. Você não é fraco — você identificou um padrão neurológico. Isso é inteligência emocional.",
      "Consegui esperar os 10 min": "10 minutos de pausa dá tempo para o cortisol começar a cair. Essa habilidade fica mais fácil com a prática.",
      "Substituí comida por outra atividade": "Você criou uma nova via neural. Cada repetição fortalece essa rota alternativa ao conforto.",
    },
    receita_id: 4,
    recompensa: "Fome emocional desmascarada 🎯",
    xp: 35,
  },
  {
    n: 4, titulo: "A identidade do emagrecimento: quem você está se tornando",
    video: "Existe uma diferença fundamental entre duas afirmações:\n\n'Estou tentando emagrecer.'\n\ne\n\n'Sou uma pessoa que cuida do próprio corpo.'\n\nA primeira é uma meta.\nA segunda é uma identidade.\n\nMetas falham quando a motivação acaba.\nIdentidades persistem porque definem quem você é.\n\nHoje você começa a construir a segunda.",
    explicacao: "Pesquisas de James Clear (Atomic Habits) e da psicologia da identidade mostram que comportamentos alinhados com a identidade são 3x mais sustentáveis que comportamentos baseados em metas. 'Ser' é mais poderoso que 'tentar'. A identidade se constrói com evidências — pequenas escolhas diárias que provam para você mesmo quem você é.",
    missoes: [
      { texto: "Escrever: 'Sou uma pessoa que...' (3 frases sobre saúde)", sub: "Identidade declarada é identidade reforçada" },
      { texto: "Uma ação hoje que a sua nova identidade faria", sub: "A menor escolha saudável conta como evidência" },
      { texto: "Nomear 3 decisões desta semana alinhadas à nova identidade", sub: "Evidências constroem crença" },
    ],
    checkin: ["Escrevi minha nova identidade", "Agi como minha nova versão", "Senti conflito com a identidade antiga", "Me senti orgulhoso de uma escolha"],
    ia: {
      "Escrevi minha nova identidade": "Identidade escrita é comprometimento explícito. O cérebro trata o que é escrito como mais real do que o pensado.",
      "Agi como minha nova versão": "Cada ação alinhada com a nova identidade fortalece a crença neurológica nessa identidade. Continue criando evidências.",
      "Senti conflito com a identidade antiga": "Conflito de identidade é o processo de transição. É o sinal de que você está crescendo — não regredindo.",
      "Me senti orgulhoso de uma escolha": "Orgulho é o reforço mais poderoso para identidade. Registre essa sensação — ela é o combustível da mudança duradoura.",
    },
    receita_id: 1,
    recompensa: "Nova identidade sendo forjada 🌟",
    xp: 40,
  },
  {
    n: 5, titulo: "Sabotagem interna: desarmando o inimigo mais próximo",
    video: "O inimigo do emagrecimento não é a pizza.\nNão é o refrigerante.\nNão é o fim de semana.\n\nÉ a voz interna que diz:\n'Você não vai conseguir.'\n'Você sempre faz isso.'\n'Por que tentar se vai desistir de novo?'\n\nEssa voz tem nome:\nSabotagem interna.\n\nE hoje você vai aprender a silenciá-la.",
    explicacao: "A sabotagem interna é mediada pelo crítico interno — formado por crenças limitantes adquiridas na infância e reforçadas por fracassos anteriores. Neurociência mostra que essas vozes ativam a amígdala (resposta de medo), que suprime o córtex pré-frontal (decisão racional). A técnica de defusion cognitiva (ACT) desfaz esse padrão.",
    missoes: [
      { texto: "Identificar 1 pensamento sabotador hoje", sub: "Escreva-o literalmente — exteriorizá-lo reduz o poder" },
      { texto: "Questionar: 'Isso é fato ou interpretação?'", sub: "Crítico interno fala em fatos mas são histórias" },
      { texto: "Substituir por afirmação baseada em evidência", sub: "Não positividade — evidência real de capacidade" },
    ],
    checkin: ["Peguei meu crítico interno em ação", "Questionei o pensamento sabotador", "Consigo me tratar com mais gentileza", "Sabotagem me afetou hoje"],
    ia: {
      "Peguei meu crítico interno em ação": "Perceber o pensamento sem agir por ele — isso é mindfulness aplicado. Você está desenvolvendo metacognição.",
      "Questionei o pensamento sabotador": "Questionamento é a primeira fissura na parede da crença limitante. Continue fazendo isso com cada pensamento negativo.",
      "Consigo me tratar com mais gentileza": "Autocompaixão não é fraqueza — é o único estado mental que permite aprendizado sem defesa.",
      "Sabotagem me afetou hoje": "Tudo bem. Identifique o pensamento específico que veio antes da ação. Esse é o ponto de intervenção — não o comportamento.",
    },
    receita_id: 3,
    recompensa: "Sabotador interno neutralizado 🛡️",
    xp: 40,
  },
  {
    n: 6, titulo: "Reconstruindo seu relacionamento com a comida",
    video: "A maioria das pessoas tem uma relação de guerra com a comida.\n\nAlimentos 'proibidos' e 'liberados'.\nDias 'bons' e 'ruins'.\n'Fui bem hoje' e 'estraguei tudo'.\n\nEssa linguagem cria vergonha.\nVergonha cria compulsão.\nCompulsão confirma a vergonha.\n\nO ciclo do sofrimento.\n\nHoje você vai começar a sair dele.",
    explicacao: "A linguagem moralista em torno da comida (bom/ruim, limpo/sujo) ativa o mesmo sistema neural da vergonha que está associado a comportamentos compulsivos. Estudos de nutrição comportamental mostram que a neutralidade alimentar — sem julgamento moral — reduz episódios de compulsão em até 60%.",
    missoes: [
      { texto: "Eliminar 'fui bem/mal' do vocabulário alimentar", sub: "Substituir por: 'comi X — como me sinto?'" },
      { texto: "Comer 1 refeição sem tela, sentado, conscientemente", sub: "Comer mindfully aumenta satisfação 40% com mesma quantidade" },
      { texto: "Não chamar nenhum alimento de 'proibido' hoje", sub: "Restrição psicológica alimenta o desejo" },
    ],
    checkin: ["Comi mindfully uma refeição", "Parei com a linguagem moralista", "Senti prazer na comida hoje", "Ainda com relação difícil com a comida"],
    ia: {
      "Comi mindfully uma refeição": "Uma refeição consciente por dia já muda a relação com a comida. O prazer de comer foi design evolutivo — não é inimigo.",
      "Parei com a linguagem moralista": "Linguagem neutra é neurologia. Sem vergonha, sem ativação da amígdala, sem compulsão como escape.",
      "Senti prazer na comida hoje": "Prazer na comida sem culpa é sinal de saúde psicológica alimentar. Isso é o que queremos construir.",
      "Ainda com relação difícil com a comida": "Relações difíceis levam tempo para se reconstruir. Se o padrão for muito intenso, considere suporte psicológico especializado em comportamento alimentar.",
    },
    receita_id: 5,
    recompensa: "Paz com a comida iniciada 🕊️",
    xp: 35,
  },
  {
    n: 7, titulo: "O emagrecimento como projeto de vida, não como dieta",
    video: "Dieta tem data de início e fim.\n\nProjeto de vida não tem.\n\nQual a diferença prática?\n\nDieta: 'Vou emagrecer para o verão.'\nProjeto de vida: 'Vou ser uma pessoa saudável.'\n\nDieta cria privação temporária.\nProjeto de vida cria identidade permanente.\n\nO GLP-1 é uma ferramenta do seu projeto de vida.\nNão é a solução — é o acelerador.",
    explicacao: "A psicologia da mudança de comportamento (modelo transteórico de Prochaska) identifica que a manutenção a longo prazo exige uma fase de 'terminação' — onde a mudança se torna parte da identidade, não mais um esforço consciente. O protocolo desta semana preparou o terreno para essa fase.",
    missoes: [
      { texto: "Escrever sua declaração de projeto de vida saudável", sub: "1 parágrafo — quem você quer ser em 2 anos" },
      { texto: "Identificar 3 valores pessoais que essa jornada representa", sub: "Liberdade? Saúde? Presença? Longevidade?" },
      { texto: "Carta para você mesmo em 6 meses", sub: "O que você espera ter alcançado — não só no corpo" },
    ],
    checkin: ["Completei os 7 dias", "Mudei minha perspectiva sobre o emagrecimento", "Sei por que estou fazendo isso", "Sinto paz com esse processo"],
    ia: {
      "Completei os 7 dias": "7 dias de trabalho interno real. Você foi além do número na balança — foi para onde a mudança duradoura acontece.",
      "Mudei minha perspectiva sobre o emagrecimento": "Perspectiva é tudo. O mesmo processo vivido com outra perspectiva produz outro resultado — e outra relação com o corpo.",
      "Sei por que estou fazendo isso": "Clareza de propósito é o combustível que sustenta nos dias difíceis. Escreva esse 'por que' e cole onde vai ver todo dia.",
      "Sinto paz com esse processo": "Paz é o estado de funcionamento do sistema nervoso autônomo no modo segurança. Seu corpo está aprendendo que saúde é segura.",
    },
    receita_id: 2,
    recompensa: "PROTOCOLO PSICOLÓGICO COMPLETO 🏆",
    xp: 100,
  },
];

export default function Protocolo5({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={5}
      emoji="🧠"
      nome="Psicologia do Emagrecimento"
      storageKey="glpy_psicologia"
      receitas={RECEITAS}
      dias={DIAS}
      videos={VIDEOS}
      firestoreId="protocolo-5"
      onNavigate={onNavigate}
    />
  );
}
