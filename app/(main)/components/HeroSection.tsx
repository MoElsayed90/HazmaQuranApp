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

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative overflow-hidden min-h-0">
      <div className="container mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-28 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Opening: Bismillah + verse — grouped, tight spacing */}
          <motion.div variants={itemVariants} transition={{ duration: 0.5 }} className="space-y-2 mb-6 md:mb-8">
            <p className="text-xl md:text-2xl text-muted-foreground font-quran leading-relaxed">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-base md:text-xl text-primary/90 font-quran">
              وَاذْكُرِ اسْمَ رَبِّكَ وَتَبَتَّلْ إِلَيْهِ تَبْتِيلًا
            </p>
          </motion.div>

          {/* Headline + beta badge — clear primary focus */}
          <motion.div variants={itemVariants} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3 mb-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              استمع إلى{" "}
              <span className="text-primary">القرآن الكريم</span>
            </h1>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground/90 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border/40 inline-block w-fit mx-auto sm:mx-0">
              نسخة تجريبية
            </span>
          </motion.div>

          {/* Short description — one block, less space */}
          <motion.p
            variants={itemVariants}
            transition={{ duration: 0.5 }}
            className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-6"
          >
           تصفح القرآن الكريم واستمع لأشهر القراء. المصحف المعلم للحفظ، والمحفوظات للعودة لآياتك.
          </motion.p>

          {/* CTAs — primary one clear, secondary outline */}
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            <Link href="/surahs">
              <Button size="lg" className="gap-2 rounded-full min-h-[3.25rem] px-6 md:px-8 text-base md:text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <BookOpen className="h-5 w-5" />
                تصفح القرآن الكريم
              </Button>
            </Link>
            <Link href="/teacher-mushaf">
              <Button variant="outline" size="lg" className="gap-2 rounded-full min-h-[3.25rem] px-6 md:px-8 text-base md:text-lg border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50">
                <GraduationCap className="h-5 w-5" />
                المصحف المعلم
              </Button>
            </Link>
            <Link href="/reciters">
              <Button variant="outline" size="lg" className="gap-2 rounded-full min-h-[3.25rem] px-6 md:px-8 text-base md:text-lg border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50">
                <Headphones className="h-5 w-5" />
                القراء
              </Button>
            </Link>
          </motion.div>

          {/* Search — closer to CTAs, subtle shadow */}
          <motion.div variants={itemVariants} transition={{ duration: 0.4 }} className="w-full max-w-md mx-auto mt-6">
          <Popover open={showDropdown} onOpenChange={setShowSuggestions}>
            <div>
              <form onSubmit={handleSearchSubmit}>
                <PopoverTrigger asChild>
                  <div
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls="hero-search-listbox"
                    aria-haspopup="listbox"
                    className="relative flex items-center rounded-full border border-border/80 bg-card/80 shadow-sm overflow-visible focus-within:border-primary/50 focus-within:ring-0 hover:border-primary/30 transition-colors cursor-text"
                  >
                    <Search className="h-5 w-5 text-muted-foreground absolute right-4 pointer-events-none" />
                    <Input
                      type="search"
                      name="q"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="ابحث عن سورة أو قارئ..."
                      className="border-0 bg-transparent pr-12 pl-4 h-12 text-sm sm:text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
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
                        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">سور القرآن</p>
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
        </motion.div>
      </div>
    </section>
  );
}
