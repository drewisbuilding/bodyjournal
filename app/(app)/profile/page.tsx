'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, WorkActivity } from '@/lib/types'

const EQUIPMENT_OPTIONS = [
  { value: 'dumbbells',        label: 'Dumbbells' },
  { value: 'resistance_bands', label: 'Resistance bands' },
  { value: 'pull_up_bar',      label: 'Pull-up bar' },
  { value: 'kettlebell',       label: 'Kettlebell' },
  { value: 'yoga_mat',         label: 'Yoga mat' },
  { value: 'none',             label: 'None' },
]

const WORK_ACTIVITY_LABELS: Record<WorkActivity, string> = {
  sedentary:   'Sedentary',
  light:       'Light',
  active:      'Active',
  very_active: 'Very active',
}

const ROTATION_NAMES: Record<string, string> = {
  A: 'Day A — Push',
  B: 'Day B — Lower + Core',
  C: 'Day C — Pull',
  D: 'Day D — Recovery / Mobility',
}

export default function ProfilePage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [mode, setMode]       = useState<'view' | 'edit'>('view')
  const [form, setForm]       = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile(data as Profile)
        setForm(data as Profile)
      }
      setLoading(false)
    }
    load()
  }, [])

  function setField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleEquipment(value: string) {
    const current = (form.equipment_home ?? []) as string[]
    setForm(prev => ({
      ...prev,
      equipment_home: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value],
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setSaving(false); return }

    const { error: upsertError } = await supabase
      .from('profiles')
      .update({
        age:               form.age ?? null,
        height_inches:     form.height_inches ?? null,
        weight_lbs:        form.weight_lbs ?? null,
        goal:              form.goal ?? null,
        gym_access_default: form.gym_access_default ?? false,
        work_activity:     form.work_activity ?? null,
        equipment_home:    form.equipment_home ?? null,
        pain_notes:        form.pain_notes ?? null,
      })
      .eq('id', user.id)

    if (upsertError) {
      setError(upsertError.message)
    } else {
      setProfile(prev => prev ? { ...prev, ...form } as Profile : null)
      setMode('view')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10">
        <p className="text-sm text-neutral-500">Loading profile…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10">
        <p className="text-sm text-neutral-500">Profile not found.</p>
      </div>
    )
  }

  const lastUpdated = profile.onboarding_completed_at
    ? new Date(profile.onboarding_completed_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : 'Not set'

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-1 text-xs text-neutral-500">Last updated {lastUpdated}</p>
        </div>
        {mode === 'view' ? (
          <button
            onClick={() => setMode('edit')}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:border-neutral-500"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={() => { setMode('view'); setForm(profile) }}
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            Cancel
          </button>
        )}
      </div>

      {saved && (
        <p className="mb-4 text-sm text-green-400">Profile saved.</p>
      )}

      {mode === 'view' ? (
        <div className="flex flex-col gap-3">
          {/* Rotation status — highlighted */}
          <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">Current rotation</p>
            <p className="text-sm font-medium text-neutral-100">
              {ROTATION_NAMES[profile.current_rotation_day] ?? `Day ${profile.current_rotation_day}`}
            </p>
          </div>

          <InfoCard label="Age"            value={profile.age ? `${profile.age} years` : '—'} />
          <InfoCard label="Height"         value={profile.height_inches ? formatHeight(profile.height_inches) : '—'} />
          <InfoCard label="Weight"         value={profile.weight_lbs ? `${profile.weight_lbs} lbs` : '—'} />
          <InfoCard label="Goal"           value={profile.goal ?? '—'} />
          <InfoCard label="Gym access"     value={profile.gym_access_default ? 'Yes' : 'No'} />
          <InfoCard label="Work activity"  value={profile.work_activity ? WORK_ACTIVITY_LABELS[profile.work_activity as WorkActivity] : '—'} />
          <InfoCard label="Home equipment" value={profile.equipment_home?.join(', ') ?? '—'} />
          <InfoCard label="Pain notes"     value={profile.pain_notes ?? '—'} />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Age">
              <input type="number" value={form.age ?? ''} onChange={e => setField('age', Number(e.target.value) || null)} className={inputCls} placeholder="43" />
            </Field>
            <Field label="Height (in)">
              <input type="number" value={form.height_inches ?? ''} onChange={e => setField('height_inches', Number(e.target.value) || null)} className={inputCls} placeholder="72" />
            </Field>
            <Field label="Weight (lbs)">
              <input type="number" step="0.1" value={form.weight_lbs ?? ''} onChange={e => setField('weight_lbs', Number(e.target.value) || null)} className={inputCls} placeholder="192" />
            </Field>
          </div>

          <Field label="Goal">
            <textarea value={form.goal ?? ''} onChange={e => setField('goal', e.target.value || null)} rows={3} className={`${inputCls} resize-none`} placeholder="Your goal" />
          </Field>

          <Field label="Gym access">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.gym_access_default ?? false} onChange={e => setField('gym_access_default', e.target.checked)} className="h-4 w-4 accent-white" />
              <span className="text-sm text-neutral-300">I have regular gym access</span>
            </label>
          </Field>

          <Field label="Daily activity">
            <div className="grid grid-cols-2 gap-2">
              {(['sedentary', 'light', 'active', 'very_active'] as WorkActivity[]).map(v => (
                <button key={v} type="button" onClick={() => setField('work_activity', v)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    form.work_activity === v
                      ? 'border-white bg-white text-neutral-950'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600'
                  }`}>
                  {WORK_ACTIVITY_LABELS[v]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Home equipment">
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => toggleEquipment(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    (form.equipment_home ?? []).includes(opt.value)
                      ? 'border-white bg-white text-neutral-950'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Pain / stiffness notes">
            <textarea value={form.pain_notes ?? ''} onChange={e => setField('pain_notes', e.target.value || null)} rows={3} className={`${inputCls} resize-none`} placeholder="Any ongoing pain or stiffness" />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button onClick={handleSave} disabled={saving}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      )}
    </div>
  )
}

function formatHeight(inches: number): string {
  const ft = Math.floor(inches / 12)
  const i  = inches % 12
  return `${ft}'${i}" (${inches} in)`
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
      <span className="text-xs text-neutral-500 pt-0.5">{label}</span>
      <span className="text-sm text-neutral-200 text-right">{value}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-600'
