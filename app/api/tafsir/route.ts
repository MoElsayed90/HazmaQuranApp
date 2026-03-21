import { NextRequest, NextResponse } from "next/server";

/**
 * Stub: returns placeholder until a tafsir source is wired.
 * GET /api/tafsir?verseKey=2:255
 */
export async function GET(request: NextRequest) {
  const verseKey = request.nextUrl.searchParams.get("verseKey");
  if (!verseKey || !/^\d+:\d+$/.test(verseKey)) {
    return NextResponse.json(
      { error: "Missing or invalid verseKey (e.g. 2:255)" },
      { status: 400 }
    );
  }
  return NextResponse.json({
    verseKey,
    tafsir: null,
    source: null,
  });
}
