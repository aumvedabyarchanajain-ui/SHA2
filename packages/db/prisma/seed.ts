import { PrismaClient, CourseLevel, EnrollmentStatus, ServiceType } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 128)
}

async function main() {
  console.log('🌱 Starting comprehensive database seed for Aumveda...')

  // ─────────────────────────────────────────────────────────────
  // 1. PRACTITIONER PROFILES & SERVICES
  // ─────────────────────────────────────────────────────────────
  console.log('👉 Seeding Practitioners & Service Offerings...')

  const archana = await prisma.practitionerProfile.upsert({
    where: { slug: 'archana-jain' },
    update: {
      name: 'Archana Jain',
      title: 'Vedic Astrologer & Cosmic Vastu Master',
      bio: 'Archana Jain has over 18 years of experience in classical Vedic Astrology (Jyotish) and Vastu Shastra. She specializes in karmic blueprint analysis, planetary remediations without demolition, and life purpose alignment.',
      specialties: ['Vedic Astrology', 'Vastu Shastra', 'Planetary Remediation', 'Gemology', 'Dasha Timing'],
      languages: ['English', 'Hindi', 'Gujarati'],
      experienceYears: 18,
      hourlyRateINR: 3500.0,
      rating: 5.0,
      reviewCount: 142,
      isActive: true,
      calBookingUrl: 'https://calendly.com/aumveda/archana-jain',
    },
    create: {
      slug: 'archana-jain',
      name: 'Archana Jain',
      title: 'Vedic Astrologer & Cosmic Vastu Master',
      bio: 'Archana Jain has over 18 years of experience in classical Vedic Astrology (Jyotish) and Vastu Shastra. She specializes in karmic blueprint analysis, planetary remediations without demolition, and life purpose alignment.',
      specialties: ['Vedic Astrology', 'Vastu Shastra', 'Planetary Remediation', 'Gemology', 'Dasha Timing'],
      languages: ['English', 'Hindi', 'Gujarati'],
      experienceYears: 18,
      hourlyRateINR: 3500.0,
      rating: 5.0,
      reviewCount: 142,
      isActive: true,
      calBookingUrl: 'https://calendly.com/aumveda/archana-jain',
    },
  })

  const sejal = await prisma.practitionerProfile.upsert({
    where: { slug: 'sejal-jain' },
    update: {
      name: 'Sejal Jain',
      title: 'Somatic Experiencing & Trauma Release Practitioner',
      bio: 'Sejal Jain is an integrative somatic practitioner, certified in Polyvagal Nervous System Regulation, Inner Child Integration, and Clinical EFT Tapping. She guides seekers through nervous system recalibration and deep emotional release.',
      specialties: ['Somatic Experiencing', 'Polyvagal Regulation', 'Inner Child Healing', 'Clinical EFT', 'Biofield Tuning'],
      languages: ['English', 'Hindi'],
      experienceYears: 12,
      hourlyRateINR: 3500.0,
      rating: 4.98,
      reviewCount: 118,
      isActive: true,
      calBookingUrl: 'https://calendly.com/aumveda/sejal-jain',
    },
    create: {
      slug: 'sejal-jain',
      name: 'Sejal Jain',
      title: 'Somatic Experiencing & Trauma Release Practitioner',
      bio: 'Sejal Jain is an integrative somatic practitioner, certified in Polyvagal Nervous System Regulation, Inner Child Integration, and Clinical EFT Tapping. She guides seekers through nervous system recalibration and deep emotional release.',
      specialties: ['Somatic Experiencing', 'Polyvagal Regulation', 'Inner Child Healing', 'Clinical EFT', 'Biofield Tuning'],
      languages: ['English', 'Hindi'],
      experienceYears: 12,
      hourlyRateINR: 3500.0,
      rating: 4.98,
      reviewCount: 118,
      isActive: true,
      calBookingUrl: 'https://calendly.com/aumveda/sejal-jain',
    },
  })

  // Service Offerings
  const offerings = [
    {
      slug: 'vedic-astrology-deep-dive',
      practitionerId: archana.id,
      name: 'Vedic Astrology Birth Chart & Karma Deep-Dive',
      headline: 'Discover your life purpose, career transitions, and planetary remediations',
      description: 'Comprehensive 60-minute 1:1 consultation analyzing your Lagna, Moon Nakshatra, Mahadasha timeline, and personalized gemstone/mantra remediation plan.',
      serviceType: ServiceType.ASTROLOGY_ARCHANA,
      durationMinutes: 60,
      priceINR: 3500.0,
      salePriceINR: null,
    },
    {
      slug: 'cosmic-vastu-consultation',
      practitionerId: archana.id,
      name: 'Cosmic Vastu Residential & Workspace Energy Audit',
      headline: 'Harmonize your living space for prosperity, peace, and health',
      description: 'Complete 90-minute architectural and directional analysis of your floor plan using 16-zone Vastu Purusha Mandala with zero-demolition remedies.',
      serviceType: ServiceType.VASTU_CONSULTATION,
      durationMinutes: 90,
      priceINR: 5500.0,
      salePriceINR: null,
    },
    {
      slug: 'somatic-nervous-system-reset',
      practitionerId: sejal.id,
      name: 'Somatic Trauma Release & Polyvagal Regulation Session',
      headline: 'Recalibrate a dysregulated nervous system and release stored tension',
      description: 'A 60-minute trauma-informed session utilizing somatic experiencing, vagal toning, and gentle pendulation to shift your physiology from chronic survival into felt safety.',
      serviceType: ServiceType.SOMATIC_SEJAL,
      durationMinutes: 60,
      priceINR: 3500.0,
      salePriceINR: null,
    },
    {
      slug: 'inner-child-eft-intensive',
      practitionerId: sejal.id,
      name: 'Inner Child & Emotional Freedom EFT Intensive',
      headline: 'Neutralize core subconscious limiting beliefs and heal attachment wounds',
      description: 'Deep 75-minute emotional freedom and reparenting protocol to resolve childhood conditioning, relationship triggers, and emotional exhaustion.',
      serviceType: ServiceType.MENTORSHIP_INTENSIVE,
      durationMinutes: 75,
      priceINR: 4200.0,
      salePriceINR: null,
    },
  ]

  for (const off of offerings) {
    await prisma.serviceOffering.upsert({
      where: { slug: off.slug },
      update: off,
      create: off,
    })
  }

  // ─────────────────────────────────────────────────────────────
  // 2. 5 CORE LMS ACADEMY COURSES
  // ─────────────────────────────────────────────────────────────
  console.log('👉 Seeding 5 Core LMS Courses, Modules, Lessons & Quizzes...')

  const coursesData = [
    {
      slug: 'somatic-nervous-system-healing',
      title: 'Somatic Nervous System Healing & Polyvagal Mastery',
      subtitle: 'From chronic fight-or-flight to deep embodied safety and vitality',
      description: 'Learn clinically validated polyvagal techniques, somatic experiencing, and vagus nerve stimulation to regulate chronic anxiety, burnout, and freeze states.',
      instructorName: 'Sejal Jain',
      level: CourseLevel.BEGINNER,
      priceINR: 4999.0,
      salePriceINR: 2999.0,
      isPaid: true,
      priceCents: 299900,
      isPublished: true,
      totalDurationMinutes: 120,
      certificateEnabled: true,
      trailerYoutubeId: 'M7lc1UVf-VE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          title: 'Foundations of Polyvagal Theory & Safety Mapping',
          description: 'Understanding your autonomic states and recognizing somatic triggers.',
          sortOrder: 1,
          durationSec: 2520,
          isPreview: true,
          lessons: [
            {
              title: 'The 3 States of Your Autonomic Nervous System',
              description: 'Dorsal Vagal, Sympathetic, and Ventral Vagal hierarchies.',
              youtubeVideoId: 'M7lc1UVf-VE',
              durationSeconds: 1080,
              sortOrder: 1,
              isFreePreview: true,
              reflectionPrompt: 'Notice where in your body you feel tension right now. Are you in dorsal shutdown or sympathetic mobilization?',
              workbookPdfUrl: 'https://assets.aumveda.com/workbooks/somatic-module1.pdf',
            },
            {
              title: 'Vagus Nerve Toning & Somatic Reset Drills',
              description: 'Oculocardiac reflex, physiological sighs, and gentle bilateral stimulation.',
              youtubeVideoId: '86m4RLRzJAw',
              durationSeconds: 1440,
              sortOrder: 2,
              isFreePreview: false,
              reflectionPrompt: 'Practice the 3 physiological sighs. How does your jaw and diaphragm feel after 2 minutes?',
            },
          ],
          quiz: {
            title: 'Polyvagal Assessment & Felt Safety Check',
            passingScorePct: 80,
            questionsJson: [
              {
                id: 'q1',
                question: 'Which branch of the nervous system is responsible for social engagement and calm safety?',
                options: ['Ventral Vagal', 'Sympathetic', 'Dorsal Vagal', 'Enteric'],
                correctIndex: 0,
              },
              {
                id: 'q2',
                question: 'What is the fastest somatic breath pattern to engage parasympathetic tone?',
                options: ['Double inhale through nose followed by long slow exhale through mouth', 'Rapid chest breathing', 'Breath holding on full lungs for 60 seconds', 'Mouth panting'],
                correctIndex: 0,
              },
            ],
          },
        },
        {
          title: 'De-escalating Chronic Freeze & Fight Responses',
          description: 'Titration, somatic boundary building, and emotional discharge.',
          sortOrder: 2,
          durationSec: 2880,
          isPreview: false,
          lessons: [
            {
              title: 'Titration & Pendulation: Working with Stuck Energy',
              description: 'Safely moving between somatic discomfort and grounded island of safety.',
              youtubeVideoId: 'kJQP7kiw5Fk',
              durationSeconds: 1680,
              sortOrder: 1,
              isFreePreview: false,
              reflectionPrompt: 'Locate an anchor of neutral or calm sensation in your body (e.g. soles of your feet).',
            },
            {
              title: 'Evening Somatic Downregulation for Deep Sleep',
              description: 'Nervous system wind-down ritual for restorative sleep.',
              youtubeVideoId: 'fJ9rUzIMcZQ',
              durationSeconds: 1200,
              sortOrder: 2,
              isFreePreview: false,
              reflectionPrompt: 'Log your sleep score before and after implementing this bedtime routine for 3 days.',
            },
          ],
        },
      ],
    },
    {
      slug: 'vedic-astrology-planetary-remediation',
      title: 'Vedic Astrology & Planetary Remediation for Life Purpose',
      subtitle: 'Master your birth chart, dasha timing, and practical remedial measures',
      description: 'A structured immersion into Jyotish fundamentals: decode your Lagna, Nakshatras, Navamsha, and unlock authentic remedial alignment without fear or superstition.',
      instructorName: 'Archana Jain',
      level: CourseLevel.ALL_LEVELS,
      priceINR: 5999.0,
      salePriceINR: 3499.0,
      isPaid: true,
      priceCents: 349900,
      isPublished: true,
      totalDurationMinutes: 150,
      certificateEnabled: true,
      trailerYoutubeId: 'kXYiU_JCYtU',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          title: 'The 12 Houses, Ascendant & Soul Blueprint',
          description: 'Understanding the cosmic architecture of your Janma Kundli.',
          sortOrder: 1,
          durationSec: 4020,
          isPreview: true,
          lessons: [
            {
              title: 'Decoding Your Lagna (Rising Sign) & True Path',
              description: 'Why the Ascendant defines your physical incarnation and purpose.',
              youtubeVideoId: 'kXYiU_JCYtU',
              durationSeconds: 1920,
              sortOrder: 1,
              isFreePreview: true,
              reflectionPrompt: 'Look at your Lagna lord placement. What house themes dominate your life challenges?',
              workbookPdfUrl: 'https://assets.aumveda.com/workbooks/vedic-module1.pdf',
            },
            {
              title: 'The Moon, Nakshatras & Emotional Karma',
              description: 'The 27 Nakshatras and subconscious emotional conditioning.',
              youtubeVideoId: 'JGwWNGJdvx8',
              durationSeconds: 2100,
              sortOrder: 2,
              isFreePreview: false,
              reflectionPrompt: 'Which Nakshatra is your Moon in? Reflect on its deity and core symbolic animal.',
            },
          ],
          quiz: {
            title: 'Astrological Foundations Assessment',
            passingScorePct: 80,
            questionsJson: [
              {
                id: 'q1',
                question: 'Which house in Vedic Astrology governs Dharma and life purpose?',
                options: ['9th House', '6th House', '8th House', '12th House'],
                correctIndex: 0,
              },
              {
                id: 'q2',
                question: 'The Moon in Vedic Astrology primarily represents which aspect of the self?',
                options: ['Manas (Emotional Mind & Perception)', 'Physical Skeleton', 'Ego & Soul Authority', 'Financial Debts'],
                correctIndex: 0,
              },
            ],
          },
        },
        {
          title: 'Planetary Doshas & Practical Vedic Remedies',
          description: 'Ethical, effective remediation through mantra, gemstone, and karma yoga.',
          sortOrder: 2,
          durationSec: 2400,
          isPreview: false,
          lessons: [
            {
              title: 'Navagraha Balancing through Gems, Mantras & Timing',
              description: 'Safe planetary remediation without negative contraindications.',
              youtubeVideoId: 'L_LUpnjgPso',
              durationSeconds: 2400,
              sortOrder: 1,
              isFreePreview: false,
              reflectionPrompt: 'List your current Mahadasha and Antardasha ruler. What remedies suit your chart?',
            },
          ],
        },
      ],
    },
    {
      slug: 'chakra-alignment-biofield-restoration',
      title: 'Chakra Alignment & Energetic Biofield Restoration',
      subtitle: 'Cleanse, harmonize, and revitalize the 7 subtle energy vortexes',
      description: 'Synthesizing ancient Tantric chakra philosophy with modern biofield science. Learn hands-on energetic hygiene, seed syllable mantras (Bija), and crystal resonance.',
      instructorName: 'Archana & Sejal Jain',
      level: CourseLevel.INTERMEDIATE,
      priceINR: 3999.0,
      salePriceINR: 2499.0,
      isPaid: true,
      priceCents: 249900,
      isPublished: true,
      totalDurationMinutes: 100,
      certificateEnabled: true,
      trailerYoutubeId: '3JZ_D3ELwOQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          title: 'Lower Triad: Root, Sacral & Solar Plexus Grounding',
          description: 'Anchoring stability, sexual energy, and willpower.',
          sortOrder: 1,
          durationSec: 3300,
          isPreview: true,
          lessons: [
            {
              title: 'Root Chakra: Anchoring Safety in the Physical Body',
              description: 'Muladhara alignment, earth element, and releasing survival dread.',
              youtubeVideoId: '3JZ_D3ELwOQ',
              durationSeconds: 1500,
              sortOrder: 1,
              isFreePreview: true,
              reflectionPrompt: 'Chant LAM 21 times while visualizing ruby-red roots extending from the base of your spine.',
            },
            {
              title: 'Sacral & Solar Plexus: Flow, Creative Fire & Willpower',
              description: 'Svadhishthana and Manipura balancing rituals.',
              youtubeVideoId: 'CevxZvSJLk8',
              durationSeconds: 1800,
              sortOrder: 2,
              isFreePreview: false,
              reflectionPrompt: 'Where do you hold self-doubt in your solar plexus? Notice the sensation.',
            },
          ],
        },
        {
          title: 'Upper Chakras & Biofield Integration',
          description: 'Heart opening, truthful communication, intuition, and transcendence.',
          sortOrder: 2,
          durationSec: 2100,
          isPreview: false,
          lessons: [
            {
              title: 'Heart, Throat, Third Eye & Crown Harmony',
              description: 'Anahata to Sahasrara energetic bridging.',
              youtubeVideoId: 'YQHsXMglC9A',
              durationSeconds: 2100,
              sortOrder: 1,
              isFreePreview: false,
              reflectionPrompt: 'Place one hand on your heart and one on your throat. Speak your truth aloud.',
            },
          ],
        },
      ],
    },
    {
      slug: 'cosmic-vastu-sacred-space-harmonization',
      title: 'Cosmic Vastu & Sacred Space Harmonization',
      subtitle: 'Align your home and workspace for wealth, harmony, and vitality',
      description: 'Practical architectural Vastu Shastra principles. Diagnose directional energy leaks, activate North-East wealth portals, and cure South-West relationship zones.',
      instructorName: 'Archana Jain',
      level: CourseLevel.ALL_LEVELS,
      priceINR: 4499.0,
      salePriceINR: 2799.0,
      isPaid: true,
      priceCents: 279900,
      isPublished: true,
      totalDurationMinutes: 110,
      certificateEnabled: true,
      trailerYoutubeId: '9bZkp7q19f0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          title: 'Vastu Purusha Mandala & The 16 Directions',
          description: 'Grid layout diagnostics and energy center mapping.',
          sortOrder: 1,
          durationSec: 3900,
          isPreview: true,
          lessons: [
            {
              title: 'Diagnosing Energy Blocks in Your Home & Workspace',
              description: 'Identifying Brahmasthan clutters and directional cuts.',
              youtubeVideoId: '9bZkp7q19f0',
              durationSeconds: 1800,
              sortOrder: 1,
              isFreePreview: true,
              reflectionPrompt: 'Stand in the center of your living space with a compass. What is located in the North-East zone?',
            },
            {
              title: 'Remedies Without Demolition: Pyramids, Metals & Plants',
              description: 'Elemental remedies to balance fire, water, earth, air, and space.',
              youtubeVideoId: 'e-ORhEE9VVg',
              durationSeconds: 2100,
              sortOrder: 2,
              isFreePreview: false,
              reflectionPrompt: 'Check your kitchen fire element placement. Is it aligned with the South-East (Agni) zone?',
            },
          ],
        },
        {
          title: 'Vastu for Wealth, Health & Relationship Peace',
          description: 'Advanced zoning for master bedroom, home office, and entrance doors.',
          sortOrder: 2,
          durationSec: 1680,
          isPreview: false,
          lessons: [
            {
              title: 'The North-East (Ishanya) & South-West (Nairutya) Anchors',
              description: 'Securing stability in relationships and welcoming abundant cosmic energy.',
              youtubeVideoId: 'ZbZSe6N_BXs',
              durationSeconds: 1680,
              sortOrder: 1,
              isFreePreview: false,
              reflectionPrompt: 'Ensure the South-West of your home is the heaviest, highest, and most stable area.',
            },
          ],
        },
      ],
    },
    {
      slug: 'trauma-informed-inner-child-eft',
      title: 'Trauma-Informed Inner Child & Emotional Freedom (EFT)',
      subtitle: 'Heal childhood attachment wounds and reprogram subconscious triggers',
      description: 'A compassionate, evidence-based roadmap combining Inner Child Reparenting, Somatic Parts Work, and Clinical Emotional Freedom Technique (EFT) tapping.',
      instructorName: 'Sejal Jain',
      level: CourseLevel.INTERMEDIATE,
      priceINR: 4999.0,
      salePriceINR: 2999.0,
      isPaid: true,
      priceCents: 299900,
      isPublished: true,
      totalDurationMinutes: 115,
      certificateEnabled: true,
      trailerYoutubeId: 'RgKAFK5djSk',
      thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          title: 'Meeting Your Inner Child & Healing Attachment Wounds',
          description: 'Somatic dialogues and establishing internalized secure attachment.',
          sortOrder: 1,
          durationSec: 3480,
          isPreview: true,
          lessons: [
            {
              title: 'Reparenting Protocols & Somatic Safety for the Younger Self',
              description: 'Giving your younger self the words, validation, and protection they never received.',
              youtubeVideoId: 'RgKAFK5djSk',
              durationSeconds: 1800,
              sortOrder: 1,
              isFreePreview: true,
              reflectionPrompt: 'Write a 3-sentence letter from your present adult self to your 7-year-old self.',
            },
            {
              title: 'Clinical EFT Tapping Sequences for Core Emotional Beliefs',
              description: 'Tapping on the 9 meridian points to clear "I am not enough" beliefs.',
              youtubeVideoId: '09R8_2nJtjg',
              durationSeconds: 1680,
              sortOrder: 2,
              isFreePreview: false,
              reflectionPrompt: 'Rate your emotional intensity (0-10) before and after 3 rounds of EFT tapping.',
            },
          ],
        },
        {
          title: 'Boundary Alchemy & Long-Term Integration',
          description: 'Healthy boundary setting without chronic guilt or fawn responses.',
          sortOrder: 2,
          durationSec: 1500,
          isPreview: false,
          lessons: [
            {
              title: 'Saying No Without Guilt: Embodied Boundary Practice',
              description: 'Recognizing somatic "Yes" vs somatic "No" in relationships.',
              youtubeVideoId: 'OPf0YbXqDm0',
              durationSeconds: 1500,
              sortOrder: 1,
              isFreePreview: false,
              reflectionPrompt: 'Practice holding your core upright and saying a firm, gentle "No" into the mirror.',
            },
          ],
        },
      ],
    },
  ]

  for (const c of coursesData) {
    const { modules, ...courseFields } = c
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        title: courseFields.title,
        subtitle: courseFields.subtitle,
        description: courseFields.description,
        instructorName: courseFields.instructorName,
        level: courseFields.level,
        priceINR: courseFields.priceINR,
        salePriceINR: courseFields.salePriceINR,
        isPaid: courseFields.isPaid,
        priceCents: courseFields.priceCents,
        isPublished: courseFields.isPublished,
        totalDurationMinutes: courseFields.totalDurationMinutes,
        certificateEnabled: courseFields.certificateEnabled,
        trailerYoutubeId: courseFields.trailerYoutubeId,
        thumbnailUrl: courseFields.thumbnailUrl,
      },
      create: {
        slug: courseFields.slug,
        title: courseFields.title,
        subtitle: courseFields.subtitle,
        description: courseFields.description,
        instructorName: courseFields.instructorName,
        level: courseFields.level,
        priceINR: courseFields.priceINR,
        salePriceINR: courseFields.salePriceINR,
        isPaid: courseFields.isPaid,
        priceCents: courseFields.priceCents,
        isPublished: courseFields.isPublished,
        totalDurationMinutes: courseFields.totalDurationMinutes,
        certificateEnabled: courseFields.certificateEnabled,
        trailerYoutubeId: courseFields.trailerYoutubeId,
        thumbnailUrl: courseFields.thumbnailUrl,
      },
    })

    for (const modData of modules) {
      const { lessons, quiz, ...modFields } = modData
      const mod = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: modFields.title,
          description: modFields.description,
          sortOrder: modFields.sortOrder,
          orderIndex: modFields.sortOrder,
          durationSec: modFields.durationSec,
          isPreview: modFields.isPreview,
        },
      })

      for (const lesData of lessons) {
        await prisma.courseLesson.create({
          data: {
            moduleId: mod.id,
            title: lesData.title,
            description: lesData.description,
            youtubeVideoId: lesData.youtubeVideoId,
            durationSeconds: lesData.durationSeconds,
            sortOrder: lesData.sortOrder,
            isFreePreview: lesData.isFreePreview,
            reflectionPrompt: lesData.reflectionPrompt,
            workbookPdfUrl: lesData.workbookPdfUrl,
          },
        })
      }

      if (quiz) {
        await prisma.courseQuiz.create({
          data: {
            moduleId: mod.id,
            title: quiz.title,
            passingScorePct: quiz.passingScorePct,
            questionsJson: quiz.questionsJson,
          },
        })
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. 15 CRYSTAL SANCTUARY SKUS
  // ─────────────────────────────────────────────────────────────
  console.log('👉 Seeding 15 Crystal Sanctuary SKUs...')

  const PRODUCTS = [
    {
      sku: 'AUM-0001',
      name: 'Dhan Lakshmi Sacred Abundance Bracelet',
      category: 'Bracelets',
      price: 799,
      mrp: 1400,
      chakraAffinity: 'Root & Solar Plexus',
      planetaryRuler: 'Venus & Jupiter',
      tag: 'Bestseller',
      desc: 'The Dhan Lakshmi Bracelet combines natural Pyrite, Tiger Eye, and Green Aventurine to attract financial stability, career luck, and energetic protection.',
      img: 'https://astrotalk.store/cdn/shop/files/image_22_dc7f8b9d-79fb-43e5-8a85-2a66576ca8a4.png?v=1768310652',
      ritual: 'Cleanse with raw sage or Ganga Jal. Wear on Friday morning during Shukra Hora while chanting Om Shreem Mahalakshmiyei Namaha 11 times.',
    },
    {
      sku: 'AUM-0002',
      name: 'Vastu Pyrite Tortoise (Kachhua)',
      category: 'Vastu',
      price: 699,
      mrp: 1700,
      chakraAffinity: 'Root',
      planetaryRuler: 'Saturn & Earth',
      tag: 'Bestseller',
      desc: 'In Vastu Shastra, Lord Kurma represents steadfast grounding, wealth accumulation, and longevity. Hand-carved from pure golden Pyrite crystal.',
      img: 'https://astrotalk.store/cdn/shop/files/1_15_a56f33fe-a506-4f96-b300-5532597ba579.jpg?v=1770268007',
      ritual: 'Place in a small glass dish with water facing the North or East direction of your living room or office desk.',
    },
    {
      sku: 'AUM-0003',
      name: 'Money Magnet Triple Action Bracelet',
      category: 'Bracelets',
      price: 699,
      mrp: 1999,
      chakraAffinity: 'Solar Plexus',
      planetaryRuler: 'Mercury & Jupiter',
      tag: 'Sale',
      desc: 'Crafted from authentic Citrine, Pyrite, and Clear Quartz beads to amplify prosperity consciousness and unblock financial stagnation.',
      img: 'https://astrotalk.store/cdn/shop/files/price_drop.webp?v=1745301541',
      ritual: 'Charge under full moonlight. Wear on your dominant receiving hand (left for women, right for men) on Wednesday morning.',
    },
    {
      sku: 'AUM-0004',
      name: 'Raw Pyrite Bracelet with FREE Raw Selenite Plate',
      category: 'Bracelets',
      price: 799,
      mrp: 3099,
      chakraAffinity: 'Solar Plexus & Crown',
      planetaryRuler: 'Sun & Moon',
      tag: 'Sale',
      desc: 'Attract wealth, success, and positive energetic boundaries. Includes a genuine Moroccan Selenite Charging Plate to cleanse crystals overnight.',
      img: 'https://astrotalk.store/cdn/shop/files/1_670fca98-e011-4412-8c9c-f56fa5d8e960.webp?v=1769072419',
      ritual: 'Place bracelet on the Selenite plate every evening to clear accumulated electromagnetic pollution and reset crystal frequencies.',
    },
    {
      sku: 'AUM-0005',
      name: 'Dhan Yog Lab-Certified Astrological Bracelet',
      category: 'Bracelets',
      price: 699,
      mrp: 1999,
      chakraAffinity: 'Heart & Solar Plexus',
      planetaryRuler: 'Jupiter',
      tag: 'Sale',
      desc: 'Formulated according to Vedic Jyotish principles to activate the 2nd (wealth) and 11th (gains) houses of your horoscope.',
      img: 'https://astrotalk.store/cdn/shop/files/new_dhanyog_copy.webp?v=1771411837',
      ritual: 'Activate during Guru Pushya Yoga or on any waxing moon Thursday with saffron tilak.',
    },
    {
      sku: 'AUM-0006',
      name: 'Money Maker High-Frequency Bracelet',
      category: 'Bracelets',
      price: 699,
      mrp: 1999,
      chakraAffinity: 'Solar Plexus & Third Eye',
      planetaryRuler: 'Sun & Mars',
      tag: 'Sale',
      desc: 'Designed for entrepreneurs, traders, and ambitious seekers to boost self-confidence, sharpen decision-making, and magnetize high-value opportunities.',
      img: 'https://astrotalk.store/cdn/shop/files/with_tag.webp?v=1749116073',
      ritual: 'Hold in both palms at the heart center, visualize your annual income goal achieved, and seal with 3 deep breaths.',
    },
    {
      sku: 'AUM-0007',
      name: 'Original Raw Pyrite Cluster (Fool\'s Gold)',
      category: 'Crystals',
      price: 599,
      mrp: 1999,
      chakraAffinity: 'Root & Solar Plexus',
      planetaryRuler: 'Sun',
      tag: 'Sale',
      desc: 'Raw, unpolished Peruvian Pyrite specimen radiating natural golden cubic formations. Acts as an impenetrable shield against negative envy.',
      img: 'https://astrotalk.store/cdn/shop/files/1_9b96c584-8ca6-4819-8383-3c1a88114477.jpg?v=1769495980',
      ritual: 'Place next to cash register, cash locker, or primary computer monitor in the North-East zone.',
    },
    {
      sku: 'AUM-0008',
      name: 'Super Raw Pyrite Bead Energy Bracelet',
      category: 'Bracelets',
      price: 599,
      mrp: 1999,
      chakraAffinity: 'Solar Plexus',
      planetaryRuler: 'Sun',
      tag: 'Sale',
      desc: 'Natural raw tumbled pyrite beads strung on high-tensile silicone thread for active physical grounding and continuous aura shielding.',
      img: 'https://astrotalk.store/cdn/shop/files/New_with_smooky_copy_1.webp?v=1743087196',
      ritual: 'Cleanse with dry sea salt once every fortnight.',
    },
    {
      sku: 'AUM-0009',
      name: 'Navgraha Shanti 9-Planet Balancing Bracelet',
      category: 'Bracelets',
      price: 599,
      mrp: 1999,
      chakraAffinity: 'All 7 Chakras',
      planetaryRuler: 'All 9 Vedic Planets',
      tag: 'Sale',
      desc: 'Harmonizes Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu. Ideal for resolving ongoing Sade Sati or planetary afflictions.',
      img: 'https://astrotalk.store/cdn/shop/files/Gemini_Generated_Image_9tho9f9tho9f9tho.webp?v=1769764805',
      ritual: 'Wear after chanting the Navagraha Stotram on Sunday sunrise.',
    },
    {
      sku: 'AUM-0010',
      name: 'Karz Mukti Debt Relief Bracelet',
      category: 'Bracelets',
      price: 699,
      mrp: 1999,
      chakraAffinity: 'Root',
      planetaryRuler: 'Saturn & Mars',
      tag: 'Sale',
      desc: 'Specifically formulated with Black Obsidian, Hematite, and Bloodstone to break cycles of debt, unnecessary expenses, and financial anxiety.',
      img: 'https://astrotalk.store/cdn/shop/files/2nd_image.jpg?v=1741782935',
      ritual: 'Wear on Tuesday evening while meditating on releasing all past financial attachments.',
    },
    {
      sku: 'AUM-0011',
      name: 'Love & Money Attractor Rose Quartz & Pyrite Bracelet',
      category: 'Bracelets',
      price: 499,
      mrp: 1999,
      chakraAffinity: 'Heart & Solar Plexus',
      planetaryRuler: 'Venus & Jupiter',
      tag: 'Sale',
      desc: 'Blends Madagascar Rose Quartz (universal love, forgiveness) with golden Pyrite (abundance) for harmonious wealth that feels nourishing.',
      img: 'https://astrotalk.store/cdn/shop/files/fqhjs8nhyfsnhwbltljt.webp?v=1742562603',
      ritual: 'Spritz with pure rose water before wearing on Friday morning.',
    },
    {
      sku: 'AUM-0012',
      name: 'Raj Yog Sacred Royal Prosperity Combo',
      category: 'Combos',
      price: 1199,
      mrp: 7996,
      chakraAffinity: 'All Chakras',
      planetaryRuler: 'Sun & Jupiter',
      tag: 'Bundle',
      desc: 'A premium 4-piece spiritual set: Dhan Lakshmi Bracelet, Pyrite Pyramid, Brass Vastu Bell, and Energized Shri Yantra Coin.',
      img: 'https://astrotalk.store/cdn/shop/files/ity48bidmbvrtxtey3lb.webp?v=1742551027',
      ritual: 'Perform full consecration during Diwali or Akshaya Tritiya in your home altar.',
    },
    {
      sku: 'AUM-0013',
      name: 'Richie Rich Multi-Layered Abundance Combo',
      category: 'Combos',
      price: 999,
      mrp: 2999,
      chakraAffinity: 'Solar Plexus & Crown',
      planetaryRuler: 'Jupiter & Mercury',
      tag: 'Sale',
      desc: 'Dual combo pairing Money Magnet Citrine Bracelet with Green Jade Wealth Tree for your living space.',
      img: 'https://astrotalk.store/cdn/shop/files/rrcc5.png?v=1735674639',
      ritual: 'Place Green Jade Tree in the North zone of your home facing inwards.',
    },
    {
      sku: 'AUM-0014',
      name: 'Money & Love Rose Quartz Duo Set',
      category: 'Combos',
      price: 949,
      mrp: 2999,
      chakraAffinity: 'Heart & Solar Plexus',
      planetaryRuler: 'Venus & Sun',
      tag: 'Sale',
      desc: 'Two matching bracelets for couples or seekers wishing to harmonize both professional prosperity and emotional intimacy.',
      img: 'https://astrotalk.store/cdn/shop/files/1_bf2779f4-e5e2-41b2-810b-628123437a5e.jpg?v=1736429424',
      ritual: 'Wear simultaneously on left and right wrists to balance Yin (receptive) and Yang (action) energies.',
    },
    {
      sku: 'AUM-0015',
      name: 'Pyrite Sacred Geometry Money Magnet Pyramid',
      category: 'Vastu',
      price: 999,
      mrp: 1700,
      chakraAffinity: 'Root & Solar Plexus',
      planetaryRuler: 'Sun & Earth',
      tag: 'Bestseller',
      desc: 'Concentrates ambient prana and directs wealth energy upwards through the 51.5-degree apex geometry.',
      img: 'https://astrotalk.store/cdn/shop/files/Money_Magnet_1b_6.webp?v=1756831989',
      ritual: 'Place on your accounting books, safe deposit box, or South-East zone of your office.',
    },
  ]

  for (const p of PRODUCTS) {
    const slug = slugify(p.name)
    await prisma.product.upsert({
      where: { slug },
      update: {
        sku: p.sku,
        title: p.name,
        name: p.name,
        description: p.desc,
        category: p.category,
        chakraAffinity: p.chakraAffinity,
        planetaryRuler: p.planetaryRuler,
        priceINR: p.price,
        salePriceINR: p.mrp ? p.mrp : null,
        priceCents: p.price * 100,
        compareAtPriceCents: p.mrp ? p.mrp * 100 : null,
        images: [p.img],
        activationRitualText: p.ritual,
        inventoryCount: 100,
        stockQuantity: 100,
        isActive: true,
        isPublished: true,
        productType: 'physical',
        tags: p.tag ? [p.tag] : [],
      },
      create: {
        sku: p.sku,
        slug,
        title: p.name,
        name: p.name,
        description: p.desc,
        category: p.category,
        chakraAffinity: p.chakraAffinity,
        planetaryRuler: p.planetaryRuler,
        priceINR: p.price,
        salePriceINR: p.mrp ? p.mrp : null,
        priceCents: p.price * 100,
        compareAtPriceCents: p.mrp ? p.mrp * 100 : null,
        images: [p.img],
        activationRitualText: p.ritual,
        inventoryCount: 100,
        stockQuantity: 100,
        isActive: true,
        isPublished: true,
        productType: 'physical',
        tags: p.tag ? [p.tag] : [],
      },
    })
  }

  // ─────────────────────────────────────────────────────────────
  // 4. CORE REFERENCE DATA (Chakras, Archetypes, Tarot, etc.)
  // ─────────────────────────────────────────────────────────────
  console.log('👉 Seeding Core Reference Data (Chakras, Archetypes, Tarot)...')

  const chakras = [
    { chakraName: 'root', heading: 'You feel ungrounded', sub: 'Safety & Survival', blockedText: 'This chakra is blocked when you feel unsafe, anxious about money, or disconnected from your body.', showsUpAs: 'You overthink. You worry about stability. You feel like you\'re always in survival mode.' },
    { chakraName: 'sacral', heading: 'Your creativity is blocked', sub: 'Pleasure & Flow', blockedText: 'This chakra is blocked when you feel guilty about pleasure, struggle with intimacy, or feel creatively stuck.', showsUpAs: 'You feel numb. You\'ve lost passion. You struggle to receive joy without guilt.' },
    { chakraName: 'solar_plexus', heading: 'Your power is fading', sub: 'Confidence & Will', blockedText: 'This chakra is blocked when you doubt yourself, seek external validation, or feel powerless.', showsUpAs: 'You second-guess everything. You let others decide for you. You feel invisible.' },
    { chakraName: 'heart', heading: 'Your heart is guarded', sub: 'Love & Connection', blockedText: 'This chakra is blocked when you\'ve been hurt, struggle to trust, or give more than you receive.', showsUpAs: 'You push people away. You fear vulnerability. You feel lonely even in a room full of people.' },
    { chakraName: 'throat', heading: 'Your voice is trapped', sub: 'Truth & Expression', blockedText: 'This chakra is blocked when you swallow your words, fear judgment, or feel unheard.', showsUpAs: 'You say yes when you mean no. You hold back your truth. Your throat tightens when you need to speak.' },
    { chakraName: 'third_eye', heading: 'Your intuition is clouded', sub: 'Insight & Vision', blockedText: 'This chakra is blocked when you over-rely on logic, ignore gut feelings, or feel disconnected.', showsUpAs: 'You mistake anxiety for intuition. You overthink every decision.' },
    { chakraName: 'crown', heading: 'You feel spiritually disconnected', sub: 'Purpose & Transcendence', blockedText: 'This chakra is blocked when you feel lost, lack purpose, or question your place in the universe.', showsUpAs: 'You feel empty despite having everything. You wonder "what\'s the point?"' },
  ]
  for (const c of chakras) {
    await prisma.chakraReveal.upsert({ where: { chakraName: c.chakraName }, update: c, create: c })
  }

  const archetypes = [
    { name: 'warrior', icon: 'sword', gift: 'Courage, resilience, action', wound: 'You don\'t know when to stop fighting. Rest feels like failure.', showsUpAs: 'You push through pain. You take on everyone\'s battles.' },
    { name: 'lover', icon: 'heart', gift: 'Deep feeling, devotion, emotional intelligence', wound: 'You lose yourself in others. Your worth is tied to how much you give.', showsUpAs: 'You overgive. You stay too long. You mistake intensity for intimacy.' },
    { name: 'sage', icon: 'eye', gift: 'Wisdom, discernment, clarity', wound: 'You live in your head. You intellectualise to avoid feeling.', showsUpAs: 'You analyse everything. You struggle to cry. You feel disconnected from your body.' },
    { name: 'innocent', icon: 'star', gift: 'Optimism, faith, openness', wound: 'You trust people who haven\'t earned it.', showsUpAs: 'You see the best in everyone. You get disappointed often. You struggle with boundaries.' },
    { name: 'caregiver', icon: 'hands', gift: 'Compassion, nurturing, service', wound: 'Your self-worth is tied to how much you help others.', showsUpAs: 'You show up for everyone. You\'re exhausted. You don\'t know what you need.' },
    { name: 'creator', icon: 'flame', gift: 'Vision, innovation, expression', wound: 'You start boldly but abandon mid-way. Nothing ever feels good enough.', showsUpAs: 'You have 10 unfinished projects. You compare yourself to everyone\'s highlight reel.' },
  ]
  for (const a of archetypes) {
    await prisma.archetypeReveal.upsert({ where: { name: a.name }, update: a, create: a })
  }

  const themes = [
    { themeName: 'transformation', message: 'You are being asked to release what no longer serves you.', cardNames: ['Death', 'Tower', 'Wheel of Fortune', 'Judgement'] },
    { themeName: 'awakening', message: 'A new chapter is calling your name. Trust the unfolding.', cardNames: ['The Star', 'The Sun', 'The World', 'The Fool'] },
    { themeName: 'inner_work', message: 'The answers are not outside. Go inward.', cardNames: ['The Hermit', 'The Moon', 'The High Priestess', 'The Hanged Man'] },
    { themeName: 'power_will', message: 'You have more power than you think. Take the reins.', cardNames: ['The Magician', 'The Chariot', 'Strength', 'The Emperor'] },
    { themeName: 'love_relationships', message: 'The heart wants what it wants — but it also needs what it needs.', cardNames: ['The Lovers', 'The Empress', 'The Hierophant'] },
    { themeName: 'surrender', message: 'Not everything is yours to control. Surrender is the highest form of trust.', cardNames: ['Temperance', 'Justice', 'The Devil'] },
    { themeName: 'purpose_path', message: 'You are being called to your purpose.', cardNames: ['The Emperor', 'The Hierophant', 'The World'] },
  ]
  for (const t of themes) {
    await prisma.tarotTheme.upsert({ where: { themeName: t.themeName }, update: t, create: t })
  }

  // Chart Predictions
  const placements = ['sun', 'moon', 'rising']
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
  for (const placement of placements) {
    for (const sign of signs) {
      const predictionText = `${placement === 'sun' ? 'Your core self' : placement === 'moon' ? 'Your emotional world' : 'Your public mask'} in ${sign.charAt(0).toUpperCase() + sign.slice(1)}.`
      await prisma.chartPrediction.upsert({
        where: { placementType_sign: { placementType: placement, sign } },
        update: { predictionText },
        create: { placementType: placement, sign, predictionText },
      })
    }
  }

  // Sample Cosmic Note
  const weekStart = new Date()
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const existingNote = await prisma.cosmicNote.findFirst({
    where: { title: 'This week: soft landings' },
  })
  if (!existingNote) {
    await prisma.cosmicNote.create({
      data: {
        title: 'This week: soft landings',
        body: 'The cosmos asks for gentleness, not force. Notice where you grip — jaw, shoulders, breath — and loosen one place at a time. Your practice this week is permission to arrive unfinished.',
        weekOf: weekStart,
        isPublished: true,
        publishedAt: new Date(),
      },
    })
  }

  // Pattern Questions
  const questions = [
    { questionId: 'q1', questionText: 'How does your sleep look most nights?', dimension: 'sleep', options: { A: 'Sleep deeply, wake rested', B: 'Fall asleep but wake anxious/tired', C: 'Mind races — sleep feels impossible', D: 'Sleep too much — it\'s my escape' } },
    { questionId: 'q2', questionText: 'How would you describe your overall mood lately?', dimension: 'mood', options: { A: 'Mostly stable, natural ups & downs', B: 'Anxious and on edge', C: 'Numb and flat — nothing excites me', D: 'All over the place — unpredictable' } },
    { questionId: 'q3', questionText: 'When something stressful happens, how do you respond?', dimension: 'nervous', options: { A: 'Feel it, deal with it, move on', B: 'Overthink for days', C: 'Shut down and withdraw', D: 'Explode — then feel guilty later' } },
    { questionId: 'q4', questionText: 'How do your closest relationships feel right now?', dimension: 'relations', options: { A: 'Nourishing and supportive', B: 'I give more than I receive', C: 'Distant — I struggle to let people in', D: 'Complicated and painful' } },
    { questionId: 'q5', questionText: 'How do you feel about money right now?', dimension: 'finances', options: { A: 'Stable — I feel secure', B: 'Anxious — never enough', C: 'Blocked — I self-sabotage', D: 'Complicated — flows out fast' } },
    { questionId: 'q6', questionText: 'How would you describe your relationship with parents?', dimension: 'parents', options: { A: 'Healthy and loving', B: 'Complicated — they don\'t know me', C: 'Distant or absent', D: 'Painful — wounds haven\'t healed' } },
    { questionId: 'q7', questionText: 'When you think about childhood, what feeling comes up?', dimension: 'childhood', options: { A: 'Warmth — mostly safe', B: 'Pressure — grew up too fast', C: 'Loneliness — never belonged', D: 'Confusion — unpredictable' } },
  ]
  for (const q of questions) {
    await prisma.patternQuestion.upsert({ where: { questionId: q.questionId }, update: q, create: q })
  }

  // Pattern Scoring
  const scoring = [
    { questionId: 'q1', answer: 'A', dimension: 'nervous_system', dimensionValue: 'REGULATED' },
    { questionId: 'q1', answer: 'B', dimension: 'nervous_system', dimensionValue: 'ANXIOUS' },
    { questionId: 'q1', answer: 'C', dimension: 'nervous_system', dimensionValue: 'HYPERACTIVE' },
    { questionId: 'q1', answer: 'D', dimension: 'nervous_system', dimensionValue: 'SHUTDOWN' },
    { questionId: 'q2', answer: 'A', dimension: 'nervous_system', dimensionValue: 'REGULATED' },
    { questionId: 'q2', answer: 'B', dimension: 'nervous_system', dimensionValue: 'ANXIOUS' },
    { questionId: 'q2', answer: 'C', dimension: 'nervous_system', dimensionValue: 'SHUTDOWN' },
    { questionId: 'q2', answer: 'D', dimension: 'nervous_system', dimensionValue: 'HYPERACTIVE' },
    { questionId: 'q3', answer: 'A', dimension: 'nervous_system', dimensionValue: 'REGULATED' },
    { questionId: 'q3', answer: 'B', dimension: 'nervous_system', dimensionValue: 'HYPERACTIVE' },
    { questionId: 'q3', answer: 'C', dimension: 'nervous_system', dimensionValue: 'SHUTDOWN' },
    { questionId: 'q3', answer: 'D', dimension: 'nervous_system', dimensionValue: 'FIGHT' },
    { questionId: 'q4', answer: 'A', dimension: 'relationship', dimensionValue: 'SECURE' },
    { questionId: 'q4', answer: 'B', dimension: 'relationship', dimensionValue: 'PEOPLE_PLEASING' },
    { questionId: 'q4', answer: 'C', dimension: 'relationship', dimensionValue: 'AVOIDANT' },
    { questionId: 'q4', answer: 'D', dimension: 'relationship', dimensionValue: 'REPEATING_PATTERNS' },
    { questionId: 'q5', answer: 'A', dimension: 'financial', dimensionValue: 'SECURE' },
    { questionId: 'q5', answer: 'B', dimension: 'financial', dimensionValue: 'SCARCITY' },
    { questionId: 'q5', answer: 'C', dimension: 'financial', dimensionValue: 'SELF_SABOTAGE' },
    { questionId: 'q5', answer: 'D', dimension: 'financial', dimensionValue: 'LEAKY_BUCKET' },
    { questionId: 'q6', answer: 'A', dimension: 'childhood', dimensionValue: 'SECURE_ATTACHMENT' },
    { questionId: 'q6', answer: 'B', dimension: 'childhood', dimensionValue: 'EMOTIONAL_NEGLECT' },
    { questionId: 'q6', answer: 'C', dimension: 'childhood', dimensionValue: 'ABSENT_ATTACHMENT' },
    { questionId: 'q6', answer: 'D', dimension: 'childhood', dimensionValue: 'WOUNDED_ATTACHMENT' },
    { questionId: 'q7', answer: 'A', dimension: 'childhood', dimensionValue: 'SECURE_ATTACHMENT' },
    { questionId: 'q7', answer: 'B', dimension: 'childhood', dimensionValue: 'PARENTIFIED' },
    { questionId: 'q7', answer: 'C', dimension: 'childhood', dimensionValue: 'LONELY_ABANDONED' },
    { questionId: 'q7', answer: 'D', dimension: 'childhood', dimensionValue: 'WOUNDED_ATTACHMENT' },
  ]
  for (const s of scoring) {
    await prisma.patternScoring.upsert({ where: { questionId_answer: { questionId: s.questionId, answer: s.answer } }, update: s, create: s })
  }

  // Pattern Profiles
  const profiles = [
    { profileName: 'anxious_achiever', nsMatch: 'ANXIOUS or HYPERACTIVE', relMatch: 'PEOPLE_PLEASING', childhoodMatch: 'PARENTIFIED or EMOTIONAL_NEGLECT', profileText: 'You are driven, high-achieving, and exhausted. Your healing path: nervous system regulation first.' },
    { profileName: 'frozen_heart', nsMatch: 'SHUTDOWN', relMatch: 'AVOIDANT', childhoodMatch: 'ABSENT or LONELY/ABANDONED', profileText: 'You\'ve learned it\'s safer to feel nothing. Your healing path: gentle somatic work to thaw.' },
    { profileName: 'wounded_warrior', nsMatch: 'FIGHT', relMatch: 'REPEATING_PATTERNS', childhoodMatch: 'WOUNDED or UNSAFE/TRAUMATIC', profileText: 'You fight because you\'ve had to. Your healing path: trauma release + inner child work.' },
    { profileName: 'silent_sufferer', nsMatch: 'ANXIOUS', relMatch: 'AVOIDANT', childhoodMatch: 'EMOTIONAL_NEGLECT', profileText: 'You carry everything alone. Your healing path: breathwork + finding your voice.' },
    { profileName: 'lost_soul', nsMatch: 'SHUTDOWN', relMatch: 'PEOPLE_PLEASING', childhoodMatch: 'LONELY/ABANDONED', profileText: 'You\'ve felt you don\'t belong. Your healing path: belonging + self-worth practices.' },
    { profileName: 'awakening_one', nsMatch: 'REGULATED', relMatch: 'SECURE', childhoodMatch: 'MOSTLY SECURE', profileText: 'You have a strong foundation. Your healing path: purpose, alignment, spiritual growth.' },
  ]
  for (const p of profiles) {
    await prisma.patternProfile.upsert({ where: { profileName: p.profileName }, update: p, create: p })
  }

  console.log('✅ Seeding complete: All 5 LMS courses, 15 SKUs, practitioner profiles, and reference data populated!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
