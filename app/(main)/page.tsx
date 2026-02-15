import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { FEATURED_SURAH_IDS, FEATURED_RECITER_IDS } from "@/lib/constants";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ContinueSection } from "./components/ContinueSection";
import { FeaturedSurahs } from "./components/FeaturedSurahs";
import { FeaturedReciters } from "./components/FeaturedReciters";

export default async function HomePage() {
  const provider = getQuranProvider();

  const [surahs, reciters] = await Promise.all([
    provider.getSurahs(),
    provider.getReciters().catch(() => []),
  ]);

  const featuredSurahs = surahs.filter((s) =>
    FEATURED_SURAH_IDS.includes(s.id)
  );

  const featuredReciters = reciters.filter((r) =>
    FEATURED_RECITER_IDS.includes(r.id)
  );

  return (
    <div className="space-y-0">
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
