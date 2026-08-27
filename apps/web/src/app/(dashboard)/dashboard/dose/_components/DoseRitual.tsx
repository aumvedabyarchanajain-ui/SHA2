'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Phase = 'arrive' | 'practice' | 'reflect' | 'complete'

interface MultiSensoryDoseData {
  id: number
  title: string
  promptText: string
  durationSec: number
  frequencyHz?: number
  frequencyName?: string
  affirmation?: string
  cbtReframe?: string
  microHabit?: string
  alreadyComplete?: boolean
}

interface DoseRitualProps {
  dose: MultiSensoryDoseData
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function DoseRitual({ dose }: DoseRitualProps) {
  const mins = Math.max(1, Math.round(dose.durationSec / 60))
  const [phase, setPhase] = useState<Phase>(dose.alreadyComplete ? 'complete' : 'arrive')
  const [focus, setFocus] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [breathOn, setBreathOn] = useState(true)
  const [soundOn, setSoundOn] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cbtReflection, setCbtReflection] = useState('')
  const [microHabitDone, setMicroHabitDone] = useState(false)
  const [updatedProgress, setUpdatedProgress] = useState<{ P_t: number; S_t: number; A_t: number; J_t: number; W_t: number } | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const frequencyHz = dose.frequencyHz ?? 528
  const frequencyName = dose.frequencyName ?? '528 Hz · Transformation & Cellular Repair'
  const affirmation = dose.affirmation ?? 'I release the need to control the outcome. My nervous system is safe to receive.'
  const cbtReframe = dose.cbtReframe ?? 'Where in your life are you mistaking chronic tension for strength? What happens if you soften your shoulders for 3 breaths?'
  const microHabit = dose.microHabit ?? 'Stand up, drop your jaw, and do a 60-second somatic shakeout from wrists to ankles.'

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const stopAudio = useCallback(() => {
    try {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1)
      }
      if (oscRef.current) {
        oscRef.current.stop(audioCtxRef.current ? audioCtxRef.current.currentTime + 0.15 : undefined)
        oscRef.current.disconnect()
        oscRef.current = null
      }
    } catch {
      // AudioContext cleanup safety
    }
  }, [])

  const startAudio = useCallback(() => {
    try {
      stopAudio()
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }

      const osc = audioCtxRef.current.createOscillator()
      const gain = audioCtxRef.current.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequencyHz, audioCtxRef.current.currentTime)

      gain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.08, audioCtxRef.current.currentTime + 1.5)

      osc.connect(gain)
      gain.connect(audioCtxRef.current.destination)

      osc.start()
      oscRef.current = osc
      gainRef.current = gain
    } catch (err) {
      console.warn('[DoseRitual] Web Audio API tone generation notice:', err)
    }
  }, [frequencyHz, stopAudio])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      stopAudio()
    }
  }, [stopAudio])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startPractice = () => {
    setFocus(true)
    setPhase('practice')
    setElapsed(0)
    stopTimer()
    if (soundOn) startAudio()

    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= dose.durationSec) {
          stopTimer()
          stopAudio()
          setPhase('reflect')
          return dose.durationSec
        }
        return e + 1
      })
    }, 1000)
  }

  const toggleSound = () => {
    const nextSound = !soundOn
    setSoundOn(nextSound)
    if (phase === 'practice') {
      if (nextSound) startAudio()
      else stopAudio()
    }
  }

  const exitFocus = () => {
    stopTimer()
    stopAudio()
    setFocus(false)
    if (phase === 'practice') setPhase('arrive')
  }

  const markComplete = async () => {
    setCompleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/daily-dose/${dose.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflection: cbtReflection, microHabitDone }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not save completion.')
        return
      }
      const json = await res.json()
      if (json.progress) {
        setUpdatedProgress(json.progress)
      }
      setPhase('complete')
      setFocus(false)
      stopTimer()
      stopAudio()
    } catch {
      setError('Could not save. Try again when ready.')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div
      className={
        focus
          ? 'fixed inset-0 z-50 bg-[hsl(var(--av-night))] text-[hsl(var(--av-parchment))] flex flex-col overflow-y-auto'
          : 'space-y-10'
      }
    >
      {focus ? (
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--av-parchment)/0.12)]">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--av-gold))]">
            Sacred Focus Space
          </p>
          <button
            type="button"
            onClick={exitFocus}
            className="font-body text-sm text-[hsl(var(--av-parchment)/0.7)] underline underline-offset-4"
          >
            Exit Focus
          </button>
        </div>
      ) : null}

      <div
        className={
          focus
            ? 'flex-1 flex flex-col items-center justify-center px-6 py-12 space-y-10 max-w-[680px] mx-auto w-full'
            : 'space-y-10'
        }
      >
        {!focus ? (
          <header className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
                AHI Daily Dose
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--av-stone))] text-[hsl(var(--av-night))] font-mono">
                {frequencyHz} Hz
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--av-night))] leading-tight text-balance">
              {dose.title}
            </h2>
            <p className="font-mono text-sm tabular text-[hsl(var(--av-mute))]">{mins} minutes</p>
            <p className="font-body text-base text-[hsl(var(--av-mute))] leading-relaxed max-w-[55ch]">
              {dose.promptText}
            </p>
          </header>
        ) : (
          <header className="text-center space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance text-[hsl(var(--av-gold-soft))]">
              {dose.title}
            </h2>
            <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.65)] max-w-[44ch] mx-auto leading-relaxed">
              {dose.promptText}
            </p>
          </header>
        )}

        {/* 4 Multi-Sensory Components Preview / Active */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {/* 1. Audio Frequency */}
          <div className="p-4 rounded-xl border border-[hsl(var(--av-stone))] bg-[hsl(var(--av-parchment)/0.5)] space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[hsl(var(--av-gold))]">
              1. Sound Frequency
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--av-night))]">{frequencyName}</p>
            <p className="text-xs text-[hsl(var(--av-mute))]">Resonates with cellular &amp; neural rhythms</p>
          </div>

          {/* 2. Subconscious Seed Affirmation */}
          <div className="p-4 rounded-xl border border-[hsl(var(--av-stone))] bg-[hsl(var(--av-parchment)/0.5)] space-y-1">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[hsl(var(--av-gold))]">
              2. Subconscious Seed
            </p>
            <p className="text-xs italic font-serif text-[hsl(var(--av-night))]">&ldquo;{affirmation}&rdquo;</p>
            <p className="text-[11px] text-[hsl(var(--av-mute))]">Neuroplastic cognitive anchor</p>
          </div>
        </div>

        {/* Breathing orb & Tone Control */}
        {(phase === 'practice' || (focus && phase === 'arrive')) && (
          <div className="flex flex-col items-center gap-6" aria-live="polite">
            <div
              className={`w-32 h-32 rounded-full border border-[hsl(var(--av-gold)/0.45)] ${
                breathOn && !reducedMotion ? 'animate-av-breathe' : ''
              }`}
              style={{
                background: focus
                  ? 'hsl(var(--av-gold) / 0.15)'
                  : 'hsl(var(--av-gold) / 0.08)',
              }}
              aria-hidden
            />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleSound}
                className="text-xs px-3 py-1 rounded-full border border-[hsl(var(--av-gold)/0.4)] text-[hsl(var(--av-gold-soft))] hover:bg-[hsl(var(--av-gold)/0.1)] transition-colors"
              >
                {soundOn ? `🔊 ${frequencyHz} Hz Active` : `🔈 Play ${frequencyHz} Hz Tone`}
              </button>
              <button
                type="button"
                onClick={() => setBreathOn((b) => !b)}
                className="text-xs text-[hsl(var(--av-mute))] underline"
              >
                {breathOn ? 'Pause Orb' : 'Animate Orb'}
              </button>
            </div>
            <p
              className={`font-body text-sm ${
                focus ? 'text-[hsl(var(--av-parchment)/0.7)]' : 'text-[hsl(var(--av-mute))]'
              }`}
            >
              {phase === 'practice' ? 'Breathe with the frequency rhythm. Inhale life, exhale tension.' : 'When ready, begin.'}
            </p>
          </div>
        )}

        {phase === 'arrive' && !dose.alreadyComplete && (
          <div
            className={
              focus
                ? 'space-y-6 text-center'
                : 'rounded-xl bg-[hsl(var(--av-night))] p-8 md:p-10 space-y-6 text-[hsl(var(--av-parchment))]'
            }
          >
            <p
              className={`font-body text-sm leading-relaxed max-w-[48ch] ${
                focus ? 'mx-auto text-[hsl(var(--av-parchment)/0.7)]' : 'text-[hsl(var(--av-parchment)/0.7)]'
              }`}
            >
              Press play when you are ready. 3 minutes of multi-sensory grounding.
            </p>
            <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
              <button
                type="button"
                onClick={startPractice}
                aria-label="Begin today's practice"
                className="w-14 h-14 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] flex items-center justify-center transition-opacity duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--av-gold-soft))]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </button>
              {!focus ? (
                <button
                  type="button"
                  onClick={() => setFocus(true)}
                  className="font-body text-sm text-[hsl(var(--av-gold-soft))] underline underline-offset-4"
                >
                  Enter full-screen quiet space
                </button>
              ) : null}
            </div>
          </div>
        )}

        {phase === 'practice' && (
          <div className="text-center space-y-4">
            <p
              className={`font-mono text-3xl tabular font-bold ${
                focus ? 'text-[hsl(var(--av-gold-soft))]' : 'text-[hsl(var(--av-night))]'
              }`}
            >
              {formatTime(elapsed)} / {formatTime(dose.durationSec)}
            </p>
            <button
              type="button"
              onClick={() => {
                stopTimer()
                stopAudio()
                setPhase('reflect')
              }}
              className={`font-body text-sm underline underline-offset-4 ${
                focus ? 'text-[hsl(var(--av-parchment)/0.7)]' : 'text-[hsl(var(--av-mute))]'
              }`}
            >
              Skip to CBT Reframe &amp; Reflection →
            </button>
          </div>
        )}

        {phase === 'reflect' && (
          <div className={`space-y-6 text-left ${focus ? 'text-[hsl(var(--av-parchment))]' : ''}`}>
            {/* 3. CBT Reframe */}
            <div className="p-5 rounded-xl border border-[hsl(var(--av-stone))] bg-[hsl(var(--av-parchment)/0.3)] space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--av-gold))]">
                3. Cognitive CBT Reframe
              </p>
              <h3 className="font-serif text-lg md:text-xl text-[hsl(var(--av-night))] font-semibold">
                {cbtReframe}
              </h3>
              <textarea
                value={cbtReflection}
                onChange={(e) => setCbtReflection(e.target.value)}
                placeholder="Write your 1-line somatic observation (optional)..."
                rows={2}
                className="w-full p-3 rounded-lg border border-[hsl(var(--av-stone))] bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--av-gold)/0.4)] text-[hsl(var(--av-night))]"
              />
            </div>

            {/* 4. Somatic Micro-Habit */}
            <div className="p-5 rounded-xl border border-[hsl(var(--av-stone))] bg-[hsl(var(--av-parchment)/0.3)] space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--av-gold))]">
                4. Somatic Micro-Habit (60s)
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={microHabitDone}
                  onChange={(e) => setMicroHabitDone(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded accent-[hsl(var(--av-gold))]"
                />
                <span className="text-sm text-[hsl(var(--av-night))] leading-relaxed">
                  {microHabit}
                </span>
              </label>
            </div>

            {error ? (
              <p className="font-body text-sm text-[hsl(var(--av-rose))]" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={completing}
              onClick={() => void markComplete()}
              className={`inline-flex h-12 items-center px-8 rounded-full font-body text-sm font-medium ${
                focus
                  ? 'bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))]'
                  : 'bg-[hsl(var(--av-night))] text-[hsl(var(--av-gold-soft))]'
              } disabled:opacity-60 transition-all hover:opacity-90`}
            >
              {completing ? 'Calculating Real-Time Score (P_t)...' : 'Complete Multi-Sensory Dose'}
            </button>
          </div>
        )}

        {phase === 'complete' && (
          <div className="space-y-6 border-t border-[hsl(var(--av-stone))] pt-8 text-left">
            <div className="p-6 rounded-2xl bg-[hsl(var(--av-night))] text-[hsl(var(--av-parchment))] space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--av-gold))]">
                  Real-Time Progress Score Updated
                </p>
                <span className="text-xl font-bold font-mono text-[hsl(var(--av-gold-soft))]">
                  P_t: {updatedProgress?.P_t ?? 68}%
                </span>
              </div>
              <p className="text-xs text-[hsl(var(--av-parchment)/0.7)] font-mono">
                Formula: P_t = 0.35·S_t + 0.30·A_t + 0.25·J_t + 0.10·W_t
              </p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2 border-t border-white/10 font-mono">
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-white/50 block">Sleep S_t</span>
                  <span className="font-bold text-white">{updatedProgress?.S_t ?? 50}</span>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-white/50 block">Activity A_t</span>
                  <span className="font-bold text-white">{updatedProgress?.A_t ?? 40}</span>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-white/50 block">Dose/Jnl J_t</span>
                  <span className="font-bold text-[#F0D58C]">{updatedProgress?.J_t ?? 80}</span>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-white/50 block">Wellbeing W_t</span>
                  <span className="font-bold text-white">{updatedProgress?.W_t ?? 70}</span>
                </div>
              </div>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl text-[hsl(var(--av-night))] text-balance">
              Practice integrated.
            </h3>
            <p className="font-body text-base text-[hsl(var(--av-mute))] leading-relaxed max-w-[48ch]">
              Carry this quiet frequency into your day. Your progress score has updated.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/journal/new"
                className="inline-flex h-11 items-center px-6 rounded-full bg-[hsl(var(--av-night))] text-[hsl(var(--av-gold-soft))] font-body text-sm"
              >
                Open journal
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center px-6 rounded-full border border-[hsl(var(--av-night))] text-[hsl(var(--av-night))] font-body text-sm"
              >
                Return home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
