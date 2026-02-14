"use client";

import { cn } from "@/lib/utils";
import { useSectionStore } from "@/stores/section-store";
import type { SectionKey } from "@/stores/section-store";
import { Navbar } from "./navbar";
import {
  DashboardSection,
  DocumentsSection,
  LayoutSection,
  TeamSection,
  LinksSection,
  SavedSection,
  AdjustmentsSection,
  NewSection,
} from "@/components/modules/dashboard/sections";

const SECTION_MAP: Record<SectionKey, React.ComponentType> = {
  dashboard: DashboardSection,
  documents: DocumentsSection,
  layout: LayoutSection,
  team: TeamSection,
  links: LinksSection,
  saved: SavedSection,
  adjustments: AdjustmentsSection,
  new: NewSection,
};

export function DashboardContent() {
  const activeSection = useSectionStore((s) => s.activeSection);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-4 sm:pb-6 md:px-5 lg:px-6 lg:pb-8 xl:px-6 xl:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-4 sm:gap-6">
          {/* Render all sections; hide inactive ones to preserve state (no unmount) */}
          {(Object.keys(SECTION_MAP) as SectionKey[]).map((key) => {
            const Section = SECTION_MAP[key];
            const isActive = activeSection === key;
            return (
              <div
                key={key}
                aria-hidden={!isActive}
                className={cn(
                  "flex flex-col gap-4 sm:gap-6",
                  !isActive && "hidden",
                )}
              >
                <Section />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
