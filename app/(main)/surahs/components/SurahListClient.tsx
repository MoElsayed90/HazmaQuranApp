"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SurahCard } from "@/components/quran/SurahCard";
import { SearchInput } from "@/components/quran/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDebounce } from "@/hooks/use-debounce";
import type { Surah } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type SortBy = "number" | "name";
type FilterBy = "all" | "Meccan" | "Medinan";

interface SurahListClientProps {
  surahs: Surah[];
}

export function SurahListClient({ surahs }: SurahListClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("number");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    let result = [...surahs];

    // Filter by revelation type
    if (filterBy !== "all") {
      result = result.filter((s) => s.revelationType === filterBy);
    }

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.includes(debouncedSearch) ||
          s.englishName.toLowerCase().includes(q) ||
          s.englishNameTranslation.toLowerCase().includes(q) ||
          String(s.id) === q
      );
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => a.englishName.localeCompare(b.englishName));
    } else {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [surahs, debouncedSearch, sortBy, filterBy]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">سور القرآن الكريم</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {surahs.length} سورة
        </p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="ابحث عن سورة بالاسم أو الرقم..."
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => setSortBy(sortBy === "number" ? "name" : "number")}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortBy === "number" ? "حسب الرقم" : "حسب الاسم"}
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {(["all", "Meccan", "Medinan"] as FilterBy[]).map((f) => (
          <Badge
            key={f}
            variant={filterBy === f ? "default" : "outline"}
            className={cn("cursor-pointer transition-colors", filterBy === f && "bg-primary")}
            onClick={() => setFilterBy(f)}
          >
            {f === "all" ? "الكل" : f === "Meccan" ? "مكية" : "مدنية"}
          </Badge>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج"
          message="جرب تغيير كلمة البحث أو الفلتر"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((surah, i) => (
            <SurahCard key={surah.id} surah={surah} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
