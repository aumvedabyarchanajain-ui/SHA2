"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { generateForensicHash } from "@/lib/hash-utils";

interface VideoPlayerProps {
  courseId: string;
  moduleId: string;
  userId: string;
  userEmail: string;
}


const VideoPlayer: React.FC<VideoPlayerProps> = ({ courseId, moduleId, userId, userEmail }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  const playerRef = useRef<any>(null);
  const progressInterval = useRef<any>(null);
  const forensicHash = useRef(generateForensicHash(`${userId}-${userEmail}`));

  const trackProgress = useCallback(async (status: string, progress: number = 0) => {
    try {
      await fetch('/api/courses/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          moduleId,
          progress: Math.round(progress),
          status
        })
      });
    } catch (err) {
      console.error("Failed to track progress:", err);
    }
  }, [courseId, moduleId]);

  const stopProgressPolling = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  }, []);

  const startProgressPolling = useCallback(() => {
    stopProgressPolling();
    progressInterval.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        const percent = (currentTime / duration) * 100;
        if (percent > 0) trackProgress('watching', percent);
      }
    }, 10000);
  }, [stopProgressPolling, trackProgress]);

  const createPlayer = useCallback((videoId: string) => {
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
      setLoading(false);
      return;
    }

    playerRef.current = new (window as any).YT.Player(`player-${moduleId}`, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        rel: 0,
        controls: 1,
        disablekb: 1,
        fs: 0,
      },
      events: {
        onReady: () => setLoading(false),
        onStateChange: (event: any) => {
          if (event.data === 1) {
            trackProgress('started');
            startProgressPolling();
          } else if (event.data === 0) {
            trackProgress('completed', 100);
            stopProgressPolling();
          } else {
            stopProgressPolling();
          }
        },
        onError: (e: any) => {
          console.error("YT Player Error:", e);
          setError("Video playback error. Please refresh.");
        }
      }
    });
  }, [moduleId, trackProgress, startProgressPolling, stopProgressPolling]);

  const initPlayer = useCallback((videoId: string) => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => createPlayer(videoId);
    } else {
      createPlayer(videoId);
    }
  }, [createPlayer]);

  const fetchSecureConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTokenExpired(false);

    try {
      const tokenRes = await fetch(`/api/courses/${courseId}/modules/${moduleId}/embed-token`);
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) throw new Error(tokenData.error || "Access Denied");

      const configRes = await fetch(`/api/embed/config?token=${tokenData.token}`);
      const configData = await configRes.json();

      if (!configRes.ok) {
        if (configRes.status === 401) {
          setTokenExpired(true);
          throw new Error("Security token expired");
        }
        throw new Error(configData.error || "Invalid Token");
      }

      setConfig(configData);
      initPlayer(configData.videoId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [courseId, moduleId, initPlayer]);

  useEffect(() => {
    fetchSecureConfig();
    return () => {
      stopProgressPolling();
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [fetchSecureConfig, stopProgressPolling]);

  if (error) {
    return (
      <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center p-8 text-center border border-slate-800">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
          {tokenExpired ? <RefreshCw className="w-8 h-8 text-amber-500 animate-spin-slow" /> : <Lock className="w-8 h-8 text-rose-500" />}
        </div>
        <h3 className="text-white font-bold text-xl mb-2">
          {tokenExpired ? "Session Expired" : "Secure Content Locked"}
        </h3>
        <p className="text-slate-400 max-w-md mb-6">
          {tokenExpired ? "Your secure viewing session has timed out for security reasons." : error}
        </p>
        <Button variant="secondary" onClick={fetchSecureConfig}>
          {tokenExpired ? "Renew Session" : "Retry Access"}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-800">
      {loading && (
        <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Verifying Entitlements...</p>
        </div>
      )}

      <div id={`player-${moduleId}`} className="w-full h-full" />

      {/* Forensic Watermark Overlay */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 opacity-30">
        <div className="absolute top-10 left-10 -rotate-12 text-white/20 text-[9px] font-mono whitespace-nowrap">
          ID:{forensicHash.current} • {new Date().toISOString().split('T')[0]}
        </div>
        <div className="absolute bottom-10 right-10 -rotate-12 text-white/20 text-[9px] font-mono whitespace-nowrap">
          ID:{forensicHash.current} • {new Date().toISOString().split('T')[0]}
        </div>
        <div className="absolute top-1/3 right-1/4 rotate-12 text-white/10 text-[8px] font-mono">
          {userEmail.split('@')[0]}@****
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 text-white/[0.02] text-5xl font-black tracking-tighter">
          AUMVEDA PROTECTED
        </div>
      </div>

      <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-white font-medium uppercase tracking-wider">Hashed Forensic Stream</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
