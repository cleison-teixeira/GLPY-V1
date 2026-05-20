// GLPY Protocol Content Registry
// Single source of truth for all protocol metadata in the MVP.
// IDs (legacyId, storagePrefix, firestoreId) are immutable once shipped.

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GLPYProtocolMeta {
  number: number;
  legacyId: string;       // e.g. "sobrevivendoCanetas" — never rename
  slug: string;           // e.g. "sobrevivendo-canetas"
  emoji: string;
  name: string;
  description: string;
  totalDays: number;
  color: string;
  colorLight: string;
  minimumPlan: "starter" | "plus" | "pro" | "top";
  storagePrefix: string;  // e.g. "glpy_sobrevivendo"
  firestoreId: string;    // e.g. "protocolo-1"
  previewRoute: string;   // e.g. "/preview/protocolo1"
  usesCustomRenderer: boolean;
}

export interface GLPYProtocolMission {
  day: number;
  title: string;
  description: string;
}

export interface GLPYProtocolCheckin {
  day: number;
  question: string;
  options: string[];
}

export interface GLPYProtocolRecipeOfDay {
  day: number;
  name: string;
  ingredients: string[];
  instructions: string;
  kcal: number;
  protein: number;
}

export interface GLPYProtocolDayContent {
  day: number;
  title: string;
  subtitle: string;
  content: string;
  mission?: GLPYProtocolMission;
  checkin?: GLPYProtocolCheckin;
  recipe?: GLPYProtocolRecipeOfDay;
}

export interface GLPYProtocolRegistryItem {
  meta: GLPYProtocolMeta;
  days: GLPYProtocolDayContent[]; // populated by getProtocolDayContent()
}

// ── Catalog ───────────────────────────────────────────────────────────────────

export const GLPY_PROTOCOLS_CATALOG: GLPYProtocolMeta[] = [
  {
    number: 1,
    legacyId: "sobrevivendoCanetas",
    slug: "sobrevivendo-canetas",
    emoji: "💉",
    name: "Sobrevivendo às Canetas",
    description: "Adaptação nos primeiros dias — náusea, timing e o que comer",
    totalDays: 7,
    color: "#7660FF",
    colorLight: "#F0EEFF",
    minimumPlan: "starter",
    storagePrefix: "glpy_sobrevivendo",
    firestoreId: "protocolo-1",
    previewRoute: "/preview/protocolo1",
    usesCustomRenderer: false,
  },
  {
    number: 2,
    legacyId: "efeitosColaterais",
    slug: "efeitos-colaterais",
    emoji: "🩺",
    name: "Controle de Efeitos Colaterais",
    description: "Náusea, constipação, fadiga e tontura — soluções práticas",
    totalDays: 7,
    color: "#3B82F6",
    colorLight: "#EFF6FF",
    minimumPlan: "starter",
    storagePrefix: "glpy_efeitos",
    firestoreId: "protocolo-2",
    previewRoute: "/preview/protocolo2",
    usesCustomRenderer: false,
  },
  {
    number: 3,
    legacyId: "antiQuedaCabelo",
    slug: "anti-queda-cabelo",
    emoji: "💇",
    name: "Anti-Queda de Cabelo",
    description: "Zinco, biotina, ferro e telogen effluvium no GLP-1",
    totalDays: 7,
    color: "#EC4899",
    colorLight: "#FDF2F8",
    minimumPlan: "plus",
    storagePrefix: "glpy_cabelo",
    firestoreId: "protocolo-3",
    previewRoute: "/preview/protocolo3",
    usesCustomRenderer: false,
  },
  {
    number: 4,
    legacyId: "antiRebote",
    slug: "anti-rebote",
    emoji: "⚖️",
    name: "Anti-Rebote",
    description: "Trave o efeito rebote em 7 dias com ciência",
    totalDays: 7,
    color: "#00C27A",
    colorLight: "#E6FBF3",
    minimumPlan: "starter",
    storagePrefix: "glpy_antirebote",
    firestoreId: "protocolo-anti-rebote", // users/{id}/protocolos/anti-rebote
    previewRoute: "/preview/protocolo4",
    usesCustomRenderer: true,             // rendered by AntiRebote.tsx, not ProtocoloBase
  },
  {
    number: 5,
    legacyId: "psicologiaEmagrecimento",
    slug: "psicologia-emagrecimento",
    emoji: "🧠",
    name: "Psicologia do Emagrecimento",
    description: "Fome emocional, gatilhos, identidade e sabotagem",
    totalDays: 7,
    color: "#8B5CF6",
    colorLight: "#F5F3FF",
    minimumPlan: "plus",
    storagePrefix: "glpy_psicologia",
    firestoreId: "protocolo-5",
    previewRoute: "/preview/protocolo5",
    usesCustomRenderer: false,
  },
  {
    number: 6,
    legacyId: "alimentacaoBaixoApetite",
    slug: "alimentacao-baixo-apetite",
    emoji: "🥗",
    name: "Alimentação para Baixo Apetite",
    description: "Alta nutrição em porções mínimas — timing e densidade",
    totalDays: 7,
    color: "#10B981",
    colorLight: "#ECFDF5",
    minimumPlan: "plus",
    storagePrefix: "glpy_baixoapetite",
    firestoreId: "protocolo-6",
    previewRoute: "/preview/protocolo6",
    usesCustomRenderer: false,
  },
  {
    number: 7,
    legacyId: "naoPerdaMusculos",
    slug: "nao-perca-musculo",
    emoji: "💪",
    name: "Não Perca Músculo",
    description: "Leucina, síntese proteica e exercício no déficit",
    totalDays: 7,
    color: "#F5A623",
    colorLight: "#FFF8ED",
    minimumPlan: "pro",
    storagePrefix: "glpy_musculos",
    firestoreId: "protocolo-7",
    previewRoute: "/preview/protocolo7",
    usesCustomRenderer: false,
  },
  {
    number: 8,
    legacyId: "energiaBaixa",
    slug: "energia-baixa",
    emoji: "⚡",
    name: "Energia Baixa",
    description: "Ferro, B12, sono, hidratação e tireoide no GLP-1",
    totalDays: 7,
    color: "#EF4444",
    colorLight: "#FEF2F2",
    minimumPlan: "pro",
    storagePrefix: "glpy_energia",
    firestoreId: "protocolo-8",
    previewRoute: "/preview/protocolo8",
    usesCustomRenderer: false,
  },
  {
    number: 9,
    legacyId: "ajusteMetabolico",
    slug: "ajuste-metabolico",
    emoji: "📊",
    name: "Ajuste Metabólico",
    description: "TDEE, termogênese adaptativa e reverse dieting",
    totalDays: 7,
    color: "#F59E0B",
    colorLight: "#FFFBEB",
    minimumPlan: "top",
    storagePrefix: "glpy_metabolico",
    firestoreId: "protocolo-9",
    previewRoute: "/preview/protocolo9",
    usesCustomRenderer: false,
  },
  {
    number: 10,
    legacyId: "transicaoParar",
    slug: "transicao-parar-caneta",
    emoji: "🔄",
    name: "Transição — Parar a Caneta",
    description: "Desmame gradual, manutenção e plano de 90 dias",
    totalDays: 7,
    color: "#06B6D4",
    colorLight: "#ECFEFF",
    minimumPlan: "top",
    storagePrefix: "glpy_transicao",
    firestoreId: "protocolo-10",
    previewRoute: "/preview/protocolo10",
    usesCustomRenderer: false,
  },
];

// ── Accessors ─────────────────────────────────────────────────────────────────

export function getProtocolByLegacyId(legacyId: string): GLPYProtocolMeta | undefined {
  return GLPY_PROTOCOLS_CATALOG.find(p => p.legacyId === legacyId);
}

export function getProtocolByNumber(n: number): GLPYProtocolMeta | undefined {
  return GLPY_PROTOCOLS_CATALOG.find(p => p.number === n);
}

export function getProtocolBySlug(slug: string): GLPYProtocolMeta | undefined {
  return GLPY_PROTOCOLS_CATALOG.find(p => p.slug === slug);
}

export function getAllProtocolsForMVP(): GLPYProtocolMeta[] {
  return GLPY_PROTOCOLS_CATALOG;
}

export function getProtocolStoragePrefix(legacyId: string): string | undefined {
  return getProtocolByLegacyId(legacyId)?.storagePrefix;
}

export function getProtocolPreviewRoute(legacyId: string): string | undefined {
  return getProtocolByLegacyId(legacyId)?.previewRoute;
}

export function isCustomRendererProtocol(legacyId: string): boolean {
  return getProtocolByLegacyId(legacyId)?.usesCustomRenderer ?? false;
}

export function getProtocolRegistryItem(legacyId: string): GLPYProtocolRegistryItem | undefined {
  const meta = getProtocolByLegacyId(legacyId);
  if (!meta) return undefined;
  return { meta, days: [] };
}

export function getLegacyPlanInfo(legacyId: string): { minimumPlan: string; isUnlocked: boolean } | undefined {
  const meta = getProtocolByLegacyId(legacyId);
  if (!meta) return undefined;
  // MVP: all plans unlocked
  return { minimumPlan: meta.minimumPlan, isUnlocked: true };
}

// Stub — day content will be populated by individual protocol data modules.
export function getProtocolDayContent(legacyId: string, day: number): GLPYProtocolDayContent | undefined {
  void legacyId;
  void day;
  return undefined;
}
