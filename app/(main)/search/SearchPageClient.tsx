"use client";

import { useSearchParams } from "next/navigation";
import { useSurahs, useReciters } from "@/lib/queries/hooks";
import { SearchClient } from "./SearchClient";
import { Skeleton } from "@/components/ui/skeleton";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const { data: surahs, isLoading: surahsLoading } = useSurahs();
  const { data: reciters, isLoading: recitersLoading } = useReciters();

  const isLoading = surahsLoading || recitersLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-12 w-full max-w-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <SearchClient
        surahs={surahs ?? []}
        reciters={reciters ?? []}
        initialQuery={initialQuery}
      />
    </div>
  );
}
