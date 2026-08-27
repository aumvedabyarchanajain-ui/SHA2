'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/dose', label: 'Dose' },
  { href: '/dashboard/check-in', label: 'Check-in' },
  { href: '/dashboard/homework', label: 'Practice' },
  { href: '/dashboard/journal', label: 'Journal' },
  { href: '/dashboard/progress', label: 'Progress' },
  { href: '/dashboard/journey', label: 'Journey' },
  { href: '/dashboard/appointments', label: 'Sessions' },
  { href: '/courses', label: 'Academy' },
  { href: '/shop', label: 'Sanctuary Shop' },
  { href: '/community', label: 'Community' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-[hsl(var(--av-parchment))] border-r border-[hsl(var(--av-stone))] py-8 px-4 fixed top-0 left-0 z-30">
      <Link
        href="/dashboard"
        className="px-3 mb-10 font-serif text-xl text-[hsl(var(--av-night))] tracking-tight"
      >
        AUMVEDA
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Dashboard">
        {NAV_ITEMS.map(({ href, label }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2.5 rounded-xl font-body text-sm transition-colors ${
                active
                  ? 'bg-[hsl(var(--av-night))] text-[hsl(var(--av-gold-soft))]'
                  : 'text-[hsl(var(--av-mute))] hover:text-[hsl(var(--av-night))] hover:bg-[hsl(40_40%_97%)]'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[hsl(var(--av-stone))] pt-4 mt-4 space-y-1">
        <p className="px-3 font-body text-sm text-[hsl(var(--av-night))] truncate">
          {session?.user?.name ?? 'You'}
        </p>

        {(session?.user?.role === 'practitioner' ||
          session?.user?.role === 'admin' ||
          session?.user?.role === 'super_admin') && (
          <Link
            href="/practitioner"
            className="flex items-center justify-between px-3 py-2 rounded-xl font-body text-xs font-semibold bg-[hsl(var(--av-gold)/0.15)] text-[hsl(var(--av-night))] border border-[hsl(var(--av-gold)/0.3)] hover:bg-[hsl(var(--av-gold)/0.25)] transition-colors"
          >
            <span>Coach Workspace</span>
            <span>→</span>
          </Link>
        )}

        <Link
          href="/dashboard/settings"
          className="block px-3 py-2 rounded-xl font-body text-sm text-[hsl(var(--av-mute))] hover:text-[hsl(var(--av-night))]"
        >
          Settings
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="w-full text-left px-3 py-2 rounded-xl font-body text-sm text-[hsl(var(--av-mute))] hover:text-[hsl(var(--av-rose))]"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
