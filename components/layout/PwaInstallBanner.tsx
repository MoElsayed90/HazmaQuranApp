"use client";

import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { useState, useEffect } from "react";

const DISMISS_KEY = "pwa-install-banner-dismissed";

export function PwaInstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const handleInstall = async () => {
    await install();
    handleDismiss();
  };

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:hidden">
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 shadow-lg">
        <p className="text-sm text-foreground">يمكنك تحميله الآن</p>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" onClick={handleInstall} className="gap-1">
            <Download className="h-3.5 w-3.5" />
            تحميل
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
