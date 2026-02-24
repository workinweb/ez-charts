"use client";

import Link from "next/link";
import { authClient } from "@/lib/(auth)/auth-client";
import { Mail } from "lucide-react";

export function VerificationBanner() {
  const { data: session } = authClient.useSession();

  const emailVerified = !!(session?.user as { emailVerified?: boolean })
    ?.emailVerified;

  if (!session?.user?.email || emailVerified) {
    return null;
  }

  return (
    <div className="relative shrink-0 overflow-hidden border-b border-[#B5A9E0]/50 bg-[#C9C1ED] px-4 py-3 text-center shadow-[0_1px_3px_rgba(61,53,133,0.08)] sm:px-6 sm:py-3.5">
      {/* Shine effect - sweeps every ~6s, slower so it's noticeable */}
      <div
        className="pointer-events-none absolute inset-0 w-[50%] animate-verification-shine bg-gradient-to-r from-transparent via-white/40 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-2 text-[14px] text-[#3D3585] sm:text-[15px]">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/50">
            <Mail className="size-4 text-[#5A4B9E]" />
          </span>
          Your email is not verified.
        </span>
        <Link
          href="/ezcharts/verification"
          className="inline-flex items-center rounded-lg bg-[#5A4B9E] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#4A3D85] hover:shadow"
        >
          Verify now
        </Link>
      </div>
    </div>
  );
}
