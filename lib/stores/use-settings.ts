"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings } from "@/lib/api/types";
import { DEFAULT_SETTINGS } from "@/lib/api/types";

interface SettingsStore extends AppSettings {
  setTheme: (theme: AppSettings["theme"]) => void;
  setFontSize: (fontSize: AppSettings["fontSize"]) => void;
  setDefaultReciter: (reciterId: number | null) => void;
  setShowTranslation: (show: boolean) => void;
  setTranslationEdition: (edition: string) => void;
  setAudioEdition: (edition: string) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setDefaultReciter: (defaultReciterId) => set({ defaultReciterId }),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setTranslationEdition: (translationEdition) => set({ translationEdition }),
      setAudioEdition: (audioEdition) => set({ audioEdition }),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "quran-settings",
    }
  )
);
