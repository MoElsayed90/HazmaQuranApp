import { NextRequest, NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { QuranFoundationProvider } from "@/lib/api/providers/quran-foundation";

export const dynamic = "force-dynamic";

const DEFAULT_TRANSLATION_ID = 131;
const DEFAULT_TAFSIR_ID = 169;
const DEFAULT_AUDIO_ID = 7;

/**
 * GET /api/mushaf/page/[pageNumber]?translationId=&tafsirId=&audioId=
 * Returns mushaf page with image and verse keys.
 * When translationId, tafsirId, or audioId are provided, returns full verse data (translation, tafsir, audio) in one response.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pageNumber: string }> }
) {
  try {
    const { pageNumber } = await params;
    const page = parseInt(pageNumber, 10);
    if (Number.isNaN(page) || page < 1 || page > 604) {
      return NextResponse.json(
        { error: "Invalid page_number (1-604)" },
        { status: 400 }
      );
    }

    const url = new URL(req.url || "", "http://localhost");
    const translationId = url.searchParams.get("translationId")
      ? parseInt(url.searchParams.get("translationId")!, 10)
      : DEFAULT_TRANSLATION_ID;
    const tafsirId = url.searchParams.get("tafsirId")
      ? parseInt(url.searchParams.get("tafsirId")!, 10)
      : DEFAULT_TAFSIR_ID;
    const audioId = url.searchParams.get("audioId")
      ? parseInt(url.searchParams.get("audioId")!, 10)
      : DEFAULT_AUDIO_ID;
    const full = url.searchParams.get("full") === "true" || url.searchParams.has("translationId") || url.searchParams.has("tafsirId") || url.searchParams.has("audioId");

    const provider = getQuranProvider();
    const qf = provider as QuranFoundationProvider;

    if (full && "getMushafPageFull" in qf && typeof qf.getMushafPageFull === "function") {
      const result = await qf.getMushafPageFull(page, {
        translationId: Number.isNaN(translationId) ? undefined : translationId,
        tafsirId: Number.isNaN(tafsirId) ? undefined : tafsirId,
        audioId: Number.isNaN(audioId) ? undefined : audioId,
      });
      return NextResponse.json(result, {
        headers: { "Cache-Control": "private, max-age=3600" },
      });
    }

    if (!("getMushafPage" in qf) || typeof qf.getMushafPage !== "function") {
      return NextResponse.json(
        { pageNumber: page, imageUrl: null, imageWidth: null, verseKeys: [], verses: [] },
        { headers: { "Cache-Control": "private, max-age=300" } }
      );
    }

    const result = await qf.getMushafPage(page);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, max-age=86400" },
    });
  } catch (e) {
    console.error("[api/mushaf/page]", e);
    return NextResponse.json(
      { error: "Failed to fetch mushaf page" },
      { status: 500 }
    );
  }
}
