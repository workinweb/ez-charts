"use client";

import { cn } from "@/lib/utils";
import { useChatbotStore } from "@/stores";
import type { SectionKey } from "@/stores/section-store";
import { useSectionStore } from "@/stores/section-store";
import {
  Bookmark,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarIcon {
  icon: React.ElementType;
  label: string;
  sectionKey: SectionKey;
}

const mainIcons: SidebarIcon[] = [
  { icon: LayoutDashboard, label: "Dashboard", sectionKey: "dashboard" },
  { icon: FileText, label: "Documents", sectionKey: "documents" },
  // { icon: LayoutGrid, label: "Layout", sectionKey: "layout" },
  // { icon: Users, label: "Team", sectionKey: "team" },
  // { icon: Link2, label: "Links", sectionKey: "links" },
  // { icon: Bookmark, label: "Saved", sectionKey: "saved" },
  // { icon: SlidersHorizontal, label: "Adjustments", sectionKey: "adjustments" },
];

const bottomIcons: SidebarIcon[] = [
  { icon: Sparkles, label: "AI Builds", sectionKey: "new" },
];

function IconBtn({
  icon: Icon,
  label,
  sectionKey,
  active,
  onClick,
}: SidebarIcon & { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
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
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useChatbotStore((s) => s.chatSidebarCollapsed);

  const { activeSection, setActiveSection } = useSectionStore();
  const isOnHome = pathname === "/ezcharts" || pathname === "/ezcharts/";

  const handleIconClick = (sectionKey: SectionKey) => {
    setActiveSection(sectionKey);
    if (!isOnHome) {
      router.push("/ezcharts");
    }
  };

  return (
    <aside
      className={cn(
        "hidden h-full w-18 shrink-0 flex-col items-center gap-3 bg-background py-4 pl-3 transition-[border-radius] duration-300 ease-out md:flex",
        !collapsed && "rounded-l-3xl",
      )}
    >
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-white/80 p-1.5 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col items-center gap-1 ">
          {mainIcons.map((item) => (
            <IconBtn
              key={item.sectionKey}
              {...item}
              active={isOnHome && activeSection === item.sectionKey}
              onClick={() => handleIconClick(item.sectionKey)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center rounded-2xl bg-white/80 p-1.5 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex flex-col items-center gap-0.5">
          {bottomIcons.map((item) => (
            <IconBtn
              key={item.sectionKey}
              {...item}
              active={isOnHome && activeSection === item.sectionKey}
              onClick={() => handleIconClick(item.sectionKey)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
