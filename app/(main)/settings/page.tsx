import type { Metadata } from "next";
import { SettingsClient } from "./components/SettingsClient";

export const metadata: Metadata = {
  title: "الإعدادات",
  description: "إعدادات التطبيق",
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <SettingsClient />
    </div>
  );
}
