'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Primary tabs — scrollable so all Phase-1 destinations fit on small screens */
const TAB_ITEMS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/dose', label: 'Dose' },
  { href: '/dashboard/check-in', label: 'Check-in' },
  { href: '/dashboard/homework', label: 'Practice' },
  { href: '/dashboard/journal', label: 'Journal' },
  { href: '/dashboard/progress', label: 'Progress' },
  { href: '/dashboard/journey', label: 'Journey' },
  { href: '/dashboard/appointments', label: 'Sessions' },
  { href: '/shop', label: 'Shop' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[hsl(var(--av-parchment)/0.96)] backdrop-blur-md border-t border-[hsl(var(--av-stone))] px-1 pb-safe"
      aria-label="Primary"
    >
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
        {TAB_ITEMS.map(({ href, label }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-h-[52px] min-w-[68px] shrink-0 py-2 px-1.5 font-body text-[10px] tracking-wide transition-colors ${
                active
                  ? 'text-[hsl(var(--av-night))]'
                  : 'text-[hsl(var(--av-mute))]'
              }`}
            >
              {active && (
                <span
                  className="w-1 h-1 rounded-full bg-[hsl(var(--av-gold))] mb-1"
                  aria-hidden
                />
              )}
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
