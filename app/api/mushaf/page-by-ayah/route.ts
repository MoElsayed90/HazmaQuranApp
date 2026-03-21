import { NextRequest, NextResponse } from "next/server";
import { qfFetchJson } from "@/lib/qf/client";

const AYAH_KEY_REGEX = /^\d+:\d+$/;

interface QFVerse {
  verse_key: string;
  verse_number: number;
  page_number: number;
}

interface QFVersesResponse {
  verses?: QFVerse[];
}

export async function GET(request: NextRequest) {
  const ayahKey = request.nextUrl.searchParams.get("ayahKey");
  if (!ayahKey || !AYAH_KEY_REGEX.test(ayahKey)) {
    return NextResponse.json(
      { error: "Invalid ayahKey. Use format chapter:verse (e.g. 2:255)" },
      { status: 400 }
    );
  }

  const [chapterStr, verseStr] = ayahKey.split(":");
  const chapter = Number(chapterStr);
  const verseNum = Number(verseStr);

  if (chapter < 1 || chapter > 114 || verseNum < 1) {
    return NextResponse.json({ error: "Invalid chapter or verse number" }, { status: 400 });
  }

  try {
    // Verses by chapter returns max 50 per page; calculate which page contains our verse
    const perPage = 50;
    const page = Math.ceil(verseNum / perPage);

    const data = await qfFetchJson<QFVersesResponse>(
      `/verses/by_chapter/${chapter}?per_page=${perPage}&page=${page}`
    );

    const verses = data.verses ?? [];
    const verse = verses.find((v) => v.verse_key === ayahKey);

    if (!verse) {
      return NextResponse.json(
        { error: `Verse ${ayahKey} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ pageNumber: verse.page_number });
  } catch (error) {
    console.error("[API] mushaf page-by-ayah:", error);
    return NextResponse.json(
      { error: "Failed to fetch verse page" },
      { status: 500 }
    );
  }
}
