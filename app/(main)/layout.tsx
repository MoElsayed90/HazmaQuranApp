import Navbar from "@/components/layout/Navbar";
import { AudioPlayerMini, AudioPlayerExpanded } from "@/components/layout/AudioPlayer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)] pb-20">{children}</main>
      <AudioPlayerMini />
      <AudioPlayerExpanded />
    </>
  );
}
