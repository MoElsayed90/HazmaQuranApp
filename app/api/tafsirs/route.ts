import { NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { QuranFoundationProvider } from "@/lib/api/providers/quran-foundation";

export const dynamic = "force-dynamic";

/**
 * GET /api/tafsirs
 * Returns list of available tafsirs for the UI.
 */
export async function GET() {
  try {
    const provider = getQuranProvider();
    if (
      !("getTafsirsList" in provider) ||
      typeof (provider as QuranFoundationProvider).getTafsirsList !== "function"
    ) {
      return NextResponse.json(
        { tafsirs: [] },
        { headers: { "Cache-Control": "private, max-age=3600" } }
      );
    }
    const tafsirs = await (provider as QuranFoundationProvider).getTafsirsList();
    return NextResponse.json(
      { tafsirs },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (e) {
    console.error("[api/tafsirs]", e);
    return NextResponse.json(
      { tafsirs: [] },
      { status: 500 }
    );
  }
}
