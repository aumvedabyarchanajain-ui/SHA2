'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles,
  Printer,
  ShieldCheck,
  Video,
  ExternalLink
} from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const simulated = searchParams.get('simulated') === 'true'

  return (
    <div className="min-h-screen bg-stone-50/40 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold uppercase tracking-widest text-[10px]">
              Payment Confirmed & Verified
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
              Your Sacred Order is Confirmed
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Gratitude for connecting with the Aumveda Sanctuary. Your order has been registered and our Jaipur altar team is preparing your consecration package.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-xs">
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Reference</p>
                <p className="font-mono text-lg font-bold text-slate-900">#{orderId || 'AUM-CONFIRMED'}</p>
              </div>

              <Badge className="bg-slate-900 text-amber-300 border-none font-bold text-xs">
                Easebuzz HMAC-SHA256 Verified
              </Badge>
            </div>

            {/* Google Meet & Session details if consultation */}
            <div className="bg-gradient-to-r from-slate-900 to-stone-900 rounded-2xl p-6 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Google Calendar Workspace Sync
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Calendar Invite Sent
                </Badge>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-white">
                  1:1 Clinical Consultation Access
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your automated Astrological & Somatic Pre-Session Brief is being compiled for Archana & Sejal. The Google Meet link has been generated and sent to your email.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button
                  size="sm"
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  <Link href="/dashboard/bookings">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> View Session in Dashboard
                  </Link>
                </Button>
              </div>
            </div>

            {/* Crystal Activation Protocol Callout */}
            <div className="bg-amber-50/70 rounded-2xl p-6 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Prana Pratishtha Activation Guide
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-xl border-amber-300 text-amber-900 hover:bg-amber-100/60 text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print Protocol
                </Button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Your crystal has been energized on the Jaipur Vedic altar with Surya-Chandra mantras. Access your interactive 3-step consecration guide anytime from your user portal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="bg-slate-900 hover:bg-black rounded-2xl h-12 px-6 font-bold shadow-lg">
            <Link href="/dashboard">
              Go to User Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl h-12 px-6 font-bold border-slate-200">
            <Link href="/shop">Explore More Crystals</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
