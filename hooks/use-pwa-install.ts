"use client";

import { useState, useEffect, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const checkStandalone = () => {
      const standalone = (window as Window & { standalone?: boolean }).standalone ?? false;
      const displayMode = window.matchMedia("(display-mode: standalone)").matches;
      setIsInstalled(standalone || displayMode);
    };
    checkStandalone();
    window.matchMedia("(display-mode: standalone)").addEventListener("change", checkStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
      setInstallPrompt(null);
      return true;
    }
    return false;
  }, [installPrompt]);

  return { canInstall, install, isInstalled };
}
