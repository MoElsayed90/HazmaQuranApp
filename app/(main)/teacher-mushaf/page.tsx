import { TeacherMushafClient } from "./components/TeacherMushafClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المصحف المعلم | حمزة",
  description: "المصحف المعلم للشيخ محمود خليل الحصري — صوت السور للتعليم والتحفيظ",
};

export default function TeacherMushafPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <TeacherMushafClient />
    </div>
  );
}
