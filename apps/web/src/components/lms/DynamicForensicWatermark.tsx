'use client'

import React, { useEffect, useState, useRef } from 'react'

interface DynamicForensicWatermarkProps {
  studentHash: string
  maskedEmail: string
  studentName?: string
  initialTimestamp?: string
}

export default function DynamicForensicWatermark({
  studentHash,
  maskedEmail,
  studentName,
  initialTimestamp,
}: DynamicForensicWatermarkProps) {
  const [pos, setPos] = useState({ x: 20, y: 30 })
  const [timestamp, setTimestamp] = useState(
    initialTimestamp || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
  )
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Update live UTC clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Randomly drift/hop positions across viewport every 5 seconds to defeat automated cropping & recording
  useEffect(() => {
    const interval = setInterval(() => {
      const randomX = Math.floor(10 + Math.random() * 70) // 10% to 80%
      const randomY = Math.floor(15 + Math.random() * 65) // 15% to 80%
      setPos({ x: randomX, y: randomY })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Subtle background security pattern canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 400
    canvas.height = 200
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '10px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.rotate((-15 * Math.PI) / 180)
    for (let i = -100; i < 500; i += 80) {
      for (let j = -100; j < 300; j += 40) {
        ctx.fillText(`${studentHash}`, i, j)
      }
    }
  }, [studentHash])

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20"
      aria-hidden="true"
    >
      {/* Repeating subtle micro-grid canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover opacity-60 mix-blend-screen"
      />

      {/* Main Dynamic Moving Forensic Token */}
      <div
        className="absolute transition-all duration-1000 ease-in-out"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="px-3 py-1.5 rounded-md bg-black/40 backdrop-blur-[2px] border border-white/5 shadow-2xl flex flex-col items-start gap-0.5 text-[10px] font-mono leading-tight tracking-wider text-white/30 hover:text-white/50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
            <span className="font-bold text-white/40">{studentHash}</span>
          </div>
          <div className="text-[9px] text-white/25">
            {maskedEmail} {studentName ? `• ${studentName}` : ''}
          </div>
          <div className="text-[8px] text-white/20 tracking-tighter">
            {timestamp}
          </div>
        </div>
      </div>

      {/* Static corner identifiers with low opacity */}
      <div className="absolute top-3 left-3 text-[9px] font-mono text-white/10 tracking-widest uppercase">
        AUMVEDA SECURE STREAM • {studentHash}
      </div>
      <div className="absolute bottom-3 right-3 text-[8px] font-mono text-white/10 tracking-tighter">
        FORENSICALLY WATERMARKED
      </div>
    </div>
  )
}
