"use client";

import { ErrorContent } from "@/components/error-pages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <ErrorContent
        error={error}
        reset={reset}
        variant="root"
        homeHref="/"
        homeLabel="Go to Dashboard"
      />
    </div>
  );
}
