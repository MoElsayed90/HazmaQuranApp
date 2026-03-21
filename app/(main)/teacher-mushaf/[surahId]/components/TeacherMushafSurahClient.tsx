"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Play, Pause, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { useChapterAudioFile } from "@/lib/queries/hooks";
import { getAyahAudioUrl } from "@/lib/audio/service";
import type { Surah, Ayah } from "@/lib/api/types";
import type { ChapterAudioTimestamp } from "@/lib/queries/fetchers";
import { cn } from "@/lib/utils";

const RECITER_LABEL = "محمود خليل الحصري (المصحف المعلم)";
const EDITION_ID = "husaryMuelam";

/** QF reciter ID for Teacher mode (Al-Husary style). Set via env QF_TEACHER_RECITER_ID if available. */
const QF_TEACHER_RECITER_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_QF_TEACHER_RECITER_ID) || "7";

function getVerseKeyFromTimestamps(
  timestamps: ChapterAudioTimestamp[],
  currentTimeMs: number
): string | null {
  if (!timestamps.length) return null;
  let lo = 0;
  let hi = timestamps.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const t = timestamps[mid];
    if (currentTimeMs >= t.from && currentTimeMs <= t.to) return t.verseKey;
    if (currentTimeMs < t.from) hi = mid - 1;
    else lo = mid + 1;
  }
  return timestamps[lo]?.verseKey ?? timestamps[hi]?.verseKey ?? null;
}

function MuelamAyahRow({
  ayah,
  surahId,
  surahName,
  audioUrl,
  isHighlighted,
}: {
  ayah: Ayah;
  surahId: number;
  surahName: string;
  audioUrl: string;
  isHighlighted: boolean;
}) {
  const { play, toggle, currentTrack, isTrackPlaying } = useAudioPlayerContext();
  const trackId = `muelam-${surahId}-${ayah.numberInQuran}`;
  const playing = isTrackPlaying(trackId);

  const handlePlay = () => {
    if (currentTrack?.id === trackId) {
      toggle();
      return;
    }
    play({
      id: trackId,
      url: audioUrl,
      title: `الآية ${ayah.number} — سورة ${surahName}`,
      subtitle: RECITER_LABEL,
      surahId,
      ayahNumber: ayah.number,
    });
  };

  return (
    <div
      id={`ayah-${ayah.number}`}
      className={cn(
        "group relative py-4 px-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-primary/10",
        isHighlighted && "bg-primary/[0.16] ayah-highlight"
      )}
    >
      <div className="flex gap-3 items-start">
        <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              isHighlighted ? "bg-primary/20" : "bg-primary/10"
            )}
          >
            <span className="text-xs font-semibold text-primary">
              {ayah.number}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7",
              !playing && "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="quran-text leading-loose">{ayah.text}</p>
        </div>
      </div>
    </div>
  );
}

export function TeacherMushafSurahClient({
  surah,
  ayahs,
}: {
  surah: Surah;
  ayahs: Ayah[];
}) {
  const { currentTrack, isPlaying, playQueue, play, currentTime } =
    useAudioPlayerContext();
  const topRef = useRef<HTMLDivElement>(null);
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  const timestampsRef = useRef<ChapterAudioTimestamp[] | null>(null);
  const currentTimeRef = useRef(0);

  const { data: chapterAudio } = useChapterAudioFile(
    QF_TEACHER_RECITER_ID,
    surah.id,
    true
  );

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const currentAyahNumber =
    currentTrack?.surahId === surah.id && currentTrack?.ayahNumber != null
      ? currentTrack.ayahNumber
      : undefined;

  const isPlayingFullChapter =
    currentTrack?.id === `qf-chapter-${surah.id}` && isPlaying;

  useEffect(() => {
    if (isPlayingFullChapter && timestampsRef.current?.length) {
      const id = setInterval(() => {
        const ms = currentTimeRef.current * 1000;
        const verseKey = getVerseKeyFromTimestamps(timestampsRef.current!, ms);
        setHighlightedVerseKey(verseKey);
      }, 300);
      return () => clearInterval(id);
    }
    if (!isPlayingFullChapter) {
      setHighlightedVerseKey(null);
    }
  }, [isPlayingFullChapter]);

  useEffect(() => {
    if (currentAyahNumber && isPlaying && !isPlayingFullChapter) {
      const el = document.getElementById(`ayah-${currentAyahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentAyahNumber, isPlaying, isPlayingFullChapter]);

  useEffect(() => {
    if (highlightedVerseKey && isPlayingFullChapter) {
      const [, verseNum] = highlightedVerseKey.split(":");
      const el = document.getElementById(`ayah-${verseNum}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedVerseKey, isPlayingFullChapter]);

  const handlePlayAll = useCallback(() => {
    if (chapterAudio?.audioUrl && chapterAudio?.timestamps?.length) {
      timestampsRef.current = chapterAudio.timestamps;
      play({
        id: `qf-chapter-${surah.id}`,
        url: chapterAudio.audioUrl,
        title: `سورة ${surah.name}`,
        subtitle: RECITER_LABEL,
        surahId: surah.id,
      });
    } else {
      timestampsRef.current = null;
      const tracks = ayahs.map((a) => ({
        id: `muelam-${surah.id}-${a.numberInQuran}`,
        url: getAyahAudioUrl(a.numberInQuran, EDITION_ID),
        title: `الآية ${a.number} — سورة ${surah.name}`,
        subtitle: RECITER_LABEL,
        surahId: surah.id,
        ayahNumber: a.number,
      }));
      if (tracks.length > 0) playQueue(tracks, 0);
    }
  }, [chapterAudio, surah, ayahs, play, playQueue]);

  const getIsHighlighted = useCallback(
    (ayah: Ayah) => {
      if (highlightedVerseKey) {
        return highlightedVerseKey === `${surah.id}:${ayah.number}`;
      }
      return currentAyahNumber === ayah.number;
    },
    [highlightedVerseKey, currentAyahNumber, surah.id]
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div ref={topRef} />

      <Link
        href="/teacher-mushaf"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى المصحف المعلم
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">المصحف المعلم — للحفظ</p>
          <h1 className="text-2xl font-bold font-quran">{surah.name}</h1>
          <p className="text-muted-foreground mt-0.5">
            {surah.englishName} — {surah.englishNameTranslation}
          </p>
          <div className="flex items-center gap-2 mt-2">
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
      </div>

      <div className="rounded-lg border bg-card px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          للشيخ محمود خليل الحصري — استمع واربط الصوت بالنص للحفظ
        </p>
        <Button
          variant="default"
          size="sm"
          className="gap-2"
          onClick={handlePlayAll}
        >
          <Play className="h-3.5 w-3.5" />
          تشغيل السورة
        </Button>
      </div>

      {surah.id !== 1 && surah.id !== 9 && (
        <div className="text-center py-6">
          <p className="text-2xl font-quran text-primary/80">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      <div className="divide-y divide-border/50">
        {ayahs.map((ayah) => (
          <MuelamAyahRow
            key={ayah.number}
            ayah={ayah}
            surahId={surah.id}
            surahName={surah.name}
            audioUrl={getAyahAudioUrl(ayah.numberInQuran, EDITION_ID)}
            isHighlighted={getIsHighlighted(ayah)}
          />
        ))}
      </div>
    </div>
  );
}
