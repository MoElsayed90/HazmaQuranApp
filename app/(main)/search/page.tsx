import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { SearchClient } from "./SearchClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بحث — سور وقراء",
  description: "ابحث عن سورة أو قارئ في تطبيق حمزة",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const provider = getQuranProvider();
  const [surahs, reciters] = await Promise.all([
    provider.getSurahs(),
    provider.getReciters().catch(() => []),
  ]);
  return (
    <div className="container mx-auto px-4 py-6">
      <SearchClient
        surahs={surahs}
        reciters={reciters}
        initialQuery={q ?? ""}
      />
    </div>
  );
}
