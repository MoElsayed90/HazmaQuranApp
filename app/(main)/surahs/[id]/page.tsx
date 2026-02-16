import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { SurahReaderPageClient } from "./SurahReaderPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ayah?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const provider = getQuranProvider();
  try {
    const { surah } = await provider.getSurah(Number(id));
    return {
      title: `سورة ${surah.name}`,
      description: `اقرأ واستمع إلى سورة ${surah.name} - ${surah.englishName}`,
    };
  } catch {
    return { title: "سورة" };
  }
}

export default async function SurahPage({ params }: PageProps) {
  const { id } = await params;
  const surahId = Number(id);

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  return <SurahReaderPageClient />;
}
