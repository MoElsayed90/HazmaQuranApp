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
      {/* Unified animated background (app-wide, behind navbar + main + footer) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 hero-bg-gradient animate-gradient-shift" />
        <div className="absolute inset-0 bg-islamic-pattern" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full hero-orb-primary blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full hero-orb-accent blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full hero-orb-soft blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 left-1/4 w-80 h-80 rounded-full hero-orb-accent blur-3xl animate-float-slow opacity-70" />
        <div className="absolute left-0 right-0 top-0 h-[40vh] w-full hero-shimmer animate-shimmer-wave" />
      </div>

      <Navbar />
      <main className="relative z-10 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-6rem)] pb-20">{children}</main>
      <Footer />
      <PwaInstallBanner />
      <AudioPlayerMini />
      <AudioPlayerExpanded />
    </>
  );
}
