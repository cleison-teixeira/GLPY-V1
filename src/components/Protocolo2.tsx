import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🥣", nome: "Mingau Anti-Constipação",
    kcal: 290, proteina: 12, carbs: 44, gordura: 7,
    categoria: "Café da manhã · Constipação",
    desc: "A fibra solúvel da aveia + chia forma gel no intestino, lubrificando o trânsito sem irritar. Fundamental para quem sofre com constipação no GLP-1.",
    ingredientes: ["5 col sopa aveia grossa", "1 col sopa chia", "250ml leite morno", "1 col chá mel", "Ameixa seca picada (3 unidades)"],
    preparo: "Misture aveia, chia e leite morno. Deixe 10 min para a chia hidratar. Adicione mel e ameixa. Coma em temperatura ambiente.",
    glp1tip: "A chia hidratada forma um gel que adiciona volume ao bolo fecal sem causar gases. A ameixa tem sorbitol — laxante natural suave que funciona em 6-8h.",
    dias: [1, 3, 6],
  },
  {
    id: 2, emoji: "🍋", nome: "Limonada com Gengibre e Hortelã",
    kcal: 25, proteina: 0, carbs: 6, gordura: 0,
    categoria: "Qualquer horário · Náusea aguda",
    desc: "O antiemético natural mais eficaz. Três compostos ativos em uma bebida: gingerol (gengibre), mentol (hortelã) e citral (limão) — todos com efeito comprovado contra náusea.",
    ingredientes: ["Suco de 1 limão", "1 col chá gengibre ralado fresco", "5 folhas hortelã fresca", "200ml água gelada", "1 col chá mel"],
    preparo: "Misture todos os ingredientes. Coe o gengibre se preferir. Beba em pequenos goles quando a náusea aparecer.",
    glp1tip: "Beba em temperatura muito fria — o frio reduz o reflexo de vômito diretamente. Esta bebida pode ser feita em grande quantidade e mantida na geladeira para uso rápido.",
    dias: [1, 2, 4],
  },
  {
    id: 3, emoji: "🫘", nome: "Caldo de Feijão Suave",
    kcal: 210, proteina: 11, carbs: 30, gordura: 4,
    categoria: "Almoço · Jantar · Digestão lenta",
    desc: "O caldo (sem os grãos) entrega ferro, fibra solúvel e proteína vegetal sem sobrecarregar a digestão. Reconfortante para dias difíceis.",
    ingredientes: ["200ml caldo de feijão preto cozido (só o líquido)", "1 folha de louro", "Alho e cebola", "Sal e cominho", "Salsinha"],
    preparo: "Cozinhe feijão normalmente. Use apenas o caldo coado. Tempere com alho, sal e cominho. Beba quente.",
    glp1tip: "O caldo de feijão tem prebióticos naturais que alimentam as bactérias boas do intestino, ajudando a restaurar a motilidade intestinal reduzida pelo GLP-1.",
    dias: [2, 5, 7],
  },
  {
    id: 4, emoji: "🥜", nome: "Mix Anti-Fadiga",
    kcal: 280, proteina: 8, carbs: 24, gordura: 18,
    categoria: "Lanche · Fadiga",
    desc: "Combinação de magnésio (nozes), potássio (ameixa) e vitamina E (amêndoa) — os 3 minerais mais depletos quando o GLP-1 causa vômitos ou pouca ingestão.",
    ingredientes: ["15g nozes", "15g amêndoas", "10g castanha-do-pará (2 unidades)", "3 ameixas secas", "1 pitada sal rosa"],
    preparo: "Misture tudo em um potinho. Coma devagar, mastigando bem. Não tome com o estômago vazio.",
    glp1tip: "2 castanhas-do-pará por dia cobrem 100% da necessidade de selênio — mineral crítico para tireoide que pode ser afetada pela perda de peso rápida do GLP-1.",
    dias: [3, 5],
  },
  {
    id: 5, emoji: "🥦", nome: "Sopa de Batata com Brócolis",
    kcal: 220, proteina: 9, carbs: 28, gordura: 8,
    categoria: "Jantar · Digestão fácil",
    desc: "Batata cozida tem o menor índice de FODMAP entre os tubérculos — não causa gases. O brócolis cozido perde os compostos irritantes que causam flatulência quando cru.",
    ingredientes: ["150g batata-inglesa", "100g brócolis cozido bem mole", "200ml caldo de legumes", "Azeite 1 fio", "Sal e pimenta do reino"],
    preparo: "Cozinhe a batata até muito mole. Bata no liquidificador com caldo e brócolis. Aqueça e sirva com azeite.",
    glp1tip: "Sopas batidas têm menor volume de ar que alimentos sólidos — reduzem a distensão abdominal que piora a náusea. Sempre prefira textura lisa nos primeiros 15 dias.",
    dias: [4, 6, 7],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "Efeitos colaterais são temporários. O resultado é permanente.",
    video: "Os efeitos colaterais do GLP-1 têm uma curva previsível.\n\nPico: Dias 2-5\nDeclínio: Semanas 2-3\nDesaparecimento: Semana 4-8\n\nIsso não é promessa de marketing.\nSão os dados de 47 estudos clínicos.\n\nSeu trabalho esta semana é atravessar a curva.\n\nNão lutar contra o processo.\nSe preparar para o desconforto previsível.\nE ter o protocolo exato para cada sintoma.",
    explicacao: "Os efeitos colaterais do GLP-1 ocorrem porque os receptores GLP-1R estão presentes em todo o trato gastrointestinal. Com o uso contínuo, esses receptores se dessensibilizam — processo chamado downregulation — e os sintomas diminuem naturalmente. A adesão durante esse período é o fator mais importante para o sucesso.",
    missoes: [
      { texto: "Mapear seus sintomas de hoje (náusea, constipação, fadiga)", sub: "Conhecimento do padrão permite intervenção precoce" },
      { texto: "Ter gengibre fresco em casa", sub: "O antiemético natural mais eficaz disponível" },
      { texto: "Hidratação mínima: {agua}ml hoje", sub: "Vômitos causam desidratação que piora TODOS os sintomas" },
    ],
    checkin: ["Só náusea leve", "Constipação incomodando", "Fadiga intensa hoje", "Múltiplos sintomas juntos"],
    ia: {
      "Só náusea leve": "Náusea leve é o sintoma mais fácil de gerenciar. Gengibre, frio e refeições pequenas resolvem. Continue o protocolo.",
      "Constipação incomodando": "Amanhã vamos trabalhar especificamente constipação. Por enquanto: adicione 1 col sopa de chia na água e aumente a hidratação.",
      "Fadiga intensa hoje": "Fadiga no início pode ser hipoglicemia leve. Verifique: comeu carboidrato hoje? Adicione uma fruta + proteína agora.",
      "Múltiplos sintomas juntos": "Múltiplos sintomas juntos merecem atenção. Se estiver tendo 3 ou mais sintomas moderados, ligue para seu médico. Pode ser necessário ajustar a dose inicial.",
    },
    receita_id: 2,
    recompensa: "Mapeamento dos sintomas iniciado 🗺️",
    xp: 30,
  },
  {
    n: 2, titulo: "Dominando a náusea — o protocolo de 24 horas",
    video: "Existem 5 gatilhos da náusea no GLP-1 que você pode controlar.\n\n1. Volume de refeição\n2. Temperatura do alimento\n3. Cheiros do ambiente\n4. Velocidade de comer\n5. Posição após comer\n\nSe você eliminar todos os 5 hoje,\nA náusea vai diminuir em 70-80%.\n\nNão é milagre.\nÉ fisiologia.",
    explicacao: "A área postrema do cérebro (centro do vômito) é ativada por múltiplos estímulos simultâneos. Eliminando os gatilhos controláveis, você reduz drasticamente o limiar de ativação desse centro — mesmo que o GLP-1 ainda esteja estimulando os receptores periféricos.",
    missoes: [
      { texto: "Refeições frias ou temperatura ambiente — sem exceção", sub: "Calor = vasodilatação = mais náusea" },
      { texto: "Comer em ambiente sem cheiros fortes", sub: "Olfato é o gatilho mais negligenciado da náusea" },
      { texto: "30 min de repouso sentado após cada refeição", sub: "Horizontal ativa refluxo que piora tudo" },
    ],
    checkin: ["Náusea controlada com as estratégias", "Ainda com náusea significativa", "Zero náusea hoje", "Náusea piorou à noite"],
    ia: {
      "Náusea controlada com as estratégias": "Você está dominando os gatilhos comportamentais. Cada dia agora vai ser melhor que o anterior.",
      "Ainda com náusea significativa": "Adicione um antiemético natural: 1 col chá de gengibre em 200ml de água fria, 30min antes das refeições. Resultados em 20min.",
      "Zero náusea hoje": "Excelente adaptação! Seu sistema nervoso entérico está respondendo bem. Alguns pacientes não têm praticamente nenhum sintoma — você pode ser um deles.",
      "Náusea piorou à noite": "Náusea noturna geralmente é refluxo. Eleve levemente o travesseiro e não coma nas 3h antes de dormir.",
    },
    receita_id: 2,
    recompensa: "Anti-náusea dominado 🌿",
    xp: 35,
  },
  {
    n: 3, titulo: "Constipação: o efeito colateral que ninguém comenta",
    video: "40% das pessoas em GLP-1 desenvolvem constipação.\n\nMas ninguém fala sobre isso.\n\nO motivo é fisiológico:\nO GLP-1 reduz a motilidade intestinal.\nO intestino recebe menos estímulo para se mover.\n\nE a solução NÃO é laxante.\n\nA solução é fibra solúvel, hidratação e movimento.\n\nEssas 3 coisas juntas resolvem 90% dos casos em 48h.",
    explicacao: "O GLP-1 reduz a motilidade colônica via receptores no plexo mioentérico. A solução é fibra solúvel (que forma gel e lubrifica) + hidratação (que amolece o bolo fecal) + movimento físico (que estimula reflexo gastrocólico). Evitar laxantes estimulantes — podem criar dependência.",
    missoes: [
      { texto: "2 col sopa de chia ou linhaça nas refeições", sub: "Fibra solúvel forma gel que lubrifica o trânsito" },
      { texto: "Caminhada de 15 min após almoço", sub: "Movimento ativa o reflexo gastrocólico natural" },
      { texto: "Água com limão em jejum pela manhã", sub: "Estimula peristaltismo e produção de bile" },
    ],
    checkin: ["Funcionou o intestino hoje", "Ainda sem ir ao banheiro", "Desconforto abdominal", "Funcionamento normal voltou"],
    ia: {
      "Funcionou o intestino hoje": "Protocolo funcionando! Continue com chia + hidratação como rotina permanente durante o tratamento.",
      "Ainda sem ir ao banheiro": "Mais de 3 dias sem evacuar: adicione ameixa seca (4 unidades) ao mingau. Se persistir além de 5 dias, informe seu médico.",
      "Desconforto abdominal": "Gases e distensão são comuns junto com constipação. Evite feijão, repolho e brócolis cru hoje. Camomila quente ajuda no espasmo.",
      "Funcionamento normal voltou": "Ótimo! Mantenha a chia como hábito permanente — previne recorrência que é comum nas primeiras 4 semanas.",
    },
    receita_id: 1,
    recompensa: "Intestino regulado 🌿",
    xp: 35,
  },
  {
    n: 4, titulo: "Fadiga no GLP-1: seu corpo está trabalhando duro nos bastidores",
    video: "A fadiga que você sente não é fraqueza.\n\nÉ adaptação.\n\nSeu corpo está remodelando seu metabolismo:\nReconectando receptores de insulina.\nReiniciando o sistema de sinalização da saciedade.\nQueimando gordura por uma via que não usava há anos.\n\nIsso gasta energia.\n\nHoje você vai trabalhar COM essa fadiga,\nnão contra ela.",
    explicacao: "A fadiga precoce do GLP-1 tem três causas: déficit calórico (se a ingestão caiu muito), perda de glicogênio (nos primeiros dias) e o custo metabólico da adaptação hormonal. A solução é ingestão calórica mínima adequada, distribuição de carboidratos ao longo do dia e sono suficiente.",
    missoes: [
      { texto: "Nunca ficar mais de 4h sem comer", sub: "Jejum prolongado = fadiga + hipoglicemia reativa" },
      { texto: "Carboidrato de baixo IG no lanche da tarde", sub: "Batata-doce, aveia ou fruta — sustentam a energia" },
      { texto: "Sesta de 20 min se possível", sub: "Microssono recupera 40% da performance cognitiva" },
    ],
    checkin: ["Energia melhorou ao longo do dia", "Fadiga constante", "Mal-estar + fadiga juntos", "Energia boa hoje"],
    ia: {
      "Energia melhorou ao longo do dia": "Energia que melhora ao longo do dia indica que o metabolismo está se estabilizando. O corpo está aprendendo a usar gordura como combustível.",
      "Fadiga constante": "Fadiga que não melhora após comer pode indicar déficit de ferro ou B12. Registre o sintoma para seu médico na próxima consulta.",
      "Mal-estar + fadiga juntos": "Combinação que merece atenção. Certifique-se de estar ingerindo pelo menos 1.000 kcal/dia. Abaixo disso, o corpo entra em modo de preservação.",
      "Energia boa hoje": "Sem fadiga no Dia 4 é excelente sinal de tolerância. Continue com o mesmo padrão alimentar.",
    },
    receita_id: 4,
    recompensa: "Energia gerenciada 🔋",
    xp: 30,
  },
  {
    n: 5, titulo: "Tontura e coração acelerado — quando se preocupar",
    video: "Tontura no GLP-1 tem 3 causas comuns:\n\n1. Hipotensão ortostática — pressão que cai ao levantar\n2. Desidratação — perda de volume por vômitos ou ingestão baixa\n3. Hipoglicemia — glicose baixa\n\nCada uma tem uma solução diferente.\n\nHoje você aprende a distinguir cada uma e agir certo.",
    explicacao: "O GLP-1 tem leve efeito hipotensor que pode causar tontura ao mudar de posição. Além disso, a redução calórica agressiva pode causar hipoglicemia reativa. A taquicardia leve (5-10 bpm acima do basal) é efeito direto do receptor GLP-1R cardíaco e é benigna e temporária.",
    missoes: [
      { texto: "Levantar devagar: 3 segundos em posição sentada antes de ficar de pé", sub: "Previne hipotensão ortostática" },
      { texto: "Sal na comida (não restringir)", sub: "Sódio retém volume e previne hipotensão" },
      { texto: "Comer algo ao sinal de tontura", sub: "Banana + queijo em 3 min — descarta hipoglicemia" },
    ],
    checkin: ["Tive tontura ao levantar", "Coração acelerado", "Nenhum desses sintomas", "Tontura após não comer"],
    ia: {
      "Tive tontura ao levantar": "Tontura ortostática clássica. Levante sempre devagar, não restrinja sal e beba 250ml de água ao acordar. Passa em 1-2 semanas.",
      "Coração acelerado": "Leve taquicardia é efeito direto do GLP-1 no coração — é benigno. Se FC acima de 110 em repouso ou acompanhado de dor no peito, consulte médico.",
      "Nenhum desses sintomas": "Ótima tolerância cardiovascular! Seu sistema está se adaptando sem complicações.",
      "Tontura após não comer": "Isso é hipoglicemia reativa — o pâncreas liberou insulina mas não havia carboidrato suficiente. Nunca ultrapasse 4h sem comer.",
    },
    receita_id: 2,
    recompensa: "Sinais do corpo decifrados 🧠",
    xp: 35,
  },
  {
    n: 6, titulo: "O dia de recuperação — quando é demais",
    video: "Alguns dias vão ser difíceis.\n\nIsso não é falha.\nÉ parte do protocolo.\n\nHoje vamos falar sobre o que fazer nos dias em que parece impossível:\n\nQuando náusea + fadiga + constipação aparecem juntos.\nQuando você não conseguiu comer nada.\nQuando está pensando em parar.\n\nHá um plano para isso.",
    explicacao: "Dias difíceis são previsíveis e manejáveis. O protocolo de emergência inclui: hidratação com eletrólitos, refeição líquida proteica mínima, repouso e reavaliação com o médico se necessário. Nunca interrompa o GLP-1 sozinho — a dose pode precisar de ajuste.",
    missoes: [
      { texto: "Protocolo de emergência: só líquidos hoje se necessário", sub: "Vitamina proteica ou caldo — mínimo 600 kcal" },
      { texto: "Ligar para o médico se 3 sintomas moderados simultâneos", sub: "Pode precisar ajustar dose ou intervalo" },
      { texto: "Descanso ativo: caminhada leve de 10 min", sub: "Movimento suave melhora náusea sem esgotar" },
    ],
    checkin: ["Dia difícil mas me virei", "Precisei ligar para o médico", "Consegui comer normalmente", "Pensando em desistir"],
    ia: {
      "Dia difícil mas me virei": "Resiliência nos dias difíceis é o que define o resultado a longo prazo. Você fez o que a maioria não consegue.",
      "Precisei ligar para o médico": "Certo! Seu médico é seu maior aliado neste processo. Uma redução temporária de dose pode fazer a diferença.",
      "Consegui comer normalmente": "Que ótimo! Amanhã é o último dia do protocolo — e você chegou até aqui.",
      "Pensando em desistir": "Espere. A curva de adaptação é real e você está no pior ponto. Fale com seu médico sobre antiemético pontual — pode mudar tudo nas próximas 48h.",
    },
    receita_id: 3,
    recompensa: "Resiliência testada e aprovada 💪",
    xp: 40,
  },
  {
    n: 7, titulo: "Seus efeitos colaterais têm prazo de validade",
    video: "Você chegou ao Dia 7.\n\nSe ainda tem sintomas — eles vão passar.\nSe já passaram — você tem algo valioso: o conhecimento de como manejá-los.\n\nEstudos mostram que 95% dos pacientes com sintomas na Semana 1 estão confortáveis na Semana 4.\n\nVocê tem 3 semanas de melhora progressiva pela frente.\n\nE agora você tem as ferramentas.",
    explicacao: "A dessensibilização dos receptores GLP-1R no trato gastrointestinal é documentada e previsível. Na Semana 2-3, a expressão desses receptores diminui naturalmente. A manutenção da dose e do protocolo nutricional é o que acelera esse processo.",
    missoes: [
      { texto: "Lista dos sintomas que melhoraram vs Dia 1", sub: "Evidência do progresso real" },
      { texto: "Definir sua estratégia para a Semana 2", sub: "Continuidade é a chave" },
      { texto: "Foto de si mesmo — guardar para comparar", sub: "7 dias já produzem mudanças visíveis" },
    ],
    checkin: ["Muito melhor que no Dia 1", "Ainda difícil mas vou continuar", "Sintomas quase zerados", "Aprendi a gerenciar meu corpo"],
    ia: {
      "Muito melhor que no Dia 1": "Essa melhora em 7 dias é o que os estudos predizem. A Semana 2 vai ser ainda melhor.",
      "Ainda difícil mas vou continuar": "Essa decisão de continuar é a mais importante que você pode tomar. Os resultados chegam para quem persiste.",
      "Sintomas quase zerados": "Adaptação acelerada! Você tem excelente tolerância ao GLP-1. A partir daqui, o foco vai inteiramente para os resultados.",
      "Aprendi a gerenciar meu corpo": "Esse autoconhecimento vale mais que qualquer perda de peso. Você agora sabe como o GLP-1 age no SEU corpo.",
    },
    receita_id: 5,
    recompensa: "PROTOCOLO DE EFEITOS COLATERAIS COMPLETO 🏆",
    xp: 100,
  },
];

export default function Protocolo2({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={2}
      emoji="🩺"
      nome="Controle de Efeitos Colaterais"
      storageKey="glpy_efeitos"
      receitas={RECEITAS}
      dias={DIAS}
      onNavigate={onNavigate}
    />
  );
}
