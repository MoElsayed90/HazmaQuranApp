import { NextRequest, NextResponse } from "next/server";
import { qfFetchJson } from "@/lib/qf/client";

interface QFTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
}

interface QFAudioFileResponse {
  audio_file?: {
    audio_url: string;
    timestamps?: QFTimestamp[];
  };
}

export async function GET(request: NextRequest) {
  const reciterId = request.nextUrl.searchParams.get("reciterId");
  const chapterStr = request.nextUrl.searchParams.get("chapter");
  const segmentsParam = request.nextUrl.searchParams.get("segments");

  if (!reciterId || !chapterStr) {
    return NextResponse.json(
      { error: "Missing reciterId or chapter" },
      { status: 400 }
    );
  }

  const chapter = Number(chapterStr);
  if (isNaN(chapter) || chapter < 1 || chapter > 114) {
    return NextResponse.json(
      { error: "Invalid chapter. Must be 1-114" },
      { status: 400 }
    );
  }

  const segments = segmentsParam === "1" || segmentsParam === "true";

  try {
    // QF path: /audio/reciters/{id}/chapters/{chapter_number}/file
    const data = await qfFetchJson<QFAudioFileResponse>(
      `/audio/reciters/${encodeURIComponent(reciterId)}/chapters/${chapter}/file?segments=${segments}`
    );

    const audioFile = data.audio_file;
    if (!audioFile?.audio_url) {
      return NextResponse.json(
        { error: "No audio file found for this reciter and chapter" },
        { status: 404 }
      );
    }

    const timestamps = audioFile.timestamps?.map((t) => ({
      verseKey: t.verse_key,
      from: t.timestamp_from,
      to: t.timestamp_to,
    }));

    return NextResponse.json({
      reciterId,
      chapter,
      audioUrl: audioFile.audio_url,
      timestamps,
    });
  } catch (error) {
    console.error("[API] chapter-file:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter audio" },
      { status: 500 }
    );
  }
}
