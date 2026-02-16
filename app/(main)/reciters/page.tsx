import { RecitersPageClient } from "./RecitersPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "القراء",
  description: "استمع لتلاوات القرآن الكريم بصوت أشهر القراء",
};

export default function RecitersPage() {
  return <RecitersPageClient />;
}
