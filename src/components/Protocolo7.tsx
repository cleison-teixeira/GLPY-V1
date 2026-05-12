import ProtocoloBase, { Receita, Dia } from "./ProtocoloBase";

const VIDEOS: Record<number, string> = {
  1: "https://glpy.b-cdn.net/PROTOCOLO-7-NAO-PERCA-MUSCULO/dia1-nao-perca-musculo.mp4",
  2: "https://glpy.b-cdn.net/PROTOCOLO-7-NAO-PERCA-MUSCULO/dia2-nao-perca-musculo.mp4",
  3: "https://glpy.b-cdn.net/PROTOCOLO-7-NAO-PERCA-MUSCULO/dia3-nao-perca-musculo.mp4",
  4: "https://glpy.b-cdn.net/PROTOCOLO-7-NAO-PERCA-MUSCULO/dia4-nao-perca-musculo.mp4",
  5: "https://glpy.b-cdn.net/PROTOCOLO-7-NAO-PERCA-MUSCULO/dia5-nao-perca-musculo.mp4",
  6: "https://glpy.b-cdn.net/PROTOCOLO-7-NAO-PERCA-MUSCULO/dia6-nao-perca-musculo.mp4",
  7: "https://glpy.b-cdn.net/PROTOCOLO-7-NAO-PERCA-MUSCULO/dia7-nao-perca-musculo.mp4",
};

const RECEITAS: Receita[] = [
  {
    id: 1, emoji: "🥩", nome: "Picanha no Sal com Batata-Doce",
    kcal: 520, proteina: 46, carbs: 36, gordura: 20,
    categoria: "Almoço · Jantar · Pós-treino",
    desc: "A combinação clássica da preservação muscular. Picanha tem leucina, creatina e carnosina — os três compostos mais estudados para síntese proteica muscular.",
    ingredientes: ["200g picanha", "200g batata-doce cozida", "Sal grosso", "Alho e ervas", "Azeite 1 fio"],
    preparo: "Sele a picanha em frigideira bem quente (3 min cada lado). Sirva com batata-doce cozida amassada com azeite.",
    glp1tip: "Carne bovina tem creatina natural (4g por 200g) — o suplemento mais estudado para preservação muscular. Comer carne 3-4x/semana já fornece dose relevante.",
    dias: [1, 3, 5],
  },
  {
    id: 2, emoji: "🐟", nome: "Atum com Arroz Integral e Brócolis",
    kcal: 380, proteina: 40, carbs: 34, gordura: 8,
    categoria: "Almoço",
    desc: "Proteína completa do atum + carboidrato de baixo IG para insulina anabólica + sulforafano do brócolis que potencializa síntese proteica.",
    ingredientes: ["1 lata atum em água (120g)", "100g arroz integral cozido", "150g brócolis no vapor", "Azeite + limão + sal"],
    preparo: "Misture o atum escorrido com arroz. Adicione brócolis ao vapor. Regue com azeite e limão.",
    glp1tip: "O timing importa: coma esta refeição até 2h após o treino. A insulina pós-carboidrato é o sinal anabólico que leva aminoácidos para dentro do músculo.",
    dias: [2, 4, 7],
  },
  {
    id: 3, emoji: "🥚", nome: "Ovos Mexidos com Cottage e Espinafre",
    kcal: 340, proteina: 32, carbs: 6, gordura: 20,
    categoria: "Café da manhã",
    desc: "A refeição com maior concentração de leucina por grama. 3 ovos + 100g cottage entrega 5g de leucina — o limiar exato para ativar a síntese proteica muscular.",
    ingredientes: ["3 ovos inteiros", "100g cottage", "Espinafre 2 punhados", "Azeite 1 fio", "Sal e pimenta"],
    preparo: "Bata os ovos com o cottage. Aqueça azeite, adicione espinafre por 1 min. Adicione os ovos e mexa em fogo baixo até cremoso.",
    glp1tip: "2.5-3g de leucina por refeição é o limiar mínimo para ativar o mTOR — o interruptor master da síntese proteica. Esta receita entrega 5g, bem acima do limiar.",
    dias: [1, 4, 6],
  },
  {
    id: 4, emoji: "🍗", nome: "Frango com Quinoa e Nozes",
    kcal: 450, proteina: 44, carbs: 32, gordura: 16,
    categoria: "Almoço · Pós-treino",
    desc: "Frango fornece todos os aminoácidos essenciais. Quinoa é o único grão com perfil proteico completo. Nozes têm ômega-3 que reduz inflamação pós-treino.",
    ingredientes: ["150g frango grelhado", "100g quinoa cozida", "20g nozes picadas", "Legumes salteados", "Azeite e limão"],
    preparo: "Grelhe o frango temperado. Misture quinoa com legumes salteados. Monte o prato com nozes por cima.",
    glp1tip: "Quinoa tem um score PDCAAS (qualidade proteica) de 1.0 — igual ao ovo. Combinada com frango, você tem redundância de aminoácidos essenciais para máxima síntese.",
    dias: [3, 6],
  },
  {
    id: 5, emoji: "🥤", nome: "Shake Pós-Treino com Leucina",
    kcal: 320, proteina: 34, carbs: 32, gordura: 5,
    categoria: "Pós-treino · Lanches",
    desc: "O shake mais eficiente para síntese proteica. Whey isolado tem a digestão mais rápida entre as proteínas — ideal para a janela anabólica de 30-45 min pós-treino.",
    ingredientes: ["30g whey isolado", "1 banana", "200ml água ou leite desnatado", "3g leucina em pó (opcional)", "Gelo"],
    preparo: "Bata tudo por 20 segundos. Beba em até 45 min após o treino.",
    glp1tip: "Adicionar 3g de leucina isolada ao whey garante que você está sempre acima do limiar de ativação do mTOR — independente da qualidade proteica do whey.",
    dias: [2, 5, 7],
  },
];

const DIAS: Dia[] = [
  {
    n: 1, titulo: "O músculo começa a ser perdido 72h após o déficit calórico",
    video: "Aqui está o que ninguém te conta sobre o GLP-1:\n\nA perda de músculo começa antes de você perceber.\n\n72 horas de déficit calórico sem proteína adequada.\n\nSeu corpo começa a usar aminoácidos musculares como combustível.\n\nE cada kg de músculo perdido:\n— Reduz seu metabolismo basal em 13 kcal/dia permanentemente\n— Torna o rebote mais provável\n— Compromete sua força e mobilidade\n\nO protocolo começa hoje.",
    explicacao: "O catabolismo muscular durante déficit calórico é regulado pelo balanço entre síntese proteica (mTOR pathway) e degradação proteica (ubiquitin-proteasome). Com ingestão proteica adequada (>1.6g/kg/dia) e estímulo mecânico, é possível manter — e até ganhar — massa muscular mesmo em déficit calórico.",
    missoes: [
      { texto: "Proteína de alta qualidade em TODAS as 3 refeições", sub: "Meta: {proteina}g — distribuídos, não de uma vez" },
      { texto: "Exercício de força mínimo — 10 agachamentos agora", sub: "Estímulo mecânico ativa mTOR independente de academia" },
      { texto: "Pesar e registrar — massa muscular precisa de baseline", sub: "Sem medida, sem gestão" },
    ],
    checkin: ["Bati {proteina}g de proteína", "Fiz exercício de força", "Entendi a urgência do músculo", "Sinto que estou perdendo força"],
    ia: {
      "Bati {proteina}g de proteína": "Proteína adequada no Dia 1 já está sinalizando para o corpo: não precisa canibalizar músculo para energia.",
      "Fiz exercício de força": "10 agachamentos ativam o mTOR nos maiores grupos musculares do corpo. Simples, mas poderoso.",
      "Entendi a urgência do músculo": "Urgência correta. Músculo não espera — e você está agindo no momento certo.",
      "Sinto que estou perdendo força": "Fraqueza pode ser déficit de creatina (carne vermelha) ou proteína. Amanhã vamos calcular exatamente o que está faltando.",
    },
    receita_id: 3,
    recompensa: "Defesa muscular iniciada 💪",
    xp: 35,
  },
  {
    n: 2, titulo: "Leucina: o aminoácido que acende o interruptor do músculo",
    video: "De todos os 20 aminoácidos essenciais,\nHá um que comanda a síntese muscular.\n\nLeucina.\n\nEla ativa o mTOR — o interruptor master do crescimento muscular.\n\nSem leucina suficiente — os outros aminoácidos ficam esperando.\n\nCom leucina suficiente — síntese proteica começa em 30 minutos.\n\nMeta de hoje: 2.5-3g de leucina por refeição.",
    explicacao: "A leucina é o único aminoácido com capacidade de ativar diretamente o complexo mTORC1, iniciando a cascata de síntese proteica. O limiar mínimo para essa ativação é 2.5g por refeição. Distribuição ao longo do dia é mais eficiente que uma grande dose única — cada refeição leucina-rica ativa uma nova rodada de síntese.",
    missoes: [
      { texto: "3 fontes ricas em leucina hoje (ovo, frango, whey)", sub: "2.5-3g de leucina por refeição = mTOR ativado" },
      { texto: "Comer proteína a cada 3-4 horas (não jejum longo)", sub: "mTOR precisa de estímulo frequente para máxima síntese" },
      { texto: "Whey ou ovo imediatamente pós-treino", sub: "Leucina + exercício = sinergia máxima de síntese" },
    ],
    checkin: ["Incluí leucina nas 3 refeições", "Tomei whey pós-treino", "Entendi o papel da leucina", "Difícil atingir leucina suficiente"],
    ia: {
      "Incluí leucina nas 3 refeições": "3 ativações do mTOR por dia — máxima síntese proteica diária possível com alimentação.",
      "Tomei whey pós-treino": "Whey isolado tem 11% de leucina — a maior concentração entre proteínas alimentares. Timing perfeito.",
      "Entendi o papel da leucina": "Entender a bioquímica muda o comportamento. Você não está 'comendo proteína' — você está ativando síntese muscular.",
      "Difícil atingir leucina suficiente": "Leucina em pó (disponível em lojas de suplemento) pode ser adicionada a qualquer alimento. 3g = 1 colher de chá.",
    },
    receita_id: 5,
    recompensa: "Leucina e mTOR ativados 🔬",
    xp: 35,
  },
  {
    n: 3, titulo: "Timing de proteína: as janelas que preservam tudo",
    video: "Comer 120g de proteína de uma vez é pior\ndo que comer 30g quatro vezes.\n\nPor quê?\n\nO músculo tem capacidade de absorver ~25-30g de proteína por vez para síntese.\nO excesso vai para energia ou urina — não para músculo.\n\nAs quatro janelas de ouro:\n— Café da manhã: proteína ativa o metabolismo\n— Pré-treino: aminoácidos disponíveis durante o esforço\n— Pós-treino: janela anabólica\n— Pré-sono: síntese proteica noturna",
    explicacao: "A distribuição proteica ao longo do dia (protein distribution hypothesis) foi validada por múltiplos estudos. 4 refeições de 25-30g proteína ativam mais síntese muscular total que 2 refeições de 50-60g. O músculo responde a cada dose acima do limiar leucina — repetição de estímulo é a estratégia vencedora.",
    missoes: [
      { texto: "Dividir a proteína em 4 momentos do dia", sub: "~{proteina}g total ÷ 4 = por refeição" },
      { texto: "Proteína pré-treino (60 min antes)", sub: "Aminoácidos disponíveis no sangue durante o esforço" },
      { texto: "Caseína ou cottage 30 min antes de dormir", sub: "Proteína de digestão lenta = síntese noturna de 7h" },
    ],
    checkin: ["Distribuí proteína em 4 refeições", "Proteína pré-treino feita", "Caseína antes de dormir", "Distribuição melhorou minha energia"],
    ia: {
      "Distribuí proteína em 4 refeições": "4 ativações do mTOR vs 2 = diferença de 20-30% na síntese muscular total. Você escolheu o melhor protocolo.",
      "Proteína pré-treino feita": "Aminoácidos no sangue durante o treino reduzem o catabolismo pós-exercício. Proteína pre-treino é tão importante quanto pós.",
      "Caseína antes de dormir": "Estudo de Res et al. (2012): 40g de caseína antes de dormir aumentou a síntese proteica noturna em 22% em comparação a placebo.",
      "Distribuição melhorou minha energia": "Energia estável ao longo do dia é efeito direto da insulina estável — que a distribuição proteica proporciona.",
    },
    receita_id: 1,
    recompensa: "Timing proteico dominado ⏱️",
    xp: 35,
  },
  {
    n: 4, titulo: "Treino de força mínimo: 20 minutos que preservam tudo",
    video: "A melhor academia do mundo está ao seu redor.\n\nSeu próprio peso.\n\nEstudos mostram que exercícios com o próprio peso,\nFeitos com intensidade adequada,\nPreservam massa muscular tão eficientemente quanto pesos.\n\n20 minutos. 3 exercícios. 3x por semana.\n\nÉ tudo que você precisa para travar a perda muscular.",
    explicacao: "O princípio do mínimo estímulo efetivo (minimum effective dose) do treino de força: volumes baixos mas consistentes preservam músculo durante déficit calórico. 3 séries de 8-12 repetições de exercícios compostos 3x/semana é suficiente para manter síntese proteica muscular elevada.",
    missoes: [
      { texto: "10 agachamentos + 10 flexões + 15 elevações de quadril", sub: "Ativa glúteo, quadríceps, peito e core — máxima eficiência" },
      { texto: "Progressão: adicionar 1 repetição por semana", sub: "Sobrecarga progressiva é o sinal de crescimento muscular" },
      { texto: "Proteína dentro de 45 min após o exercício", sub: "Janela anabólica: absorção muscular de aminoácidos 3x maior" },
    ],
    checkin: ["Fiz o circuito de 20 min", "Senti os músculos trabalhando", "Proteína pós-treino tomada", "Difícil fazer com pouca energia"],
    ia: {
      "Fiz o circuito de 20 min": "20 minutos de exercício composto ativam mais fibras musculares que 1h de cardio. Eficiência máxima.",
      "Senti os músculos trabalhando": "DOMS (dor muscular tardia) nas próximas 24-48h é sinal de síntese proteica ativa. É bom sinal.",
      "Proteína pós-treino tomada": "Janela anabólica aproveitada. O músculo está captando leucina com prioridade máxima agora.",
      "Difícil fazer com pouca energia": "Treino em jejum é catabólico. Sempre coma algo com carboidrato 30-60 min antes: banana, arroz, aveia.",
    },
    receita_id: 4,
    recompensa: "Motor muscular ativado 💪",
    xp: 40,
  },
  {
    n: 5, titulo: "Creatina: o único suplemento com evidência sólida",
    video: "Existem milhares de suplementos vendidos como 'preservadores musculares'.\n\nA maioria não tem evidência.\n\nUm tem.\n\nCreatina monoidratada.\n\n3-5g por dia.\nFunciona em 95% das pessoas.\nSegura. Barata. Estudada há 40 anos.\n\nE a maioria das pessoas no GLP-1 não toma.",
    explicacao: "A creatina atua na ressíntese de ATP (fosfato de creatina) nas células musculares, permitindo mais trabalho muscular por treino. Com mais trabalho, maior estímulo anabólico. Meta-análises mostram 1-2kg a mais de massa magra em 4-12 semanas de suplementação com creatina + treino.",
    missoes: [
      { texto: "Pesquisar sobre creatina monoidratada e consultar médico", sub: "3-5g/dia — a dose validada em estudos" },
      { texto: "Carne vermelha 2x esta semana (creatina natural)", sub: "200g de carne = 1g creatina natural" },
      { texto: "Registrar sua força atual (quantas flexões faz)", sub: "Baseline para medir progresso muscular real" },
    ],
    checkin: ["Tomei creatina hoje", "Comi carne vermelha", "Registrei minha força atual", "Pesquisei sobre creatina"],
    ia: {
      "Tomei creatina hoje": "Creatina tem efeito de saturação — os primeiros 7-14 dias você estará carregando os estoques musculares. Resultados visíveis em 2-4 semanas.",
      "Comi carne vermelha": "Carne vermelha = creatina natural + ferro heme + B12 + zinco. O superalimento mais completo para preservação muscular.",
      "Registrei minha força atual": "Baseline registrado. Em 30 dias, compare. Manutenção de força = manutenção de músculo.",
      "Pesquisei sobre creatina": "A creatina é o suplemento mais estudado da história da nutrição esportiva — 500+ estudos publicados. A evidência é robusta.",
    },
    receita_id: 1,
    recompensa: "Suplementação evidence-based iniciada 🔬",
    xp: 30,
  },
  {
    n: 6, titulo: "NEAT: o movimento invisível que queima tudo",
    video: "Você sabia que o exercício formal representa apenas 5% do gasto calórico diário?\n\n95% vem de:\n— Movimento espontâneo\n— Postura\n— Gesticulação\n— Qualquer atividade não-planejada\n\nIsso se chama NEAT: Non-Exercise Activity Thermogenesis.\n\nE é o fator que mais varia entre pessoas magras e obesas — não o treino.",
    explicacao: "O NEAT pode variar até 2.000 kcal/dia entre indivíduos. Pessoas que 'não conseguem emagrecer' muitas vezes têm NEAT muito baixo. Aumentar o movimento espontâneo — escadas, andar enquanto fala ao telefone, ficar em pé — tem impacto maior no gasto calórico total do que adicionara 1h de treino.",
    missoes: [
      { texto: "10.000 passos hoje — no total do dia", sub: "Não precisa ser caminhada contínua — qualquer passo conta" },
      { texto: "Ficar em pé por 20 min a cada hora sentado", sub: "Alternância sentado/em pé dobra o gasto metabólico" },
      { texto: "Subir escadas em vez de elevador todo o dia", sub: "30 andares de escada = 100 kcal extras" },
    ],
    checkin: ["Atingi 10.000 passos", "Fiquei em pé regularmente", "Evitei o elevador", "Percebi diferença no gasto"],
    ia: {
      "Atingi 10.000 passos": "10.000 passos = 300-500 kcal extras por dia. Sem treino planejado, sem academia — só movimento natural.",
      "Fiquei em pé regularmente": "Ficar em pé em vez de sentado ativa GLUT4 nos músculos das pernas — melhorando sensibilidade à insulina durante o dia.",
      "Evitei o elevador": "Escadas: NEAT puro. Ativa quadríceps e glúteo — os maiores preservadores de massa muscular do corpo.",
      "Percebi diferença no gasto": "NEAT aumentado = mais fome = mais espaço para comer = mais proteína disponível para músculo. O ciclo virtuoso.",
    },
    receita_id: 2,
    recompensa: "NEAT ativado — metabolismo no máximo ⚡",
    xp: 30,
  },
  {
    n: 7, titulo: "Como medir músculo vs gordura — e comemorar o certo",
    video: "A balança mente.\n\nEla mostra peso total — não composição.\n\nVocê pode ganhar 1kg de músculo e perder 1kg de gordura.\nA balança mostra: zero mudança.\n\nMas seu corpo mudou completamente.\n\nO que medir:\n— Circunferência de cintura e braço\n— Número de flexões que consegue\n— Como a roupa fica\n— Foto de evolução\n\nEsses são os marcadores reais do sucesso muscular.",
    explicacao: "A composição corporal (relação músculo/gordura) é o marcador mais relevante para saúde metabólica, não o peso total. Durante o GLP-1, é comum perder gordura e manter ou ganhar músculo — o que não altera muito o peso mas transforma radicalmente o corpo e o metabolismo.",
    missoes: [
      { texto: "Tirar medidas: cintura, quadril, braço", sub: "Esses números contam a história real" },
      { texto: "Contar quantas flexões faz hoje", sub: "Força é o proxy mais confiável de massa muscular" },
      { texto: "Foto de evolução — comparar com a do Dia 1", sub: "Evidência visual que a balança não mostra" },
    ],
    checkin: ["Completei os 7 dias", "Medidas mostram progresso real", "Força aumentou ou manteve", "Entendo que músculo > peso"],
    ia: {
      "Completei os 7 dias": "7 dias de protocolo muscular completo. Você criou a base que vai sustentar seus resultados no GLP-1.",
      "Medidas mostram progresso real": "Centímetros de cintura perdidos com braço mantido = gordura saiu e músculo ficou. Isso é o resultado ideal.",
      "Força aumentou ou manteve": "Força mantida = músculo mantido. Você provou que déficit calórico com GLP-1 não precisa custar massa muscular.",
      "Entendo que músculo > peso": "Essa mudança de perspectiva vale mais que qualquer número na balança. Continue medindo o que importa.",
    },
    receita_id: 3,
    recompensa: "PROTOCOLO MUSCULAR COMPLETO 🏆",
    xp: 100,
  },
];

export default function Protocolo7({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <ProtocoloBase
      n={7}
      emoji="💪"
      nome="Não Perca Músculo"
      storageKey="glpy_musculos"
      receitas={RECEITAS}
      dias={DIAS}
      videos={VIDEOS}
      firestoreId="protocolo-7"
      onNavigate={onNavigate}
    />
  );
}
