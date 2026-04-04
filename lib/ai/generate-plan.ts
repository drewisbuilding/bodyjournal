import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPayload } from './prompt'
import { extractAndParse, type DailyPlanResponse } from './schema'
import type { Profile, CheckIn } from '@/lib/types'

// Instantiated once — the SDK reads ANTHROPIC_API_KEY from env automatically
const client = new Anthropic()

export type GenerateResult =
  | { ok: true;  data: DailyPlanResponse; rawResponse: string }
  | { ok: false; error: string;           rawResponse?: string }

/**
 * Pure AI function — no database access.
 * Calls the Anthropic API, extracts JSON, validates against schema.
 * Returns a typed result; never throws.
 */
export async function generateDailyPlan(
  profile: Profile,
  checkIn: CheckIn,
  rotationDay: string
): Promise<GenerateResult> {
  const userPayload = buildUserPayload(profile, checkIn, rotationDay)

  let rawResponse: string | undefined

  try {
    const message = await client.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages: [
        {
          role:    'user',
          content: `Generate today's plan:\n\n${userPayload}`,
        },
      ],
    })

    const block = message.content[0]
    if (block.type !== 'text') {
      return { ok: false, error: 'Unexpected response type from AI model' }
    }

    rawResponse = block.text

    const parsed = extractAndParse(rawResponse)
    if (!parsed) {
      return {
        ok: false,
        error: 'AI returned invalid or unparseable JSON',
        rawResponse,
      }
    }

    return { ok: true, data: parsed, rawResponse }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error calling AI'
    return { ok: false, error: message, rawResponse }
  }
}
