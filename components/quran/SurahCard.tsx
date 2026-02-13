"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Surah } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SurahCardProps {
  surah: Surah;
  index?: number;
}

export function SurahCard({ surah, index = 0 }: SurahCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link href={`/surahs/${surah.id}`}>
        <div className="group rounded-lg border bg-card p-4 hover:bg-accent/50 hover:border-primary/20 transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-4">
            {/* Surah number */}
            <div className="relative h-10 w-10 shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-sm font-semibold text-primary">
                  {surah.id}
                </span>
              </div>
            </div>

            {/* Surah info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{surah.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {surah.englishName} - {surah.englishNameTranslation}
              </p>
            </div>

            {/* Meta */}
            <div className="text-left shrink-0 flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">
                {surah.numberOfAyahs} آية
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  surah.revelationType === "Meccan"
                    ? "border-accent text-accent-foreground"
                    : "border-primary text-primary"
                )}
              >
                {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
