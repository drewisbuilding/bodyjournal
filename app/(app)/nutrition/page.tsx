'use client'

import { useState } from 'react'
import { analyzeMealAction } from '@/app/actions/analyze-meal'
import type { MealMode, NutritionAnalysisResult, DailyNutritionSummary } from '@/lib/types'

const MODES: { value: MealMode; label: string; description: string }[] = [
  { value: 'what_i_ate',   label: 'What I ate',   description: 'Log food already eaten' },
  { value: 'plan_to_eat',  label: 'Plan to eat',  description: 'Evaluate a planned meal' },
  { value: 'pre_workout',  label: 'Pre-workout',  description: 'Is this enough to train?' },
  { value: 'post_workout', label: 'Post-workout', description: 'Does this support recovery?' },
]

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  on_track:   { label: 'On track',   color: 'text-green-400' },
  behind:     { label: 'Behind',     color: 'text-yellow-400' },
  far_behind: { label: 'Far behind', color: 'text-red-400' },
}

const CONFIDENCE_STYLE: Record<string, { label: string; color: string }> = {
  high:   { label: 'High confidence',                    color: 'text-neutral-400' },
  medium: { label: 'Medium confidence',                  color: 'text-neutral-500' },
  low:    { label: 'Low confidence — estimates are rough', color: 'text-orange-400' },
}

const ACTION_LABEL: Record<string, string> = {
  train_now:      'Good to train now',
  eat_then_train: 'Eat more first, then train',
  light_only:     'Light session only',
  recovery_only:  'Recovery only today',
  general:        '',
}

const PRE_POST_LABEL: Record<string, string> = {
  good_preworkout:      'Good pre-workout meal',
  too_light_preworkout: 'Too light for a full session',
  good_postworkout:     'Good recovery meal',
  needs_more_protein:   'Needs more protein',
  needs_more_carbs:     'Needs more carbohydrates',
  needs_more_food:      'Needs more total food',
  general:              '',
}

const DIRECTION_LABEL: Record<string, { text: string; color: string }> = {
  improved:            { text: 'This meal improved your position today', color: 'text-green-400' },
  minimal_impact:      { text: 'Small contribution to today\'s total',   color: 'text-neutral-400' },
  no_meaningful_change:{ text: 'Minimal nutritional impact',             color: 'text-neutral-500' },
}

export default function NutritionPage() {
  const [mode, setMode]       = useState<MealMode>('what_i_ate')
  const [inputText, setInput] = useState('')
  const [result, setResult]   = useState<NutritionAnalysisResult | null>(null)
  const [summary, setSummary] = useState<DailyNutritionSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!inputText.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setSummary(null)

    const res = await analyzeMealAction(mode, inputText.trim())

    if (res.ok) {
      setResult(res.data)
      setSummary(res.summary)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  function handleReset() {
    setResult(null)
    setSummary(null)
    setError(null)
    setInput('')
  }

  const statusMeta     = result ? STATUS_STYLE[result.status]     : null
  const confidenceMeta = result ? CONFIDENCE_STYLE[result.confidence] : null
  const actionLabel    = result ? ACTION_LABEL[result.action]     : null
  const prePostLabel   = result ? PRE_POST_LABEL[result.prePostWorkout] : null
  const dirMeta        = summary ? DIRECTION_LABEL[summary.directionSignal] : null
  const dailyStatus    = summary ? STATUS_STYLE[summary.dailyStatus] : null
  const isWorkoutMode  = mode === 'pre_workout' || mode === 'post_workout'

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Nutrition check</h1>
      <p className="mb-8 text-sm text-neutral-400">
        Describe a meal and get a practical read on your fueling.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => { setMode(m.value); setResult(null); setSummary(null); setError(null) }}
              className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left transition-colors ${
                mode === m.value
                  ? 'border-white bg-white text-neutral-950'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              <span className="text-sm font-medium">{m.label}</span>
              <span className={`text-xs ${mode === m.value ? 'text-neutral-600' : 'text-neutral-500'}`}>
                {m.description}
              </span>
            </button>
          ))}
        </div>

        {/* Food input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            What did you eat?
          </label>
          <textarea
            value={inputText}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'pre_workout'
                ? 'e.g. Banana, Greek yogurt, and a scoop of protein powder'
                : mode === 'post_workout'
                ? 'e.g. Chicken breast, white rice, and broccoli'
                : 'e.g. 3 eggs scrambled, oats with banana, black coffee'
            }
            rows={4}
            className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-600"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? 'Analyzing…' : 'Analyze meal'}
        </button>
      </form>

      {/* ── Results ── */}
      {result && (
        <div className="mt-8 flex flex-col gap-4">

          {/* ── TODAY SO FAR ── shown first, before meal analysis ── */}
          {summary ? (
            <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Today so far
                </p>
                {summary.includedCheckIn && (
                  <span className="text-xs text-neutral-600">includes check-in</span>
                )}
              </div>

              {/* Macro totals vs targets */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <TodayStat
                  label="Calories"
                  current={summary.todayCaloriesSoFar}
                  target={summary.dailyCalorieTarget}
                />
                <TodayStat
                  label="Protein"
                  current={summary.todayProteinSoFar}
                  target={summary.dailyProteinTarget}
                  unit="g"
                />
                <MacroStat label="Carbs" value={`${summary.todayCarbsSoFar}g`} />
                <MacroStat label="Fats"  value={`${summary.todayFatsSoFar}g`} />
              </div>

              {/* Daily status */}
              {dailyStatus && (
                <div className="mb-3 flex items-center justify-between border-t border-neutral-800 pt-3">
                  <span className="text-sm text-neutral-400">Day status</span>
                  <span className={`text-sm font-medium ${dailyStatus.color}`}>
                    {dailyStatus.label}
                  </span>
                </div>
              )}

              {/* Progress summary */}
              <p className="text-sm leading-relaxed text-neutral-300">
                {summary.progressSummary}
              </p>

              {/* Delta + direction */}
              {dirMeta && (
                <p className={`mt-2 text-xs ${dirMeta.color}`}>
                  +{summary.deltaCalories} kcal · +{summary.deltaProtein}g protein — {dirMeta.text.toLowerCase()}
                </p>
              )}

              {/* Still needed */}
              {summary.stillNeededNext.length > 0 && (
                <div className="mt-3 border-t border-neutral-800 pt-3">
                  <p className="mb-1.5 text-xs text-neutral-500">Still needed</p>
                  <ul className="flex flex-col gap-1">
                    {summary.stillNeededNext.map((item, i) => (
                      <li key={i} className="flex gap-2 text-xs text-neutral-400">
                        <span className="shrink-0 text-neutral-600">–</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-3 text-xs text-neutral-600">
                Added to today&apos;s estimate · {summary.mealCount} {summary.mealCount === 1 ? 'entry' : 'entries'} logged
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-sm text-neutral-500">Could not calculate today&apos;s total right now.</p>
            </div>
          )}

          {/* ── DIVIDER ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-xs text-neutral-600">This meal</span>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          {/* Estimates */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Estimates
            </p>
            <div className="grid grid-cols-4 gap-3">
              <MacroStat label="Calories" value={String(result.estimatedCalories)} />
              <MacroStat label="Protein"  value={`${result.estimatedProteinG}g`} />
              <MacroStat label="Carbs"    value={`${result.estimatedCarbsG}g`} />
              <MacroStat label="Fats"     value={`${result.estimatedFatsG}g`} />
            </div>
            {confidenceMeta && (
              <p className={`mt-3 text-xs ${confidenceMeta.color}`}>{confidenceMeta.label}</p>
            )}
          </div>

          {/* Status + action */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Meal status
            </p>
            <div className="flex flex-col gap-2">
              {statusMeta && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Pace</span>
                  <span className={`text-sm font-medium ${statusMeta.color}`}>{statusMeta.label}</span>
                </div>
              )}
              {actionLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Training decision</span>
                  <span className="text-sm font-medium text-neutral-200">{actionLabel}</span>
                </div>
              )}
              {isWorkoutMode && prePostLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Workout context</span>
                  <span className="text-sm font-medium text-neutral-200">{prePostLabel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assessment */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Assessment
            </p>
            <p className="text-sm leading-relaxed text-neutral-300">
              {result.recommendationSummary}
            </p>
          </div>

          {/* What to eat next */}
          {result.whatToEatNext.length > 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
                What to eat next
              </p>
              <ul className="flex flex-col gap-2">
                {result.whatToEatNext.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-200">
                    <span className="mt-0.5 shrink-0 text-neutral-600">–</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="mt-1 self-start text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-300"
          >
            Check another meal
          </button>
        </div>
      )}
    </div>
  )
}

function TodayStat({ label, current, target, unit = '' }: {
  label: string
  current: number
  target: number
  unit?: string
}) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-base font-semibold">
        {current}{unit}
        <span className="ml-1 text-xs font-normal text-neutral-600">/ {target}{unit}</span>
      </span>
      {/* Simple text-based progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-1 rounded-full transition-all ${
            pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  )
}
