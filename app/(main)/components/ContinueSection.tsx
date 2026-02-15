"use client";

import Link from "next/link";
import { BookOpen, Headphones, ChevronLeft, Bookmark, Mic2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAudioStateStore } from "@/lib/stores/use-audio-state";
import { motion } from "framer-motion";

export function ContinueSection() {
  const lastRead = useAudioStateStore((s) => s.lastRead);
  const lastAudio = useAudioStateStore((s) => s.lastAudio);
  const hasContinue = lastRead || lastAudio;

  return (
    <section className="space-y-5">
      <h2 className="text-xl md:text-2xl font-bold text-foreground">
        {hasContinue ? "أكمل من حيث توقفت" : "وصول سريع"}
      </h2>

      {hasContinue && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lastRead && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link href={`/surahs/${lastRead.surahId}?ayah=${lastRead.ayahNumber}`}>
                <Card className="group hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer h-full">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">أكمل القراءة</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastRead.surahName} - الآية {lastRead.ayahNumber}
                      </p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}

          {lastAudio && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link href={`/surahs/${lastAudio.surahId}${lastAudio.ayahNumber ? `?ayah=${lastAudio.ayahNumber}` : ""}`}>
                <Card className="group hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer h-full">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Headphones className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">أكمل الاستماع</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastAudio.surahName} - {lastAudio.reciterName}
                      </p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/surahs">
          <Button variant="secondary" size="sm" className="rounded-full gap-2 min-h-[2.75rem]">
            <BookOpen className="h-4 w-4" />
            السور
          </Button>
        </Link>
        <Link href="/bookmarks">
          <Button variant="secondary" size="sm" className="rounded-full gap-2 min-h-[2.75rem]">
            <Bookmark className="h-4 w-4" />
            المحفوظات
          </Button>
        </Link>
        <Link href="/reciters">
          <Button variant="secondary" size="sm" className="rounded-full gap-2 min-h-[2.75rem]">
            <Mic2 className="h-4 w-4" />
            القراء
          </Button>
        </Link>
        {lastAudio && (
          <Link href={`/surahs/${lastAudio.surahId}${lastAudio.ayahNumber ? `?ayah=${lastAudio.ayahNumber}` : ""}`}>
            <Button variant="outline" size="sm" className="rounded-full gap-2 min-h-[2.75rem]">
              <Headphones className="h-4 w-4" />
              آخر استماع
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}
