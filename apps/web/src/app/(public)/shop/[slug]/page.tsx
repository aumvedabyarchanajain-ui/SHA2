'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  ArrowLeft,
  Package,
  Loader2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Layers,
  HeartHandshake,
  CheckCircle2,
  Calendar
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { useCart } from '@/lib/cart'
import { useCartDrawer } from '@/components/cart/CartDrawer'
import type { ProductView } from '@/lib/product-types'
import { getBundleInfo } from '@/lib/product-types'
import CrystalCanvas3D from '@/components/crystals/CrystalCanvas3D'
import ActivationRitualGuide from '@/components/crystals/ActivationRitualGuide'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductView | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeViewTab, setActiveViewTab] = useState<'3d' | 'photo'>('3d')
  const [userChakra, setUserChakra] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{
    sunSign?: string | null
    moonSign?: string | null
    risingSign?: string | null
    dominantChakra?: string | null
  }>({})
  const [includeBundleSession, setIncludeBundleSession] = useState(false)

  const { addItem, totalItems } = useCart()
  const { openCart } = useCartDrawer()

  useEffect(() => {
    const slug = params.slug
    if (!slug) return
    fetch(`/api/products/${slug}`)
      .then(async res => {
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        setProduct(data.product)
      })
      .catch(() => router.push('/shop'))
      .finally(() => setLoading(false))
  }, [params.slug, router])

  useEffect(() => {
    fetch('/api/user/chakra')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        setUserChakra(data?.chakra ?? null)
        setUserProfile({
          dominantChakra: data?.chakra ?? null,
          sunSign: data?.sunSign ?? null,
          risingSign: data?.risingSign ?? null,
        })
      })
      .catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    )
  }

  if (!product) return null

  const bundle = getBundleInfo(product.metadata)
  const matchesChakra =
    !!userChakra &&
    ((product.chakraAffinity && product.chakraAffinity.toLowerCase().includes(userChakra.toLowerCase())) ||
     (product.chakraAssociation && product.chakraAssociation.toLowerCase().includes(userChakra.toLowerCase())))

  const handleAddToCart = () => {
    if (product.inventoryCount === 0) {
      showError('This sacred piece is currently out of stock.')
      return
    }

    const priceCents = (includeBundleSession && bundle)
      ? product.priceCents + bundle.bundlePriceCents
      : product.priceCents

    addItem({
      productId: product.id,
      slug: product.slug,
      title: includeBundleSession && bundle
        ? `${product.title} + ${bundle.sessionLabel}`
        : product.title,
      priceCents,
      compareAtPriceCents: product.compareAtPriceCents,
      imageUrl: product.imageUrl,
      inventoryCount: product.inventoryCount,
      productType: includeBundleSession ? 'bundle' : product.productType,
      bundle: includeBundleSession ? bundle : null,
    })

    showSuccess(`${product.title} added to cart!`)
    openCart()
  }

  const allImages = product.images.length > 0 ? product.images : []

  return (
    <div className="min-h-screen bg-stone-50/40 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-900 rounded-xl">
            <Link href="/shop"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Crystal Sanctuary</Link>
          </Button>

          {totalItems > 0 && (
            <Button
              onClick={openCart}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 bg-white font-bold text-xs"
            >
              <ShoppingBag className="w-4 h-4 mr-2 text-amber-600" /> Cart ({totalItems})
            </Button>
          )}
        </div>

        {/* Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: 3D Interactive Canvas & Photography Tabs */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-2xl w-fit">
              <button
                onClick={() => setActiveViewTab('3d')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeViewTab === '3d'
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Interactive 3D Crystal
              </button>

              <button
                onClick={() => setActiveViewTab('photo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeViewTab === 'photo'
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> High-Res Photography
              </button>
            </div>

            {/* Main Visual Frame */}
            {activeViewTab === '3d' ? (
              <CrystalCanvas3D
                modelType={product.model3dType || 'pyrite'}
                title={product.title}
                frequencyHz={product.frequencyHz}
                chakra={product.chakraAffinity}
              />
            ) : (
              <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-lg">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <Package className="w-20 h-20 text-slate-300" />
                  </div>
                )}
              </div>
            )}

            {/* Energetic Specifications Grid */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" /> Energetic & Metaphysical Blueprint
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Chakra Resonance</p>
                  <p className="font-bold text-slate-900 mt-0.5">{product.chakraAffinity || 'Universal / All'}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Frequency</p>
                  <p className="font-bold text-amber-700 mt-0.5">{product.frequencyHz ? `${product.frequencyHz} Hz Solfeggio` : '528 Hz'}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Planetary Ruler</p>
                  <p className="font-bold text-slate-900 mt-0.5">{product.planetaryRuler || 'Sun & Jupiter'}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Elemental Balance</p>
                  <p className="font-bold text-slate-900 mt-0.5">{product.elementalAssociation || 'Earth & Fire'}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Crystal System</p>
                  <p className="font-bold text-slate-900 mt-0.5">{product.crystalSystem || 'Isometric'}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Consecrated By</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-[11px] truncate">{product.energizedBy || 'Archana Jain (Jaipur)'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Overview & Bundle Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-500/20 text-amber-900 border-amber-300 text-[10px] font-bold uppercase tracking-widest">
                  {product.category}
                </Badge>
                {product.mineralType && (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                    {product.mineralType}
                  </Badge>
                )}
              </div>

              {matchesChakra && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Exact Match: Aligned with your {userChakra} diagnostic profile</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
                {product.title}
              </h1>

              {product.shortDescription && (
                <p className="text-base text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.priceInr.toLocaleString('en-IN')}
              </span>
              {product.compareAtPriceInr && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ₹{product.compareAtPriceInr.toLocaleString('en-IN')}
                  </span>
                  <Badge className="bg-rose-500 text-white border-none text-xs font-black">
                    {product.discountPercent}% OFF
                  </Badge>
                </>
              )}
              <span className="ml-auto text-[11px] font-semibold text-emerald-700">
                Inclusive of GST
              </span>
            </div>

            {/* Narrative Description */}
            <div className="prose text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>

            {/* 1:1 Session Pairing Cross-Sell */}
            {bundle && (
              <div
                onClick={() => setIncludeBundleSession(!includeBundleSession)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-3 ${
                  includeBundleSession
                    ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeBundleSession}
                      onChange={() => {}} // controlled by wrapper click
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 pointer-events-none"
                    />
                    <Badge className="bg-slate-900 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                      Pair with Clinical Consultation
                    </Badge>
                  </div>
                  <span className="text-xs font-black text-emerald-700">
                    + ₹{(bundle.bundlePriceCents / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-xs text-slate-700">
                  Add a 60-minute <strong>{bundle.sessionLabel}</strong> with Archana / Sejal. Receive your complete natal birth chart synthesis and personal crystal energization reading.
                </p>
              </div>
            )}

            {/* Purchase CTA */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleAddToCart}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-amber-400 font-black text-base shadow-xl"
              >
                <ShoppingBag className="w-5 h-5 mr-2" /> Add to Sacred Cart &bull; ₹
                {((includeBundleSession && bundle
                  ? product.priceCents + bundle.bundlePriceCents
                  : product.priceCents) / 100).toLocaleString('en-IN')}
              </Button>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-medium pt-2">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Certified Natural</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Jaipur Altar Energized</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-slate-700" />
                  <span>Free Shipping &gt; ₹1,499</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Interactive Activation Guide Section */}
        <div className="pt-8 border-t border-slate-200">
          <ActivationRitualGuide product={product} userProfile={userProfile} />
        </div>
      </div>
    </div>
  )
}
