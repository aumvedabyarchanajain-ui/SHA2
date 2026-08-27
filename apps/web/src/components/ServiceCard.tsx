"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  shortDesc: string;
  whatItIs: string;
  whoItIsFor: string;
  outcome: string;
  icon: React.ElementType;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  shortDesc,
  whatItIs,
  whoItIsFor,
  outcome,
  icon: Icon,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-400 cursor-pointer group",
        isExpanded
          ? "bg-[hsl(var(--card))] border-[hsl(var(--av-gold)/0.5)] shadow-lg shadow-[hsl(var(--av-ink)/0.06)]"
          : "bg-[hsl(var(--card)/0.8)] border-[hsl(var(--av-stone))] hover:border-[hsl(var(--av-gold)/0.4)] hover:shadow-md hover:bg-[hsl(var(--card))]"
      )}
    >
      {/* Ambient gold glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--av-gold)/0.12),transparent_70%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--av-night))] text-[hsl(var(--av-gold-soft))] flex items-center justify-center shrink-0 border border-[hsl(var(--av-parchment)/0.15)] shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Icon className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-normal text-[hsl(var(--av-night))] tracking-tight">{title}</h3>
              <p className="text-[13px] text-[hsl(var(--av-mute))] font-body mt-0.5 tracking-wide">{shortDesc}</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="w-8 h-8 rounded-full border border-[hsl(var(--av-stone))] flex items-center justify-center text-[hsl(var(--av-mute))] group-hover:text-[hsl(var(--av-night))] group-hover:border-[hsl(var(--av-gold)/0.5)] transition-colors"
          >
            <ChevronDown className="w-4 h-4 stroke-[1.5]" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[hsl(var(--av-stone)/0.8)]">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.24em] text-[hsl(var(--av-mute))]">What it is</h4>
                    <p className="text-[13px] text-[hsl(var(--av-ink-text)/0.85)] leading-relaxed font-body">{whatItIs}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.24em] text-[hsl(var(--av-mute))]">Who it is for</h4>
                    <p className="text-[13px] text-[hsl(var(--av-ink-text)/0.85)] leading-relaxed font-body">{whoItIsFor}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.24em] text-[hsl(var(--av-mute))]">The Outcome</h4>
                    <p className="text-[13px] text-[hsl(var(--av-night))] font-medium leading-relaxed font-body flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(var(--av-sage))] shrink-0 mt-0.5" />
                      {outcome}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[hsl(var(--av-stone)/0.6)] flex justify-end">
                  <Button asChild className="bg-[hsl(var(--av-night))] hover:bg-[hsl(var(--av-ink))] text-[hsl(var(--av-gold-soft))] rounded-full px-6 h-10 font-body text-xs tracking-wider uppercase border border-[hsl(var(--av-gold)/0.3)] shadow-xs transition-transform active:scale-[0.98]">
                    <Link href="/contact" onClick={(e) => e.stopPropagation()}>
                      Consultation Inquiry <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ServiceCard;

