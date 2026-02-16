import { RecitersListSkeleton } from "./components/RecitersListSkeleton";

export default function RecitersLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <RecitersListSkeleton />
    </div>
  );
}
