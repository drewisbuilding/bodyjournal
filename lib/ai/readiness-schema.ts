import { z } from 'zod'

// Only the AI-generated fields — deterministic fields are set by rules, not parsed from AI
export const ReadinessAISchema = z.object({
  reasoningSummary: z.string(),
  whatToEatNext:    z.array(z.string()),
  adjustmentNotes:  z.array(z.string()),
})

export type ReadinessAIResponse = z.infer<typeof ReadinessAISchema>

/**
 * Extracts and validates the AI portion of the readiness response.
 * Strips markdown fences if present. Returns null on any failure.
 */
export function extractAndParseReadiness(raw: string): ReadinessAIResponse | null {
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

  const result = ReadinessAISchema.safeParse(parsed)
  return result.success ? result.data : null
}
