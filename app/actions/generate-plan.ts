'use server'

import { createClient } from '@/lib/supabase/server'
import { evaluateReadiness } from '@/lib/ai/evaluate-readiness'
import { generateDailyPlan } from '@/lib/ai/generate-plan'
import type { ReadinessResult } from '@/lib/types'

const NEXT_ROTATION: Record<string, string> = {
  A: 'B',
  B: 'C',
  C: 'D',
  D: 'A',
}

// Conservative fallback used if readiness evaluation itself throws unexpectedly
const READINESS_FALLBACK: ReadinessResult = {
  fuelStatus:        'slightly_underfueled',
  trainingReadiness: 'reduced',
  nutritionGap:      'behind',
  reasoningSummary:  'Readiness evaluation unavailable — defaulting to a reduced plan to be safe.',
  whatToEatNext:     ['Eat a balanced meal with protein and carbohydrates before training.'],
  adjustmentNotes:   ['Plan volume reduced as a precaution.'],
}

export type GeneratePlanResult =
  | { ok: true;  planId: string }
  | { ok: false; error: string }

/**
 * Server action: orchestrates DB reads, readiness evaluation, AI plan generation, DB writes.
 * Check-in is already committed before this runs — safe to call independently.
 *
 * Flow:
 *   load profile + check-in
 *   → evaluate readiness (deterministic rules + AI reasoning)
 *   → generate daily plan (AI, receives readiness)
 *   → insert plan with all readiness fields
 *   → advance rotation day
 */
export async function generatePlanAction(checkInId: string): Promise<GeneratePlanResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  // Load profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { ok: false, error: 'Could not load profile' }
  }

  // Load check-in (also verifies ownership)
  const { data: checkIn, error: checkInError } = await supabase
    .from('check_ins')
    .select('*')
    .eq('id', checkInId)
    .eq('user_id', user.id)
    .single()

  if (checkInError || !checkIn) {
    return { ok: false, error: 'Could not load check-in' }
  }

  const rotationDay = profile.current_rotation_day ?? 'A'

  // ── READINESS EVALUATION ────────────────────────────────────────────────────
  // evaluateReadiness never throws — it always returns a complete result.
  // If something goes wrong inside it, we fall back to conservative defaults.
  let readiness: ReadinessResult
  try {
    readiness = await evaluateReadiness(checkIn)
  } catch {
    readiness = READINESS_FALLBACK
  }

  // ── PLAN GENERATION ─────────────────────────────────────────────────────────
  const result = await generateDailyPlan(profile, checkIn, rotationDay, readiness)

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  const { data: plan } = result

  // ── DB WRITE ─────────────────────────────────────────────────────────────────
  const { data: inserted, error: insertError } = await supabase
    .from('plans')
    .insert({
      user_id:           user.id,
      check_in_id:       checkInId,
      rotation_day:      rotationDay,
      today_focus:       plan.todayFocus,
      mobility:          plan.mobility,
      workout_gym:       plan.workoutGym,
      workout_home:      plan.workoutHome,
      nutrition_targets: plan.nutritionTargets,
      food_guidance:     plan.foodGuidance,
      coaching_notes:    plan.coachingNotes,
      raw_ai_response:   result.rawResponse ? { text: result.rawResponse } : null,
      // Stage 3: readiness fields
      fuel_status:        readiness.fuelStatus,
      training_readiness: readiness.trainingReadiness,
      nutrition_gap:      readiness.nutritionGap,
      reasoning_summary:  readiness.reasoningSummary,
      what_to_eat_next:   readiness.whatToEatNext,
      adjustment_notes:   readiness.adjustmentNotes,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    return { ok: false, error: 'Could not save plan to database' }
  }

  // Advance rotation — only after successful insert
  await supabase
    .from('profiles')
    .update({ current_rotation_day: NEXT_ROTATION[rotationDay] ?? 'A' })
    .eq('id', user.id)

  return { ok: true, planId: inserted.id }
}
