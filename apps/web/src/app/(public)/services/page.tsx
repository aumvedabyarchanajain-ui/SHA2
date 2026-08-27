"use client";

import React, { useState, useEffect } from 'react';
import ServiceCard from "@/components/ServiceCard";
import {
  BrainCircuit,
  Sparkles,
  Music,
  Wind,
  Moon,
  Home,
  Gem,
  Layers,
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useCartDrawer } from "@/components/cart/CartDrawer";
import { showSuccess } from "@/utils/toast";

const SEJAL_SERVICES = [
  {
    title: "CBT (Reframing System)",
    shortDesc: "Cognitive Behavioral Re-architecture",
    whatItIs: "A structured approach to identifying and restructuring the mental frameworks that dictate your emotional reality.",
    whoItIsFor: "Individuals trapped in negative thought loops, chronic anxiety, or self-limiting belief systems.",
    outcome: "Cognitive clarity, emotional resilience, and a systematic shift in behavioral patterns.",
    icon: BrainCircuit,
  },
  {
    title: "Hypnosis & Subconscious Rewiring",
    shortDesc: "Subconscious Rewiring",
    whatItIs: "Deep-state trance work designed to bypass the critical conscious mind and plant seeds of transformation directly into the subconscious.",
    whoItIsFor: "Those struggling with deep-seated habits, phobias, or trauma that conscious effort hasn't resolved.",
    outcome: "Rapid subconscious alignment and the dissolution of long-standing internal blockages.",
    icon: Moon,
  },
  {
    title: "Sound Therapy & Solfeggio",
    shortDesc: "Frequency Regulation",
    whatItIs: "The use of Solfeggio frequencies and binaural beats to entrain the brain into states of deep healing and coherence.",
    whoItIsFor: "High-stress professionals and individuals seeking a non-verbal path to nervous system regulation.",
    outcome: "Profound nervous system harmony and a measurable reduction in cortisol levels.",
    icon: Music,
  },
  {
    title: "Somatic Breathwork & Trauma Release",
    shortDesc: "Nervous System Reset",
    whatItIs: "Active meditation through controlled breathing patterns to release stored somatic tension and oxygenate the cellular body.",
    whoItIsFor: "Anyone experiencing burnout, emotional stagnation, or a disconnected mind-body state.",
    outcome: "Immediate physiological calm and a renewed sense of vital energy flow.",
    icon: Wind,
  }
];

const ARCHANA_SERVICES = [
  {
    title: "Vedic Astrology Deep-Dive",
    shortDesc: "Vedic + Western Synthesis",
    whatItIs: "A comprehensive mapping of your soul's blueprint using both ancient Jyotish and modern Western astrological techniques.",
    whoItIsFor: "Seekers looking for life purpose, timing for major decisions, and understanding karmic patterns.",
    outcome: "A clear cosmic roadmap and a profound sense of alignment with universal timing.",
    icon: Sparkles,
  },
  {
    title: "Tarot & Intuitive Guidance",
    shortDesc: "Intuitive Guidance",
    whatItIs: "Archetypal divination to tap into the collective unconscious and provide immediate answers to pressing life questions.",
    whoItIsFor: "Individuals at a crossroads needing immediate clarity or a fresh perspective on a specific situation.",
    outcome: "Actionable intuitive direction and the peace that comes from spiritual confirmation.",
    icon: Layers,
  },
  {
    title: "Vastu Shastra Consultation",
    shortDesc: "Residential + Commercial",
    whatItIs: "The ancient science of architecture and spatial geometry to align your physical environment with natural laws.",
    whoItIsFor: "Homeowners and business owners seeking to remove energetic obstacles to prosperity and peace.",
    outcome: "A harmonized living or working environment that actively supports your growth and success.",
    icon: Home,
  },
  {
    title: "Crystallomancy & Energetic Alignment",
    shortDesc: "Vibrational Alignment",
    whatItIs: "The strategic use of mineral vibrations to amplify intentions and clear stagnant energy from the bio-field.",
    whoItIsFor: "Those seeking energetic protection, amplified manifestation, or a deeper connection to Earth's frequencies.",
    outcome: "An amplified energetic state and a cleared, protected personal sanctuary.",
    icon: Gem,
  }
];

const SIGNATURE_PACKAGES = [
  {
    id: "pkg-1",
    title: "1:1 Somatic & Nervous System Session",
    practitioner: "Sejal Jain",
    duration: "60 Minutes",
    price: 4500,
    priceCents: 450000,
    desc: "Polyvagal regulation, trauma release, breathwork prescription, and custom somatic audio memo.",
    tag: "Clinical Focus",
  },
  {
    id: "pkg-2",
    title: "1:1 Vedic Astrology & Karmic Blueprint",
    practitioner: "Archana Jain",
    duration: "60 Minutes",
    price: 4500,
    priceCents: 450000,
    desc: "Complete natal chart synthesis, Mahadasha timing, gemstone remedies, and Vastu directional alignment.",
    tag: "Sacred Lineage",
  },
  {
    id: "pkg-3",
    title: "The Dual Synergy Session",
    practitioner: "Archana & Sejal Jain",
    duration: "90 Minutes",
    price: 8500,
    priceCents: 850000,
    desc: "Mother-daughter co-facilitated session bridging cosmic astrology timing with nervous system somatic anchoring.",
    tag: "Master Sanctuary",
  }
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<typeof SIGNATURE_PACKAGES[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 24 * 3600_000).toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { addItem } = useCart();
  const { openCart } = useCartDrawer();

  useEffect(() => {
    if (!selectedService) return;
    setLoadingSlots(true);
    fetch(`/api/services/slots?practitioner=${encodeURIComponent(selectedService.practitioner)}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots || []);
        if (data.slots && data.slots.length > 0) {
          setSelectedSlot(data.slots[0]);
        } else {
          setSelectedSlot(null);
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, selectedDate]);

  const handleBookSession = () => {
    if (!selectedService) return;

    addItem({
      productId: `srv_${selectedService.id}` as any,
      slug: selectedService.id,
      title: `${selectedService.title} (${selectedService.practitioner})`,
      priceCents: selectedService.priceCents,
      compareAtPriceCents: null,
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
      inventoryCount: 10,
      productType: 'service',
      bundle: null,
    });

    showSuccess(`Session with ${selectedService.practitioner} added to cart!`);
    setSelectedService(null);
    openCart();
  };

  return (
    <div className="min-h-screen bg-parchment texture-paper pt-32 pb-24 text-ink-text">
      {/* Booking Slot Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[hsl(var(--av-ink)/0.8)] backdrop-blur-md">
          <div className="w-full max-w-xl bg-parchment rounded-2xl overflow-hidden shadow-2xl border border-[hsl(var(--av-gold)/0.3)] space-y-6">
            <div className="p-6 bg-night text-parchment flex items-center justify-between border-b border-[hsl(var(--av-parchment)/0.1)]">
              <div className="space-y-1.5">
                <Badge className="bg-[hsl(var(--av-gold)/0.15)] text-gold-soft border-[hsl(var(--av-gold)/0.3)] text-[10px] uppercase font-body tracking-[0.2em]">
                  Sanctuary Calendar Synced
                </Badge>
                <h3 className="font-serif text-xl font-normal text-parchment">{selectedService.title}</h3>
                <p className="text-xs text-[hsl(var(--av-parchment)/0.6)] font-body">Practitioner: {selectedService.practitioner} &bull; {selectedService.duration}</p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-[hsl(var(--av-parchment)/0.6)] hover:text-parchment p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-mute uppercase tracking-[0.24em] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold" /> Select Consultation Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-stone bg-card text-ink-text text-sm font-body focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {/* Slots List */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-mute uppercase tracking-[0.24em] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold" /> Available Time Slots (Asia/Kolkata IST):
                </label>

                {loadingSlots ? (
                  <div className="py-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-gold animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-4 bg-card rounded-xl border border-stone text-center text-xs text-mute font-body">
                    No slots available on this date. Please pick another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {slots.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(s)}
                        className={`p-3 rounded-xl text-xs font-body font-medium text-left border transition-all flex items-center justify-between ${
                          selectedSlot?.startTime === s.startTime
                            ? 'bg-night text-gold-soft border-night shadow-xs'
                            : 'bg-card border-stone text-ink-text hover:border-[hsl(var(--av-gold)/0.4)]'
                        }`}
                      >
                        <span>{s.formattedTime}</span>
                        {selectedSlot?.startTime === s.startTime && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary and Confirmation Button */}
              <div className="pt-4 border-t border-stone flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-mute">Consultation Fee</p>
                  <p className="font-mono text-xl font-bold text-night tabular-nums">₹{selectedService.price.toLocaleString('en-IN')}</p>
                </div>

                <Button
                  onClick={handleBookSession}
                  disabled={!selectedSlot}
                  className="bg-gold hover:bg-gold-soft text-ink font-body text-xs font-medium uppercase tracking-[0.14em] rounded-full h-11 px-6 shadow-sm hover:shadow-[0_4px_14px_rgba(201,168,76,0.35)] transition-all active:scale-[0.98]"
                >
                  <CalendarCheck className="w-4 h-4 mr-2" /> Confirm & Add to Sanctuary
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1120px] mx-auto px-6 space-y-20">
        {/* Header */}
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-night text-gold-soft text-[11px] font-body uppercase tracking-[0.24em] border border-[hsl(var(--av-gold)/0.3)]">
            <HeartHandshake className="w-3.5 h-3.5 text-gold" /> 1:1 Clinical Healing Sanctuary
          </div>
          <h1 className="av-display text-night">
            Sacred Neuro-Vedic <br />
            <span className="italic text-gold">1:1 Consultations</span>
          </h1>
          <p className="av-lede text-mute max-w-[65ch]">
            Direct 1:1 sessions with Archana Jain (Vedic Astrologer & Vastu Master, Jaipur) and Sejal Jain (Somatic Healing Facilitator & Coach, Mumbai). Every session includes an automated pre-session diagnostic brief and calendar synchronization.
          </p>
        </div>

        {/* Signature Consultation Tiers */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-stone pb-4">
            <h2 className="av-title text-night text-2xl md:text-3xl">1:1 Signature Consultation Tracks</h2>
            <span className="text-xs font-body tracking-wider text-mute uppercase">
              Instant Google Meet & Calendar Sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {SIGNATURE_PACKAGES.map(pkg => (
              <div
                key={pkg.id}
                className="av-card-luxury rounded-2xl p-8 flex flex-col justify-between relative group overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-body font-medium uppercase tracking-[0.24em] text-gold bg-night px-2.5 py-1 rounded-full border border-[hsl(var(--av-gold)/0.3)]">
                      {pkg.tag}
                    </span>
                    <span className="text-xs font-body text-mute flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 stroke-[1.5]" /> {pkg.duration}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-normal text-night leading-snug">
                    {pkg.title}
                  </h3>

                  <p className="text-xs font-body uppercase tracking-[0.2em] text-gold">
                    Facilitator: {pkg.practitioner}
                  </p>

                  <p className="text-[13px] text-mute font-body leading-relaxed">
                    {pkg.desc}
                  </p>
                </div>

                <div className="pt-8 border-t border-stone space-y-4 mt-6">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-2xl font-bold text-night tabular-nums">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-body text-sage font-medium">
                      Includes diagnostic brief
                    </span>
                  </div>

                  <Button
                    onClick={() => setSelectedService(pkg)}
                    className="w-full h-11 rounded-full bg-night hover:bg-ink text-gold-soft font-body text-xs tracking-wider uppercase border border-[hsl(var(--av-gold)/0.3)] shadow-xs transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Select Date & Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sejal's Modalities */}
        <div className="space-y-8">
          <div className="border-b border-stone pb-4">
            <span className="av-eyebrow-ink text-gold">Somatic Science</span>
            <h2 className="av-title text-night text-2xl md:text-3xl mt-1">Sejal Jain — Nervous System & Somatic Modalities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SEJAL_SERVICES.map((srv, idx) => (
              <ServiceCard
                key={idx}
                title={srv.title}
                shortDesc={srv.shortDesc}
                whatItIs={srv.whatItIs}
                whoItIsFor={srv.whoItIsFor}
                outcome={srv.outcome}
                icon={srv.icon}
              />
            ))}
          </div>
        </div>

        {/* Archana's Modalities */}
        <div className="space-y-8">
          <div className="border-b border-stone pb-4">
            <span className="av-eyebrow-ink text-gold">Vedic Lineage</span>
            <h2 className="av-title text-night text-2xl md:text-3xl mt-1">Archana Jain — Jyotish & Vastu Modalities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ARCHANA_SERVICES.map((srv, idx) => (
              <ServiceCard
                key={idx}
                title={srv.title}
                shortDesc={srv.shortDesc}
                whatItIs={srv.whatItIs}
                whoItIsFor={srv.whoItIsFor}
                outcome={srv.outcome}
                icon={srv.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

