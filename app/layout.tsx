import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { FontSizeSync } from "@/components/providers/FontSizeSync";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "حمزة - تطبيق القرآن الكريم",
    template: "%s | حمزة",
  },
  description:
    "استمع إلى القرآن الكريم بصوت أشهر القراء. تصفح السور، احفظ الإشارات المرجعية، واستمتع بتجربة قراءة واستماع مميزة.",
  keywords: ["قرآن", "quran", "إسلام", "تلاوة", "قراء"],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFAF6" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A2E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <FontSizeSync />
          <AudioProvider>
            {children}
            <Toaster richColors position="top-center" />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
