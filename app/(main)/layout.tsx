import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PwaInstallBanner } from "@/components/layout/PwaInstallBanner";
import { AudioPlayerMini, AudioPlayerExpanded } from "@/components/layout/AudioPlayer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-6rem)] pb-20">{children}</main>
      <Footer />
      <PwaInstallBanner />
      <AudioPlayerMini />
      <AudioPlayerExpanded />
    </>
  );
}
