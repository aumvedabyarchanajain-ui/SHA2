'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, Lock, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DynamicForensicWatermark from './DynamicForensicWatermark'
import { showSuccess, showError } from '@/utils/toast'

interface LMSVideoPlayerProps {
  lessonId: string
  courseSlug: string
  onProgressUpdate?: (progressPct: number, isCompleted: boolean) => void
  onAutoComplete?: () => void
}


export default function LMSVideoPlayer({
  lessonId,
  courseSlug,
  onProgressUpdate,
  onAutoComplete,
}: LMSVideoPlayerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [playbackData, setPlaybackData] = useState<any>(null)
  const [currentProgressPct, setCurrentProgressPct] = useState(0)
  const [completed, setCompleted] = useState(false)

  const playerRef = useRef<any>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const containerId = useRef(`yt-player-${Math.random().toString(36).slice(2, 9)}`)
  const completedFlagRef = useRef(false)

  // Clear progress polling
  const stopProgressPolling = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }, [])

  // Sync progress to server API
  const syncProgressToServer = useCallback(
    async (currentTime: number, duration: number, token?: string) => {
      if (!currentTime || !duration || duration <= 0) return
      const pct = Math.min(100, Math.round((currentTime / duration) * 100))
      setCurrentProgressPct(pct)

      // Check >= 85% threshold
      if (pct >= 85 && !completedFlagRef.current) {
        completedFlagRef.current = true
        setCompleted(true)
        showSuccess('Lesson completed! (≥85% threshold reached)')
        onAutoComplete?.()
      }

      onProgressUpdate?.(pct, pct >= 85)

      try {
        await fetch(`/api/v1/lms/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            watchTimeSeconds: Math.round(currentTime),
            durationSeconds: Math.round(duration),
            lastPositionSec: Math.round(currentTime),
          }),
        })
      } catch (err) {
        console.warn('[LMS Progress Sync] Error:', err)
      }
    },
    [lessonId, onAutoComplete, onProgressUpdate],
  )

  // Start polling playhead position
  const startProgressPolling = useCallback(
    (token?: string) => {
      stopProgressPolling()
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const currentTime = playerRef.current.getCurrentTime()
            const duration = playerRef.current.getDuration()
            if (duration > 0) {
              syncProgressToServer(currentTime, duration, token)
            }
          } catch {
            // Player might be unmounting
          }
        }
      }, 4000)
    },
    [stopProgressPolling, syncProgressToServer],
  )

  // Instantiate YouTube Iframe player
  const setupPlayer = useCallback(
    (videoId: string, token: string) => {
      const YT = (window as any).YT
      if (!YT || !YT.Player) {
        return
      }

      // If player already exists, load video
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(videoId)
          setLoading(false)
          return
        } catch {
          // Re-create if crashed
        }
      }

      try {
        playerRef.current = new YT.Player(containerId.current, {
          height: '100%',
          width: '100%',
          videoId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            controls: 1,
            disablekb: 1,
            fs: 0, // Disabled fullscreen to preserve watermark integrity
            iv_load_policy: 3,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: () => {
              setLoading(false)
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING
              if (event.data === 1) {
                startProgressPolling(token)
              } else if (event.data === 0) {
                // 0 = ENDED
                stopProgressPolling()
                const duration = playerRef.current?.getDuration?.() || 100
                syncProgressToServer(duration, duration, token)
              } else {
                // PAUSED or BUFFERING
                stopProgressPolling()
              }
            },
            onError: (errEvent: any) => {
              console.error('[YT Player Error]:', errEvent)
              setError('Playback stream error. Please click renew to refresh security token.')
            },
          },
        })
      } catch (e: any) {
        console.error('[YT Init Error]:', e)
        setError('Could not initialize video player.')
        setLoading(false)
      }
    },
    [startProgressPolling, stopProgressPolling, syncProgressToServer],
  )

  // Fetch secure 15-minute tokenized playback session
  const fetchPlaybackSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSessionExpired(false)
    completedFlagRef.current = false

    try {
      const res = await fetch(`/api/v1/lms/lessons/${lessonId}/playback-session`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (res.status === 403) {
          setError(data.error || 'Enrollment required to access this lesson.')
        } else {
          setError(data.error || 'Failed to initialize secure playback session.')
        }
        setLoading(false)
        return
      }

      setPlaybackData(data)

      // Ensure YouTube iframe API is loaded
      if (!(window as any).YT) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

        ;(window as any).onYouTubeIframeAPIReady = () => {
          setupPlayer(data.videoId, data.token)
        }
      } else {
        setupPlayer(data.videoId, data.token)
      }
    } catch (err: any) {
      setError(err.message || 'Network connection failed')
      setLoading(false)
    }
  }, [lessonId, setupPlayer])

  useEffect(() => {
    fetchPlaybackSession()
    return () => {
      stopProgressPolling()
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy()
        } catch {}
      }
    }
  }, [fetchPlaybackSession, stopProgressPolling])

  // Error / Entitlement UI
  if (error) {
    return (
      <div className="aspect-video bg-[hsl(var(--av-night))] rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-[hsl(var(--av-gold)/0.2)] shadow-2xl relative overflow-hidden">
        <div className="w-14 h-14 bg-[hsl(var(--av-gold)/0.1)] rounded-full flex items-center justify-center mb-4 border border-[hsl(var(--av-gold)/0.3)]">
          {sessionExpired ? (
            <RefreshCw className="w-6 h-6 text-[hsl(var(--av-gold))]" />
          ) : (
            <Lock className="w-6 h-6 text-[hsl(var(--av-gold))]" />
          )}
        </div>
        <h3 className="text-xl font-serif font-bold text-[hsl(var(--av-parchment))] mb-2">
          {sessionExpired ? 'Playback Token Expired' : 'Lesson Sanctuary Gated'}
        </h3>
        <p className="text-sm text-[hsl(var(--av-parchment)/0.6)] max-w-md mb-6 leading-relaxed">
          {error}
        </p>
        <Button
          onClick={fetchPlaybackSession}
          className="rounded-full bg-[hsl(var(--av-gold))] text-[hsl(var(--av-ink))] hover:bg-[hsl(var(--av-gold-soft))] font-medium text-xs uppercase tracking-widest px-6"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          {sessionExpired ? 'Renew 15-Min Token' : 'Retry Verification'}
        </Button>
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group border border-[hsl(var(--av-stone)/0.3)]">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 bg-[hsl(var(--av-night))] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[hsl(var(--av-gold))] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--av-parchment)/0.6)] animate-pulse">
            Establishing 15-Minute Tokenized Handshake...
          </p>
        </div>
      )}

      {/* YouTube Player Target */}
      <div id={containerId.current} className="w-full h-full" />

      {/* Anti-Piracy Dynamic Forensic Watermark */}
      {playbackData?.forensicWatermark && (
        <DynamicForensicWatermark
          studentHash={playbackData.forensicWatermark.studentHash}
          maskedEmail={playbackData.forensicWatermark.maskedEmail}
          studentName={playbackData.forensicWatermark.studentName}
          initialTimestamp={playbackData.forensicWatermark.timestamp}
        />
      )}

      {/* Security Badge Pill in Top Right */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md border border-[hsl(var(--av-gold)/0.3)] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-mono text-[hsl(var(--av-parchment)/0.9)] uppercase tracking-wider">
            Tokenized Stream
          </span>
        </div>
      </div>

      {/* Live Progress Bar at bottom of video player */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
        <div
          className="h-full bg-gradient-to-r from-[hsl(var(--av-gold))] to-emerald-400 transition-all duration-300"
          style={{ width: `${currentProgressPct}%` }}
        />
      </div>
    </div>
  )
}
