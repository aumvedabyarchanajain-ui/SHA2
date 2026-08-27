'use client'

import { useState } from 'react'
import Image from 'next/image'

export type PractitionerId = 'archana' | 'sejal'

export interface PractitionerInfo {
  id: PractitionerId
  name: string
  role: string
  location: string
  bio: string
  focusTags: string[]
  avatarInitial: string
}

export const PRACTITIONERS: Record<PractitionerId, PractitionerInfo> = {
  archana: {
    id: 'archana',
    name: 'Archana Jain',
    role: 'Vedic Practitioner · Astrology, Vastu & Ritual',
    location: 'Jaipur · 25+ Years Lineage',
    bio: 'Archana brings 25+ years of Vedic lineage — natal chart, sacred space, and ritual as a living map for how you heal in daily life.',
    focusTags: ['Vedic Astrology & Jyotish', 'Chakra Alignment', 'Sacred Space & Vastu', 'Karmic Blueprint'],
    avatarInitial: 'A',
  },
  sejal: {
    id: 'sejal',
    name: 'Sejal Jain',
    role: 'Healing Facilitator · Somatic & Nervous System Work',
    location: 'Mumbai · Modern Somatic & Trauma-Informed',
    bio: 'Sejal holds CBT-informed coaching, breathwork, and somatic practices — evidence meeting presence, never clinical coldness.',
    focusTags: ['Somatic Release', 'Nervous System Regulation', 'Breathwork', 'Emotional Safety'],
    avatarInitial: 'S',
  },
}

const FAQ = [
  {
    q: 'Is this confidential?',
    a: 'Yes. What you share stays between you and your practitioner. Session notes are stored in India under DPDP-aligned practices and are never sold.',
  },
  {
    q: 'What if I need to reschedule?',
    a: 'Reschedule or cancel up to 24 hours before your session with no charge — reply to your confirmation email or use Sessions in your sanctuary. Within 24 hours, give as much notice as you can.',
  },
  {
    q: 'Do I need to prepare anything?',
    a: 'Find a quiet private space, stable internet, and headphones if you can. Your portal profile already informs the session — you do not need to retell everything.',
  },
  {
    q: 'Is the Discovery Call really free?',
    a: 'Yes. It is a 15-minute alignment call to review your blueprint and recommend a path. There is no obligation to purchase.',
  },
]

/** Practitioner selection + expectations + privacy */
export function TrustInvite({
  selectedPractitionerId,
  recommendedPractitionerId,
  onSelectPractitioner,
  onContinue,
  onBack,
}: {
  selectedPractitionerId: PractitionerId
  recommendedPractitionerId: PractitionerId
  onSelectPractitioner: (id: PractitionerId) => void
  onContinue: () => void
  onBack: () => void
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const selectedPractitioner = PRACTITIONERS[selectedPractitionerId]

  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
          Discovery Call
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--av-parchment))] text-balance">
          Choose your practitioner
        </h2>
        <p className="font-body text-base text-[hsl(var(--av-parchment)/0.6)] leading-relaxed max-w-[48ch] mx-auto">
          Fifteen quiet minutes with a real practitioner — select Archana Jain or Sejal Jain to guide your next step.
        </p>
      </div>

      {/* Practitioner Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label="Select practitioner">
        {(['archana', 'sejal'] as const).map((id) => {
          const practitioner = PRACTITIONERS[id]
          const isSelected = selectedPractitionerId === id
          const isRecommended = recommendedPractitionerId === id

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectPractitioner(id)}
              className={`relative text-left p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[hsl(var(--av-gold)/0.12)] border-[hsl(var(--av-gold))] shadow-[0_0_24px_rgba(201,168,76,0.15)] ring-1 ring-[hsl(var(--av-gold)/0.4)]'
                  : 'bg-[hsl(var(--av-parchment)/0.03)] border-[hsl(var(--av-parchment)/0.12)] hover:border-[hsl(var(--av-parchment)/0.3)] hover:bg-[hsl(var(--av-parchment)/0.06)]'
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-body text-[10px] font-semibold uppercase tracking-wider shadow-md">
                  Recommended for your blueprint
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-full border flex items-center justify-center font-serif text-lg transition-colors ${
                        isSelected
                          ? 'bg-[hsl(var(--av-gold)/0.25)] border-[hsl(var(--av-gold))] text-[hsl(var(--av-gold-soft))]'
                          : 'bg-[hsl(var(--av-parchment)/0.08)] border-[hsl(var(--av-parchment)/0.2)] text-[hsl(var(--av-parchment)/0.7)]'
                      }`}
                      aria-hidden
                    >
                      {practitioner.avatarInitial}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-[hsl(var(--av-parchment))]">
                        {practitioner.name}
                      </h3>
                      <p className="font-body text-xs text-[hsl(var(--av-parchment)/0.5)]">
                        {practitioner.location}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[hsl(var(--av-gold))] bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))]'
                        : 'border-[hsl(var(--av-parchment)/0.3)] bg-transparent'
                    }`}
                    aria-hidden
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <p className="font-body text-xs font-medium text-[hsl(var(--av-gold))]">
                  {practitioner.role}
                </p>

                <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.75)] leading-relaxed">
                  {practitioner.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {practitioner.focusTags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                        isSelected
                          ? 'border-[hsl(var(--av-gold)/0.3)] bg-[hsl(var(--av-gold)/0.1)] text-[hsl(var(--av-gold-soft))]'
                          : 'border-[hsl(var(--av-parchment)/0.1)] bg-[hsl(var(--av-parchment)/0.04)] text-[hsl(var(--av-parchment)/0.6)]'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[hsl(var(--av-parchment)/0.08)] flex items-center justify-between text-xs">
                <span className={`font-body font-medium ${isSelected ? 'text-[hsl(var(--av-gold))]' : 'text-[hsl(var(--av-parchment)/0.4)]'}`}>
                  {isSelected ? '✓ Selected Practitioner' : 'Click to select'}
                </span>
                <span className="text-[hsl(var(--av-parchment)/0.4)] font-body">15 min · Free</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Shared Lineage banner */}
      <div className="rounded-2xl border border-[hsl(var(--av-parchment)/0.12)] overflow-hidden">
        <div className="relative aspect-[21/8] bg-[hsl(var(--av-night))]">
          <Image
            src="/marketing/founders.jpg"
            alt="Archana Jain and Sejal Jain"
            fill
            className="object-cover object-center opacity-85"
            sizes="(max-width: 640px) 100vw, 560px"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--av-night))] via-[hsl(var(--av-night)/0.4)] to-transparent"
            aria-hidden
          />
        </div>
        <div className="p-5 md:p-6 space-y-2 -mt-6 relative text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--av-gold))]">
            Mother & Daughter · Jaipur & Mumbai
          </p>
          <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.7)] leading-relaxed max-w-[50ch] mx-auto">
            Eastern Vedic wisdom and modern somatic regulation held in one sanctuary. Whichever practitioner you choose, your answers are held with absolute privacy.
          </p>
        </div>
      </div>

      {/* What happens next */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl text-[hsl(var(--av-parchment))] text-center">
          What happens next
        </h3>
        <ol className="space-y-6 max-w-md mx-auto">
          {[
            {
              t: 'Before',
              d: `${selectedPractitioner.name} reviews your blueprint so you do not start from zero. Confirmation email and calendar invite arrive immediately.`,
            },
            {
              t: 'During',
              d: '15 quiet minutes: your blueprint, what feels urgent, and whether a Discovery path or deeper work fits.',
            },
            {
              t: 'After',
              d: 'Clear next step — Daily Dose, a programme, or simply space. No pressure. You decide.',
            },
          ].map((step) => (
            <li key={step.t} className="space-y-1">
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--av-gold))]">
                {step.t}
              </p>
              <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.7)] leading-relaxed">
                {step.d}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3 text-center max-w-[42ch] mx-auto">
        <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.5)] leading-relaxed">
          Confidential. India-hosted. Your story stays with the people guiding you.
        </p>
        <p className="font-body text-xs text-[hsl(var(--av-parchment)/0.4)] leading-relaxed">
          Cancel or reschedule free of charge until 24 hours before. After that, reply to your
          confirmation so we can offer the slot to someone waiting.
        </p>
      </div>

      <div className="border-t border-[hsl(var(--av-parchment)/0.1)] pt-8 space-y-2 max-w-lg mx-auto">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--av-parchment)/0.4)] text-center mb-4">
          Common questions
        </p>
        {FAQ.map((item, i) => (
          <div key={item.q} className="border-b border-[hsl(var(--av-parchment)/0.08)]">
            <button
              type="button"
              aria-expanded={openFaq === i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full min-h-[48px] flex items-center justify-between gap-4 py-3 text-left font-body text-sm text-[hsl(var(--av-parchment))]"
            >
              {item.q}
              <span className="text-[hsl(var(--av-gold))]" aria-hidden>
                {openFaq === i ? '−' : '+'}
              </span>
            </button>
            {openFaq === i && (
              <p className="pb-4 font-body text-sm text-[hsl(var(--av-parchment)/0.55)] leading-relaxed">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[52px] px-10 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-body font-medium transition-opacity duration-300 hover:opacity-90 shadow-lg shadow-[rgba(201,168,76,0.2)]"
        >
          Choose a time with {selectedPractitioner.name}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="font-body text-sm text-[hsl(var(--av-parchment)/0.4)] hover:text-[hsl(var(--av-parchment)/0.7)] transition-colors"
        >
          Back to blueprint
        </button>
      </div>
    </div>
  )
}
