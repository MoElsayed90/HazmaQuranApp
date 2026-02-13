"use client";

import { useState } from "react";
import { Copy, Share2, BookmarkPlus, BookmarkCheck, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBookmarkStore } from "@/lib/stores/use-bookmarks";
import { useSettingsStore } from "@/lib/stores/use-settings";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Ayah } from "@/lib/api/types";

interface AyahRowProps {
  ayah: Ayah;
  surahId: number;
  surahName: string;
  isHighlighted?: boolean;
  audioUrl?: string;
}

export function AyahRow({
  ayah,
  surahId,
  surahName,
  isHighlighted = false,
  audioUrl,
}: AyahRowProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  const showTranslation = useSettingsStore((s) => s.showTranslation);
  const bookmarked = isBookmarked(surahId, ayah.number);
  const { play, isTrackPlaying } = useAudioPlayerContext();
  const trackId = `${surahId}-${ayah.number}`;
  const playing = isTrackPlaying(trackId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ayah.text);
      toast.success("تم نسخ الآية");
    } catch {
      toast.error("فشل النسخ");
    }
    setActionsOpen(false);
  };

  const handleShare = async () => {
    const text = `${ayah.text}\n\n- سورة ${surahName}، الآية ${ayah.number}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("تم نسخ الآية للمشاركة");
    }
    setActionsOpen(false);
  };

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(surahId, ayah.number);
      toast("تم إزالة الإشارة المرجعية");
    } else {
      addBookmark({
        surahId,
        surahName,
        ayahNumber: ayah.number,
        ayahText: ayah.text.slice(0, 100),
      });
      toast.success("تم حفظ الإشارة المرجعية");
    }
    setActionsOpen(false);
  };

  const handlePlay = () => {
    if (audioUrl) {
      play({
        id: trackId,
        url: audioUrl,
        title: `الآية ${ayah.number}`,
        subtitle: surahName,
        surahId,
        ayahNumber: ayah.number,
      });
    }
  };

  return (
    <Popover open={actionsOpen} onOpenChange={setActionsOpen}>
      <PopoverTrigger asChild>
        <div
          id={`ayah-${ayah.number}`}
          className={cn(
            "group relative py-4 px-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-muted/50",
            isHighlighted && "bg-primary/[0.06] ayah-highlight"
          )}
        >
          <div className="flex gap-3 items-start">
            {/* Verse number */}
            <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {ayah.number}
                </span>
              </div>
              {audioUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay();
                  }}
                >
                  {playing ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>

            {/* Ayah text */}
            <div className="flex-1 min-w-0">
              <p className="quran-text leading-loose">
                {ayah.text}
              </p>
              {showTranslation && ayah.translation && (
                <p
                  className="text-muted-foreground mt-3 leading-relaxed"
                  style={{ fontSize: "var(--translation-font-size, 0.95rem)" }}
                >
                  {ayah.translation}
                </p>
              )}
            </div>

            {/* Bookmark indicator */}
            {bookmarked && (
              <BookmarkCheck className="h-4 w-4 text-primary shrink-0 mt-2" />
            )}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-2" align="center">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", bookmarked && "text-primary")}
            onClick={handleBookmark}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <BookmarkPlus className="h-4 w-4" />
            )}
          </Button>
          {audioUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
                setActionsOpen(false);
              }}
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
