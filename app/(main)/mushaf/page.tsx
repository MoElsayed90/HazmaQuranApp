"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TafsirHtml } from "@/components/quran/TafsirHtml";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";

const MIN_PAGE = 1;
const MAX_PAGE = 604;

type MushafVerse = {
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  text: string;
  translation?: string;
  tafsir?: string;
  audioUrl?: string;
};

type MushafData = {
  pageNumber: number;
  imageUrl: string | null;
  imageWidth: number | null;
  verseKeys?: string[];
  verses?: MushafVerse[];
};

function MushafContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { play } = useAudioPlayerContext();
  const pageParam = searchParams.get("page");
  const [page, setPage] = useState(() => {
    const p = pageParam ? parseInt(pageParam, 10) : 1;
    return Number.isNaN(p) || p < MIN_PAGE || p > MAX_PAGE ? 1 : p;
  });
  const [data, setData] = useState<MushafData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<MushafVerse | null>(null);

  useEffect(() => {
    const p = pageParam ? parseInt(pageParam, 10) : page;
    const num = Number.isNaN(p) || p < MIN_PAGE || p > MAX_PAGE ? 1 : Math.min(MAX_PAGE, Math.max(MIN_PAGE, p));
    setPage(num);
  }, [pageParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelectedVerse(null);
    fetch(`/api/mushaf/page/${page}?full=true`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load"))))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "فشل التحميل");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page]);

  const go = (delta: number) => {
    const next = Math.min(MAX_PAGE, Math.max(MIN_PAGE, page + delta));
    setPage(next);
    router.replace(`/mushaf?page=${next}`, { scroll: false });
  };

  const verseKeys = data?.verses?.length
    ? data.verses.map((v) => v.verse_key)
    : data?.verseKeys ?? [];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">مصحف مصور</h1>
      <p className="text-center text-muted-foreground text-sm mb-6">
        صفحة {page} من {MAX_PAGE} (مصحف المدينة)
      </p>

      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => go(-1)}
          disabled={page <= MIN_PAGE || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium min-w-[4rem] text-center">{page}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => go(1)}
          disabled={page >= MAX_PAGE || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {error && (
        <p className="text-center text-destructive py-6">{error}</p>
      )}
      {!loading && !error && data?.imageUrl && (
        <div className="flex justify-center">
          <img
            src={data.imageUrl}
            alt={`صفحة المصحف ${page}`}
            className="max-w-full h-auto rounded-lg shadow-md"
            style={{ maxWidth: data.imageWidth ? `${data.imageWidth}px` : undefined }}
          />
        </div>
      )}
      {!loading && !error && data && !data.imageUrl && (
        <p className="text-center text-muted-foreground py-6">
          لا تتوفر صورة لهذه الصفحة.
        </p>
      )}

      {!loading && data?.verses && data.verses.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-2">اضغط على الآية لعرض التفسير والترجمة:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {data.verses.map((v) => (
              <Button
                key={v.verse_key}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedVerse(v)}
              >
                {v.verse_key}
              </Button>
            ))}
          </div>
        </div>
      )}
      {!loading && verseKeys.length > 0 && !data?.verses?.length && (
        <p className="text-center text-muted-foreground text-xs mt-4">
          الآيات: {verseKeys.join("، ")}
        </p>
      )}

      <Sheet open={!!selectedVerse} onOpenChange={(open) => !open && setSelectedVerse(null)}>
        <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-right">
              {selectedVerse ? `الآية ${selectedVerse.verse_key}` : ""}
            </SheetTitle>
          </SheetHeader>
          {selectedVerse && (
            <div className="mt-4 space-y-4 text-right">
              <p className="font-quran text-xl leading-loose">{selectedVerse.text}</p>
              {selectedVerse.translation && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الترجمة</p>
                  <p className="text-muted-foreground leading-relaxed">{selectedVerse.translation}</p>
                </div>
              )}
              {selectedVerse.tafsir && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">التفسير</p>
                  <TafsirHtml html={selectedVerse.tafsir} className="leading-relaxed text-sm" />
                </div>
              )}
              {selectedVerse.audioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    play({
                      id: selectedVerse.verse_key,
                      url: selectedVerse.audioUrl!,
                      title: `الآية ${selectedVerse.verse_key}`,
                      subtitle: "مصحف مصور",
                      surahId: selectedVerse.chapter_id,
                      ayahNumber: selectedVerse.verse_number,
                    })
                  }
                >
                  <Play className="h-4 w-4" />
                  تشغيل
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function MushafPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6 text-center">جاري التحميل...</div>}>
      <MushafContent />
    </Suspense>
  );
}
