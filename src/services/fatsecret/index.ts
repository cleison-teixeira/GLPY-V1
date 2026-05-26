// GLPY — FatSecret Service — Barrel Export
// BUG 15A: Ponto de entrada único para o service
//
// Uso correto nos componentes futuros:
//   import { analyzeFoodWithFatSecret } from '../services/fatsecret';
//   import type { FatSecretResult, NormalizedMealFromPhoto } from '../services/fatsecret';

// Tipos
export type {
  // Payload para o endpoint
  FatSecretRequestPayload,
  FatSecretMode,
  FatSecretMealType,

  // Tipos nativos FatSecret API
  FatSecretServing,
  FatSecretFood,
  FatSecretFoodsSearchResult,
  FatSecretRecognizedFood,
  FatSecretImageRecognitionResult,

  // Tipos padronizados GLPY
  FatSecretFoodItem,
  FatSecretAnalysisResult,
  FatSecretErrorResult,
  FatSecretResult,

  // Formato normalizado → compatível com MealEntry
  NormalizedMealType,
  NormalizedMealFromPhoto,
} from './types';

export { MEAL_TYPE_MAP } from './types';

// Client (front-end → endpoint serverless)
export {
  analyzeFoodWithFatSecret,
  analyzePhotoAndNormalize,
  searchFoodAndNormalize,
} from './fatsecretClient';

// Normalizers (transformação de dados — sem persistência)
export {
  normalizeServing,
  sumNutritionTotals,
  buildMealDescription,
  toNormalizedMealType,
  normalizeFatSecretResult,
  ensureArray,
  selectDefaultServing,
} from './normalizeFatSecret';
