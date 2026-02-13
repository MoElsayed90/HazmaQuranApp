"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Play, Minus, Plus, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AyahRow } from "@/components/quran/AyahRow";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { useAudioStateStore } from "@/lib/stores/use-audio-state";
import { useSettingsStore } from "@/lib/stores/use-settings";
import { getAyahAudioUrl, getEditionName } from "@/lib/audio/service";
import { FONT_SIZES } from "@/lib/constants";
import type { Surah, Ayah } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface SurahReaderClientProps {
  surah: Surah;
  ayahs: Ayah[];
  initialAyah?: number;
}

const fontSizeKeys = Object.keys(FONT_SIZES) as Array<keyof typeof FONT_SIZES>;

export function SurahReaderClient({
  surah,
  ayahs,
  initialAyah,
}: SurahReaderClientProps) {
  const { currentTrack, isPlaying, playQueue, currentTime, duration } = useAudioPlayerContext();
  const setLastRead = useAudioStateStore((s) => s.setLastRead);
  const setLastAudio = useAudioStateStore((s) => s.setLastAudio);
  const { fontSize, setFontSize, showTranslation, setShowTranslation, audioEdition } =
    useSettingsStore();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Scroll to initial ayah
  useEffect(() => {
    if (initialAyah) {
      const el = document.getElementById(`ayah-${initialAyah}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [initialAyah]);

  // Track scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Save last read position on scroll
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Find the visible ayah
        for (const ayah of ayahs) {
          const el = document.getElementById(`ayah-${ayah.number}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
              setLastRead({
                surahId: surah.id,
                surahName: surah.name,
                ayahNumber: ayah.number,
                timestamp: Date.now(),
              });
              break;
            }
          }
        }
      }, 1000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(debounceTimer);
    };
  }, [ayahs, setLastRead, surah.id, surah.name]);

  // Current playing ayah
  const currentAyahNumber = currentTrack?.surahId === surah.id
    ? currentTrack.ayahNumber
    : undefined;

  // Scroll to current ayah when it changes
  useEffect(() => {
    if (currentAyahNumber && isPlaying) {
      const el = document.getElementById(`ayah-${currentAyahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentAyahNumber, isPlaying]);

  const editionName = getEditionName(audioEdition);

  // Persist last audio position (throttled while playing; once on pause/end)
  const lastAudioWriteRef = useRef(0);
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    const track = currentTrack;
    const hasSurahTrack = track?.surahId === surah.id && track?.ayahNumber != null;
    if (!hasSurahTrack || !track?.url) return;

    if (isPlaying) {
      wasPlayingRef.current = true;
      const progress = duration > 0 ? currentTime / duration : 0;
      const now = Date.now();
      if (now - lastAudioWriteRef.current >= 5000) {
        lastAudioWriteRef.current = now;
        setLastAudio({
          surahId: surah.id,
          surahName: surah.name,
          ayahNumber: track.ayahNumber!,
          reciterId: 0,
          reciterName: editionName,
          audioUrl: track.url,
          progress,
          timestamp: now,
        });
      }
    } else {
      if (wasPlayingRef.current) {
        wasPlayingRef.current = false;
        const progress = duration > 0 ? currentTime / duration : 0;
        setLastAudio({
          surahId: surah.id,
          surahName: surah.name,
          ayahNumber: track.ayahNumber!,
          reciterId: 0,
          reciterName: editionName,
          audioUrl: track.url,
          progress,
          timestamp: Date.now(),
        });
      }
    }
  }, [currentTrack, isPlaying, currentTime, duration, surah.id, surah.name, setLastAudio, editionName]);

  const handlePlayAll = () => {
    const tracks = ayahs.map((a) => ({
      id: `${surah.id}-${a.number}`,
      url: getAyahAudioUrl(a.numberInQuran, audioEdition),
      title: `الآية ${a.number}`,
      subtitle: `${surah.name} - ${editionName}`,
      surahId: surah.id,
      ayahNumber: a.number,
    }));
    if (tracks.length > 0) {
      playQueue(tracks);
    }
  };

  const adjustFontSize = (direction: "up" | "down") => {
    const currentIndex = fontSizeKeys.indexOf(fontSize);
    if (direction === "up" && currentIndex < fontSizeKeys.length - 1) {
      setFontSize(fontSizeKeys[currentIndex + 1]);
    } else if (direction === "down" && currentIndex > 0) {
      setFontSize(fontSizeKeys[currentIndex - 1]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div ref={topRef} />

      {/* Surah header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold font-quran">{surah.name}</h1>
        <p className="text-muted-foreground mt-1">
          {surah.englishName} - {surah.englishNameTranslation}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="outline">
            {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
          </Badge>
          <Badge variant="outline">{surah.numberOfAyahs} آية</Badge>
        </div>
      </div>

      {/* Reading settings bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 mb-6">
        <div className="flex items-center gap-3">
          {/* Font size */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => adjustFontSize("down")}
              disabled={fontSize === "sm"}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground w-8 text-center">
              {FONT_SIZES[fontSize].label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => adjustFontSize("up")}
              disabled={fontSize === "xl"}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5" />

          {/* Translation toggle */}
          <div className="flex items-center gap-2">
            <BookOpenText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">التفسير</span>
            <Switch
              checked={showTranslation}
              onCheckedChange={setShowTranslation}
              className="scale-75"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handlePlayAll}
        >
          <Play className="h-3.5 w-3.5" />
          تشغيل
        </Button>
      </div>

      {/* Bismillah */}
      {surah.id !== 1 && surah.id !== 9 && (
        <div className="text-center py-6">
          <p className="text-2xl font-quran text-primary/80">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="divide-y divide-border/50">
        {ayahs.map((ayah) => (
          <AyahRow
            key={ayah.number}
            ayah={ayah}
            surahId={surah.id}
            surahName={surah.name}
            isHighlighted={currentAyahNumber === ayah.number}
            audioUrl={getAyahAudioUrl(ayah.numberInQuran, audioEdition)}
          />
        ))}
      </div>

      {/* Surah navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        {surah.id > 1 && (
          <a href={`/surahs/${surah.id - 1}`}>
            <Button variant="outline" size="sm">
              السورة السابقة
            </Button>
          </a>
        )}
        <div />
        {surah.id < 114 && (
          <a href={`/surahs/${surah.id + 1}`}>
            <Button variant="outline" size="sm">
              السورة التالية
            </Button>
          </a>
        )}
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <Button
          size="icon"
          className={cn(
            "fixed bottom-24 left-4 z-40 h-10 w-10 rounded-full shadow-lg transition-all",
            showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
