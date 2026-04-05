import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { HistoryCategory } from '@/lib/types'

function deriveCategory(trainingReadiness: string | null): HistoryCategory {
  if (!trainingReadiness || trainingReadiness === 'recovery_only') return 'recovery'
  if (trainingReadiness === 'reduced' || trainingReadiness === 'eat_first') return 'reduced'
  return 'full_training'
}

const CATEGORY_BADGE: Record<HistoryCategory, { label: string; color: string }> = {
  full_training: { label: 'Full',     color: 'text-green-400  border-green-900  bg-green-950/40' },
  reduced:       { label: 'Reduced',  color: 'text-yellow-400 border-yellow-900 bg-yellow-950/40' },
  recovery:      { label: 'Recovery', color: 'text-neutral-400 border-neutral-700 bg-neutral-800' },
}

const FUEL_COLOR: Record<string, string> = {
  ready:                     'text-green-400',
  slightly_underfueled:      'text-yellow-400',
  significantly_underfueled: 'text-orange-400',
  recovery_only:             'text-red-400',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: plans } = await supabase
    .from('plans')
    .select('id, created_at, today_focus, rotation_day, fuel_status, training_readiness, reasoning_summary')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-neutral-400">Your recent training days.</p>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
          <p className="text-sm text-neutral-400">No history yet.</p>
          <p className="mt-1 text-xs text-neutral-600">Complete your first check-in to get started.</p>
          <Link
            href="/check-in"
            className="mt-4 inline-block text-sm text-neutral-300 underline underline-offset-4"
          >
            Start check-in
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {plans.map(plan => {
            const category = deriveCategory(plan.training_readiness)
            const badge    = CATEGORY_BADGE[category]
            const fuelColor = plan.fuel_status ? (FUEL_COLOR[plan.fuel_status] ?? 'text-neutral-400') : null
            const dateLabel = new Date(plan.created_at).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            })
            const title = plan.today_focus ?? `Day ${plan.rotation_day}`

            return (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-600"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-neutral-500">{dateLabel}</p>
                  <p className="text-sm font-medium text-neutral-100 truncate">{title}</p>
                  {plan.fuel_status && fuelColor && (
                    <p className={`text-xs ${fuelColor}`}>
                      {plan.fuel_status.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-xs text-neutral-600">Day {plan.rotation_day}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
