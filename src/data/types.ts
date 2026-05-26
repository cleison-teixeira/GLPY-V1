// GLPY — Tipos canônicos do domínio
// BUG 16A: camada de dados centralizada — apenas definições, sem migração de telas.
//
// Regra: não alterar telas existentes neste bug.
// Regra: manter compatibilidade com dados já salvos no localStorage.

// ── Perfil ────────────────────────────────────────────────────────────────────

export interface GlpyProfile {
  uid?:           string;
  name?:          string;
  email?:         string;
  height?:        number;
  currentWeight?: number;
  goalWeight?:    number;
  medication?:    string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onboarding?:    any;
  updatedAt?:     string;
}

export interface GlpyProfilePhoto {
  imageBase64: string;
  updatedAt:   string;
}

// ── Refeição ─────────────────────────────────────────────────────────────────

export interface GlpyMeal {
  id:          string;
  nome:        string;
  descricao?:  string;
  tipo?:       'manual' | 'foto_ia';
  origem?:     string;
  calories:    number;
  protein:     number;
  carbs:       number;
  fat:         number;
  createdAt:   string;
  date:        string;
  savedAt?:    number;
  // campos extras de análise por foto (FatSecret, Gemini, DeepSeek)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// ── Água ─────────────────────────────────────────────────────────────────────

export interface GlpyWater {
  amount:    number;
  date:      string;
  updatedAt: string;
}

// ── Emoção ────────────────────────────────────────────────────────────────────

export interface GlpyEmotion {
  mood?:            string;
  energy?:          number;
  note?:            string;
  date?:            string;
  savedAt?:         number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// ── Atividade ────────────────────────────────────────────────────────────────

export interface GlpyActivity {
  type?:      string;
  duration?:  number;
  intensity?: string;
  date?:      string;
  savedAt?:   number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// ── Check-in ─────────────────────────────────────────────────────────────────

export interface GlpyCheckIn {
  date:     string;
  savedAt?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// ── Medidas corporais ────────────────────────────────────────────────────────

export interface GlpyBodyMeasurements {
  waist?:       number;
  hip?:         number;
  abdomen?:     number;
  chest?:       number;
  arm?:         number;
  thigh?:       number;
  calf?:        number;
  savedAt?:     number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// ── Tratamento ───────────────────────────────────────────────────────────────

export interface GlpyTreatment {
  medication?:   string;
  startDate?:    string;
  currentDose?:  string;
  nextDose?:     string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// ── Uso de IA ────────────────────────────────────────────────────────────────

export interface GlpyAIUsage {
  used:       number;
  limit:      number;
  month?:     string;
  updatedAt?: string;
}

// ── Black Box Comportamental ─────────────────────────────────────────────────

export interface GlpyBlackBoxEvent {
  id:         string;
  type:       string;
  category:   string;
  domain:     string;
  signal?:    string;
  screen?:    string;
  source?:    string;
  date:       string;       // YYYY-MM-DD
  timestamp:  string;       // ISO datetime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?:   Record<string, any>;
}

// ── Protocolo ativo ──────────────────────────────────────────────────────────

export interface GlpyActiveProtocol {
  id?:         string;
  name?:       string;
  startDate?:  string;
  totalDays?:  number;
  currentDay?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
