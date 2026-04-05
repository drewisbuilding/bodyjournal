import { z } from 'zod'

// The AI only returns estimates + qualitative fields.
// Status, action, and confidence are determined deterministically — not by the model.
export const NutritionAISchema = z.object({
  estimatedCalories:     z.number(),
  estimatedProteinG:     z.number(),
  estimatedCarbsG:       z.number(),
  estimatedFatsG:        z.number(),
  recommendationSummary: z.string(),
  whatToEatNext:         z.array(z.string()),
  prePostWorkout: z.enum([
    'good_preworkout',
    'too_light_preworkout',
    'good_postworkout',
    'needs_more_protein',
    'needs_more_carbs',
    'needs_more_food',
    'general',
  ]),
})

export type NutritionAIResponse = z.infer<typeof NutritionAISchema>

/**
 * Extracts and validates the AI portion of the nutrition response.
 * Strips markdown fences if present. Returns null on any failure.
 */
export function extractAndParseNutrition(raw: string): NutritionAIResponse | null {
  let jsonString = raw.trim()

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

  const result = NutritionAISchema.safeParse(parsed)
  return result.success ? result.data : null
}
