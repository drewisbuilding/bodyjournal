import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Plan, NutritionTargets } from '@/lib/types'

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: plan } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) notFound()

  const p = plan as Plan
  const nutrition = p.nutrition_targets as NutritionTargets | null

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-neutral-500">
          {new Date(p.created_at).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {p.today_focus ?? `Day ${p.rotation_day}`}
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Mobility */}
        {p.mobility && p.mobility.length > 0 && (
          <Card label="Mobility">
            <List items={p.mobility} />
          </Card>
        )}

        {/* Workout */}
        {p.workout_gym && p.workout_gym.length > 0 && (
          <Card label="Gym workout">
            <List items={p.workout_gym} />
          </Card>
        )}

        {p.workout_home && p.workout_home.length > 0 && (
          <Card label="Home workout">
            <List items={p.workout_home} />
          </Card>
        )}

        {/* Nutrition */}
        {nutrition && (
          <Card label="Nutrition targets">
            <div className="flex gap-6">
              <Stat label="Calories" value={String(nutrition.calories)} />
              <Stat label="Protein" value={`${nutrition.proteinGrams}g`} />
            </div>
          </Card>
        )}

        {/* Food guidance */}
        {p.food_guidance && p.food_guidance.length > 0 && (
          <Card label="Food guidance">
            <List items={p.food_guidance} />
          </Card>
        )}

        {/* Coaching notes */}
        {p.coaching_notes && p.coaching_notes.length > 0 && (
          <Card label="Coaching notes">
            <List items={p.coaching_notes} />
          </Card>
        )}
      </div>

      <div className="mt-10">
        <Link
          href="/check-in"
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-300"
        >
          ← Back to check-in
        </Link>
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
