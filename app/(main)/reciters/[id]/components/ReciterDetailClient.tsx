"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Mic2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAudioPlayerContext } from "@/hooks/use-audio-player";
import type { Recitation } from "@/lib/api/types";
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
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(reciterImage && !imageError);
  const { play, isTrackPlaying, currentTrack, progress, playQueue } =
    useAudioPlayerContext();

  const handlePlayAttachment = (
    attachment: { id: number; title: string; url: string },
    recitationTitle: string
  ) => {
    play({
      id: attachment.id,
      url: attachment.url,
      title: attachment.title,
      subtitle: `${reciterName} - ${recitationTitle}`,
    });
  };

  const handlePlayAll = (recitation: Recitation) => {
    const tracks = recitation.attachments.map((a) => ({
      id: a.id,
      url: a.url,
      title: a.title,
      subtitle: `${reciterName} - ${recitation.title}`,
    }));
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
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-bold">{reciterName}</h1>
          <p className="text-muted-foreground mt-1">
            {recitations.length} تلاوة متاحة
          </p>
        </div>
      </div>

      {/* Recitations */}
      {recitations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد تلاوات متاحة
        </div>
      ) : (
        <div className="space-y-4">
          {recitations.map((recitation) => (
            <Card key={recitation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{recitation.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handlePlayAll(recitation)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    تشغيل الكل
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {recitation.attachments.length} مقطع
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-80">
                  <div className="space-y-1">
                    {recitation.attachments.map((attachment) => {
                      const playing = isTrackPlaying(attachment.id);
                      return (
                        <div
                          key={attachment.id}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                            playing
                              ? "bg-primary/5"
                              : "hover:bg-muted/50"
                          )}
                        >
                          {/* Play button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() =>
                              handlePlayAttachment(
                                attachment,
                                recitation.title
                              )
                            }
                          >
                            {playing ? (
                              <Pause className="h-4 w-4 text-primary" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">
                              {attachment.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.size}
                            </p>
                          </div>

                          {/* Progress */}
                          {playing && currentTrack?.id === attachment.id && (
                            <Progress
                              value={progress}
                              className="w-20 h-1.5"
                            />
                          )}

                          {/* Download */}
                          <a
                            href={attachment.url}
                            download
                            className="shrink-0"
                            aria-label="تحميل"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
