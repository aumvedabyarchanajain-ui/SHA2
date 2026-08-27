"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useCartDrawer } from "@/components/cart/CartDrawer";

/** Quiet hospitality nav — few links, one accent action → portal /step-1. */
const NAV = [
  { label: "About", path: "/about" },
  { label: "Academy", path: "/courses" },
  { label: "Services", path: "/services" },
  { label: "Shop", path: "/shop" },
  { label: "Programmes", path: "/programs" },
  { label: "Insights", path: "/insights" },
  { label: "Contact", path: "/contact" },
];

const PublicNavigation = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { totalItems } = useCart();
  const { openCart } = useCartDrawer();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Home is night-ink marketing — keep light type until scrolled. */
  const overDark = isHome && !scrolled;
  const ink = overDark ? "text-[hsl(var(--av-parchment))]" : "text-[hsl(var(--av-night))]";
  const mute = overDark
    ? "text-[hsl(var(--av-parchment)/0.7)] hover:text-[hsl(var(--av-gold-soft))]"
    : "text-[hsl(var(--av-mute))] hover:text-[hsl(var(--av-night))]";
  const homeScrolledInk = isHome && scrolled;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out",
        scrolled
          ? isHome
            ? "bg-[hsl(var(--av-ink)/0.88)] backdrop-blur-xl border-b border-[hsl(var(--av-parchment)/0.08)] shadow-lg shadow-[hsl(var(--av-ink)/0.4)]"
            : "bg-[hsl(var(--av-parchment)/0.94)] backdrop-blur-xl border-b border-[hsl(var(--av-stone))] shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1120px] mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <Link
          href="/"
          className={cn("group flex items-center gap-3 transition-opacity hover:opacity-85", homeScrolledInk ? "text-[hsl(var(--av-parchment))]" : ink)}
          aria-label="AUMVEDA home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            className="object-contain w-8 h-8 md:w-9 md:h-9 transition-transform duration-500 group-hover:scale-105"
          />
          <span className="font-serif text-lg md:text-xl tracking-tight font-medium">AUMVEDA</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative font-body text-[13px] tracking-[0.06em] py-1 transition-colors duration-200",
                  homeScrolledInk
                    ? isActive
                      ? "text-[hsl(var(--av-parchment))] font-medium"
                      : "text-[hsl(var(--av-parchment)/0.65)] hover:text-[hsl(var(--av-gold-soft))]"
                    : isActive
                      ? "text-[hsl(var(--av-night))] font-medium"
                      : mute
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(var(--av-gold))]" />
                )}
              </Link>
            );
          })}

          {/* Interconnected Portal Links */}
          <div className="flex items-center gap-3 pl-3 border-l border-[hsl(var(--av-stone)/0.5)]">
            <Link
              href="/auth/login?portal=client"
              className={cn(
                "font-body text-[12px] tracking-[0.04em] transition-colors duration-200",
                homeScrolledInk
                  ? "text-[hsl(var(--av-parchment)/0.75)] hover:text-[hsl(var(--av-gold-soft))]"
                  : "text-[hsl(var(--av-mute))] hover:text-[hsl(var(--av-night))]"
              )}
            >
              Client Login
            </Link>
            <span className={cn("text-xs opacity-30", homeScrolledInk ? "text-[hsl(var(--av-parchment))]" : "text-[hsl(var(--av-mute))]")}>·</span>
            <Link
              href="/auth/login?portal=coach"
              className={cn(
                "font-body text-[12px] tracking-[0.04em] transition-colors duration-200",
                homeScrolledInk
                  ? "text-[hsl(var(--av-parchment)/0.75)] hover:text-[hsl(var(--av-gold-soft))]"
                  : "text-[hsl(var(--av-mute))] hover:text-[hsl(var(--av-night))]"
              )}
            >
              Coach Login
            </Link>
          </div>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open Sacred Cart, ${totalItems} items`}
            className={cn(
              "relative p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center",
              homeScrolledInk
                ? "text-[hsl(var(--av-parchment))] hover:text-[hsl(var(--av-gold-soft))] hover:bg-white/10"
                : overDark
                  ? "text-[hsl(var(--av-parchment))] hover:text-[hsl(var(--av-gold-soft))] hover:bg-white/10"
                  : "text-[hsl(var(--av-night))] hover:text-[hsl(var(--av-gold))] hover:bg-[hsl(var(--av-stone)/0.5)]"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] text-[10px] font-mono font-bold flex items-center justify-center shadow-xs animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            href="/step-1"
            className={cn(
              "inline-flex h-9 md:h-10 items-center px-5 font-body text-xs md:text-sm font-medium tracking-[0.14em] uppercase transition-all duration-300 active:scale-[0.97]",
              isHome
                ? "border border-[hsl(var(--av-parchment)/0.25)] text-[hsl(var(--av-parchment))] hover:border-[hsl(var(--av-gold))] hover:bg-[hsl(var(--av-gold))] hover:text-[hsl(var(--av-ink))] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]"
                : "rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] shadow-sm hover:shadow-[0_4px_14px_rgba(201,168,76,0.35)]"
            )}
          >
            Begin
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Cart Trigger */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Open Sacred Cart, ${totalItems} items`}
            className={cn(
              "relative p-2 rounded-full transition-colors cursor-pointer",
              homeScrolledInk ? "text-[hsl(var(--av-parchment))]" : ink
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute 0 top-0 right-0 min-w-[16px] h-[16px] px-1 rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] text-[9px] font-mono font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            className={cn("p-2 transition-colors cursor-pointer", homeScrolledInk ? "text-[hsl(var(--av-parchment))]" : ink)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={cn(
            "md:hidden border-t px-6 py-6 flex flex-col gap-4",
            isHome
              ? "border-[hsl(var(--av-parchment)/0.1)] bg-[hsl(var(--av-ink))]"
              : "border-[hsl(var(--av-stone))] bg-[hsl(var(--av-parchment))]"
          )}
        >
          {NAV.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                "font-body text-base py-2",
                isHome ? "text-[hsl(var(--av-parchment))]" : "text-[hsl(var(--av-night))]"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/step-1"
            onClick={() => setOpen(false)}
            className={cn(
              "inline-flex h-12 items-center justify-center font-body font-medium",
              isHome
                ? "border border-[hsl(var(--av-gold)/0.6)] bg-[hsl(var(--av-gold)/0.1)] text-[hsl(var(--av-parchment))] uppercase tracking-[0.24em] text-[12px]"
                : "rounded-full bg-[hsl(var(--av-night))] text-[hsl(var(--av-gold-soft))]"
            )}
          >
            Begin Your Journey
          </Link>

          <div className="pt-3 mt-1 border-t border-[hsl(var(--av-stone)/0.3)] flex flex-col gap-2">
            <Link
              href="/auth/login?portal=client"
              onClick={() => setOpen(false)}
              className={cn(
                "font-body text-sm py-2 px-3 rounded-xl flex items-center justify-between transition-colors",
                isHome
                  ? "text-[hsl(var(--av-parchment)/0.8)] bg-white/5 hover:bg-white/10"
                  : "text-[hsl(var(--av-night))] bg-[hsl(var(--av-stone)/0.3)] hover:bg-[hsl(var(--av-stone)/0.5)]"
              )}
            >
              <span>Client Sanctuary Login</span>
              <span className="text-xs text-[hsl(var(--av-gold))]">→</span>
            </Link>
            <Link
              href="/auth/login?portal=coach"
              onClick={() => setOpen(false)}
              className={cn(
                "font-body text-sm py-2 px-3 rounded-xl flex items-center justify-between transition-colors",
                isHome
                  ? "text-[hsl(var(--av-parchment)/0.8)] bg-white/5 hover:bg-white/10"
                  : "text-[hsl(var(--av-night))] bg-[hsl(var(--av-stone)/0.3)] hover:bg-[hsl(var(--av-stone)/0.5)]"
              )}
            >
              <span>Coach & Practitioner Login</span>
              <span className="text-xs text-[hsl(var(--av-gold))]">→</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavigation;
