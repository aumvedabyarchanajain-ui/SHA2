'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { StepRegistry } from '../../engine/StepRegistry'
import { BackgroundEngine } from '../../background/BackgroundEngine'
import { AudioProvider } from '../../audio'
import { getTheme } from '../../theme/themes'
import { PortalContent } from '../../design-system'
import { fadeUpVariants } from '../../animation/variants'
import { usePortal } from '../../engine/PortalContext'
import type { StepProps, PortalData } from '../../engine/types'
import { CalendarSelector } from './CalendarSelector'
import { TrustInvite, PRACTITIONERS, type PractitionerId } from './TrustInvite'

export function registerStep8() {
  StepRegistry.register({
    id: 8,
    title: 'Your Healing Blueprint',
    component: Step8Wrapper,
    validationSchema: undefined,
    enterAnimation: { type: 'fade', duration: 0.5 },
    exitAnimation: { type: 'fade', duration: 0.3 },
  })
}

type SubState =
  | 'decoding'
  | 'report'
  | 'invite'
  | 'booking'
  | 'register'
  | 'success'

const DISCOVERY = {
  id: 'free' as const,
  name: 'Free Discovery Call',
  price: 0,
  duration: 15,
  description: '15 minutes to review your blueprint and align on what comes next.',
}

function Step8Booking({ data }: StepProps<PortalData>) {
  const router = useRouter()
  const { completePortal } = usePortal()

  const [subState, setSubState] = useState<SubState>('decoding')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [bookingTime, setBookingTime] = useState<string | null>(null)

  const isSomatic =
    data.profileResult === 'wounded_warrior' ||
    data.profileResult === 'anxious_achiever' ||
    data.profileResult === 'frozen_heart'

  const recommendedPractitionerId: PractitionerId = isSomatic ? 'sejal' : 'archana'
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<PractitionerId>(recommendedPractitionerId)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  const therapist = PRACTITIONERS[selectedPractitionerId]

  useEffect(() => {
    if (subState !== 'decoding') return
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setSubState('report'), 350)
          return 100
        }
        return prev + 2
      })
    }, 40)
    return () => clearInterval(interval)
  }, [subState])

  const getChakraAnalysis = () => {
    switch (data.chakraSelected) {
      case 'root':
        return 'Your Root centre asks for grounding — safety, steadiness, and a body that can rest.'
      case 'sacral':
        return 'Your Sacral centre asks for creative flow and emotional honesty in relationship.'
      case 'solar_plexus':
        return 'Your Solar Plexus asks for clearer boundaries and kinder power.'
      case 'heart':
        return 'Your Heart centre asks for trust, thawing, and room to feel without armour.'
      case 'throat':
        return 'Your Throat centre asks for truth spoken at a pace your nervous system can hold.'
      case 'third_eye':
        return 'Your Third Eye asks for quiet mind and intuition without overthinking.'
      case 'crown':
        return 'Your Crown asks for meaning, belonging, and reconnection to purpose.'
      default:
        return 'Your primary centre is asking for gentle, consistent attention.'
    }
  }

  const getProfileDescription = () => {
    switch (data.profileResult) {
      case 'anxious_achiever':
        return 'You often convert unease into productivity. Healing here begins with slowing safely.'
      case 'wounded_warrior':
        return 'Your body still braces. Somatic release and paced care are the right door.'
      case 'frozen_heart':
        return 'Feeling stays guarded. Warmth and trust rebuild capacity over time.'
      case 'lost_soul':
        return 'Direction feels foggy. Grounding and cosmic context help you reorient.'
      case 'silent_sufferer':
        return 'You carry much inwardly. Voice, boundaries, and being heard matter here.'
      case 'awakening_one':
        return 'You are in transition. Integration and steady companionship serve you best.'
      default:
        return 'You are ready for targeted, human-guided healing.'
    }
  }

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitLock.current || submitting) return
    setRegError('')

    if (!bookingTime) {
      setRegError('Please choose a time for your Discovery Call.')
      return
    }
    if (password.length < 8) {
      setRegError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setRegError('Passwords do not match.')
      return
    }

    submitLock.current = true
    setSubmitting(true)

    try {
      const regRes = await fetch('/api/auth/register-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name, password }),
      })
      const regData = await regRes.json()
      if (!regRes.ok) throw new Error(regData.error || 'Failed to create account')

      const bookRes = await fetch('/api/portal/portal-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          practitioner: selectedPractitionerId,
          serviceType: 'discovery_call',
          bookingDatetime: bookingTime,
          durationMinutes: DISCOVERY.duration,
          amountPaid: 0,
          packageType: 'free',
        }),
      })
      const bookData = await bookRes.json()
      if (!bookRes.ok) throw new Error(bookData.error || 'Failed to save booking')

      await completePortal()

      const emailQ = bookData.emailSent === false ? '&email=pending' : ''
      const confirmPath = `/dashboard/appointments/confirmed?bookingId=${bookData.bookingId}${emailQ}`

      const signInResult = await signIn('credentials', {
        email: data.email,
        password,
        action: 'password',
        redirect: false,
      })

      if (signInResult?.error) {
        setRegError('Account created and booking saved. Please sign in to view confirmation.')
        setTimeout(() => {
          router.push(`/auth/login?callbackUrl=${encodeURIComponent(confirmPath)}`)
        }, 1800)
      } else {
        setSubState('success')
        setTimeout(() => {
          router.push(confirmPath)
        }, 2200)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setRegError(message)
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const formatBooking = () => {
    if (!bookingTime) return ''
    return new Date(bookingTime).toLocaleString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      timeZoneName: 'short',
    })
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-8">
      <AnimatePresence mode="wait">
        {subState === 'decoding' && (
          <motion.div
            key="decoding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 text-center space-y-6"
            role="status"
            aria-live="polite"
          >
            <PortalContent maxWidth="max-w-sm">
              <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
                Preparing
              </p>
              <h2 className="font-serif text-2xl text-[hsl(var(--av-parchment))] mt-3">
                Gathering your blueprint
              </h2>
              <div className="w-full h-px bg-[hsl(var(--av-parchment)/0.15)] mt-8 overflow-hidden">
                <motion.div
                  className="h-full bg-[hsl(var(--av-gold))]"
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </PortalContent>
          </motion.div>
        )}

        {subState === 'report' && (
          <motion.div
            key="report"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4 py-12"
          >
            <PortalContent maxWidth="max-w-xl">
              <div className="space-y-10 text-center">
                <div className="space-y-3">
                  <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
                    Your blueprint
                  </p>
                  <h1 className="font-serif text-3xl text-[hsl(var(--av-parchment))] text-balance">
                    We see where you are
                  </h1>
                </div>

                <div className="text-left space-y-6 border-y border-[hsl(var(--av-parchment)/0.1)] py-8">
                  <div className="space-y-2">
                    <p className="font-body text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--av-gold))]">
                      Energy
                    </p>
                    <p className="font-body text-base text-[hsl(var(--av-parchment)/0.75)] leading-relaxed capitalize">
                      {data.chakraSelected?.replace(/_/g, ' ')} — {getChakraAnalysis()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-body text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--av-gold))]">
                      Pattern
                    </p>
                    <p className="font-body text-base text-[hsl(var(--av-parchment)/0.75)] leading-relaxed">
                      {getProfileDescription()}
                    </p>
                  </div>
                  {(data.sunSign || data.tarotCard) && (
                    <div className="space-y-2">
                      <p className="font-body text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--av-gold))]">
                        Context
                      </p>
                      <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.55)]">
                        {[
                          data.sunSign && `Sun ${data.sunSign}`,
                          data.moonSign && `Moon ${data.moonSign}`,
                          data.tarotCard && data.tarotCard.replace(/_/g, ' '),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSubState('invite')}
                  className="min-h-[52px] px-10 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-body font-medium transition-opacity hover:opacity-90 shadow-lg shadow-[rgba(201,168,76,0.2)]"
                >
                  Choose your practitioner
                </button>
              </div>
            </PortalContent>
          </motion.div>
        )}

        {subState === 'invite' && (
          <motion.div
            key="invite"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4 py-12"
          >
            <PortalContent maxWidth="max-w-2xl">
              <TrustInvite
                selectedPractitionerId={selectedPractitionerId}
                recommendedPractitionerId={recommendedPractitionerId}
                onSelectPractitioner={(id) => {
                  setSelectedPractitionerId(id)
                  setBookingTime(null)
                }}
                onContinue={() => setSubState('booking')}
                onBack={() => setSubState('report')}
              />
            </PortalContent>
          </motion.div>
        )}

        {subState === 'booking' && (
          <motion.div
            key="booking"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4 py-12"
          >
            <PortalContent maxWidth="max-w-xl">
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
                    Free Discovery Call
                  </p>
                  <h2 className="font-serif text-2xl md:text-3xl text-[hsl(var(--av-parchment))] text-balance">
                    Pick a moment that feels calm
                  </h2>
                  <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.55)]">
                    15 minutes · with {therapist.name} · no payment
                  </p>

                  {/* Quick Practitioner Switcher */}
                  <div className="inline-flex p-1 rounded-full bg-[hsl(var(--av-parchment)/0.06)] border border-[hsl(var(--av-parchment)/0.12)] mt-2">
                    {(['archana', 'sejal'] as const).map((id) => {
                      const isSelected = selectedPractitionerId === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSelectedPractitionerId(id)
                            setBookingTime(null)
                          }}
                          className={`px-4 py-1.5 rounded-full font-body text-xs transition-all ${
                            isSelected
                              ? 'bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-medium shadow-sm'
                              : 'text-[hsl(var(--av-parchment)/0.6)] hover:text-[hsl(var(--av-parchment))]'
                          }`}
                        >
                          {PRACTITIONERS[id].name} {id === 'archana' ? '(Vedic)' : '(Somatic)'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-[hsl(var(--av-parchment)/0.12)] p-6">
                  <CalendarSelector
                    practitionerName={therapist.name}
                    durationMinutes={15}
                    onChange={(datetime) => setBookingTime(datetime || null)}
                  />
                </div>

                <div className="space-y-4 border-t border-[hsl(var(--av-parchment)/0.1)] pt-8">
                  <h3 className="font-serif text-lg text-[hsl(var(--av-parchment))] text-center">
                    Session expectations
                  </h3>
                  <ul className="space-y-3 max-w-md mx-auto font-body text-sm text-[hsl(var(--av-parchment)/0.65)] leading-relaxed">
                    <li>Quiet private space and stable connection.</li>
                    <li>We already hold your portal answers — come as you are.</li>
                    <li>Join link arrives by email closer to the hour.</li>
                    <li>Cancel or reschedule free until 24 hours before.</li>
                  </ul>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    disabled={!bookingTime}
                    onClick={() => setSubState('register')}
                    className="w-full max-w-sm min-h-[52px] rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-body font-medium disabled:opacity-40 transition-opacity hover:opacity-90 shadow-lg shadow-[rgba(201,168,76,0.2)]"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubState('invite')}
                    className="font-body text-sm text-[hsl(var(--av-parchment)/0.4)] hover:text-[hsl(var(--av-parchment)/0.7)] transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </PortalContent>
          </motion.div>
        )}

        {subState === 'register' && (
          <motion.div
            key="register"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4 py-12"
          >
            <PortalContent maxWidth="max-w-md">
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
                    Almost there
                  </p>
                  <h2 className="font-serif text-2xl text-[hsl(var(--av-parchment))]">
                    Secure your place
                  </h2>
                  {bookingTime && (
                    <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.55)] pt-2 leading-relaxed">
                      Discovery Call · {formatBooking()} · {therapist.name}
                    </p>
                  )}
                </div>

                {regError && (
                  <p
                    className="font-body text-sm text-[hsl(var(--av-rose))] border border-[hsl(var(--av-rose)/0.3)] rounded-xl px-4 py-3"
                    role="alert"
                  >
                    {regError}
                  </p>
                )}

                <form onSubmit={handleRegisterClient} className="space-y-5">
                  <div>
                    <label htmlFor="reg-name" className="font-body text-xs text-[hsl(var(--av-parchment)/0.5)]">
                      Full name
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 w-full min-h-[48px] rounded-xl border border-[hsl(var(--av-parchment)/0.15)] bg-transparent px-4 font-body text-[hsl(var(--av-parchment))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--av-gold))]"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-email" className="font-body text-xs text-[hsl(var(--av-parchment)/0.5)]">
                      Email
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      disabled
                      value={data.email || ''}
                      className="mt-1.5 w-full min-h-[48px] rounded-xl border border-[hsl(var(--av-parchment)/0.08)] bg-transparent px-4 font-body text-[hsl(var(--av-parchment)/0.4)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-pwd" className="font-body text-xs text-[hsl(var(--av-parchment)/0.5)]">
                      Password (min 8 characters)
                    </label>
                    <input
                      id="reg-pwd"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 w-full min-h-[48px] rounded-xl border border-[hsl(var(--av-parchment)/0.15)] bg-transparent px-4 font-body text-[hsl(var(--av-parchment))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--av-gold))]"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-repwd" className="font-body text-xs text-[hsl(var(--av-parchment)/0.5)]">
                      Confirm password
                    </label>
                    <input
                      id="reg-repwd"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1.5 w-full min-h-[48px] rounded-xl border border-[hsl(var(--av-parchment)/0.15)] bg-transparent px-4 font-body text-[hsl(var(--av-parchment))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--av-gold))]"
                    />
                  </div>

                  <p className="font-body text-xs text-[hsl(var(--av-parchment)/0.4)] leading-relaxed">
                    You create a private account for your sanctuary. Confirmation email and calendar
                    invite send immediately. Cancel or reschedule until 24 hours before — no charge.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting || !bookingTime}
                    className="w-full min-h-[52px] rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] font-body font-medium disabled:opacity-50 transition-opacity hover:opacity-90 shadow-lg shadow-[rgba(201,168,76,0.2)]"
                  >
                    {submitting ? 'Confirming…' : `Confirm Discovery Call with ${therapist.name}`}
                  </button>
                </form>
              </div>
            </PortalContent>
          </motion.div>
        )}

        {subState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-20 text-center space-y-6"
            role="status"
            aria-live="polite"
          >
            <PortalContent maxWidth="max-w-md">
              <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
                Confirmed
              </p>
              <h2 className="font-serif text-3xl text-[hsl(var(--av-parchment))] mt-3 text-balance">
                Your Discovery Call is reserved
              </h2>
              <p className="font-body text-base text-[hsl(var(--av-parchment)/0.6)] leading-relaxed mt-4">
                Confirmation email and calendar invite for your session with {therapist.name} are on their way
                {bookingTime ? ` for ${formatBooking()}` : ''}.
              </p>
              <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.4)] mt-6">
                Opening your confirmation…
              </p>
            </PortalContent>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step8Wrapper(props: StepProps<PortalData>) {
  return (
    <AudioProvider>
      <BackgroundEngine theme={getTheme('booking')}>
        <Step8Booking {...props} />
      </BackgroundEngine>
    </AudioProvider>
  )
}

export default Step8Wrapper
