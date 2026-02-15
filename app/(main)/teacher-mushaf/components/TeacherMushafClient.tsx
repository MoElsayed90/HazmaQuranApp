"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Download, Play, Pause, BookOpen, BookOpenText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchInput } from "@/components/quran/SearchInput";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { getAyahAudioUrl } from "@/lib/audio/service";
import { downloadAudioFile } from "@/lib/download-audio";
import { SURAH_NAMES_AR, getSurahAyahRange } from "@/lib/constants";
import { cn } from "@/lib/utils";

const RECITER_LABEL = "محمود خليل الحصري (المصحف المعلم)";
const EDITION_ID = "husaryMuelam";

const surahList = Array.from({ length: 114 }, (_, i) => i + 1).map((id) => ({
  id,
  name: SURAH_NAMES_AR[id] ?? `سورة ${id}`,
}));

/** بناء قائمة تشغيل آية آية لسورة (نفس مسار تصفح السور الذي يعمل) */
function buildAyahTracksForSurah(surahId: number) {
  const [start, end] = getSurahAyahRange(surahId);
  const name = SURAH_NAMES_AR[surahId] ?? `سورة ${surahId}`;
  const tracks = [];
  for (let g = start; g <= end; g++) {
    const ayahLocal = g - start + 1;
    tracks.push({
      id: `muelam-${surahId}-${g}`,
      url: getAyahAudioUrl(g, EDITION_ID),
      title: `الآية ${ayahLocal} — سورة ${name}`,
      subtitle: RECITER_LABEL,
      surahId,
      ayahNumber: ayahLocal,
    });
  }
  return tracks;
}

export function TeacherMushafClient() {
  const [searchSurah, setSearchSurah] = useState("");
  const { currentTrack, progress, playQueue } = useAudioPlayerContext();

  const filtered = useMemo(() => {
    const q = searchSurah.trim();
    if (!q) return surahList;
    return surahList.filter(
      (s) =>
        s.name.includes(q) ||
        String(s.id) === q
    );
  }, [searchSurah]);

  const handlePlay = (surah: (typeof surahList)[0]) => {
    const tracks = buildAyahTracksForSurah(surah.id);
    if (tracks.length > 0) playQueue(tracks, 0);
  };

  const handlePlayAll = () => {
    const allTracks = filtered.flatMap((s) => buildAyahTracksForSurah(s.id));
    if (allTracks.length > 0) playQueue(allTracks, 0);
  };

  /** هل السورة قيد التشغيل حالياً (أي أن أحد آياتها في الـ queue الحالي) */
  const isSurahPlaying = (surahId: number) => {
    const tid = currentTrack?.id;
    if (tid == null) return false;
    return typeof tid === "string" && tid.startsWith(`muelam-${surahId}-`);
  };

  /** رابط تحميل أول آية من السورة (لأن ملف السورة الكامل غير متاح على CDN) */
  const getFirstAyahDownloadUrl = (surahId: number) => {
    const [start] = getSurahAyahRange(surahId);
    return getAyahAudioUrl(start, EDITION_ID);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-bold">المصحف المعلم</h1>
          <p className="text-muted-foreground mt-1">للشيخ محمود خليل الحصري</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="sticky top-0 z-10 border-b bg-card pb-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">صوت السور — 114 مقطع</CardTitle>
            <Button
              variant="default"
              size="sm"
              className="gap-2 shrink-0"
              onClick={handlePlayAll}
            >
              <Play className="h-3.5 w-3.5" />
              تشغيل الكل
            </Button>
          </div>
          <SearchInput
            value={searchSurah}
            onChange={setSearchSurah}
            placeholder="ابحث عن سورة..."
            className="w-full max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            {filtered.length} مقطع
            {searchSurah.trim() && filtered.length !== surahList.length && (
              <span className="text-muted-foreground/80"> (مصفى)</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[min(70vh,32rem)] w-full">
            <div
              dir="rtl"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-2"
            >
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                  {searchSurah.trim() ? "لا توجد سورة تطابق البحث" : "لا توجد مقاطع"}
                </div>
              ) : (
                filtered.map((surah) => {
                  const playing = isSurahPlaying(surah.id);
                  const isCurrentTrack = playing;
                  return (
                    <div
                      key={surah.id}
                      className={cn(
                        "flex min-h-[4.5rem] flex-col rounded-lg border bg-card px-3 py-2.5 transition-colors",
                        playing && isCurrentTrack
                          ? "border-primary/30 bg-primary/10 ring-1 ring-primary/20"
                          : "border-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className="flex flex-1 items-center gap-2">
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
                          aria-hidden
                        >
                          {surah.id}
                        </span>
                        <div className="flex-1 min-w-0 text-right">
                          <Link
                            href={`/teacher-mushaf/${surah.id}`}
                            className="block hover:underline focus:underline"
                          >
                            <p className="text-sm font-medium truncate">
                              {surah.name}
                            </p>
                            <p className="text-xs text-foreground/75 mt-0.5 flex items-center gap-1">
                              سورة {surah.id}
                              <BookOpenText className="h-3 w-3 opacity-70" aria-hidden />
                              <span className="text-primary/80">عرض للحفظ</span>
                            </p>
                          </Link>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handlePlay(surah)}
                          aria-label={playing ? "إيقاف" : "تشغيل"}
                        >
                          {playing && isCurrentTrack ? (
                            <Pause className="h-4 w-4 text-primary" />
                          ) : (
                            <Play className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          aria-label="تحميل أول آية"
                          onClick={async () => {
                            const toastId = "download-audio";
                            toast.loading("جاري التحميل... الملفات الكبيرة (سور طويلة) تحتاج وقتاً لبدء التحميل، انتظر قليلاً.", { id: toastId });
                            try {
                              await downloadAudioFile(
                                getFirstAyahDownloadUrl(surah.id),
                                `surah-${surah.id}-ayah-1.mp3`
                              );
                              toast.success("تم بدء التحميل", { id: toastId });
                            } catch {
                              toast.error("فشل التحميل", {
                                description: "تحقق من الاتصال أو جرّب مرة أخرى.",
                                id: toastId,
                              });
                            }
                          }}
                        >
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                      {playing && isCurrentTrack && (
                        <Progress
                          value={progress}
                          className="mt-2 h-1 w-full"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
