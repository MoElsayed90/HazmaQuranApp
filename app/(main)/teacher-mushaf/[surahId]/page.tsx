import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { TeacherMushafSurahClient } from "./components/TeacherMushafSurahClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ surahId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { surahId } = await params;
  const provider = getQuranProvider();
  try {
    const { surah } = await provider.getSurah(Number(surahId));
    return {
      title: `المصحف المعلم - ${surah.name} | حمزة`,
      description: `سورة ${surah.name} للشيخ محمود خليل الحصري — عرض الآيات للحفظ`,
    };
  } catch {
    return { title: "المصحف المعلم | حمزة" };
  }
}

export default async function TeacherMushafSurahPage({ params }: PageProps) {
  const { surahId } = await params;
  const id = Number(surahId);

  if (isNaN(id) || id < 1 || id > 114) {
    notFound();
  }

  const provider = getQuranProvider();

  try {
    const { surah, ayahs } = await provider.getSurah(id);
    return (
      <TeacherMushafSurahClient
        surah={surah}
        ayahs={ayahs}
      />
    );
  } catch {
    notFound();
  }
}
