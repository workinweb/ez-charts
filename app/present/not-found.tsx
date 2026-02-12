import Link from "next/link";
import { NotFoundContent } from "@/components/error-pages";

export default function PresentNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal header matching present layout */}
      <div className="flex shrink-0 items-center px-4 py-3 sm:px-6">
        <Link
          href="/slides"
          className="flex items-center gap-2 rounded-xl text-[#3D4035]/60 transition-colors hover:text-[#3D4035]"
        >
          <span className="text-[14px] font-medium">← Back to slides</span>
        </Link>
      </div>
      <NotFoundContent
        variant="present"
        homeHref="/slides"
        homeLabel="Back to Slides"
        subtitle="This slide deck doesn't exist or has been moved."
      />
    </div>
  );
}
