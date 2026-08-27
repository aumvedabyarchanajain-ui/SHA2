'use client'

import React, { useState } from 'react'
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { showSuccess, showError } from '@/utils/toast'
import type { LMSQuizData } from '@/lib/lms-data'

interface ModuleQuizCardProps {
  quiz: LMSQuizData
  onQuizPassed?: () => void
}

export default function ModuleQuizCard({ quiz, onQuizPassed }: ModuleQuizCardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    scorePct: number
    isPassed: boolean
    correctAnswers: Record<string, number>
    explanations: Record<string, string>
  } | null>(
    quiz.userSubmission
      ? {
          scorePct: quiz.userSubmission.scorePct,
          isPassed: quiz.userSubmission.isPassed,
          correctAnswers: quiz.questions.reduce((acc, q) => {
            acc[q.id] = q.correctIndex
            return acc
          }, {} as Record<string, number>),
          explanations: quiz.questions.reduce((acc, q) => {
            acc[q.id] = q.explanation
            return acc
          }, {} as Record<string, string>),
        }
      : null,
  )

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (result?.isPassed) return // Locked if already passed
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleSubmit = async () => {
    // Ensure all questions answered
    const unanswered = quiz.questions.some((q) => selectedAnswers[q.id] === undefined)
    if (unanswered) {
      showError('Please answer all questions before submitting your assessment.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/lms/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to evaluate quiz')
      }

      setResult({
        scorePct: data.scorePct,
        isPassed: data.isPassed,
        correctAnswers: data.correctAnswers,
        explanations: data.explanations,
      })

      if (data.isPassed) {
        showSuccess(`Assessment Passed! Score: ${data.scorePct}%`)
        onQuizPassed?.()
      } else {
        showError(`Score: ${data.scorePct}%. Passing threshold is ${quiz.passingScorePct}%. Review and re-attempt.`)
      }
    } catch (err: any) {
      showError(err.message || 'Error submitting assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setResult(null)
  }

  return (
    <div className="bg-[hsl(var(--av-night))] border border-[hsl(var(--av-stone)/0.3)] rounded-2xl p-6 md:p-8 shadow-xl text-[hsl(var(--av-parchment))] space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[hsl(var(--av-stone)/0.2)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--av-gold)/0.15)] flex items-center justify-center border border-[hsl(var(--av-gold)/0.3)]">
            <Trophy className="w-5 h-5 text-[hsl(var(--av-gold))]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[hsl(var(--av-parchment))]">
              {quiz.title}
            </h3>
            <p className="text-xs text-[hsl(var(--av-parchment)/0.5)]">
              {quiz.questions.length} Questions • Required Passing Score: {quiz.passingScorePct}%
            </p>
          </div>
        </div>

        {result && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
              result.isPassed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {result.isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>
              {result.scorePct}% Score — {result.isPassed ? 'PASSED' : 'RE-ATTEMPT REQUIRED'}
            </span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIndex) => {
          const selected = selectedAnswers[q.id]
          const isSubmitted = result !== null
          const correctIdx = result?.correctAnswers?.[q.id]
          const explanation = result?.explanations?.[q.id]

          return (
            <div
              key={q.id}
              className="bg-[hsl(var(--av-ink))] border border-[hsl(var(--av-stone)/0.2)] rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[hsl(var(--av-gold)/0.2)] text-[hsl(var(--av-gold))] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <h4 className="text-sm font-medium text-[hsl(var(--av-parchment))] leading-relaxed">
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIdx) => {
                  const isThisSelected = selected === optIdx
                  let optStyle =
                    'border-[hsl(var(--av-stone)/0.3)] bg-black/20 text-[hsl(var(--av-parchment)/0.7)] hover:border-[hsl(var(--av-stone)/0.6)]'

                  if (isSubmitted) {
                    if (optIdx === correctIdx) {
                      optStyle =
                        'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-medium'
                    } else if (isThisSelected && optIdx !== correctIdx) {
                      optStyle =
                        'border-rose-500/60 bg-rose-500/10 text-rose-300 font-medium'
                    }
                  } else if (isThisSelected) {
                    optStyle =
                      'border-[hsl(var(--av-gold))] bg-[hsl(var(--av-gold)/0.15)] text-[hsl(var(--av-parchment))] font-medium'
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted && result?.isPassed}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs flex items-center justify-between transition-all ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && optIdx === correctIdx && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && isThisSelected && optIdx !== correctIdx && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation note */}
              {isSubmitted && explanation && (
                <div className="mt-3 pl-9 text-xs text-[hsl(var(--av-parchment)/0.6)] bg-white/5 p-3 rounded-lg border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-[hsl(var(--av-gold))]">
                    Vedic Mastery Note
                  </div>
                  <p className="leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[hsl(var(--av-stone)/0.2)]">
        <div className="text-xs text-[hsl(var(--av-parchment)/0.5)]">
          {result?.isPassed
            ? '✨ Completed & verified. Your progress has been updated.'
            : 'Pass with 80%+ to unlock your final Course Certificate.'}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {result && !result.isPassed && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-[hsl(var(--av-parchment))] hover:bg-white/5 text-xs uppercase tracking-widest px-5 h-10"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Re-attempt
            </Button>
          )}

          {(!result || !result.isPassed) && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs uppercase tracking-widest font-medium px-6 h-10 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Grading Assessment...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                  Submit Module Assessment
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
