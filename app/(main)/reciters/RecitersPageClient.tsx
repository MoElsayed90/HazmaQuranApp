"use client";

import { useReciters } from "@/lib/queries/hooks";
import { RecitersListClient } from "./components/RecitersListClient";
import { RecitersListSkeleton } from "./components/RecitersListSkeleton";

export function RecitersPageClient() {
  const { data: reciters, isLoading, isError, error } = useReciters();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <RecitersListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6 text-destructive text-center">
        {error?.message ?? "فشل تحميل القراء"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <RecitersListClient reciters={reciters ?? []} />
    </div>
  );
}
