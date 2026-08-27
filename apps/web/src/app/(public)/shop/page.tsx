'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ShoppingBag,
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Package,
  Loader2,
  Eye,
  X,
  Flame,
  Moon,
  Sun,
  Layers,
  HeartHandshake
} from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import { useCart } from '@/lib/cart'
import { useCartDrawer } from '@/components/cart/CartDrawer'
import type { ProductView } from '@/lib/product-types'
import { getBundleInfo } from '@/lib/product-types'
import CrystalCanvas3D from '@/components/crystals/CrystalCanvas3D'

const CHAKRA_FILTERS = [
  'All',
  'Root',
  'Sacral',
  'Solar Plexus',
  'Heart',
  'Throat',
  'Third Eye',
  'Crown'
]

const INTENTION_FILTERS = [
  'All Intentions',
  'Abundance & Wealth',
  'Trauma Healing',
  'Protection & Grounding',
  'Psychic Intuition',
  'Love & Emotional Release'
]

export default function ShopPage() {
  const [products, setProducts] = useState<ProductView[]>([])
  const [userChakra, setUserChakra] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChakra, setSelectedChakra] = useState('All')
  const [selectedIntention, setSelectedIntention] = useState('All Intentions')
  const [search, setSearch] = useState('')
  const [active3DProduct, setActive3DProduct] = useState<ProductView | null>(null)

  const { addItem, totalItems } = useCart()
  const { openCart } = useCartDrawer()

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(async res => {
        if (!res.ok) throw new Error('Failed to load')
        return res.json()
      }),
      fetch('/api/user/chakra').then(async res => {
        if (res.ok) {
          const data = await res.json()
          return data.chakra ?? null
        }
        return null
      }).catch(() => null)
    ])
      .then(([productsData, chakra]) => {
        setProducts(productsData.products ?? [])
        setUserChakra(chakra)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const recommendedProducts = userChakra
    ? products.filter(p =>
        (p.chakraAffinity && p.chakraAffinity.toLowerCase().includes(userChakra.toLowerCase())) ||
        (p.chakraAssociation && p.chakraAssociation.toLowerCase().includes(userChakra.toLowerCase())) ||
        p.tags?.some(t => t.toLowerCase() === userChakra.toLowerCase())
      )
    : products.slice(0, 3)

  const filtered = products.filter(p => {
    // Chakra filter
    if (selectedChakra !== 'All') {
      const matchChakra =
        (p.chakraAffinity && p.chakraAffinity.toLowerCase().includes(selectedChakra.toLowerCase())) ||
        (p.chakraAssociation && p.chakraAssociation.toLowerCase().includes(selectedChakra.toLowerCase())) ||
        p.tags?.some(t => t.toLowerCase().includes(selectedChakra.toLowerCase()))
      if (!matchChakra) return false
    }

    // Search query
    if (search) {
      const s = search.toLowerCase()
      const matchSearch =
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(s)) ||
        (p.mineralType && p.mineralType.toLowerCase().includes(s))
      if (!matchSearch) return false
    }

    return true
  })

  const handleAddToCart = (product: ProductView) => {
    if (product.inventoryCount === 0) {
      showError(`${product.title} is out of stock`)
      return
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      priceCents: product.priceCents,
      compareAtPriceCents: product.compareAtPriceCents,
      imageUrl: product.imageUrl,
      inventoryCount: product.inventoryCount,
      productType: product.productType,
      bundle: getBundleInfo(product.metadata),
    })
    showSuccess(`${product.title} added to sacred cart!`)
    openCart()
  }

  return (
    <div className="min-h-screen bg-stone-50/50 pt-32 pb-24">
      {/* 3D Quick View Modal */}
      {active3DProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30">
            <button
              onClick={() => setActive3DProduct(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <CrystalCanvas3D
              modelType={active3DProduct.model3dType || 'pyrite'}
              title={active3DProduct.title}
              frequencyHz={active3DProduct.frequencyHz}
              chakra={active3DProduct.chakraAffinity}
              className="border-none"
            />

            <div className="p-6 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-amber-300">{active3DProduct.title}</h3>
                <p className="text-xs text-slate-400">
                  {active3DProduct.mineralType} &bull; {active3DProduct.frequencyHz} Hz &bull; {active3DProduct.chakraAffinity}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    handleAddToCart(active3DProduct)
                    setActive3DProduct(null)
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart (₹{active3DProduct.priceInr.toLocaleString('en-IN')})
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-700 text-slate-200 hover:text-white rounded-xl"
                >
                  <Link href={`/shop/${active3DProduct.slug}`}>Details &rarr;</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Editorial Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-amber-400 text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5" /> Crystal Sanctuary & Sacred Commerce
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              Consecrated Healing Crystals & <br />
              <span className="text-amber-600 italic">Vibrational Sacred Tools</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Every mineral in the Aumveda Sanctuary is ethically sourced, lab-certified, and individually energized by Archana Jain on the Jaipur Vedic altar with Surya-Chandra mantras.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search crystals, minerals, chakras..."
                className="pl-10 h-12 rounded-2xl border-slate-200 bg-white"
              />
            </div>
            {totalItems > 0 && (
              <Button
                onClick={openCart}
                className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-amber-400 font-bold shrink-0 shadow-md"
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Cart ({totalItems})
              </Button>
            )}
          </div>
        </div>

        {/* Personalized Chakra Matched Banner */}
        {userChakra && (
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-emerald-500/10 rounded-3xl p-6 border border-amber-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Personalized Energetic Prescriptions
              </span>
              <p className="font-serif text-lg font-bold text-slate-900">
                Your diagnostic profile indicates resonance with the <span className="text-amber-700 capitalize">{userChakra} Chakra</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedChakra(userChakra.charAt(0).toUpperCase() + userChakra.slice(1))}
              className="rounded-xl border-amber-400 bg-white text-amber-900 font-bold hover:bg-amber-50 shrink-0 text-xs"
            >
              Filter For My Energy Profile &rarr;
            </Button>
          </div>
        )}

        {/* Chakra Filter Pills */}
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Filter by Resonant Chakra:</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CHAKRA_FILTERS.map(c => (
              <button
                key={c}
                onClick={() => setSelectedChakra(c)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedChakra === c
                    ? 'bg-slate-900 text-amber-400 shadow-md ring-2 ring-slate-900/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {c === 'All' ? '✨ All Sacred Minerals' : `${c} Chakra`}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl p-8 border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-slate-900">No crystals found matching criteria</h3>
            <p className="text-xs text-slate-500">Try adjusting your chakra filter or search keywords.</p>
            <Button
              onClick={() => {
                setSelectedChakra('All')
                setSearch('')
              }}
              variant="outline"
              className="rounded-xl font-bold text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col group"
              >
                {/* Image & Quick 3D trigger */}
                <div className="relative aspect-4/3 bg-slate-950 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <Sparkles className="w-12 h-12 text-amber-500/40" />
                    </div>
                  )}

                  {/* 3D Quick View Action Button */}
                  <button
                    onClick={() => setActive3DProduct(product)}
                    className="absolute bottom-3 right-3 bg-slate-900/85 hover:bg-black text-amber-300 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 shadow-lg transition-all hover:scale-105"
                  >
                    <Eye className="w-3.5 h-3.5" /> 3D Preview
                  </button>

                  {/* Frequency & Chakra Tag */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.frequencyHz && (
                      <Badge className="bg-slate-900/80 text-amber-300 border-amber-500/30 text-[10px] font-bold backdrop-blur-md">
                        {product.frequencyHz} Hz
                      </Badge>
                    )}
                    {product.chakraAffinity && (
                      <Badge className="bg-white/90 text-slate-900 border-none text-[10px] font-bold backdrop-blur-md">
                        {product.chakraAffinity}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {product.mineralType || product.category}
                      </span>
                      {product.planetaryRuler && (
                        <span className="text-[10px] font-bold text-amber-700">
                          {product.planetaryRuler}
                        </span>
                      )}
                    </div>

                    <Link href={`/shop/${product.slug}`} className="block">
                      <h3 className="font-serif text-lg font-bold text-slate-900 hover:text-amber-700 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.shortDescription || product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xl font-black text-slate-900">
                          ₹{product.priceInr.toLocaleString('en-IN')}
                        </span>
                        {product.compareAtPriceInr && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            ₹{product.compareAtPriceInr.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {product.discountPercent && (
                        <Badge className="bg-rose-50 text-rose-600 border-rose-200 text-[10px] font-bold">
                          {product.discountPercent}% OFF
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs h-10 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Add to Cart
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full rounded-xl border-slate-200 hover:border-slate-300 font-bold text-xs h-10"
                      >
                        <Link href={`/shop/${product.slug}`}>
                          Ritual & Specs
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 1:1 Clinical Consultations Cross-Sell Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 p-8 md:p-12 text-white border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold uppercase tracking-widest">
              <HeartHandshake className="w-3.5 h-3.5 mr-1" /> Synergy Healing
            </Badge>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-snug">
              Pair Your Crystal With a 1:1 Clinical Session with Archana or Sejal
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Accelerate your healing matrix. During your 60-minute session, receive an astrological birth chart reading and custom somatic consecration protocol for your gemstones.
            </p>
          </div>

          <Button
            asChild
            className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shrink-0 shadow-lg"
          >
            <Link href="/services">
              Explore 1:1 Consultations &rarr;
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
