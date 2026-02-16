"use client";

import Link from "next/link";
import { ErrorContent } from "@/components/error-pages";

export default function PresentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal header matching present layout */}
      <div className="flex shrink-0 items-center px-4 py-3 sm:px-6">
        <Link
          href="/ezcharts/slides"
          className="flex items-center gap-2 rounded-xl text-[#3D4035]/60 transition-colors hover:text-[#3D4035]"
        >
          <span className="text-[14px] font-medium">← Back to slides</span>
        </Link>
      </div>
      <ErrorContent
        error={error}
        reset={reset}
        variant="present"
        homeHref="/ezcharts/slides"
        homeLabel="Back to Slides"
      />
    </div>
  );
}
