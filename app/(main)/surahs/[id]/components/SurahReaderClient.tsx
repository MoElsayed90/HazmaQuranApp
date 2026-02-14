"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Play, Minus, Plus, BookOpenText, BookMarked } from "lucide-react";
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
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { useAudioStateStore } from "@/lib/stores/use-audio-state";
import { useSettingsStore } from "@/lib/stores/use-settings";
import { getEditionName } from "@/lib/audio/service";
import { FONT_SIZES } from "@/lib/constants";
import type { Surah, Ayah } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Verse timestamp for full-surah sync (from API) */
interface VerseSegment {
  verseNumber: number;
  startMs: number;
  endMs: number;
}

function getVerseFromSegments(
  segments: VerseSegment[],
  currentTimeMs: number
): number | undefined {
  for (const s of segments) {
    if (currentTimeMs >= s.startMs && currentTimeMs < s.endMs) return s.verseNumber;
  }
  if (segments.length && currentTimeMs >= segments[segments.length - 1].endMs) {
    return segments[segments.length - 1].verseNumber;
  }
  return segments[0]?.verseNumber;
}

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
  const { fontSize, setFontSize, showTranslation, setShowTranslation, audioEdition, defaultReciterId } =
    useSettingsStore();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [ayahAudioUrls, setAyahAudioUrls] = useState<Record<number, string>>({});
  const [fullSurahAudio, setFullSurahAudio] = useState<{
    audioUrl: string;
    segments: VerseSegment[];
  } | null>(null);
  const [audioUrlsLoading, setAudioUrlsLoading] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirList, setTafsirList] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selectedTafsirId, setSelectedTafsirId] = useState<number | null>(null);
  const [tafsirByVerse, setTafsirByVerse] = useState<Record<number, string>>({});
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const recitationId = defaultReciterId ?? 1;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tafsirs")
      .then((r) => (r.ok ? r.json() : { tafsirs: [] }))
      .then((data: { tafsirs?: Array<{ id: number; name: string; slug: string }> }) => {
        if (!cancelled && data.tafsirs?.length) {
          setTafsirList(data.tafsirs);
          setSelectedTafsirId((prev) => prev ?? data.tafsirs![0].id);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAudioUrlsLoading(true);
    Promise.all([
      fetch(`/api/audio/surah/${surah.id}?recitationId=${recitationId}`).then((r) =>
        r.ok ? r.json() : { urls: {} }
      ),
      fetch(`/api/audio/surah/${surah.id}/full?recitationId=${recitationId}`).then((r) =>
        r.ok ? r.json() : { audioUrl: null, segments: [] }
      ),
    ])
      .then(([ayahData, fullData]) => {
        if (cancelled) return;
        if (ayahData.urls) setAyahAudioUrls(ayahData.urls);
        if (fullData.audioUrl && Array.isArray(fullData.segments) && fullData.segments.length > 0) {
          setFullSurahAudio({ audioUrl: fullData.audioUrl, segments: fullData.segments });
        } else {
          setFullSurahAudio(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAyahAudioUrls({});
          setFullSurahAudio(null);
        }
      })
      .finally(() => {
        if (!cancelled) setAudioUrlsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [surah.id, recitationId]);

  useEffect(() => {
    if (!showTafsir || selectedTafsirId == null) {
      setTafsirByVerse({});
      return;
    }
    let cancelled = false;
    setTafsirLoading(true);
    fetch(`/api/tafsirs/${selectedTafsirId}?chapter_number=${surah.id}`)
      .then((r) => (r.ok ? r.json() : { tafsir: [] }))
      .then((data: { tafsir?: Array<{ verseNumber: number; text: string }> }) => {
        if (cancelled) return;
        const byVerse: Record<number, string> = {};
        for (const e of data.tafsir ?? []) {
          byVerse[e.verseNumber] = e.text;
        }
        setTafsirByVerse(byVerse);
      })
      .catch(() => {
        if (!cancelled) setTafsirByVerse({});
      })
      .finally(() => {
        if (!cancelled) setTafsirLoading(false);
      });
    return () => { cancelled = true; };
  }, [showTafsir, selectedTafsirId, surah.id]);

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

  // Current playing ayah (from track or from full-surah segments + currentTime)
  const isFullSurahTrack =
    currentTrack?.surahId === surah.id &&
    fullSurahAudio &&
    currentTrack.id === `full-${surah.id}`;
  const currentAyahNumber: number | undefined =
    currentTrack?.surahId === surah.id
      ? currentTrack.ayahNumber ??
        (isFullSurahTrack && fullSurahAudio
          ? getVerseFromSegments(fullSurahAudio.segments, currentTime * 1000)
          : undefined)
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
  const ayahForPersist =
    currentAyahNumber ??
    (currentTrack?.surahId === surah.id ? currentTrack.ayahNumber : undefined);
  useEffect(() => {
    const track = currentTrack;
    const hasSurahTrack = track?.surahId === surah.id && track?.url;
    if (!hasSurahTrack || ayahForPersist == null) return;

    if (isPlaying) {
      wasPlayingRef.current = true;
      const progress = duration > 0 ? currentTime / duration : 0;
      const now = Date.now();
      if (now - lastAudioWriteRef.current >= 5000) {
        lastAudioWriteRef.current = now;
        setLastAudio({
          surahId: surah.id,
          surahName: surah.name,
          ayahNumber: ayahForPersist,
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
          ayahNumber: ayahForPersist,
          reciterId: 0,
          reciterName: editionName,
          audioUrl: track.url,
          progress,
          timestamp: Date.now(),
        });
      }
    }
  }, [currentTrack, isPlaying, currentTime, duration, surah.id, surah.name, setLastAudio, editionName, ayahForPersist]);

  const handlePlayAll = () => {
    if (fullSurahAudio?.audioUrl && fullSurahAudio.segments.length > 0) {
      playQueue([
        {
          id: `full-${surah.id}`,
          url: fullSurahAudio.audioUrl,
          title: surah.name,
          subtitle: editionName,
          surahId: surah.id,
          ayahNumber: undefined,
        },
      ]);
      return;
    }
    const tracks = ayahs
      .map((a) => ({
        id: `${surah.id}-${a.number}`,
        url: ayahAudioUrls[a.numberInQuran] ?? "",
        title: `الآية ${a.number}`,
        subtitle: `${surah.name} - ${editionName}`,
        surahId: surah.id,
        ayahNumber: a.number,
      }))
      .filter((t) => t.url);
    if (tracks.length > 0) {
      playQueue(tracks);
    }
  };
  const hasAudioUrls =
    Object.keys(ayahAudioUrls).length > 0 || Boolean(fullSurahAudio?.audioUrl);

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
            <span className="text-xs text-muted-foreground">الترجمة</span>
            <Switch
              checked={showTranslation}
              onCheckedChange={setShowTranslation}
              className="scale-75"
            />
          </div>

          <Separator orientation="vertical" className="h-5" />

          {/* Tafsir toggle + select */}
          <div className="flex items-center gap-2">
            <BookMarked className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">التفسير</span>
            <Switch
              checked={showTafsir}
              onCheckedChange={setShowTafsir}
              className="scale-75"
            />
            {showTafsir && tafsirList.length > 0 && (
              <Select
                value={selectedTafsirId != null ? String(selectedTafsirId) : ""}
                onValueChange={(v) => setSelectedTafsirId(parseInt(v, 10))}
                disabled={tafsirLoading}
              >
                <SelectTrigger className="h-8 w-[180px] text-xs">
                  <SelectValue placeholder="اختر تفسيراً" />
                </SelectTrigger>
                <SelectContent>
                  {tafsirList.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            if (audioUrlsLoading) return;
            if (!hasAudioUrls) {
              toast("لا يتوفر صوت", {
                description: "اختر قارئاً من الإعدادات أو من صفحة القراء ثم أعد تحميل السورة.",
              });
              return;
            }
            handlePlayAll();
          }}
          disabled={audioUrlsLoading}
        >
          <Play className="h-3.5 w-3.5" />
          {audioUrlsLoading ? "..." : "تشغيل"}
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
            audioUrl={ayahAudioUrls[ayah.numberInQuran] ?? ""}
            tafsirText={showTafsir ? tafsirByVerse[ayah.number] : undefined}
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
