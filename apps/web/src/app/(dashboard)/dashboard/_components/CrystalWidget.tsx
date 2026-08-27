'use client'

import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import type { ProductView } from '@/lib/product-types'
import { useCart } from '@/lib/cart'
import { useCartDrawer } from '@/components/cart/CartDrawer'
import { showSuccess } from '@/utils/toast'

interface Props {
  chakra: string
  products: ProductView[]
}

/** Small chakra-matched crystal cross-sell — answers "what does my chakra need this week?" */
export default function CrystalWidget({ chakra, products }: Props) {
  const { addItem } = useCart()
  const { openCart } = useCartDrawer()

  if (products.length === 0) return null

  const chakraLabel = chakra.replace(/_/g, ' ')

  const handleQuickAdd = (e: React.MouseEvent, p: ProductView) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      productId: p.id,
      slug: p.slug,
      title: p.title,
      priceCents: p.priceCents,
      compareAtPriceCents: p.compareAtPriceCents,
      imageUrl: p.imageUrl,
      inventoryCount: p.inventoryCount,
      productType: p.productType,
      bundle: null,
    })

    showSuccess(`Added ${p.title} to your Sacred Cart`)
    openCart()
  }

  return (
    <section className="space-y-4 border-t border-[hsl(var(--av-stone))] pt-12">
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          This week your <span className="capitalize font-semibold">{chakraLabel}</span> needs
        </p>
        <Link
          href="/shop"
          className="font-body text-sm text-[hsl(var(--av-night))] underline underline-offset-4 decoration-[hsl(var(--av-stone))] hover:decoration-[hsl(var(--av-gold))]"
        >
          Shop all crystals
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="group relative flex items-center justify-between gap-4 rounded-2xl border border-[hsl(var(--av-stone))] bg-white/40 p-4 transition-all duration-300 hover:border-[hsl(var(--av-gold))] hover:shadow-sm"
          >
            <Link
              href={`/shop/${p.slug}`}
              className="flex items-center gap-3.5 min-w-0 flex-1"
            >
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="h-16 w-16 rounded-xl object-cover shrink-0 border border-[hsl(var(--av-stone))]"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-[hsl(var(--av-parchment))] shrink-0 border border-[hsl(var(--av-stone))]" />
              )}
              <div className="min-w-0 space-y-1">
                <p className="font-serif text-base text-[hsl(var(--av-night))] group-hover:text-[hsl(var(--av-gold))] transition-colors truncate">
                  {p.title}
                </p>
                <p className="font-mono text-sm tabular text-[hsl(var(--av-mute))]">
                  ₹{p.priceInr.toLocaleString('en-IN')}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={(e) => handleQuickAdd(e, p)}
              aria-label={`Add ${p.title} to cart`}
              className="p-2.5 rounded-xl bg-[hsl(var(--av-night))] text-[hsl(var(--av-gold-soft))] hover:bg-[hsl(var(--av-ink))] hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
