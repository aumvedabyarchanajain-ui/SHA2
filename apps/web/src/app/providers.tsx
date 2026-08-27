'use client'

import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/lib/cart'
import { CartDrawerProvider } from '@/components/cart/CartDrawer'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <CartDrawerProvider>
          {children}
        </CartDrawerProvider>
      </CartProvider>
    </SessionProvider>
  )
}

