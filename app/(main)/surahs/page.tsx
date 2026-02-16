import { SurahsPageClient } from "./SurahsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "القرآن الكريم",
  description: "تصفح جميع سور القرآن الكريم الـ 114",
};

export default function SurahsPage() {
  return <SurahsPageClient />;
}
