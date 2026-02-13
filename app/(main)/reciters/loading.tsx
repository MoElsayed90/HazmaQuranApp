import { ReciterListSkeleton } from "@/components/shared/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      <div className="h-10 w-full max-w-md bg-muted rounded animate-pulse" />
      <ReciterListSkeleton />
    </div>
  );
}
