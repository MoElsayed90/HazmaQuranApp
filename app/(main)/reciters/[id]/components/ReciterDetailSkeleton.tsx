"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ReciterDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="text-center sm:text-right space-y-2">
          <Skeleton className="h-7 w-32 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
