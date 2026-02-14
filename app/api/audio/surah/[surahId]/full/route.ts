import { NextRequest, NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { QuranFoundationProvider } from "@/lib/api/providers/quran-foundation";

export const dynamic = "force-dynamic";

/**
 * GET /api/audio/surah/[surahId]/full?recitationId=
 * Returns { audioUrl, segments } for full-chapter playback with verse-level timestamps.
 * Used for "play full surah" with sync highlighting.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ surahId: string }> }
) {
  try {
    const { surahId } = await params;
    const surahIdNum = parseInt(surahId, 10);
    if (Number.isNaN(surahIdNum) || surahIdNum < 1 || surahIdNum > 114) {
      return NextResponse.json(
        { error: "Invalid surah id" },
        { status: 400 }
      );
    }

    const provider = getQuranProvider();
    if (
      !("getChapterAudioWithSegments" in provider) ||
      typeof (provider as QuranFoundationProvider).getChapterAudioWithSegments !== "function"
    ) {
      return NextResponse.json(
        { audioUrl: null, segments: [] },
        { headers: { "Cache-Control": "private, max-age=300" } }
      );
    }

    const url = new URL(_req.url || "", "http://localhost");
    const recitationIdParam = url.searchParams.get("recitationId");
    const recitationId = recitationIdParam ? parseInt(recitationIdParam, 10) : 1;
    if (Number.isNaN(recitationId) || recitationId < 1) {
      return NextResponse.json(
        { error: "Invalid or missing recitationId" },
        { status: 400 }
      );
    }

    const result = await (
      provider as QuranFoundationProvider
    ).getChapterAudioWithSegments(surahIdNum, recitationId);

    if (!result) {
      return NextResponse.json(
        { audioUrl: null, segments: [] },
        { headers: { "Cache-Control": "private, max-age=300" } }
      );
    }

    return NextResponse.json(
      { audioUrl: result.audioUrl, segments: result.segments },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (e) {
    console.error("[api/audio/surah/.../full]", e);
    return NextResponse.json(
      { error: "Failed to fetch chapter audio with segments" },
      { status: 500 }
    );
  }
}
