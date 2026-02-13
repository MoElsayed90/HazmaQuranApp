"use client";

import Link from "next/link";
import { Bookmark, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useBookmarkStore } from "@/lib/stores/use-bookmarks";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export function BookmarksClient() {
  const { bookmarks, removeBookmark, clearAll } = useBookmarkStore();

  // Group by surah
  const grouped = useMemo(() => {
    const map = new Map<number, typeof bookmarks>();
    for (const b of bookmarks) {
      const existing = map.get(b.surahId) || [];
      existing.push(b);
      map.set(b.surahId, existing);
    }
    return Array.from(map.entries()).map(([surahId, items]) => ({
      surahId,
      surahName: items[0].surahName,
      items: items.sort((a, b) => a.ayahNumber - b.ayahNumber),
    }));
  }, [bookmarks]);

  const handleClearAll = () => {
    clearAll();
    toast.success("تم حذف جميع الإشارات المرجعية");
  };

  if (bookmarks.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">المحفوظات</h1>
        <EmptyState
          icon={<Bookmark className="h-8 w-8 text-muted-foreground" />}
          title="لا توجد إشارات مرجعية"
          message="اضغط على أي آية لإضافتها إلى المحفوظات"
          actionLabel="تصفح السور"
          actionHref="/surahs"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المحفوظات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bookmarks.length} إشارة مرجعية
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={handleClearAll}
        >
          <Trash2 className="h-3.5 w-3.5" />
          حذف الكل
        </Button>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {grouped.map((group) => (
            <motion.div
              key={group.surahId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-base font-semibold mb-3">
                سورة {group.surahName}
              </h2>
              <div className="space-y-2">
                {group.items.map((bookmark) => (
                  <motion.div
                    key={`${bookmark.surahId}-${bookmark.ayahNumber}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className="group">
                      <CardContent className="flex items-center gap-3 p-3">
                        <Link
                          href={`/surahs/${bookmark.surahId}?ayah=${bookmark.ayahNumber}`}
                          className="flex-1 min-w-0 flex items-center gap-3"
                        >
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {bookmark.ayahNumber}
                            </span>
                          </div>
                          <p className="text-sm truncate font-quran">
                            {bookmark.ayahText}...
                          </p>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            removeBookmark(
                              bookmark.surahId,
                              bookmark.ayahNumber
                            );
                            toast("تم إزالة الإشارة المرجعية");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
