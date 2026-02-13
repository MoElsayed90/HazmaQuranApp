import { SurahReaderSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="h-10 w-32 bg-muted rounded animate-pulse mx-auto" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto" />
      </div>
      <SurahReaderSkeleton />
    </div>
  );
}
