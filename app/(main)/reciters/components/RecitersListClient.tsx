"use client";

import { useState, useMemo } from "react";
import { ReciterCard } from "@/components/quran/ReciterCard";
import { SearchInput } from "@/components/quran/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import type { Reciter } from "@/lib/api/types";

const CATEGORIES = [
  { id: "all" as const, label: "الكل" },
  { id: "most" as const, label: "الأكثر تلاوات" },
  { id: "latest" as const, label: "الأحدث" },
];

interface RecitersListClientProps {
  reciters: Reciter[];
}

export function RecitersListClient({ reciters }: RecitersListClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "most" | "latest">("all");
  const debouncedSearch = useDebounce(search, 300);

  const filteredAndSorted = useMemo(() => {
    let list = reciters;
    if (debouncedSearch) {
      const q = debouncedSearch.trim();
      list = list.filter(
        (r) =>
          r.name.includes(q) ||
          (r.englishName && r.englishName.toLowerCase().includes(q.toLowerCase()))
      );
    }
    if (category === "most") {
      list = [...list].sort((a, b) => (b.recitationCount ?? 0) - (a.recitationCount ?? 0));
    } else if (category === "latest") {
      list = [...list].sort((a, b) => (b.addDate ?? 0) - (a.addDate ?? 0));
    }
    return list;
  }, [reciters, debouncedSearch, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">القراء</h1>
        <p className="text-sm text-muted-foreground mt-1">
          استمع لتلاوات {reciters.length} قارئ
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Button
            key={c.id}
            variant={category === c.id ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="ابحث عن قارئ..."
        className="max-w-md"
      />

      {filteredAndSorted.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج"
          message="جرب تغيير كلمة البحث أو التصنيف"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAndSorted.map((reciter, i) => (
            <ReciterCard key={reciter.id} reciter={reciter} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
