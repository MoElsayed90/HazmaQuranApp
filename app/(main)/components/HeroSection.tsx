"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Headphones, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { normalizeArabicForSearch } from "@/lib/utils";
import type { Surah, Reciter } from "@/lib/api/types";

const MAX_SUGGESTIONS = 5;

interface HeroSectionProps {
  surahs?: Surah[];
  reciters?: Reciter[];
}

export function HeroSection({ surahs = [], reciters = [] }: HeroSectionProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSurahs = useMemo(() => {
    const raw = query.trim();
    const q = raw.toLowerCase();
    if (!q) return [];
    const qNorm = normalizeArabicForSearch(raw);
    return surahs.filter((s) => {
      const nameNorm = normalizeArabicForSearch(s.name);
      return (
        nameNorm.includes(qNorm) ||
        qNorm.includes(nameNorm) ||
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.id) === raw
      );
    });
  }, [surahs, query]);

  const filteredReciters = useMemo(() => {
    const raw = query.trim();
    const q = raw.toLowerCase();
    if (!raw) return [];
    const qNorm = normalizeArabicForSearch(raw);
    return reciters.filter((r) => {
      const nameNorm = normalizeArabicForSearch(r.name);
      return (
        nameNorm.includes(qNorm) ||
        qNorm.includes(nameNorm) ||
        (r.englishName && r.englishName.toLowerCase().includes(q))
      );
    });
  }, [reciters, query]);

  const hasSuggestions = filteredSurahs.length > 0 || filteredReciters.length > 0;
  const showDropdown = showSuggestions && query.trim().length >= 1;

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setShowSuggestions(false);
    } else {
      router.push("/search");
    }
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
  };

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
            وَاذْكُرِ اسْمَ رَبِّكَ وَتَبَتَّلْ إِلَيْهِ تَبْتِيلًا
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            استمع إلى{" "}
            <span className="text-primary">القرآن الكريم</span>
          </h1>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground border border-border/50">
            نسخة تجريبية
          </span>

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

          <Popover open={showDropdown} onOpenChange={setShowSuggestions}>
            <div className="mt-10 w-full max-w-md mx-auto">
              <form onSubmit={handleSearchSubmit}>
                <PopoverTrigger asChild>
                  <div
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls="hero-search-listbox"
                    aria-haspopup="listbox"
                    className="relative flex items-center rounded-full border bg-card/80 overflow-visible focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2 hover:border-primary/30 transition-colors cursor-text"
                  >
                    <Search className="h-5 w-5 text-muted-foreground absolute right-4 pointer-events-none" />
                    <Input
                      type="search"
                      name="q"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="ابحث عن سورة أو قارئ..."
                      className="border-0 bg-transparent pr-12 pl-4 h-12 text-sm sm:text-base placeholder:text-muted-foreground focus-visible:ring-0"
                      dir="rtl"
                      aria-label="ابحث عن سورة أو قارئ"
                      autoComplete="off"
                    />
                  </div>
                </PopoverTrigger>
              </form>
              <PopoverContent
                id="hero-search-listbox"
                align="center"
                sideOffset={8}
                className="w-[var(--radix-popover-trigger-width)] max-h-[min(20rem,50vh)] overflow-auto p-0 rounded-xl text-right"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                {hasSuggestions ? (
                  <div className="p-2 space-y-2" role="listbox">
                    {filteredSurahs.slice(0, MAX_SUGGESTIONS).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">السور</p>
                        {filteredSurahs.slice(0, MAX_SUGGESTIONS).map((s) => (
                          <Link
                            key={s.id}
                            href={`/surahs/${s.id}`}
                            onClick={handleSuggestionClick}
                            className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                            role="option"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {filteredReciters.slice(0, MAX_SUGGESTIONS).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">القراء</p>
                        {filteredReciters.slice(0, MAX_SUGGESTIONS).map((r) => (
                          <Link
                            key={r.id}
                            href={r.recitationIds?.length ? `/reciters/${r.id}?recitations=${r.recitationIds.join(",")}` : `/reciters/${r.id}`}
                            onClick={handleSuggestionClick}
                            className="block px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                            role="option"
                          >
                            {r.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-right px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors rounded-b-xl"
                  >
                    عرض كل النتائج لـ &quot;{query.trim()}&quot;
                  </button>
                )}
              </PopoverContent>
            </div>
          </Popover>
        </motion.div>
      </div>
    </section>
  );
}
