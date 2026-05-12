import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const VIDEOS: Record<number, string> = {
  1: "https://glpy.b-cdn.net/PROTOCOLO-9-AJUSTE-METABOLICO/dia1-ajuste-metabolico.mp4",
  2: "https://glpy.b-cdn.net/PROTOCOLO-9-AJUSTE-METABOLICO/dia2-ajuste-metabolico.mp4",
  3: "https://glpy.b-cdn.net/PROTOCOLO-9-AJUSTE-METABOLICO/dia3-ajuste-metabolico.mp4",
  4: "https://glpy.b-cdn.net/PROTOCOLO-9-AJUSTE-METABOLICO/dia4-ajuste-metabolico.mp4",
  5: "https://glpy.b-cdn.net/PROTOCOLO-9-AJUSTE-METABOLICO/dia5-ajuste-metabolico.mp4",
  6: "https://glpy.b-cdn.net/PROTOCOLO-9-AJUSTE-METABOLICO/dia6-ajuste-metabolico.mp4",
  7: "https://glpy.b-cdn.net/PROTOCOLO-9-AJUSTE-METABOLICO/dia7-ajuste-metabolico.mp4",
};

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🌶️", nome: "Frango Picante com Pimenta Caiena",
    kcal: 380, proteina: 38, carbs: 18, gordura: 14,
    categoria: "Almoço · Jantar · Termogênico",
    desc: "Capsaicina da pimenta caiena ativa receptores TRPV1 que aumentam a termogênese em 4-5% por 4 horas. Uma refeição que literalmente reacende seu metabolismo.",
    ingredientes: ["150g frango grelhado", "1/4 col chá pimenta caiena", "100g batata-doce", "Páprica defumada e cominho", "Azeite"],
    preparo: "Marine o frango com pimenta, páprica e cominho. Grelhe em fogo alto. Sirva com batata-doce assada.",
    glp1tip: "Capsaicina aumenta a expressão de UCP1 (proteína desacopladora 1) no tecido adiposo marrom — convertendo gordura em calor em vez de ATP. Efeito comprovado em meta-análise de 2012.",
    dias: [1, 3, 5],
  },
  {
    id: 2, emoji: "🍵", nome: "Matcha com Colágeno Pós-Treino",
    kcal: 180, proteina: 12, carbs: 10, gordura: 6,
    categoria: "Pós-treino · Metabolismo",
    desc: "EGCG do matcha inibe a COMT (catecol-O-metiltransferase), aumentando a ação das catecolaminas (adrenalina/noradrenalina) na queima de gordura por até 4h.",
    ingredientes: ["1 col chá matcha cerimonial", "10g colágeno", "200ml leite vegetal morno", "1 col chá mel"],
    preparo: "Bata o matcha com 50ml de água quente (não fervente — 80°C) até espumar. Adicione leite, colágeno e mel.",
    glp1tip: "Matcha tem 3x mais EGCG que chá verde convencional. O efeito termogênico é sinérgico com cafeína — a combinação aumenta a oxidação de gordura em 16%.",
    dias: [2, 4, 7],
  },
  {
    id: 3, emoji: "🥦", nome: "Bowl Metabólico com MCT",
    kcal: 420, proteina: 28, carbs: 32, gordura: 20,
    categoria: "Almoço",
    desc: "MCT (triglicerídeos de cadeia média) são oxidados diretamente no fígado sem passar pelo sistema linfático — aumentando o gasto energético em 5% por até 6h.",
    ingredientes: ["100g frango cozido", "100g brócolis", "50g arroz integral", "1 col sopa óleo de coco ou MCT", "Alho e cúrcuma"],
    preparo: "Monte o bowl com frango, brócolis vapor e arroz. Regue com MCT aquecido temperado com alho e cúrcuma.",
    glp1tip: "MCT de ácido caprílico (C8) é o mais eficiente em ativar cetogênese hepática leve — estado que aumenta expressão de genes relacionados ao gasto energético.",
    dias: [1, 4, 6],
  },
  {
    id: 4, emoji: "🐟", nome: "Atum com Azeite Extra-Virgem e Orégano",
    kcal: 310, proteina: 36, carbs: 2, gordura: 18,
    categoria: "Almoço · Jantar",
    desc: "Ômega-3 do atum aumenta a expressão de PPARα — receptor nuclear que ativa a oxidação de ácidos graxos. Oleocanthal do azeite extra-virgem tem ação anti-inflamatória que melhora sensibilidade à insulina.",
    ingredientes: ["1 lata atum em azeite (120g)", "Azeite extra-virgem 2 col sopa", "Orégano fresco ou seco", "Tomate cereja", "Alcaparras"],
    preparo: "Monte o atum sobre tomate cereja. Regue com azeite extra-virgem generoso. Finalize com orégano e alcaparras.",
    glp1tip: "Azeite extra-virgem tem compostos fenólicos (oleocanthal, oleuropeína) que ativam AMPK — a enzima que sinaliza para a célula queimar gordura como energia.",
    dias: [2, 5],
  },
  {
    id: 5, emoji: "🫐", nome: "Açaí com Whey e Coco Ralado",
    kcal: 360, proteina: 26, carbs: 30, gordura: 14,
    categoria: "Café da manhã · Pós-treino",
    desc: "Antocianinas do açaí ativam SIRT1 (sirtuína 1) — a proteína do envelhecimento saudável que também regula o metabolismo energético mitocondrial.",
    ingredientes: ["100g polpa açaí sem açúcar", "25g whey proteico", "20g coco ralado sem açúcar", "Banana em rodelas", "Granola sem açúcar"],
    preparo: "Bata o açaí com whey. Monte na tigela com coco, banana e granola.",
    glp1tip: "Açaí sem açúcar tem índice ORAC (capacidade antioxidante) de 15.405 — um dos maiores entre os alimentos. Antioxidantes reduzem estresse oxidativo mitocondrial, melhorando eficiência energética.",
    dias: [3, 6, 7],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "Seu metabolismo desacelerou. Veja a ciência por trás.",
    video: "Aqui está o que acontece com seu metabolismo quando você emagrece rapidamente:\n\nPara cada kg perdido — seu gasto basal cai 22 kcal.\n\nPerca 10kg → -220 kcal/dia do metabolismo basal.\n\nIsso não é opção. É fisiologia.\n\nSeu corpo interpretou o déficit como escassez\nE reduziu todas as saídas de energia.\n\nO nome científico:\nTermogênese adaptativa.\n\nE este protocolo vai ensiná-lo a driblar ela.",
    explicacao: "A termogênese adaptativa é a redução do gasto energético além do esperado pela perda de massa. Estudos do Biggest Loser mostram que participantes tinham metabolismo 500 kcal/dia abaixo do previsto após a perda de peso. Isso explica o platô e o rebote. Estratégias de reverse dieting e manutenção do músculo são as únicas comprovadas para reverter.",
    missoes: [
      { texto: "Calcular seu TDEE atual com a nova calculadora", sub: "Peso atual × 22-25 kcal = TDEE estimado" },
      { texto: "Calorias esta semana: mínimo 1.200 kcal/dia", sub: "Abaixo disso aumenta a termogênese adaptativa" },
      { texto: "Pesar todos os dias pela manhã e fazer média semanal", sub: "Variação diária normal — olhe para a tendência" },
    ],
    checkin: ["Entendi a termogênese adaptativa", "Calculei meu TDEE atual", "Estou cima de 1.200 kcal", "Platô faz sentido agora"],
    ia: {
      "Entendi a termogênese adaptativa": "Entendimento é poder. Agora você sabe por que o corpo resiste — e tem as estratégias para superar.",
      "Calculei meu TDEE atual": "Com o TDEE real calculado, você pode fazer a matemática do reverse dieting. O protocolo começa agora.",
      "Estou cima de 1.200 kcal": "1.200 kcal é o piso. Abaixo disso, o metabolismo entra em modo de emergência que piora tudo.",
      "Platô faz sentido agora": "Platô não é fracasso — é o corpo se ajustando. As estratégias desta semana vão reacender o metabolismo.",
    },
    receita_id: 3,
    recompensa: "Termogênese adaptativa mapeada 🗺️",
    xp: 30,
  },
  {
    n: 2, titulo: "Calculando seu novo TDEE pós-emagrecimento",
    video: "Seu TDEE mudou.\n\nO que era 2.200 kcal antes pode ser 1.800 agora.\n\nE se você continuou comendo 1.400 kcal achando que estava em déficit de 800,\nNa verdade seu déficit é de 400.\nE está diminuindo a cada semana.\n\nCalibrar o TDEE atual é o passo mais importante\npara não ficar girando em círculos.",
    explicacao: "O TDEE (Total Daily Energy Expenditure) diminui com a perda de peso por dois mecanismos: o peso menor queima menos calorias para se mover, e a termogênese adaptativa reduz o metabolismo basal além do esperado. Recalcular o TDEE a cada 5kg perdidos é a prática recomendada.",
    missoes: [
      { texto: "Recalcular TDEE: (10×peso + 6.25×altura - 5×idade - 161) × nível atividade", sub: "Mifflin-St Jeor — mais precisa para peso pós-GLP-1" },
      { texto: "Comparar TDEE atual com o de quando começou", sub: "A diferença é a termogênese adaptativa em números" },
      { texto: "Definir novo déficit realista: máximo -300 kcal do TDEE", sub: "Déficit menor = menos termogênese adaptativa" },
    ],
    checkin: ["Calculei meu novo TDEE", "O déficit era menor do que eu pensava", "Entendi por que o peso parou", "Ajustei minha ingestão calórica"],
    ia: {
      "Calculei meu novo TDEE": "Você agora tem o número real. A partir daqui, cada decisão alimentar é informada — não mais no escuro.",
      "O déficit era menor do que eu pensava": "Isso explica o platô. Mas também significa que você está preservando melhor o metabolismo do que pensava.",
      "Entendi por que o peso parou": "Platô = metabolismo recalibrado. A solução é aumentar gradualmente as calorias (reverse dieting) + aumentar NEAT.",
      "Ajustei minha ingestão calórica": "Ajuste baseado em dados reais. Continue medindo e ajustando a cada 2-3 semanas.",
    },
    receita_id: 4,
    recompensa: "TDEE recalibrado 📊",
    xp: 35,
  },
  {
    n: 3, titulo: "Termogênese adaptativa: o mecanismo que você pode dominar",
    video: "Seu metabolismo não é fixo.\n\nEle responde a estímulos.\n\nOs 5 maiores inimigos do metabolismo:\n1. Déficit calórico extremo\n2. Cardio excessivo sem força\n3. Privação de sono\n4. Estresse crônico\n5. Déficit proteico\n\nOs 5 maiores aliados:\n1. Treino de força\n2. Proteína alta\n3. Sono 8h\n4. Termogênicos naturais (café, pimenta, chá verde)\n5. Refeições regulares",
    explicacao: "A termogênese adaptativa age em 3 frentes: reduz o metabolismo basal, diminui o NEAT espontâneo e aumenta a eficiência metabólica (menos calorias para realizar a mesma tarefa). Contrarrestar essas três frentes simultâneamente é o único caminho comprovado.",
    missoes: [
      { texto: "Treino de força hoje — mesmo que 15 min", sub: "Maior estímulo individual contra termogênese adaptativa" },
      { texto: "Termogênico natural: café + pimenta ou chá verde", sub: "Sinergia cafeína + capsaicina + EGCG = +12% termogênese" },
      { texto: "Refeição regular de 3/3h — sem saltar", sub: "Irregularidade alimentar piora termogênese adaptativa" },
    ],
    checkin: ["Fiz treino de força", "Tomei termogênico natural", "Refeições regulares feitas", "Entendo como combater a adaptação"],
    ia: {
      "Fiz treino de força": "Treino de força é o único estímulo que aumenta o metabolismo basal por horas pós-exercício (EPOC). Mantenha consistência.",
      "Tomei termogênico natural": "A combinação cafeína + EGCG + capsaicina foi estudada em meta-análise: aumento de 3-5% do gasto energético diário.",
      "Refeições regulares feitas": "Regularidade alimentar normaliza o ritmo circadiano do metabolismo — um dos mecanismos da termogênese adaptativa.",
      "Entendo como combater a adaptação": "Conhecimento + execução = resultado. Você tem as ferramentas. Agora é consistência.",
    },
    receita_id: 1,
    recompensa: "Termogênese adaptativa revertida ⚡",
    xp: 40,
  },
  {
    n: 4, titulo: "Reverse dieting: como aumentar calorias sem engordar",
    video: "O paradoxo do emagrecimento:\n\nQuanto mais você restringe — mais o metabolismo desacelera.\nQuanto mais você aumenta calorias de volta — mais o metabolismo acelera.\n\nMas se você aumentar rápido demais — engorda.\nSe aumentar devagar demais — não reacende o metabolismo.\n\nA velocidade certa:\n50-100 kcal a mais por semana.\n\nDevagar o suficiente para não engordar.\nRápido o suficiente para reacender.",
    explicacao: "O reverse dieting foi desenvolvido por fisiculturistas para aumentar o metabolismo após cutting intenso. A lógica: aumentar calorias gradualmnte (~50-100 kcal/semana) dá tempo para o metabolismo se adaptar para cima — aumentando o TDEE sem acumular gordura. Estudos mostram que é possível aumentar o TDEE em 200-400 kcal após 8-12 semanas.",
    missoes: [
      { texto: "Adicionar 50-100 kcal hoje em relação a ontem", sub: "Pequeno aumento semanal — regra do reverse diet" },
      { texto: "Priorizar o aumento em proteína (25g = 100 kcal)", sub: "Proteína tem menor chance de ser armazenada como gordura" },
      { texto: "Monitorar peso diariamente — variação < 500g/dia é normal", sub: "Retenção de água é comum nos primeiros dias" },
    ],
    checkin: ["Entendi o conceito do reverse diet", "Aumentei as calorias hoje", "Sem ganho de peso aparente", "Senti mais energia com mais calorias"],
    ia: {
      "Entendi o conceito do reverse diet": "Reverse diet é contraintuitivo mas é ciência sólida. A paciência e a progressão gradual são o que fazem funcionar.",
      "Aumentei as calorias hoje": "Cada semana de aumento gradual sinaliza para o metabolismo: não há mais escassez. Ele vai responder acelerando.",
      "Sem ganho de peso aparente": "Isso é o sinal de que está no ritmo certo. Continue os aumentos semanais de 50-100 kcal.",
      "Senti mais energia com mais calorias": "Energia aumentada = metabolismo respondendo ao reverse diet. Continue — esse é o caminho.",
    },
    receita_id: 2,
    recompensa: "Reverse diet iniciado 📈",
    xp: 35,
  },
  {
    n: 5, titulo: "NEAT e EPOC: queimando caloria sem perceber",
    video: "O exercício que você faz na academia\nRepresenta apenas 5% do seu gasto calórico total.\n\n95% vem do NEAT e do metabolismo basal.\n\nMas há um bônus do treino que a maioria ignora:\n\nEPOC — Excess Post-exercise Oxygen Consumption.\n\nApós treino de força intenso,\nSeu metabolismo fica elevado por até 38 horas.\n\nNão treinar = perder essas 38h de metabolismo acelerado.",
    explicacao: "O EPOC (ou 'afterburn') é o estado de metabolismo elevado pós-exercício causado pela ressíntese de ATP, restauração de temperatura corporal e reparação muscular. Treino de força intenso gera EPOC maior que cardio. Em conjunto com o NEAT aumentado (mais movimento espontâneo), o gasto calórico total pode ser aumentado em 300-600 kcal/dia sem adição de treino formal.",
    missoes: [
      { texto: "Treino de força intenso hoje (EPOC máximo)", sub: "Séries até a fadiga = maior EPOC pós-treino" },
      { texto: "10.000 passos hoje — NEAT puro", sub: "Sem esforço percebido, gasto calórico alto" },
      { texto: "Ficar em pé por 4h cumulativas hoje", sub: "Ficar em pé vs sentado: 54 kcal/h a mais" },
    ],
    checkin: ["Fiz treino intenso de força", "Atingi 10.000 passos", "Fiquei em pé regularmente", "Percebi mais energia no dia"],
    ia: {
      "Fiz treino intenso de força": "EPOC ativado por 24-38h. Seu metabolismo está elevado agora mesmo enquanto você descansa.",
      "Atingi 10.000 passos": "10.000 passos = ~400-500 kcal de NEAT. Sem treino planejado, sem esforço percebido.",
      "Fiquei em pé regularmente": "Ficar em pé ativa continuamente os músculos posturais — NEAT estável durante horas.",
      "Percebi mais energia no dia": "Mais movimento = mais energia. O corpo é design para se mover — quanto mais se move, mais energia produz.",
    },
    receita_id: 1,
    recompensa: "NEAT e EPOC no máximo ⚡",
    xp: 35,
  },
  {
    n: 6, titulo: "Ciclagem de carboidrato para reativar a leptina",
    video: "Existe um hormônio que comanda todo o seu metabolismo.\n\nLeptina.\n\nEm déficit calórico prolongado — ela cai.\nE quando a leptina cai:\nO metabolismo desacelera.\nA fome aumenta.\nA termogênese cai.\n\nA solução contraintuitiva:\n\nUm dia de mais carboidrato — o 'refeed day' —\nRestabelece a leptina e reacende o metabolismo por 3-5 dias.",
    explicacao: "A leptina é produzida pelo tecido adiposo e sinaliza ao hipotálamo sobre os estoques de energia. Em déficit prolongado, os estoques caem → leptina cai → hipotálamo ativa modo econômico. Um dia de sobrecarga de carboidrato aumenta a leptina em 24-30% por 3-5 dias — janela onde o metabolismo opera em modo normal.",
    missoes: [
      { texto: "Dia de mais carboidrato: +200g de carbs hoje (1x/semana)", sub: "Refeed: arroz, batata, aveia — não açúcar" },
      { texto: "Manter proteína alta mesmo no refeed", sub: "Carboidrato extra não substitui proteína" },
      { texto: "Verificar peso amanhã — pode subir 1-2kg de glicogênio", sub: "Não é gordura — é água ligada ao glicogênio" },
    ],
    checkin: ["Fiz o refeed hoje", "Me senti ótimo com mais carbs", "Peso subiu um pouco (normal)", "Entendi a função da leptina"],
    ia: {
      "Fiz o refeed hoje": "Leptina aumentando. Metabolismo respondendo. Os próximos 3-5 dias vão ser de metabolismo mais eficiente.",
      "Me senti ótimo com mais carbs": "Essa sensação é a leptina e a serotonina subindo — ambas dependem de carboidrato para síntese.",
      "Peso subiu um pouco (normal)": "1-2kg de aumento após refeed = 250-500g de glicogênio (que retém água). Volta ao normal em 48h.",
      "Entendi a função da leptina": "Leptina é o CEO do metabolismo. Quem entende como gerenciá-la tem vantagem real no longo prazo.",
    },
    receita_id: 5,
    recompensa: "Leptina reativada e metabolismo reacendido 🔥",
    xp: 35,
  },
  {
    n: 7, titulo: "Seu novo metabolismo: reconfigurado e otimizado",
    video: "7 dias atrás seu metabolismo estava em modo de sobrevivência.\n\nHoje:\nVocê calculou seu TDEE real.\nVocê iniciou o reverse dieting.\nVocê ativou o EPOC com treino de força.\nVocê fez o refeed para a leptina.\nVocê adicionou termogênicos naturais.\n\nEssas ações criaram um novo set point metabólico.\n\nMais alto.\nMais eficiente.\nMais sustentável.",
    explicacao: "O ajuste metabólico é um processo de semanas a meses — não de dias. Mas os primeiros 7 dias de intervenção correta estabelecem a trajetória. Com reverse dieting contínuo, treino de força e refeeds estratégicos, o TDEE pode ser recuperado em 80-100% do valor pré-dieta em 8-16 semanas.",
    missoes: [
      { texto: "Plano de reverse diet das próximas 8 semanas", sub: "+50 kcal por semana = +400 kcal em 8 semanas" },
      { texto: "Frequência de treino de força: 3x/semana fixo", sub: "Consistência > intensidade para TDEE elevado" },
      { texto: "Refeed 1x/semana como rotina permanente", sub: "Semanal é suficiente para manter leptina estável" },
    ],
    checkin: ["Completei os 7 dias", "Tenho plano para as próximas semanas", "Metabolismo claramente mais ativo", "Entendo como manter o metabolismo alto"],
    ia: {
      "Completei os 7 dias": "7 dias de ajuste metabólico completo. Você fez o trabalho que a maioria desconhece que existe.",
      "Tenho plano para as próximas semanas": "Plano de 8 semanas com incrementos semanais + treino de força + refeeds = metabolismo restaurado.",
      "Metabolismo claramente mais ativo": "Energia, calor, melhor humor e estabilização do peso são os sinais do metabolismo voltando ao normal.",
      "Entendo como manter o metabolismo alto": "Manutenção do metabolismo é habilidade — não sorte. Você aprendeu a engenharia. Continue.",
    },
    receita_id: 3,
    recompensa: "PROTOCOLO METABÓLICO COMPLETO 🏆",
    xp: 100,
  },
];

export default function Protocolo9({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={9}
      emoji="📊"
      nome="Ajuste Metabólico"
      storageKey="glpy_metabolico"
      receitas={RECEITAS}
      dias={DIAS}
      videos={VIDEOS}
      firestoreId="protocolo-9"
      onNavigate={onNavigate}
    />
  );
}
