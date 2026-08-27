import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 128)
}

interface SeedProduct {
  name: string
  category: string
  price: number
  mrp: number
  tag: string
  desc: string
  shortDesc: string
  img: string
  chakra: string
  planet: string
  element: string
  crystalSystem: string
  mineralType: string
  frequencyHz: number
  model3dType: string
  energizedBy: string
  activationSteps: {
    cleansing: string
    mantra: string
    somaticImprint: string
    muhurta: string
  }
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Golden Pyrite Altar Cluster (Jaipur Energized)",
    category: "Crystals",
    price: 1899,
    mrp: 3499,
    tag: "Bestseller",
    shortDesc: "Radiant isometric Fool's Gold cluster charged on Archana Jain's Jaipur altar to unlock solar plexus abundance and dissolve debt karma.",
    desc: "Ethically harvested natural Iron Disulfide crystal cluster displaying brassy golden cubic formations. Known in Vedic tradition as 'Svarna Makshika', this cluster vibrates with the solar frequency of Lakshmi and Kubera, grounding wealth consciousness into physical reality.",
    img: "https://astrotalk.store/cdn/shop/files/1_9b96c584-8ca6-4819-8383-3c1a88114477.jpg?v=1769495980",
    chakra: "Solar Plexus",
    planet: "Sun / Jupiter",
    element: "Fire & Earth",
    crystalSystem: "Isometric (Cubic)",
    mineralType: "Iron Disulfide (Pyrite)",
    frequencyHz: 528,
    model3dType: "pyrite",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Place over natural rock salt or raw Selenite plate for 3 hours. Avoid submerging in water.",
      mantra: "Om Shreem Hreem Kleem Glaum Gam Shrimatye Namah (108 repetitions on Sunday sunrise)",
      somaticImprint: "Hold cluster against the upper abdomen (Solar Plexus) during deep diaphragmatic box breathing (4-4-4-4 count).",
      muhurta: "Sunday during Shukla Paksha (Waxing Moon) or Pushya Nakshatra"
    }
  },
  {
    name: "Madagascar Rose Quartz Heart & Anahata Wand",
    category: "Crystals",
    price: 1499,
    mrp: 2799,
    tag: "Staff Pick",
    shortDesc: "Translucent pink crystalline quartz radiating pure unconditional love, emotional somatic release, and heart-brain coherence.",
    desc: "Mined from the pegmatites of Madagascar and hand-polished by master artisans. Rose Quartz emits gentle 639 Hz harmonic vibrations that soothe the autonomic nervous system, releasing stored grief, heartbreak, and emotional hypervigilance.",
    img: "https://astrotalk.store/cdn/shop/files/1_bf2779f4-e5e2-41b2-810b-628123437a5e.jpg?v=1736429424",
    chakra: "Heart",
    planet: "Venus",
    element: "Water",
    crystalSystem: "Trigonal",
    mineralType: "Silicon Dioxide (Rose Quartz)",
    frequencyHz: 639,
    model3dType: "rose_quartz",
    energizedBy: "Sejal Jain (Somatic Sound Sanctuary)",
    activationSteps: {
      cleansing: "Bathe under full moon moonlight for 4 hours or cleanse with pure rose water mist.",
      mantra: "Om Shukraya Namah · Om Aim Hreem Kleem Chamundaye Viche",
      somaticImprint: "Rest the crystal directly on the sternum. Inhale softly for 5s, hold for 2s, exhale with an audible sigh for 7s.",
      muhurta: "Friday morning during Venus Hora"
    }
  },
  {
    name: "Deep Violet Brazilian Amethyst Geode Sanctuary Cluster",
    category: "Crystals",
    price: 2499,
    mrp: 4999,
    tag: "High Vibration",
    shortDesc: "Vibrant royal purple quartz geode invoking deep meditative theta states, third-eye activation, and psychic protection.",
    desc: "Formed millions of years ago in volcanic gas bubbles, this Brazilian Amethyst geode features naturally terminated prismatic quartz crystals rich in ferric iron. It dissolves racing thoughts, mitigates insomnia, and shields the aura from negative psychic interference.",
    img: "https://astrotalk.store/cdn/shop/files/ity48bidmbvrtxtey3lb.webp?v=1742551027",
    chakra: "Third Eye & Crown",
    planet: "Jupiter & Saturn",
    element: "Ether & Air",
    crystalSystem: "Trigonal",
    mineralType: "Silicon Dioxide (Amethyst)",
    frequencyHz: 963,
    model3dType: "amethyst",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Smudge with sacred Himalayan white sage or frankincense resin.",
      mantra: "Om Sham Shanaischaraya Namah · Om Gum Gurave Namah",
      somaticImprint: "Sit in Sukhasana. Hold stone at brow point. Visualize indigo light expanding through the frontal lobe.",
      muhurta: "Thursday or Saturday evening during Twilight (Sandhya Vela)"
    }
  },
  {
    name: "Natural Honey Citrine Abundance Generator",
    category: "Crystals",
    price: 1999,
    mrp: 3899,
    tag: "Bestseller",
    shortDesc: "Warm golden-amber quartz point radiating non-stop commercial prosperity, solar prana, and unshakeable self-worth.",
    desc: "The premier stone of commercial manifestation and wealth multiplication. Unlike heat-treated stones, this natural golden Citrine generator never retains negative energy and continuously charges the auric biofield with optimism, vitality, and career breakthroughs.",
    img: "https://astrotalk.store/cdn/shop/files/price_drop.webp?v=1745301541",
    chakra: "Solar Plexus & Sacral",
    planet: "Sun & Mercury",
    element: "Fire",
    crystalSystem: "Trigonal",
    mineralType: "Silicon Dioxide (Citrine)",
    frequencyHz: 528,
    model3dType: "citrine",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Leave in early morning sunlight (first 45 minutes of dawn) for 30 minutes.",
      mantra: "Om Budhaya Namah · Om Hreem Shreem Lakshmibhayo Namah",
      somaticImprint: "Hold generator in dominant hand, pointing apex upward. Take 7 deep belly breaths.",
      muhurta: "Wednesday or Sunday morning in Shukla Paksha"
    }
  },
  {
    name: "Himalayan Clear Quartz Master Healer Prism",
    category: "Crystals",
    price: 1699,
    mrp: 2999,
    tag: "Master Healer",
    shortDesc: "High-clarity optical grade quartz crystal mined in Himachal Pradesh to amplify intentions, purify chakras, and channel divine light.",
    desc: "Known as 'Sphatik' in Sanskrit scriptures, Clear Quartz is the supreme programmable master crystal. It attunes to the unique vibrational frequency of the user's biofield, harmonizing all seven energy vortices and magnifying other gemstones by 10x.",
    img: "https://astrotalk.store/cdn/shop/files/1_15_a56f33fe-a506-4f96-b300-5532597ba579.jpg?v=1770268007",
    chakra: "All 7 Chakras",
    planet: "Sun & All Grahas",
    element: "Ether (Akasha)",
    crystalSystem: "Hexagonal",
    mineralType: "Pure Silicon Dioxide (Sphatik)",
    frequencyHz: 741,
    model3dType: "clear_quartz",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Wash in running mountain spring water or dilute Ganga Jal.",
      mantra: "Om Namah Shivaya (108 times)",
      somaticImprint: "Hold prism in both palms at heart level, breathing in white luminescent light.",
      muhurta: "Monday morning during Brahma Muhurta (4:00 AM - 5:30 AM)"
    }
  },
  {
    name: "Raw Black Tourmaline Grounding & EMF Shield",
    category: "Crystals",
    price: 1199,
    mrp: 2299,
    tag: "Essential Protection",
    shortDesc: "Dense striated Schorl crystal that roots erratic nervous system energy, repels negative intentions, and neutralizes electromagnetic radiation.",
    desc: "A powerhouse of psychic and physical grounding. Black Tourmaline creates an impermeable energetic perimeter around your living space and bio-field, transmuting toxic thoughtforms and anchoring flight-or-flight panic into solid earth stability.",
    img: "https://astrotalk.store/cdn/shop/files/2nd_image.jpg?v=1741782935",
    chakra: "Root (Muladhara)",
    planet: "Saturn & Rahu",
    element: "Earth (Prithvi)",
    crystalSystem: "Trigonal",
    mineralType: "Complex Borosilicate (Schorl)",
    frequencyHz: 396,
    model3dType: "black_tourmaline",
    energizedBy: "Sejal Jain (Somatic Grounding Protocol)",
    activationSteps: {
      cleansing: "Bury in clean earth/soil for 12 hours or rest on raw Selenite plate.",
      mantra: "Om Lam Muladhara Swaha · Om Rahave Namah",
      somaticImprint: "Place stone between feet on bare floor. Practice 5-minute somatic downward grounding breath.",
      muhurta: "Saturday evening or Amavasya (New Moon)"
    }
  },
  {
    name: "Royal Afghan Lapis Lazuli Intuition Tablet",
    category: "Crystals",
    price: 2199,
    mrp: 4199,
    tag: "Sacred Relic",
    shortDesc: "Deep celestial blue Lazurite studded with golden pyrite specks to activate authentic voice, psychic perception, and ancestral wisdom.",
    desc: "Revered since ancient Vedic times as 'Lajward', this stone of royalty and higher truth bridges the Throat and Third Eye chakras. It empowers fearless truth-telling, dissolves throat tension, and connects the seeker to cosmic memory.",
    img: "https://astrotalk.store/cdn/shop/files/DSC_0932.jpg?v=1741242230",
    chakra: "Throat & Third Eye",
    planet: "Jupiter & Saturn",
    element: "Air & Ether",
    crystalSystem: "Isometric",
    mineralType: "Lazurite with Pyrite & Calcite",
    frequencyHz: 852,
    model3dType: "lapis_lazuli",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Sound bath with Tibetan singing bowl or 852 Hz tuning fork for 3 minutes.",
      mantra: "Om Ham Vishuddhaya Namah · Om Gurave Namah",
      somaticImprint: "Rest tablet against hollow of throat. Chant resonant 'HAM' sound on exhalation.",
      muhurta: "Thursday morning in Shukla Paksha"
    }
  },
  {
    name: "Natural Green Aventurine Heart Healer & Opportunity Stone",
    category: "Crystals",
    price: 1299,
    mrp: 2499,
    tag: "Good Luck",
    shortDesc: "Shimmering green chrome-mica quartz that opens the heart to unexpected synchronicities, financial luck, and rapid emotional healing.",
    desc: "Known as the Stone of Opportunity, Green Aventurine aligns conditions so that luck and auspicious timing become inevitable. It calms cardiac palpitations, dissolves emotional defensiveness, and revitalizes vitality.",
    img: "https://astrotalk.store/cdn/shop/files/with_tag.webp?v=1749116073",
    chakra: "Heart (Anahata)",
    planet: "Mercury & Venus",
    element: "Earth & Water",
    crystalSystem: "Trigonal",
    mineralType: "Silicon Dioxide with Fuchsite",
    frequencyHz: 639,
    model3dType: "emerald",
    energizedBy: "Sejal Jain (Somatic Sound Sanctuary)",
    activationSteps: {
      cleansing: "Rinse under cool filtered water and place next to living green plant for 2 hours.",
      mantra: "Om Yam Anahataya Namah · Om Budhaya Namah",
      somaticImprint: "Press against chest center. Breathe in feeling of unconditional gratitude.",
      muhurta: "Wednesday morning sunrise"
    }
  },
  {
    name: "Raw Moroccan Selenite Sacred Charging Plate & Altar Base",
    category: "Vastu",
    price: 1399,
    mrp: 2699,
    tag: "Essential Tool",
    shortDesc: "Silky pearlescent gypsum plate with liquid-light radiance to instantly cleanse other crystals, clear stagnant home energy, and channel crown light.",
    desc: "A cornerstone tool for any sacred altar. Selenite has an ultra-high vibrational frequency that never needs cleansing itself. Simply rest your jewelry, bracelets, or crystals on this plate for 4 hours to purge accumulated negative static.",
    img: "https://astrotalk.store/cdn/shop/files/1_670fca98-e011-4412-8c9c-f56fa5d8e960.webp?v=1769072419",
    chakra: "Crown & Soul Star",
    planet: "Moon",
    element: "Water & Ether",
    crystalSystem: "Monoclinic",
    mineralType: "Hydrous Calcium Sulfate (Selenite)",
    frequencyHz: 963,
    model3dType: "selenite",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Never use water! Cleanse only via moonlight or dry soft silk cloth.",
      mantra: "Om Som Somaya Namah · Om Namo Bhagavate Vasudevaya",
      somaticImprint: "Sit near plate during full moon meditation to clear mental fog.",
      muhurta: "Full Moon (Purnima) night"
    }
  },
  {
    name: "Dhan Lakshmi Abundance Bracelet (Lab Certified)",
    category: "Bracelets",
    price: 799,
    mrp: 1400,
    tag: "Bestseller",
    shortDesc: "Natural energized 8mm Pyrite, Citrine, and Tiger Eye beads strung on sacred elastic cord to channel non-stop cashflow and confidence.",
    desc: "Hand-strung and lab-certified for 100% authenticity. Combines the golden fire of Pyrite with the commercial success of Citrine and the sharp focus of Tiger Eye. Designed to be worn on the dominant wrist.",
    img: "https://astrotalk.store/cdn/shop/files/image_22_dc7f8b9d-79fb-43e5-8a85-2a66576ca8a4.png?v=1768310652",
    chakra: "Solar Plexus & Root",
    planet: "Sun & Jupiter",
    element: "Fire & Earth",
    crystalSystem: "Isometric & Trigonal",
    mineralType: "Pyrite + Citrine + Tiger Eye",
    frequencyHz: 528,
    model3dType: "pyrite",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Rest on Selenite plate for 3 hours before first wear.",
      mantra: "Om Shreem Mahalakshmiyei Namaha (11 times before putting on right wrist)",
      somaticImprint: "Wear on right wrist (for men/action) or left wrist (for reception/wealth preservation).",
      muhurta: "Friday or Sunday morning"
    }
  },
  {
    name: "Vastu Golden Pyrite Kurma (Tortoise) Altar Relic",
    category: "Vastu",
    price: 899,
    mrp: 1999,
    tag: "Bestseller",
    shortDesc: "Hand-carved sacred Kurma avatar in pure Pyrite stone to anchor unshakeable financial stability and remove Vastu defects in North/East.",
    desc: "In Vastu Shastra, the Tortoise represents Lord Kurma (Vishnu's second avatar) who supported Mount Mandara during the churning of the cosmic ocean. Placing this energized Pyrite tortoise in the North sector draws enduring wealth, career longevity, and protective blessings.",
    img: "https://astrotalk.store/cdn/shop/files/1_15_a56f33fe-a506-4f96-b300-5532597ba579.jpg?v=1770268007",
    chakra: "Root & Solar Plexus",
    planet: "Saturn & Venus",
    element: "Water & Earth",
    crystalSystem: "Isometric",
    mineralType: "Natural Pyrite Stone",
    frequencyHz: 528,
    model3dType: "pyrite",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Wipe with sandalwood essential oil or rose water mist.",
      mantra: "Om Kurmaya Namah · Om Shreem Hreem Kleem MahaLakshmaye Namah",
      somaticImprint: "Place facing East or North on brass or glass plate with a few raw grains of rice.",
      muhurta: "Thursday or Friday morning"
    }
  },
  {
    name: "Vastu Sacred Pyrite Abundance Pyramid",
    category: "Vastu",
    price: 999,
    mrp: 1899,
    tag: "Vastu Essential",
    shortDesc: "Precision 4-sided sacred geometry pyramid in solid Pyrite designed to funnel cosmic energy directly into workspace or home locker.",
    desc: "Pyramidal geometry amplifies the natural electrical conductivity of Pyrite by 100x. When placed in the North-East (Ishanya) or South-East (Agneya) corner, it neutralizes environmental disharmony and concentrates wealth opportunities.",
    img: "https://astrotalk.store/cdn/shop/files/Money_Magnet_1b_6.webp?v=1756831989",
    chakra: "Solar Plexus",
    planet: "Jupiter & Sun",
    element: "Fire & Earth",
    crystalSystem: "Isometric / Pyramidal",
    mineralType: "Solid Pyrite",
    frequencyHz: 528,
    model3dType: "pyrite",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Smudge with Guggul or Camphor smoke.",
      mantra: "Om Gam Ganapataye Namaha · Om Shreem Namah",
      somaticImprint: "Position on work desk in South-East corner with base aligned to cardinal directions.",
      muhurta: "Pushya Nakshatra or Wednesday morning"
    }
  },
  {
    name: "Navagraha 9-Planetary Harmony Balancing Mala",
    category: "Bracelets",
    price: 899,
    mrp: 2499,
    tag: "Astrological",
    shortDesc: "Complete 9-gemstone bracelet harmonizing all 9 Grahas (Sun through Ketu) to remove planetary doshas and stabilize life path.",
    desc: "Features authentic Ruby/Garnet (Sun), Pearl (Moon), Red Coral (Mars), Emerald/Aventurine (Mercury), Yellow Topaz/Citrine (Jupiter), Diamond/Quartz (Venus), Blue Sapphire/Amethyst (Saturn), Hessonite (Rahu), and Cat's Eye (Ketu). Perfectly balanced by Archana Jain.",
    img: "https://astrotalk.store/cdn/shop/files/Gemini_Generated_Image_9tho9f9tho9f9tho.webp?v=1769764805",
    chakra: "All 7 Chakras",
    planet: "All 9 Navagrahas",
    element: "All 5 Elements (Pancha Mahabhuta)",
    crystalSystem: "Mixed",
    mineralType: "Multi-Gemstone Navratna",
    frequencyHz: 432,
    model3dType: "clear_quartz",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Place in raw milk + Ganga Jal for 15 minutes, then rinse in clean water and dry on Selenite.",
      mantra: "Om Brahma Murari Tripurantkari Bhanuh Shashi Bhumi-Suto Budhashcha | Gurushcha Shukrah Shani-Rahu-Ketavah Sarve Graha Shantikara Bhavantu",
      somaticImprint: "Wear on right wrist on Sunday morning at sunrise.",
      muhurta: "Sunday morning during sunrise"
    }
  },
  {
    name: "Karz Mukti (Debt Release) Hematite & Pyrite Set",
    category: "Combos",
    price: 1199,
    mrp: 2999,
    tag: "Remedy Set",
    shortDesc: "High-density Magnetic Hematite and Raw Pyrite pairing designed to systematically dissolve loan burdens, EMIs, and financial fear.",
    desc: "Combines the heavy grounding iron vibration of Hematite (Saturn/Mars release) with the active gold attraction of Pyrite. Together they sever the subconscious scarcity loops that perpetuate financial stagnation.",
    img: "https://astrotalk.store/cdn/shop/files/2nd_image.jpg?v=1741782935",
    chakra: "Root & Solar Plexus",
    planet: "Saturn & Mars",
    element: "Earth & Metal",
    crystalSystem: "Trigonal & Isometric",
    mineralType: "Hematite + Pyrite",
    frequencyHz: 396,
    model3dType: "black_tourmaline",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Rest in natural sea salt bed for 6 hours.",
      mantra: "Om Rin-Mukteshwaraya Mahadevaya Namaha (108 times)",
      somaticImprint: "Hold Hematite in left hand (releasing debt) and Pyrite in right hand (receiving wealth).",
      muhurta: "Tuesday or Saturday during sunset"
    }
  },
  {
    name: "Sampoorna Ganesha Pyrite Altar Idol & Consecration Plate",
    category: "Combos",
    price: 1899,
    mrp: 3999,
    tag: "Altar Sacred Set",
    shortDesc: "Exquisite hand-carved Ganesha idol in natural Pyrite with dedicated Selenite charging plate to remove all obstacles from home & career.",
    desc: "A masterpiece of devotional craftsmanship. The radiant metallic luster of Lord Ganesha in Pyrite permanently anchors Vignaharta (Obstacle Remover) energy at your entrance, office reception, or puja sanctuary.",
    img: "https://astrotalk.store/cdn/shop/files/Untitled-1_1.webp?v=1757400382",
    chakra: "Root & Solar Plexus",
    planet: "Jupiter & Ketu",
    element: "Earth & Fire",
    crystalSystem: "Isometric",
    mineralType: "Solid Pyrite + Moroccan Selenite",
    frequencyHz: 528,
    model3dType: "pyrite",
    energizedBy: "Archana Jain (Jaipur Vedic Altar)",
    activationSteps: {
      cleansing: "Offer raw unbroken rice (Akshat) and a drop of pure ittar (fragrance) on idol base.",
      mantra: "Om Shreem Hreem Kleem Glaum Gam Ganapataye Vara Varada Sarvajanam Me Vashamanaya Swaha",
      somaticImprint: "Place idol facing North or East on the included Selenite plate.",
      muhurta: "Ganesh Chaturthi, Shukla Chaturthi, or Wednesday morning"
    }
  }
]

async function main() {
  console.log('Seeding Crystal Sanctuary and Sacred Products...')

  let created = 0
  let updated = 0

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i]
    const slug = slugify(p.name)
    const sku = `AUM-CRYSTAL-${String(i + 1).padStart(4, '0')}`

    const existing = await prisma.product.findUnique({ where: { slug } })

    const productData = {
      sku,
      slug,
      title: p.name,
      name: p.name,
      shortDescription: p.shortDesc,
      description: p.desc,
      category: p.category,
      priceINR: p.price,
      salePriceINR: p.price,
      priceCents: p.price * 100,
      compareAtPriceCents: p.mrp ? p.mrp * 100 : null,
      images: [p.img],
      stockQuantity: 100,
      inventoryCount: 100,
      isActive: true,
      isPublished: true,
      productType: 'physical',
      tags: p.tag ? [p.tag, p.chakra, p.planet] : [p.chakra, p.planet],
      chakraAffinity: p.chakra,
      chakraAssociation: p.chakra.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      planetaryRuler: p.planet,
      elementalAssociation: p.element,
      crystalSystem: p.crystalSystem,
      mineralType: p.mineralType,
      frequencyHz: p.frequencyHz,
      model3dType: p.model3dType,
      energizedBy: p.energizedBy,
      activationRitualText: `${p.activationSteps.cleansing}\n\nMantra: ${p.activationSteps.mantra}\n\nSomatic Imprint: ${p.activationSteps.somaticImprint}\n\nAuspicious Timing: ${p.activationSteps.muhurta}`,
      activationRitualJson: p.activationSteps,
      healingProperties: {
        chakra: p.chakra,
        planet: p.planet,
        element: p.element,
        frequencyHz: p.frequencyHz,
        benefits: [p.shortDesc, p.activationSteps.somaticImprint]
      }
    }

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: productData
      })
      updated++
    } else {
      await prisma.product.create({
        data: productData
      })
      created++
    }
  }

  console.log(`Products seeded: ${created} created, ${updated} updated.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

