import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { SurahReaderClient } from "./components/SurahReaderClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ayah?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

export default async function SurahPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { ayah } = await searchParams;
  const surahId = Number(id);

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  const provider = getQuranProvider();

  try {
    const [surahDetail, surahWithTranslation] = await Promise.all([
      provider.getSurah(surahId),
      provider
        .getSurahWithTranslation(surahId, "ar.muyassar")
        .catch(() => null),
    ]);

    // Merge translations into ayahs
    const ayahs = surahDetail.ayahs.map((a, i) => ({
      ...a,
      translation: surahWithTranslation?.ayahs[i]?.translation,
    }));

    return (
      <SurahReaderClient
        surah={surahDetail.surah}
        ayahs={ayahs}
        initialAyah={ayah ? Number(ayah) : undefined}
      />
    );
  } catch {
    notFound();
  }
}
