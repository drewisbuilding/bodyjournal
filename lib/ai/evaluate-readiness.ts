import Anthropic from '@anthropic-ai/sdk'
import { extractAndParseReadiness } from './readiness-schema'
import type { CheckIn, ReadinessResult, FuelStatus, TrainingReadiness, NutritionGap } from '@/lib/types'

const client = new Anthropic()

// Daily targets for this user
const TARGET_CALORIES = 2300
const TARGET_PROTEIN_G = 170

// What fraction of daily intake should have been consumed by each time of day
const TIME_WEIGHT: Record<string, number> = {
  morning:   0.20,
  midday:    0.45,
  afternoon: 0.65,
  evening:   0.85,
}

// Symptoms that hard-override training readiness regardless of macro data
const DANGER_SYMPTOMS = ['dizzy', 'dizziness', 'lightheaded', 'light-headed', 'weak', 'weakness', 'faint', 'fainting']

type DeterministicResult = {
  fuelStatus: FuelStatus
  trainingReadiness: TrainingReadiness
  nutritionGap: NutritionGap
  hasDangerSymptom: boolean
  dataAvailable: boolean  // true if at least one macro field is present
}

/**
 * Infers a rough time_of_day bucket from the check-in's created_at timestamp.
 * Falls back to 'afternoon' (conservative) if parsing fails.
 */
function inferTimeOfDay(checkIn: CheckIn): string {
  if (checkIn.time_of_day) return checkIn.time_of_day.toLowerCase()

  try {
    const hour = new Date(checkIn.created_at).getHours()
    if (hour < 11) return 'morning'
    if (hour < 13) return 'midday'
    if (hour < 17) return 'afternoon'
    return 'evening'
  } catch {
    return 'afternoon' // conservative fallback
  }
}

/**
 * Checks whether the symptom string contains any danger keywords.
 */
function checkDangerSymptoms(symptoms: string | null): boolean {
  if (!symptoms) return false
  const lower = symptoms.toLowerCase()
  return DANGER_SYMPTOMS.some(s => lower.includes(s))
}

/**
 * Checks whether meals_so_far suggests meaningful eating has occurred.
 * Looks for food-related words rather than empty/null strings.
 */
function mealsLookAdequate(meals: string | null): boolean {
  if (!meals || meals.trim().length < 5) return false
  const lower = meals.toLowerCase()
  // Any mention of substantive food items
  const foodWords = [
    'egg', 'chicken', 'beef', 'fish', 'salmon', 'tuna', 'turkey',
    'rice', 'oat', 'bread', 'pasta', 'potato', 'protein',
    'shake', 'yogurt', 'cottage', 'beans', 'lentil',
    'meal', 'lunch', 'dinner', 'breakfast', 'ate', 'eaten', 'had'
  ]
  return foodWords.some(w => lower.includes(w))
}

/**
 * Pure deterministic function — no I/O.
 * Sets fuelStatus, trainingReadiness, nutritionGap based on explicit rules.
 * Conservative by default: missing data → slightly_underfueled.
 */
function runDeterministicRules(checkIn: CheckIn): DeterministicResult {
  const timeOfDay = inferTimeOfDay(checkIn)
  const weight    = TIME_WEIGHT[timeOfDay] ?? 0.65 // unknown time → afternoon weight
  const energy    = checkIn.energy_level
  const calories  = checkIn.calories_so_far
  const protein   = checkIn.protein_so_far_g
  const hasDangerSymptom = checkDangerSymptoms(checkIn.symptoms_today)
  const dataAvailable    = calories !== null || protein !== null

  // Symptom hard override — always beats macro data
  if (hasDangerSymptom) {
    return {
      fuelStatus:        'significantly_underfueled',
      trainingReadiness: 'eat_first',
      nutritionGap:      'far_behind',
      hasDangerSymptom:  true,
      dataAvailable,
    }
  }

  // RULE 1: Force recovery — very low energy AND very low food late in day
  if (
    energy !== null && energy <= 2 &&
    dataAvailable &&
    (calories !== null && calories < TARGET_CALORIES * weight * 0.40) &&
    (protein !== null && protein < TARGET_PROTEIN_G * weight * 0.40)
  ) {
    return {
      fuelStatus:        'recovery_only',
      trainingReadiness: 'recovery_only',
      nutritionGap:      'far_behind',
      hasDangerSymptom:  false,
      dataAvailable,
    }
  }

  // RULE 2: Significantly underfueled — meaningful deficit in afternoon or evening
  if (
    dataAvailable &&
    (timeOfDay === 'afternoon' || timeOfDay === 'evening') &&
    calories !== null &&
    calories < TARGET_CALORIES * weight * 0.50
  ) {
    return {
      fuelStatus:        'significantly_underfueled',
      trainingReadiness: 'eat_first',
      nutritionGap:      'far_behind',
      hasDangerSymptom:  false,
      dataAvailable,
    }
  }

  // RULE 3: Protein critically low later in the day — never classify as ready
  if (
    dataAvailable &&
    protein !== null &&
    (timeOfDay === 'afternoon' || timeOfDay === 'evening') &&
    protein < TARGET_PROTEIN_G * weight * 0.45
  ) {
    return {
      fuelStatus:        'slightly_underfueled',
      trainingReadiness: 'reduced',
      nutritionGap:      'behind',
      hasDangerSymptom:  false,
      dataAvailable,
    }
  }

  // RULE 4: General underfueling — calorie or protein behind pace
  if (
    dataAvailable && (
      (calories !== null && calories < TARGET_CALORIES * weight * 0.65) ||
      (protein !== null && protein < TARGET_PROTEIN_G * weight * 0.55)
    )
  ) {
    return {
      fuelStatus:        'slightly_underfueled',
      trainingReadiness: 'reduced',
      nutritionGap:      'behind',
      hasDangerSymptom:  false,
      dataAvailable,
    }
  }

  // NO macro data — use meals_so_far as primary fallback signal
  // Conservative default: slightly_underfueled unless meals look clearly adequate
  if (!dataAvailable) {
    if (mealsLookAdequate(checkIn.meals_so_far)) {
      return {
        fuelStatus:        'slightly_underfueled', // still cautious without numbers
        trainingReadiness: 'reduced',
        nutritionGap:      'behind',
        hasDangerSymptom:  false,
        dataAvailable:     false,
      }
    }
    // No macro data AND no recognizable meals described
    return {
      fuelStatus:        'slightly_underfueled',
      trainingReadiness: 'reduced',
      nutritionGap:      'behind',
      hasDangerSymptom:  false,
      dataAvailable:     false,
    }
  }

  // RULE 5: Ready — passed all checks with data present
  return {
    fuelStatus:        'ready',
    trainingReadiness: 'full',
    nutritionGap:      'on_track',
    hasDangerSymptom:  false,
    dataAvailable,
  }
}

/**
 * Calls AI for reasoning summary, food suggestions, and adjustment notes.
 * Pure AI call — no DB. Returns null on failure so caller can use fallback.
 */
async function callReadinessAI(
  checkIn: CheckIn,
  deterministic: DeterministicResult
): Promise<{ reasoningSummary: string; whatToEatNext: string[]; adjustmentNotes: string[] } | null> {
  const prompt = `You are a conservative fitness and nutrition coach. Based on the data below, provide a short, practical readiness assessment.

DETERMINISTIC ASSESSMENT (already computed — do not override):
- Fuel status: ${deterministic.fuelStatus}
- Training readiness: ${deterministic.trainingReadiness}
- Nutrition gap: ${deterministic.nutritionGap}
- Danger symptom detected: ${deterministic.hasDangerSymptom}
- Macro data available: ${deterministic.dataAvailable}

CHECK-IN DATA:
${JSON.stringify({
  timeOfDay:       checkIn.time_of_day,
  energyLevel:     checkIn.energy_level,
  painLevel:       checkIn.pain_level,
  mealsSoFar:      checkIn.meals_so_far,
  proteinSoFarG:   checkIn.protein_so_far_g,
  caloriesSoFar:   checkIn.calories_so_far,
  symptomsToday:   checkIn.symptoms_today,
}, null, 2)}

Respond with ONLY valid JSON — no prose, no fences:
{
  "reasoningSummary": "1–2 sentence plain-English explanation of today's readiness",
  "whatToEatNext": ["specific food suggestion 1", "..."],
  "adjustmentNotes": ["practical note for today 1", "..."]
}

Rules:
- whatToEatNext must have 2–4 items. Be specific (e.g. "Greek yogurt + banana" not "eat protein").
- adjustmentNotes must have 1–3 items.
- If trainingReadiness is eat_first: the first adjustmentNote must say to eat before training.
- If trainingReadiness is recovery_only: do not suggest any training in adjustmentNotes.
- Never be falsely optimistic. Mirror the deterministic assessment in tone.`

  try {
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages:   [{ role: 'user', content: prompt }],
    })

    const block = message.content[0]
    if (block.type !== 'text') return null

    return extractAndParseReadiness(block.text)
  } catch {
    return null
  }
}

/**
 * Safe fallback when AI reasoning fails.
 * Returns conservative but generic guidance consistent with the deterministic result.
 */
function readinessFallback(d: DeterministicResult): { reasoningSummary: string; whatToEatNext: string[]; adjustmentNotes: string[] } {
  const summaries: Record<FuelStatus, string> = {
    ready:                    'Fuel and energy look adequate for a full session today.',
    slightly_underfueled:     'Nutrition data is limited or slightly behind — a conservative approach is safest.',
    significantly_underfueled:'Fuel is significantly behind for the time of day. Eat before training.',
    recovery_only:            'Energy and fuel are too low for productive training. Focus on recovery and eating.',
  }

  const eatFirst = [
    'Eat a balanced meal or snack before training.',
    'Prioritize protein and carbohydrates before your session.',
  ]

  const adjustments: Record<TrainingReadiness, string[]> = {
    full:          ['Proceed with today\'s planned session.'],
    reduced:       ['Reduce workout volume by about 30–40% today.', 'Focus on form and movement quality over load.'],
    eat_first:     ['Eat first before any training today.', 'Train at reduced volume after eating, or skip and recover.'],
    recovery_only: ['No loaded training today.', 'Walk, stretch, and prioritize food and rest.'],
  }

  return {
    reasoningSummary: summaries[d.fuelStatus],
    whatToEatNext:    eatFirst,
    adjustmentNotes:  adjustments[d.trainingReadiness],
  }
}

/**
 * Main export — evaluates readiness from check-in data.
 * Never throws. Always returns a complete ReadinessResult.
 */
export async function evaluateReadiness(checkIn: CheckIn): Promise<ReadinessResult> {
  const deterministic = runDeterministicRules(checkIn)

  const aiResult = await callReadinessAI(checkIn, deterministic)
  const reasoning = aiResult ?? readinessFallback(deterministic)

  return {
    fuelStatus:        deterministic.fuelStatus,
    trainingReadiness: deterministic.trainingReadiness,
    nutritionGap:      deterministic.nutritionGap,
    reasoningSummary:  reasoning.reasoningSummary,
    whatToEatNext:     reasoning.whatToEatNext,
    adjustmentNotes:   reasoning.adjustmentNotes,
  }
}
