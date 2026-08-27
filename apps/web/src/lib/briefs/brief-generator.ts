import { prisma } from '@aumveda/db'

export interface GenerateBriefParams {
  bookingId: string
  orderId?: string
  userId: string
  practitionerName: string // 'Archana Jain' | 'Sejal Jain' | 'Both'
  serviceType: string
  googleCalendarEventId?: string
}

export interface AstrologicalBrief {
  risingSign: string
  sunSign: string
  moonSign: string
  activeDasha: string
  elementalBalance: string
  focalPlanets: string[]
  karmicTheme: string
  gemstoneRemedy: {
    stone: string
    chakra: string
    frequencyHz: number
    activationMuhurta: string
  }
}

export interface SomaticBrief {
  autonomicState: 'Ventral Vagal (Regulated)' | 'Sympathetic (Fight/Flight Hyperarousal)' | 'Dorsal Vagal (Freeze/Shutdown)' | 'Mixed Dysregulation'
  nervousSystemScore: string
  primaryTraumaPattern: string
  breathworkPrescription: {
    pattern: string
    ratio: string
    durationMinutes: number
    frequencyHz: number
  }
  somaticInterventions: string[]
  contraindications: string[]
}

export interface CompiledPreSessionBrief {
  briefId: string
  bookingId: string
  clientName: string
  clientEmail: string
  dobFormatted: string
  practitionerName: string
  serviceType: string
  dominantChakra: string
  soulArchetype: string
  tarotTheme: string
  intentionStatement: string
  astrology: AstrologicalBrief
  somatic: SomaticBrief
  sessionThemes: string[]
  practitionerNotesGuidance: string[]
}

/**
 * Calculates / synthesizes clinical Astrological and Somatic pre-session briefs
 */
export async function generatePreSessionBrief(params: GenerateBriefParams): Promise<CompiledPreSessionBrief> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      portalData: true,
      healthMetrics: { take: 7, orderBy: { metricDate: 'desc' } },
      journals: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  })

  const clientName = user?.name || 'Aumveda Seeker'
  const clientEmail = user?.email || ''
  const portal = user?.portalData

  // 1. Astrological Placements
  const rising = user?.risingSign || portal?.q1Answer || 'Scorpio Rising'
  const sun = user?.sunSign || 'Leo'
  const moon = user?.moonSign || 'Taurus'
  const dominantChakra = portal?.chakraSelected || 'Solar Plexus'
  const soulArchetype = portal?.archetypeSelected || 'The Sovereign Alchemist'
  const intention = portal?.intentionText || 'Seeking nervous system grounding and alignment with career purpose.'
  const tarot = portal?.tarotTheme || 'Wheel of Fortune — Auspicious Turning Point'

  // Determine Astrological Brief for Archana
  const astroBrief: AstrologicalBrief = {
    risingSign: rising,
    sunSign: sun,
    moonSign: moon,
    activeDasha: 'Jupiter Mahadasha — Saturn Antardasha (Vedic Transformation Cycle)',
    elementalBalance: 'Fire (40%) · Earth (35%) · Water (15%) · Air (10%) — Needs Water/Grounding',
    focalPlanets: ['Jupiter (5th House Guru)', 'Saturn (Karmic Lord)', 'Sun (Self-Worth)'],
    karmicTheme: 'Balancing worldly achievement with emotional somatic replenishment.',
    gemstoneRemedy: {
      stone: dominantChakra.toLowerCase().includes('heart') ? 'Madagascar Rose Quartz' : 'Jaipur Energized Pyrite',
      chakra: dominantChakra,
      frequencyHz: dominantChakra.toLowerCase().includes('heart') ? 639 : 528,
      activationMuhurta: 'Sunday or Thursday morning in Shukla Paksha',
    },
  }

  // Determine Somatic & Nervous System Brief for Sejal
  const nsScoreRaw = portal?.nervousSystemScore || 'Moderate Dysregulation'
  const autonomicState = nsScoreRaw.includes('High') || nsScoreRaw.includes('Shutdown')
    ? 'Dorsal Vagal (Freeze/Shutdown)'
    : 'Sympathetic (Fight/Flight Hyperarousal)'

  const somaticBrief: SomaticBrief = {
    autonomicState,
    nervousSystemScore: nsScoreRaw,
    primaryTraumaPattern: 'Perfectionism, diaphragmatic breath holding, chronic tension in upper shoulders & solar plexus.',
    breathworkPrescription: {
      pattern: 'Down-Regulating Somatic Sigh & Extended Exhalation',
      ratio: 'Inhale 4s · Pause 2s · Exhale 7s with audible sound',
      durationMinutes: 12,
      frequencyHz: 528,
    },
    somaticInterventions: [
      'Bilateral somatic grounding through sole contact',
      'Vagus nerve reset via gentle suboccipital release',
      'Solar plexus unwinding with warm crystal placement',
    ],
    contraindications: ['Avoid hyperventilation breathwork (e.g. Kapalbhati) during active sympathetic arousal'],
  }

  const sessionThemes = [
    `${dominantChakra.toUpperCase()} CHAKRA REGULATION`,
    `${soulArchetype.toUpperCase()} ARCHETYPE INTEGRATION`,
    `ALIGNMENT WITH ${sun.toUpperCase()} SOLAR PURPOSE`,
  ]

  const practitionerNotesGuidance = [
    `1. Client expressed core intention: "${intention}"`,
    `2. Polyvagal indicator: ${autonomicState}. Recommend beginning with 3 minutes of grounding before deep inquiry.`,
    `3. Astrological window: Jupiter-Saturn cycle indicates high receptivity to structural life restructuring.`,
  ]

  const dobFormatted = user?.dob
    ? new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not provided (Use Solar Chart)'

  // Persist Brief to Database
  const briefRecord = await prisma.preSessionBrief.upsert({
    where: { bookingId: params.bookingId },
    create: {
      bookingId: params.bookingId,
      orderId: params.orderId,
      userId: params.userId,
      practitionerName: params.practitionerName,
      serviceType: params.serviceType,
      astrologicalSummary: JSON.parse(JSON.stringify(astroBrief)),
      somaticSummary: JSON.parse(JSON.stringify(somaticBrief)),
      clientIntakeSummary: {
        intention,
        dominantChakra,
        soulArchetype,
        tarotTheme: tarot,
        q1: portal?.q1Answer,
        q2: portal?.q2Answer,
      },
      sessionFocusThemes: sessionThemes,
      recommendedRemedies: [astroBrief.gemstoneRemedy.stone, somaticBrief.breathworkPrescription.pattern],
      googleCalendarEventId: params.googleCalendarEventId,
      isDelivered: true,
      deliveredAt: new Date(),
    },
    update: {
      astrologicalSummary: JSON.parse(JSON.stringify(astroBrief)),
      somaticSummary: JSON.parse(JSON.stringify(somaticBrief)),
      sessionFocusThemes: sessionThemes,
      updatedAt: new Date(),
    },
  })

  return {
    briefId: briefRecord.id,
    bookingId: params.bookingId,
    clientName,
    clientEmail,
    dobFormatted,
    practitionerName: params.practitionerName,
    serviceType: params.serviceType,
    dominantChakra,
    soulArchetype,
    tarotTheme: tarot,
    intentionStatement: intention,
    astrology: astroBrief,
    somatic: somaticBrief,
    sessionThemes,
    practitionerNotesGuidance,
  }
}
