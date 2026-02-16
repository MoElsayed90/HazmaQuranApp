"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Play, Minus, Plus, BookOpenText, Mic2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AyahRow } from "@/components/quran/AyahRow";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { useAudioStateStore } from "@/lib/stores/use-audio-state";
import { useSettingsStore } from "@/lib/stores/use-settings";
import { getAyahAudioUrl, getEditionName, AUDIO_EDITIONS, type AudioEditionId } from "@/lib/audio/service";
import { FONT_SIZES } from "@/lib/constants";
import type { Surah, Ayah } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface SurahReaderClientProps {
  surah: Surah;
  ayahs: Ayah[];
  initialAyah?: number;
}

const fontSizeKeys = Object.keys(FONT_SIZES) as Array<keyof typeof FONT_SIZES>;
const audioEditionIds = Object.keys(AUDIO_EDITIONS) as AudioEditionId[];

export function SurahReaderClient({
  surah,
  ayahs,
  initialAyah,
}: SurahReaderClientProps) {
  const { currentTrack, isPlaying, playQueue, currentTime, duration, queueIndex } = useAudioPlayerContext();
  const setLastRead = useAudioStateStore((s) => s.setLastRead);
  const { fontSize, setFontSize, showTranslation, setShowTranslation, audioEdition, setAudioEdition } =
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

  // عند تغيير القارئ: إن كان التشغيل الحالي من هذه السورة، نحدّث القائمة ونستأنف من الآية الحالية
  const prevEditionRef = useRef(audioEdition);
  useEffect(() => {
    if (prevEditionRef.current === audioEdition) return;
    prevEditionRef.current = audioEdition;
    const isPlayingThisSurah = currentTrack?.surahId === surah.id;
    if (!isPlayingThisSurah || ayahs.length === 0) return;
    const newEditionName = getEditionName(audioEdition);
    const newTracks = ayahs.map((a) => ({
      id: `${surah.id}-${a.number}`,
      url: getAyahAudioUrl(a.numberInQuran, audioEdition),
      title: `الآية ${a.number}`,
      subtitle: `${surah.name} - ${newEditionName}`,
      surahId: surah.id,
      ayahNumber: a.number,
      surahName: surah.name,
      reciterName: newEditionName,
    }));
    const startIndex = Math.max(0, Math.min(queueIndex, newTracks.length - 1));
    playQueue(newTracks, startIndex);
  }, [audioEdition, currentTrack?.surahId, surah.id, surah.name, ayahs, queueIndex, playQueue]);

  const handlePlayAll = () => {
    const tracks = ayahs.map((a) => ({
      id: `${surah.id}-${a.number}`,
      url: getAyahAudioUrl(a.numberInQuran, audioEdition),
      title: `الآية ${a.number}`,
      subtitle: `${surah.name} - ${editionName}`,
      surahId: surah.id,
      ayahNumber: a.number,
      surahName: surah.name,
      reciterName: editionName,
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

      {/* Breadcrumb: القرآن الكريم > سورة X */}
      <Breadcrumb
        items={[
          { label: "القرآن الكريم", href: "/surahs" },
          { label: surah.name },
        ]}
        className="mb-4"
      />

      {/* Surah header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold font-quran">{surah.name}</h1>
        <p className="text-muted-foreground mt-1">
          {surah.englishName} - {surah.englishNameTranslation}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge
            variant="outline"
            className={
              surah.revelationType === "Meccan"
                ? "text-xs font-medium px-2 py-0.5 rounded-md border-accent text-accent-foreground bg-accent/15 dark:bg-accent/25 dark:text-accent dark:border-accent/70"
                : "text-xs font-medium px-2 py-0.5 rounded-md border-primary text-primary bg-primary/15"
            }
          >
            {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
          </Badge>
          <Badge variant="outline">{surah.numberOfAyahs} آية</Badge>
        </div>
      </div>

      {/* Reading settings bar — balanced layout (play with controls, not isolated) */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3 mb-6">
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

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Reciter — قائمة القراء */}
        <div className="flex items-center gap-2 min-w-0 max-w-full">
          <Mic2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 hidden sm:inline">قائمة القراء</span>
          <Select
            value={audioEditionIds.includes(audioEdition as AudioEditionId) ? audioEdition : "alafasy"}
            onValueChange={(v) => setAudioEdition(v)}
          >
            <SelectTrigger className="w-full min-w-0 max-w-[11rem] sm:max-w-[13rem] h-8 text-xs border-muted" dir="rtl">
              <SelectValue placeholder="القارئ" />
            </SelectTrigger>
            <SelectContent>
              {audioEditionIds.map((id) => (
                <SelectItem key={id} value={id} className="text-right">
                  {AUDIO_EDITIONS[id].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Play — inline with bar, not stuck on one side */}
        <Button
          variant="default"
          size="sm"
          className="gap-2 shrink-0"
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
            reciterName={editionName}
          />
        ))}
      </div>

      {/* Surah navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        {surah.id > 1 ? (
          <Link href={`/surahs/${surah.id - 1}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              السورة السابقة
            </Button>
          </Link>
        ) : (
          <div />
        )}
        <div />
        {surah.id < 114 ? (
          <Link href={`/surahs/${surah.id + 1}`}>
            <Button variant="outline" size="sm" className="gap-1">
              السورة التالية
              <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            </Button>
          </Link>
        ) : (
          <div />
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
