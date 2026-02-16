"use client";

import { useMemo } from "react";
import { useSurahs, useReciters } from "@/lib/queries/hooks";
import { FEATURED_SURAH_IDS, FEATURED_RECITER_IDS } from "@/lib/constants";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ContinueSection } from "./components/ContinueSection";
import { FeaturedSurahs } from "./components/FeaturedSurahs";
import { FeaturedReciters } from "./components/FeaturedReciters";

export function HomePageClient() {
  const { data: surahs = [] } = useSurahs();
  const { data: reciters = [] } = useReciters();

  const featuredSurahs = useMemo(
    () => surahs.filter((s) => FEATURED_SURAH_IDS.includes(s.id)),
    [surahs]
  );
  const featuredReciters = useMemo(
    () => reciters.filter((r) => FEATURED_RECITER_IDS.includes(r.id)),
    [reciters]
  );

  return (
    <div className="relative min-h-screen space-y-0">
      <HeroSection surahs={surahs} reciters={reciters} />
      <AboutSection />
      <div className="container mx-auto px-4 space-y-14 py-14">
        <ContinueSection />
        <FeaturedSurahs surahs={featuredSurahs} />
        {featuredReciters.length > 0 && (
          <FeaturedReciters reciters={featuredReciters} />
        )}
      </div>
    </div>
  );
}
