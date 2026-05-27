// GLPY — Catálogo Oficial de Eventos Comportamentais
// Sprint 17A: Black Box local — registra, cataloga e padroniza todos os eventos.
// Regra: não salvar texto livre sensível, conversa IA, imagem/base64.

// ── Categorias ───────────────────────────────────────────────────────────────

export const CATEGORIES = {
  NUTRITION:    'nutrition',
  HYDRATION:    'hydration',
  ACTIVITY:     'activity',
  SLEEP:        'sleep',
  EMOTION:      'emotion',
  FEAR:         'fear',
  SYMPTOM:      'symptom',
  SIDE_EFFECTS: 'side_effects',
  TREATMENT:    'treatment',
  INJECTION:    'injection',
  PROTOCOL:     'protocol',
  MISSION:      'mission',
  CHECKIN:      'checkin',
  AI:           'ai',
  PHOTO:        'photo',
  PROGRESS:     'progress',
  BODY_CHANGE:  'body_change',
  GAMIFICATION: 'gamification',
  COMMERCE:     'commerce',
  SUPPLEMENT:   'supplement',
  NAVIGATION:   'navigation',
} as const;

// ── Domínios ─────────────────────────────────────────────────────────────────

export const DOMAINS = {
  METABOLISM:     'metabolism',
  PSYCHOLOGY:     'psychology',
  TREATMENT:      'treatment',
  NUTRITION:      'nutrition',
  MOVEMENT:       'movement',
  SLEEP_RECOVERY: 'sleep_recovery',
  BODY_CHANGES:   'body_changes',
  PROGRESS:       'progress',
  ADHERENCE:      'adherence',
  COMMERCE:       'commerce',
  AI_CONTEXT:     'ai_context',
} as const;

// ── Sinais interpretáveis ────────────────────────────────────────────────────

export const SIGNALS = {
  // Nutrition
  MEAL_LOGGED:                   'meal_logged',
  LOW_PROTEIN:                   'low_protein',
  PROTEIN_GOAL_HIT:              'protein_goal_hit',
  LOW_CALORIE_DAY:               'low_calorie_day',
  APPETITE_LOW:                  'appetite_low',
  APPETITE_HIGH:                 'appetite_high',
  SKIPPED_MEAL:                  'skipped_meal',
  // Hydration
  WATER_LOGGED:                  'water_logged',
  WATER_GOAL_HIT:                'water_goal_hit',
  DEHYDRATION_RISK:              'dehydration_risk',
  // Activity
  ACTIVITY_LOGGED:               'activity_logged',
  WALKING_COMPLETED:             'walking_completed',
  STRENGTH_TRAINING_COMPLETED:   'strength_training_completed',
  SEDENTARY_DAY:                 'sedentary_day',
  // Sleep
  SLEEP_LOGGED:                  'sleep_logged',
  POOR_SLEEP:                    'poor_sleep',
  GOOD_SLEEP:                    'good_sleep',
  INSOMNIA:                      'insomnia',
  FATIGUE_AFTER_POOR_SLEEP:      'fatigue_after_poor_sleep',
  // Emotion
  EMOTION_LOGGED:                'emotion_logged',
  ANXIETY:                       'anxiety',
  SADNESS:                       'sadness',
  CONFIDENCE:                    'confidence',
  GUILT:                         'guilt',
  MOTIVATION:                    'motivation',
  FRUSTRATION:                   'frustration',
  CALM:                          'calm',
  FATIGUE_EMOTION:               'fatigue',
  // Fear
  FEAR_REPORTED:                 'fear_reported',
  FEAR_OF_REBOUND:               'fear_of_rebound',
  FEAR_OF_HAIR_LOSS:             'fear_of_hair_loss',
  FEAR_OF_MUSCLE_LOSS:           'fear_of_muscle_loss',
  FEAR_OF_SIDE_EFFECTS:          'fear_of_side_effects',
  FEAR_OF_STOPPING_MEDICATION:   'fear_of_stopping_medication',
  FEAR_OF_FAILURE:               'fear_of_failure',
  // Symptoms / Side Effects
  NAUSEA:                        'nausea',
  CONSTIPATION:                  'constipation',
  DIARRHEA:                      'diarrhea',
  HEADACHE:                      'headache',
  FATIGUE:                       'fatigue',
  DIZZINESS:                     'dizziness',
  REFLUX:                        'reflux',
  LOW_ENERGY:                    'low_energy',
  HAIR_LOSS:                     'hair_loss',
  APPETITE_SUPPRESSED:           'appetite_suppressed',
  MUSCLE_LOSS_RISK:              'muscle_loss_risk',
  // Craving
  CRAVING_REPORTED:              'craving_reported',
  SWEET_CRAVING:                 'sweet_craving',
  SUGAR_CRAVING:                 'sugar_craving',
  HUNGER_CRAVING:                'hunger_craving',
  // Mission sync
  MISSION_SYNCED_TO_MEAL:        'mission_synced_to_meal',
  MISSION_SYNCED_TO_WATER:       'mission_synced_to_water',
  MISSION_SYNCED_TO_ACTIVITY:    'mission_synced_to_activity',
  MISSION_WITHOUT_REAL_RECORD:   'mission_without_real_record',
  // Treatment / Injection
  MEDICATION_UPDATED:            'medication_updated',
  DOSE_UPDATED:                  'dose_updated',
  FREQUENCY_UPDATED:             'frequency_updated',
  INJECTION_LOGGED:              'injection_logged',
  INJECTION_MISSED:              'injection_missed',
  SIDE_EFFECT_AFTER_INJECTION:   'side_effect_after_injection',
  // Protocol / Mission
  PROTOCOL_STARTED:              'protocol_started',
  PROTOCOL_DAY_OPENED:           'protocol_day_opened',
  PROTOCOL_DAY_COMPLETED:        'protocol_day_completed',
  MISSION_COMPLETED:             'mission_completed',
  MISSION_UNCHECKED:             'mission_unchecked',
  NUTRITION_MISSION_COMPLETED:   'nutrition_mission_completed',
  HYDRATION_MISSION_COMPLETED:   'hydration_mission_completed',
  ACTIVITY_MISSION_COMPLETED:    'activity_mission_completed',
  EMOTIONAL_MISSION_COMPLETED:   'emotional_mission_completed',
  SLEEP_MISSION_COMPLETED:       'sleep_mission_completed',
  TREATMENT_MISSION_COMPLETED:   'treatment_mission_completed',
  // Check-in
  CHECKIN_STARTED:               'checkin_started',
  CHECKIN_COMPLETED:             'checkin_completed',
  CHECKIN_SKIPPED:               'checkin_skipped',
  DAILY_SUMMARY_GENERATED:       'daily_summary_generated',
  // AI
  AI_MESSAGE_SENT:               'ai_message_sent',
  AI_RESPONSE_RECEIVED:          'ai_response_received',
  AI_LIMIT_REACHED:              'ai_limit_reached',
  AI_CONTEXT_GENERATED:          'ai_context_generated',
  // Photo
  FOOD_PHOTO_ANALYZED:           'food_photo_analyzed',
  FOOD_PHOTO_CONFIRMED:          'food_photo_confirmed',
  BODY_PHOTO_ADDED:              'body_photo_added',
  // Progress
  WEIGHT_UPDATED:                'weight_updated',
  MEASUREMENTS_UPDATED:          'measurements_updated',
  PROGRESS_VIEWED:               'progress_viewed',
  RESULT_SHARED:                 'result_shared',
  // Body Change
  HAIR_LOSS_REPORTED:            'hair_loss_reported',
  MUSCLE_LOSS_RISK_REPORTED:     'muscle_loss_risk_reported',
  CLOTHES_LOOSER_REPORTED:       'clothes_looser_reported',
  BODY_CONFIDENCE_IMPROVED:      'body_confidence_improved',
  // Gamification
  XP_ADDED:                      'xp_added',
  STREAK_UPDATED:                'streak_updated',
  LEVEL_UPDATED:                 'level_updated',
  // Commerce / Supplement
  STORE_OPENED:                  'store_opened',
  SUPPLEMENT_VIEWED:             'supplement_viewed',
  SUPPLEMENT_RECOMMENDED:        'supplement_recommended',
  SUPPLEMENT_INTEREST_CLICKED:   'supplement_interest_clicked',
  CHECKOUT_STARTED:              'checkout_started',
  PURCHASE_COMPLETED:            'purchase_completed',
} as const;

// ── Tipos de evento ──────────────────────────────────────────────────────────
// (EVENT_TYPES must be kept in sync with SIGNALS above)

export const EVENT_TYPES = {
  MEAL_SAVED:              'meal_saved',
  FOOD_PHOTO_ANALYZED:     'food_photo_analyzed',
  FOOD_PHOTO_CONFIRMED:    'food_photo_confirmed',
  WATER_UPDATED:           'water_updated',
  ACTIVITY_SAVED:          'activity_saved',
  CHECKIN_COMPLETED:       'checkin_completed',
  EMOTION_LOGGED:          'emotion_logged',
  FEAR_REPORTED:           'fear_reported',
  SLEEP_LOGGED:            'sleep_logged',
  HAIR_LOSS_REPORTED:      'hair_loss_reported',
  SIDE_EFFECT_LOGGED:      'side_effect_logged',
  TREATMENT_UPDATED:       'treatment_updated',
  INJECTION_LOGGED:        'injection_logged',
  WEIGHT_UPDATED:          'weight_updated',
  BODY_PHOTO_ADDED:        'body_photo_added',
  PROTOCOL_STARTED:        'protocol_started',
  PROTOCOL_DAY_OPENED:     'protocol_day_opened',
  PROTOCOL_DAY_COMPLETED:  'protocol_day_completed',
  MISSION_COMPLETED:       'mission_completed',
  MISSION_UNCHECKED:       'mission_unchecked',
  AI_MESSAGE_SENT:         'ai_message_sent',
  AI_RESPONSE_RECEIVED:    'ai_response_received',
  AI_LIMIT_REACHED:        'ai_limit_reached',
  XP_ADDED:                    'xp_added',
  STREAK_UPDATED:              'streak_updated',
  LEVEL_UPDATED:               'level_updated',
  CRAVING_REPORTED:            'craving_reported',
  MISSION_SYNCED_TO_MEAL:      'mission_synced_to_meal',
  MISSION_SYNCED_TO_WATER:     'mission_synced_to_water',
  MISSION_SYNCED_TO_ACTIVITY:  'mission_synced_to_activity',
  MISSION_WITHOUT_REAL_RECORD: 'mission_without_real_record',
} as const;

// ── Mapeamento de humor → sinal ───────────────────────────────────────────────
// Cobre os valores de MOOD_OPTIONS em EmotionScreen.tsx

export const MOOD_TO_SIGNAL: Record<string, string> = {
  'Bem':          SIGNALS.MOTIVATION,
  'Calma':        SIGNALS.CALM,
  'Ansiosa':      SIGNALS.ANXIETY,
  'Cansada':      SIGNALS.FATIGUE,
  'Irritada':     SIGNALS.FRUSTRATION,
  'Triste':       SIGNALS.SADNESS,
  'Confiante':    SIGNALS.CONFIDENCE,
  'Desmotivada':  SIGNALS.FRUSTRATION,
};

// ── Tipos de missão (para glpyMissionBridge) ─────────────────────────────────

export const MISSION_TYPES = {
  NUTRITION_BEHAVIOR:  'nutrition_behavior',
  MEAL_LOG_REQUIRED:   'meal_log_required',
  HYDRATION:           'hydration',
  ACTIVITY:            'activity',
  SLEEP:               'sleep',
  EMOTION:             'emotion',
  FEAR_REFLECTION:     'fear_reflection',
  TREATMENT:           'treatment',
  INJECTION:           'injection',
  SYMPTOM_TRACKING:    'symptom_tracking',
  PROGRESS:            'progress',
  BODY_PHOTO:          'body_photo',
  CHECKIN:             'checkin',
} as const;

// ── Sinal de missão → signal da Black Box ────────────────────────────────────

export const MISSION_TYPE_TO_SIGNAL: Record<string, string> = {
  [MISSION_TYPES.NUTRITION_BEHAVIOR]: SIGNALS.NUTRITION_MISSION_COMPLETED,
  [MISSION_TYPES.MEAL_LOG_REQUIRED]:  SIGNALS.NUTRITION_MISSION_COMPLETED,
  [MISSION_TYPES.HYDRATION]:          SIGNALS.HYDRATION_MISSION_COMPLETED,
  [MISSION_TYPES.ACTIVITY]:           SIGNALS.ACTIVITY_MISSION_COMPLETED,
  [MISSION_TYPES.SLEEP]:              SIGNALS.SLEEP_MISSION_COMPLETED,
  [MISSION_TYPES.EMOTION]:            SIGNALS.EMOTIONAL_MISSION_COMPLETED,
  [MISSION_TYPES.FEAR_REFLECTION]:    SIGNALS.EMOTIONAL_MISSION_COMPLETED,
  [MISSION_TYPES.TREATMENT]:          SIGNALS.TREATMENT_MISSION_COMPLETED,
  [MISSION_TYPES.INJECTION]:          SIGNALS.TREATMENT_MISSION_COMPLETED,
  [MISSION_TYPES.SYMPTOM_TRACKING]:   SIGNALS.TREATMENT_MISSION_COMPLETED,
  [MISSION_TYPES.PROGRESS]:           SIGNALS.MISSION_COMPLETED,
  [MISSION_TYPES.BODY_PHOTO]:         SIGNALS.MISSION_COMPLETED,
  [MISSION_TYPES.CHECKIN]:            SIGNALS.MISSION_COMPLETED,
};
