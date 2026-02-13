"use client";

import { useState, useMemo } from "react";
import { ReciterCard } from "@/components/quran/ReciterCard";
import { SearchInput } from "@/components/quran/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDebounce } from "@/hooks/use-debounce";
import type { Reciter } from "@/lib/api/types";

interface RecitersListClientProps {
  reciters: Reciter[];
}

export function RecitersListClient({ reciters }: RecitersListClientProps) {
  const [search, setSearch] = useState("");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">القراء</h1>
        <p className="text-sm text-muted-foreground mt-1">
          استمع لتلاوات {reciters.length} قارئ
        </p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((reciter, i) => (
            <ReciterCard key={reciter.id} reciter={reciter} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
