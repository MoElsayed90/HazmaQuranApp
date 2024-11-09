import FamousReciters from "@/components/FamousReciters";
import HeroSection from "@/components/HeroSection";
export default function Home() {
  return (
<>
<main className="space-y-6">
<section>
<HeroSection/>
</section>
<section>
  <FamousReciters/>
</section>
</main>
</>
  );
}
