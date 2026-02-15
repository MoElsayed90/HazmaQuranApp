"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReciterCard } from "@/components/quran/ReciterCard";
import type { Reciter } from "@/lib/api/types";

interface FeaturedRecitersProps {
  reciters: Reciter[];
}

export function FeaturedReciters({ reciters }: FeaturedRecitersProps) {
  if (reciters.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">أشهر القراء</h2>
        <Link href="/reciters">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            عرض الكل
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {reciters.map((reciter, i) => (
          <ReciterCard key={reciter.id} reciter={reciter} index={i} />
        ))}
      </div>
    </section>
  );
}
