import { NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";

export async function GET() {
  try {
    const provider = getQuranProvider();
    const surahs = await provider.getSurahs();
    return NextResponse.json(surahs);
  } catch (error) {
    console.error("[API] surahs:", error);
    return NextResponse.json(
      { error: "Failed to fetch surahs" },
      { status: 500 }
    );
  }
}
