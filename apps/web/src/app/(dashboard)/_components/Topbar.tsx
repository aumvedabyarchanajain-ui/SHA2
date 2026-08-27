'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ShoppingBag, Sparkles } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useCartDrawer } from '@/components/cart/CartDrawer'

interface TopbarProps {
  title?: string
}

export default function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession()
  const { totalItems } = useCart()
  const { openCart } = useCartDrawer()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = session?.user?.name?.split(' ')[0] ?? 'friend'

  return (
    <header className="sticky top-0 z-20 bg-[hsl(var(--av-parchment)/0.92)] backdrop-blur-md border-b border-[hsl(var(--av-stone))] px-6 h-14 md:h-16 flex items-center justify-between">
      <div>
        {title ? (
          <h1 className="font-serif text-lg text-[hsl(var(--av-night))]">{title}</h1>
        ) : (
          <p className="font-body text-sm text-[hsl(var(--av-mute))]">
            {greeting},{' '}
            <span className="text-[hsl(var(--av-night))] font-medium">{first}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/shop"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs text-[hsl(var(--av-mute))] hover:text-[hsl(var(--av-night))] hover:bg-[hsl(var(--av-stone)/0.5)] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--av-gold))]" />
          <span>Sanctuary Shop</span>
        </Link>

        {/* Cart Drawer Trigger */}
        <button
          type="button"
          onClick={openCart}
          aria-label={`Open Sacred Cart, ${totalItems} items`}
          className="relative p-2 rounded-full text-[hsl(var(--av-night))] hover:text-[hsl(var(--av-gold))] hover:bg-[hsl(var(--av-stone)/0.5)] transition-all duration-200 cursor-pointer flex items-center justify-center"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] text-[10px] font-mono font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50">
              {totalItems}
            </span>
          )}
        </button>

        {(session?.user?.role === 'practitioner' ||
          session?.user?.role === 'admin' ||
          session?.user?.role === 'super_admin') && (
          <Link
            href="/practitioner"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold bg-[hsl(var(--av-gold)/0.15)] text-[hsl(var(--av-night))] border border-[hsl(var(--av-gold)/0.3)] hover:bg-[hsl(var(--av-gold)/0.25)] transition-colors"
          >
            <span>Coach Portal</span>
            <span>→</span>
          </Link>
        )}
        <Link
          href="/dashboard/settings"
          aria-label="Settings"
          className="w-9 h-9 rounded-full bg-[hsl(var(--av-night))] text-[hsl(var(--av-gold-soft))] flex items-center justify-center font-body text-sm hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--av-gold))]"
        >
          {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
        </Link>
      </div>
    </header>
  )
}
