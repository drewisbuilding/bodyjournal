'use server'

import { createClient } from '@/lib/supabase/server'
import { analyzeMeal, computeDailyStatus, computeDirectionSignal, buildProgressSummary, buildStillNeeded } from '@/lib/ai/analyze-meal'
import type { MealMode, NutritionAnalysisResult, DailyNutritionSummary } from '@/lib/types'
import type { NutritionPayloadContext } from '@/lib/ai/nutrition-prompt'

const DAILY_CALORIE_TARGET = 2300
const DAILY_PROTEIN_TARGET = 170

export type AnalyzeMealActionResult =
  | { ok: true;  data: NutritionAnalysisResult; summary: DailyNutritionSummary | null }
  | { ok: false; error: string }

function currentTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'morning'
  if (hour < 13) return 'midday'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

/**
 * Server action:
 *   1. Auth
 *   2. Load today's check-in for context + baseline nutrition
 *   3. AI meal analysis
 *   4. Insert into meal_checks
 *   5. Aggregate today's meal_checks totals (post-insert, no double-count)
 *   6. Merge check-in baseline + meal_checks totals → single running total
 *   7. Compute delta, direction, daily status, progress messaging
 *   8. Return both meal analysis and daily summary
 *
 * Failure isolation:
 *   - AI failure → return error (meal not saved)
 *   - Insert failure → still return meal analysis, summary: null
 *   - Aggregation failure → still return meal analysis, summary: null
 */
export async function analyzeMealAction(
  mode: MealMode,
  inputText: string
): Promise<AnalyzeMealActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0]

  // Load today's check-in — provides both AI context and the calorie/protein baseline
  // that the user entered manually. This baseline is distinct from meal_checks rows.
  const { data: checkIn } = await supabase
    .from('check_ins')
    .select('time_of_day, protein_so_far_g, calories_so_far, meals_so_far')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const timeOfDay = checkIn?.time_of_day ?? currentTimeOfDay()

  const context: NutritionPayloadContext = {
    timeOfDay,
    mealsSoFar:    checkIn?.meals_so_far    ?? null,
    proteinSoFarG: checkIn?.protein_so_far_g ?? null,
    caloriesSoFar: checkIn?.calories_so_far  ?? null,
  }

  // ── AI analysis (pure, no DB) ─────────────────────────────────────────────
  const result = await analyzeMeal(mode, inputText, context)
  if (!result.ok) return { ok: false, error: result.error }

  const { data } = result

  // ── Insert meal_checks row ────────────────────────────────────────────────
  const { error: insertError } = await supabase.from('meal_checks').insert({
    user_id:                user.id,
    meal_context:           mode,
    input_text:             inputText,
    estimated_calories:     data.estimatedCalories,
    estimated_protein_g:    data.estimatedProteinG,
    estimated_carbs_g:      data.estimatedCarbsG,
    estimated_fats_g:       data.estimatedFatsG,
    confidence:             data.confidence,
    status:                 data.status,
    action:                 data.action,
    recommendation_summary: data.recommendationSummary,
    what_to_eat_next:       data.whatToEatNext,
    pre_post_workout:       data.prePostWorkout,
    raw_ai_response:        result.rawResponse ? { text: result.rawResponse } : null,
  })

  // Insert failed — return meal analysis only, no summary
  if (insertError) {
    return { ok: true, data, summary: null }
  }

  // ── Aggregate today's meal_checks (post-insert — includes current row) ────
  const { data: agg, error: aggError } = await supabase
    .from('meal_checks')
    .select('estimated_calories, estimated_protein_g, estimated_carbs_g, estimated_fats_g')
    .eq('user_id', user.id)
    .eq('date', today)

  if (aggError || !agg) {
    return { ok: true, data, summary: null }
  }

  // Sum across all meal_checks rows for today
  let mealCalories = 0, mealProtein = 0, mealCarbs = 0, mealFats = 0
  for (const row of agg) {
    mealCalories += row.estimated_calories ?? 0
    mealProtein  += row.estimated_protein_g ?? 0
    mealCarbs    += row.estimated_carbs_g ?? 0
    mealFats     += row.estimated_fats_g ?? 0
  }

  // ── Merge check-in baseline ───────────────────────────────────────────────
  // The check-in baseline (calories_so_far, protein_so_far_g) represents foods the
  // user manually entered during check-in — separate from anything in meal_checks.
  // Add it once to the running total; never included in the meal_checks aggregation.
  const checkInCalories = checkIn?.calories_so_far  ?? 0
  const checkInProtein  = checkIn?.protein_so_far_g ?? 0
  const includedCheckIn = checkInCalories > 0 || checkInProtein > 0

  const totalCalories = mealCalories + checkInCalories
  const totalProtein  = mealProtein  + checkInProtein
  const totalCarbs    = mealCarbs    // carbs/fats not tracked in check-in
  const totalFats     = mealFats

  // ── Pre-meal totals for delta calculation ─────────────────────────────────
  // What the total was before this meal was added = total minus current meal
  const preCalories = totalCalories - data.estimatedCalories
  const preProtein  = totalProtein  - data.estimatedProteinG
  const deltaCalories = data.estimatedCalories
  const deltaProtein  = data.estimatedProteinG

  // Only signal direction if pre-meal totals were > 0 (i.e., there was something to compare to)
  const directionSignal = (preCalories > 0 || preProtein > 0)
    ? computeDirectionSignal(deltaCalories, deltaProtein)
    : 'improved' // first meal of the day always counts as improvement

  // ── Daily status + messaging ──────────────────────────────────────────────
  const dailyStatus   = computeDailyStatus(totalCalories, totalProtein, timeOfDay)
  const mealCount     = agg.length
  const progressSummary = buildProgressSummary(dailyStatus, timeOfDay, mealCount)
  const stillNeededNext = buildStillNeeded(totalCalories, totalProtein, dailyStatus)

  const summary: DailyNutritionSummary = {
    todayCaloriesSoFar:  totalCalories,
    todayProteinSoFar:   totalProtein,
    todayCarbsSoFar:     totalCarbs,
    todayFatsSoFar:      totalFats,
    dailyCalorieTarget:  DAILY_CALORIE_TARGET,
    dailyProteinTarget:  DAILY_PROTEIN_TARGET,
    dailyStatus,
    progressSummary,
    stillNeededNext,
    deltaCalories,
    deltaProtein,
    directionSignal,
    mealCount,
    includedCheckIn,
  }

  return { ok: true, data, summary }
}
