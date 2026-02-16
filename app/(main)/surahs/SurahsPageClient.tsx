"use client";

import { useSurahs } from "@/lib/queries/hooks";
import { SurahListClient } from "./components/SurahListClient";
import { SurahListSkeleton } from "./components/SurahListSkeleton";

export function SurahsPageClient() {
  const { data: surahs, isLoading, isError, error } = useSurahs();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <SurahListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6 text-destructive text-center">
        {error?.message ?? "فشل تحميل السور"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <SurahListClient surahs={surahs ?? []} />
    </div>
  );
}
