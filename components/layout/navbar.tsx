"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SectionKey } from "@/stores/section-store";
import { useSectionStore } from "@/stores/section-store";
import {
  Bookmark,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  Menu,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Favorites", href: "/favorites" },
  { label: "Charts", href: "/charts" },
  { label: "Slides", href: "/slides" },
];

const toolIcons: {
  icon: React.ElementType;
  label: string;
  sectionKey?: SectionKey;
}[] = [
  { icon: Search, label: "Search" },
  { icon: LayoutGrid, label: "Dashboard", sectionKey: "dashboard" },
  { icon: FileText, label: "Documents", sectionKey: "documents" },
  { icon: LayoutDashboard, label: "Layout", sectionKey: "layout" },
  { icon: Users, label: "Team", sectionKey: "team" },
  { icon: Link2, label: "Links", sectionKey: "links" },
  { icon: Bookmark, label: "Saved", sectionKey: "saved" },
  { icon: SlidersHorizontal, label: "Adjustments", sectionKey: "adjustments" },
  { icon: Sparkles, label: "AI Builds", sectionKey: "new" },
];

function isLinkActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const pathname = usePathname();
  const setActiveSection = useSectionStore((s) => s.setActiveSection);

  return (
    <nav className="flex items-center justify-between px-3 py-3  sm:px-5 sm:py-4">
      <div className="flex w-full items-center justify-between rounded-[32px] max-w-[1600px] mx-auto w-full bg-white/80 px-4 py-2.5 shadow-sm ring-1 ring-black/[0.02] sm:px-6 sm:py-3">
        {/* Left: nav links (desktop) / hamburger + tools (mobile) */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile tools popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Open navigation menu"
                title="Open navigation menu"
                className="flex md:hidden rounded-xl text-[#3D4035]/60 hover:text-[#3D4035]"
              >
                <Menu className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-56 rounded-2xl border-0 bg-white p-2 shadow-xl"
            >
              {/* Mobile nav links */}
              <div className="mb-2 border-b border-black/5 pb-2">
                {navLinks.map((link) => {
                  const active = isLinkActive(link.href, pathname ?? "");
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={cn(
                        "flex items-center rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-[#BCBDEA]/20 text-[#3D4035]"
                          : "text-[#3D4035]/60 hover:bg-black/[0.03] hover:text-[#3D4035]/90",
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              {/* Mobile tool icons */}
              <div className="grid grid-cols-5 gap-1">
                {toolIcons.map(({ icon: Icon, label, sectionKey }) => (
                  <button
                    key={label}
                    title={label}
                    type="button"
                    onClick={() => sectionKey && setActiveSection(sectionKey)}
                    className="flex size-9 items-center justify-center rounded-xl text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground/60"
                  >
                    <Icon className="size-[17px]" strokeWidth={1.7} />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, pathname ?? "");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "rounded-2xl px-4 py-2 text-[14px] font-medium transition-colors",
                    active
                      ? "text-[#3D4035]"
                      : "text-[#3D4035]/60 hover:text-[#3D4035]/90",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
