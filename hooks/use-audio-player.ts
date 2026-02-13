"use client";

import { useCallback, useEffect, useRef, useState, createContext, useContext } from "react";
import { toast } from "sonner";
import type { PlaybackSpeed } from "@/lib/constants";
import { resolveAudioUrl } from "@/lib/audio/url-resolver";

const DEV = typeof process !== "undefined" && process.env.NODE_ENV === "development";

export interface AudioTrack {
  id: string | number;
  url: string;
  title: string;
  subtitle?: string;
  surahId?: number;
  ayahNumber?: number;
}

export interface AudioPlayerState {
  /** Currently playing track, or null */
  currentTrack: AudioTrack | null;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Progress 0-100 */
  progress: number;
  /** Current time in seconds */
  currentTime: number;
  /** Duration in seconds */
  duration: number;
  /** Playback speed */
  speed: PlaybackSpeed;
  /** Queue of tracks to play */
  queue: AudioTrack[];
  /** Current index in queue */
  queueIndex: number;
  /** Whether player is visible */
  isVisible: boolean;
  /** Whether expanded player is open */
  isExpanded: boolean;
  /** Error message when load/play failed; clear on retry or new play */
  audioError: string | null;
}

export interface AudioPlayerActions {
  play: (track: AudioTrack) => void;
  playQueue: (tracks: AudioTrack[], startIndex?: number) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  stop: () => void;
  seek: (progress: number) => void;
  seekTo: (seconds: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  next: () => void;
  previous: () => void;
  setExpanded: (expanded: boolean) => void;
  isTrackPlaying: (id: string | number) => boolean;
  /** Clear playback error and allow retry */
  clearAudioError: () => void;
}

export type AudioPlayerContextType = AudioPlayerState & AudioPlayerActions;

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayerContext(): AudioPlayerContextType {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayerContext must be used within an AudioPlayerProvider");
  }
  return context;
}

export { AudioPlayerContext };

export function useAudioPlayer(): AudioPlayerContextType {
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    speed: 1,
    queue: [],
    queueIndex: -1,
    isVisible: false,
    isExpanded: false,
    audioError: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Ensure audio element exists
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      if (typeof window !== "undefined") {
        audioRef.current = new Audio();
      }
    }
    return audioRef.current;
  }, []);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const { currentTime, duration } = audio;
    setState((prev) => ({
      ...prev,
      currentTime,
      duration: duration || 0,
      progress: duration > 0 ? (currentTime / duration) * 100 : 0,
    }));
  }, []);

  const playTrackAtIndex = useCallback(
    (queue: AudioTrack[], index: number) => {
      const audio = getAudio();
      if (!audio || index < 0 || index >= queue.length) return;

      const track = queue[index];
      const resolvedUrl = resolveAudioUrl(track.url);
      if (!resolvedUrl) {
        setState((prev) => ({
          ...prev,
          audioError: "رابط الصوت غير متوفر",
        }));
        if (DEV) console.warn("[audio] empty or invalid URL for track", track.id);
        return;
      }

      setState((prev) => ({ ...prev, audioError: null }));

      audio.playbackRate = stateRef.current.speed;
      audio.src = resolvedUrl;
      audio.load();

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            setState((prev) => ({
              ...prev,
              currentTrack: track,
              queue,
              queueIndex: index,
              isPlaying: true,
              isVisible: true,
              progress: 0,
              currentTime: 0,
              duration: 0,
              audioError: null,
            }));
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            if (DEV) {
              console.warn("[audio] play() failed:", msg, "url:", resolvedUrl);
            }
            setState((prev) => ({
              ...prev,
              currentTrack: track,
              queue,
              queueIndex: index,
              isPlaying: false,
              isVisible: true,
              progress: 0,
              currentTime: 0,
              duration: 0,
              audioError: "اضغط للتشغيل",
            }));
            toast("اضغط تشغيل مرة أخرى", {
              description: "لم يتمكن المتصفح من تشغيل الصوت. جرّب النقر على زر التشغيل.",
            });
          });
      } else {
        setState((prev) => ({
          ...prev,
          currentTrack: track,
          queue,
          queueIndex: index,
          isPlaying: true,
          isVisible: true,
          progress: 0,
          currentTime: 0,
          duration: 0,
        }));
      }
    },
    [getAudio]
  );

  const play = useCallback(
    (track: AudioTrack) => {
      playTrackAtIndex([track], 0);
    },
    [playTrackAtIndex]
  );

  const playQueue = useCallback(
    (tracks: AudioTrack[], startIndex = 0) => {
      playTrackAtIndex(tracks, startIndex);
    },
    [playTrackAtIndex]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const toggle = useCallback(() => {
    if (stateRef.current.isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [pause, resume]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setState((prev) => ({
      ...prev,
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      queue: [],
      queueIndex: -1,
      isVisible: false,
      isExpanded: false,
      audioError: null,
    }));
  }, []);

  const clearAudioError = useCallback(() => {
    setState((prev) => ({ ...prev, audioError: null }));
  }, []);

  const seek = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (progress / 100) * audio.duration;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setState((prev) => ({ ...prev, speed }));
  }, []);

  const next = useCallback(() => {
    const { queue, queueIndex } = stateRef.current;
    if (queueIndex < queue.length - 1) {
      playTrackAtIndex(queue, queueIndex + 1);
    }
  }, [playTrackAtIndex]);

  const previous = useCallback(() => {
    const { queue, queueIndex } = stateRef.current;
    if (queueIndex > 0) {
      playTrackAtIndex(queue, queueIndex - 1);
    }
  }, [playTrackAtIndex]);

  const setExpanded = useCallback((expanded: boolean) => {
    setState((prev) => ({ ...prev, isExpanded: expanded }));
  }, []);

  const isTrackPlaying = useCallback(
    (id: string | number) =>
      stateRef.current.currentTrack?.id === id && stateRef.current.isPlaying,
    []
  );

  // Set up audio event listeners
  useEffect(() => {
    const audio = getAudio();
    if (!audio) return;

    const onTimeUpdate = () => updateProgress();
    const onEnded = () => {
      const { queue, queueIndex } = stateRef.current;
      if (queueIndex < queue.length - 1) {
        playTrackAtIndex(queue, queueIndex + 1);
      } else {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          progress: 0,
          currentTime: 0,
        }));
      }
    };
    const onError = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      const code = el?.error?.code;
      const msg = el?.error?.message || "فشل تحميل الصوت";
      if (DEV) {
        console.warn("[audio] element error:", code, msg, "src:", el?.src);
      }
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        audioError: "فشل تحميل الصوت",
      }));
      toast.error("فشل تحميل الصوت", {
        description: "تحقق من الاتصال أو جرّب مرة أخرى.",
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };
  }, [getAudio, updateProgress, playTrackAtIndex]);

  return {
    ...state,
    play,
    playQueue,
    pause,
    resume,
    toggle,
    stop,
    seek,
    seekTo,
    setSpeed,
    next,
    previous,
    setExpanded,
    isTrackPlaying,
    clearAudioError,
  };
}
