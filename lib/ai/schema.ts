import { z } from 'zod'

export const DailyPlanSchema = z.object({
  todayFocus:       z.string(),
  mobility:         z.array(z.string()),
  workoutGym:       z.array(z.string()),
  workoutHome:      z.array(z.string()),
  nutritionTargets: z.object({
    calories:     z.number(),
    proteinGrams: z.number(),
  }),
  foodGuidance:  z.array(z.string()),
  coachingNotes: z.array(z.string()),
})

export type DailyPlanResponse = z.infer<typeof DailyPlanSchema>

/**
 * Extracts JSON from the model's raw text response, then validates it.
 * The model is instructed to return only JSON, but may occasionally wrap
 * it in markdown fences — this handles both cases.
 * Returns null if extraction or validation fails.
 */
export function extractAndParse(raw: string): DailyPlanResponse | null {
  let jsonString = raw.trim()

  // Strip ```json ... ``` or ``` ... ``` fences if present
  const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return null
  }

  const result = DailyPlanSchema.safeParse(parsed)
  if (!result.success) {
    return null
  }

  return result.data
}
