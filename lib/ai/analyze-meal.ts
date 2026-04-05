import Anthropic from '@anthropic-ai/sdk'
import { NUTRITION_SYSTEM_PROMPT, buildNutritionPayload, type NutritionPayloadContext } from './nutrition-prompt'
import { extractAndParseNutrition, type NutritionAIResponse } from './nutrition-schema'
import type {
  MealMode,
  NutritionAnalysisResult,
  NutritionStatus,
  NutritionConfidence,
  NutritionAction,
  DirectionSignal,
} from '@/lib/types'

const client = new Anthropic()

// Daily targets — kept in sync with readiness layer
const TARGET_CALORIES  = 2300
const TARGET_PROTEIN_G = 170

// Fraction of daily intake expected by time of day (conservative)
const TIME_WEIGHT: Record<string, number> = {
  morning:   0.20,
  midday:    0.45,
  afternoon: 0.65,
  evening:   0.85,
}

// Vagueness keywords — if any appear, confidence is capped at 'low'
const VAGUE_TERMS = [
  'some', 'a bit', 'a little', 'a few', 'handful', 'small', 'big', 'large',
  'plate', 'bowl', 'cup', 'piece', 'slice', 'stuff', 'things', 'food',
  'something', 'whatever', 'misc', 'random',
]

/**
 * Scores input vagueness. Returns 'low' | 'medium' | 'high'.
 * More vague terms → lower confidence → more conservative defaults.
 */
function scoreConfidence(inputText: string): NutritionConfidence {
  const lower = inputText.toLowerCase()
  const vagueCount = VAGUE_TERMS.filter(t => lower.includes(t)).length
  const wordCount   = lower.split(/\s+/).filter(Boolean).length

  // Very short with no specifics → low
  if (wordCount < 4) return 'low'
  if (vagueCount >= 2) return 'low'
  if (vagueCount === 1 || wordCount < 8) return 'medium'
  return 'high'
}

/**
 * Deterministic status + action from macro estimates + context.
 * Never trusts AI for these — always rule-based.
 *
 * Rules (conservative by design):
 * - If confidence is low → default to 'behind'
 * - If no context (no check-in data) → conservative
 * - Status compares cumulative intake (context + this meal) against time-weighted targets
 * - Action is derived from status + mode
 */
function deriveStatusAndAction(
  ai: NutritionAIResponse,
  mode: MealMode,
  context: NutritionPayloadContext,
  confidence: NutritionConfidence
): { status: NutritionStatus; action: NutritionAction } {
  const timeOfDay  = context.timeOfDay.toLowerCase()
  const weight     = TIME_WEIGHT[timeOfDay] ?? 0.65

  // Cumulative totals: what was known before + this meal
  const totalCalories = (context.caloriesSoFar ?? 0) + ai.estimatedCalories
  const totalProtein  = (context.proteinSoFarG ?? 0) + ai.estimatedProteinG

  // Whether we had any prior context at all
  const hasContext = context.caloriesSoFar !== null || context.proteinSoFarG !== null

  // ── Status ────────────────────────────────────────────────────────────────

  let status: NutritionStatus

  // Low confidence + no prior data → always behind (safe default)
  if (confidence === 'low' && !hasContext) {
    status = 'behind'
  }
  // Far behind: cumulative calories < 40% of expected pace, or protein critically low
  else if (
    totalCalories < TARGET_CALORIES * weight * 0.40 ||
    totalProtein  < TARGET_PROTEIN_G * weight * 0.40
  ) {
    status = 'far_behind'
  }
  // Behind: cumulative calories or protein below expected pace
  else if (
    totalCalories < TARGET_CALORIES * weight * 0.70 ||
    totalProtein  < TARGET_PROTEIN_G * weight * 0.60
  ) {
    status = 'behind'
  }
  // On track: only when data is clear and totals are sufficient
  else if (confidence !== 'low' && hasContext) {
    status = 'on_track'
  }
  // Default conservative: no clear signal → behind
  else {
    status = 'behind'
  }

  // ── Action ────────────────────────────────────────────────────────────────

  let action: NutritionAction

  if (mode === 'pre_workout') {
    if (ai.prePostWorkout === 'good_preworkout' && status !== 'far_behind') {
      action = 'train_now'
    } else if (status === 'far_behind') {
      action = 'eat_then_train'
    } else {
      // slightly light but not critical
      action = 'light_only'
    }
  } else if (mode === 'post_workout') {
    // Post-workout: action reflects recovery quality, not training decision
    action = 'general'
  } else {
    // what_i_ate / plan_to_eat
    if (status === 'far_behind') {
      action = 'eat_then_train'
    } else if (status === 'behind') {
      action = 'light_only'
    } else {
      action = 'general'
    }
  }

  return { status, action }
}

// ── Daily aggregation + summary helpers ──────────────────────────────────────
// These are pure functions with no I/O. Exported for use in the server action.

const TARGET_CALORIES_DAILY  = TARGET_CALORIES
const TARGET_PROTEIN_G_DAILY = TARGET_PROTEIN_G

// Per time-of-day: how much of the target should be hit before status tightens.
// Three distinct bands: morning is lenient, afternoon moderate, evening strict.
const STATUS_THRESHOLDS: Record<string, { farBehindCal: number; behindCal: number; farBehindPro: number; behindPro: number }> = {
  morning:   { farBehindCal: 0.20, behindCal: 0.40, farBehindPro: 0.15, behindPro: 0.30 },
  midday:    { farBehindCal: 0.30, behindCal: 0.55, farBehindPro: 0.25, behindPro: 0.45 },
  afternoon: { farBehindCal: 0.40, behindCal: 0.65, farBehindPro: 0.35, behindPro: 0.55 },
  evening:   { farBehindCal: 0.55, behindCal: 0.75, farBehindPro: 0.50, behindPro: 0.65 },
}

export function computeDailyStatus(
  totalCalories: number,
  totalProtein: number,
  timeOfDay: string
): NutritionStatus {
  const t = STATUS_THRESHOLDS[timeOfDay.toLowerCase()] ?? STATUS_THRESHOLDS.afternoon

  if (
    totalCalories < TARGET_CALORIES_DAILY * t.farBehindCal ||
    totalProtein  < TARGET_PROTEIN_G_DAILY * t.farBehindPro
  ) return 'far_behind'

  if (
    totalCalories < TARGET_CALORIES_DAILY * t.behindCal ||
    totalProtein  < TARGET_PROTEIN_G_DAILY * t.behindPro
  ) return 'behind'

  return 'on_track'
}

export function computeDirectionSignal(
  deltaCalories: number,
  deltaProtein: number
): DirectionSignal {
  // Meaningful improvement: added at least 200 kcal OR 15g protein
  if (deltaCalories >= 200 || deltaProtein >= 15) return 'improved'
  // Some impact but not much
  if (deltaCalories >= 75 || deltaProtein >= 5)  return 'minimal_impact'
  return 'no_meaningful_change'
}

// Varied progress message pool — indexed by status + time of day.
// Rotated by mealCount so successive entries don't repeat.
const PROGRESS_MESSAGES: Record<string, Record<string, string[]>> = {
  on_track: {
    morning:   ['Good start — you\'re pacing well for the day.', 'Early momentum looks solid.'],
    midday:    ['Solid mid-day position. Keep it consistent.', 'You\'re on track — one more good meal and you\'re set.'],
    afternoon: ['Well-fueled heading into the afternoon. Nice work.', 'Nutrition is holding up well. Stay consistent.'],
    evening:   ['Strong day overall. Finish clean with a light protein meal.', 'You\'ve fueled well today. Wrap up with something light.'],
  },
  behind: {
    morning:   ['Early in the day — still plenty of time to catch up.', 'Not much in yet, but the day is young. Prioritize protein at lunch.'],
    midday:    ['A bit behind pace. A protein-focused lunch will help.', 'Mid-day and slightly under — a solid meal now will keep you on track.'],
    afternoon: ['Behind for the afternoon. Push protein at your next meal.', 'Nutrition is lagging — aim for a substantial protein-heavy meal soon.'],
    evening:   ['Behind heading into the evening. One solid protein meal can recover this.', 'Late and under — prioritize protein for your last meal of the day.'],
  },
  far_behind: {
    morning:   ['Very little fuel logged yet. Eat soon — protein especially.', 'Far behind for the morning. Make your next meal count.'],
    midday:    ['Significantly under for mid-day. Eat a full meal now.', 'Fuel is low for the time of day. Don\'t skip your next meal.'],
    afternoon: ['Well behind on fuel for this time of day. Prioritize eating before any training.', 'Significantly underfueled. A full meal with protein is the priority right now.'],
    evening:   ['Fuel is very low for this late in the day. Get a protein-heavy meal in now.', 'Critical gap heading into evening — prioritize food over everything else tonight.'],
  },
}

export function buildProgressSummary(
  status: NutritionStatus,
  timeOfDay: string,
  mealCount: number
): string {
  const pool = PROGRESS_MESSAGES[status]?.[timeOfDay.toLowerCase()]
    ?? PROGRESS_MESSAGES[status]?.afternoon
    ?? ['Keep fueling consistently throughout the day.']
  return pool[mealCount % pool.length]
}

export function buildStillNeeded(
  totalCalories: number,
  totalProtein: number,
  status: NutritionStatus
): string[] {
  if (status === 'on_track') {
    return ['One more balanced meal should close out your targets well.']
  }

  const needed: string[] = []

  const remainingProtein  = Math.max(0, TARGET_PROTEIN_G_DAILY - totalProtein)
  const remainingCalories = Math.max(0, TARGET_CALORIES_DAILY - totalCalories)

  if (remainingProtein > 0) {
    needed.push(`~${Math.round(remainingProtein / 5) * 5}g protein still needed — chicken, eggs, Greek yogurt, or cottage cheese`)
  }
  if (remainingCalories > 150) {
    needed.push(`~${Math.round(remainingCalories / 50) * 50} more calories — lean toward protein sources, moderate carbs`)
  }

  return needed.length > 0 ? needed : ['Stay consistent — one more solid meal should cover it.']
}

export type AnalyzeMealResult =
  | { ok: true;  data: NutritionAnalysisResult; rawResponse: string }
  | { ok: false; error: string;                 rawResponse?: string }

/**
 * Pure AI + deterministic function — no DB access.
 * AI provides estimates and qualitative guidance.
 * Status, action, and confidence are set deterministically.
 */
export async function analyzeMeal(
  mode: MealMode,
  inputText: string,
  context: NutritionPayloadContext
): Promise<AnalyzeMealResult> {
  const payload     = buildNutritionPayload(mode, inputText, context)
  const confidence  = scoreConfidence(inputText)
  let rawResponse: string | undefined

  try {
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system:     NUTRITION_SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: `Analyze this meal entry:\n\n${payload}` }],
    })

    const block = message.content[0]
    if (block.type !== 'text') {
      return { ok: false, error: 'Unexpected response type from model' }
    }

    rawResponse = block.text

    const ai = extractAndParseNutrition(rawResponse)
    if (!ai) {
      return { ok: false, error: 'Model returned invalid JSON', rawResponse }
    }

    const { status, action } = deriveStatusAndAction(ai, mode, context, confidence)

    return {
      ok: true,
      rawResponse,
      data: {
        estimatedCalories:     ai.estimatedCalories,
        estimatedProteinG:     ai.estimatedProteinG,
        estimatedCarbsG:       ai.estimatedCarbsG,
        estimatedFatsG:        ai.estimatedFatsG,
        confidence,
        status,
        action,
        recommendationSummary: ai.recommendationSummary,
        whatToEatNext:         ai.whatToEatNext,
        prePostWorkout:        ai.prePostWorkout,
      },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, error: msg, rawResponse }
  }
}
