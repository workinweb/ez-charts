"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarIcon {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const mainIcons: SidebarIcon[] = [
  { icon: LayoutGrid, label: "Dashboard" },
  { icon: FileText, label: "Documents" },
  { icon: LayoutDashboard, label: "Layout" },
  { icon: Users, label: "Team" },
  { icon: Link2, label: "Links" },
  { icon: Bookmark, label: "Saved" },
  { icon: SlidersHorizontal, label: "Adjustments" },
];

const bottomIcons: SidebarIcon[] = [
  { icon: FilePlus, label: "New" },
  { icon: Settings, label: "Settings" },
];

function IconBtn({ icon: Icon, label, active }: SidebarIcon) {
  return (
    <button
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-xl transition-all duration-200",
        active
          ? "bg-primary/12 text-primary"
          : "text-foreground/35 hover:bg-foreground/5 hover:text-foreground/55",
      )}
    >
      <Icon className="size-[17px]" strokeWidth={1.7} />
    </button>
  );
}

export function IconSidebar() {
  return (
    <aside className="hidden h-full w-16 shrink-0 flex-col items-center gap-3 bg-background py-4 pl-3 rounded-l-3xl md:flex">
      <div className="flex flex-col items-center rounded-2xl bg-white/80 p-1.5 shadow-sm ring-1 ring-black/[0.04]">
        <button
          title="Search"
          className="flex size-9 items-center justify-center rounded-xl text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground/60"
        >
          <Search className="size-[17px]" strokeWidth={1.7} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center rounded-2xl bg-white/80 p-1.5 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col items-center gap-0.5">
          {mainIcons.map((item) => (
            <IconBtn key={item.label} {...item} />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center rounded-2xl bg-white/80 p-1.5 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col items-center gap-0.5">
          {bottomIcons.map((item) => (
            <IconBtn key={item.label} {...item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
