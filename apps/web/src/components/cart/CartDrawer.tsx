'use client'

import React, { createContext, useContext, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/cart'
import { showSuccess } from '@/utils/toast'

interface CartDrawerContextType {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartDrawerContext = createContext<CartDrawerContextType>({
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
})

export const useCartDrawer = () => useContext(CartDrawerContext)

export function CartDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleCart = () => setIsOpen(prev => !prev)

  return (
    <CartDrawerContext.Provider value={{ isOpen, openCart, closeCart, toggleCart }}>
      {children}
      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </CartDrawerContext.Provider>
  )
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const { items, totalCents, totalItems, updateQuantity, removeItem, addItem } = useCart()

  if (!isOpen) return null

  const subtotalInr = totalCents / 100
  const freeShippingThreshold = 1499
  const freeShippingProgress = Math.min(100, Math.round((subtotalInr / freeShippingThreshold) * 100))
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalInr)

  const handleAddSeleniteCrossSell = () => {
    addItem({
      productId: 9 as any,
      slug: 'raw-moroccan-selenite-sacred-charging-plate-altar-base',
      title: 'Raw Moroccan Selenite Charging Plate',
      priceCents: 139900,
      compareAtPriceCents: 269900,
      imageUrl: 'https://astrotalk.store/cdn/shop/files/1_670fca98-e011-4412-8c9c-f56fa5d8e960.webp?v=1769072419',
      inventoryCount: 40,
      productType: 'physical',
      bundle: null,
    })
    showSuccess('Selenite Charging Plate added to cart!')
  }

  const handleCheckoutClick = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[hsl(var(--av-ink)/0.75)] backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-parchment texture-paper border-l border-stone shadow-2xl flex flex-col text-ink-text">
          {/* Header */}
          <div className="p-6 border-b border-stone flex items-center justify-between bg-parchment">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-night text-gold-soft flex items-center justify-center border border-[hsl(var(--av-parchment)/0.15)] shadow-xs">
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-normal text-night tracking-tight">Your Sanctuary Cart</h2>
                <p className="text-xs text-mute font-body">{totalItems} {totalItems === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg text-mute hover:text-night hover:bg-stone/50">
              <X className="w-5 h-5 stroke-[1.5]" />
            </Button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-card p-4 border-b border-stone">
            <div className="flex items-center justify-between text-xs font-body text-night mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-gold" />
                {freeShippingProgress >= 100
                  ? 'Complimentary Express Sanctuary Delivery across India'
                  : `Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more for Complimentary Delivery`}
              </span>
              <span className="font-mono text-[11px] font-medium">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-stone h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gold h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-14 h-14 rounded-full bg-card border border-stone flex items-center justify-center mx-auto text-gold">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-lg font-normal text-night">Your cart is empty</h3>
                <p className="text-xs text-mute max-w-xs mx-auto font-body leading-relaxed">
                  Explore consecrated crystals and 1:1 clinical sessions to accelerate your healing journey.
                </p>
                <Button
                  onClick={onClose}
                  asChild
                  className="bg-night hover:bg-ink text-gold-soft rounded-full font-body text-xs tracking-wider uppercase px-6 h-10 border border-[hsl(var(--av-gold)/0.3)] shadow-xs transition-transform active:scale-[0.98]"
                >
                  <Link href="/shop">Explore Sanctuary Store</Link>
                </Button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.productId}
                  className="bg-card rounded-xl p-4 border border-stone shadow-xs flex gap-4 items-center hover:border-[hsl(var(--av-gold)/0.4)] transition-all"
                >
                  <div className="w-16 h-16 rounded-lg bg-stone/40 overflow-hidden shrink-0 border border-stone">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-mute">
                        <Package className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.slug || ''}`}
                      onClick={onClose}
                      className="font-serif text-sm font-normal text-night truncate block hover:text-gold transition-colors"
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-night tabular-nums">
                        ₹{(item.priceCents / 100).toLocaleString('en-IN')}
                      </span>
                      {item.compareAtPriceCents && (
                        <span className="font-mono text-[11px] text-mute line-through tabular-nums">
                          ₹{(item.compareAtPriceCents / 100).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {item.bundle && (
                      <span className="inline-block text-[9px] font-body uppercase tracking-wider text-gold bg-night px-2 py-0.5 rounded-full mt-1">
                        + {item.bundle.sessionLabel}
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-parchment p-1 rounded-lg border border-stone">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-5 h-5 rounded bg-card flex items-center justify-center text-mute hover:text-night transition-colors"
                    >
                      <Minus className="w-3 h-3 stroke-[1.5]" />
                    </button>
                    <span className="font-mono text-xs font-medium text-night w-4 text-center tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-5 h-5 rounded bg-card flex items-center justify-center text-mute hover:text-night transition-colors"
                    >
                      <Plus className="w-3 h-3 stroke-[1.5]" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-mute/60 hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              ))
            )}

            {/* Selenite Cross-sell Upsell */}
            {items.length > 0 && !items.some(i => String(i.productId).includes('9') || i.title.toLowerCase().includes('selenite')) && (
              <div className="bg-card p-4 rounded-xl border border-[hsl(var(--av-gold)/0.3)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-body uppercase tracking-[0.2em] text-gold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Recommended Cleansing Base
                  </span>
                  <span className="text-[10px] font-body font-medium text-sage">Sacred Sanctuary Essential</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-serif text-night">Raw Moroccan Selenite Plate</p>
                    <p className="font-mono text-xs text-night font-bold tabular-nums">₹1,399 <span className="text-mute font-normal line-through">₹2,699</span></p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddSeleniteCrossSell}
                    className="h-8 rounded-full bg-night hover:bg-ink text-gold-soft text-xs font-body tracking-wider uppercase px-4 border border-[hsl(var(--av-gold)/0.3)] shadow-xs transition-transform active:scale-[0.98]"
                  >
                    + Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone bg-card space-y-4">
              <div className="space-y-1.5 text-xs text-mute font-body">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-night tabular-nums">₹{subtotalInr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Sacred Consecration:</span>
                  <span className="text-sage font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-mono font-bold text-night tabular-nums">
                    {subtotalInr >= freeShippingThreshold ? 'Complimentary' : '₹99'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif text-night pt-2 border-t border-stone">
                  <span>Total Investment:</span>
                  <span className="font-mono font-bold text-night tabular-nums">
                    ₹{(subtotalInr + (subtotalInr >= freeShippingThreshold ? 0 : 99)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckoutClick}
                className="w-full h-12 rounded-full bg-gold hover:bg-gold-soft text-ink font-body text-xs font-medium uppercase tracking-[0.14em] shadow-sm hover:shadow-[0_4px_14px_rgba(201,168,76,0.35)] flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
              >
                Proceed to Secure Checkout
                <ArrowRight className="w-4 h-4 text-ink group-hover:translate-x-0.5 transition-transform" />
              </Button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-mute font-body pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage" /> 256-Bit Encrypted
                </span>
                <span>&bull;</span>
                <span>100% Certified Consecrated Crystals</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

