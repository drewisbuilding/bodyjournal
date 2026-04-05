'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/home',      label: 'Home' },
  { href: '/check-in',  label: 'Check-in' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/history',   label: 'History' },
  { href: '/profile',   label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center py-3 text-xs transition-colors ${
                active
                  ? 'font-semibold text-white underline underline-offset-4 decoration-neutral-500'
                  : 'font-normal text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
