'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  BookOpen,
  PlayCircle,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Feather,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Loader2,
  FileText,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LMSVideoPlayer from '@/components/lms/LMSVideoPlayer'
import DynamicForensicWatermark from '@/components/lms/DynamicForensicWatermark'
import MicroJournalReflection from '@/components/lms/MicroJournalReflection'
import ModuleQuizCard from '@/components/lms/ModuleQuizCard'
import LessonCurriculumSidebar from '@/components/lms/LessonCurriculumSidebar'
import CertificateViewModal from '@/components/lms/CertificateViewModal'
import { showSuccess, showError } from '@/utils/toast'
import type { LMSCourseData, LMSModuleData, LMSLessonData, LMSQuizData } from '@/lib/lms-data'

export default function InteractiveLessonPlayerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const slug = params?.slug as string
  const lessonId = params?.lessonId as string
  const initialTab = (searchParams?.get('tab') as 'lesson' | 'quiz') || 'lesson'
  const initialQuizId = searchParams?.get('quizId') || null

  const [course, setCourse] = useState<LMSCourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz'>(initialTab)
  const [activeQuizId, setActiveQuizId] = useState<string | null>(initialQuizId)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [certModalOpen, setCertModalOpen] = useState(false)
  const [certData, setCertData] = useState<{
    certificateNumber: string
    verificationHash: string
    issuedAt: string
    courseTitle: string
    studentName: string
  } | null>(null)

  const loadCourseData = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/lms/courses/${slug}`)
      const data = await res.json()
      if (res.ok && data.course) {
        setCourse(data.course)
      }
    } catch (err) {
      console.warn('[Player Load Error]:', err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (slug) loadCourseData()
  }, [slug, loadCourseData])

  // Locate active lesson and active module
  const currentModule = course?.modules.find((m) =>
    m.lessons.some((l) => l.id === lessonId),
  )
  const currentLesson = currentModule?.lessons.find((l) => l.id === lessonId)

  // Find next / prev lesson
  const allLessons = course?.modules.flatMap((m) => m.lessons) || []
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null

  // Active quiz data
  const currentQuiz =
    activeQuizId
      ? course?.modules.flatMap((m) => m.quizzes).find((q) => q.id === activeQuizId) ||
        currentModule?.quizzes[0]
      : currentModule?.quizzes[0]

  const handleLessonSelect = (newLessonId: string) => {
    setActiveTab('lesson')
    setActiveQuizId(null)
    setSidebarOpen(false)
    router.push(`/courses/${slug}/lessons/${newLessonId}`)
  }

  const handleQuizSelect = (quizId: string) => {
    setActiveTab('quiz')
    setActiveQuizId(quizId)
    setSidebarOpen(false)
  }

  const handleAutoComplete = () => {
    loadCourseData()
  }

  const handleOpenCertificate = async () => {
    if (!course) return
    try {
      const res = await fetch(`/api/v1/lms/courses/${course.id}/certificate`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok && data.certificate) {
        setCertData(data.certificate)
        setCertModalOpen(true)
      } else {
        showError(data.error || 'Could not retrieve certificate.')
      }
    } catch (err: any) {
      showError(err.message || 'Error generating certificate')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[hsl(var(--av-gold))] animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--av-parchment)/0.6)]">
          Entering Video Learning Sanctuary...
        </p>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] pt-32 pb-20 px-6 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-[hsl(var(--av-gold))] mx-auto opacity-60" />
        <h2 className="font-serif text-2xl">Lesson Not Found</h2>
        <p className="text-sm text-[hsl(var(--av-parchment)/0.6)]">
          The requested lesson could not be loaded.
        </p>
        <Link href={`/courses/${slug}`}>
          <Button variant="outline" className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-xs uppercase">
            Return to Syllabus
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] flex flex-col pt-16">
      {/* Top Learning Bar */}
      <header className="h-14 border-b border-[hsl(var(--av-stone)/0.2)] bg-[hsl(var(--av-night))] px-4 md:px-8 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${course.slug}`}
            className="text-xs font-mono text-[hsl(var(--av-gold))] hover:text-[hsl(var(--av-gold-soft))] flex items-center gap-1 uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Syllabus</span>
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-xs font-serif font-bold text-[hsl(var(--av-parchment))] line-clamp-1">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Completion threshold indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[hsl(var(--av-parchment)/0.6)]">
            <span>Overall:</span>
            <span className="font-bold text-[hsl(var(--av-gold))]">{course.progress}%</span>
          </div>

          {/* Toggle Tab Buttons */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/5">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeTab === 'lesson'
                  ? 'bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-bold'
                  : 'text-[hsl(var(--av-parchment)/0.6)] hover:text-white'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Video & Journal</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeTab === 'quiz'
                  ? 'bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-bold'
                  : 'text-[hsl(var(--av-parchment)/0.6)] hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Assessment</span>
            </button>
          </div>

          {/* Mobile Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg bg-white/5 text-[hsl(var(--av-parchment))]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
          {activeTab === 'lesson' ? (
            <>
              {/* Tokenized Video Player Area */}
              <section className="space-y-4">
                <LMSVideoPlayer
                  lessonId={currentLesson.id}
                  courseSlug={course.slug}
                  onAutoComplete={handleAutoComplete}
                />

                {/* Lesson Details & Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[hsl(var(--av-gold))] font-bold">
                        {currentModule?.title}
                      </span>
                      {currentLesson.isFreePreview && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[9px] font-mono uppercase">
                          Free Preview
                        </Badge>
                      )}
                      {currentLesson.isCompleted && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[9px] font-mono uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-[hsl(var(--av-parchment))]">
                      {currentLesson.title}
                    </h2>
                  </div>

                  {/* Previous / Next Lesson Navigation */}
                  <div className="flex items-center gap-2">
                    {prevLesson && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLessonSelect(prevLesson.id)}
                        className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-xs h-9"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Previous
                      </Button>
                    )}
                    {nextLesson && (
                      <Button
                        size="sm"
                        onClick={() => handleLessonSelect(nextLesson.id)}
                        className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs font-medium h-9 px-4 shadow-md"
                      >
                        Next Lesson
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>

                {currentLesson.description && (
                  <p className="text-sm text-[hsl(var(--av-parchment)/0.7)] leading-relaxed pt-2">
                    {currentLesson.description}
                  </p>
                )}
              </section>

              {/* In-Lesson Micro-Journal Reflection Component */}
              <section className="pt-4">
                <MicroJournalReflection
                  lessonId={currentLesson.id}
                  lessonTitle={currentLesson.title}
                  prompt={currentLesson.reflectionPrompt}
                  initialText={currentLesson.userReflection?.reflectionText || ''}
                  initialMood={currentLesson.userReflection?.mood || 3}
                />
              </section>
            </>
          ) : (
            /* Module Quiz Assessment Tab */
            <section className="space-y-6">
              {currentQuiz ? (
                <ModuleQuizCard
                  quiz={currentQuiz}
                  onQuizPassed={handleAutoComplete}
                />
              ) : (
                <div className="p-12 text-center bg-[hsl(var(--av-night))] rounded-2xl border border-[hsl(var(--av-stone)/0.3)]">
                  <HelpCircle className="w-10 h-10 text-[hsl(var(--av-gold))] mx-auto mb-3 opacity-70" />
                  <h3 className="font-serif text-lg">No Assessment for this Module</h3>
                  <p className="text-xs text-[hsl(var(--av-parchment)/0.6)] mt-1">
                    Continue to the next lesson or check the curriculum sidebar.
                  </p>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Desktop Sidebar (Right Side) */}
        <aside className="w-96 hidden lg:block shrink-0 h-full">
          <LessonCurriculumSidebar
            course={course}
            activeLessonId={currentLesson.id}
            activeTab={activeTab}
            activeQuizId={activeQuizId}
            onSelectLesson={handleLessonSelect}
            onSelectQuiz={handleQuizSelect}
            onOpenCertificate={handleOpenCertificate}
          />
        </aside>
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative ml-auto w-80 max-w-full h-full bg-[hsl(var(--av-night))] z-50">
            <LessonCurriculumSidebar
              course={course}
              activeLessonId={currentLesson.id}
              activeTab={activeTab}
              activeQuizId={activeQuizId}
              onSelectLesson={handleLessonSelect}
              onSelectQuiz={handleQuizSelect}
              onOpenCertificate={() => {
                setSidebarOpen(false)
                handleOpenCertificate()
              }}
            />
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {certData && (
        <CertificateViewModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          certificateNumber={certData.certificateNumber}
          verificationHash={certData.verificationHash}
          courseTitle={certData.courseTitle}
          studentName={certData.studentName}
          issuedAt={certData.issuedAt}
        />
      )}
    </div>
  )
}
