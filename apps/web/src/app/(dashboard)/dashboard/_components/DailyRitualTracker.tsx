import Link from 'next/link'
import { CheckCircle2, Circle, ArrowRight, Sun, Headphones, PenLine } from 'lucide-react'

interface DailyRitualTrackerProps {
  checkInDone: boolean
  doseDone?: boolean
  journalDone: boolean
  doseMins?: number
}

export default function DailyRitualTracker({
  checkInDone,
  doseDone = false,
  journalDone,
  doseMins = 10,
}: DailyRitualTrackerProps) {
  const steps = [
    {
      id: 'check-in',
      title: 'Morning Grounding',
      subtitle: 'Attune nervous system',
      href: '/dashboard/check-in',
      isCompleted: checkInDone,
      icon: Sun,
      actionText: checkInDone ? 'Attuned' : 'Begin (2 min)',
    },
    {
      id: 'dose',
      title: "Today's Sacred Dose",
      subtitle: 'Somatic breath & sound',
      href: '/dashboard/dose',
      isCompleted: doseDone,
      icon: Headphones,
      actionText: doseDone ? 'Completed' : `Listen (${doseMins} min)`,
    },
    {
      id: 'journal',
      title: 'Evening Reflection',
      subtitle: 'Integrate the day',
      href: journalDone ? '/dashboard/journal' : '/dashboard/journal/new',
      isCompleted: journalDone,
      icon: PenLine,
      actionText: journalDone ? 'Recorded' : 'Write entry',
    },
  ]

  const completedCount = [checkInDone, doseDone, journalDone].filter(Boolean).length

  return (
    <section className="space-y-4 rounded-3xl border border-[hsl(var(--av-stone))] bg-white/60 p-6 md:p-8 backdrop-blur-xs shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[hsl(var(--av-stone)/0.6)] pb-4">
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-gold))]">
            Daily Sanctuary Ritual
          </p>
          <h2 className="font-serif text-xl text-[hsl(var(--av-night))] mt-0.5">
            Your 3-Step Integration Today
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[hsl(var(--av-parchment))] text-[hsl(var(--av-night))] border border-[hsl(var(--av-stone))]">
            {completedCount} / 3 Completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Link
              key={step.id}
              href={step.href}
              className={`group flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 ${
                step.isCompleted
                  ? 'border-[hsl(var(--av-sage)/0.3)] bg-[hsl(var(--av-sage)/0.06)]'
                  : 'border-[hsl(var(--av-stone))] bg-[hsl(var(--av-parchment)/0.5)] hover:border-[hsl(var(--av-gold))] hover:bg-[hsl(var(--av-parchment))]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      step.isCompleted
                        ? 'bg-[hsl(var(--av-sage))] text-white'
                        : 'bg-[hsl(var(--av-night)/0.06)] text-[hsl(var(--av-night))] group-hover:bg-[hsl(var(--av-gold)/0.2)] group-hover:text-[hsl(var(--av-gold))]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {step.isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-body font-medium text-[hsl(var(--av-sage))]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Done
                    </span>
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[hsl(var(--av-mute)/0.4)]" />
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-base text-[hsl(var(--av-night))] group-hover:text-[hsl(var(--av-gold))] transition-colors">
                    {step.title}
                  </h3>
                  <p className="font-body text-xs text-[hsl(var(--av-mute))] mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[hsl(var(--av-stone)/0.4)] flex items-center justify-between text-xs font-body text-[hsl(var(--av-night))] font-medium">
                <span>{step.actionText}</span>
                <ArrowRight className="w-3 h-3 text-[hsl(var(--av-gold))] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
