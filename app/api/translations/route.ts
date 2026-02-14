import { NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { QuranFoundationProvider } from "@/lib/api/providers/quran-foundation";

export const dynamic = "force-dynamic";

/**
 * GET /api/translations
 * Returns list of available translations for the settings selector.
 */
export async function GET() {
  try {
    const provider = getQuranProvider();
    if (!("getTranslationsList" in provider) || typeof (provider as QuranFoundationProvider).getTranslationsList !== "function") {
      return NextResponse.json(
        { translations: [] },
        { headers: { "Cache-Control": "private, max-age=3600" } }
      );
    }
    const translations = await (provider as QuranFoundationProvider).getTranslationsList();
    return NextResponse.json(
      { translations },
      { headers: { "Cache-Control": "private, max-age=3600" } }
    );
  } catch (e) {
    console.error("[api/translations]", e);
    return NextResponse.json(
      { translations: [] },
      { status: 500 }
    );
  }
}
