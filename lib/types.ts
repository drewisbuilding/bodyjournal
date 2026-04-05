export type WorkActivity = 'sedentary' | 'light' | 'active' | 'very_active'

export type BehaviorEventName =
  | 'page_viewed'
  | 'check_in_started'
  | 'check_in_completed'
  | 'field_filled'
  | 'field_skipped'

export type Profile = {
  id: string
  created_at: string
  age: number | null
  height_inches: number | null
  weight_lbs: number | null
  goal: string | null
  gym_access_default: boolean
  work_activity: WorkActivity | null
  equipment_home: string[] | null
  pain_notes: string | null
  onboarding_completed_at: string | null
  current_rotation_day: string
}

export type CheckIn = {
  id: string
  user_id: string
  created_at: string
  date: string
  gym_today: boolean
  energy_level: number | null
  pain_level: number | null
  pain_location: string | null
  time_available_minutes: number | null
  body_weight_lbs: number | null
  meals_so_far: string | null
  extra_notes: string | null
  // Stage 3 additions
  time_of_day: string | null
  protein_so_far_g: number | null
  calories_so_far: number | null
  symptoms_today: string | null
}

export type BehaviorEvent = {
  id: string
  user_id: string
  created_at: string
  event_name: BehaviorEventName
  metadata: Record<string, unknown> | null
}

export type NutritionTargets = {
  calories: number
  proteinGrams: number
}

export type Plan = {
  id: string
  user_id: string
  check_in_id: string
  created_at: string
  rotation_day: string
  today_focus: string | null
  mobility: string[] | null
  workout_gym: string[] | null
  workout_home: string[] | null
  nutrition_targets: NutritionTargets | null
  food_guidance: string[] | null
  coaching_notes: string[] | null
  raw_ai_response: Record<string, unknown> | null
  // Stage 3 additions
  fuel_status: string | null
  training_readiness: string | null
  nutrition_gap: string | null
  reasoning_summary: string | null
  what_to_eat_next: string[] | null
  adjustment_notes: string[] | null
}

export type FuelStatus = 'ready' | 'slightly_underfueled' | 'significantly_underfueled' | 'recovery_only'
export type TrainingReadiness = 'full' | 'reduced' | 'eat_first' | 'recovery_only'
export type NutritionGap = 'on_track' | 'behind' | 'far_behind'

export type ReadinessResult = {
  fuelStatus: FuelStatus
  trainingReadiness: TrainingReadiness
  nutritionGap: NutritionGap
  reasoningSummary: string
  whatToEatNext: string[]
  adjustmentNotes: string[]
}

// Stage 4: nutrition analysis
export type MealMode = 'what_i_ate' | 'plan_to_eat' | 'pre_workout' | 'post_workout'

export type NutritionStatus = 'on_track' | 'behind' | 'far_behind'

export type NutritionConfidence = 'low' | 'medium' | 'high'

export type NutritionAction = 'train_now' | 'eat_then_train' | 'light_only' | 'recovery_only' | 'general'

export type PrePostWorkout =
  | 'good_preworkout'
  | 'too_light_preworkout'
  | 'good_postworkout'
  | 'needs_more_protein'
  | 'needs_more_carbs'
  | 'needs_more_food'
  | 'general'

export type NutritionAnalysisResult = {
  estimatedCalories: number
  estimatedProteinG: number
  estimatedCarbsG: number
  estimatedFatsG: number
  confidence: NutritionConfidence
  status: NutritionStatus
  action: NutritionAction
  recommendationSummary: string
  whatToEatNext: string[]
  prePostWorkout: PrePostWorkout
}

export type DirectionSignal = 'improved' | 'minimal_impact' | 'no_meaningful_change'

export type DailyNutritionSummary = {
  // Post-meal totals — includes both meal_checks and check-in baseline where available
  todayCaloriesSoFar: number
  todayProteinSoFar:  number
  todayCarbsSoFar:    number
  todayFatsSoFar:     number
  // Targets
  dailyCalorieTarget: number
  dailyProteinTarget: number
  // Daily status (deterministic, time-adjusted)
  dailyStatus:     NutritionStatus
  progressSummary: string
  stillNeededNext: string[]
  // Delta: what this meal added
  deltaCalories: number
  deltaProtein:  number
  directionSignal: DirectionSignal
  // Metadata
  mealCount:       number
  includedCheckIn: boolean  // true if check-in values raised the baseline
}

// Stage 6: information architecture
export type HistoryCategory = 'full_training' | 'reduced' | 'recovery'

export type HistoryItem = {
  planId: string
  date: string           // derived from plan.created_at
  title: string          // today_focus or "Day {rotation_day}"
  rotationDay: string
  fuelStatus: string | null
  trainingReadiness: string | null
  reasoningSummary: string | null
  category: HistoryCategory
}

export type MealCheck = {
  id: string
  user_id: string
  created_at: string
  date: string
  meal_context: MealMode | null
  input_text: string
  estimated_calories: number | null
  estimated_protein_g: number | null
  estimated_carbs_g: number | null
  estimated_fats_g: number | null
  confidence: NutritionConfidence | null
  status: NutritionStatus | null
  action: NutritionAction | null
  recommendation_summary: string | null
  what_to_eat_next: string[] | null
  pre_post_workout: PrePostWorkout | null
  raw_ai_response: Record<string, unknown> | null
}
