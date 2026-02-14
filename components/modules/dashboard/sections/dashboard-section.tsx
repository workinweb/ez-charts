"use client";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import {
  ChartsOverview,
  ChartTypesDistribution,
  FavoritesStats,
  RecentCharts,
  SlidesOverview,
  DataSourcesBreakdown,
  RecentSlideDecks,
} from "@/components/modules/dashboard";
import { DashboardSectionSkeleton } from "@/components/modules/dashboard/dashboard-section-skeleton";
import {
  useDashboardSettingsStore,
  DASHBOARD_CARD_SPAN,
} from "@/stores/dashboard-settings-store";
import type { DashboardCardId } from "@/stores/dashboard-settings-store";
import { cn } from "@/lib/utils";

const CARD_COMPONENTS: Record<DashboardCardId, React.ComponentType> = {
  "charts-overview": ChartsOverview,
  "favorites-stats": FavoritesStats,
  "slides-overview": SlidesOverview,
  "chart-types-distribution": ChartTypesDistribution,
  "data-sources-breakdown": DataSourcesBreakdown,
  "recent-charts": RecentCharts,
  "recent-slide-decks": RecentSlideDecks,
};

const SPAN_CLASS: Record<number, string> = {
  3: "xl:col-span-3",
  6: "xl:col-span-6",
  12: "xl:col-span-12",
};

export function DashboardSection() {
  const cardOrder = useDashboardSettingsStore((s) => s.cardOrder);
  const settingsReady = useDashboardSettingsStore((s) => s.settingsReady);

  if (!settingsReady) {
    return <DashboardSectionSkeleton />;
  }

  return (
    <>
      <DashboardHeader />
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-12">
        {cardOrder.map((id) => {
          const Card = CARD_COMPONENTS[id];
          const span = DASHBOARD_CARD_SPAN[id] ?? 6;
          if (!Card) return null;
          return (
            <div
              key={id}
              className={cn("min-w-0", SPAN_CLASS[span] ?? SPAN_CLASS[6])}
            >
              <Card />
            </div>
          );
        })}
      </div>
    </>
  );
}
