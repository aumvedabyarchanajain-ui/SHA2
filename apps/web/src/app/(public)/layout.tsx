"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PublicNavigation = dynamic(() => import("@/components/PublicNavigation"), {
  ssr: false,
});

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className={cn(
        "min-h-screen",
        isHome ? "bg-[hsl(var(--av-ink))]" : "bg-[hsl(var(--av-parchment))]"
      )}
    >
      {/* Homepage renders its own floating glass nav (FloatingNav) inside HomePage */}
      {!isHome && <PublicNavigation />}
      <main>{children}</main>

      {/* Homepage carries its own closing beat — no second marketing footer */}
      {!isHome && (
        <footer className="bg-[hsl(var(--av-night))] text-[hsl(var(--av-parchment))] pt-20 pb-12">
          <div className="max-w-[1120px] mx-auto px-6 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
              <div className="space-y-4 max-w-sm">
                <p className="font-serif text-2xl tracking-tight">AUMVEDA</p>
                <p className="font-body text-sm text-[hsl(var(--av-parchment)/0.5)] leading-relaxed">
                  Mother–Daughter Neuro-Vedic Healing. Your Daily Dose of Healing.
                </p>
              </div>
              <nav className="flex flex-wrap gap-x-8 gap-y-3 font-body text-sm text-[hsl(var(--av-parchment)/0.45)]">
                <Link href="/about" className="hover:text-[hsl(var(--av-gold-soft))]">
                  About
                </Link>
                <Link href="/courses" className="hover:text-[hsl(var(--av-gold-soft))]">
                  Academy
                </Link>
                <Link href="/services" className="hover:text-[hsl(var(--av-gold-soft))]">
                  Services
                </Link>
                <Link href="/programs" className="hover:text-[hsl(var(--av-gold-soft))]">
                  Programmes
                </Link>
                <Link href="/insights" className="hover:text-[hsl(var(--av-gold-soft))]">
                  Insights
                </Link>
                <Link href="/contact" className="hover:text-[hsl(var(--av-gold-soft))]">
                  Contact
                </Link>
                <Link href="/auth/login?portal=client" className="hover:text-[hsl(var(--av-gold-soft))]">
                  Client login
                </Link>
                <Link href="/auth/login?portal=coach" className="hover:text-[hsl(var(--av-gold-soft))]">
                  Coach login
                </Link>
              </nav>
            </div>
            <div className="pt-8 border-t border-[hsl(var(--av-parchment)/0.1)] flex flex-col sm:flex-row justify-between gap-4 font-body text-xs text-[hsl(var(--av-parchment)/0.3)]">
              <p>© {new Date().getFullYear()} AUMVEDA</p>
              <div className="flex gap-6">
                <Link href="/privacy-policy" className="hover:text-[hsl(var(--av-parchment)/0.6)]">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-[hsl(var(--av-parchment)/0.6)]">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
