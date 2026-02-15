import { NextRequest, NextResponse } from "next/server";

/** Domains we allow proxying for audio download (avoids CORS; no open redirect). */
const ALLOWED_HOSTS = [
  "d1.islamhouse.com",
  "islamhouse.com",
  "cdn.islamic.network",
  "api3.islamhouse.com",
];

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith("." + h));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("filename") || "audio.mp3";

  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ error: "Invalid or disallowed URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HazmaQuranApp/1.0" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "audio/mpeg";
    const safeName = filename.replace(/[/\\?%*:|"<>]/g, "-").trim() || "audio";
    const ext = safeName.endsWith(".mp3") ? "" : ".mp3";
    const disposition = `attachment; filename="${encodeURIComponent(safeName + ext)}"`;

    const arrayBuffer = await res.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Content-Length": String(arrayBuffer.byteLength),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch audio" },
      { status: 502 }
    );
  }
}
