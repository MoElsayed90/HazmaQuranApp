"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/use-settings";

const FONT_SIZE_MAP: Record<
  string,
  { size: string; lineHeight: string; translationSize: string; translationLineHeight: string }
> = {
  sm: { size: "1.25rem", lineHeight: "2.2", translationSize: "0.85rem", translationLineHeight: "1.85" },
  base: { size: "1.5rem", lineHeight: "2.2", translationSize: "0.95rem", translationLineHeight: "1.85" },
  lg: { size: "1.75rem", lineHeight: "2.2", translationSize: "1.1rem", translationLineHeight: "1.9" },
  xl: { size: "2rem", lineHeight: "2.2", translationSize: "1.25rem", translationLineHeight: "1.9" },
};

export function FontSizeSync() {
  const fontSize = useSettingsStore((s) => s.fontSize);

  useEffect(() => {
    const values = FONT_SIZE_MAP[fontSize] ?? FONT_SIZE_MAP.base;
    document.documentElement.style.setProperty("--quran-font-size", values.size);
    document.documentElement.style.setProperty("--quran-line-height", values.lineHeight);
    document.documentElement.style.setProperty("--translation-font-size", values.translationSize);
    document.documentElement.style.setProperty("--translation-line-height", values.translationLineHeight);
  }, [fontSize]);

  return null;
}
