import { SearchPageClient } from "./SearchPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بحث — سور وقراء",
  description: "ابحث عن سورة أو قارئ في تطبيق حمزة",
};

export default function SearchPage() {
  return <SearchPageClient />;
}
