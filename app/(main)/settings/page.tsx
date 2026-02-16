import type { Metadata } from "next";
import { SettingsClient } from "./components/SettingsClient";

export const metadata: Metadata = {
  title: "الإعدادات",
  description: "إعدادات التطبيق",
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-10 max-w-3xl">
      <SettingsClient />
    </div>
  );
}
