"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LastReadPosition, LastAudioPosition } from "@/lib/api/types";

interface AudioStateStore {
  lastRead: LastReadPosition | null;
  lastAudio: LastAudioPosition | null;
  setLastRead: (position: LastReadPosition) => void;
  setLastAudio: (position: LastAudioPosition) => void;
  clearLastRead: () => void;
  clearLastAudio: () => void;
}

export const useAudioStateStore = create<AudioStateStore>()(
  persist(
    (set) => ({
      lastRead: null,
      lastAudio: null,

      setLastRead: (lastRead) => set({ lastRead }),
      setLastAudio: (lastAudio) => set({ lastAudio }),
      clearLastRead: () => set({ lastRead: null }),
      clearLastAudio: () => set({ lastAudio: null }),
    }),
    {
      name: "quran-audio-state",
    }
  )
);
