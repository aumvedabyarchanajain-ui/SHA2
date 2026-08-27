'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StepRegistry } from '../../engine/StepRegistry'
import { BackgroundEngine } from '../../background/BackgroundEngine'
import { AudioProvider } from '../../audio'
import { getTheme } from '../../theme/themes'
import { PortalContent, PortalCard, PortalContinueButton } from '../../design-system'
import { staggerContainer, staggerItem } from '../../animation/variants'
import type { StepProps, PortalData } from '../../engine/types'
import { usePlacesAutocomplete, resolveCityCoordinates } from './usePlacesAutocomplete'

export function registerStep6() {
  StepRegistry.register({
    id: 6,
    title: 'Constellation Mirror',
    component: Step6Wrapper,
    validationSchema: undefined,
    enterAnimation: { type: 'fade', duration: 0.5 },
    exitAnimation: { type: 'fade', duration: 0.3 },
  })
}

type Phase = 'form' | 'loading' | 'error' | 'email_gate' | 'revealing' | 'revealed'

interface ChartPlanet {
  name: string
  sign: string
  signDegree: number
  nakshatra: string
  pada: number
  house: number
}

interface DashaPeriod {
  mahadasha: string
  antardasha: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

function Step6Constellation({ data, onNext, onDataChange }: StepProps<PortalData>) {
  const [dob, setDob] = useState(data.dob ?? '')
  const [tob, setTob] = useState(data.timeOfBirth ?? '')
  const [tobUnknown, setTobUnknown] = useState(!data.timeOfBirth)
  const [place, setPlace] = useState(data.placeOfBirth ?? '')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    data.birthLat && data.birthLng ? { lat: data.birthLat, lng: data.birthLng } : null,
  )
  const [email, setEmail] = useState(data.email ?? '')
  const [phase, setPhase] = useState<Phase>(data.sunSign ? 'email_gate' : 'form')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [chartPlanets, setChartPlanets] = useState<ChartPlanet[]>([])
  const [dashaTimeline, setDashaTimeline] = useState<DashaPeriod[]>([])
  const [nakshatraInfo, setNakshatraInfo] = useState<{ nakshatra: string; lord: string; pada: number } | null>(null)

  const placeInputRef = useRef<HTMLInputElement>(null)

  const { available: placesAvailable } = usePlacesAutocomplete(placeInputRef, (result) => {
    setPlace(result.description)
    setCoords({ lat: result.lat, lng: result.lng })
  })

  const canSubmit = Boolean(dob && place && (tobUnknown || tob))

  const requestChart = useCallback(async () => {
    setPhase('loading')
    setErrorMsg(null)

    const resolvedCoords = coords ?? resolveCityCoordinates(place)

    try {
      const res = await fetch('/api/astrology/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob,
          timeOfBirth: tobUnknown ? null : tob,
          lat: resolvedCoords.lat,
          lng: resolvedCoords.lng,
        }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Chart calculation failed')

      if (json.data.planets) setChartPlanets(json.data.planets)
      if (json.data.dashaTimeline) setDashaTimeline(json.data.dashaTimeline)
      if (json.data.nakshatra) {
        setNakshatraInfo({
          nakshatra: json.data.nakshatra,
          lord: json.data.nakshatraLord ?? '',
          pada: json.data.nakshatraPada ?? 1,
        })
      }

      onDataChange({
        dob,
        timeOfBirth: tobUnknown ? null : tob,
        placeOfBirth: place,
        birthLat: resolvedCoords.lat,
        birthLng: resolvedCoords.lng,
        sunSign: json.data.sunSign,
        moonSign: json.data.moonSign,
        risingSign: json.data.risingSign,
      })
      setPhase('email_gate')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setPhase('error')
    }
  }, [dob, tob, tobUnknown, place, coords, onDataChange])

  const handleEmailSubmit = useCallback(() => {
    if (!email || !email.includes('@')) return
    onDataChange({ email })
    setPhase('revealing')
    setTimeout(() => setPhase('revealed'), 1200)
  }, [email, onDataChange])

  const currentDasha = dashaTimeline.find((d) => d.isCurrent) ?? dashaTimeline[0]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
      <PortalContent maxWidth="max-w-2xl">
        <AnimatePresence mode="wait">
          {(phase === 'form' || phase === 'loading' || phase === 'error') && (
            <motion.div
              key="form"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6 text-center"
            >
              <motion.p
                variants={staggerItem}
                className="text-xs text-white/40 uppercase tracking-[0.3em] font-mono"
              >
                Step 6 of 8
              </motion.p>
              <motion.h1 variants={staggerItem} className="text-2xl md:text-3xl font-display text-white">
                Your birth chart holds your karmic blueprint.
              </motion.h1>
              <motion.p variants={staggerItem} className="text-sm text-white/40 max-w-md mx-auto">
                Planetary placements, Moon sign, and Dasha timeline reveal your energetic constitution.
              </motion.p>

              <PortalCard variant="glass" padding="lg">
                <motion.div variants={staggerContainer} className="space-y-4 text-left">
                  <motion.div variants={staggerItem}>
                    <label
                      className="text-xs uppercase tracking-widest text-white/40"
                      htmlFor="dob-input"
                    >
                      Date of Birth
                    </label>
                    <input
                      id="dob-input"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white focus:border-[#C9A84C]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
                    />
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <label
                      className="text-xs uppercase tracking-widest text-white/40"
                      htmlFor="place-input"
                    >
                      Place of Birth{' '}
                      {placesAvailable ? (
                        <span className="text-[#C9A84C]/60 normal-case">(Google Places live)</span>
                      ) : (
                        <span className="text-white/20 normal-case">(auto-coordinates)</span>
                      )}
                    </label>
                    <input
                      ref={placeInputRef}
                      id="place-input"
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="e.g. Mumbai, India or London, UK"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white placeholder:text-white/20 focus:border-[#C9A84C]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
                    />
                  </motion.div>

                  <motion.div variants={staggerItem} className="flex items-start gap-3">
                    <div className="flex-1">
                      <label
                        className="text-xs uppercase tracking-widest text-white/40"
                        htmlFor="tob-input"
                      >
                        Time of Birth
                      </label>
                      <input
                        id="tob-input"
                        type="time"
                        value={tob}
                        onChange={(e) => setTob(e.target.value)}
                        disabled={tobUnknown}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white focus:border-[#C9A84C]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 disabled:opacity-30"
                      />
                    </div>
                    <label className="mt-6 flex cursor-pointer items-center gap-2 text-xs text-white/40">
                      <input
                        type="checkbox"
                        checked={tobUnknown}
                        onChange={(e) => setTobUnknown(e.target.checked)}
                        className="accent-[#C9A84C]"
                      />
                      I don&apos;t know exact time
                    </label>
                  </motion.div>
                </motion.div>
              </PortalCard>

              {phase === 'error' && (
                <motion.div
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200"
                >
                  {errorMsg}
                </motion.div>
              )}

              <motion.div variants={staggerItem} className="flex flex-col items-center gap-3 pt-2">
                <PortalContinueButton
                  onClick={requestChart}
                  disabled={!canSubmit || phase === 'loading'}
                  label={
                    phase === 'loading'
                      ? 'Computing Ephemeris & Dasha...'
                      : phase === 'error'
                        ? 'Retry Calculation'
                        : 'Calculate Birth Chart'
                  }
                />
                <button
                  type="button"
                  onClick={onNext}
                  className="mt-1 text-xs uppercase tracking-widest text-white/40 hover:text-[#C9A84C] underline underline-offset-4 transition-colors"
                >
                  Skip this step &amp; continue →
                </button>
              </motion.div>
            </motion.div>
          )}

          {phase === 'email_gate' && (
            <motion.div
              key="email-gate"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6 text-center"
            >
              <motion.div
                variants={staggerItem}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C]/20 text-2xl"
              >
                ✨
              </motion.div>
              <motion.h2 variants={staggerItem} className="text-2xl font-display text-[#F0D58C]">
                Your Vedic Chart &amp; Dasha Timeline Are Ready
              </motion.h2>
              <motion.p variants={staggerItem} className="text-sm text-white/50 max-w-sm mx-auto">
                Enter your email to unlock your planetary placements, Moon sign, and healing cycle.
              </motion.p>
              <PortalCard variant="glass" padding="lg">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-white placeholder:text-white/20 focus:border-[#C9A84C]/60 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
                />
              </PortalCard>
              <div className="flex flex-col items-center gap-3">
                <PortalContinueButton
                  onClick={handleEmailSubmit}
                  disabled={!email.includes('@')}
                  label="Reveal My Cosmic Blueprint"
                />
                <button
                  type="button"
                  onClick={onNext}
                  className="mt-1 text-xs uppercase tracking-widest text-white/40 hover:text-[#C9A84C] underline underline-offset-4 transition-colors"
                >
                  Skip for now →
                </button>
              </div>
            </motion.div>
          )}

          {(phase === 'revealing' || phase === 'revealed') && (
            <motion.div
              key="reveal"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6 text-center"
            >
              <div className="relative mb-2 h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#050510] via-[#0D0B24] to-[#050510] border border-white/10 p-6 flex flex-col justify-center items-center">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'radial-gradient(1px 1px at 25px 35px, #C9A84C, transparent), radial-gradient(1px 1px at 80px 60px, white, transparent), radial-gradient(1.5px 1.5px at 150px 40px, #F0D58C, transparent), radial-gradient(1px 1px at 220px 90px, white, transparent)',
                  }}
                />
                <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C] font-mono mb-1">
                  Vedic Ephemeris Mirror
                </p>
                <p className="text-xl font-serif text-white">Your Cosmic Architecture</p>
                <p className="text-xs italic text-white/40 mt-1">
                  Computed at {place || 'Birth Coordinates'}
                </p>
              </div>

              {phase === 'revealed' && (
                <>
                  {/* Primary Triad */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                    <PortalCard variant="glass" padding="sm" className="border-amber-500/30">
                      <p className="text-xs font-mono uppercase tracking-wider text-amber-400">☀ Sun (Surya)</p>
                      <p className="text-lg font-bold text-white mt-1">{data.sunSign}</p>
                      <p className="text-[11px] text-white/40">Core vital life force</p>
                    </PortalCard>

                    <PortalCard variant="glass" padding="sm" className="border-sky-400/30">
                      <p className="text-xs font-mono uppercase tracking-wider text-sky-300">☽ Moon (Chandra)</p>
                      <p className="text-lg font-bold text-white mt-1">{data.moonSign}</p>
                      <p className="text-[11px] text-white/40">
                        {nakshatraInfo ? `${nakshatraInfo.nakshatra} (Pada ${nakshatraInfo.pada})` : 'Emotional nervous system'}
                      </p>
                    </PortalCard>

                    <PortalCard variant="glass" padding="sm" className="border-purple-400/30">
                      <p className="text-xs font-mono uppercase tracking-wider text-purple-300">↑ Ascendant (Lagna)</p>
                      <p className="text-lg font-bold text-white mt-1">{data.risingSign || 'Determined in 1:1'}</p>
                      <p className="text-[11px] text-white/40">Physical body &amp; somatic path</p>
                    </PortalCard>
                  </div>

                  {/* Active Dasha Highlight */}
                  {currentDasha && (
                    <PortalCard variant="glass" padding="md" className="text-left border-[#C9A84C]/30 bg-[#C9A84C]/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-[#C9A84C]">
                            Active Vimshottari Dasha
                          </p>
                          <p className="text-base font-serif font-bold text-white mt-0.5">
                            {currentDasha.mahadasha} Mahadasha — {currentDasha.antardasha} Antardasha
                          </p>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#C9A84C]/20 text-[#F0D58C]">
                          Current Cycle
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-2">
                        Window: {currentDasha.startDate} to {currentDasha.endDate}
                      </p>
                    </PortalCard>
                  )}

                  {/* Planetary Placements Summary */}
                  {chartPlanets.length > 0 && (
                    <div className="space-y-2 text-left">
                      <p className="text-xs font-mono uppercase tracking-wider text-white/40">
                        Planetary Placements (Grahas)
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 text-xs">
                        {chartPlanets.slice(0, 6).map((p) => (
                          <div key={p.name} className="p-2 rounded-lg bg-white/[0.04] border border-white/5">
                            <span className="font-semibold text-white/90">{p.name}</span> in{' '}
                            <span className="text-[#F0D58C]">{p.sign}</span>
                            <div className="text-[10px] text-white/40">House {p.house} · {p.nakshatra}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <PortalContinueButton onClick={onNext} label="Proceed to Mind &amp; Pattern Test →" />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </PortalContent>
    </div>
  )
}

function Step6Wrapper(props: StepProps<PortalData>) {
  return (
    <AudioProvider>
      <BackgroundEngine theme={getTheme('constellation')}>
        <Step6Constellation {...props} />
      </BackgroundEngine>
    </AudioProvider>
  )
}

export default Step6Wrapper
