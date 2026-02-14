"use client";

import { useState, useMemo } from "react";
import { ReciterCard } from "@/components/quran/ReciterCard";
import { SearchInput } from "@/components/quran/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import type { Reciter } from "@/lib/api/types";

const INITIAL_RECITERS_COUNT = 12;

interface RecitersListClientProps {
  reciters: Reciter[];
}

export function RecitersListClient({ reciters }: RecitersListClientProps) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return reciters;
    const q = debouncedSearch.trim();
    return reciters.filter(
      (r) =>
        r.name.includes(q) ||
        (r.englishName && r.englishName.toLowerCase().includes(q.toLowerCase()))
    );
  }, [reciters, debouncedSearch]);

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_RECITERS_COUNT);
  const hasMore = filtered.length > INITIAL_RECITERS_COUNT && !showAll;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">القراء</h1>
        <p className="text-sm text-muted-foreground mt-1">
          استمع لتلاوات {reciters.length} قارئ
        </p>
        {reciters.length <= 3 && (
          <p className="text-xs text-muted-foreground mt-1 rounded-md bg-muted/50 px-2 py-1.5 inline-block">
            تظهر عينة محدودة في بيئة التجربة. للقائمة الكاملة ضع في ملف .env.local: QF_ENV=production
          </p>
        )}
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="ابحث عن قارئ..."
        className="max-w-md"
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج"
          message="جرب تغيير كلمة البحث"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((reciter, i) => (
              <ReciterCard key={reciter.id} reciter={reciter} index={i} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setShowAll(true)}>
                عرض الكل ({filtered.length} قارئ)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
