import { prisma } from '@aumveda/db'

export interface LMSQuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface LMSQuizData {
  id: string
  moduleId: string
  title: string
  passingScorePct: number
  questions: LMSQuizQuestion[]
  userSubmission?: {
    scorePct: number
    isPassed: boolean
    submittedAt: string
  } | null
}

export interface LMSLessonData {
  id: string
  moduleId: string
  courseId: string
  title: string
  description?: string | null
  youtubeVideoId: string
  durationSeconds: number
  sortOrder: number
  isFreePreview: boolean
  workbookPdfUrl?: string | null
  audioDownloadUrl?: string | null
  reflectionPrompt?: string | null
  isCompleted?: boolean
  watchTimeSeconds?: number
  lastPlayedPositionSec?: number
  userReflection?: {
    reflectionText: string
    mood?: number | null
    updatedAt: string
  } | null
}

export interface LMSModuleData {
  id: string
  courseId: string
  title: string
  description?: string | null
  sortOrder: number
  durationSec?: number | null
  isPreview?: boolean
  completedLessonsCount: number
  totalLessonsCount: number
  isCompleted: boolean
  lessons: LMSLessonData[]
  quizzes: LMSQuizData[]
}

export interface LMSCourseData {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  description: string
  thumbnailUrl?: string | null
  trailerYoutubeId?: string | null
  instructorName: string
  level: string
  priceINR: number
  salePriceINR?: number | null
  isPaid: boolean
  isPublished: boolean
  totalDurationMinutes: number
  certificateEnabled: boolean
  enrolled: boolean
  progress: number
  completedLessons: number
  totalLessons: number
  continueLessonId?: string | null
  continueLessonTitle?: string | null
  modules: LMSModuleData[]
  certificate?: {
    certificateNumber: string
    issuedAt: string
    verificationHash: string
    pdfUrl: string
  } | null
}

// In-memory store for development/preview state when DB is disconnected
const memoryProgressStore = new Map<string, { watchSec: number; maxWatchSec: number; completed: boolean; completedAt?: Date }>()
const memoryReflectionStore = new Map<string, { text: string; mood: number; updatedAt: Date }>()
const memoryEnrollmentStore = new Set<string>() // `${userId}:${courseId}`
const memoryQuizStore = new Map<string, { scorePct: number; isPassed: boolean; answers: any; submittedAt: Date }>()
const memoryCertStore = new Map<string, { certificateNumber: string; verificationHash: string; issuedAt: Date }>()

// Fallback courses data
export const FALLBACK_COURSES: LMSCourseData[] = [
  {
    id: 'course-1',
    slug: 'nervous-system-mastery',
    title: '7-Day Nervous System Reset & Somatic Awakening',
    subtitle: 'Rewire chronic stress patterns, activate the vagal brake, and reclaim somatic safety through Neuro-Vedic protocols.',
    description: 'A transformative 7-day experiential journey combining modern polyvagal neuroscience with ancient Vedic pranayama, somatic tremor release, and marma point recalibration. Guided step-by-step by Archana and Sejal Jain.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    trailerYoutubeId: 'M7lc1UVf-VE',
    instructorName: 'Archana & Sejal Jain',
    level: 'ALL_LEVELS',
    priceINR: 0,
    salePriceINR: null,
    isPaid: false,
    isPublished: true,
    totalDurationMinutes: 72,
    certificateEnabled: true,
    enrolled: true,
    progress: 0,
    completedLessons: 0,
    totalLessons: 6,
    continueLessonId: 'lesson-1',
    continueLessonTitle: '1. Mapping the Vagus Nerve Through the Vedic Lens',
    modules: [
      {
        id: 'mod-1',
        courseId: 'course-1',
        title: 'Module 1: Foundations of Neuro-Vedic Regulation',
        description: 'Understand the biological architecture of your nervous system and calibrate your somatic baseline.',
        sortOrder: 1,
        durationSec: 2260,
        isPreview: true,
        completedLessonsCount: 0,
        totalLessonsCount: 3,
        isCompleted: false,
        lessons: [
          {
            id: 'lesson-1',
            moduleId: 'mod-1',
            courseId: 'course-1',
            title: '1. Mapping the Vagus Nerve Through the Vedic Lens',
            description: 'Discover how Cranial Nerve X interfaces with the Sushumna Nadi and why ancient sages emphasized the breath-heart connection.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 720,
            sortOrder: 1,
            isFreePreview: true,
            reflectionPrompt: 'Where in your physical body (jaw, throat, belly, shoulders) do you habitually hold unexpressed fight-or-flight tension?',
          },
          {
            id: 'lesson-2',
            moduleId: 'mod-1',
            courseId: 'course-1',
            title: '2. Pranayama Protocols for Sympathetic Downregulation',
            description: 'Learn the exact 4-7-8 ratio and Chandra Bhedana (Left Nostril Breathing) to rapidly switch off cortisol surges.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 890,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'How did your heart rate, breath depth, and internal chatter shift after completing the 5-minute lunar pranayama?',
          },
          {
            id: 'lesson-3',
            moduleId: 'mod-1',
            courseId: 'course-1',
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
            id: 'quiz-1',
            moduleId: 'mod-1',
            title: 'Module 1 Assessment: Neuro-Vedic Biology & Regulation',
            passingScorePct: 80,
            questions: [
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
        id: 'mod-2',
        courseId: 'course-1',
        title: 'Module 2: Polyvagal Restructuring & Safe Social Engagement',
        description: 'Transition out of functional freeze and establish profound somatic trust in your relationships.',
        sortOrder: 2,
        durationSec: 2060,
        isPreview: false,
        completedLessonsCount: 0,
        totalLessonsCount: 3,
        isCompleted: false,
        lessons: [
          {
            id: 'lesson-4',
            moduleId: 'mod-2',
            courseId: 'course-1',
            title: '4. Thawing the Dorsal Vagal Freeze Response',
            description: 'Gentle micro-movements and orienting exercises to gently thaw dissociation and emotional numbness.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 940,
            sortOrder: 1,
            isFreePreview: false,
            reflectionPrompt: 'What tiny, tangible signal tells you that you have slipped from safety into emotional shutdown or withdrawal?',
          },
          {
            id: 'lesson-5',
            moduleId: 'mod-2',
            courseId: 'course-1',
            title: '5. The Sacred Energetic Boundary Ritual',
            description: 'Establish impenetrable energetic containment using aura sealing mantras and somatic posture alignment.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 780,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'Where in your daily life do you need to replace people-pleasing over-giving with a clean, loving boundary?',
          },
          {
            id: 'lesson-6',
            moduleId: 'mod-2',
            courseId: 'course-1',
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
            id: 'quiz-2',
            moduleId: 'mod-2',
            title: 'Module 2 Assessment: Polyvagal Mastery & Integration',
            passingScorePct: 80,
            questions: [
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
    id: 'course-2',
    slug: 'vedic-chakra-alchemy',
    title: 'Vedic Chakra Alchemy: Harmonizing the 7 Sacred Vortices',
    subtitle: 'Clear karmic imprints, restore energetic velocity, and balance your subtle body with Bija vibrations and crystal therapies.',
    description: 'An immersive deep dive into the seven energetic chakras according to the classical Shat-Chakra-Nirupana and modern somatic psychology. Master diagnostic awareness, sound frequencies, and crystal pairings.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    trailerYoutubeId: 'M7lc1UVf-VE',
    instructorName: 'Archana Jain',
    level: 'BEGINNER',
    priceINR: 1499,
    salePriceINR: 999,
    isPaid: true,
    isPublished: true,
    totalDurationMinutes: 95,
    certificateEnabled: true,
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 5,
    modules: [
      {
        id: 'mod-2-1',
        courseId: 'course-2',
        title: 'Module 1: The Lower Triangle (Root, Sacral, Solar Plexus)',
        description: 'Grounding survival instinct, liberating sensual creativity, and building authentic willpower.',
        sortOrder: 1,
        durationSec: 2800,
        isPreview: true,
        completedLessonsCount: 0,
        totalLessonsCount: 3,
        isCompleted: false,
        lessons: [
          {
            id: 'lesson-2-1',
            moduleId: 'mod-2-1',
            courseId: 'course-2',
            title: '1. Muladhara: Establishing Earth Safety & Financial Grounding',
            description: 'Awaken the red lotus at the base of the spine. Dissolve scarcity fears with LAM seed resonance.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 920,
            sortOrder: 1,
            isFreePreview: true,
            reflectionPrompt: 'When you contemplate money and shelter, does your body feel rooted like an ancient banyan tree or adrift in wind?',
          },
          {
            id: 'lesson-2-2',
            moduleId: 'mod-2-1',
            courseId: 'course-2',
            title: '2. Svadhisthana: Fluidity, Sensuality & Creative Release',
            description: 'Unblock emotional rigidity with water element meditation and VAM vibration.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 960,
            sortOrder: 2,
            isFreePreview: false,
            reflectionPrompt: 'What creative impulse or joyful desire have you withheld from yourself because it felt "unproductive"?',
          },
          {
            id: 'lesson-2-3',
            moduleId: 'mod-2-1',
            courseId: 'course-2',
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
            id: 'quiz-2-1',
            moduleId: 'mod-2-1',
            title: 'Module 1 Assessment: Lower Triangle Alchemy',
            passingScorePct: 80,
            questions: [
              {
                id: 'q1',
                question: 'What is the Bija (seed sound) corresponding to the Muladhara (Root) chakra?',
                options: ['YAM', 'RAM', 'LAM', 'VAM'],
                correctIndex: 2,
                explanation: 'LAM is the primal seed sound that stimulates earth resonance and physical stability.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'course-3',
    slug: 'vedic-astrology-kundli-foundations',
    title: 'Cosmic Architecture: Reading Your Vedic Birth Chart (Kundli)',
    subtitle: 'Decode your soul karma, karmic debts, planetary Dashas, and life purpose through ancient Parashari Jyotish.',
    description: 'Learn to read the sacred geometry of the South and North Indian Kundli chart. Decipher the 12 Bhavas (houses), the 9 Grahas (planets), and understand how current transits trigger life transitions.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=1200&q=80',
    trailerYoutubeId: 'M7lc1UVf-VE',
    instructorName: 'Sejal Jain',
    level: 'INTERMEDIATE',
    priceINR: 2499,
    salePriceINR: 1499,
    isPaid: true,
    isPublished: true,
    totalDurationMinutes: 110,
    certificateEnabled: true,
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 2,
    modules: [
      {
        id: 'mod-3-1',
        courseId: 'course-3',
        title: 'Module 1: The 12 Bhavas (Houses) & Planetary Dignities',
        description: 'Understanding the 12 domains of life from the Lagna (Ascendant) to Moksha.',
        sortOrder: 1,
        durationSec: 2200,
        isPreview: true,
        completedLessonsCount: 0,
        totalLessonsCount: 2,
        isCompleted: false,
        lessons: [
          {
            id: 'lesson-3-1',
            moduleId: 'mod-3-1',
            courseId: 'course-3',
            title: '1. The Ascendant (Lagna): Soul Blueprint & Physical Body',
            description: 'Why the Lagna and Lagnesha set the entire karmic trajectory of a human incarnation.',
            youtubeVideoId: 'M7lc1UVf-VE',
            durationSeconds: 1100,
            sortOrder: 1,
            isFreePreview: true,
            reflectionPrompt: 'When examining your rising sign traits, what qualities feel most instinctual and effortless to you?',
          },
          {
            id: 'lesson-3-2',
            moduleId: 'mod-3-1',
            courseId: 'course-3',
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
            id: 'quiz-3-1',
            moduleId: 'mod-3-1',
            title: 'Module 1 Assessment: Kundli Bhavas & Alignments',
            passingScorePct: 80,
            questions: [
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

/**
 * Fetch all published courses with user progress & enrollment status
 */
export async function getCoursesList(userId?: string): Promise<LMSCourseData[]> {
  try {
    const dbCourses = await (prisma.course as any).findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' } },
            quizzes: true,
          },
        },
        enrollments: userId ? { where: { userId } } : false,
        certificates: userId ? { where: { userId } } : false,
      },
    })

    if (dbCourses.length > 0) {
      // Map database rows to LMSCourseData
      return dbCourses.map((c: any) => {
        const isEnrolled = userId ? c.enrollments?.length > 0 : false
        const cert = userId && c.certificates?.length ? c.certificates[0] : null

        let totalLessons = 0
        let completedLessons = 0

        const modules: LMSModuleData[] = (c.modules || []).map((m: any) => {
          const lessons: LMSLessonData[] = (m.lessons || []).map((l: any) => {
            totalLessons++
            const progKey = `${userId}:${l.id}`
            const memProg = memoryProgressStore.get(progKey)
            const isCompleted = memProg?.completed ?? false
            if (isCompleted) completedLessons++

            return {
              id: String(l.id),
              moduleId: String(m.id),
              courseId: String(c.id),
              title: l.title,
              description: l.description,
              youtubeVideoId: l.youtubeVideoId,
              durationSeconds: Number(l.durationSeconds) || 0,
              sortOrder: Number(l.sortOrder) || 1,
              isFreePreview: Boolean(l.isFreePreview),
              reflectionPrompt: l.reflectionPrompt,
              isCompleted,
              watchTimeSeconds: memProg?.watchSec ?? 0,
            }
          })

          const quizzes: LMSQuizData[] = (m.quizzes || []).map((q: any) => {
            const quizKey = `${userId}:${q.id}`
            const memQuiz = memoryQuizStore.get(quizKey)
            return {
              id: String(q.id),
              moduleId: String(m.id),
              title: q.title,
              passingScorePct: Number(q.passingScorePct) || 80,
              questions: (q.questionsJson as any) ?? [],
              userSubmission: memQuiz ? {
                scorePct: memQuiz.scorePct,
                isPassed: memQuiz.isPassed,
                submittedAt: memQuiz.submittedAt.toISOString(),
              } : null,
            }
          })

          return {
            id: String(m.id),
            courseId: String(c.id),
            title: m.title,
            description: m.description,
            sortOrder: Number(m.sortOrder) || 1,
            durationSec: m.durationSec,
            isPreview: Boolean(m.isPreview),
            completedLessonsCount: lessons.filter((l) => l.isCompleted).length,
            totalLessonsCount: lessons.length,
            isCompleted: lessons.length > 0 && lessons.every((l) => l.isCompleted),
            lessons,
            quizzes,
          }
        })

        const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        const allLessons = modules.flatMap((m) => m.lessons)
        const nextLesson = allLessons.find((l) => !l.isCompleted) ?? allLessons[0]

        return {
          id: String(c.id),
          slug: c.slug,
          title: c.title,
          subtitle: c.subtitle,
          description: c.description,
          thumbnailUrl: c.thumbnailUrl,
          trailerYoutubeId: c.trailerYoutubeId,
          instructorName: c.instructorName,
          level: c.level,
          priceINR: Number(c.priceINR) || 0,
          salePriceINR: c.salePriceINR ? Number(c.salePriceINR) : null,
          isPaid: Boolean(c.isPaid),
          isPublished: Boolean(c.isPublished),
          totalDurationMinutes: Number(c.totalDurationMinutes) || 0,
          certificateEnabled: Boolean(c.certificateEnabled),
          enrolled: isEnrolled || memoryEnrollmentStore.has(`${userId}:${c.id}`),
          progress: progressPct,
          completedLessons,
          totalLessons,
          continueLessonId: nextLesson?.id ?? null,
          continueLessonTitle: nextLesson?.title ?? null,
          modules,
          certificate: cert ? {
            certificateNumber: cert.certificateNumber,
            issuedAt: cert.issuedAt ? new Date(cert.issuedAt).toISOString() : new Date().toISOString(),
            verificationHash: cert.verificationHash,
            pdfUrl: cert.pdfUrl,
          } : null,
        }
      })
    }
  } catch (err) {
    console.warn('[LMS Data] Using fallback mock data:', (err as any)?.message)
  }

  // Graceful fallback with memory progress integration
  return FALLBACK_COURSES.map((course) => {
    const isEnrolled = userId ? (course.priceINR === 0 || memoryEnrollmentStore.has(`${userId}:${course.id}`)) : false

    let totalLessons = 0
    let completedLessons = 0

    const modules: LMSModuleData[] = course.modules.map((m) => {
      const lessons: LMSLessonData[] = m.lessons.map((l) => {
        totalLessons++
        const progKey = `${userId}:${l.id}`
        const memProg = memoryProgressStore.get(progKey)
        const isCompleted = memProg?.completed ?? false
        if (isCompleted) completedLessons++

        const refKey = `${userId}:${l.id}`
        const memRef = memoryReflectionStore.get(refKey)

        return {
          ...l,
          isCompleted,
          watchTimeSeconds: memProg?.watchSec ?? 0,
          userReflection: memRef ? {
            reflectionText: memRef.text,
            mood: memRef.mood,
            updatedAt: memRef.updatedAt.toISOString(),
          } : null,
        }
      })

      const quizzes: LMSQuizData[] = m.quizzes.map((q) => {
        const quizKey = `${userId}:${q.id}`
        const memQuiz = memoryQuizStore.get(quizKey)
        return {
          ...q,
          userSubmission: memQuiz ? {
            scorePct: memQuiz.scorePct,
            isPassed: memQuiz.isPassed,
            submittedAt: memQuiz.submittedAt.toISOString(),
          } : null,
        }
      })

      return {
        ...m,
        completedLessonsCount: lessons.filter((l) => l.isCompleted).length,
        totalLessonsCount: lessons.length,
        isCompleted: lessons.length > 0 && lessons.every((l) => l.isCompleted),
        lessons,
        quizzes,
      }
    })

    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    const allLessons = modules.flatMap((m) => m.lessons)
    const nextLesson = allLessons.find((l) => !l.isCompleted) ?? allLessons[0]

    const certKey = `${userId}:${course.id}`
    const memCert = memoryCertStore.get(certKey)

    return {
      ...course,
      enrolled: isEnrolled,
      progress: progressPct,
      completedLessons,
      totalLessons,
      continueLessonId: nextLesson?.id ?? null,
      continueLessonTitle: nextLesson?.title ?? null,
      modules,
      certificate: memCert ? {
        certificateNumber: memCert.certificateNumber,
        issuedAt: memCert.issuedAt.toISOString(),
        verificationHash: memCert.verificationHash,
        pdfUrl: `/api/v1/lms/courses/${course.id}/certificate`,
      } : null,
    }
  })
}

/**
 * Fetch a single course by slug with full syllabus, lessons, reflections, quizzes, and user state
 */
export async function getCourseBySlug(slug: string, userId?: string): Promise<LMSCourseData | null> {
  const allCourses = await getCoursesList(userId)
  return allCourses.find((c) => c.slug === slug) ?? null
}

/**
 * Fetch lesson by ID with course context
 */
export async function getLessonById(lessonId: string, userId?: string): Promise<{ course: LMSCourseData; module: LMSModuleData; lesson: LMSLessonData } | null> {
  const allCourses = await getCoursesList(userId)
  for (const course of allCourses) {
    for (const courseModule of course.modules) {
      const lesson = courseModule.lessons.find((l) => l.id === lessonId)
      if (lesson) {
        return { course, module: courseModule, lesson }
      }
    }
  }
  return null
}

/**
 * Enroll user in a course
 */
export async function enrollUserInCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    await (prisma as any).courseEnrollment?.upsert?.({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, status: 'ACTIVE' },
      update: { status: 'ACTIVE' },
    })
  } catch (err) {
    console.warn('[LMS Data] Enrolling in memory fallback:', (err as any)?.message)
  }
  memoryEnrollmentStore.add(`${userId}:${courseId}`)
  return true
}

/**
 * Update lesson watch progress and mark complete if threshold >= 85%
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  watchTimeSeconds: number,
  durationSeconds: number,
  lastPositionSec: number,
): Promise<{ isCompleted: boolean; progressPct: number }> {
  const progressPct = durationSeconds > 0 ? Math.min(100, Math.round((watchTimeSeconds / durationSeconds) * 100)) : 0
  const isCompleted = progressPct >= 85

  const key = `${userId}:${lessonId}`
  const existing = memoryProgressStore.get(key)
  const previouslyCompleted = existing?.completed ?? false
  const nowCompleted = previouslyCompleted || isCompleted

  memoryProgressStore.set(key, {
    watchSec: Math.max(existing?.watchSec ?? 0, watchTimeSeconds),
    maxWatchSec: Math.max(existing?.maxWatchSec ?? 0, watchTimeSeconds),
    completed: nowCompleted,
    completedAt: nowCompleted ? (existing?.completedAt ?? new Date()) : undefined,
  })

  try {
    await (prisma as any).lessonProgress?.upsert?.({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        watchTimeSeconds,
        maxWatchTimeSeconds: watchTimeSeconds,
        lastPlayedPositionSec: lastPositionSec,
        isCompleted: nowCompleted,
        completedAt: nowCompleted ? new Date() : null,
      },
      update: {
        watchTimeSeconds: { increment: 5 },
        maxWatchTimeSeconds: Math.max(existing?.maxWatchSec ?? 0, watchTimeSeconds),
        lastPlayedPositionSec: lastPositionSec,
        ...(nowCompleted && { isCompleted: true, completedAt: new Date() }),
      },
    })
  } catch (err) {
    // Graceful fallback to memory store
  }

  return { isCompleted: nowCompleted, progressPct }
}

/**
 * Save in-lesson micro-journal reflection
 */
export async function saveLessonReflection(
  userId: string,
  lessonId: string,
  reflectionText: string,
  mood?: number,
): Promise<boolean> {
  const key = `${userId}:${lessonId}`
  memoryReflectionStore.set(key, {
    text: reflectionText,
    mood: mood ?? 5,
    updatedAt: new Date(),
  })

  try {
    await (prisma as any).lessonReflection?.upsert?.({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        reflectionText,
        mood: mood ?? null,
      },
      update: {
        reflectionText,
        mood: mood ?? null,
      },
    })
  } catch (err) {
    // Graceful fallback to memory store
  }

  return true
}

/**
 * Submit and grade module quiz
 */
export async function submitModuleQuiz(
  userId: string,
  quizId: string,
  answers: Record<string, number>, // questionId -> selectedIndex
): Promise<{ scorePct: number; isPassed: boolean; correctAnswers: Record<string, number>; explanations: Record<string, string> }> {
  // Find quiz in courses
  let foundQuiz: LMSQuizData | null = null
  for (const c of FALLBACK_COURSES) {
    for (const m of c.modules) {
      const q = m.quizzes.find((quiz) => quiz.id === quizId)
      if (q) {
        foundQuiz = q
        break
      }
    }
  }

  if (!foundQuiz) {
    throw new Error('Quiz not found')
  }

  let correctCount = 0
  const correctAnswers: Record<string, number> = {}
  const explanations: Record<string, string> = {}

  for (const q of foundQuiz.questions) {
    correctAnswers[q.id] = q.correctIndex
    explanations[q.id] = q.explanation
    if (answers[q.id] === q.correctIndex) {
      correctCount++
    }
  }

  const scorePct = Math.round((correctCount / foundQuiz.questions.length) * 100)
  const isPassed = scorePct >= foundQuiz.passingScorePct

  const key = `${userId}:${quizId}`
  memoryQuizStore.set(key, {
    scorePct,
    isPassed,
    answers,
    submittedAt: new Date(),
  })

  try {
    await (prisma as any).quizSubmission?.create?.({
      data: {
        userId,
        quizId,
        scorePct,
        isPassed,
        submittedAnswersJson: answers,
      },
    })
  } catch (err) {
    // Graceful fallback to memory store
  }

  return { scorePct, isPassed, correctAnswers, explanations }
}

/**
 * Issue or retrieve Course Completion Certificate
 */
export async function getOrGenerateCertificate(
  userId: string,
  courseId: string,
  studentName: string,
): Promise<{ certificateNumber: string; verificationHash: string; issuedAt: string; courseTitle: string; studentName: string }> {
  const course = (await getCoursesList(userId)).find((c) => c.id === courseId)
  if (!course) throw new Error('Course not found')

  const key = `${userId}:${courseId}`
  let cert = memoryCertStore.get(key)

  if (!cert) {
    const certNum = `AV-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    const hash = `0x${Buffer.from(`${userId}:${courseId}:${certNum}`).toString('hex').slice(0, 32)}`
    cert = {
      certificateNumber: certNum,
      verificationHash: hash,
      issuedAt: new Date(),
    }
    memoryCertStore.set(key, cert)

    try {
      await (prisma as any).courseCertificate?.upsert?.({
        where: { userId_courseId: { userId, courseId } },
        create: {
          userId,
          courseId,
          certificateNumber: cert.certificateNumber,
          verificationHash: cert.verificationHash,
          pdfUrl: `/api/v1/lms/courses/${courseId}/certificate`,
        },
        update: {},
      })
    } catch (err) {
      // Graceful fallback to memory store
    }
  }

  return {
    certificateNumber: cert.certificateNumber,
    verificationHash: cert.verificationHash,
    issuedAt: cert.issuedAt.toISOString(),
    courseTitle: course.title,
    studentName: studentName || 'Sacred Seeker',
  }
}
