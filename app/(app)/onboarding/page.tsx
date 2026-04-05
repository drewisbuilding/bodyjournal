'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logEvent } from '@/lib/behavior'
import type { WorkActivity } from '@/lib/types'

const EQUIPMENT_OPTIONS = [
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'resistance_bands', label: 'Resistance bands' },
  { value: 'pull_up_bar', label: 'Pull-up bar' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'yoga_mat', label: 'Yoga mat' },
  { value: 'none', label: 'None' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    age: '',
    height_inches: '',
    weight_lbs: '',
    goal: '',
    gym_access_default: false,
    work_activity: '' as WorkActivity | '',
    equipment_home: [] as string[],
    pain_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    logEvent('page_viewed', { page: 'onboarding' })
  }, [])

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleFieldFilled(field: string) {
    logEvent('field_filled', { page: 'onboarding', field })
  }

  function handleEquipmentToggle(value: string) {
    setForm(prev => ({
      ...prev,
      equipment_home: prev.equipment_home.includes(value)
        ? prev.equipment_home.filter(v => v !== value)
        : [...prev.equipment_home, value],
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      age: form.age ? Number(form.age) : null,
      height_inches: form.height_inches ? Number(form.height_inches) : null,
      weight_lbs: form.weight_lbs ? Number(form.weight_lbs) : null,
      goal: form.goal || null,
      gym_access_default: form.gym_access_default,
      work_activity: form.work_activity || null,
      equipment_home: form.equipment_home.length > 0 ? form.equipment_home : null,
      pain_notes: form.pain_notes || null,
      onboarding_completed_at: new Date().toISOString(),
    })

    if (upsertError) {
      setError(upsertError.message)
      setLoading(false)
      return
    }

    router.push('/home')
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Let&apos;s get to know you</h1>
      <p className="mb-8 text-sm text-neutral-400">This takes about 2 minutes. We use this to personalize your plan.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Basic stats */}
        <Section label="Basic stats">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Age">
              <input
                type="number"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                onBlur={() => form.age && handleFieldFilled('age')}
                placeholder="43"
                className={inputCls}
              />
            </Field>
            <Field label="Height (in)">
              <input
                type="number"
                value={form.height_inches}
                onChange={e => set('height_inches', e.target.value)}
                onBlur={() => form.height_inches && handleFieldFilled('height_inches')}
                placeholder="72"
                className={inputCls}
              />
            </Field>
            <Field label="Weight (lbs)">
              <input
                type="number"
                step="0.1"
                value={form.weight_lbs}
                onChange={e => set('weight_lbs', e.target.value)}
                onBlur={() => form.weight_lbs && handleFieldFilled('weight_lbs')}
                placeholder="192"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* Goal */}
        <Section label="Primary goal">
          <textarea
            value={form.goal}
            onChange={e => set('goal', e.target.value)}
            onBlur={() => form.goal ? handleFieldFilled('goal') : logEvent('field_skipped', { page: 'onboarding', field: 'goal' })}
            placeholder="e.g. Build a leaner, more athletic physique. Better posture, chest, and flexibility."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Section>

        {/* Gym access */}
        <Section label="Gym access">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.gym_access_default}
              onChange={e => { set('gym_access_default', e.target.checked); handleFieldFilled('gym_access_default') }}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 accent-white"
            />
            <span className="text-sm text-neutral-300">I have regular gym access</span>
          </label>
        </Section>

        {/* Work activity */}
        <Section label="Daily activity (outside gym)">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(['sedentary', 'light', 'active', 'very_active'] as WorkActivity[]).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => { set('work_activity', v); handleFieldFilled('work_activity') }}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  form.work_activity === v
                    ? 'border-white bg-white text-neutral-950'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                {v.replace('_', ' ')}
              </button>
            ))}
          </div>
        </Section>

        {/* Home equipment */}
        <Section label="Home equipment">
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { handleEquipmentToggle(opt.value); handleFieldFilled('equipment_home') }}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  form.equipment_home.includes(opt.value)
                    ? 'border-white bg-white text-neutral-950'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Pain / stiffness */}
        <Section label="Pain or stiffness notes">
          <textarea
            value={form.pain_notes}
            onChange={e => set('pain_notes', e.target.value)}
            onBlur={() => form.pain_notes ? handleFieldFilled('pain_notes') : logEvent('field_skipped', { page: 'onboarding', field: 'pain_notes' })}
            placeholder="e.g. Daily morning stiffness in lower back and hips. Some shoulder tightness."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </Section>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Continue to daily check-in →'}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-neutral-500">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-600'
