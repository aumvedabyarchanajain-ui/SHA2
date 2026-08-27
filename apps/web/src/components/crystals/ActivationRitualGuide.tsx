'use client'

import React, { useState } from 'react'
import { Sparkles, Moon, Sun, Wind, Droplets, CheckCircle2, Play, Pause, RotateCcw, Printer, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { ProductView } from '@/lib/product-types'

interface Props {
  product: ProductView
  userProfile?: {
    sunSign?: string | null
    moonSign?: string | null
    risingSign?: string | null
    dominantChakra?: string | null
  }
}

export default function ActivationRitualGuide({ product, userProfile }: Props) {
  const [activeStep, setActiveStep] = useState(1)
  const [mantraCount, setMantraCount] = useState(0)
  const [breathActive, setBreathActive] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale')
  const [breathTimer, setBreathTimer] = useState(4)

  const steps = product.activationRitualJson || {
    cleansing: product.activationRitualText || 'Rest crystal on raw Selenite plate or clean earth for 3 hours.',
    mantra: 'Om Shreem Hreem Kleem Glaum Gam Shrimatye Namah (108 times)',
    somaticImprint: 'Hold against resonant chakra during deep diaphragmatic breathing.',
    muhurta: 'Sunday or Friday sunrise during Shukla Paksha',
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 print:space-y-4 print:text-black">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-stone-950 rounded-3xl p-8 text-white border border-amber-500/30 relative overflow-hidden print:border-none print:bg-none print:text-black print:p-0">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Prana Pratishtha Protocol
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
            Personalized Activation & Cleansing Ritual
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Every crystal from the Aumveda Sanctuary is ethically sourced and energized by Archana Jain on the Jaipur Vedic altar. Complete this 3-step consecration to imprint your unique biofield into the crystal matrix.
          </p>

          {userProfile?.dominantChakra && (
            <div className="pt-2">
              <Badge className="bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wide">
                Customized for your {userProfile.dominantChakra} & {userProfile.sunSign || 'Astrological'} Blueprint
              </Badge>
            </div>
          )}
        </div>

        <div className="absolute right-6 top-6 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl border-slate-700 bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-bold"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save Guide
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-3 gap-4 print:hidden">
        {[
          { num: 1, title: '1. Elemental Cleansing', icon: Droplets },
          { num: 2, title: '2. Prana Mantra', icon: Sun },
          { num: 3, title: '3. Somatic Lock', icon: Wind },
        ].map(step => (
          <button
            key={step.num}
            onClick={() => setActiveStep(step.num)}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
              activeStep === step.num
                ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              activeStep === step.num ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500'
            }`}>
              <step.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">{step.title}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {step.num === 1 ? 'Purify Accumulated Static' : step.num === 2 ? 'Vedic Consecration' : 'Nervous System Integration'}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Step 1: Elemental Cleansing */}
      {(activeStep === 1 || typeof window === 'undefined') && (
        <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Phase 01</span>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">Elemental Purification</h3>
              </div>
              <Badge variant="outline" className="text-slate-600 border-slate-300">
                Duration: 3 Hours
              </Badge>
            </div>

            <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
              <p>{steps.cleansing}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-600" /> Selenite Plate Method
                </p>
                <p className="text-[11px] text-slate-500">Rest crystal directly on Selenite for 3 hours. Selenite draws out dense energetic residue.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" /> Sacred Dhuna / Smoke
                </p>
                <p className="text-[11px] text-slate-500">Pass crystal 7 times through sacred Himalayan Frankincense, Guggul or white sage smoke.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Dawn Solar Infusion
                </p>
                <p className="text-[11px] text-slate-500">Expose to gentle early morning sunlight during the first 30 minutes of sunrise.</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 print:hidden">
              <Button onClick={() => setActiveStep(2)} className="bg-slate-900 hover:bg-black rounded-xl font-bold">
                Proceed to Phase 2: Mantra &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Prana Mantra & Consecration */}
      {(activeStep === 2 || typeof window === 'undefined') && (
        <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Phase 02</span>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">Prana Pratishtha Consecration</h3>
              </div>
              <Badge className="bg-amber-100 text-amber-900 border-amber-200">
                108 Chants
              </Badge>
            </div>

            <div className="bg-amber-50/80 rounded-2xl p-6 border border-amber-200 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-amber-800">Prescribed Vedic Mantra:</p>
              <p className="font-serif text-xl font-bold text-slate-900 italic leading-relaxed">
                &ldquo;{steps.mantra}&rdquo;
              </p>
              <p className="text-xs text-amber-800/80">
                Auspicious Timing (Muhurta): <span className="font-bold">{steps.muhurta}</span>
              </p>
            </div>

            {/* Interactive Chant Counter */}
            <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100 print:hidden">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mantra Japa Counter</p>
                <p className="text-3xl font-black text-slate-900">{mantraCount} <span className="text-sm font-normal text-slate-400">/ 108</span></p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setMantraCount(prev => Math.min(108, prev + 1))}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl px-6"
                >
                  + Chant Count
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMantraCount(0)}
                  className="rounded-xl border-slate-200 text-slate-500"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between pt-4 print:hidden">
              <Button variant="ghost" onClick={() => setActiveStep(1)} className="rounded-xl font-bold text-slate-600">
                &larr; Back
              </Button>
              <Button onClick={() => setActiveStep(3)} className="bg-slate-900 hover:bg-black rounded-xl font-bold">
                Proceed to Phase 3: Somatic Lock &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Somatic Imprinting */}
      {(activeStep === 3 || typeof window === 'undefined') && (
        <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Phase 03</span>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">Somatic Biofield Imprinting</h3>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200">
                Chakra Lock
              </Badge>
            </div>

            <div className="prose text-slate-600 text-sm leading-relaxed space-y-3">
              <p>{steps.somaticImprint}</p>
              <p>
                Hold the energized crystal directly over your <strong className="text-slate-900">{product.chakraAffinity || product.chakraAssociation || 'resonant chakra'}</strong>. Close your eyes, lengthen your spine, and engage in 3 minutes of diaphragmatic coherence breathing.
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Somatic Breath Rhythm</p>
                  <p className="text-sm text-slate-600">4s Inhale &bull; 4s Hold &bull; 4s Exhale &bull; 4s Stillness</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-900 uppercase">Activated</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 print:hidden">
              <Button variant="ghost" onClick={() => setActiveStep(2)} className="rounded-xl font-bold text-slate-600">
                &larr; Back
              </Button>
              <Button onClick={() => setActiveStep(1)} variant="outline" className="rounded-xl font-bold border-amber-300 text-amber-900 hover:bg-amber-50">
                Restart Protocol
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
