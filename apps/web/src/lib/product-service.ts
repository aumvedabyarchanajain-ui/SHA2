import 'server-only'

import { prisma } from '@aumveda/db'
import { r2PublicUrl } from '@/lib/r2'
import type { CreateProductInput, UpdateProductInput, ProductListQuery } from '@/lib/product-schemas'
import type { ProductView } from '@/lib/product-types'

export type { ProductView, BundleInfo } from '@/lib/product-types'
export { getBundleInfo } from '@/lib/product-types'

function toProductView(p: any): ProductView {
  const priceCents = p.priceCents ?? (p.priceINR ? Math.round(Number(p.priceINR) * 100) : 0)
  const priceInr = priceCents / 100
  const compareAtPriceCents = p.compareAtPriceCents ?? null
  const compareAtPriceInr = compareAtPriceCents ? compareAtPriceCents / 100 : null
  const discountPercent =
    compareAtPriceInr && compareAtPriceInr > priceInr
      ? Math.round((1 - priceInr / compareAtPriceInr) * 100)
      : null

  const images = Array.isArray(p.images) ? p.images : []

  return {
    id: p.id,
    sku: p.sku || '',
    slug: p.slug || '',
    title: p.title || p.name || '',
    shortDescription: p.shortDescription || null,
    description: p.description || '',
    category: p.category || 'Crystals',
    priceCents,
    priceInr,
    compareAtPriceCents,
    compareAtPriceInr,
    discountPercent,
    images,
    imageUrl: images[0] ? r2PublicUrl(images[0]) : null,
    inventoryCount: p.inventoryCount ?? p.stockQuantity ?? 100,
    isActive: p.isActive ?? true,
    productType: p.productType || 'physical',
    tags: Array.isArray(p.tags) ? p.tags : [],
    chakraAssociation: p.chakraAssociation || p.chakraAffinity || null,
    chakraAffinity: p.chakraAffinity || p.chakraAssociation || null,
    planetaryRuler: p.planetaryRuler || null,
    elementalAssociation: p.elementalAssociation || null,
    crystalSystem: p.crystalSystem || null,
    mineralType: p.mineralType || null,
    frequencyHz: p.frequencyHz || null,
    model3dType: p.model3dType || null,
    energizedBy: p.energizedBy || 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: p.activationRitualText || null,
    activationRitualJson: p.activationRitualJson || null,
    healingProperties: p.healingProperties || null,
    metadata: p.metadata || {},
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  }
}

export const DEMO_PRODUCTS: ProductView[] = [
  {
    id: 1 as any,
    sku: 'AUM-CRYSTAL-0001',
    slug: 'golden-pyrite-altar-cluster-jaipur-energized',
    title: 'Golden Pyrite Altar Cluster (Jaipur Energized)',
    shortDescription: "Radiant isometric Fool's Gold cluster charged on Archana Jain's Jaipur altar to unlock solar plexus abundance and dissolve debt karma.",
    description: "Ethically harvested natural Iron Disulfide crystal cluster displaying brassy golden cubic formations. Known in Vedic tradition as 'Svarna Makshika', this cluster vibrates with the solar frequency of Lakshmi and Kubera, grounding wealth consciousness into physical reality.",
    category: 'Crystals',
    priceCents: 189900,
    priceInr: 1899,
    compareAtPriceCents: 349900,
    compareAtPriceInr: 3499,
    discountPercent: 46,
    images: ['https://astrotalk.store/cdn/shop/files/1_9b96c584-8ca6-4819-8383-3c1a88114477.jpg?v=1769495980'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/1_9b96c584-8ca6-4819-8383-3c1a88114477.jpg?v=1769495980',
    inventoryCount: 50,
    isActive: true,
    productType: 'physical',
    tags: ['Bestseller', 'Solar Plexus', 'Sun / Jupiter', 'Abundance'],
    chakraAssociation: 'solar_plexus',
    chakraAffinity: 'Solar Plexus',
    planetaryRuler: 'Sun / Jupiter',
    elementalAssociation: 'Fire & Earth',
    crystalSystem: 'Isometric (Cubic)',
    mineralType: 'Iron Disulfide (Pyrite)',
    frequencyHz: 528,
    model3dType: 'pyrite',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Place over natural rock salt or raw Selenite plate for 3 hours. Avoid submerging in water.\n\nMantra: Om Shreem Hreem Kleem Glaum Gam Shrimatye Namah (108 repetitions on Sunday sunrise)\n\nSomatic Imprint: Hold cluster against the upper abdomen (Solar Plexus) during deep diaphragmatic box breathing (4-4-4-4 count).\n\nAuspicious Timing: Sunday during Shukla Paksha (Waxing Moon) or Pushya Nakshatra',
    activationRitualJson: {
      cleansing: 'Place over natural rock salt or raw Selenite plate for 3 hours. Avoid submerging in water.',
      mantra: 'Om Shreem Hreem Kleem Glaum Gam Shrimatye Namah (108 repetitions on Sunday sunrise)',
      somaticImprint: 'Hold cluster against the upper abdomen (Solar Plexus) during deep diaphragmatic box breathing (4-4-4-4 count).',
      muhurta: 'Sunday during Shukla Paksha (Waxing Moon) or Pushya Nakshatra',
    },
    metadata: {
      bundle: {
        serviceType: 'ASTROLOGY_ARCHANA',
        sessionLabel: 'Vedic Wealth & Vastu Consultation with Archana Jain',
        bundlePriceCents: 450000,
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2 as any,
    sku: 'AUM-CRYSTAL-0002',
    slug: 'madagascar-rose-quartz-heart-anahata-wand',
    title: 'Madagascar Rose Quartz Heart & Anahata Wand',
    shortDescription: 'Translucent pink crystalline quartz radiating pure unconditional love, emotional somatic release, and heart-brain coherence.',
    description: 'Mined from the pegmatites of Madagascar and hand-polished by master artisans. Rose Quartz emits gentle 639 Hz harmonic vibrations that soothe the autonomic nervous system, releasing stored grief, heartbreak, and emotional hypervigilance.',
    category: 'Crystals',
    priceCents: 149900,
    priceInr: 1499,
    compareAtPriceCents: 279900,
    compareAtPriceInr: 2799,
    discountPercent: 46,
    images: ['https://astrotalk.store/cdn/shop/files/1_bf2779f4-e5e2-41b2-810b-628123437a5e.jpg?v=1736429424'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/1_bf2779f4-e5e2-41b2-810b-628123437a5e.jpg?v=1736429424',
    inventoryCount: 40,
    isActive: true,
    productType: 'physical',
    tags: ['Staff Pick', 'Heart', 'Venus', 'Emotional Release'],
    chakraAssociation: 'heart',
    chakraAffinity: 'Heart',
    planetaryRuler: 'Venus',
    elementalAssociation: 'Water',
    crystalSystem: 'Trigonal',
    mineralType: 'Silicon Dioxide (Rose Quartz)',
    frequencyHz: 639,
    model3dType: 'rose_quartz',
    energizedBy: 'Sejal Jain (Somatic Sound Sanctuary)',
    activationRitualText: 'Bathe under full moon moonlight for 4 hours or cleanse with pure rose water mist.\n\nMantra: Om Shukraya Namah · Om Aim Hreem Kleem Chamundaye Viche\n\nSomatic Imprint: Rest the crystal directly on the sternum. Inhale softly for 5s, hold for 2s, exhale with an audible sigh for 7s.\n\nAuspicious Timing: Friday morning during Venus Hora',
    activationRitualJson: {
      cleansing: 'Bathe under full moon moonlight for 4 hours or cleanse with pure rose water mist.',
      mantra: 'Om Shukraya Namah · Om Aim Hreem Kleem Chamundaye Viche',
      somaticImprint: 'Rest the crystal directly on the sternum. Inhale softly for 5s, hold for 2s, exhale with an audible sigh for 7s.',
      muhurta: 'Friday morning during Venus Hora',
    },
    metadata: {
      bundle: {
        serviceType: 'SOMATIC_SEJAL',
        sessionLabel: 'Somatic Trauma & Heart Awakening with Sejal Jain',
        bundlePriceCents: 420000,
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3 as any,
    sku: 'AUM-CRYSTAL-0003',
    slug: 'deep-violet-brazilian-amethyst-geode-sanctuary-cluster',
    title: 'Deep Violet Brazilian Amethyst Geode Sanctuary Cluster',
    shortDescription: 'Vibrant royal purple quartz geode invoking deep meditative theta states, third-eye activation, and psychic protection.',
    description: 'Formed millions of years ago in volcanic gas bubbles, this Brazilian Amethyst geode features naturally terminated prismatic quartz crystals rich in ferric iron. It dissolves racing thoughts, mitigates insomnia, and shields the aura from negative psychic interference.',
    category: 'Crystals',
    priceCents: 249900,
    priceInr: 2499,
    compareAtPriceCents: 499900,
    compareAtPriceInr: 4999,
    discountPercent: 50,
    images: ['https://astrotalk.store/cdn/shop/files/ity48bidmbvrtxtey3lb.webp?v=1742551027'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/ity48bidmbvrtxtey3lb.webp?v=1742551027',
    inventoryCount: 30,
    isActive: true,
    productType: 'physical',
    tags: ['High Vibration', 'Third Eye', 'Crown', 'Jupiter'],
    chakraAssociation: 'third_eye',
    chakraAffinity: 'Third Eye & Crown',
    planetaryRuler: 'Jupiter & Saturn',
    elementalAssociation: 'Ether & Air',
    crystalSystem: 'Trigonal',
    mineralType: 'Silicon Dioxide (Amethyst)',
    frequencyHz: 963,
    model3dType: 'amethyst',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Smudge with sacred Himalayan white sage or frankincense resin.\n\nMantra: Om Sham Shanaischaraya Namah · Om Gum Gurave Namah\n\nSomatic Imprint: Sit in Sukhasana. Hold stone at brow point. Visualize indigo light expanding through the frontal lobe.\n\nAuspicious Timing: Thursday or Saturday evening during Twilight (Sandhya Vela)',
    activationRitualJson: {
      cleansing: 'Smudge with sacred Himalayan white sage or frankincense resin.',
      mantra: 'Om Sham Shanaischaraya Namah · Om Gum Gurave Namah',
      somaticImprint: 'Sit in Sukhasana. Hold stone at brow point. Visualize indigo light expanding through the frontal lobe.',
      muhurta: 'Thursday or Saturday evening during Twilight (Sandhya Vela)',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4 as any,
    sku: 'AUM-CRYSTAL-0004',
    slug: 'natural-honey-citrine-abundance-generator',
    title: 'Natural Honey Citrine Abundance Generator',
    shortDescription: 'Warm golden-amber quartz point radiating non-stop commercial prosperity, solar prana, and unshakeable self-worth.',
    description: 'The premier stone of commercial manifestation and wealth multiplication. Unlike heat-treated stones, this natural golden Citrine generator never retains negative energy and continuously charges the auric biofield with optimism, vitality, and career breakthroughs.',
    category: 'Crystals',
    priceCents: 199900,
    priceInr: 1999,
    compareAtPriceCents: 389900,
    compareAtPriceInr: 3899,
    discountPercent: 49,
    images: ['https://astrotalk.store/cdn/shop/files/price_drop.webp?v=1745301541'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/price_drop.webp?v=1745301541',
    inventoryCount: 35,
    isActive: true,
    productType: 'physical',
    tags: ['Bestseller', 'Solar Plexus', 'Sun & Mercury'],
    chakraAssociation: 'solar_plexus',
    chakraAffinity: 'Solar Plexus & Sacral',
    planetaryRuler: 'Sun & Mercury',
    elementalAssociation: 'Fire',
    crystalSystem: 'Trigonal',
    mineralType: 'Silicon Dioxide (Citrine)',
    frequencyHz: 528,
    model3dType: 'citrine',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Leave in early morning sunlight for 30 minutes.\n\nMantra: Om Budhaya Namah · Om Hreem Shreem Lakshmibhayo Namah\n\nSomatic Imprint: Hold generator in dominant hand, pointing apex upward. Take 7 deep belly breaths.\n\nAuspicious Timing: Wednesday or Sunday morning in Shukla Paksha',
    activationRitualJson: {
      cleansing: 'Leave in early morning sunlight for 30 minutes.',
      mantra: 'Om Budhaya Namah · Om Hreem Shreem Lakshmibhayo Namah',
      somaticImprint: 'Hold generator in dominant hand, pointing apex upward. Take 7 deep belly breaths.',
      muhurta: 'Wednesday or Sunday morning in Shukla Paksha',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5 as any,
    sku: 'AUM-CRYSTAL-0005',
    slug: 'himalayan-clear-quartz-master-healer-prism',
    title: 'Himalayan Clear Quartz Master Healer Prism',
    shortDescription: 'High-clarity optical grade quartz crystal mined in Himachal Pradesh to amplify intentions, purify chakras, and channel divine light.',
    description: "Known as 'Sphatik' in Sanskrit scriptures, Clear Quartz is the supreme programmable master crystal. It attunes to the unique vibrational frequency of the user's biofield, harmonizing all seven energy vortices and magnifying other gemstones by 10x.",
    category: 'Crystals',
    priceCents: 169900,
    priceInr: 1699,
    compareAtPriceCents: 299900,
    compareAtPriceInr: 2999,
    discountPercent: 43,
    images: ['https://astrotalk.store/cdn/shop/files/1_15_a56f33fe-a506-4f96-b300-5532597ba579.jpg?v=1770268007'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/1_15_a56f33fe-a506-4f96-b300-5532597ba579.jpg?v=1770268007',
    inventoryCount: 45,
    isActive: true,
    productType: 'physical',
    tags: ['Master Healer', 'All Chakras', 'Ether'],
    chakraAssociation: 'crown',
    chakraAffinity: 'All 7 Chakras',
    planetaryRuler: 'Sun & All Grahas',
    elementalAssociation: 'Ether (Akasha)',
    crystalSystem: 'Hexagonal',
    mineralType: 'Pure Silicon Dioxide (Sphatik)',
    frequencyHz: 741,
    model3dType: 'clear_quartz',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Wash in running mountain spring water or dilute Ganga Jal.\n\nMantra: Om Namah Shivaya (108 times)\n\nSomatic Imprint: Hold prism in both palms at heart level, breathing in white luminescent light.\n\nAuspicious Timing: Monday morning during Brahma Muhurta',
    activationRitualJson: {
      cleansing: 'Wash in running mountain spring water or dilute Ganga Jal.',
      mantra: 'Om Namah Shivaya (108 times)',
      somaticImprint: 'Hold prism in both palms at heart level, breathing in white luminescent light.',
      muhurta: 'Monday morning during Brahma Muhurta',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6 as any,
    sku: 'AUM-CRYSTAL-0006',
    slug: 'raw-black-tourmaline-grounding-emf-shield',
    title: 'Raw Black Tourmaline Grounding & EMF Shield',
    shortDescription: 'Dense striated Schorl crystal that roots erratic nervous system energy, repels negative intentions, and neutralizes electromagnetic radiation.',
    description: 'A powerhouse of psychic and physical grounding. Black Tourmaline creates an impermeable energetic perimeter around your living space and bio-field, transmuting toxic thoughtforms and anchoring flight-or-flight panic into solid earth stability.',
    category: 'Crystals',
    priceCents: 119900,
    priceInr: 1199,
    compareAtPriceCents: 229900,
    compareAtPriceInr: 2299,
    discountPercent: 48,
    images: ['https://astrotalk.store/cdn/shop/files/2nd_image.jpg?v=1741782935'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/2nd_image.jpg?v=1741782935',
    inventoryCount: 60,
    isActive: true,
    productType: 'physical',
    tags: ['Essential Protection', 'Root', 'Saturn & Rahu'],
    chakraAssociation: 'root',
    chakraAffinity: 'Root (Muladhara)',
    planetaryRuler: 'Saturn & Rahu',
    elementalAssociation: 'Earth (Prithvi)',
    crystalSystem: 'Trigonal',
    mineralType: 'Complex Borosilicate (Schorl)',
    frequencyHz: 396,
    model3dType: 'black_tourmaline',
    energizedBy: 'Sejal Jain (Somatic Grounding Protocol)',
    activationRitualText: 'Bury in clean earth/soil for 12 hours or rest on raw Selenite plate.\n\nMantra: Om Lam Muladhara Swaha · Om Rahave Namah\n\nSomatic Imprint: Place stone between feet on bare floor. Practice 5-minute somatic downward grounding breath.\n\nAuspicious Timing: Saturday evening or Amavasya (New Moon)',
    activationRitualJson: {
      cleansing: 'Bury in clean earth/soil for 12 hours or rest on raw Selenite plate.',
      mantra: 'Om Lam Muladhara Swaha · Om Rahave Namah',
      somaticImprint: 'Place stone between feet on bare floor. Practice 5-minute somatic downward grounding breath.',
      muhurta: 'Saturday evening or Amavasya (New Moon)',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7 as any,
    sku: 'AUM-CRYSTAL-0007',
    slug: 'royal-afghan-lapis-lazuli-intuition-tablet',
    title: 'Royal Afghan Lapis Lazuli Intuition Tablet',
    shortDescription: 'Deep celestial blue Lazurite studded with golden pyrite specks to activate authentic voice, psychic perception, and ancestral wisdom.',
    description: "Revered since ancient Vedic times as 'Lajward', this stone of royalty and higher truth bridges the Throat and Third Eye chakras. It empowers fearless truth-telling, dissolves throat tension, and connects the seeker to cosmic memory.",
    category: 'Crystals',
    priceCents: 219900,
    priceInr: 2199,
    compareAtPriceCents: 419900,
    compareAtPriceInr: 4199,
    discountPercent: 48,
    images: ['https://astrotalk.store/cdn/shop/files/DSC_0932.jpg?v=1741242230'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/DSC_0932.jpg?v=1741242230',
    inventoryCount: 25,
    isActive: true,
    productType: 'physical',
    tags: ['Sacred Relic', 'Throat', 'Third Eye', 'Jupiter'],
    chakraAssociation: 'throat',
    chakraAffinity: 'Throat & Third Eye',
    planetaryRuler: 'Jupiter & Saturn',
    elementalAssociation: 'Air & Ether',
    crystalSystem: 'Isometric',
    mineralType: 'Lazurite with Pyrite & Calcite',
    frequencyHz: 852,
    model3dType: 'lapis_lazuli',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Sound bath with Tibetan singing bowl or 852 Hz tuning fork for 3 minutes.\n\nMantra: Om Ham Vishuddhaya Namah · Om Gurave Namah\n\nSomatic Imprint: Rest tablet against hollow of throat. Chant resonant "HAM" sound on exhalation.\n\nAuspicious Timing: Thursday morning in Shukla Paksha',
    activationRitualJson: {
      cleansing: 'Sound bath with Tibetan singing bowl or 852 Hz tuning fork for 3 minutes.',
      mantra: 'Om Ham Vishuddhaya Namah · Om Gurave Namah',
      somaticImprint: 'Rest tablet against hollow of throat. Chant resonant "HAM" sound on exhalation.',
      muhurta: 'Thursday morning in Shukla Paksha',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8 as any,
    sku: 'AUM-CRYSTAL-0008',
    slug: 'natural-green-aventurine-heart-healer-opportunity-stone',
    title: 'Natural Green Aventurine Heart Healer & Opportunity Stone',
    shortDescription: 'Shimmering green chrome-mica quartz that opens the heart to unexpected synchronicities, financial luck, and rapid emotional healing.',
    description: 'Known as the Stone of Opportunity, Green Aventurine aligns conditions so that luck and auspicious timing become inevitable. It calms cardiac palpitations, dissolves emotional defensiveness, and revitalizes vitality.',
    category: 'Crystals',
    priceCents: 129900,
    priceInr: 1299,
    compareAtPriceCents: 249900,
    compareAtPriceInr: 2499,
    discountPercent: 48,
    images: ['https://astrotalk.store/cdn/shop/files/with_tag.webp?v=1749116073'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/with_tag.webp?v=1749116073',
    inventoryCount: 40,
    isActive: true,
    productType: 'physical',
    tags: ['Good Luck', 'Heart', 'Mercury & Venus'],
    chakraAssociation: 'heart',
    chakraAffinity: 'Heart (Anahata)',
    planetaryRuler: 'Mercury & Venus',
    elementalAssociation: 'Earth & Water',
    crystalSystem: 'Trigonal',
    mineralType: 'Silicon Dioxide with Fuchsite',
    frequencyHz: 639,
    model3dType: 'emerald',
    energizedBy: 'Sejal Jain (Somatic Sound Sanctuary)',
    activationRitualText: 'Rinse under cool filtered water and place next to living green plant for 2 hours.\n\nMantra: Om Yam Anahataya Namah · Om Budhaya Namah\n\nSomatic Imprint: Press against chest center. Breathe in feeling of unconditional gratitude.\n\nAuspicious Timing: Wednesday morning sunrise',
    activationRitualJson: {
      cleansing: 'Rinse under cool filtered water and place next to living green plant for 2 hours.',
      mantra: 'Om Yam Anahataya Namah · Om Budhaya Namah',
      somaticImprint: 'Press against chest center. Breathe in feeling of unconditional gratitude.',
      muhurta: 'Wednesday morning sunrise',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 9 as any,
    sku: 'AUM-CRYSTAL-0009',
    slug: 'raw-moroccan-selenite-sacred-charging-plate-altar-base',
    title: 'Raw Moroccan Selenite Sacred Charging Plate & Altar Base',
    shortDescription: 'Silky pearlescent gypsum plate with liquid-light radiance to instantly cleanse other crystals, clear stagnant home energy, and channel crown light.',
    description: 'A cornerstone tool for any sacred altar. Selenite has an ultra-high vibrational frequency that never needs cleansing itself. Simply rest your jewelry, bracelets, or crystals on this plate for 4 hours to purge accumulated negative static.',
    category: 'Vastu',
    priceCents: 139900,
    priceInr: 1399,
    compareAtPriceCents: 269900,
    compareAtPriceInr: 2699,
    discountPercent: 48,
    images: ['https://astrotalk.store/cdn/shop/files/1_670fca98-e011-4412-8c9c-f56fa5d8e960.webp?v=1769072419'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/1_670fca98-e011-4412-8c9c-f56fa5d8e960.webp?v=1769072419',
    inventoryCount: 40,
    isActive: true,
    productType: 'physical',
    tags: ['Essential Tool', 'Crown', 'Moon', 'Selenite'],
    chakraAssociation: 'crown',
    chakraAffinity: 'Crown & Soul Star',
    planetaryRuler: 'Moon',
    elementalAssociation: 'Water & Ether',
    crystalSystem: 'Monoclinic',
    mineralType: 'Hydrous Calcium Sulfate (Selenite)',
    frequencyHz: 963,
    model3dType: 'selenite',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Never use water! Cleanse only via moonlight or dry soft silk cloth.\n\nMantra: Om Som Somaya Namah · Om Namo Bhagavate Vasudevaya\n\nSomatic Imprint: Sit near plate during full moon meditation to clear mental fog.\n\nAuspicious Timing: Full Moon (Purnima) night',
    activationRitualJson: {
      cleansing: 'Never use water! Cleanse only via moonlight or dry soft silk cloth.',
      mantra: 'Om Som Somaya Namah · Om Namo Bhagavate Vasudevaya',
      somaticImprint: 'Sit near plate during full moon meditation to clear mental fog.',
      muhurta: 'Full Moon (Purnima) night',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10 as any,
    sku: 'AUM-CRYSTAL-0010',
    slug: 'dhan-lakshmi-abundance-bracelet-lab-certified',
    title: 'Dhan Lakshmi Abundance Bracelet (Lab Certified)',
    shortDescription: 'Natural energized 8mm Pyrite, Citrine, and Tiger Eye beads strung on sacred elastic cord to channel non-stop cashflow and confidence.',
    description: 'Hand-strung and lab-certified for 100% authenticity. Combines the golden fire of Pyrite with the commercial success of Citrine and the sharp focus of Tiger Eye. Designed to be worn on the dominant wrist.',
    category: 'Bracelets',
    priceCents: 79900,
    priceInr: 799,
    compareAtPriceCents: 140000,
    compareAtPriceInr: 1400,
    discountPercent: 43,
    images: ['https://astrotalk.store/cdn/shop/files/image_22_dc7f8b9d-79fb-43e5-8a85-2a66576ca8a4.png?v=1768310652'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/image_22_dc7f8b9d-79fb-43e5-8a85-2a66576ca8a4.png?v=1768310652',
    inventoryCount: 80,
    isActive: true,
    productType: 'physical',
    tags: ['Bestseller', 'Solar Plexus', 'Sun & Jupiter'],
    chakraAssociation: 'solar_plexus',
    chakraAffinity: 'Solar Plexus & Root',
    planetaryRuler: 'Sun & Jupiter',
    elementalAssociation: 'Fire & Earth',
    crystalSystem: 'Isometric & Trigonal',
    mineralType: 'Pyrite + Citrine + Tiger Eye',
    frequencyHz: 528,
    model3dType: 'pyrite',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Rest on Selenite plate for 3 hours before first wear.\n\nMantra: Om Shreem Mahalakshmiyei Namaha (11 times before putting on right wrist)\n\nSomatic Imprint: Wear on right wrist (for action/wealth attraction).\n\nAuspicious Timing: Friday or Sunday morning',
    activationRitualJson: {
      cleansing: 'Rest on Selenite plate for 3 hours before first wear.',
      mantra: 'Om Shreem Mahalakshmiyei Namaha (11 times before putting on right wrist)',
      somaticImprint: 'Wear on right wrist (for action/wealth attraction).',
      muhurta: 'Friday or Sunday morning',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 11 as any,
    sku: 'AUM-CRYSTAL-0011',
    slug: 'vastu-golden-pyrite-kurma-tortoise-altar-relic',
    title: 'Vastu Golden Pyrite Kurma (Tortoise) Altar Relic',
    shortDescription: 'Hand-carved sacred Kurma avatar in pure Pyrite stone to anchor unshakeable financial stability and remove Vastu defects in North/East.',
    description: "In Vastu Shastra, the Tortoise represents Lord Kurma (Vishnu's second avatar) who supported Mount Mandara during the churning of the cosmic ocean. Placing this energized Pyrite tortoise in the North sector draws enduring wealth, career longevity, and protective blessings.",
    category: 'Vastu',
    priceCents: 89900,
    priceInr: 899,
    compareAtPriceCents: 199900,
    compareAtPriceInr: 1999,
    discountPercent: 55,
    images: ['https://astrotalk.store/cdn/shop/files/1_15_a56f33fe-a506-4f96-b300-5532597ba579.jpg?v=1770268007'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/1_15_a56f33fe-a506-4f96-b300-5532597ba579.jpg?v=1770268007',
    inventoryCount: 45,
    isActive: true,
    productType: 'physical',
    tags: ['Bestseller', 'Vastu', 'Saturn & Venus'],
    chakraAssociation: 'root',
    chakraAffinity: 'Root & Solar Plexus',
    planetaryRuler: 'Saturn & Venus',
    elementalAssociation: 'Water & Earth',
    crystalSystem: 'Isometric',
    mineralType: 'Natural Pyrite Stone',
    frequencyHz: 528,
    model3dType: 'pyrite',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Wipe with sandalwood essential oil or rose water mist.\n\nMantra: Om Kurmaya Namah · Om Shreem Hreem Kleem MahaLakshmaye Namah\n\nSomatic Imprint: Place facing East or North on brass plate with raw grains of rice.\n\nAuspicious Timing: Thursday or Friday morning',
    activationRitualJson: {
      cleansing: 'Wipe with sandalwood essential oil or rose water mist.',
      mantra: 'Om Kurmaya Namah · Om Shreem Hreem Kleem MahaLakshmaye Namah',
      somaticImprint: 'Place facing East or North on brass plate with raw grains of rice.',
      muhurta: 'Thursday or Friday morning',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 12 as any,
    sku: 'AUM-CRYSTAL-0012',
    slug: 'vastu-sacred-pyrite-abundance-pyramid',
    title: 'Vastu Sacred Pyrite Abundance Pyramid',
    shortDescription: 'Precision 4-sided sacred geometry pyramid in solid Pyrite designed to funnel cosmic energy directly into workspace or home locker.',
    description: 'Pyramidal geometry amplifies the natural electrical conductivity of Pyrite by 100x. When placed in the North-East (Ishanya) or South-East (Agneya) corner, it neutralizes environmental disharmony and concentrates wealth opportunities.',
    category: 'Vastu',
    priceCents: 99900,
    priceInr: 999,
    compareAtPriceCents: 189900,
    compareAtPriceInr: 1899,
    discountPercent: 47,
    images: ['https://astrotalk.store/cdn/shop/files/Money_Magnet_1b_6.webp?v=1756831989'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/Money_Magnet_1b_6.webp?v=1756831989',
    inventoryCount: 30,
    isActive: true,
    productType: 'physical',
    tags: ['Vastu Essential', 'Solar Plexus', 'Pyramid'],
    chakraAssociation: 'solar_plexus',
    chakraAffinity: 'Solar Plexus',
    planetaryRuler: 'Jupiter & Sun',
    elementalAssociation: 'Fire & Earth',
    crystalSystem: 'Isometric / Pyramidal',
    mineralType: 'Solid Pyrite',
    frequencyHz: 528,
    model3dType: 'pyrite',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Smudge with Guggul or Camphor smoke.\n\nMantra: Om Gam Ganapataye Namaha · Om Shreem Namah\n\nSomatic Imprint: Position on work desk in South-East corner with base aligned to cardinal directions.\n\nAuspicious Timing: Pushya Nakshatra or Wednesday morning',
    activationRitualJson: {
      cleansing: 'Smudge with Guggul or Camphor smoke.',
      mantra: 'Om Gam Ganapataye Namaha · Om Shreem Namah',
      somaticImprint: 'Position on work desk in South-East corner with base aligned to cardinal directions.',
      muhurta: 'Pushya Nakshatra or Wednesday morning',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 13 as any,
    sku: 'AUM-CRYSTAL-0013',
    slug: 'navagraha-9-planetary-harmony-balancing-mala',
    title: 'Navagraha 9-Planetary Harmony Balancing Mala',
    shortDescription: 'Complete 9-gemstone bracelet harmonizing all 9 Grahas (Sun through Ketu) to remove planetary doshas and stabilize life path.',
    description: "Features authentic Ruby/Garnet (Sun), Pearl (Moon), Red Coral (Mars), Emerald/Aventurine (Mercury), Yellow Topaz/Citrine (Jupiter), Diamond/Quartz (Venus), Blue Sapphire/Amethyst (Saturn), Hessonite (Rahu), and Cat's Eye (Ketu). Perfectly balanced by Archana Jain.",
    category: 'Bracelets',
    priceCents: 89900,
    priceInr: 899,
    compareAtPriceCents: 249900,
    compareAtPriceInr: 2499,
    discountPercent: 64,
    images: ['https://astrotalk.store/cdn/shop/files/Gemini_Generated_Image_9tho9f9tho9f9tho.webp?v=1769764805'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/Gemini_Generated_Image_9tho9f9tho9f9tho.webp?v=1769764805',
    inventoryCount: 50,
    isActive: true,
    productType: 'physical',
    tags: ['Astrological', 'Navagraha', 'All Chakras'],
    chakraAssociation: 'crown',
    chakraAffinity: 'All 7 Chakras',
    planetaryRuler: 'All 9 Navagrahas',
    elementalAssociation: 'All 5 Elements (Pancha Mahabhuta)',
    crystalSystem: 'Mixed',
    mineralType: 'Multi-Gemstone Navratna',
    frequencyHz: 432,
    model3dType: 'clear_quartz',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Place in raw milk + Ganga Jal for 15 minutes, then rinse in clean water and dry on Selenite.\n\nMantra: Om Brahma Murari Tripurantkari Bhanuh Shashi Bhumi-Suto Budhashcha | Gurushcha Shukrah Shani-Rahu-Ketavah Sarve Graha Shantikara Bhavantu\n\nSomatic Imprint: Wear on right wrist on Sunday morning at sunrise.\n\nAuspicious Timing: Sunday morning during sunrise',
    activationRitualJson: {
      cleansing: 'Place in raw milk + Ganga Jal for 15 minutes, then rinse in clean water and dry on Selenite.',
      mantra: 'Om Brahma Murari Tripurantkari Bhanuh Shashi Bhumi-Suto Budhashcha | Gurushcha Shukrah Shani-Rahu-Ketavah Sarve Graha Shantikara Bhavantu',
      somaticImprint: 'Wear on right wrist on Sunday morning at sunrise.',
      muhurta: 'Sunday morning during sunrise',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 14 as any,
    sku: 'AUM-CRYSTAL-0014',
    slug: 'karz-mukti-debt-release-hematite-pyrite-set',
    title: 'Karz Mukti (Debt Release) Hematite & Pyrite Set',
    shortDescription: 'High-density Magnetic Hematite and Raw Pyrite pairing designed to systematically dissolve loan burdens, EMIs, and financial fear.',
    description: 'Combines the heavy grounding iron vibration of Hematite (Saturn/Mars release) with the active gold attraction of Pyrite. Together they sever the subconscious scarcity loops that perpetuate financial stagnation.',
    category: 'Combos',
    priceCents: 119900,
    priceInr: 1199,
    compareAtPriceCents: 299900,
    compareAtPriceInr: 2999,
    discountPercent: 60,
    images: ['https://astrotalk.store/cdn/shop/files/2nd_image.jpg?v=1741782935'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/2nd_image.jpg?v=1741782935',
    inventoryCount: 30,
    isActive: true,
    productType: 'physical',
    tags: ['Remedy Set', 'Root & Solar Plexus', 'Saturn & Mars'],
    chakraAssociation: 'root',
    chakraAffinity: 'Root & Solar Plexus',
    planetaryRuler: 'Saturn & Mars',
    elementalAssociation: 'Earth & Metal',
    crystalSystem: 'Trigonal & Isometric',
    mineralType: 'Hematite + Pyrite',
    frequencyHz: 396,
    model3dType: 'black_tourmaline',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Rest in natural sea salt bed for 6 hours.\n\nMantra: Om Rin-Mukteshwaraya Mahadevaya Namaha (108 times)\n\nSomatic Imprint: Hold Hematite in left hand (releasing debt) and Pyrite in right hand (receiving wealth).\n\nAuspicious Timing: Tuesday or Saturday during sunset',
    activationRitualJson: {
      cleansing: 'Rest in natural sea salt bed for 6 hours.',
      mantra: 'Om Rin-Mukteshwaraya Mahadevaya Namaha (108 times)',
      somaticImprint: 'Hold Hematite in left hand (releasing debt) and Pyrite in right hand (receiving wealth).',
      muhurta: 'Tuesday or Saturday during sunset',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 15 as any,
    sku: 'AUM-CRYSTAL-0015',
    slug: 'sampoorna-ganesha-pyrite-altar-idol-consecration-plate',
    title: 'Sampoorna Ganesha Pyrite Altar Idol & Consecration Plate',
    shortDescription: 'Exquisite hand-carved Ganesha idol in natural Pyrite with dedicated Selenite charging plate to remove all obstacles from home & career.',
    description: 'A masterpiece of devotional craftsmanship. The radiant metallic luster of Lord Ganesha in Pyrite permanently anchors Vignaharta (Obstacle Remover) energy at your entrance, office reception, or puja sanctuary.',
    category: 'Combos',
    priceCents: 189900,
    priceInr: 1899,
    compareAtPriceCents: 399900,
    compareAtPriceInr: 3999,
    discountPercent: 53,
    images: ['https://astrotalk.store/cdn/shop/files/Untitled-1_1.webp?v=1757400382'],
    imageUrl: 'https://astrotalk.store/cdn/shop/files/Untitled-1_1.webp?v=1757400382',
    inventoryCount: 25,
    isActive: true,
    productType: 'physical',
    tags: ['Altar Sacred Set', 'Root & Solar Plexus', 'Ganesha'],
    chakraAssociation: 'root',
    chakraAffinity: 'Root & Solar Plexus',
    planetaryRuler: 'Jupiter & Ketu',
    elementalAssociation: 'Earth & Fire',
    crystalSystem: 'Isometric',
    mineralType: 'Solid Pyrite + Moroccan Selenite',
    frequencyHz: 528,
    model3dType: 'pyrite',
    energizedBy: 'Archana Jain (Jaipur Vedic Altar)',
    activationRitualText: 'Offer raw unbroken rice (Akshat) and a drop of pure ittar on idol base.\n\nMantra: Om Shreem Hreem Kleem Glaum Gam Ganapataye Vara Varada Sarvajanam Me Vashamanaya Swaha\n\nSomatic Imprint: Place idol facing North or East on the included Selenite plate.\n\nAuspicious Timing: Ganesh Chaturthi, Shukla Chaturthi, or Wednesday morning',
    activationRitualJson: {
      cleansing: 'Offer raw unbroken rice (Akshat) and a drop of pure ittar on idol base.',
      mantra: 'Om Shreem Hreem Kleem Glaum Gam Ganapataye Vara Varada Sarvajanam Me Vashamanaya Swaha',
      somaticImprint: 'Place idol facing North or East on the included Selenite plate.',
      muhurta: 'Ganesh Chaturthi, Shukla Chaturthi, or Wednesday morning',
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]

export async function listProducts(query: ProductListQuery) {
  try {
    const page = Math.max(1, typeof query.page === 'number' ? query.page : parseInt(String(query.page ?? '1'), 10))
    const limit = Math.min(100, Math.max(1, typeof query.limit === 'number' ? query.limit : parseInt(String(query.limit ?? '50'), 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { isActive: true }
    if (query.category && query.category !== 'All') {
      where.category = query.category
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { shortDescription: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    if (items.length > 0) {
      return {
        products: items.map(toProductView),
        total,
        page,
        limit,
      }
    }
  } catch (e) {
    console.warn('[listProducts] DB query fallback to DEMO_PRODUCTS:', e)
  }

  let filtered = DEMO_PRODUCTS
  if (query.category && query.category !== 'All') {
    filtered = filtered.filter(p => p.category.toLowerCase() === query.category?.toLowerCase())
  }
  if (query.search) {
    const s = query.search.toLowerCase()
    filtered = filtered.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s))
  }

  return {
    products: filtered,
    total: filtered.length,
    page: 1,
    limit: 50,
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    })
    if (product) return toProductView(product)
  } catch (e) {
    console.warn('[getProductBySlug] DB fallback:', e)
  }
  return DEMO_PRODUCTS.find(p => p.slug === slug) ?? null
}

export async function getProductById(id: any) {
  try {
    const numId = typeof id === 'number' ? id : parseInt(String(id), 10)
    if (!isNaN(numId)) {
      const product = await prisma.product.findUnique({
        where: { id: numId },
      })
      if (product) return toProductView(product)
    }
  } catch (e) {
    console.warn('[getProductById] DB fallback:', e)
  }
  return DEMO_PRODUCTS.find(p => String(p.id) === String(id)) ?? null
}

export async function getActiveProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    if (products.length > 0) return products.map(toProductView)
  } catch (e) {
    console.warn('[getActiveProducts] DB fallback to DEMO_PRODUCTS:', e)
  }
  return DEMO_PRODUCTS
}

export async function getActiveProductsByChakra(chakra: string, limit = 4) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { chakraAffinity: { contains: chakra, mode: 'insensitive' } },
          { chakraAssociation: { contains: chakra, mode: 'insensitive' } },
          { tags: { has: chakra } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    if (products.length > 0) return products.map(toProductView)
  } catch (e) {
    console.warn('[getActiveProductsByChakra] DB fallback:', e)
  }
  return DEMO_PRODUCTS.filter(p =>
    (p.chakraAffinity && p.chakraAffinity.toLowerCase().includes(chakra.toLowerCase())) ||
    (p.chakraAssociation && p.chakraAssociation.toLowerCase().includes(chakra.toLowerCase())) ||
    p.tags.some(t => t.toLowerCase().includes(chakra.toLowerCase()))
  ).slice(0, limit)
}

export async function getActiveProductsByCategory(category: string) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, category },
      orderBy: { createdAt: 'desc' },
    })
    if (products.length > 0) return products.map(toProductView)
  } catch (e) {
    console.warn('[getActiveProductsByCategory] DB fallback:', e)
  }
  return DEMO_PRODUCTS.filter(p => p.category.toLowerCase() === category.toLowerCase())
}

export async function createProduct(input: CreateProductInput) {
  const product = await prisma.product.create({
    data: {
      sku: input.sku,
      slug: input.slug,
      title: input.title,
      name: input.title,
      shortDescription: input.shortDescription ?? null,
      description: input.description,
      category: input.category,
      priceINR: input.priceCents / 100,
      priceCents: input.priceCents,
      compareAtPriceCents: input.compareAtPriceCents ?? null,
      currency: input.currency ?? 'INR',
      images: input.images ?? [],
      inventoryCount: input.inventoryCount ?? 0,
      isActive: input.isActive ?? true,
      productType: input.productType ?? 'physical',
      tags: input.tags ?? [],
      metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined,
      chakraAssociation: input.chakraAssociation ?? null,
      chakraAffinity: input.chakraAssociation ?? null,
      healingProperties: input.healingProperties
        ? JSON.parse(JSON.stringify(input.healingProperties))
        : undefined,
    },
  })
  return toProductView(product)
}

export async function updateProduct(input: UpdateProductInput) {
  const { id, ...data } = input
  const updateData: Record<string, unknown> = {}
  if (data.sku !== undefined) updateData.sku = data.sku
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.title !== undefined) {
    updateData.title = data.title
    updateData.name = data.title
  }
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription
  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.priceCents !== undefined) {
    updateData.priceCents = data.priceCents
    updateData.priceINR = data.priceCents / 100
  }
  if (data.compareAtPriceCents !== undefined) updateData.compareAtPriceCents = data.compareAtPriceCents
  if (data.images !== undefined) updateData.images = data.images
  if (data.inventoryCount !== undefined) updateData.inventoryCount = data.inventoryCount
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.productType !== undefined) updateData.productType = data.productType
  if (data.tags !== undefined) updateData.tags = data.tags
  if (data.metadata !== undefined) updateData.metadata = data.metadata
  if (data.chakraAssociation !== undefined) {
    updateData.chakraAssociation = data.chakraAssociation
    updateData.chakraAffinity = data.chakraAssociation
  }
  if (data.healingProperties !== undefined) updateData.healingProperties = data.healingProperties

  const numId = typeof id === 'number' ? id : parseInt(String(id), 10)
  const product = await prisma.product.update({
    where: { id: numId },
    data: updateData,
  })
  return toProductView(product)
}

export async function deleteProduct(id: any) {
  const numId = typeof id === 'number' ? id : parseInt(String(id), 10)
  await prisma.product.update({
    where: { id: numId },
    data: { isActive: false },
  })
}

export async function adjustInventory(productId: any, delta: number) {
  const numId = typeof productId === 'number' ? productId : parseInt(String(productId), 10)
  const product = await prisma.product.update({
    where: { id: numId },
    data: { inventoryCount: { increment: delta } },
  })
  return product
}
