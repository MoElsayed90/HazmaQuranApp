"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Play, Pause, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { getAyahAudioUrl } from "@/lib/audio/service";
import type { Surah, Ayah } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const RECITER_LABEL = "محمود خليل الحصري (المصحف المعلم)";
const EDITION_ID = "husaryMuelam";

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
  const { play, isTrackPlaying } = useAudioPlayerContext();
  const trackId = `muelam-${surahId}-${ayah.numberInQuran}`;
  const playing = isTrackPlaying(trackId);

  const handlePlay = () => {
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
        "group relative py-4 px-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-muted/50",
        isHighlighted && "bg-primary/[0.08] ayah-highlight"
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
  const { currentTrack, isPlaying, playQueue } = useAudioPlayerContext();
  const topRef = useRef<HTMLDivElement>(null);

  const currentAyahNumber =
    currentTrack?.surahId === surah.id && currentTrack?.ayahNumber != null
      ? currentTrack.ayahNumber
      : undefined;

  useEffect(() => {
    if (currentAyahNumber && isPlaying) {
      const el = document.getElementById(`ayah-${currentAyahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentAyahNumber, isPlaying]);

  const handlePlayAll = () => {
    const tracks = ayahs.map((a) => ({
      id: `muelam-${surah.id}-${a.numberInQuran}`,
      url: getAyahAudioUrl(a.numberInQuran, EDITION_ID),
      title: `الآية ${a.number} — سورة ${surah.name}`,
      subtitle: RECITER_LABEL,
      surahId: surah.id,
      ayahNumber: a.number,
    }));
    if (tracks.length > 0) playQueue(tracks, 0);
  };

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
            <Badge variant="outline">
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
            isHighlighted={currentAyahNumber === ayah.number}
          />
        ))}
      </div>
    </div>
  );
}
