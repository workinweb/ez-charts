"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  LayoutGrid,
  FileText,
  LayoutDashboard,
  Users,
  Link2,
  Bookmark,
  SlidersHorizontal,
  FilePlus,
  Settings,
  Menu,
} from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Favorites", href: "/favorites" },
  { label: "All Charts", href: "/charts" },
];

const toolIcons = [
  { icon: Search, label: "Search" },
  { icon: LayoutGrid, label: "Dashboard" },
  { icon: FileText, label: "Documents" },
  { icon: LayoutDashboard, label: "Layout" },
  { icon: Users, label: "Team" },
  { icon: Link2, label: "Links" },
  { icon: Bookmark, label: "Saved" },
  { icon: SlidersHorizontal, label: "Adjustments" },
  { icon: FilePlus, label: "New" },
  { icon: Settings, label: "Settings" },
];

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex w-full items-center justify-between rounded-[32px] bg-white/80 px-4 py-2.5 shadow-sm ring-1 ring-black/[0.02] sm:px-6 sm:py-3">
        {/* Left: nav links (desktop) / hamburger + tools (mobile) */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile tools popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
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
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "flex items-center rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                      link.active
                        ? "bg-[#BCBDEA]/20 text-[#3D4035]"
                        : "text-[#3D4035]/60 hover:bg-black/[0.03] hover:text-[#3D4035]/90"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              {/* Mobile tool icons */}
              <div className="grid grid-cols-5 gap-1">
                {toolIcons.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    title={label}
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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-2xl px-4 py-2 text-[14px] font-medium transition-colors",
                  link.active
                    ? "text-[#3D4035]"
                    : "text-[#3D4035]/60 hover:text-[#3D4035]/90"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Avatar className="size-9 ring-2 ring-white/50 sm:size-10">
            <AvatarImage
              src="https://api.dicebear.com/9.x/avataaars/svg?seed=finance"
              alt="User"
            />
            <AvatarFallback className="bg-[#3D5B46]/10 text-xs font-medium text-[#3D5B46]">
              KB
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
