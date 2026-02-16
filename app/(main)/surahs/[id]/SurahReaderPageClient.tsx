"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useSurah } from "@/lib/queries/hooks";
import { SurahReaderClient } from "./components/SurahReaderClient";
import { SurahReaderSkeleton } from "./components/SurahReaderSkeleton";

export function SurahReaderPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const surahId = useMemo(() => Number(params?.id), [params?.id]);
  const initialAyah = useMemo(() => {
    const ayah = searchParams.get("ayah");
    return ayah ? Number(ayah) : undefined;
  }, [searchParams]);

  const { data, isLoading, isError, error } = useSurah(surahId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <SurahReaderSkeleton />
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
    <SurahReaderClient
      surah={data.surah}
      ayahs={data.ayahs}
      initialAyah={initialAyah}
    />
  );
}
