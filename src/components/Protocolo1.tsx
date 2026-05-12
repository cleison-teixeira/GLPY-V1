import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const VIDEOS: Record<number, string> = {
  1: "https://glpy.b-cdn.net/PROTOCOLO-1-SOBREVIVENDO-AS-CANETAS/dia1-sobrevivendo-as-canetas.mp4",
  2: "https://glpy.b-cdn.net/PROTOCOLO-1-SOBREVIVENDO-AS-CANETAS/dia2-sobrevivendo-as-canetas.mp4",
  3: "https://glpy.b-cdn.net/PROTOCOLO-1-SOBREVIVENDO-AS-CANETAS/dia3-sobrevivendo-as-canetas.mp4",
  4: "https://glpy.b-cdn.net/PROTOCOLO-1-SOBREVIVENDO-AS-CANETAS/dia4-sobrevivendo-as-canetas.mp4",
  5: "https://glpy.b-cdn.net/PROTOCOLO-1-SOBREVIVENDO-AS-CANETAS/dia5-sobrevivendo-as-canetas.mp4",
  6: "https://glpy.b-cdn.net/PROTOCOLO-1-SOBREVIVENDO-AS-CANETAS/dia6-sobrevivendo-as-canetas.mp4",
  7: "https://glpy.b-cdn.net/PROTOCOLO-1-SOBREVIVENDO-AS-CANETAS/dia7-sobrevivendo-as-canetas.mp4",
};

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🍵", nome: "Caldo de Galinha com Gengibre",
    kcal: 180, proteina: 22, carbs: 8, gordura: 6,
    categoria: "Almoço · Jantar · Anti-náusea",
    desc: "O caldo mais poderoso para os primeiros dias. Gengibre bloqueia os receptores de náusea e o frango entrega proteína sem exigir digestão intensa.",
    ingredientes: ["150g peito de frango desfiado", "1 pedaço gengibre ralado (2cm)", "1 cenoura pequena", "1 talo salsão", "Sal e cúrcuma a gosto", "600ml água"],
    preparo: "Cozinhe o frango com os legumes por 25 min em pressão. Coe, adicione gengibre ralado e cúrcuma. Beba quente, devagar.",
    glp1tip: "Gengibre contém gingerol que inibe diretamente os receptores 5-HT3 da náusea — o mesmo mecanismo dos antieméticos. Beba antes das refeições.",
    dias: [1, 2, 3],
  },
  {
    id: 2, emoji: "🥚", nome: "Omelete Suave com Queijo Minas",
    kcal: 260, proteina: 22, carbs: 3, gordura: 18,
    categoria: "Café da manhã · Lanche",
    desc: "Proteína completa em 5 minutos. Fácil de digerir e não provoca náusea por ser leve. Ideal para as primeiras semanas.",
    ingredientes: ["3 ovos", "30g queijo minas frescal", "Sal e cebola verde", "1 fio de azeite"],
    preparo: "Bata os ovos levemente. Aqueça azeite em fogo baixo. Despeje os ovos e deixe firmar. Adicione queijo picado, dobre e sirva.",
    glp1tip: "Ovos têm o maior índice de saciabilidade entre os alimentos proteicos. No GLP-1, essa saciedade se multiplica — 3 ovos podem ser mais do que suficientes.",
    dias: [1, 4, 7],
  },
  {
    id: 3, emoji: "🍌", nome: "Vitamina Anti-Náusea",
    kcal: 240, proteina: 26, carbs: 28, gordura: 3,
    categoria: "Qualquer horário · Náusea forte",
    desc: "Para quando a náusea impede de comer. Entrega proteína completa sem esforço digestivo. A banana verde tem amido resistente que estabiliza o estômago.",
    ingredientes: ["30g whey baunilha", "1 banana pequena (prefira verde)", "200ml leite desnatado", "1 col chá gengibre em pó", "Gelo"],
    preparo: "Bata tudo no liquidificador por 20 segundos. Beba devagar, em pequenos goles, sentado.",
    glp1tip: "Temperatura fria reduz o reflexo de náusea. Beba sempre gelado nos dias difíceis. O gengibre em pó é mais concentrado que fresco e funciona melhor em bebidas.",
    dias: [2, 5],
  },
  {
    id: 4, emoji: "🥣", nome: "Aveia Noturna com Canela",
    kcal: 320, proteina: 14, carbs: 48, gordura: 8,
    categoria: "Café da manhã · Pré-cama",
    desc: "Preparo zero stress. A aveia de um dia para o outro fica mais digestiva e entrega beta-glucana que estabiliza a glicose durante a noite.",
    ingredientes: ["5 col sopa aveia grossa", "200ml leite de coco light", "1 col chá canela", "1 col sopa mel", "Frutas vermelhas"],
    preparo: "Misture aveia com leite e mel. Tampe e leve à geladeira. Na manhã seguinte adicione canela e frutas.",
    glp1tip: "A beta-glucana da aveia forma um gel no estômago que reduz a velocidade do esvaziamento gástrico — perfeito para evitar a hipoglicemia reativa comum nos primeiros dias de GLP-1.",
    dias: [3, 6],
  },
  {
    id: 5, emoji: "🍗", nome: "Frango Cozido com Batata-Inglesa",
    kcal: 340, proteina: 36, carbs: 32, gordura: 6,
    categoria: "Almoço · Jantar",
    desc: "A refeição de recuperação. Quando a náusea passou mas o corpo ainda precisa de energia — batata cozida é o carboidrato mais fácil de digerir que existe.",
    ingredientes: ["150g frango cozido desfiado", "150g batata-inglesa cozida", "1 fio de azeite", "Sal e salsinha"],
    preparo: "Cozinhe o frango e a batata juntos por 20 min. Desfie o frango. Monte o prato simples com azeite e salsinha.",
    glp1tip: "Batata cozida resfriada tem 3x mais amido resistente que quente — alimenta as bactérias boas do intestino que produzem butirato, melhorando a tolerância ao GLP-1.",
    dias: [4, 7],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "A primeira injeção: as próximas 48 horas em detalhes",
    video: "Você aplicou pela primeira vez.\n\nNas próximas 2-6 horas: o GLP-1 começa a agir no cérebro, não no estômago.\n\nOs receptores no hipotálamo recebem o sinal: calma, chegou alimento suficiente.\n\nA náusea, se vier, é prova de que está funcionando.\n\nSeu trabalho hoje é simples:\nNão force refeições grandes.\nComa pouco, devagar, de hora em hora.",
    explicacao: "O GLP-1 ativa receptores no sistema nervoso central e periférico simultaneamente. A náusea dos primeiros dias é causada pelo estímulo dos receptores no tronco cerebral — uma resposta normal que diminui em 5-10 dias conforme o corpo se adapta.",
    missoes: [
      { texto: "Refeições pequenas a cada 2-3 horas", sub: "Máximo 200-300ml de volume por vez" },
      { texto: "Água com gengibre — 6 goles por hora", sub: "Prevenção proativa da náusea" },
      { texto: "Anote o horário da injeção e os primeiros sintomas", sub: "Dados que guiarão os próximos dias" },
    ],
    checkin: ["Náusea leve ou nenhuma", "Náusea moderada, mas suportável", "Não consegui comer nada", "Senti energia diferente"],
    ia: {
      "Náusea leve ou nenhuma": "Ótima adaptação! Seu sistema nervoso entérico está respondendo bem. Amanhã você pode tentar refeições um pouco maiores.",
      "Náusea moderada, mas suportável": "Normal para o Dia 1. O gengibre vai ajudar muito. Amanhã vamos focar em alimentos ainda mais suaves.",
      "Não consegui comer nada": "Se passou mais de 6h sem comer, tente 2 colheres de aveia com leite morno. Volume mínimo, proteína básica — só para não ficar em jejum total.",
      "Senti energia diferente": "Alguns pacientes relatam leve aceleração cardíaca ou leveza. Isso é normal nas primeiras 24h e passa espontaneamente.",
    },
    receita_id: 1,
    recompensa: "Primeira injeção superada 💉",
    xp: 40,
  },
  {
    n: 2, titulo: "Náusea: o sinal de que o GLP-1 está funcionando",
    video: "A náusea não é efeito colateral.\n\nÉ a prova mais clara de que o GLP-1 chegou onde devia: no tronco cerebral.\n\nOs receptores GLP-1R do nervo vago foram ativados.\nO estômago recebeu o sinal de freio.\n\nSeu trabalho hoje é trabalhar COM esse sinal, não contra ele.\n\nPequenas refeições de hora em hora.\nSempre sentado. Nunca deitado.\nFrio é seu amigo.",
    explicacao: "A náusea do GLP-1 é mediada pelos receptores no área postrema do tronco cerebral, não no estômago em si. Isso explica por que antieméticos comuns funcionam bem. Ela diminui significativamente após 2-4 semanas conforme os receptores se dessensibilizam.",
    missoes: [
      { texto: "Refeições frias ou em temperatura ambiente", sub: "Temperatura quente piora a náusea em 60% dos casos" },
      { texto: "Sentar reto por 30 min após comer", sub: "Decúbito acelera o refluxo gástrico" },
      { texto: "Eliminar cheiros fortes do ambiente", sub: "Frituras, perfumes e café podem detonar a náusea" },
    ],
    checkin: ["Náusea melhorou com as estratégias", "Ainda com náusea, mas funcionando", "Vomitei hoje", "Senti fome real hoje"],
    ia: {
      "Náusea melhorou com as estratégias": "Excelente! Você está aprendendo a linguagem do GLP-1. Continue com as refeições pequenas e frias.",
      "Ainda com náusea, mas funcionando": "Continue. O pico da náusea costuma ser no Dia 2-3 e depois declina. Você está no pior momento — só melhora.",
      "Vomitei hoje": "Se vomitou mais de 3 vezes, hidrate-se com água gelada com pitada de sal. Não force comida por 2h. Se persistir, consulte seu médico sobre dose ou antiemético.",
      "Senti fome real hoje": "Interessante! Alguns pacientes têm fome normal no Dia 2 antes do GLP-1 atingir pico sanguíneo. Aproveite para comer algo proteico.",
    },
    receita_id: 3,
    recompensa: "Domando a náusea 🧬",
    xp: 30,
  },
  {
    n: 3, titulo: "Seu estômago está em recalibração",
    video: "Hoje seu estômago está aprendendo uma nova velocidade.\n\nO GLP-1 reduz o esvaziamento gástrico em até 60%.\n\nIsso significa: o que entrar, fica mais tempo lá.\n\nA lição do Dia 3:\nVolume é inimigo.\nTextura é amiga.\n\nPapas, caldos, vitaminas — tudo que o estômago não precisa trabalhar para processar.",
    explicacao: "O GLP-1 inibe o esvaziamento gástrico via receptores no esfíncter pilórico. Isso é benéfico para saciedade, mas pode causar desconforto se o volume for grande. A digestão está mais lenta — escolha alimentos que exigem pouco trabalho digestivo.",
    missoes: [
      { texto: "Zero fibra insolúvel hoje", sub: "Nada de brócolis cru, couve, repolho — dificultam a digestão lenta" },
      { texto: "Mastigar cada garfada 20 vezes", sub: "Digestão começa na boca — alivia o trabalho do estômago lento" },
      { texto: "Última refeição 3h antes de dormir", sub: "Estômago cheio deitado = náusea noturna garantida" },
    ],
    checkin: ["Digestão mais lenta mas ok", "Sensação de estômago cheio o tempo todo", "Consegui comer as 3 refeições", "Constipação aparecendo"],
    ia: {
      "Digestão mais lenta mas ok": "Você está se adaptando perfeitamente. A partir do Dia 5, o esvaziamento gástrico começa a normalizar.",
      "Sensação de estômago cheio o tempo todo": "Normal! É o pilórico respondendo ao GLP-1. Reduza o volume para 150ml por refeição e aumente a frequência para cada 2h.",
      "Consegui comer as 3 refeições": "Ótimo sinal de adaptação. Seu sistema digestivo está encontrando o novo equilíbrio.",
      "Constipação aparecendo": "O GLP-1 reduz a motilidade intestinal. Amanhã vamos adicionar fibra solúvel (aveia, chia) e aumentar a água para resolver isso.",
    },
    receita_id: 4,
    recompensa: "Mestre da adaptação gástrica 🫁",
    xp: 30,
  },
  {
    n: 4, titulo: "A fome sumiu — isso é bom e perigoso ao mesmo tempo",
    video: "Hoje você vai acordar e perceber: não está com fome.\n\nIsso é o GLP-1 funcionando no pico.\n\nMas aqui está o erro que 90% comete:\n\nAchar que não precisa comer porque não tem fome.\n\nVocê PRECISA comer.\nNão para perder peso mais rápido.\nMas para não perder músculo.\n\nSeu corpo começa a destruir músculo após 16h de subnutrição.\nE músculo perdido é metabolismo perdido para sempre.",
    explicacao: "A supressão de apetite do GLP-1 pode levar à ingestão menor que 800 kcal/dia, o que ativa o catabolismo muscular. Estudos mostram que 30-40% do peso perdido com GLP-1 sem proteína adequada vem de massa muscular. Isso compromete a manutenção a longo prazo.",
    missoes: [
      { texto: "Comer proteína MESMO sem fome", sub: "Meta: {proteina}g — independente do apetite" },
      { texto: "Alarme a cada 3 horas para comer", sub: "Fome zero não é sinal para pular refeição" },
      { texto: "Pesagem em jejum — registre o número", sub: "Baseline para monitorar composição corporal" },
    ],
    checkin: ["Comi mesmo sem fome", "Pulei uma refeição", "Fome normal voltou parcialmente", "Me sinto muito fraco"],
    ia: {
      "Comi mesmo sem fome": "Isso separa os resultados a longo prazo. Você está protegendo músculo enquanto perde gordura — a combinação perfeita.",
      "Pulei uma refeição": "Hoje vamos corrigir. Configure alarmes no celular para 8h, 11h, 14h, 17h, 20h. Comer às 8 já é vitória.",
      "Fome normal voltou parcialmente": "Alguns pacientes têm dias de apetite mais normal intercalados. Aproveite para bater a proteína do dia.",
      "Me sinto muito fraco": "Fraqueza pode ser hipoglicemia. Coma algo com carboidrato + proteína agora: banana com queijo. E avalie com seu médico se a dose está alta demais.",
    },
    receita_id: 2,
    recompensa: "Músculo protegido no dia crítico 💪",
    xp: 40,
  },
  {
    n: 5, titulo: "Pequenas refeições, grandes resultados",
    video: "O segredo das próximas semanas está neste número:\n\n200ml.\n\nÉ o volume máximo ideal por refeição durante o GLP-1.\n\nNão por restrição.\nPor fisiologia.\n\nSeu estômago reduzido em sensibilidade vai se sentir cheio com 200ml.\nForçar mais causa náusea, refluxo e desconforto.\n\nMas 200ml de alta densidade nutricional, 5 vezes ao dia?\n\nIsso muda tudo.",
    explicacao: "O conceito de densidade nutricional por volume é fundamental no GLP-1. 200ml de vitamina proteica com whey + aveia + banana entrega 30g de proteína, 40g carbs e 300 kcal — nutrição completa sem estressar o sistema digestivo adaptado.",
    missoes: [
      { texto: "5 refeições de até 200ml ou 1 prato pequeno", sub: "Qualidade acima de quantidade" },
      { texto: "Proteína em CADA uma das 5 refeições", sub: "Distribuição proteica = preservação muscular máxima" },
      { texto: "Registrar o que comeu (foto ou texto)", sub: "Consciência alimentar é habilidade, não punição" },
    ],
    checkin: ["Consegui as 5 refeições pequenas", "Só fiz 3 refeições", "Senti que exagerei no volume", "Energia melhorou hoje"],
    ia: {
      "Consegui as 5 refeições pequenas": "5 refeições com proteína = máxima síntese proteica muscular ao longo do dia. Você está fazendo o protocolo perfeito.",
      "Só fiz 3 refeições": "3 refeições está ok — desde que cada uma tenha proteína. Amanhã tente adicionar 2 lanches pequenos: iogurte grego ou queijo.",
      "Senti que exagerei no volume": "Reduza para 150ml nas próximas refeições. Seu estômago está sinalizando corretamente — ouça.",
      "Energia melhorou hoje": "O Dia 5 costuma ser o turning point da adaptação. Seu corpo está encontrando o novo equilíbrio energético.",
    },
    receita_id: 3,
    recompensa: "Estratégia de volume dominada 🎯",
    xp: 30,
  },
  {
    n: 6, titulo: "Semana 1 quase completa — o que mudou no seu corpo",
    video: "Você está há 6 dias com o GLP-1.\n\nAqui está o que já mudou, mesmo que você não tenha percebido:\n\nSeu hipotálamo reduziu a produção de grelina em 30%.\nSeu pâncreas está liberando insulina de forma mais eficiente.\nSuas células beta estão se recuperando.\nSua glicemia de jejum já está mais estável.\n\nE a escala?\n\nA escala mostra 1-3kg.\nMas a mudança metabólica real é 10x maior que esse número.",
    explicacao: "Na primeira semana, as mudanças metabólicas são profundas: redução da resistência à insulina, melhora da função beta pancreática, normalização dos ritmos de grelina e diminuição da inflamação sistêmica. Esses marcadores melhoram antes de qualquer mudança visível no espelho.",
    missoes: [
      { texto: "Medidas corporais hoje — cintura e quadril", sub: "Polegadas perdidas > kg perdidos nos primeiros 7 dias" },
      { texto: "Hidratação completa: {agua}ml hoje", sub: "Semana 1 causa perda de água e eletrólitos" },
      { texto: "Sono 8 horas esta noite", sub: "GH liberado durante o sono preserva músculo e queima gordura" },
    ],
    checkin: ["Me sinto diferente fisicamente", "Perdi peso visivelmente", "Ainda com efeitos colaterais", "Adaptação completa"],
    ia: {
      "Me sinto diferente fisicamente": "Esse 'diferente' é real — seus marcadores metabólicos já mudaram. Você está no caminho certo.",
      "Perdi peso visivelmente": "Excelente! Na Semana 1 a perda é principalmente água e glicogênio. A gordura começa a ser queimada de forma significativa na Semana 2.",
      "Ainda com efeitos colaterais": "Alguns pacientes levam até 3 semanas para adaptação completa. Você está dentro do normal. Continue com as estratégias anti-náusea.",
      "Adaptação completa": "Adaptação na Semana 1 é sinal de que você tem boa tolerância ao GLP-1. Agora é hora de otimizar os resultados.",
    },
    receita_id: 4,
    recompensa: "Primeira semana dominada 🏅",
    xp: 40,
  },
  {
    n: 7, titulo: "Você sobreviveu. Agora começa a transformação.",
    video: "7 dias atrás você não sabia o que esperar.\n\nHoje você sabe:\nComo gerenciar a náusea.\nComo comer sem fome.\nComo proteger seu músculo.\nComo o GLP-1 funciona no seu corpo.\n\nIsso é conhecimento que 90% das pessoas que tomam GLP-1 nunca aprende.\n\nA sobrevivência acabou.\n\nA partir de amanhã — começa a transformação.",
    explicacao: "Completar o protocolo de adaptação de 7 dias reduz significativamente a chance de abandono do tratamento. Estudos mostram que pacientes que atravessam a primeira semana com suporte estruturado têm 3x mais adesão aos 6 meses. Você agora está no grupo de alto sucesso.",
    missoes: [
      { texto: "Registrar como está se sentindo vs Dia 1", sub: "Evidência concreta do progresso" },
      { texto: "Planejar as próximas 2 semanas de refeições", sub: "Estrutura previne recaída em efeitos colaterais" },
      { texto: "Compartilhar uma vitória desta semana", sub: "Comprometimento social aumenta adesão em 40%" },
    ],
    checkin: ["Completei os 7 dias", "Me sinto muito mais confiante", "Aprendi muito sobre meu corpo", "Pronto para o próximo protocolo"],
    ia: {
      "Completei os 7 dias": "7 dias completos de adaptação estruturada. Você fez o que a maioria não faz — e isso vai fazer toda a diferença nos resultados.",
      "Me sinto muito mais confiante": "Confiança vem de competência. Você aprendeu como funciona seu corpo com GLP-1 — essa é a base de tudo.",
      "Aprendi muito sobre meu corpo": "Esse aprendizado é permanente. Independente do que aconteça com o tratamento, você nunca vai esquecer como gerenciar esses sinais.",
      "Pronto para o próximo protocolo": "O próximo protocolo vai amplificar tudo que você construiu aqui. Escolha bem o que vem depois.",
    },
    receita_id: 5,
    recompensa: "ADAPTAÇÃO COMPLETA — Transformação iniciada 🚀",
    xp: 100,
  },
];

export default function Protocolo1({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={1}
      emoji="💉"
      nome="Sobrevivendo às Canetas"
      storageKey="glpy_sobrevivendo"
      receitas={RECEITAS}
      dias={DIAS}
      videos={VIDEOS}
      firestoreId="protocolo-1"
      onNavigate={onNavigate}
    />
  );
}
