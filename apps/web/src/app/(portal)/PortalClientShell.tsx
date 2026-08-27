'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { PortalProvider } from '@/portal/engine/PortalProvider'
import { RedirectGuard } from '@/portal/engine/PortalRouter'
import { usePortal } from '@/portal/engine/PortalContext'

const STEP_LABELS = ['Breathe', 'Chakra', 'Archetype', 'Tarot', 'Intention', 'Constellation', 'Pattern', 'Book']

export function PortalClientShell({ children }: { children: ReactNode }) {
  return (
    <PortalProvider>
      <ShellFrame>
        <RedirectGuard>{children}</RedirectGuard>
      </ShellFrame>
    </PortalProvider>
  )
}

function ShellFrame({ children }: { children: ReactNode }) {
  const { state } = usePortal()

  return (
    <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] relative overflow-x-hidden">
      {/* Ambient subtle candle warmth */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse_at_top,hsl(var(--av-gold)/0.07),transparent_70%)] pointer-events-none z-0" />

      <nav aria-label="Portal progress" className="fixed left-0 right-0 top-0 z-50 px-6 py-5 bg-[hsl(var(--av-ink)/0.8)] backdrop-blur-md border-b border-[hsl(var(--av-parchment)/0.06)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-6">
          <div className="flex-1">
            <div
              className="flex items-center gap-1.5"
              role="progressbar"
              aria-valuenow={state.currentStep}
              aria-valuemin={1}
              aria-valuemax={8}
              aria-valuetext={`Step ${state.currentStep} of 8: ${STEP_LABELS[state.currentStep - 1] ?? ''}`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    i <= state.currentStep
                      ? 'bg-[hsl(var(--av-gold))] shadow-[0_0_8px_rgba(201,168,76,0.5)]'
                      : 'bg-[hsl(var(--av-parchment)/0.12)]'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <ol className="mt-1.5 flex justify-between px-0.5">
              {STEP_LABELS.map((label, i) => (
                <li
                  key={label}
                  className={`text-[9px] uppercase tracking-[0.18em] font-body transition-colors ${
                    i + 1 === state.currentStep
                      ? 'text-[hsl(var(--av-gold-soft))] font-medium'
                      : i + 1 < state.currentStep
                        ? 'text-[hsl(var(--av-gold)/0.6)]'
                        : 'text-[hsl(var(--av-parchment)/0.25)]'
                  }`}
                  aria-current={i + 1 === state.currentStep ? 'step' : undefined}
                >
                  {label}
                </li>
              ))}
            </ol>
          </div>

          <Link
            href="/"
            className="flex-shrink-0 font-body text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--av-parchment)/0.5)] hover:text-[hsl(var(--av-gold-soft))] transition-colors flex items-center gap-1"
          >
            <span>Skip to Home</span>
            <span className="text-[hsl(var(--av-gold))]">→</span>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 pt-20 pb-12">
        {children}
      </div>

      <footer className="relative z-10 py-6 border-t border-[hsl(var(--av-parchment)/0.06)] text-center">
        <p className="font-body text-[11px] tracking-[0.08em] text-[hsl(var(--av-parchment)/0.4)]">
          100% Private & Confidential · Guided by Archana & Sejal Jain (Jaipur · Mumbai)
        </p>
      </footer>
    </div>
  )
}

