import { NextRequest, NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reciterId = Number(id);
  if (isNaN(reciterId)) {
    return NextResponse.json({ error: "Invalid reciter id" }, { status: 400 });
  }

  const recitationsParam = request.nextUrl.searchParams.get("recitations");
  const recitationIds = recitationsParam
    ? recitationsParam.split(",").map(Number).filter(Boolean)
    : [];

  try {
    const provider = getQuranProvider();
    const [reciters, ...recitationResults] = await Promise.all([
      provider.getReciters(),
      ...recitationIds.map((rId) =>
        provider.getRecitation(rId).catch(() => null)
      ),
    ]);

    const reciter = reciters.find((r) => r.id === reciterId) ?? null;
    const recitations = recitationResults.filter(Boolean);

    return NextResponse.json({ reciter, recitations });
  } catch (error) {
    console.error("[API] reciter detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch reciter" },
      { status: 500 }
    );
  }
}
