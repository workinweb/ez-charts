"use client";

import Link from "next/link";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorContentProps {
  /** Error to display (optional, for retry) */
  error?: Error & { digest?: string };
  /** Reset function from error boundary */
  reset?: () => void;
  /** Link href for primary action */
  homeHref?: string;
  /** Primary action label */
  homeLabel?: string;
  /** Layout variant for styling context */
  variant?: "app" | "present" | "root";
}

export function ErrorContent({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Go to Dashboard",
  variant = "root",
}: ErrorContentProps) {
  const isMinimal = variant === "present" || variant === "root";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-12 bg-background",
        isMinimal ? "min-h-screen" : "flex-1",
      )}
    >
      <div className="flex flex-col items-center justify-center gap-6 rounded-[28px] bg-white/80 py-16 text-center shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:py-20 sm:px-12">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-100 sm:size-20">
          <AlertCircle className="size-8 text-red-600 sm:size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#3D4035] sm:text-[28px]">
            Something went wrong
          </h1>
          <p className="max-w-sm text-[13px] text-[#3D4035]/50 sm:text-[14px]">
            An unexpected error occurred. Please try again or return to the
            dashboard.
          </p>
          {error?.message && (
            <p className="mt-2 max-w-md truncate rounded-lg bg-[#3D4035]/5 px-3 py-2 font-mono text-[11px] text-[#3D4035]/60">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {reset && (
            <Button
              variant="outline"
              onClick={reset}
              className="gap-2 rounded-xl border-[#3D4035]/20"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
          )}
          <Button
            asChild
            className="gap-2 rounded-xl bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
          >
            <Link href={homeHref}>
              <Home className="size-4" />
              {homeLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
