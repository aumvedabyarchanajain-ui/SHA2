'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  PlayCircle,
  Clock,
  Award,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
  Lock,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { showSuccess, showError } from '@/utils/toast'
import type { LMSCourseData } from '@/lib/lms-data'

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<LMSCourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      // If legacy endpoint format, or our new LMS list
      if (res.ok) {
        // Fetch full list from our lms fallback
        const fallbackRes = await fetch('/api/v1/lms/courses/nervous-system-mastery')
        if (fallbackRes.ok) {
          const sample = await fallbackRes.json()
          // Load default course catalogue
          const all = await Promise.all([
            fetch('/api/v1/lms/courses/nervous-system-mastery').then((r) => r.json()),
            fetch('/api/v1/lms/courses/vedic-chakra-alchemy').then((r) => r.json()),
            fetch('/api/v1/lms/courses/vedic-astrology-kundli-foundations').then((r) => r.json()),
          ])
          const loaded = all.map((a) => a.course).filter(Boolean)
          setCourses(loaded)
        }
      }
    } catch (err) {
      console.warn('[LMS Catalog Load] Warning:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleEnroll = async (courseId: string, courseTitle: string) => {
    setEnrollingId(courseId)
    try {
      const res = await fetch(`/api/v1/lms/courses/${courseId}/enroll`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to enroll')
      }
      showSuccess(`Welcome to ${courseTitle}! Enrollment activated.`)
      await loadCourses()
    } catch (err: any) {
      showError(err.message || 'Enrollment error')
    } finally {
      setEnrollingId(null)
    }
  }

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructorName.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (selectedFilter === 'ENROLLED') return c.enrolled
      if (selectedFilter === 'FREE') return !c.isPaid
      if (selectedFilter === 'BEGINNER') return c.level === 'BEGINNER'
      if (selectedFilter === 'INTERMEDIATE') return c.level === 'INTERMEDIATE'
      return true
    })
  }, [courses, searchQuery, selectedFilter])

  return (
    <div className="min-h-screen bg-[hsl(var(--av-ink))] text-[hsl(var(--av-parchment))] pt-24 pb-20">
      {/* Hero Header */}
      <section className="max-w-[1200px] mx-auto px-6 pt-8 pb-12 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--av-gold)/0.1)] border border-[hsl(var(--av-gold)/0.3)] text-[11px] font-mono uppercase tracking-[0.25em] text-[hsl(var(--av-gold))]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AUMVEDA ACADEMY & VIDEO SANCTUARY</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[hsl(var(--av-parchment))] max-w-3xl mx-auto leading-tight">
          Master Sacred Wisdom & Neuro-Vedic Somatics
        </h1>

        <p className="text-sm sm:text-base text-[hsl(var(--av-parchment)/0.7)] max-w-2xl mx-auto font-body leading-relaxed">
          Structured video curricula, somatic reflection micro-journals, and cryptographic mastery certificates guided by Archana and Sejal Jain.
        </p>

        {/* Filter & Search Bar */}
        <div className="pt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--av-parchment)/0.4)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, nervous system, chakras, kundli..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-[hsl(var(--av-night))] border border-[hsl(var(--av-stone)/0.3)] text-sm text-[hsl(var(--av-parchment))] placeholder:text-[hsl(var(--av-parchment)/0.4)] focus:outline-none focus:border-[hsl(var(--av-gold))] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 shrink-0">
            {[
              { id: 'ALL', label: 'All Courses' },
              { id: 'ENROLLED', label: 'Enrolled' },
              { id: 'FREE', label: 'Free' },
              { id: 'BEGINNER', label: 'Beginner' },
              { id: 'INTERMEDIATE', label: 'Intermediate' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all whitespace-nowrap ${
                  selectedFilter === tab.id
                    ? 'bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-bold shadow-md'
                    : 'bg-[hsl(var(--av-night))] text-[hsl(var(--av-parchment)/0.7)] border border-[hsl(var(--av-stone)/0.3)] hover:border-[hsl(var(--av-gold)/0.5)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-[1200px] mx-auto px-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[hsl(var(--av-gold))] animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--av-parchment)/0.5)]">
              Loading Academy Curricula...
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-20 text-center bg-[hsl(var(--av-night))] rounded-3xl border border-[hsl(var(--av-stone)/0.3)] p-12 max-w-md mx-auto space-y-4">
            <BookOpen className="w-10 h-10 text-[hsl(var(--av-gold))] mx-auto opacity-70" />
            <h3 className="font-serif text-xl text-[hsl(var(--av-parchment))]">No Courses Found</h3>
            <p className="text-xs text-[hsl(var(--av-parchment)/0.6)]">
              Try adjusting your search keywords or filter criteria.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedFilter('ALL')
              }}
              variant="outline"
              className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-xs uppercase"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const firstLesson = course.modules[0]?.lessons[0]
              const continueId = course.continueLessonId || firstLesson?.id || 'lesson-1'

              return (
                <div
                  key={course.id}
                  className="group bg-[hsl(var(--av-night))] rounded-3xl border border-[hsl(var(--av-stone)/0.3)] hover:border-[hsl(var(--av-gold)/0.5)] transition-all duration-500 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl"
                >
                  {/* Thumbnail Area */}
                  <div className="relative aspect-video overflow-hidden bg-black/40">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black to-slate-900">
                        <BookOpen className="w-12 h-12 text-[hsl(var(--av-gold)/0.4)]" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--av-night))] via-transparent to-black/30" />

                    {/* Level & Enrolled Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge className="bg-black/60 backdrop-blur-md border border-white/10 text-[hsl(var(--av-parchment))] text-[10px] font-mono uppercase tracking-wider">
                        {course.level.replace('_', ' ')}
                      </Badge>
                      {!course.isPaid && (
                        <Badge className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-mono uppercase tracking-wider">
                          Free Course
                        </Badge>
                      )}
                    </div>

                    {course.enrolled && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] text-[10px] font-bold uppercase tracking-widest shadow-md">
                          Enrolled
                        </Badge>
                      </div>
                    )}

                    {/* Duration Pill at bottom */}
                    <div className="absolute bottom-3 left-3 text-[11px] font-mono text-[hsl(var(--av-parchment)/0.8)] flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      <Clock className="w-3.5 h-3.5 text-[hsl(var(--av-gold))]" />
                      <span>{course.totalDurationMinutes} mins • {course.totalLessons} lessons</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-mono uppercase tracking-widest text-[hsl(var(--av-gold))]">
                        {course.instructorName}
                      </p>
                      <h3 className="font-serif text-lg font-bold text-[hsl(var(--av-parchment))] leading-snug group-hover:text-[hsl(var(--av-gold-soft))] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[hsl(var(--av-parchment)/0.6)] line-clamp-2 leading-relaxed">
                        {course.subtitle || course.description}
                      </p>
                    </div>

                    {/* Progress Bar if enrolled */}
                    {course.enrolled && (
                      <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--av-stone)/0.2)]">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[hsl(var(--av-parchment)/0.6)]">Your Progress</span>
                          <span className="text-[hsl(var(--av-gold))] font-bold">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[hsl(var(--av-gold))] transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-[hsl(var(--av-stone)/0.2)] flex items-center justify-between gap-3">
                      <div>
                        {course.isPaid ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-serif text-lg font-bold text-[hsl(var(--av-parchment))]">
                              ₹{course.salePriceINR || course.priceINR}
                            </span>
                            {course.salePriceINR && (
                              <span className="text-xs text-[hsl(var(--av-parchment)/0.4)] line-through">
                                ₹{course.priceINR}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                            Free Access
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/courses/${course.slug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-[hsl(var(--av-parchment))] hover:bg-white/5 text-xs h-9"
                          >
                            Syllabus
                          </Button>
                        </Link>

                        {course.enrolled ? (
                          <Link href={`/courses/${course.slug}/lessons/${continueId}`}>
                            <Button
                              size="sm"
                              className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs font-medium h-9 px-4 shadow-md"
                            >
                              <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                              {course.progress > 0 ? 'Resume' : 'Start'}
                            </Button>
                          </Link>
                        ) : course.isPaid ? (
                          <Link href={`/courses/${course.slug}`}>
                            <Button
                              size="sm"
                              className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs font-medium h-9 px-4"
                            >
                              Enroll
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            size="sm"
                            disabled={enrollingId === course.id}
                            onClick={() => handleEnroll(course.id, course.title)}
                            className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs font-medium h-9 px-4"
                          >
                            {enrollingId === course.id ? (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 mr-1" />
                            )}
                            Enroll Free
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
