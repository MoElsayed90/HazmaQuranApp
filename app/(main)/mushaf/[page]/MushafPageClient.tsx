"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Play, BookOpen, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMushafPage, useMushafLayout } from "@/lib/queries/hooks";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { useBookmarkStore } from "@/lib/stores/use-bookmarks";
import { useSettingsStore } from "@/lib/stores/use-settings";
import { getAyahAudioUrl } from "@/lib/audio/service";
import { verseKeyToGlobalAyah, getSurahDisplayName } from "@/lib/constants";
import { toast } from "sonner";

const MUSHAF_LAST_PAGE_KEY = "mushaf-last-page";

interface MushafPageClientProps {
  pageNumber: number;
}

const TEXT_MODE_BANNER = "الصورة غير متوفرة — عرض وضع النص";

const MUSHAF_FRAME_SRC = "/mushaf-frame.svg";

/** Prefetch a mushaf page image (neighbor) so it is cached for instant flip */
function prefetchMushafImage(url: string) {
  if (typeof window === "undefined") return;
  const img = new Image();
  img.src = url;
}

export function MushafPageClient({ pageNumber }: MushafPageClientProps) {
  const { data, isLoading, isError, error } = useMushafPage(pageNumber);
  const { data: layoutData } = useMushafLayout(pageNumber);
  const [imageError, setImageError] = useState(false);
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const { play } = useAudioPlayerContext();
  const { addBookmark, isBookmarked } = useBookmarkStore();
  const { audioEdition } = useSettingsStore();

  useEffect(() => {
    try {
      localStorage.setItem(MUSHAF_LAST_PAGE_KEY, String(pageNumber));
    } catch {
      /* ignore */
    }
  }, [pageNumber]);

  useEffect(() => {
    setImageError(false);
  }, [pageNumber]);

  // Prefetch neighbor page images for instant flip
  useEffect(() => {
    if (!data?.imageUrl) return;
    const base =
      "https://cdn.jsdelivr.net/gh/tarekeldeeb/madina_images@w1024";
    if (pageNumber > 1) {
      const prevUrl = `${base}/w1024_page${String(pageNumber - 1).padStart(3, "0")}.png`;
      prefetchMushafImage(prevUrl);
    }
    if (pageNumber < 604) {
      const nextUrl = `${base}/w1024_page${String(pageNumber + 1).padStart(3, "0")}.png`;
      prefetchMushafImage(nextUrl);
    }
  }, [pageNumber, data?.imageUrl]);

  const showImage = Boolean(data?.imageUrl) && !imageError;
  const boxes = layoutData?.boxes ?? [];

  const handlePlayAyah = useCallback(() => {
    if (!selectedVerseKey) return;
    const global = verseKeyToGlobalAyah(selectedVerseKey);
    if (global === 0) return;
    const url = getAyahAudioUrl(global, audioEdition);
    const [chapterStr, verseStr] = selectedVerseKey.split(":");
    const chapter = parseInt(chapterStr, 10);
    const surahName = getSurahDisplayName(chapter);
    play({
      id: selectedVerseKey,
      url,
      title: `الآية ${verseStr}`,
      subtitle: surahName,
      surahId: chapter,
      ayahNumber: parseInt(verseStr, 10),
      surahName,
    });
    setSelectedVerseKey(null);
  }, [selectedVerseKey, audioEdition, play]);

  const handleTafsir = useCallback(() => {
    toast.info("التفسير قريباً");
    setSelectedVerseKey(null);
  }, []);

  const handleBookmark = useCallback(() => {
    if (!selectedVerseKey) return;
    const [chapterStr, verseStr] = selectedVerseKey.split(":");
    const surahId = parseInt(chapterStr, 10);
    const ayahNumber = parseInt(verseStr, 10);
    const surahName = getSurahDisplayName(surahId);
    const verseText =
      data?.verses?.find((v) => v.verseKey === selectedVerseKey)?.text ?? "";
    if (isBookmarked(surahId, ayahNumber)) {
      toast("الإشارة موجودة مسبقاً");
    } else {
      addBookmark({
        surahId,
        surahName,
        ayahNumber,
        ayahText: verseText.slice(0, 100),
      });
      toast.success("تمت الإضافة إلى الإشارات");
    }
    setSelectedVerseKey(null);
  }, [selectedVerseKey, data?.verses, addBookmark, isBookmarked]);

  // Show skeleton only when we have no data at all (no placeholder)
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] dark:bg-[#1a1a1a]">
        <div className="mx-auto w-full max-w-[980px] px-3 md:px-6 py-6">
          <div className="flex justify-between gap-4 mb-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="aspect-[1024/1656] w-full max-w-[980px]" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] dark:bg-[#1a1a1a] flex flex-col items-center justify-center px-4 py-12">
        <p className="text-destructive">
          {error?.message ?? "فشل تحميل صفحة المصحف"}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/mushaf">العودة للمصحف</Link>
        </Button>
      </div>
    );
  }

  const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
  const nextPage = pageNumber < 604 ? pageNumber + 1 : null;
  const juzHizb = "";
  const surahName = "";
  const hasExtraMeta = Boolean(juzHizb || surahName);

  return (
    <div className="min-h-screen bg-[#f5f0e8] dark:bg-[#1a1a1a]">
      <div className="mx-auto w-full max-w-[980px] px-3 md:px-6 py-6">
        <div
          dir="rtl"
          className="flex flex-wrap items-center justify-between gap-4 mb-3"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              asChild
              disabled={!prevPage}
              aria-label="الصفحة السابقة"
            >
              {prevPage ? (
                <Link href={`/mushaf/${prevPage}`}>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ) : (
                <span>
                  <ChevronRight className="h-5 w-5 opacity-40" />
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              asChild
              disabled={!nextPage}
              aria-label="الصفحة التالية"
            >
              {nextPage ? (
                <Link href={`/mushaf/${nextPage}`}>
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="h-5 w-5 opacity-40" />
                </span>
              )}
            </Button>
          </div>
        </div>

        <div
          dir="rtl"
          className="mb-3 text-sm opacity-80 flex justify-between text-foreground/80"
        >
          {hasExtraMeta ? (
            <>
              <span>{juzHizb}</span>
              <span>{surahName}</span>
              <span>صفحة {data.pageNumber}</span>
            </>
          ) : (
            <span>صفحة {data.pageNumber}</span>
          )}
        </div>

        {!showImage && (
          <p
            role="status"
            className="text-sm text-muted-foreground bg-muted/60 px-3 py-2 rounded-md w-full text-center mb-3"
          >
            {TEXT_MODE_BANNER}
          </p>
        )}
        {data.imageUrl && (
          <div className="p-1 md:p-2">
            <div className="relative w-full">
              <img
                src={data.imageUrl}
                alt={`صفحة المصحف ${data.pageNumber}`}
                className="w-full h-auto block select-none"
                style={{ filter: "none" }}
                onError={() => setImageError(true)}
              />
              <img
                src={MUSHAF_FRAME_SRC}
                className="pointer-events-none absolute inset-0 w-full h-full object-fill"
                alt=""
                aria-hidden
              />
              {/* Hitbox overlay: tap-on-ayah (only buttons receive clicks) */}
              <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden
              >
                <div className="absolute inset-0 w-full h-full">
                  {boxes.map((box) => (
                    <button
                      key={box.verseKey}
                      type="button"
                      className="absolute left-0 top-0 pointer-events-auto hover:bg-primary/10 focus:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                      style={{
                        left: `${box.x * 100}%`,
                        top: `${box.y * 100}%`,
                        width: `${box.w * 100}%`,
                        height: `${box.h * 100}%`,
                      }}
                      aria-label={`آية ${box.verseKey}`}
                      onClick={() => setSelectedVerseKey(box.verseKey)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom sheet: actions for selected ayah */}
      <Sheet
        open={selectedVerseKey != null}
        onOpenChange={(open) => !open && setSelectedVerseKey(null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle dir="rtl" className="text-right">
              {selectedVerseKey ? `آية ${selectedVerseKey}` : ""}
            </SheetTitle>
          </SheetHeader>
          <div dir="rtl" className="grid gap-2 py-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handlePlayAyah}
            >
              <Play className="h-4 w-4" />
              تشغيل الآية
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleTafsir}
            >
              <BookOpen className="h-4 w-4" />
              التفسير
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleBookmark}
            >
              <BookmarkPlus className="h-4 w-4" />
              إضافة إشارة
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
