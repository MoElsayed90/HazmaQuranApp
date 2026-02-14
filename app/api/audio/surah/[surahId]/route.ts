import { NextRequest, NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { QuranFoundationProvider } from "@/lib/api/providers/quran-foundation";

export const dynamic = "force-dynamic";

/**
 * GET /api/audio/surah/[surahId]?recitationId=
 * Returns { urls: Record<number, string> } mapping numberInQuran -> audio URL.
 * Uses Quran.Foundation when the provider supports getAyahAudioUrls.
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
    if (!("getAyahAudioUrls" in provider) || typeof (provider as QuranFoundationProvider).getAyahAudioUrls !== "function") {
      return NextResponse.json(
        { urls: {} },
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

    const urls = await (provider as QuranFoundationProvider).getAyahAudioUrls(
      surahIdNum,
      recitationId
    );

    return NextResponse.json(
      { urls },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (e) {
    console.error("[api/audio/surah]", e);
    return NextResponse.json(
      { error: "Failed to fetch ayah audio URLs" },
      { status: 500 }
    );
  }
}
