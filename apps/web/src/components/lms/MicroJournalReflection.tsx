'use client'

import React, { useState, useEffect } from 'react'
import { Feather, Sparkles, CheckCircle2, Loader2, Heart, Shield, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { showSuccess, showError } from '@/utils/toast'

interface MicroJournalReflectionProps {
  lessonId: string
  lessonTitle: string
  prompt?: string | null
  initialText?: string
  initialMood?: number | null
}

const MOODS = [
  { value: 1, label: 'Heavy / Constricted', emoji: '🌑' },
  { value: 2, label: 'Tender / Vulnerable', emoji: '🌘' },
  { value: 3, label: 'Neutral / Observing', emoji: '🌓' },
  { value: 4, label: 'Soft / Grounded', emoji: '🌔' },
  { value: 5, label: 'Expansive / Light', emoji: '🌕' },
]

export default function MicroJournalReflection({
  lessonId,
  lessonTitle,
  prompt,
  initialText = '',
  initialMood = 3,
}: MicroJournalReflectionProps) {
  const [reflectionText, setReflectionText] = useState(initialText)
  const [mood, setMood] = useState<number>(initialMood || 3)
  const [saving, setSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  useEffect(() => {
    setReflectionText(initialText)
    if (initialMood) setMood(initialMood)
  }, [initialText, initialMood])

  const defaultPrompt = prompt || 'What sensation, emotion, or insight arose in your body during this practice?'

  const handleSave = async () => {
    if (!reflectionText.trim()) {
      showError('Please write a few words before saving your reflection.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/v1/lms/lessons/${lessonId}/reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reflectionText,
          mood,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save reflection')
      }

      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      showSuccess('Reflection saved to your Sacred Record')
    } catch (err: any) {
      showError(err.message || 'Could not save reflection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[hsl(var(--av-night))] border border-[hsl(var(--av-stone)/0.3)] rounded-2xl p-6 md:p-8 shadow-xl text-[hsl(var(--av-parchment))] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[hsl(var(--av-stone)/0.2)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--av-gold)/0.15)] flex items-center justify-center border border-[hsl(var(--av-gold)/0.3)]">
            <Feather className="w-4 h-4 text-[hsl(var(--av-gold))]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[hsl(var(--av-parchment))]">
              In-Lesson Micro-Journal Reflection
            </h3>
            <p className="text-xs text-[hsl(var(--av-parchment)/0.5)]">
              Integrated with your Sacred Client Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[hsl(var(--av-parchment)/0.4)]">
          <Lock className="w-3 h-3 text-[hsl(var(--av-gold))]" />
          <span>Encrypted Sanctuary Reflection</span>
        </div>
      </div>

      {/* Inquiry Prompt */}
      <div className="bg-[hsl(var(--av-ink))] border border-[hsl(var(--av-gold)/0.2)] rounded-xl p-4 md:p-5 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[hsl(var(--av-gold))] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-[hsl(var(--av-gold))] font-medium">
              Somatic Inquiry Prompt
            </p>
            <p className="text-sm font-serif italic text-[hsl(var(--av-parchment)/0.9)] leading-relaxed">
              "{defaultPrompt}"
            </p>
          </div>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--av-parchment)/0.6)]">
          Current Somatic Sensation State
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MOODS.map((m) => {
            const isSelected = mood === m.value
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`px-3 py-2.5 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'border-[hsl(var(--av-gold))] bg-[hsl(var(--av-gold)/0.15)] text-[hsl(var(--av-parchment))] shadow-md'
                    : 'border-[hsl(var(--av-stone)/0.3)] bg-black/20 text-[hsl(var(--av-parchment)/0.6)] hover:border-[hsl(var(--av-stone)/0.6)]'
                }`}
              >
                <span className="text-base">{m.emoji}</span>
                <span className="text-[10px] text-center font-medium leading-tight">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <textarea
          rows={4}
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Record your immediate physical sensations, emotional release, or whispers of intuition here..."
          className="w-full bg-[hsl(var(--av-ink))] border border-[hsl(var(--av-stone)/0.3)] focus:border-[hsl(var(--av-gold))] rounded-xl p-4 text-sm text-[hsl(var(--av-parchment))] placeholder:text-[hsl(var(--av-parchment)/0.3)] focus:outline-none transition-colors leading-relaxed resize-y min-h-[110px]"
        />
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-[hsl(var(--av-parchment)/0.4)] flex items-center gap-1.5">
          {lastSavedAt ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved at {lastSavedAt}</span>
            </>
          ) : (
            <span>Auto-synced to your personal journal history</span>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs uppercase tracking-widest font-medium px-6 h-10 shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
              Save Sacred Reflection
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
