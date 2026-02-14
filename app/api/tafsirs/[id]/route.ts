import { NextRequest, NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { QuranFoundationProvider } from "@/lib/api/providers/quran-foundation";

export const dynamic = "force-dynamic";

/**
 * GET /api/tafsirs/[id]?chapter_number=
 * Returns tafsir entries for a chapter (verse_number + text per verse).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tafsirId = parseInt(id, 10);
    if (Number.isNaN(tafsirId) || tafsirId < 1) {
      return NextResponse.json(
        { error: "Invalid tafsir id" },
        { status: 400 }
      );
    }

    const url = new URL(_req.url || "", "http://localhost");
    const chapterParam = url.searchParams.get("chapter_number");
    const chapterNumber = chapterParam ? parseInt(chapterParam, 10) : 0;
    if (Number.isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) {
      return NextResponse.json(
        { error: "Invalid or missing chapter_number (1-114)" },
        { status: 400 }
      );
    }

    const provider = getQuranProvider();
    if (
      !("getTafsirForChapter" in provider) ||
      typeof (provider as QuranFoundationProvider).getTafsirForChapter !== "function"
    ) {
      return NextResponse.json(
        { tafsir: [] },
        { headers: { "Cache-Control": "private, max-age=300" } }
      );
    }

    const tafsir = await (provider as QuranFoundationProvider).getTafsirForChapter(
      tafsirId,
      chapterNumber
    );

    return NextResponse.json(
      { tafsir },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (e) {
    console.error("[api/tafsirs/[id]]", e);
    return NextResponse.json(
      { error: "Failed to fetch tafsir" },
      { status: 500 }
    );
  }
}
