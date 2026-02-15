"use client";

import Link from "next/link";
import { Search, BookOpen, Headphones, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/8 via-primary/[0.03] to-transparent">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-10"
        >
          <p className="text-xl md:text-3xl text-muted-foreground font-quran leading-relaxed">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-lg md:text-2xl text-primary/90 font-quran">
            وَذَكَرَ اسْمَ رَبِّكَ وَتَبَتَّلْ إِلَيْهِ تَبْتِيلًا
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            استمع إلى{" "}
            <span className="text-primary">القرآن الكريم</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            تصفح السور واستمع لأشهر القراء. المصحف المعلم للحفظ، وتجربة هادئة على جميع الأجهزة.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/surahs">
              <Button size="lg" className="gap-2 rounded-full min-h-[3.25rem] px-8 text-lg">
                <BookOpen className="h-5 w-5" />
                تصفح السور
              </Button>
            </Link>
            <Link href="/teacher-mushaf">
              <Button
                variant="default"
                size="lg"
                className="gap-2 rounded-full min-h-[3.25rem] px-8 text-lg bg-primary/90 hover:bg-primary"
              >
                <GraduationCap className="h-5 w-5" />
                المصحف المعلم
              </Button>
            </Link>
            <Link href="/reciters">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full min-h-[3.25rem] px-8 text-lg"
              >
                <Headphones className="h-5 w-5" />
                القراء
              </Button>
            </Link>
          </div>

          <Link href="/surahs">
            <div className="mt-10 max-w-md mx-auto flex items-center justify-center gap-2 rounded-full border bg-card/80 px-5 py-4 text-base text-muted-foreground hover:border-primary/30 hover:bg-card transition-colors cursor-pointer">
              <Search className="h-5 w-5 shrink-0" />
              <span>ابحث عن سورة أو قارئ...</span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
