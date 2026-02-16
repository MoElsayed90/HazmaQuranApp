import { NextRequest, NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recitationId = Number(id);
  if (isNaN(recitationId)) {
    return NextResponse.json({ error: "Invalid recitation id" }, { status: 400 });
  }

  try {
    const provider = getQuranProvider();
    const recitation = await provider.getRecitation(recitationId);
    return NextResponse.json(recitation);
  } catch (error) {
    console.error("[API] recitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch recitation" },
      { status: 500 }
    );
  }
}
