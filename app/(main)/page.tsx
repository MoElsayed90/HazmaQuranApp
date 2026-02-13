import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { FEATURED_SURAH_IDS, FEATURED_RECITER_IDS } from "@/lib/constants";
import { HeroSection } from "./components/HeroSection";
import { ContinueSection } from "./components/ContinueSection";
import { FeaturedSurahs } from "./components/FeaturedSurahs";
import { FeaturedReciters } from "./components/FeaturedReciters";

export default async function HomePage() {
  const provider = getQuranProvider();

  // Fetch data in parallel
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
    <div className="space-y-12">
      <HeroSection />
      <div className="container mx-auto px-4 space-y-12 pb-10">
        <ContinueSection />
        <FeaturedSurahs surahs={featuredSurahs} />
        {featuredReciters.length > 0 && (
          <FeaturedReciters reciters={featuredReciters} />
        )}
      </div>
    </div>
  );
}
