"use client";

import Link from "next/link";
import Image from "next/image";
import type { Reciter } from "@/lib/api/types";
import { motion } from "framer-motion";

interface ReciterCardProps {
  reciter: Reciter;
  index?: number;
}

export function ReciterCard({ reciter, index = 0 }: ReciterCardProps) {
  const query = reciter.recitationIds?.length
    ? `?recitations=${reciter.recitationIds.join(",")}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/reciters/${reciter.id}${query}`}>
        <div className="group rounded-xl border bg-card overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 outline-none">
          {/* Image or avatar placeholder */}
          <div className="relative h-48 bg-muted overflow-hidden flex items-center justify-center">
            {reciter.imageUrl ? (
              <Image
                src={reciter.imageUrl}
                alt={reciter.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <span className="text-2xl font-bold text-primary/80" aria-hidden>
                  {reciter.name?.charAt(0) ?? "?"}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 text-center">
            <h3 className="font-semibold text-sm truncate px-1">{reciter.name}</h3>
            {reciter.recitationCount != null && reciter.recitationCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {reciter.recitationCount} تلاوة
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
