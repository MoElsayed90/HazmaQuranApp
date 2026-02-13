import { getQuranProvider } from "@/lib/api/providers/islamhouse";
import { RecitersListClient } from "./components/RecitersListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "القراء",
  description: "استمع لتلاوات القرآن الكريم بصوت أشهر القراء",
};

export default async function RecitersPage() {
  const provider = getQuranProvider();
  const reciters = await provider.getReciters();

  return (
    <div className="container mx-auto px-4 py-6">
      <RecitersListClient reciters={reciters} />
    </div>
  );
}
