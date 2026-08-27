'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BookOpen,
  PlayCircle,
  Clock,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Feather,
  HelpCircle,
  Loader2,
  ArrowLeft,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { showSuccess, showError } from '@/utils/toast'
import type { LMSCourseData } from '@/lib/lms-data'

export default function CourseSyllabusPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [course, setCourse] = useState<LMSCourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  const loadCourse = async () => {
    try {
      const res = await fetch(`/api/v1/lms/courses/${slug}`)
      const data = await res.json()
      if (res.ok && data.course) {
        setCourse(data.course)
        // Expand first module by default
        if (data.course.modules?.length > 0) {
          setExpandedModules({ [data.course.modules[0].id]: true })
        }
      }
    } catch (err) {
      console.warn('[Syllabus Load Error]:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) loadCourse()
  }, [slug])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const handleEnroll = async () => {
    if (!course) return
    setEnrolling(true)
    try {
      const res = await fetch(`/api/v1/lms/courses/${course.id}/enroll`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to enroll')
      }
      showSuccess(`Enrolled in ${course.title}!`)
      await loadCourse()
      // Route to first lesson
      const firstLesson = course.modules[0]?.lessons[0]
      if (firstLesson) {
        router.push(`/courses/${course.slug}/lessons/${firstLesson.id}`)
      }
    } catch (err: any) {
      showError(err.message || 'Enrollment error')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] pt-32 pb-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[hsl(var(--av-gold))] animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--av-parchment)/0.6)]">
          Loading Course Syllabus...
        </p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] pt-32 pb-20 px-6 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-[hsl(var(--av-gold))] mx-auto opacity-60" />
        <h2 className="font-serif text-2xl">Course Not Found</h2>
        <p className="text-sm text-[hsl(var(--av-parchment)/0.6)]">
          The requested syllabus could not be located.
        </p>
        <Link href="/courses">
          <Button variant="outline" className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-xs uppercase">
            Back to Course Catalog
          </Button>
        </Link>
      </div>
    )
  }

  const firstLesson = course.modules[0]?.lessons[0]
  const resumeId = course.continueLessonId || firstLesson?.id || 'lesson-1'

  return (
    <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] pt-24 pb-24">
      {/* Navigation Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--av-gold))] hover:text-[hsl(var(--av-gold-soft))] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Course Catalog</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[hsl(var(--av-gold)/0.15)] text-[hsl(var(--av-gold))] border border-[hsl(var(--av-gold)/0.3)] text-[10px] font-mono uppercase tracking-wider">
                {course.level.replace('_', ' ')}
              </Badge>
              <Badge className="bg-white/5 text-[hsl(var(--av-parchment)/0.8)] border border-white/10 text-[10px] font-mono uppercase tracking-wider">
                {course.totalDurationMinutes} Minutes Total
              </Badge>
              <Badge className="bg-white/5 text-[hsl(var(--av-parchment)/0.8)] border border-white/10 text-[10px] font-mono uppercase tracking-wider">
                {course.totalLessons} Lessons
              </Badge>
              {course.certificateEnabled && (
                <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Verified Certificate
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[hsl(var(--av-parchment))] leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-[hsl(var(--av-parchment)/0.8)] font-body leading-relaxed">
              {course.subtitle || course.description}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--av-gold)/0.2)] border border-[hsl(var(--av-gold)/0.4)] flex items-center justify-center font-serif text-[hsl(var(--av-gold))] font-bold text-sm">
                ॐ
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[hsl(var(--av-gold))] font-mono">
                  Master Instructor
                </p>
                <p className="text-sm font-medium text-[hsl(var(--av-parchment))]">
                  {course.instructorName}
                </p>
              </div>
            </div>

            {/* CTA Button Row */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              {course.enrolled ? (
                <Link href={`/courses/${course.slug}/lessons/${resumeId}`}>
                  <Button className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs uppercase tracking-widest font-medium px-8 h-12 shadow-xl">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {course.progress > 0 ? `Resume (${course.progress}%)` : 'Start Learning'}
                  </Button>
                </Link>
              ) : course.isPaid ? (
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs uppercase tracking-widest font-medium px-8 h-12 shadow-xl"
                >
                  {enrolling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Enroll Now • ₹{course.salePriceINR || course.priceINR}
                </Button>
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs uppercase tracking-widest font-medium px-8 h-12 shadow-xl"
                >
                  {enrolling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4 mr-2" />
                  )}
                  Enroll in Free Curriculum
                </Button>
              )}

              {firstLesson && (
                <Link href={`/courses/${course.slug}/lessons/${firstLesson.id}`}>
                  <Button
                    variant="outline"
                    className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-[hsl(var(--av-parchment))] hover:bg-white/5 text-xs uppercase tracking-widest px-6 h-12"
                  >
                    <PlayCircle className="w-4 h-4 mr-2 text-[hsl(var(--av-gold))]" />
                    Preview Lesson 1
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Hero Thumbnail Preview */}
          <div className="lg:col-span-5">
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-[hsl(var(--av-gold)/0.3)] shadow-2xl bg-black/60 group">
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Link href={`/courses/${course.slug}/lessons/${firstLesson?.id || 'lesson-1'}`}>
                  <div className="w-16 h-16 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 fill-current" />
                  </div>
                </Link>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-[hsl(var(--av-parchment)/0.8)]">
                <span>Interactive Learning Sanctuary</span>
                <span className="flex items-center gap-1 text-[hsl(var(--av-gold))]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Token Gated
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Syllabus Breakdown */}
      <section className="max-w-[1200px] mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Syllabus Modules */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[hsl(var(--av-stone)/0.2)] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[hsl(var(--av-parchment))] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[hsl(var(--av-gold))]" />
                Course Curriculum & Syllabus
              </h2>
              <span className="text-xs font-mono text-[hsl(var(--av-parchment)/0.5)]">
                {course.modules.length} Modules • {course.totalLessons} Lessons
              </span>
            </div>

            <div className="space-y-4">
              {course.modules.map((m, mIndex) => {
                const isExpanded = expandedModules[m.id] ?? false
                return (
                  <div
                    key={m.id}
                    className="bg-[hsl(var(--av-night))] border border-[hsl(var(--av-stone)/0.3)] rounded-2xl overflow-hidden shadow-md"
                  >
                    {/* Module Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleModule(m.id)}
                      className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-[hsl(var(--av-gold))] font-bold">
                            Module {mIndex + 1}
                          </span>
                          {m.isPreview && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[9px] font-mono uppercase">
                              Preview Available
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-serif text-base font-bold text-[hsl(var(--av-parchment))]">
                          {m.title}
                        </h3>
                        {m.description && (
                          <p className="text-xs text-[hsl(var(--av-parchment)/0.6)] line-clamp-1 leading-relaxed">
                            {m.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-[hsl(var(--av-parchment)/0.5)]">
                          {m.lessons.length} lessons
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-[hsl(var(--av-gold))]" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-[hsl(var(--av-parchment)/0.4)]" />
                        )}
                      </div>
                    </button>

                    {/* Module Lessons & Quizzes List */}
                    {isExpanded && (
                      <div className="border-t border-[hsl(var(--av-stone)/0.2)] bg-[hsl(var(--av-ink))] divide-y divide-[hsl(var(--av-stone)/0.1)]">
                        {m.lessons.map((lesson) => {
                          const canAccess = course.enrolled || lesson.isFreePreview || !course.isPaid
                          return (
                            <div
                              key={lesson.id}
                              className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-start gap-3.5">
                                <div className="mt-0.5">
                                  {lesson.isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : canAccess ? (
                                    <PlayCircle className="w-4 h-4 text-[hsl(var(--av-gold))]" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-[hsl(var(--av-parchment)/0.3)]" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[hsl(var(--av-parchment))]">
                                    {lesson.title}
                                  </p>
                                  {lesson.description && (
                                    <p className="text-xs text-[hsl(var(--av-parchment)/0.5)] line-clamp-1 mt-0.5">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[hsl(var(--av-parchment)/0.4)]">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {Math.round(lesson.durationSeconds / 60)} mins
                                    </span>
                                    {lesson.reflectionPrompt && (
                                      <span className="flex items-center gap-1 text-[hsl(var(--av-gold)/0.8)]">
                                        <Feather className="w-3 h-3" /> Micro-Journal
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                {canAccess ? (
                                  <Link href={`/courses/${course.slug}/lessons/${lesson.id}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-full border-[hsl(var(--av-gold)/0.4)] text-[hsl(var(--av-gold))] hover:bg-[hsl(var(--av-gold)/0.1)] text-xs h-8 px-4"
                                    >
                                      {lesson.isFreePreview && !course.enrolled ? 'Free Preview' : 'Play Lesson'}
                                    </Button>
                                  </Link>
                                ) : (
                                  <span className="text-[11px] font-mono text-[hsl(var(--av-parchment)/0.3)] flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* Quizzes in module */}
                        {m.quizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="p-4 flex items-center justify-between gap-4 bg-[hsl(var(--av-gold)/0.04)]"
                          >
                            <div className="flex items-center gap-3">
                              <HelpCircle className="w-4 h-4 text-[hsl(var(--av-gold))]" />
                              <div>
                                <p className="text-sm font-medium text-[hsl(var(--av-parchment))]">
                                  {quiz.title}
                                </p>
                                <p className="text-[11px] font-mono text-[hsl(var(--av-parchment)/0.5)]">
                                  Module Assessment • {quiz.passingScorePct}% passing threshold
                                </p>
                              </div>
                            </div>

                            <Link href={`/courses/${course.slug}/lessons/${firstLesson?.id || 'lesson-1'}?tab=quiz&quizId=${quiz.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-xs h-8 px-4"
                              >
                                Take Assessment
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Key Highlights & Certificate Badge */}
          <div className="lg:col-span-4 space-y-6">
            {/* Certificate Preview Card */}
            <div className="bg-[hsl(var(--av-night))] border border-[hsl(var(--av-gold)/0.3)] rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--av-gold)/0.15)] flex items-center justify-center border border-[hsl(var(--av-gold)/0.3)]">
                  <Award className="w-5 h-5 text-[hsl(var(--av-gold))]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[hsl(var(--av-parchment))]">
                    Verified Certificate
                  </h3>
                  <p className="text-xs text-[hsl(var(--av-parchment)/0.5)] font-mono">
                    Signed by Archana & Sejal Jain
                  </p>
                </div>
              </div>

              <p className="text-xs text-[hsl(var(--av-parchment)/0.7)] leading-relaxed">
                Upon achieving 100% course completion (≥85% watch time threshold) and passing all module knowledge assessments, an official cryptographically hashed PDF certificate will be generated for your sacred portfolio.
              </p>

              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono text-[hsl(var(--av-parchment)/0.5)] space-y-1">
                <div>✦ Cryptographic Hash Verification</div>
                <div>✦ Downloadable & Printable High-Res PDF</div>
                <div>✦ Dual Founder Signature Seals</div>
              </div>
            </div>

            {/* Anti-Piracy Security Architecture Card */}
            <div className="bg-[hsl(var(--av-night))] border border-[hsl(var(--av-stone)/0.3)] rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[hsl(var(--av-gold))]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Forensic Security Stream</span>
              </div>
              <p className="text-xs text-[hsl(var(--av-parchment)/0.7)] leading-relaxed">
                All video lessons utilize signed 15-minute tokenized gating and dynamic moving watermark overlays with real-time student hash identification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
