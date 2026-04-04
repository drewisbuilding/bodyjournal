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
}
