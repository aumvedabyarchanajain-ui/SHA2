export interface EventEnvelope {
  event_id: string
  event_name: EventName
  user_id?: string
  source: 'client' | 'server'
  timestamp: string
  payload: Record<string, unknown>
}

export type EventName =
  | 'journal.created'
  | 'journal.edited'
  | 'journal.deleted'
  | 'daily_dose.shown'
  | 'daily_dose.completed'
  | 'purchase'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'sign_up'
  | 'login'
  | 'page_view'
  | 'ai.tips.generated'
  | 'health_sync.completed'
  | 'cashfree.webhook.unknown'
  | 'cashfree.payment.CANCELLED'
  | 'cashfree.payment.FAILED'
  | 'refund.issued'
  | 'course.enrolled'
  | 'course.module.completed'
  | 'portal.step_completed'
  | 'portal.completed'
  | 'email_captured'
  | 'discovery_call.booked'

export interface ApiSuccess<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type AchievementKey =
  | 'FIRST_JOURNAL'
  | '7_DAY_STREAK'
  | '30_DAY_STREAK'
  | 'SLEEP_IMPROVED'
  | 'PROGRESS_50'
  | 'PROGRESS_75'
  | 'FIRST_PURCHASE'
  | 'COURSE_COMPLETE'

export const ACHIEVEMENT_META: Record<AchievementKey, { label: string; description: string; emoji: string }> = {
  FIRST_JOURNAL:    { label: 'First Words',       description: 'You wrote your first journal entry.',            emoji: '📝' },
  '7_DAY_STREAK':   { label: 'Week Warrior',       description: 'Completed daily dose 7 days in a row.',         emoji: '🔥' },
  '30_DAY_STREAK':  { label: 'Monthly Devotion',   description: 'Completed daily dose 30 days in a row.',        emoji: '🌙' },
  SLEEP_IMPROVED:   { label: 'Rest Restored',      description: 'Sleep score improved by 10+ points over 7 days.',emoji: '😴' },
  PROGRESS_50:      { label: 'Halfway Home',        description: 'Progress score reached 50 for the first time.', emoji: '⭐' },
  PROGRESS_75:      { label: 'Deep Healer',         description: 'Progress score reached 75 for the first time.', emoji: '✨' },
  FIRST_PURCHASE:   { label: 'Supporter',           description: 'Made your first purchase in the Aumveda shop.', emoji: '🛍️' },
  COURSE_COMPLETE:  { label: 'Course Graduate',    description: 'Completed all modules in a course.',            emoji: '🎓' },
}

export type ConsentKey = 'tracking' | 'health_sync' | 'marketing' | 'ai_personalization'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'FULFILLED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

// ─── Portal Types (Phase 0) ─────────────────────────────────

export type PortalStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type ChakraType = 'root' | 'sacral' | 'solar_plexus' | 'heart' | 'throat' | 'third_eye' | 'crown'

export type ArchetypeType = 'warrior' | 'lover' | 'sage' | 'innocent' | 'caregiver' | 'creator'

export type TarotThemeType =
  | 'transformation'
  | 'awakening'
  | 'inner_work'
  | 'power_will'
  | 'love_relationships'
  | 'surrender'
  | 'purpose_path'

export type ProfileResult =
  | 'anxious_achiever'
  | 'frozen_heart'
  | 'wounded_warrior'
  | 'silent_sufferer'
  | 'lost_soul'
  | 'awakening_one'

export interface PortalState {
  step: PortalStep
  chakraSelected: ChakraType | null
  archetypeSelected: ArchetypeType | null
  tarotCard: string | null
  tarotTheme: TarotThemeType | null
  intentionText: string | null
  dob: string | null
  timeOfBirth: string | null
  placeOfBirth: string | null
  birthLat: number | null
  birthLng: number | null
  email: string | null
  q1Answer: string | null
  q2Answer: string | null
  q3Answer: string | null
  q4Answer: string | null
  q5Answer: string | null
  q6Answer: string | null
  q7Answer: string | null
  nervousSystemScore: string | null
  relationshipScore: string | null
  childhoodScore: string | null
  financialScore: string | null
  profileResult: ProfileResult | null
  sunSign: string | null
  moonSign: string | null
  risingSign: string | null
}

// ─── Booking Types (Phase 1) ─────────────────────────────────

export type Practitioner = 'archana' | 'sejal'

export type ServiceType =
  | 'discovery_call'
  | 'astrology_reading'
  | 'vastu_home'
  | 'vastu_office'
  | 'healing_session'
  | 'somatic'
  | 'trauma_release'

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export type SubscriptionPlan = 'community_monthly'

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due'

export type CommunityTier = 'free' | 'paid'

export type UserRole = 'user' | 'client' | 'practitioner' | 'admin' | 'super_admin'

// ─── LMS Academy Types ───────────────────────────────────────

export type CourseLevel = 'ALL_LEVELS' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'

export interface CourseLessonView {
  id: string
  moduleId: string
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
}

export interface CourseQuizView {
  id: string
  moduleId: string
  title: string
  passingScorePct: number
  questionsJson: any
}

export interface CourseModuleView {
  id: string | number
  courseId?: string | number
  title: string
  description?: string | null
  sortOrder?: number
  orderIndex?: number
  durationSec?: number | null
  isPreview?: boolean
  completed?: boolean
  watchedSec?: number
  lessons?: CourseLessonView[]
  quizzes?: CourseQuizView[]
}

export interface CourseView {
  id: string | number
  slug: string
  title: string
  subtitle?: string | null
  description: string
  thumbnailUrl?: string | null
  thumbnailKey?: string | null
  trailerYoutubeId?: string | null
  instructorName?: string | null
  level?: CourseLevel | string
  priceINR?: number | string | null
  salePriceINR?: number | string | null
  isPaid: boolean
  priceCents?: number | null
  isPublished: boolean
  totalDurationMinutes?: number
  certificateEnabled?: boolean
  enrolled?: boolean
  progress?: number
  completedModules?: number
  totalModules?: number
  continueModuleId?: string | number | null
  continueModuleTitle?: string | null
  modules?: CourseModuleView[]
}

export interface QuizSubmissionResult {
  scorePct: number
  isPassed: boolean
  submittedAt: string
}

export interface CertificateView {
  certificateNumber: string
  courseTitle: string
  studentName: string
  issuedAt: string
  pdfUrl: string
  verificationHash: string
}

