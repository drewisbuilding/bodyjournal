'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    router.refresh()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Body OS</h1>
        <p className="mb-8 text-sm text-neutral-400">
          {mode === 'signin' ? 'Sign in to continue.' : 'Create your account.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(null) }}
          className="mt-5 text-sm text-neutral-500 hover:text-neutral-300"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
