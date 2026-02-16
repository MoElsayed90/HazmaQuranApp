"use client";

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  ChevronUp,
  Gauge,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { PLAYBACK_SPEEDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayerMini() {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    isVisible,
    audioError,
    play,
    toggle,
    stop,
    next,
    previous,
    setExpanded,
    clearAudioError,
    queue,
    queueIndex,
    seek,
  } = useAudioPlayerContext();

  if (!isVisible || !currentTrack) return null;

  const handlePlayRetry = () => {
    clearAudioError();
    play(currentTrack);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 inset-x-0 z-50 border-t-2 border-border bg-card shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm"
    >
      {/* Progress bar at top - clickable for seek (Spotify/Anghami style) */}
      <button
        type="button"
        className="w-full h-1.5 bg-primary/20 flex cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
          seek(pct);
        }}
        aria-label="انتقل إلى موضع في المقطع"
      >
        <span
          className="h-full bg-primary transition-all rounded-none"
          style={{ width: `${progress}%` }}
        />
      </button>

      {audioError && (
        <p className="text-xs text-center text-amber-600 dark:text-amber-400 py-1 px-2 bg-amber-500/10">
          اضغط للتشغيل
        </p>
      )}

      {/* 3-section layout (Spotify-style): track info | center controls | time + expand + close */}
      <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 max-w-5xl w-full">
        {/* Right (RTL): art + track info */}
        <div className="min-w-0 flex items-center gap-3 justify-start">
          <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
            <BookOpen className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="min-w-0 flex-1 text-right"
          >
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
            {currentTrack.subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.subtitle}
              </p>
            )}
          </button>
        </div>

        {/* Center: playback controls */}
        <div className="flex items-center gap-1 shrink-0 px-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={previous}
            disabled={queue.length === 0 || queueIndex <= 0}
            aria-label="السورة السابقة"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shrink-0",
              audioError && "ring-2 ring-amber-500/50"
            )}
            onClick={audioError ? handlePlayRetry : toggle}
            aria-label={audioError ? "إعادة تشغيل الصوت" : isPlaying ? "إيقاف" : "تشغيل"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={next}
            disabled={queue.length === 0 || queueIndex >= queue.length - 1}
            aria-label="السورة التالية"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
        </div>

        {/* Left (RTL): time + expand + close */}
        <div className="min-w-0 flex items-center gap-1 justify-end">
          <span className="text-xs text-muted-foreground hidden sm:block tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            onClick={() => setExpanded(true)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={stop}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function AudioPlayerExpanded() {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    speed,
    isExpanded,
    audioError,
    play,
    toggle,
    seek,
    setSpeed,
    next,
    previous,
    setExpanded,
    clearAudioError,
    queue,
    queueIndex,
  } = useAudioPlayerContext();

  if (!isExpanded || !currentTrack) return null;

  const handlePlayRetry = () => {
    clearAudioError();
    play(currentTrack);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex flex-col bg-background"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-4 w-4 rotate-180 ml-1" />
            تصغير
          </Button>
          <span className="text-sm font-medium text-foreground">
            مشغل الصوت
          </span>
          <div className="w-16" />
        </div>

        {/* Content - clearer hierarchy and spacing */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-6 gap-6 min-h-0 overflow-auto">
          {/* Art + title block */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-primary/20 flex items-center justify-center shadow-lg">
              <BookOpen className="h-16 w-16 sm:h-20 sm:w-20 text-primary" aria-hidden />
            </div>
            <div className="text-center min-w-0 max-w-md">
              <h2 className="text-lg sm:text-xl font-bold truncate">{currentTrack.title}</h2>
              {currentTrack.subtitle && (
                <p className="text-muted-foreground text-sm mt-0.5 truncate">
                  {currentTrack.subtitle}
                </p>
              )}
              {audioError && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                  اضغط للتشغيل
                </p>
              )}
            </div>
          </div>

          {/* Progress + time */}
          <div className="w-full max-w-md space-y-1.5 shrink-0">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={(val) => seek(val[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main controls */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-12 sm:w-12"
              onClick={previous}
              disabled={queue.length === 0 || queueIndex <= 0}
              aria-label="السورة السابقة"
            >
              <SkipForward className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
              size="icon"
              className={cn(
                "h-14 w-14 sm:h-16 sm:w-16 rounded-full",
                audioError && "ring-2 ring-amber-500/50"
              )}
              onClick={audioError ? handlePlayRetry : toggle}
              aria-label={audioError ? "إعادة تشغيل الصوت" : isPlaying ? "إيقاف" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7 sm:h-8 sm:w-8" />
              ) : (
                <Play className="h-7 w-7 sm:h-8 sm:w-8" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-12 sm:w-12"
              onClick={next}
              disabled={queue.length === 0 || queueIndex >= queue.length - 1}
              aria-label="السورة التالية"
            >
              <SkipBack className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>

          {/* Speed - compact row */}
          <div className="flex items-center gap-2 shrink-0">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex gap-0.5">
              {PLAYBACK_SPEEDS.map((s) => (
                <Button
                  key={s}
                  variant={speed === s ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2 text-xs min-w-[2.25rem]"
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Queue - compact */}
        {queue.length > 1 && (
          <div className="border-t border-border/80 bg-card/50 px-4 py-2.5 max-h-32 overflow-y-auto shrink-0">
            <h3 className="text-xs font-medium text-muted-foreground mb-1.5">
              قائمة التشغيل ({queue.length})
            </h3>
            <div className="space-y-0.5">
              {queue.map((track, i) => (
                <div
                  key={track.id}
                  className={cn(
                    "text-xs py-1 px-2 rounded truncate",
                    i === queueIndex
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {track.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
