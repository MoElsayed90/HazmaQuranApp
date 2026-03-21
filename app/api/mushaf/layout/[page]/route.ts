import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import path from "path";
import { qfFetchJson } from "@/lib/qf/client";

interface LayoutBox {
  verseKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface QFVerse {
  verse_key: string;
  page_number: number;
  chapter_id: number;
  verse_number: number;
}

interface QFVersesResponse {
  verses?: QFVerse[];
}

function versesToStubBoxes(verses: QFVerse[]): LayoutBox[] {
  if (!verses.length) return [];
  const count = verses.length;
  const marginY = 0.04;
  const marginX = 0.05;
  const h = (1 - 2 * marginY) / count;
  const w = 1 - 2 * marginX;
  return verses.map((v, i) => ({
    verseKey: v.verse_key,
    x: marginX,
    y: marginY + (i / count) * (1 - 2 * marginY),
    w,
    h,
  }));
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

  const padded = String(pageNum).padStart(3, "0");
  const layoutPath = path.join(
    process.cwd(),
    "data",
    "mushaf-layout",
    `page-${padded}.json`
  );

  try {
    const raw = await readFile(layoutPath, "utf8");
    const boxes: LayoutBox[] = JSON.parse(raw);
    return NextResponse.json({ pageNumber: pageNum, boxes });
  } catch {
    // File missing: fallback to stub boxes from QF verses
  }

  try {
    const data = await qfFetchJson<QFVersesResponse>(
      `/verses/by_page/${pageNum}?per_page=50&fields=text_uthmani`
    );
    const verses = data.verses ?? [];
    const boxes = versesToStubBoxes(verses);
    return NextResponse.json({ pageNumber: pageNum, boxes });
  } catch (error) {
    console.error("[API] mushaf layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch mushaf layout" },
      { status: 500 }
    );
  }
}
