// GLPY — Targets Config
// System: Clinical Parameter Configuration
// Authority: docs/glpy-daily-targets-engine-v1.md
//
// Este arquivo é projetado para auditoria clínica e revisão por médicos e
// nutricionistas parceiros. Alterações nas cotas de macronutrientes, BMR,
// águas e disclaimers legais podem ser feitas aqui diretamente sem mexer no
// código principal de cálculo da engine.

export interface GLPYTargetsConfig {
  version: string;
  lastUpdated: string;
  reviewedBy: string[];
  reviewStatus: string;
  complianceNote: string;
  protein: {
    defaultGPerKg: number;
    minGPerKg: number;
    maxGPerKg: number;
    referenceWeightMode: 'current' | 'target';
  };
  water: {
    mlPerKg: number;
    minLiters: number;
    maxLiters: number;
  };
  calories: {
    bmrFormula: 'Mifflin-StJeor';
    deficitByPace: {
      leve: number;        // kcal
      equilibrado: number; // kcal
      intenso: number;     // kcal
    };
    minCaloriesWarning: number; // kcal piso de segurança
  };
  macros: {
    fatPercentDefault: number; // % do total calórico
    carbsMode: 'remainder';
  };
  medicationContext: {
    useDoseForMacroCalculation: boolean;
    doseUsedOnlyForContext: boolean;
    notes: string;
  };
  disclaimers: {
    short: string;
    long: string;
    medical: string;
    nutrition: string;
  };
  sources: {
    title: string;
    description: string;
    citation: string;
  }[];
}

export const GLPY_TARGETS_CONFIG: GLPYTargetsConfig = {
  version: "1.1.0",
  lastUpdated: "2026-05-20",
  reviewedBy: [
    "PENDENTE_DE_REVISAO_PROFISSIONAL"
  ],
  reviewStatus: "MVP_NOT_CLINICALLY_REVIEWED",
  complianceNote: "Os parâmetros desta versão são estimativas operacionais do MVP e ainda não foram revisados formalmente por médico ou nutricionista parceiro. Futuras versões poderão incluir revisão clínica profissional identificada e autorizada.",
  protein: {
    defaultGPerKg: 1.5,
    minGPerKg: 1.2,
    maxGPerKg: 2.2,
    referenceWeightMode: 'current' // 'current' usa peso atual; 'target' usa peso alvo
  },
  water: {
    mlPerKg: 35,
    minLiters: 2.0,
    maxLiters: 5.0
  },
  calories: {
    bmrFormula: 'Mifflin-StJeor',
    deficitByPace: {
      leve: 250,        // Perda suave de peso
      equilibrado: 500, // Perda equilibrada padrão
      intenso: 750      // Perda intensa
    },
    minCaloriesWarning: 1200 // Nível mínimo de proteção para evitar perda muscular extrema
  },
  macros: {
    fatPercentDefault: 25, // 25% de calorias vindas de gorduras saudáveis
    carbsMode: 'remainder'  // Carbos ocupam a sobra calórica após proteína e gordura
  },
  medicationContext: {
    useDoseForMacroCalculation: false, // Dose de GLP-1 não afeta a conta matemática de macros
    doseUsedOnlyForContext: true,      // Serve puramente como sinalizador de contexto clínico/comportamental
    notes: "A dose atualizada do medicamento análogo de GLP-1 (ex: Ozempic, Rybelsus, Victoza, Saxenda, Mounjaro) NÃO altera ou prescreve macros diretamente. Ela modula a taxa de esvaziamento gástrico, saciedade e tolerância alimentar, servindo como contexto comportamental essencial para as sugestões da IA."
  },
  disclaimers: {
    short: "As metas diárias fornecidas pelo GLPY são estimativas calculadas a partir de equações matemáticas e não substituem o acompanhamento médico ou nutricional individualizado.",
    long: "O GLPY fornece estimativas e diretrizes de bem-estar com base em algoritmos nutricionais consolidados internacionalmente. Estes números servem como norteadores de hábitos saudáveis diários e não configuram prescrição médica ou dietoterápica substitutiva. O uso de análogos de GLP-1 exige acompanhamento clínico presencial rigoroso.",
    medical: "Aviso Médico: O GLPY não prescreve, altera ou gerencia doses de medicamentos de qualquer natureza. As diretrizes calóricas e de hidratação são de caráter informativo. Qualquer sintoma colateral severo do tratamento de GLP-1 deve ser reportado imediatamente ao seu médico assistente.",
    nutrition: "Aviso Nutricional: Metas de macronutrientes estimadas pelo método de compensação de proteínas e gorduras diárias. Pacientes bariátricos ou com necessidades renais específicas devem seguir estritamente as diretrizes de seus nutricionistas presenciais."
  },
  sources: [
    {
      title: "Estimativa de Gasto Energético de Repouso (BMR)",
      description: "Equação Mifflin-St Jeor reconhecida amplamente pela literatura como a mais acurada para estimativa em populações modernas com sobrepeso ou obesidade.",
      citation: "Mifflin MD, St Jeor ST, et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247."
    },
    {
      title: "Distribuição Aceitável de Macronutrientes (AMDR)",
      description: "Diretrizes de faixas saudáveis de ingestão de proteínas, carboidratos e gorduras recomendadas pelo Institute of Medicine (IOM).",
      citation: "Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids. Washington, DC: The National Academies Press; 2005."
    },
    {
      title: "Preservação de Massa Magra em Perda de Peso Acelerada",
      description: "Literatura clínica demonstrando a necessidade de ingestão proteica aumentada (1.2 a 2.0g/kg) em restrição calórica associada a terapias que reduzem apetite de forma pronunciada.",
      citation: "Phillips SM, Chevalier S, Leidy HJ. Protein “requirements” beyond the RDA: implications for optimizing health. Appl Physiol Nutr Metab. 2016;41(5):565-572."
    },
    {
      title: "Necessidades de Hidratação em Usuários de GLP-1",
      description: "Observação clínica sobre o alto risco de desidratação secundária à supressão do centro de sede e efeitos adversos gastrointestinais.",
      citation: "Wharton S, et al. Canadian Adult Obesity Clinical Practice Guidelines: Pharmacotherapy for Obesity. Can Assoc Radiol J. 2020."
    }
  ]
};
