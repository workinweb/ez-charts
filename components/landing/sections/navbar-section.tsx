"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChatbotStore } from "@/stores/chatbot-store";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ChevronDown, LogOut, Menu, User } from "lucide-react";

export function LandingNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [hidden, setHidden] = useState(false);
  const hideMarketingLinks =
    pathname === "/opinions" && !!session?.user;
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
      <div
        className={cn(
          "p-0 transition-[padding] duration-300",
          scrolled && "px-4 pt-4 sm:px-6",
        )}
      >
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
            <div className="relative size-12 shrink-0">
              <Image
                src="/logo.png"
                alt="Ez2Chart"
                fill
                className="object-contain z-10"
              />
            </div>
            <Image
              src="/EZ Charts.png"
              alt="Ez2Chart"
              width={150}
              height={80}
              className="h-14 translate-x-[-50px] w-auto object-contain"
            />{" "}
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 rounded-full bg-slate-100/80 px-1 py-1 lg:flex">
            {!hideMarketingLinks && (
              <>
                <a
                  href="#features"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                >
                  Features
                </a>
                <Link
                  href="/examples"
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                >
                  Templates
                </Link>
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
              </>
            )}
            <Link
              href="/opinions"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
            >
              Opinions
            </Link>
          </div>

          {/* Mobile menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="flex size-9 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-56 rounded-2xl border-slate-200 bg-white p-2 shadow-xl"
            >
              <nav className="flex flex-col gap-0.5">
                {!hideMarketingLinks && (
                  <>
                    <a
                      href="#features"
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Features
                    </a>
                    <Link
                      href="/examples"
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Templates
                    </Link>
                    <a
                      href="#pricing"
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Pricing
                    </a>
                    <Link
                      href="/contact"
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Contact
                    </Link>
                  </>
                )}
                <Link
                  href="/opinions"
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Opinions
                </Link>
                <div className="my-1 h-px bg-slate-200" />
                {session?.user ? (
                  <>
                    <Link
                      href="/ezcharts"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#6C5DD3] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5a4dbf]"
                    >
                      Dashboard
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
                    <Link
                      href="/ezcharts/user"
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Account
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          useChatbotStore.getState().clearFiles();
                          await authClient.signOut();
                        } finally {
                          router.replace("/");
                        }
                      }}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#6C5DD3] px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5a4dbf]"
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
                  </>
                )}
              </nav>
            </PopoverContent>
          </Popover>

          <div className="hidden items-center gap-3 lg:flex">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-slate-100">
                    <UserAvatar size="sm" />
                    <span className="text-sm font-medium text-slate-700">
                      {session.user.name ?? session.user.email ?? "Account"}
                    </span>
                    <ChevronDown className="size-4 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[180px] rounded-xl border-slate-200 bg-white p-1 shadow-xl"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/ezcharts"
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Dashboard
                      <svg
                        className="size-4 ml-auto"
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
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/ezcharts/user"
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User className="size-4 text-slate-500" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onSelect={async () => {
                      try {
                        useChatbotStore.getState().clearFiles();
                        await authClient.signOut();
                      } finally {
                        router.replace("/");
                      }
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
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
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
