"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useSurah } from "@/lib/queries/hooks";
import { TeacherMushafSurahClient } from "./components/TeacherMushafSurahClient";
import { Skeleton } from "@/components/ui/skeleton";

export function TeacherMushafPageClient() {
  const params = useParams();
  const surahId = useMemo(() => Number(params?.surahId), [params?.surahId]);

  const { data, isLoading, isError, error } = useSurah(surahId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-6 text-destructive text-center">
        {error?.message ?? "فشل تحميل السورة"}
      </div>
    );
  }

  return (
    <TeacherMushafSurahClient surah={data.surah} ayahs={data.ayahs} />
  );
}
