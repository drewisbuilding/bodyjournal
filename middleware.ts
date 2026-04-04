import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Not logged in → force to login
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in but on login page → redirect into app
  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed_at')
      .eq('id', user.id)
      .single()

    const destination = profile?.onboarding_completed_at ? '/check-in' : '/onboarding'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Logged in, not on login, check if onboarding is needed
  if (user && pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed_at')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_completed_at) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
