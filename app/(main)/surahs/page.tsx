import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { SurahListClient } from "./components/SurahListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "السور",
  description: "تصفح جميع سور القرآن الكريم الـ 114",
};

export default async function SurahsPage() {
  const provider = getQuranProvider();
  const surahs = await provider.getSurahs();

  return (
    <div className="container mx-auto px-4 py-6">
      <SurahListClient surahs={surahs} />
    </div>
  );
}
