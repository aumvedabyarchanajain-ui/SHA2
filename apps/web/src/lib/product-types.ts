/**
 * Client-safe product view types + pure helpers.
 * Keep Prisma / Node-only code out of this module — shop pages are `'use client'`.
 */
export interface ProductView {
  id: number
  sku: string
  slug: string
  title: string
  shortDescription: string | null
  description: string
  category: string
  priceCents: number
  priceInr: number
  compareAtPriceCents: number | null
  compareAtPriceInr: number | null
  discountPercent: number | null
  imageUrl: string | null
  images: string[]
  inventoryCount: number
  isActive: boolean
  productType: string
  tags: string[]
  chakraAssociation: string | null
  chakraAffinity?: string | null
  planetaryRuler?: string | null
  elementalAssociation?: string | null
  crystalSystem?: string | null
  mineralType?: string | null
  frequencyHz?: number | null
  model3dType?: string | null
  energizedBy?: string | null
  activationRitualText?: string | null
  activationRitualJson?: {
    cleansing: string
    mantra: string
    somaticImprint: string
    muhurta: string
  } | null
  healingProperties?: any
  metadata: unknown
  createdAt: Date
  updatedAt: Date
}

export interface BundleInfo {
  serviceType: string
  sessionLabel: string
  bundlePriceCents: number
}

/**
 * Reads the "Crystal + Session" bundle off a product's metadata JSON, if
 * present. Bundles reference a service type rather than a real Service
 * record — deliberately loose, matching how `metadata` is used elsewhere on
 * Product. Returns null on any malformed/missing shape rather than throwing,
 * since metadata is untyped storage.
 */
export function getBundleInfo(metadata: unknown): BundleInfo | null {
  if (!metadata || typeof metadata !== 'object') return null
  const bundle = (metadata as Record<string, unknown>).bundle
  if (!bundle || typeof bundle !== 'object') return null
  const b = bundle as Record<string, unknown>
  if (
    typeof b.serviceType !== 'string' ||
    typeof b.sessionLabel !== 'string' ||
    typeof b.bundlePriceCents !== 'number'
  ) {
    return null
  }
  return {
    serviceType: b.serviceType,
    sessionLabel: b.sessionLabel,
    bundlePriceCents: b.bundlePriceCents,
  }
}
