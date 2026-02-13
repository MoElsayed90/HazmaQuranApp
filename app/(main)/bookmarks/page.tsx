import type { Metadata } from "next";
import { BookmarksClient } from "./components/BookmarksClient";

export const metadata: Metadata = {
  title: "المحفوظات",
  description: "الإشارات المرجعية المحفوظة",
};

export default function BookmarksPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <BookmarksClient />
    </div>
  );
}
