import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { ReciterDetailPageClient } from "./ReciterDetailPageClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ recitations?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { recitations } = await searchParams;
  const recitationIds = recitations?.split(",").map(Number).filter(Boolean) ?? [];
  if (recitationIds.length > 0) {
    const provider = getQuranProvider();
    try {
      const recitation = await provider.getRecitation(recitationIds[0]);
      return { title: recitation.title };
    } catch {
      return { title: "تفاصيل القارئ" };
    }
  }
  return { title: "تفاصيل القارئ" };
}

export default function ReciterDetailPage() {
  return <ReciterDetailPageClient />;
}
