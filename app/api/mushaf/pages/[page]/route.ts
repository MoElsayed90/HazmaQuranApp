import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { qfFetchJson } from "@/lib/qf/client";

/** Madani mushaf page images (1–604), 1024×1656, from jsDelivr CDN */
const MUSHAF_PAGE_IMAGE_BASE =
  "https://cdn.jsdelivr.net/gh/tarekeldeeb/madina_images@w1024";

interface QFVerse {
  verse_key: string;
  text_uthmani?: string;
  page_number: number;
  chapter_id: number;
  verse_number: number;
  image_url?: string;
  translations?: unknown[];
}

interface QFVersesResponse {
  verses?: QFVerse[];
  pagination?: { total_pages: number; total_records: number };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    notFound();
  }

  try {
    const data = await qfFetchJson<QFVersesResponse>(
      `/verses/by_page/${pageNum}?per_page=50&fields=text_uthmani`
    );

    const verses = data.verses ?? [];
    const imageUrl = `${MUSHAF_PAGE_IMAGE_BASE}/w1024_page${String(pageNum).padStart(3, "0")}.png`;

    return NextResponse.json({
      pageNumber: pageNum,
      imageUrl,
      verses: verses.map((v) => ({
        verseKey: v.verse_key,
        text: v.text_uthmani ?? "",
        chapterId: v.chapter_id,
        verseNumber: v.verse_number,
        pageNumber: v.page_number,
      })),
      translations: verses[0]?.translations,
    });
  } catch (error) {
    console.error("[API] mushaf page:", error);
    return NextResponse.json(
      { error: "Failed to fetch mushaf page" },
      { status: 500 }
    );
  }
}
