import { createClient } from './supabase/client'
import type { BehaviorEventName } from './types'

export async function logEvent(
  eventName: BehaviorEventName,
  metadata?: Record<string, unknown>
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase.from('behavior_events').insert({
    user_id: user.id,
    event_name: eventName,
    metadata: metadata ?? null,
  })
}
