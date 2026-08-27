'use client'

import React from 'react'
import Link from 'next/link'
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  Award,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LMSCourseData, LMSModuleData, LMSLessonData } from '@/lib/lms-data'

interface LessonCurriculumSidebarProps {
  course: LMSCourseData
  activeLessonId: string
  activeTab?: 'lesson' | 'quiz'
  activeQuizId?: string | null
  onSelectLesson: (lessonId: string) => void
  onSelectQuiz: (quizId: string) => void
  onOpenCertificate: () => void
}

export default function LessonCurriculumSidebar({
  course,
  activeLessonId,
  activeTab = 'lesson',
  activeQuizId,
  onSelectLesson,
  onSelectQuiz,
  onOpenCertificate,
}: LessonCurriculumSidebarProps) {
  const is100Percent = course.progress === 100

  return (
    <div className="w-full h-full flex flex-col bg-[hsl(var(--av-night))] border-l border-[hsl(var(--av-stone)/0.3)] text-[hsl(var(--av-parchment))]">
      {/* Header */}
      <div className="p-5 border-b border-[hsl(var(--av-stone)/0.2)] bg-[hsl(var(--av-ink))]">
        <Link
          href={`/courses/${course.slug}`}
          className="text-[11px] font-mono text-[hsl(var(--av-gold))] uppercase tracking-widest hover:underline flex items-center gap-1 mb-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Syllabus Overview</span>
        </Link>
        <h3 className="font-serif text-base font-bold text-[hsl(var(--av-parchment))] line-clamp-1">
          {course.title}
        </h3>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[hsl(var(--av-parchment)/0.6)] font-mono">
            <span>Course Progress</span>
            <span className="font-bold text-[hsl(var(--av-gold))]">{course.progress}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[hsl(var(--av-gold))] to-emerald-400 transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[hsl(var(--av-parchment)/0.4)]">
            <span>
              {course.completedLessons} of {course.totalLessons} lessons completed
            </span>
            <span>≥85% threshold</span>
          </div>
        </div>
      </div>

      {/* Modules Curriculum List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {course.modules.map((m, mIndex) => {
          return (
            <div
              key={m.id}
              className="bg-[hsl(var(--av-ink))] border border-[hsl(var(--av-stone)/0.2)] rounded-xl overflow-hidden shadow-sm"
            >
              {/* Module Title Bar */}
              <div className="p-3.5 bg-black/20 border-b border-[hsl(var(--av-stone)/0.15)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--av-gold))] font-bold">
                    Module {mIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-[hsl(var(--av-parchment)/0.9)] line-clamp-1">
                    {m.title.replace(/^Module \d+:\s*/, '')}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[hsl(var(--av-parchment)/0.4)]">
                  {m.completedLessonsCount}/{m.totalLessonsCount}
                </span>
              </div>

              {/* Lessons in Module */}
              <div className="divide-y divide-[hsl(var(--av-stone)/0.1)]">
                {m.lessons.map((lesson) => {
                  const isActive = activeTab === 'lesson' && activeLessonId === lesson.id
                  const isCompleted = lesson.isCompleted

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                        isActive
                          ? 'bg-[hsl(var(--av-gold)/0.15)] border-l-2 border-[hsl(var(--av-gold))] text-[hsl(var(--av-parchment))]'
                          : 'hover:bg-white/5 text-[hsl(var(--av-parchment)/0.7)]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isActive ? (
                          <PlayCircle className="w-4 h-4 text-[hsl(var(--av-gold))]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-mono text-white/40">
                            {lesson.sortOrder}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs leading-snug line-clamp-2 ${
                            isActive ? 'font-bold text-[hsl(var(--av-parchment))]' : 'font-medium'
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[hsl(var(--av-parchment)/0.4)] font-mono">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {Math.round(lesson.durationSeconds / 60)}m
                          </span>
                          {lesson.isFreePreview && (
                            <span className="text-[hsl(var(--av-gold))] font-sans font-medium">
                              • Free Preview
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}

                {/* Quizzes in Module */}
                {m.quizzes.map((quiz) => {
                  const isActive = activeTab === 'quiz' && activeQuizId === quiz.id
                  const isPassed = quiz.userSubmission?.isPassed

                  return (
                    <button
                      key={quiz.id}
                      type="button"
                      onClick={() => onSelectQuiz(quiz.id)}
                      className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                        isActive
                          ? 'bg-[hsl(var(--av-gold)/0.15)] border-l-2 border-[hsl(var(--av-gold))] text-[hsl(var(--av-parchment))]'
                          : 'hover:bg-white/5 text-[hsl(var(--av-parchment)/0.7)]'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isPassed ? (
                          <Award className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-[hsl(var(--av-gold))]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs leading-snug line-clamp-1 ${
                            isActive ? 'font-bold text-[hsl(var(--av-parchment))]' : 'font-medium'
                          }`}
                        >
                          {quiz.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                          {isPassed ? (
                            <span className="text-emerald-400 font-bold">
                              Passed ({quiz.userSubmission?.scorePct}%)
                            </span>
                          ) : (
                            <span className="text-[hsl(var(--av-gold))]">
                              Module Assessment • {quiz.passingScorePct}% to Pass
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Certificate Footer */}
      <div className="p-4 border-t border-[hsl(var(--av-stone)/0.2)] bg-[hsl(var(--av-ink))] space-y-2">
        <Button
          onClick={onOpenCertificate}
          disabled={!is100Percent}
          className={`w-full rounded-xl text-xs uppercase tracking-widest font-medium h-11 flex items-center justify-center gap-2 shadow-lg transition-all ${
            is100Percent
              ? 'bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] animate-pulse'
              : 'bg-white/5 text-[hsl(var(--av-parchment)/0.4)] border border-white/10 hover:bg-white/5 cursor-not-allowed'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{is100Percent ? 'Claim Verified Certificate' : 'Certificate Locked (100% req)'}</span>
        </Button>
        <p className="text-[10px] text-center text-[hsl(var(--av-parchment)/0.4)] font-mono">
          Complete all lessons & assessments to generate PDF
        </p>
      </div>
    </div>
  )
}
