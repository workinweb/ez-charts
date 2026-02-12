"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navLinks = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Favorites", href: "/favorites" },
  { label: "All Charts", href: "/charts" },
];

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-5 py-4">
      <div className="flex w-full items-center justify-between rounded-[32px] bg-white/80 px-6 py-3 shadow-sm ring-1 ring-black/[0.02]">
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-2xl px-4 py-2 text-[14px] font-medium transition-colors",
                  link.active
                    ? "text-[#3D4035]"
                    : "text-[#3D4035]/60 hover:text-[#3D4035]/90",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-white/50">
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
