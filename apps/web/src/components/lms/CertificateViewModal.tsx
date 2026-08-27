'use client'

import React, { useRef } from 'react'
import {
  Award,
  Download,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  X,
  Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { showSuccess } from '@/utils/toast'

interface CertificateViewModalProps {
  isOpen: boolean
  onClose: () => void
  certificateNumber: string
  verificationHash: string
  courseTitle: string
  studentName: string
  issuedAt: string
}

export default function CertificateViewModal({
  isOpen,
  onClose,
  certificateNumber,
  verificationHash,
  courseTitle,
  studentName,
  issuedAt,
}: CertificateViewModalProps) {
  const certRef = useRef<HTMLDivElement | null>(null)

  if (!isOpen) return null

  const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    showSuccess('Certificate generated! Ready for print & sacred storage.')
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[hsl(var(--av-night))] border border-[hsl(var(--av-gold)/0.3)] rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--av-stone)/0.2)] bg-[hsl(var(--av-ink))]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[hsl(var(--av-gold))]" />
            <span className="font-serif text-sm font-bold text-[hsl(var(--av-parchment))]">
              AUMVEDA Verified Certificate of Mastery
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              variant="outline"
              className="rounded-full border-[hsl(var(--av-stone)/0.4)] text-[hsl(var(--av-parchment))] hover:bg-white/5 text-xs h-8"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save PDF
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] text-xs font-medium h-8 px-4"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[hsl(var(--av-parchment)/0.6)] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Area */}
        <div className="p-6 md:p-10 flex justify-center bg-black/50 overflow-x-auto">
          <div
            ref={certRef}
            className="w-full max-w-[850px] aspect-[1.414/1] bg-[#0E1513] text-[#F3EFE6] border-8 border-double border-[#C5A059] p-8 md:p-12 relative flex flex-col justify-between shadow-2xl rounded-sm print:m-0 print:border-4"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.08) 0%, transparent 70%)',
            }}
          >
            {/* Sacred Geometry Corner Flourishes */}
            <div className="absolute top-3 left-3 text-[#C5A059] opacity-70 text-xs select-none">
              ✦ ────
            </div>
            <div className="absolute top-3 right-3 text-[#C5A059] opacity-70 text-xs select-none">
              ──── ✦
            </div>
            <div className="absolute bottom-3 left-3 text-[#C5A059] opacity-70 text-xs select-none">
              ✦ ────
            </div>
            <div className="absolute bottom-3 right-3 text-[#C5A059] opacity-70 text-xs select-none">
              ──── ✦
            </div>

            {/* Header / Brand */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-[#C5A059] text-xl">ॐ</span>
                <h1 className="font-serif text-2xl md:text-3xl tracking-[0.25em] text-[#C5A059] font-bold uppercase">
                  AUMVEDA
                </h1>
                <span className="text-[#C5A059] text-xl">ॐ</span>
              </div>
              <p className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-[#C5A059]/80">
                Academy of Neuro-Vedic Sciences & Somatic Healing
              </p>
              <div className="w-24 h-[1px] bg-[#C5A059]/40 mx-auto mt-3" />
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 my-auto py-4">
              <p className="text-xs md:text-sm font-serif italic text-[#F3EFE6]/70">
                This is to certify that
              </p>
              <h2 className="font-serif text-2xl md:text-4xl text-[#F3EFE6] font-bold tracking-tight border-b border-[#C5A059]/30 pb-2 max-w-lg mx-auto">
                {studentName}
              </h2>
              <p className="text-xs md:text-sm font-serif text-[#F3EFE6]/75 max-w-md mx-auto leading-relaxed">
                has demonstrated profound devotion, completed 100% of curriculum requirements, passed all knowledge assessments, and mastered the practices of
              </p>
              <h3 className="font-serif text-lg md:text-2xl text-[#C5A059] font-bold tracking-wide italic">
                "{courseTitle}"
              </h3>
            </div>

            {/* Footer / Signatures & Seal */}
            <div className="pt-6 border-t border-[#C5A059]/20 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Signature 1 */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-lg text-[#C5A059] leading-none">
                  Archana Jain
                </div>
                <div className="w-36 h-[1px] bg-[#C5A059]/40 mx-auto" />
                <p className="text-[9px] font-mono uppercase tracking-wider text-[#F3EFE6]/60">
                  Archana Jain
                </p>
                <p className="text-[8px] text-[#F3EFE6]/40">Founder & Master Healer</p>
              </div>

              {/* Verified Seal Stamp */}
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#C5A059] flex flex-col items-center justify-center p-1 text-center bg-[#C5A059]/10 shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#C5A059] mb-0.5" />
                <span className="text-[7px] font-mono uppercase tracking-tighter text-[#C5A059] font-bold">
                  VERIFIED
                </span>
                <span className="text-[6px] font-mono text-[#F3EFE6]/50">AUMVEDA</span>
              </div>

              {/* Signature 2 */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-lg text-[#C5A059] leading-none">
                  Sejal Jain
                </div>
                <div className="w-36 h-[1px] bg-[#C5A059]/40 mx-auto" />
                <p className="text-[9px] font-mono uppercase tracking-wider text-[#F3EFE6]/60">
                  Sejal Jain
                </p>
                <p className="text-[8px] text-[#F3EFE6]/40">Co-Founder & Vedic Astrologer</p>
              </div>
            </div>

            {/* Cryptographic Verification Meta */}
            <div className="mt-4 pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[8px] font-mono text-[#F3EFE6]/40">
              <div>CERTIFICATE NO: {certificateNumber}</div>
              <div>ISSUED ON: {formattedDate}</div>
              <div className="truncate max-w-[200px]">HASH: {verificationHash}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
