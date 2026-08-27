import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SAMPLE_COURSES = [
  {
    slug: 'nervous-system-mastery',
    title: '7-Day Nervous System Reset & Somatic Awakening',
    subtitle: 'Rewire chronic stress patterns, activate the vagal brake, and reclaim somatic safety through Neuro-Vedic protocols.',
    description: 'A transformative 7-day experiential journey combining modern polyvagal neuroscience with ancient Vedic pranayama, somatic tremor release, and marma point recalibration. Guided step-by-step by Archana and Sejal Jain.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    trailerYoutubeId: 'M7lc1UVf-VE',
    instructorName: 'Archana & Sejal Jain',
    level: 'ALL_LEVELS' as const,
    priceINR: 0,
    salePriceINR: null,
    isPaid: false,
    isPublished: true,
    totalDurationMinutes: 72,
    certificateEnabled: true,
    modules: [
      {
        title: 'Module 1: Foundations of Neuro-Vedic Regulation',
        description: 'Understand the biological architecture of your nervous system and calibrate your somatic baseline.',
        sortOrder: 1,
        durationSec: 2260,
        isPreview: true,
        lessons: [
          {
            title: '1. Mapping the Vagus Nerve Through the Vedic Lens',
            description: 'Discover how Cranial Nerve X interfaces with the Sushumna Nadi and why ancient sages emphasized the breath-heart connection.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 720,
            sortOrder: 1,
            isFreePreview: true,
            reflectionPrompt: 'Where in your physical body (jaw, throat, belly, shoulders) do you habitually hold unexpressed fight-or-flight tension?',
          },
          {
            title: '2. Pranayama Protocols for Sympathetic Downregulation',
            description: 'Learn the exact 4-7-8 ratio and Chandra Bhedana (Left Nostril Breathing) to rapidly switch off cortisol surges.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 890,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'How did your heart rate, breath depth, and internal chatter shift after completing the 5-minute lunar pranayama?',
          },
          {
            title: '3. Somatic Shaking & Cellular Discharge',
            description: 'Unlock the natural mammalian tremoring reflex to discharge trapped adrenaline from the psoas muscles.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 650,
            sortOrder: 3,
            isFreePreview: false,
            reflectionPrompt: 'What emotions or sensations surfaced when giving your body full permission to shake and unwind without judgment?',
          },
        ],
        quizzes: [
          {
            title: 'Module 1 Assessment: Neuro-Vedic Biology & Regulation',
            passingScorePct: 80,
            questionsJson: [
              {
                id: 'q1',
                question: 'Which cranial nerve is primarily responsible for the parasympathetic rest-and-digest response?',
                options: [
                  'Trigeminal Nerve (Cranial Nerve V)',
                  'Vagus Nerve (Cranial Nerve X)',
                  'Optic Nerve (Cranial Nerve II)',
                  'Sciatic Nerve',
                ],
                correctIndex: 1,
                explanation: 'The Vagus Nerve (Cranial Nerve X) carries 80% of afferent sensory signals from the heart and viscera to the brainstem.',
              },
              {
                id: 'q2',
                question: 'What physiological change occurs when you extend your exhalation longer than your inhalation?',
                options: [
                  'Heart rate increases and cortisol spikes',
                  'The vagal brake engages, slowing heart rate and inducing calm',
                  'Oxygen levels drop to dangerous levels',
                  'Sympathetic tone accelerates',
                ],
                correctIndex: 1,
                explanation: 'Long exhalations stimulate the vagus nerve to release acetylcholine, naturally braking cardiovascular acceleration.',
              },
              {
                id: 'q3',
                question: 'In Ayurvedic energetics, which sub-dosha of Vata is responsible for downward grounding and nervous system settling?',
                options: [
                  'Prana Vayu',
                  'Apana Vayu',
                  'Udana Vayu',
                  'Vyana Vayu',
                ],
                correctIndex: 1,
                explanation: 'Apana Vayu governs elimination, grounded pelvic stability, and downward anchoring of hyperactive mental energy.',
              },
            ],
          },
        ],
      },
      {
        title: 'Module 2: Polyvagal Restructuring & Safe Social Engagement',
        description: 'Transition out of functional freeze and establish profound somatic trust in your relationships.',
        sortOrder: 2,
        durationSec: 2060,
        isPreview: false,
        lessons: [
          {
            title: '4. Thawing the Dorsal Vagal Freeze Response',
            description: 'Gentle micro-movements and orienting exercises to gently thaw dissociation and emotional numbness.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 940,
            sortOrder: 1,
            isFreePreview: false,
            reflectionPrompt: 'What tiny, tangible signal tells you that you have slipped from safety into emotional shutdown or withdrawal?',
          },
          {
            title: '5. The Sacred Energetic Boundary Ritual',
            description: 'Establish impenetrable energetic containment using aura sealing mantras and somatic posture alignment.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 780,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'Where in your daily life do you need to replace people-pleasing over-giving with a clean, loving boundary?',
          },
          {
            title: '6. Integration & Living in Ventral Vagal Presence',
            description: 'Daily neuro-vedic maintenance plan to sustain baseline resilience throughout high-demand seasons.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 340,
            sortOrder: 3,
            isFreePreview: false,
            reflectionPrompt: 'Write three non-negotiable daily anchors that return you directly home to your calmest, most centered self.',
          },
        ],
        quizzes: [
          {
            title: 'Module 2 Assessment: Polyvagal Mastery & Integration',
            passingScorePct: 80,
            questionsJson: [
              {
                id: 'q1',
                question: 'Which state in Stephen Porges\' Polyvagal hierarchy corresponds to biological safety, social connection, and vocal prosody?',
                options: [
                  'Dorsal Vagal Shutdown',
                  'Sympathetic Flight/Fight',
                  'Ventral Vagal Complex',
                  'Dissociative Shock',
                ],
                correctIndex: 2,
                explanation: 'The Ventral Vagal state mediates feelings of safety, authentic eye contact, compassion, and open facial expressions.',
              },
              {
                id: 'q2',
                question: 'When emerging from dorsal vagal shutdown, what intermediate state is commonly experienced first?',
                options: [
                  'Instant blissful meditation',
                  'Sympathetic mobilization (restlessness, tingling, or anxiety)',
                  'Coma-like sleep',
                  'Total intellectual detachment',
                ],
                correctIndex: 1,
                explanation: 'To move from freeze to safety, the nervous system must pass through sympathetic mobilization as energy unthaws.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'vedic-chakra-alchemy',
    title: 'Vedic Chakra Alchemy: Harmonizing the 7 Sacred Vortices',
    subtitle: 'Clear karmic imprints, restore energetic velocity, and balance your subtle body with Bija vibrations and crystal therapies.',
    description: 'An immersive deep dive into the seven energetic chakras according to the classical Shat-Chakra-Nirupana and modern somatic psychology. Master diagnostic awareness, sound frequencies, and crystal pairings.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    trailerYoutubeId: 'M7lc1UVf-VE',
    instructorName: 'Archana Jain',
    level: 'BEGINNER' as const,
    priceINR: 1499,
    salePriceINR: 999,
    isPaid: true,
    isPublished: true,
    totalDurationMinutes: 95,
    certificateEnabled: true,
    modules: [
      {
        title: 'Module 1: The Lower Triangle (Root, Sacral, Solar Plexus)',
        description: 'Grounding survival instinct, liberating sensual creativity, and building authentic willpower.',
        sortOrder: 1,
        durationSec: 2800,
        isPreview: true,
        lessons: [
          {
            title: '1. Muladhara: Establishing Earth Safety & Financial Grounding',
            description: 'Awaken the red lotus at the base of the spine. Dissolve scarcity fears with LAM seed resonance.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 920,
            sortOrder: 1,
            isFreePreview: true,
            reflectionPrompt: 'When you contemplate money and shelter, does your body feel rooted like an ancient banyan tree or adrift in wind?',
          },
          {
            title: '2. Svadhisthana: Fluidity, Sensuality & Creative Release',
            description: 'Unblock emotional rigidity with water element meditation and VAM vibration.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 960,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'What creative impulse or joyful desire have you withheld from yourself because it felt "unproductive"?',
          },
          {
            title: '3. Manipura: Igniting Solar Power Without Burnout',
            description: 'Balance the digestive fire (Agni) and cultivate unshakable self-confidence.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 920,
            sortOrder: 3,
            isFreePreview: false,
            reflectionPrompt: 'Where do you surrender your personal authority to avoid external confrontation?',
          },
        ],
        quizzes: [
          {
            title: 'Module 1 Assessment: Lower Triangle Alchemy',
            passingScorePct: 80,
            questionsJson: [
              {
                id: 'q1',
                question: 'What is the Bija (seed sound) corresponding to the Muladhara (Root) chakra?',
                options: ['YAM', 'RAM', 'LAM', 'VAM'],
                correctIndex: 2,
                explanation: 'LAM is the primal seed sound that stimulates earth resonance and physical stability.',
              },
              {
                id: 'q2',
                question: 'Which crystal is traditionally paired with Manipura (Solar Plexus) to enhance vitality and manifestation?',
                options: ['Amethyst', 'Pyrite / Citrine', 'Rose Quartz', 'Lapis Lazuli'],
                correctIndex: 1,
                explanation: 'Pyrite and Citrine carry golden solar frequencies that stimulate solar plexus confidence and prosperity.',
              },
            ],
          },
        ],
      },
      {
        title: 'Module 2: The Higher Triangle & Anahata Bridge',
        description: 'Awakening the heart center, clear truthful expression, third-eye intuition, and crown oneness.',
        sortOrder: 2,
        durationSec: 2900,
        isPreview: false,
        lessons: [
          {
            title: '4. Anahata: Unconditional Self-Compassion & Heart Healing',
            description: 'Dissolve grief and heartbreak through the green ray and YAM frequency.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 980,
            sortOrder: 1,
            isFreePreview: false,
            reflectionPrompt: 'Who do you need to forgive — including yourself — so your heart can breathe without armor?',
          },
          {
            title: '5. Vishuddha to Sahasrara: Cosmic Expression & Divine Will',
            description: 'Align your voice with universal truth and open the crown gateway.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 950,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'What truth has been burning inside you that is now ready to be spoken into existence?',
          },
        ],
        quizzes: [
          {
            title: 'Module 2 Assessment: Higher Triangle Mastery',
            passingScorePct: 80,
            questionsJson: [
              {
                id: 'q1',
                question: 'Which chakra functions as the alchemical bridge between physical survival and spiritual transcendence?',
                options: ['Vishuddha (Throat)', 'Anahata (Heart)', 'Ajna (Third Eye)', 'Sahasrara (Crown)'],
                correctIndex: 1,
                explanation: 'Anahata (Heart) sits precisely at the center, balancing the 3 lower physical chakras with the 3 upper spiritual chakras.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'vedic-astrology-kundli-foundations',
    title: 'Cosmic Architecture: Reading Your Vedic Birth Chart (Kundli)',
    subtitle: 'Decode your soul karma, karmic debts, planetary Dashas, and life purpose through ancient Parashari Jyotish.',
    description: 'Learn to read the sacred geometry of the South and North Indian Kundli chart. Decipher the 12 Bhavas (houses), the 9 Grahas (planets), and understand how current transits trigger life transitions.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=1200&q=80',
    trailerYoutubeId: 'M7lc1UVf-VE',
    instructorName: 'Sejal Jain',
    level: 'INTERMEDIATE' as const,
    priceINR: 2499,
    salePriceINR: 1499,
    isPaid: true,
    isPublished: true,
    totalDurationMinutes: 110,
    certificateEnabled: true,
    modules: [
      {
        title: 'Module 1: The 12 Bhavas (Houses) & Planetary Dignities',
        description: 'Understanding the 12 domains of life from the Lagna (Ascendant) to Moksha.',
        sortOrder: 1,
        durationSec: 3300,
        isPreview: true,
        lessons: [
          {
            title: '1. The Ascendant (Lagna): Soul Blueprint & Physical Body',
            description: 'Why the Lagna and Lagnesha set the entire karmic trajectory of a human incarnation.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 1100,
            sortOrder: 1,
            isFreePreview: true,
            reflectionPrompt: 'When examining your rising sign traits, what qualities feel most instinctual and effortless to you?',
          },
          {
            title: '2. The Kendra & Trikona Houses: Auspicious Karmic Pillars',
            description: 'How Houses 1, 4, 7, 10 (Vishnu Sthanas) and 1, 5, 9 (Lakshmi Sthanas) form the pillars of life success.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 1100,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'Which domain of life (home, career, partnerships, devotion) calls for the deepest devotion right now?',
          },
        ],
        quizzes: [
          {
            title: 'Module 1 Assessment: Kundli Bhavas & Alignments',
            passingScorePct: 80,
            questionsJson: [
              {
                id: 'q1',
                question: 'Which houses in Vedic astrology are known as Lakshmi Sthanas (Houses of Fortune & Dharma)?',
                options: ['Houses 6, 8, 12', 'Houses 1, 5, 9', 'Houses 2, 6, 10', 'Houses 3, 7, 11'],
                correctIndex: 1,
                explanation: 'The Trikona houses (1, 5, 9) are blessed by Devi Lakshmi and represent past life merit (Purva Punya) and divine grace.',
              },
            ],
          },
        ],
      },
    ],
  },
]

export async function seedLmsCourses() {
  console.log('Seeding Aumveda LMS courses...')

  for (const c of SAMPLE_COURSES) {
    const existing = await prisma.course.findUnique({
      where: { slug: c.slug },
      include: { modules: { include: { lessons: true, quizzes: true } } },
    })

    let courseId = existing?.id

    if (!existing) {
      const created = await prisma.course.create({
        data: {
          slug: c.slug,
          title: c.title,
          subtitle: c.subtitle,
          description: c.description,
          thumbnailUrl: c.thumbnailUrl,
          trailerYoutubeId: c.trailerYoutubeId,
          instructorName: c.instructorName,
          level: c.level,
          priceINR: c.priceINR,
          salePriceINR: c.salePriceINR,
          isPaid: c.isPaid,
          isPublished: c.isPublished,
          totalDurationMinutes: c.totalDurationMinutes,
          certificateEnabled: c.certificateEnabled,
        },
      })
      courseId = created.id
      console.log(`Created course: ${c.title}`)
    } else {
      await prisma.course.update({
        where: { id: existing.id },
        data: {
          title: c.title,
          subtitle: c.subtitle,
          description: c.description,
          thumbnailUrl: c.thumbnailUrl,
          trailerYoutubeId: c.trailerYoutubeId,
          instructorName: c.instructorName,
          level: c.level,
          priceINR: c.priceINR,
          salePriceINR: c.salePriceINR,
          isPaid: c.isPaid,
          isPublished: c.isPublished,
          totalDurationMinutes: c.totalDurationMinutes,
          certificateEnabled: c.certificateEnabled,
        },
      })
    }

    if (!courseId) continue

    for (const m of c.modules) {
      let moduleRow = await prisma.courseModule.findFirst({
        where: { courseId, title: m.title },
      })

      if (!moduleRow) {
        moduleRow = await prisma.courseModule.create({
          data: {
            courseId,
            title: m.title,
            description: m.description,
            sortOrder: m.sortOrder,
            durationSec: m.durationSec,
            isPreview: m.isPreview,
          },
        })
      }

      for (const l of m.lessons) {
        const existingLesson = await prisma.courseLesson.findFirst({
          where: { moduleId: moduleRow.id, title: l.title },
        })

        if (!existingLesson) {
          await prisma.courseLesson.create({
            data: {
              moduleId: moduleRow.id,
              title: l.title,
              description: l.description,
              youtubeVideoId: l.youtubeVideoId,
              durationSeconds: l.durationSeconds,
              sortOrder: l.sortOrder,
              isFreePreview: l.isFreePreview,
              reflectionPrompt: l.reflectionPrompt,
            },
          })
        }
      }

      for (const q of m.quizzes) {
        const existingQuiz = await prisma.courseQuiz.findFirst({
          where: { moduleId: moduleRow.id, title: q.title },
        })

        if (!existingQuiz) {
          await prisma.courseQuiz.create({
            data: {
              moduleId: moduleRow.id,
              title: q.title,
              passingScorePct: q.passingScorePct,
              questionsJson: q.questionsJson,
            },
          })
        }
      }
    }
  }

  console.log('LMS seeding completed successfully!')
}

if (require.main === module) {
  seedLmsCourses()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}
