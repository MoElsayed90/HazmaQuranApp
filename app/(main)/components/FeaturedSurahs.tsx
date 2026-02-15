"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurahCard } from "@/components/quran/SurahCard";
import type { Surah } from "@/lib/api/types";

interface FeaturedSurahsProps {
  surahs: Surah[];
}

export function FeaturedSurahs({ surahs }: FeaturedSurahsProps) {
  if (surahs.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">سور مميزة</h2>
        <Link href="/surahs">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            عرض الكل
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {surahs.map((surah, i) => (
          <SurahCard key={surah.id} surah={surah} index={i} />
        ))}
      </div>
    </section>
  );
}
