import Link from "next/link";
import { Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotFoundContentProps {
  /** Link href for primary action */
  homeHref?: string;
  /** Primary action label */
  homeLabel?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Layout variant for styling context */
  variant?: "app" | "present" | "root";
}

export function NotFoundContent({
  homeHref = "/",
  homeLabel = "Go to Dashboard",
  subtitle = "The page you're looking for doesn't exist or has been moved.",
  variant = "root",
}: NotFoundContentProps) {
  const isMinimal = variant === "present" || variant === "root";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-12 bg-background",
        isMinimal ? "min-h-screen" : "flex-1",
      )}
    >
      <div className="flex flex-col items-center justify-center gap-6 rounded-[28px] bg-white/80 py-16 text-center shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:py-20 sm:px-12">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#BCBDEA]/20 sm:size-20">
          <FileQuestion className="size-8 text-[#6C5DD3] sm:size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#3D4035] sm:text-[28px]">
            404
          </h1>
          <p className="text-[15px] font-medium text-[#3D4035]/70 sm:text-[16px]">
            Page not found
          </p>
          <p className="max-w-sm text-[13px] text-[#3D4035]/50 sm:text-[14px]">
            {subtitle}
          </p>
        </div>
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
  );
}
