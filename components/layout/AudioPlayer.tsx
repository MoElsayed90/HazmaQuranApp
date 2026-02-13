"use client";

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  ChevronUp,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
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
      className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      {/* Progress bar at top */}
      <Progress value={progress} className="h-1 rounded-none" />

      {audioError && (
        <p className="text-xs text-center text-amber-600 dark:text-amber-400 py-1 px-2 bg-amber-500/10">
          اضغط للتشغيل
        </p>
      )}

      <div className="container mx-auto flex items-center gap-3 px-4 py-2">
        {/* Track info */}
        <button
          onClick={() => setExpanded(true)}
          className="flex-1 min-w-0 text-right"
        >
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          {currentTrack.subtitle && (
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.subtitle}
            </p>
          )}
        </button>

        {/* Time */}
        <span className="text-xs text-muted-foreground hidden sm:block tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={previous}
              disabled={queueIndex <= 0}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", audioError && "text-primary ring-2 ring-primary/30")}
            onClick={audioError ? handlePlayRetry : toggle}
            aria-label={audioError ? "إعادة تشغيل الصوت" : isPlaying ? "إيقاف" : "تشغيل"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          {queue.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={next}
              disabled={queueIndex >= queue.length - 1}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          )}

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
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-4 w-4 rotate-180 ml-1" />
            تصغير
          </Button>
          <span className="text-sm text-muted-foreground">
            مشغل الصوت
          </span>
          <div className="w-16" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
          {/* Track art placeholder */}
          <div className="w-48 h-48 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Play className="h-16 w-16 text-primary/40" />
          </div>

          {/* Track info */}
          <div className="text-center">
            <h2 className="text-xl font-bold">{currentTrack.title}</h2>
            {currentTrack.subtitle && (
              <p className="text-muted-foreground mt-1">
                {currentTrack.subtitle}
              </p>
            )}
            {audioError && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                اضغط للتشغيل
              </p>
            )}
          </div>

          {/* Progress */}
          <div className="w-full max-w-md space-y-2">
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

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={previous}
              disabled={queueIndex <= 0}
            >
              <SkipForward className="h-6 w-6" />
            </Button>

            <Button
              size="icon"
              className={cn(
                "h-16 w-16 rounded-full",
                audioError && "ring-2 ring-amber-500/50"
              )}
              onClick={audioError ? handlePlayRetry : toggle}
              aria-label={audioError ? "إعادة تشغيل الصوت" : isPlaying ? "إيقاف" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={next}
              disabled={queueIndex >= queue.length - 1}
            >
              <SkipBack className="h-6 w-6" />
            </Button>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {PLAYBACK_SPEEDS.map((s) => (
                <Button
                  key={s}
                  variant={speed === s ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Queue */}
        {queue.length > 1 && (
          <div className="border-t px-4 py-3 max-h-48 overflow-y-auto">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              قائمة التشغيل ({queue.length})
            </h3>
            <div className="space-y-1">
              {queue.map((track, i) => (
                <div
                  key={track.id}
                  className={cn(
                    "text-sm py-1 px-2 rounded",
                    i === queueIndex
                      ? "bg-primary/10 text-primary font-medium"
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
