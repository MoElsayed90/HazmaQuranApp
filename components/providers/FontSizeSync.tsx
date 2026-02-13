"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/use-settings";

const FONT_SIZE_MAP: Record<string, { size: string; lineHeight: string }> = {
  sm: { size: "1.25rem", lineHeight: "2.2" },
  base: { size: "1.5rem", lineHeight: "2.2" },
  lg: { size: "1.75rem", lineHeight: "2.2" },
  xl: { size: "2rem", lineHeight: "2.2" },
};

export function FontSizeSync() {
  const fontSize = useSettingsStore((s) => s.fontSize);

  useEffect(() => {
    const values = FONT_SIZE_MAP[fontSize] ?? FONT_SIZE_MAP.base;
    document.documentElement.style.setProperty("--quran-font-size", values.size);
    document.documentElement.style.setProperty("--quran-line-height", values.lineHeight);
  }, [fontSize]);

  return null;
}
