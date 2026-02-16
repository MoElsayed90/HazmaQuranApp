import { NextResponse } from "next/server";
import { getQuranProvider } from "@/lib/api/providers/islamhouse";

export async function GET() {
  try {
    const provider = getQuranProvider();
    const reciters = await provider.getReciters();
    return NextResponse.json(reciters);
  } catch (error) {
    console.error("[API] reciters:", error);
    return NextResponse.json(
      { error: "Failed to fetch reciters" },
      { status: 500 }
    );
  }
}
