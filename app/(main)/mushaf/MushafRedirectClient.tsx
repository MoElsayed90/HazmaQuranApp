"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const MUSHAF_LAST_PAGE_KEY = "mushaf-last-page";

export function MushafRedirectClient() {
  const router = useRouter();

  useEffect(() => {
    try {
      const last = localStorage.getItem(MUSHAF_LAST_PAGE_KEY);
      const page = last ? Math.min(604, Math.max(1, Number(last) || 1)) : 1;
      router.replace(`/mushaf/${page}`);
    } catch {
      router.replace("/mushaf/1");
    }
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="mx-auto h-10 w-48" />
      <Skeleton className="mx-auto mt-6 h-96 w-full max-w-2xl" />
    </div>
  );
}
