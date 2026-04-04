'use server'

import { createClient } from '@/lib/supabase/server'
import { generateDailyPlan } from '@/lib/ai/generate-plan'

const NEXT_ROTATION: Record<string, string> = {
  A: 'B',
  B: 'C',
  C: 'D',
  D: 'A',
}

export type GeneratePlanResult =
  | { ok: true;  planId: string }
  | { ok: false; error: string }

/**
 * Server action: orchestrates DB reads, AI call, DB writes.
 * Called from the check-in page after the check-in is saved.
 * The check-in is already committed before this runs — it is safe
 * even if this action fails.
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

  // AI call — pure function, no DB
  const result = await generateDailyPlan(profile, checkIn, rotationDay)

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  const { data: plan } = result

  // Insert plan row
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
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    return { ok: false, error: 'Could not save plan to database' }
  }

  // Advance rotation — fire after successful insert only
  await supabase
    .from('profiles')
    .update({ current_rotation_day: NEXT_ROTATION[rotationDay] ?? 'A' })
    .eq('id', user.id)

  return { ok: true, planId: inserted.id }
}
