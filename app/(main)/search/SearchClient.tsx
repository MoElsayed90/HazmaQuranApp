"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SurahCard } from "@/components/quran/SurahCard";
import { ReciterCard } from "@/components/quran/ReciterCard";
import { normalizeArabicForSearch } from "@/lib/utils";
import type { Surah, Reciter } from "@/lib/api/types";

interface SearchClientProps {
  surahs: Surah[];
  reciters: Reciter[];
  initialQuery: string;
}

export function SearchClient({
  surahs,
  reciters,
  initialQuery,
}: SearchClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = (e.target as HTMLFormElement).querySelector("input")?.value?.trim() ?? "";
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const hasResults = filteredSurahs.length > 0 || filteredReciters.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">بحث — سور وقراء</h1>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="relative flex items-center rounded-full border bg-card/80 overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2">
          <Search className="h-5 w-5 text-muted-foreground absolute right-4 pointer-events-none" />
          <Input
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن سورة أو قارئ..."
            className="border-0 bg-transparent pr-12 pl-4 h-12 text-base placeholder:text-muted-foreground"
            dir="rtl"
            aria-label="ابحث عن سورة أو قارئ"
          />
        </div>
      </form>

      {!hasQuery && (
        <p className="text-muted-foreground">اكتب اسم سورة أو قارئ للبحث.</p>
      )}

      {hasQuery && !hasResults && (
        <p className="text-muted-foreground">لا توجد نتائج لـ &quot;{query.trim()}&quot;</p>
      )}

      {hasResults && (
        <div className="space-y-10">
          {filteredSurahs.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">السور</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSurahs.map((surah, i) => (
                  <SurahCard key={surah.id} surah={surah} index={i} />
                ))}
              </div>
            </section>
          )}
          {filteredReciters.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">القراء</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredReciters.map((reciter, i) => (
                  <ReciterCard key={reciter.id} reciter={reciter} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
