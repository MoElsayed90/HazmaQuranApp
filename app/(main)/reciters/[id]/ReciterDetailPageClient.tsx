"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useReciterDetail } from "@/lib/queries/hooks";
import { ReciterDetailClient } from "./components/ReciterDetailClient";
import { ReciterDetailSkeleton } from "./components/ReciterDetailSkeleton";

export function ReciterDetailPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reciterId = Number(params?.id);
  const recitationIds = useMemo(
    () =>
      searchParams
        .get("recitations")
        ?.split(",")
        .map(Number)
        .filter(Boolean) ?? [],
    [searchParams]
  );

  const { data, isLoading, isError, error } = useReciterDetail(
    reciterId,
    recitationIds
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ReciterDetailSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6 text-destructive text-center">
        {error?.message ?? "فشل تحميل تفاصيل القارئ"}
      </div>
    );
  }

  const { reciter, recitations } = data ?? { reciter: null, recitations: [] };

  return (
    <div className="container mx-auto px-4 py-6">
      <ReciterDetailClient
        reciterName={reciter?.name ?? "قارئ"}
        reciterImage={reciter?.imageUrl}
        recitations={recitations}
      />
    </div>
  );
}
