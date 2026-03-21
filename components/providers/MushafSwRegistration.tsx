"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for mushaf image caching (CacheFirst).
 * Runs in browser only; no-op during SSR.
 */
export function MushafSwRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {})
      .catch(() => {});
  }, []);
  return null;
}
