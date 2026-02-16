import { NextRequest, NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";

const DEFAULT_TRANSLATION = "ar.muyassar";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const surahId = Number(id);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return NextResponse.json({ error: "Invalid surah id" }, { status: 400 });
  }

  const translation = request.nextUrl.searchParams.get("translation") ?? DEFAULT_TRANSLATION;

  try {
    const provider = getQuranProvider();
    const [surahDetail, surahWithTranslation] = await Promise.all([
      provider.getSurah(surahId),
      provider.getSurahWithTranslation(surahId, translation).catch(() => null),
    ]);

    const ayahs = surahDetail.ayahs.map((a, i) => ({
      ...a,
      translation: surahWithTranslation?.ayahs[i]?.translation,
    }));

    return NextResponse.json({
      surah: surahDetail.surah,
      ayahs,
    });
  } catch (error) {
    console.error("[API] surah:", error);
    return NextResponse.json(
      { error: "Failed to fetch surah" },
      { status: 500 }
    );
  }
}
