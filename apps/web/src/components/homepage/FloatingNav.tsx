"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useScrollProgress } from "./useScrollProgress";
import { useCart } from "@/lib/cart";
import { useCartDrawer } from "@/components/cart/CartDrawer";

const SECTIONS = [
  { id: "top", label: "01 Hero" },
  { id: "origin", label: "02 Origin" },
  { id: "philosophy", label: "03 Philosophy" },
  { id: "dose", label: "04 Daily Dose" },
  { id: "journey", label: "05 The Journey" },
  { id: "healers", label: "06 Healers" },
  { id: "services", label: "07 Services" },
  { id: "crystals", label: "08 Crystals" },
  { id: "discovery", label: "09 Discovery" },
  { id: "reflections", label: "10 Reflections" },
  { id: "insights", label: "11 Insights" },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  const progress = useScrollProgress((s) => s.progress);
  const { totalItems } = useCart();
  const { openCart } = useCartDrawer();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none"
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-[hsl(var(--av-gold))] via-[hsl(var(--av-copper-soft))] to-[hsl(var(--av-gold-soft))] shadow-[0_0_8px_hsl(var(--av-gold)/0.6)]"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {/* Main Luxury Header */}
      <header
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-500 ${
          scrolled
            ? "bg-[hsl(var(--av-ink)/0.82)] backdrop-blur-lg border-b border-[hsl(var(--av-parchment)/0.08)] py-3.5 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <Link
          href="#top"
          className="flex items-center gap-3 text-[hsl(var(--av-parchment))] group"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--av-gold)/0.4)] bg-[hsl(var(--av-night)/0.6)] text-[13px] font-serif text-[hsl(var(--av-gold))] transition-all group-hover:border-[hsl(var(--av-gold))] group-hover:shadow-[0_0_12px_rgba(201,168,76,0.3)]">
            ॐ
          </span>
          <span className="font-serif text-lg md:text-xl tracking-[0.14em] text-[hsl(var(--av-parchment))] font-light">
            AUMVEDA
          </span>
        </Link>

        {/* Center Navigation Links for Desktop */}
        <nav className="hidden lg:flex items-center gap-7 text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-parchment)/0.65)]">
          <Link href="#origin" className="transition-colors hover:text-[hsl(var(--av-gold-soft))]">
            Origin
          </Link>
          <Link href="#philosophy" className="transition-colors hover:text-[hsl(var(--av-gold-soft))]">
            Philosophy
          </Link>
          <Link href="#dose" className="transition-colors hover:text-[hsl(var(--av-gold-soft))]">
            Daily Dose
          </Link>
          <Link href="#journey" className="transition-colors hover:text-[hsl(var(--av-gold-soft))]">
            Journey
          </Link>
          <Link href="#healers" className="transition-colors hover:text-[hsl(var(--av-gold-soft))]">
            Healers
          </Link>
          <Link href="#services" className="transition-colors hover:text-[hsl(var(--av-gold-soft))]">
            Services
          </Link>
          <Link href="#crystals" className="transition-colors hover:text-[hsl(var(--av-gold-soft))]">
            Shop
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Cart Trigger */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open Sacred Cart, ${totalItems} items`}
            className="relative p-2 rounded-full text-[hsl(var(--av-parchment))] hover:text-[hsl(var(--av-gold-soft))] hover:bg-white/10 transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] text-[10px] font-mono font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            href="/auth/login?portal=client"
            className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--av-parchment)/0.6)] transition-colors hover:text-[hsl(var(--av-parchment))]"
          >
            Sign In
          </Link>
          <Link
            href="/step-1"
            className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--av-gold)/0.5)] bg-[hsl(var(--av-gold)/0.12)] px-4 py-2 text-[10px] uppercase tracking-[0.26em] text-[hsl(var(--av-gold-soft))] backdrop-blur-sm transition-all duration-300 hover:border-[hsl(var(--av-gold))] hover:bg-[hsl(var(--av-gold))] hover:text-[hsl(var(--av-ink))] shadow-sm"
          >
            <span>Begin</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </header>
    </>
  );
}

/** Interactive Vertical Section Milestone Rail */
export function SectionRail() {
  const progress = useScrollProgress((s) => s.progress);
  const activeIndex = Math.min(
    SECTIONS.length - 1,
    Math.floor(progress * SECTIONS.length)
  );

  return (
    <div className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex select-none">
      {SECTIONS.map((sec, i) => (
        <a
          key={sec.id}
          href={`#${sec.id}`}
          aria-label={sec.label}
          className="group relative flex items-center justify-end py-1"
        >
          {/* Hover / Active Label tooltip */}
          <span
            className={`mr-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 ${
              i === activeIndex
                ? "text-[hsl(var(--av-gold))] font-medium opacity-80 translate-x-0"
                : "text-[hsl(var(--av-parchment)/0.6)]"
            }`}
          >
            {sec.label}
          </span>
          {/* Milestone Indicator */}
          <span
            className={`block rounded-full transition-all duration-500 ${
              i === activeIndex
                ? "h-2 w-2 bg-[hsl(var(--av-gold))] shadow-[0_0_8px_hsl(var(--av-gold))]"
                : "h-1.5 w-1.5 bg-[hsl(var(--av-parchment)/0.25)] group-hover:bg-[hsl(var(--av-parchment)/0.6)] group-hover:scale-125"
            }`}
          />
        </a>
      ))}
    </div>
  );
}
