"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="حدث خطأ غير متوقع"
      message={error.message || "يرجى المحاولة مرة أخرى"}
      onRetry={reset}
    />
  );
}
