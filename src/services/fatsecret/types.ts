// GLPY — FatSecret Service — Types
// BUG 15A: Infraestrutura isolada — sem UI, sem salvar em localStorage
// Criado em: 2026-05-25
// Segurança: nenhuma credencial aqui — credenciais ficam em api/fatsecret-food.ts (server-side)

// ──────────────────────────────────────────────────────────────────────────────
// 1. Payload enviado pelo front-end para o endpoint serverless
// ──────────────────────────────────────────────────────────────────────────────

export type FatSecretMealType = 'cafe' | 'almoco' | 'jantar' | 'lanche';

export type FatSecretMode = 'image' | 'search';

export interface FatSecretRequestPayload {
  /** Modo de análise: imagem base64 ou busca textual */
  mode: FatSecretMode;
  /** Imagem em base64 (sem prefixo data:...) — obrigatório se mode = 'image' */
  imageBase64?: string;
  /** Texto de busca — obrigatório se mode = 'search' */
  query?: string;
  /** Localização para nomes e formatação (default: 'pt-BR') */
  locale?: string;
  /** Tipo de refeição — contextualiza a análise */
  mealType?: FatSecretMealType;
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Tipos nativos da FatSecret Platform API
//    Ref: https://platform.fatsecret.com/api/Default.aspx?screen=rapiref
// ──────────────────────────────────────────────────────────────────────────────

export interface FatSecretServing {
  serving_id:             string;
  serving_description:    string;   // "100g", "1 cup", "1 fatia"
  metric_serving_amount?: string;
  metric_serving_unit?:   string;
  calories:               string;   // string no JSON da API
  protein:                string;
  carbohydrate:           string;
  fat:                    string;
  fiber?:                 string;
  sugar?:                 string;
  sodium?:                string;
  saturated_fat?:         string;
}

export interface FatSecretFood {
  food_id:     string;
  food_name:   string;
  brand_name?: string;              // presente em alimentos de marca
  food_type:   'Generic' | 'Brand';
  food_url:    string;
  servings: {
    /** FatSecret retorna array ou objeto único dependendo da quantidade */
    serving: FatSecretServing | FatSecretServing[];
  };
}

/** Resultado da busca de alimentos (foods.search) */
export interface FatSecretFoodsSearchResult {
  foods: {
    food:         FatSecretFood | FatSecretFood[];
    max_results:  string;
    page_number:  string;
    total_results: string;
  };
}

/** Resultado do reconhecimento por imagem (foods.recognize) — disponível via Premium API */
export interface FatSecretRecognizedFood {
  food_id:   string;
  food_name: string;
  eaten_id?: string;
  /** Confiança do reconhecimento (0.0 – 1.0) */
  score?:    number;
  serving?:  FatSecretServing;
}

export interface FatSecretImageRecognitionResult {
  food_items?: {
    food_item: FatSecretRecognizedFood | FatSecretRecognizedFood[];
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Item padronizado retornado pelo endpoint GLPY (/api/fatsecret-food)
// ──────────────────────────────────────────────────────────────────────────────

export interface FatSecretFoodItem {
  /** Nome do alimento */
  name: string;
  /** Marca (se houver) */
  brand?: string;
  /** Descrição da porção: "100g", "1 fatia" etc. */
  servingDescription?: string;
  /** Calorias da porção */
  calories?: number;
  /** Proteína em gramas */
  protein?: number;
  /** Carboidratos em gramas */
  carbs?: number;
  /** Gordura total em gramas */
  fat?: number;
  /** Fibra em gramas (se disponível) */
  fiber?: number;
  /** Confiança do reconhecimento por imagem (0.0 – 1.0) */
  confidence?: number;
  /** ID externo da FatSecret (para detalhe posterior) */
  externalId?: string;
}

/** Resposta de sucesso do endpoint /api/fatsecret-food */
export interface FatSecretAnalysisResult {
  success: true;
  source: 'fatsecret';
  items: FatSecretFoodItem[];
  totals: {
    calories: number;
    protein:  number;
    carbs:    number;
    fat:      number;
  };
  /** Payload bruto da API para debug/futuro reprocessamento */
  raw?: unknown;
}

/** Resposta de erro do endpoint /api/fatsecret-food */
export interface FatSecretErrorResult {
  success: false;
  error: string;
}

export type FatSecretResult = FatSecretAnalysisResult | FatSecretErrorResult;

// ──────────────────────────────────────────────────────────────────────────────
// 4. Formato normalizado — pronto para ser salvo como MealEntry no futuro
//    Compatible com glpy_refeicoes_hoje (BUG 15B+)
// ──────────────────────────────────────────────────────────────────────────────

export type NormalizedMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NormalizedMealFromPhoto {
  /** Tipo de refeição — compatível com FoodLogScreen.MealEntry */
  mealType:    NormalizedMealType;
  /** Descrição gerada automaticamente (nome dos alimentos) */
  description: string;
  /** Sempre true — veio de uma foto */
  photoAdded:  true;
  /** Timestamp do momento da análise */
  savedAt:     number;
  /** Macros totais (somados de todos os items) */
  calories?:   number;
  protein?:    number;
  carbs?:      number;
  fat?:        number;
  /** Origem — para rastreabilidade e filtros futuros */
  source: 'fatsecret';
  /** Lista completa de alimentos identificados */
  items: FatSecretFoodItem[];
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Mapeamento de tipos de refeição entre os dois sistemas
// ──────────────────────────────────────────────────────────────────────────────

export const MEAL_TYPE_MAP: Record<FatSecretMealType, NormalizedMealType> = {
  cafe:    'breakfast',
  almoco:  'lunch',
  jantar:  'dinner',
  lanche:  'snack',
} as const;
