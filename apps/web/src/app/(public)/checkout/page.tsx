'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Loader2,
  Package,
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  Sparkles,
  CalendarCheck
} from 'lucide-react'
import { showError, showSuccess } from '@/utils/toast'
import { useCart } from '@/lib/cart'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalCents, totalItems, updateQuantity, removeItem, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [gatewayPreference, setGatewayPreference] = useState<'AUTO' | 'PRIMARY' | 'SECONDARY'>('AUTO')

  const [form, setForm] = useState({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  // Calculate pricing breakdown
  const subtotalInr = totalCents / 100
  const hasPhysical = items.some(i => i.productType !== 'service' && i.productType !== 'course')
  const shippingInr = (hasPhysical && subtotalInr < 1499) ? 99 : 0

  // Estimated GST (3% on crystals, 18% on consultations/courses)
  const estimatedTaxInr = items.reduce((sum, i) => {
    const rate = (i.productType === 'service' || i.productType === 'course') ? 0.18 : 0.03
    return sum + (i.priceCents * i.quantity / 100) * rate
  }, 0)

  const totalPayableInr = subtotalInr + shippingInr + Math.round(estimatedTaxInr)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      showError('Your cart is empty')
      return
    }

    if (!form.customerEmail) {
      showError('Please provide your email for order confirmation')
      return
    }

    if (hasPhysical && (!form.fullName || !form.addressLine1 || !form.city || !form.state || !form.pincode)) {
      showError('Please fill in your complete shipping address')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            slug: i.slug,
            title: i.title,
            quantity: i.quantity,
            priceCents: i.priceCents,
            productType: i.productType || 'physical',
          })),
          customerEmail: form.customerEmail,
          customerName: form.customerName || form.fullName,
          customerPhone: form.customerPhone || form.phone,
          gatewayPreference,
          shippingAddress: hasPhysical ? {
            fullName: form.fullName || form.customerName,
            phone: form.phone || form.customerPhone,
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2 || undefined,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: 'India',
          } : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout initiation failed')

      if (data.paymentUrl) {
        clearCart()
        window.location.href = data.paymentUrl
        return
      }

      clearCart()
      router.push(`/checkout/confirmation?orderId=${data.orderId || data.orderNumber}`)
    } catch (err: any) {
      showError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-amber-500">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Your cart is empty</h1>
          <p className="text-slate-500">Explore our consecrated healing crystals and 1:1 clinical sessions.</p>
          <Button asChild className="bg-slate-900 hover:bg-black rounded-xl font-bold">
            <Link href="/shop">Browse Crystal Sanctuary</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50/40 pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild className="rounded-xl">
            <Link href="/shop"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop</Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Unified Sacred Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Form: Contact & Shipping */}
            <div className="lg:col-span-7 space-y-6">
              {/* Contact Information */}
              <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-xs">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    1. Contact & Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="customerEmail" className="text-xs font-bold uppercase tracking-wider text-slate-600">Email Address *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        required
                        value={form.customerEmail}
                        onChange={e => update('customerEmail', e.target.value)}
                        placeholder="you@example.com"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="customerName" className="text-xs font-bold uppercase tracking-wider text-slate-600">Full Name *</Label>
                      <Input
                        id="customerName"
                        required
                        value={form.customerName}
                        onChange={e => update('customerName', e.target.value)}
                        placeholder="Your full name"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customerPhone" className="text-xs font-bold uppercase tracking-wider text-slate-600">WhatsApp / Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      required
                      value={form.customerPhone}
                      onChange={e => update('customerPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="rounded-xl"
                    />
                    <p className="text-[11px] text-slate-400">Used for courier tracking updates and Google Meet link SMS/WhatsApp alerts.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address (if physical crystals included) */}
              {hasPhysical && (
                <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-xs">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-600" /> 2. Delivery Address (India)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-600">Recipient Name *</Label>
                      <Input
                        id="fullName"
                        required={hasPhysical}
                        value={form.fullName}
                        onChange={e => update('fullName', e.target.value)}
                        placeholder="Recipient full name"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="addressLine1" className="text-xs font-bold uppercase tracking-wider text-slate-600">Street Address *</Label>
                      <Input
                        id="addressLine1"
                        required={hasPhysical}
                        value={form.addressLine1}
                        onChange={e => update('addressLine1', e.target.value)}
                        placeholder="House / Flat No., Building, Street"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="addressLine2" className="text-xs font-bold uppercase tracking-wider text-slate-600">Apartment, Landmark, Suite</Label>
                      <Input
                        id="addressLine2"
                        value={form.addressLine2}
                        onChange={e => update('addressLine2', e.target.value)}
                        placeholder="Near landmark"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-600">City *</Label>
                        <Input
                          id="city"
                          required={hasPhysical}
                          value={form.city}
                          onChange={e => update('city', e.target.value)}
                          placeholder="Mumbai"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-slate-600">State *</Label>
                        <Input
                          id="state"
                          required={hasPhysical}
                          value={form.state}
                          onChange={e => update('state', e.target.value)}
                          placeholder="Maharashtra"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-wider text-slate-600">PIN Code *</Label>
                        <Input
                          id="pincode"
                          required={hasPhysical}
                          value={form.pincode}
                          onChange={e => update('pincode', e.target.value)}
                          placeholder="400001"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Gateway Routing */}
              <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-xs">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3. Payment Gateway Routing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                    <CreditCard className="w-5 h-5 text-amber-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">Easebuzz Dual Payment Gateway</p>
                      <p className="text-[11px] text-slate-500">Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking with HMAC-SHA256 verification.</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white border-none text-[9px] font-black shrink-0">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Summary: Order Review & Total */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-sm sticky top-28">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Order Summary ({totalItems} items)
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Items List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map(item => (
                      <div key={item.productId} className="flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400">Qty: {item.quantity} &bull; ₹{(item.priceCents / 100).toLocaleString('en-IN')} each</p>
                        </div>
                        <span className="font-black text-slate-900 shrink-0">
                          ₹{((item.priceCents * item.quantity) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Calculations */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-900">₹{subtotalInr.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>GST (3% Crystals / 18% Consultations):</span>
                      <span className="font-bold text-slate-900">₹{Math.round(estimatedTaxInr).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Express Shipping (India):</span>
                      <span className="font-bold text-slate-900">
                        {shippingInr === 0 ? 'FREE' : `₹${shippingInr}`}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-base font-black text-slate-900 pt-1">
                      <span>Total Payable:</span>
                      <span className="text-amber-700 text-lg">
                        ₹{totalPayableInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-amber-400 font-black text-base shadow-xl flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Routing to Easebuzz...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-amber-400" /> Pay ₹{totalPayableInr.toLocaleString('en-IN')} via Easebuzz
                      </>
                    )}
                  </Button>

                  <div className="flex flex-col items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>HMAC-SHA256 Verified Payment Gateways</span>
                    </div>
                    <span>Includes instant digital activation guide & Google Calendar sync</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
