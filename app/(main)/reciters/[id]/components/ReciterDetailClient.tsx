"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Download, Mic2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SearchInput } from "@/components/quran/SearchInput";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import type { Recitation } from "@/lib/api/types";
import { getSurahIdFromArabicTitle, getSurahDisplayName } from "@/lib/constants";
import { downloadAudioFile } from "@/lib/download-audio";
import { cn } from "@/lib/utils";

interface ReciterDetailClientProps {
  reciterName: string;
  reciterImage?: string;
  recitations: Recitation[];
}

export function ReciterDetailClient({
  reciterName,
  reciterImage,
  recitations,
}: ReciterDetailClientProps) {
  const recitationsWithClips = recitations.filter((r) => r.attachments.length > 0);
  const [imageError, setImageError] = useState(false);
  const [searchSurah, setSearchSurah] = useState("");
  const [selectedRecitationId, setSelectedRecitationId] = useState<number | null>(
    recitationsWithClips[0]?.id ?? null
  );
  const showImage = Boolean(reciterImage && !imageError);
  const { toggle, isTrackPlaying, currentTrack, progress, playQueue } =
    useAudioPlayerContext();

  const selectedRecitation =
    recitationsWithClips.find((r) => r.id === selectedRecitationId) ?? recitationsWithClips[0];

  const filteredAttachments = useMemo(() => {
    if (!selectedRecitation) return [];
    const q = searchSurah.trim().toLowerCase();
    if (!q) return selectedRecitation.attachments;
    return selectedRecitation.attachments.filter((a) =>
      a.title.toLowerCase().includes(q)
    );
  }, [selectedRecitation, searchSurah]);

  const handlePlayAttachment = (
    attachment: { id: number; title: string; url: string },
    recitationTitle: string
  ) => {
    if (currentTrack?.id === attachment.id) {
      toggle();
      return;
    }
    if (!selectedRecitation) return;
    const tracks = selectedRecitation.attachments.map((a) => {
      const surahId = getSurahIdFromArabicTitle(a.title);
      const surahName = surahId != null ? getSurahDisplayName(surahId) : a.title;
      return {
        id: a.id,
        url: a.url,
        title: a.title,
        subtitle: `${reciterName} - ${recitationTitle}`,
        surahId: surahId ?? undefined,
        surahName,
        reciterName: `${reciterName} - ${recitationTitle}`,
      };
    });
    const index = selectedRecitation.attachments.findIndex((a) => a.id === attachment.id);
    if (index >= 0 && tracks.length > 0) {
      playQueue(tracks, index);
    }
  };

  const handlePlayAll = (recitation: Recitation) => {
    const tracks = recitation.attachments.map((a) => {
      const surahId = getSurahIdFromArabicTitle(a.title);
      const surahName = surahId != null ? getSurahDisplayName(surahId) : a.title;
      return {
        id: a.id,
        url: a.url,
        title: a.title,
        subtitle: `${reciterName} - ${recitation.title}`,
        surahId: surahId ?? undefined,
        surahName,
        reciterName: `${reciterName} - ${recitation.title}`,
      };
    });
    if (tracks.length > 0) {
      playQueue(tracks);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reciter header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative h-32 w-32 rounded-2xl overflow-hidden bg-muted shrink-0">
          {showImage ? (
            <Image
              src={reciterImage!}
              alt={reciterName}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Mic2 className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="text-center sm:text-right flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{reciterName}</h1>
          <p className="text-muted-foreground mt-1">
            {recitationsWithClips.length} تلاوة متاحة
          </p>
          {/* عرض أسماء القراءات (مصحف كذا و مصحف كذا) بشكل مختصر */}
          {recitationsWithClips.length > 0 && (
            <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2 max-w-xl">
              {recitationsWithClips.map((r) => r.title).join(" — ")}
            </p>
          )}
        </div>
      </div>

      {/* القراءات المتاحة — مصحف كذا و مصحف كذا داخل كل شيخ */}
      {recitationsWithClips.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد تلاوات متاحة
        </div>
      ) : (
        <div className="space-y-4 min-w-0">
          <h2 className="text-lg font-semibold text-foreground break-words min-w-0">القراءات المتاحة</h2>
          {/* تلاوات جنب بعض — الضغط يفتح السور بداخلها */}
          <div className="flex flex-wrap gap-3">
            {recitationsWithClips.map((recitation) => (
              <Button
                key={recitation.id}
                variant={selectedRecitationId === recitation.id ? "default" : "outline"}
                size="default"
                className="min-w-0 h-auto py-2.5 px-4 text-sm whitespace-normal text-right"
                onClick={() => setSelectedRecitationId(recitation.id)}
                title={recitation.title}
              >
                <span className="block text-right w-full min-w-0 text-sm font-bold break-words whitespace-normal">
                  {recitation.title}
                </span>
                <span
                  className={cn(
                    "mr-1.5 text-sm font-bold shrink-0",
                    selectedRecitationId === recitation.id
                      ? "text-primary-foreground/95"
                      : "text-foreground/90"
                  )}
                >
                  ({recitation.attachments.length})
                </span>
              </Button>
            ))}
          </div>

          {/* السور للتلاوة المختارة فقط — شبكة RTL + بحث */}
          {selectedRecitation && (
            <Card className="overflow-hidden">
              <CardHeader className="sticky top-0 z-10 border-b bg-card pb-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base truncate">{selectedRecitation.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={() => handlePlayAll(selectedRecitation)}
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
                  {filteredAttachments.length} مقطع
                  {searchSurah.trim() && filteredAttachments.length !== selectedRecitation.attachments.length && (
                    <span className="text-muted-foreground/80"> (مصفى)</span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  dir="rtl"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 p-2 sm:p-3"
                >
                    {filteredAttachments.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                        {searchSurah.trim() ? "لا توجد سورة تطابق البحث" : "لا توجد مقاطع"}
                      </div>
                    ) : (
                      filteredAttachments.map((attachment, index) => {
                        const playing = isTrackPlaying(attachment.id);
                        const isCurrentTrack = currentTrack?.id === attachment.id;
                        const originalIndex = selectedRecitation.attachments.findIndex(
                          (a) => a.id === attachment.id
                        );
                        return (
                          <div
                            key={attachment.id}
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
                                {(originalIndex >= 0 ? originalIndex : index) + 1}
                              </span>
                              <div className="flex-1 min-w-0 text-right">
                                <p className="text-sm font-medium truncate">
                                  {attachment.title}
                                </p>
                                <p className="text-xs text-foreground/75 mt-0.5">
                                  {attachment.size}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() =>
                                  handlePlayAttachment(
                                    attachment,
                                    selectedRecitation.title
                                  )
                                }
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
                                aria-label="تحميل"
                                onClick={async () => {
                                  const toastId = "download-audio";
                                  toast.loading("جاري التحميل... الملفات الكبيرة (سور طويلة) تحتاج وقتاً لبدء التحميل، انتظر قليلاً.", { id: toastId });
                                  try {
                                    const safeName = (attachment.title || "recitation")
                                      .replace(/[/\\?%*:|"<>]/g, "-")
                                      .trim() || "recitation";
                                    await downloadAudioFile(attachment.url, safeName);
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
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
