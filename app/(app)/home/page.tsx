import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Plan, HistoryCategory } from '@/lib/types'

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
  recovery_only: 'Recovery only',
}

function deriveCategory(trainingReadiness: string | null): HistoryCategory {
  if (!trainingReadiness || trainingReadiness === 'recovery_only') return 'recovery'
  if (trainingReadiness === 'reduced' || trainingReadiness === 'eat_first') return 'reduced'
  return 'full_training'
}

function deriveNextAction(opts: {
  hasCheckInToday: boolean
  trainingReadiness: string | null
  nutritionGap: string | null
  rotationDay: string
}): string {
  if (!opts.hasCheckInToday) return 'Start today\'s check-in to generate your plan.'
  if (opts.trainingReadiness === 'recovery_only') return 'Recovery day — focus on mobility, food, and rest.'
  if (opts.trainingReadiness === 'eat_first') return 'Eat a solid meal before training today.'
  if (opts.nutritionGap === 'far_behind') return 'Nutrition is behind — prioritize protein at your next meal.'
  if (opts.nutritionGap === 'behind') return 'Keep fueling consistently — you\'re slightly behind on intake.'
  return 'You\'re on track. Check your plan and get moving.'
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  // Run queries in parallel
  const [profileRes, latestPlanRes, todayCheckInRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('current_rotation_day, goal, weight_lbs, onboarding_completed_at')
      .eq('id', user.id)
      .single(),

    supabase
      .from('plans')
      .select('id, created_at, today_focus, rotation_day, fuel_status, training_readiness, nutrition_gap, reasoning_summary')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('check_ins')
      .select('id, date, energy_level, gym_today')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle(),
  ])

  const profile      = profileRes.data
  const latestPlan   = latestPlanRes.data as Plan | null
  const todayCheckIn = todayCheckInRes.data

  const hasCheckInToday    = !!todayCheckIn
  const planIsToday        = latestPlan
    ? new Date(latestPlan.created_at).toISOString().split('T')[0] === today
    : false

  const rotationDay    = profile?.current_rotation_day ?? 'A'
  const fuelMeta       = latestPlan?.fuel_status ? FUEL_LABELS[latestPlan.fuel_status] : null
  const readinessLabel = latestPlan?.training_readiness
    ? READINESS_LABELS[latestPlan.training_readiness]
    : null
  const category       = latestPlan ? deriveCategory(latestPlan.training_readiness) : null

  const nextAction = deriveNextAction({
    hasCheckInToday,
    trainingReadiness: latestPlan?.training_readiness ?? null,
    nutritionGap:      latestPlan?.nutrition_gap ?? null,
    rotationDay,
  })

  const CATEGORY_BADGE: Record<HistoryCategory, { label: string; color: string }> = {
    full_training: { label: 'Full training', color: 'text-green-400 bg-green-950/50 border-green-900' },
    reduced:       { label: 'Reduced',       color: 'text-yellow-400 bg-yellow-950/50 border-yellow-900' },
    recovery:      { label: 'Recovery',      color: 'text-neutral-400 bg-neutral-800 border-neutral-700' },
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Body OS</h1>
        {profile?.goal && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-1">{profile.goal}</p>
        )}
      </div>

      <div className="flex flex-col gap-4">

        {/* ── Today status — most prominent section ── */}
        {latestPlan && planIsToday ? (
          <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Today</p>
              {category && (
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[category].color}`}>
                  {CATEGORY_BADGE[category].label}
                </span>
              )}
            </div>

            <p className="mb-3 text-base font-semibold">
              {latestPlan.today_focus ?? `Day ${latestPlan.rotation_day}`}
            </p>

            <div className="flex flex-col gap-2">
              {fuelMeta && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Fuel status</span>
                  <span className={`text-sm font-medium ${fuelMeta.color}`}>{fuelMeta.label}</span>
                </div>
              )}
              {readinessLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Training</span>
                  <span className="text-sm font-medium text-neutral-200">{readinessLabel}</span>
                </div>
              )}
              {latestPlan.nutrition_gap && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Nutrition</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {latestPlan.nutrition_gap.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link
                href={`/plan/${latestPlan.id}`}
                className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90"
              >
                Open today&apos;s plan
              </Link>
            </div>
          </div>
        ) : latestPlan ? (
          /* Has a plan but it's from a previous day */
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
              Last plan — {new Date(latestPlan.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="mb-3 text-sm text-neutral-300">
              {latestPlan.today_focus ?? `Day ${latestPlan.rotation_day}`}
            </p>
            <p className="text-xs text-neutral-500">No plan generated yet today.</p>
          </div>
        ) : (
          /* No plans at all */
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-sm text-neutral-400">No plan yet. Start with your first check-in below.</p>
          </div>
        )}

        {/* ── Next action — always visible ── */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">Next step</p>
          <p className="text-sm text-neutral-200">{nextAction}</p>
        </div>

        {/* ── Upcoming rotation ── */}
        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Next rotation</p>
            <p className="mt-1 text-sm text-neutral-200">
              Day {rotationDay} — {ROTATION_NAMES[rotationDay] ?? 'Training'}
            </p>
          </div>
          {!hasCheckInToday && (
            <span className="text-xs text-neutral-600">pending check-in</span>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 gap-2">
          <QuickLink href="/check-in"  label={hasCheckInToday ? 'Update check-in' : 'Start check-in'} primary={!hasCheckInToday} />
          <QuickLink href="/nutrition" label="Nutrition check" />
          <QuickLink href="/history"   label="View history" />
          <QuickLink href="/profile"   label="Edit profile" />
        </div>

      </div>
    </div>
  )
}

const ROTATION_NAMES: Record<string, string> = {
  A: 'Push',
  B: 'Lower + Core',
  C: 'Pull',
  D: 'Recovery / Mobility',
}

function QuickLink({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
        primary
          ? 'border-white bg-white text-neutral-950 hover:opacity-90'
          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100'
      }`}
    >
      {label}
    </Link>
  )
}
