'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logEvent } from '@/lib/behavior'
import { generatePlanAction } from '@/app/actions/generate-plan'

export default function CheckInPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    gym_today: false,
    energy_level: '' as '' | number,
    pain_level: '' as '' | number,
    pain_location: '',
    time_available_minutes: '',
    body_weight_lbs: '',
    meals_so_far: '',
    extra_notes: '',
  })
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [savedCheckInId, setSavedCheckInId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [todayDate] = useState(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  )

  useEffect(() => {
    logEvent('page_viewed', { page: 'check_in' })
  }, [])

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    if (!started) {
      setStarted(true)
      logEvent('check_in_started')
    }
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleFieldFilled(field: string) {
    logEvent('field_filled', { page: 'check_in', field })
  }

  function handleFieldSkipped(field: string) {
    logEvent('field_skipped', { page: 'check_in', field })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const today = new Date().toISOString().split('T')[0]

    const { data: saved, error: insertError } = await supabase
      .from('check_ins')
      .upsert({
        user_id: user.id,
        date: today,
        gym_today: form.gym_today,
        energy_level: form.energy_level !== '' ? Number(form.energy_level) : null,
        pain_level: form.pain_level !== '' ? Number(form.pain_level) : null,
        pain_location: form.pain_location || null,
        time_available_minutes: form.time_available_minutes ? Number(form.time_available_minutes) : null,
        body_weight_lbs: form.body_weight_lbs ? Number(form.body_weight_lbs) : null,
        meals_so_far: form.meals_so_far || null,
        extra_notes: form.extra_notes || null,
      }, { onConflict: 'user_id,date' })
      .select('id')
      .single()

    if (insertError || !saved) {
      setError(insertError?.message ?? 'Could not save check-in')
      setLoading(false)
      return
    }

    await logEvent('check_in_completed', { date: today })
    setSavedCheckInId(saved.id)
    setLoading(false)

    await runPlanGeneration(saved.id)
  }

  async function runPlanGeneration(checkInId: string) {
    setGenerating(true)
    setError(null)

    const result = await generatePlanAction(checkInId)

    if (result.ok) {
      router.push(`/plan/${result.planId}`)
    } else {
      setError(`Plan generation failed: ${result.error}`)
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Daily check-in</h1>
      <p className="mb-8 text-sm text-neutral-400">{todayDate}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Gym today */}
        <Section label="Today's workout">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.gym_today}
              onChange={e => { set('gym_today', e.target.checked); handleFieldFilled('gym_today') }}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 accent-white"
            />
            <span className="text-sm text-neutral-300">I have gym access today</span>
          </label>
        </Section>

        {/* Energy level */}
        <Section label="Energy level (1–5)">
          <ScaleButtons
            value={form.energy_level}
            max={5}
            onChange={v => { set('energy_level', v); handleFieldFilled('energy_level') }}
            labels={['Low', '', '', '', 'High']}
          />
        </Section>

        {/* Pain level */}
        <Section label="Pain / stiffness level (0–5)">
          <ScaleButtons
            value={form.pain_level}
            min={0}
            max={5}
            onChange={v => { set('pain_level', v); handleFieldFilled('pain_level') }}
            labels={['None', '', '', '', '', 'Significant']}
          />
        </Section>

        {/* Pain location */}
        <Section label="Pain location (optional)">
          <input
            type="text"
            value={form.pain_location}
            onChange={e => set('pain_location', e.target.value)}
            onBlur={() =>
              form.pain_location ? handleFieldFilled('pain_location') : handleFieldSkipped('pain_location')
            }
            placeholder="e.g. Lower back, left shoulder"
            className={inputCls}
          />
        </Section>

        {/* Time available */}
        <Section label="Time available (minutes)">
          <input
            type="number"
            value={form.time_available_minutes}
            onChange={e => set('time_available_minutes', e.target.value)}
            onBlur={() =>
              form.time_available_minutes
                ? handleFieldFilled('time_available_minutes')
                : handleFieldSkipped('time_available_minutes')
            }
            placeholder="e.g. 45"
            className={inputCls}
          />
        </Section>

        {/* Body weight */}
        <Section label="Body weight (lbs, optional)">
          <input
            type="number"
            step="0.1"
            value={form.body_weight_lbs}
            onChange={e => set('body_weight_lbs', e.target.value)}
            onBlur={() =>
              form.body_weight_lbs
                ? handleFieldFilled('body_weight_lbs')
                : handleFieldSkipped('body_weight_lbs')
            }
            placeholder="192.0"
            className={inputCls}
          />
        </Section>

        {/* Meals so far */}
        <Section label="Meals so far today (optional)">
          <textarea
            value={form.meals_so_far}
            onChange={e => set('meals_so_far', e.target.value)}
            onBlur={() =>
              form.meals_so_far
                ? handleFieldFilled('meals_so_far')
                : handleFieldSkipped('meals_so_far')
            }
            placeholder="e.g. Eggs and oats for breakfast, chicken salad for lunch"
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Section>

        {/* Extra notes */}
        <Section label="Anything else (optional)">
          <textarea
            value={form.extra_notes}
            onChange={e => set('extra_notes', e.target.value)}
            onBlur={() =>
              form.extra_notes
                ? handleFieldFilled('extra_notes')
                : handleFieldSkipped('extra_notes')
            }
            placeholder="Sleep quality, stress, anything worth noting"
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </Section>

        {error && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-400">{error}</p>
            {savedCheckInId && (
              <button
                type="button"
                onClick={() => runPlanGeneration(savedCheckInId)}
                disabled={generating}
                className="self-start text-sm text-neutral-400 underline underline-offset-4 hover:text-neutral-200 disabled:opacity-50"
              >
                {generating ? 'Retrying…' : 'Retry plan generation'}
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || generating}
          className="mt-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving check-in…' : generating ? 'Generating your plan…' : 'Submit check-in'}
        </button>
      </form>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
      {children}
    </div>
  )
}

function ScaleButtons({
  value,
  min = 1,
  max,
  onChange,
  labels,
}: {
  value: '' | number
  min?: number
  max: number
  onChange: (v: number) => void
  labels: string[]
}) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        {steps.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              value === n
                ? 'border-white bg-white text-neutral-950'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between px-0.5">
        <span className="text-xs text-neutral-600">{labels[0]}</span>
        <span className="text-xs text-neutral-600">{labels[labels.length - 1]}</span>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-600'
