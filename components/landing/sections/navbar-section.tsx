"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prevY = useRef(0);
  const ticking = useRef(false);

  const onScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;
      const isScrolled = y > 64;

      setScrolled(isScrolled);

      if (y < 64) {
        setHidden(false);
      } else if (y > prevY.current + 4) {
        setHidden(true);
      } else if (y < prevY.current - 4) {
        setHidden(false);
      }

      prevY.current = y;
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-300",
        hidden ? "-translate-y-[calc(100%+1rem)]" : "translate-y-0",
      )}
    >
      <div className={cn("p-0 transition-[padding] duration-300", scrolled && "px-4 pt-4 sm:px-6")}>
        <nav
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6",
            scrolled
              ? "rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5"
              : "rounded-b-2xl border-b border-slate-200/60 bg-white",
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
          >
            <div className="relative size-8 shrink-0">
              <Image
                src="/logo.png"
                alt="EZ Charts"
                fill
                className="object-contain"
              />
            </div>
            EZ Charts
          </Link>

          <div className="hidden items-center gap-1 rounded-full bg-slate-100/80 px-1 py-1 md:flex">
            <a
              href="#features"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            >
              Features
            </a>
            <a
              href="#templates"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            >
              Templates
            </a>
            <a
              href="#pricing"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            >
              Pricing
            </a>
            <Link
              href="/contact"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/ezcharts"
              className="flex items-center gap-2 rounded-full bg-[#6C5DD3] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#5a4dbf]"
            >
              Start for Free
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
