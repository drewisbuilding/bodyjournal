import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Plan, NutritionTargets } from '@/lib/types'

const FUEL_LABELS: Record<string, { label: string; color: string }> = {
  ready:                     { label: 'Ready',                     color: 'text-green-400' },
  slightly_underfueled:      { label: 'Slightly underfueled',      color: 'text-yellow-400' },
  significantly_underfueled: { label: 'Significantly underfueled', color: 'text-orange-400' },
  recovery_only:             { label: 'Recovery only',             color: 'text-red-400' },
}

const READINESS_LABELS: Record<string, string> = {
  full:          'Full session',
  reduced:       'Reduced session',
  eat_first:     'Eat first, then train',
  recovery_only: 'Recovery only — no training',
}

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Load plan + its associated check-in in one call
  const { data: plan } = await supabase
    .from('plans')
    .select('*, check_ins(gym_today, meals_so_far, calories_so_far, protein_so_far_g)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) notFound()

  const p        = plan as Plan & { check_ins: { gym_today: boolean; meals_so_far: string | null; calories_so_far: number | null; protein_so_far_g: number | null } | null }
  const checkIn  = p.check_ins
  const nutrition = p.nutrition_targets as NutritionTargets | null
  const fuelMeta  = p.fuel_status ? (FUEL_LABELS[p.fuel_status] ?? null) : null

  const isRecovery   = p.training_readiness === 'recovery_only'
  const eatFirst     = p.training_readiness === 'eat_first'
  const gymToday     = checkIn?.gym_today ?? true  // default to showing gym if unknown

  // When meals_so_far was provided, show numeric estimates from check-in baseline
  const hasMealContext     = !!(checkIn?.meals_so_far && checkIn.meals_so_far.trim().length > 5)
  const hasCheckInCalories = (checkIn?.calories_so_far ?? 0) > 0
  const hasCheckInProtein  = (checkIn?.protein_so_far_g ?? 0) > 0
  const showCheckInEstimate = hasMealContext || hasCheckInCalories || hasCheckInProtein

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">

      {/* Back nav */}
      <Link href="/home" className="mb-6 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300">
        ← Home
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
          {new Date(p.created_at).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {p.today_focus ?? `Day ${p.rotation_day}`}
        </h1>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Readiness ── */}
        {(p.fuel_status || p.training_readiness) && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">Readiness</p>
            <div className="flex flex-col gap-2">
              {fuelMeta && (
                <Row label="Fuel status">
                  <span className={`text-sm font-medium ${fuelMeta.color}`}>{fuelMeta.label}</span>
                </Row>
              )}
              {p.training_readiness && (
                <Row label="Training">
                  <span className="text-sm font-medium text-neutral-200">
                    {READINESS_LABELS[p.training_readiness] ?? p.training_readiness}
                  </span>
                </Row>
              )}
              {p.nutrition_gap && (
                <Row label="Nutrition gap">
                  <span className="text-sm font-medium text-neutral-200">
                    {p.nutrition_gap.replace(/_/g, ' ')}
                  </span>
                </Row>
              )}
            </div>
          </div>
        )}

        {/* ── Eat first — prominent, before anything else ── */}
        {eatFirst && p.what_to_eat_next && p.what_to_eat_next.length > 0 && (
          <div className="rounded-xl border border-orange-800 bg-orange-950/40 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-orange-400">
              Eat before training
            </p>
            <List items={p.what_to_eat_next} />
          </div>
        )}

        {/* ── Why today looks like this ── */}
        {p.reasoning_summary && (
          <Card label="Why today looks like this">
            <p className="text-sm leading-relaxed text-neutral-300">{p.reasoning_summary}</p>
          </Card>
        )}

        {/* ── Check-in food estimate — visible, numeric ── */}
        {showCheckInEstimate && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Estimated from check-in input
            </p>
            {hasMealContext && (
              <p className="mb-2 text-xs italic text-neutral-500 line-clamp-2">
                &quot;{checkIn!.meals_so_far}&quot;
              </p>
            )}
            <div className="flex gap-6">
              {hasCheckInCalories && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-neutral-500">Calories</span>
                  <span className="text-sm font-semibold">~{checkIn!.calories_so_far}</span>
                </div>
              )}
              {hasCheckInProtein && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-neutral-500">Protein</span>
                  <span className="text-sm font-semibold">~{checkIn!.protein_so_far_g}g</span>
                </div>
              )}
              {hasMealContext && !hasCheckInCalories && !hasCheckInProtein && (
                <p className="text-xs text-neutral-500">Meal description included in fuel assessment.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Mobility — always shown ── */}
        {p.mobility && p.mobility.length > 0 && (
          <Card label="Mobility">
            <List items={p.mobility} />
          </Card>
        )}

        {/* ── Workout — order and visibility based on gym_today + readiness ── */}
        {!isRecovery && gymToday && p.workout_gym && p.workout_gym.length > 0 && (
          <Card label="Gym workout">
            <List items={p.workout_gym} />
          </Card>
        )}

        {!isRecovery && !gymToday && p.workout_home && p.workout_home.length > 0 && (
          <Card label="Home workout">
            <List items={p.workout_home} />
          </Card>
        )}

        {/* Secondary workout option — shown smaller if available */}
        {!isRecovery && gymToday && p.workout_home && p.workout_home.length > 0 && (
          <details className="rounded-xl border border-neutral-800">
            <summary className="cursor-pointer px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-300">
              Home alternative
            </summary>
            <div className="px-4 pb-4">
              <List items={p.workout_home} />
            </div>
          </details>
        )}

        {!isRecovery && !gymToday && p.workout_gym && p.workout_gym.length > 0 && (
          <details className="rounded-xl border border-neutral-800">
            <summary className="cursor-pointer px-4 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-300">
              Gym alternative
            </summary>
            <div className="px-4 pb-4">
              <List items={p.workout_gym} />
            </div>
          </details>
        )}

        {/* ── Adjustment notes ── */}
        {p.adjustment_notes && p.adjustment_notes.length > 0 && (
          <Card label="Adjustments for today">
            <List items={p.adjustment_notes} />
          </Card>
        )}

        {/* ── Nutrition targets ── */}
        {nutrition && (
          <Card label="Nutrition targets">
            <div className="flex gap-6">
              <Stat label="Calories" value={String(nutrition.calories)} />
              <Stat label="Protein"  value={`${nutrition.proteinGrams}g`} />
            </div>
          </Card>
        )}

        {/* What to eat next — non-eat_first path */}
        {!eatFirst && p.what_to_eat_next && p.what_to_eat_next.length > 0 && (
          <Card label="What to eat next">
            <List items={p.what_to_eat_next} />
          </Card>
        )}

        {/* Food guidance */}
        {p.food_guidance && p.food_guidance.length > 0 && (
          <Card label="Food guidance">
            <List items={p.food_guidance} />
          </Card>
        )}

        {/* ── Coaching notes — visually lighter ── */}
        {p.coaching_notes && p.coaching_notes.length > 0 && (
          <div className="px-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-600">Coaching notes</p>
            <ul className="flex flex-col gap-1.5">
              {p.coaching_notes.map((note, i) => (
                <li key={i} className="flex gap-2 text-xs text-neutral-500">
                  <span className="shrink-0 text-neutral-700">–</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      <div className="mt-10 flex items-center gap-4">
        <Link href="/home"     className="text-sm text-neutral-500 hover:text-neutral-300">← Home</Link>
        <Link href="/check-in" className="text-sm text-neutral-500 hover:text-neutral-300">New check-in</Link>
      </div>
    </div>
  )
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-400">{label}</span>
      {children}
    </div>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-neutral-200">
          <span className="mt-0.5 shrink-0 text-neutral-600">–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  )
}
