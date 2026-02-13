import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { ReciterDetailClient } from "./components/ReciterDetailClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ recitations?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { recitations } = await searchParams;
  const recitationIds = recitations?.split(",").map(Number).filter(Boolean) || [];
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

export default async function ReciterDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { recitations } = await searchParams;
  const reciterId = Number(id);
  const recitationIds =
    recitations?.split(",").map(Number).filter(Boolean) || [];

  const provider = getQuranProvider();

  // Fetch all recitations in parallel
  const recitationResults = await Promise.all(
    recitationIds.map((rId) =>
      provider.getRecitation(rId).catch(() => null)
    )
  );

  const validRecitations = recitationResults.filter(Boolean) as Awaited<
    ReturnType<typeof provider.getRecitation>
  >[];

  // Try to get reciter info from the reciters list
  const reciters = await provider.getReciters().catch(() => []);
  const reciter = reciters.find((r) => r.id === reciterId);

  return (
    <div className="container mx-auto px-4 py-6">
      <ReciterDetailClient
        reciterName={reciter?.name || "قارئ"}
        reciterImage={reciter?.imageUrl}
        recitations={validRecitations}
      />
    </div>
  );
}
