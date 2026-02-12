"use client";

import { ErrorContent } from "@/components/error-pages";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorContent
      error={error}
      reset={reset}
      variant="app"
      homeHref="/"
      homeLabel="Go to Dashboard"
    />
  );
}
