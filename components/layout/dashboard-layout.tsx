"use client";

import { Navbar } from "./navbar";
import { DashboardHeader } from "./dashboard-header";
import {
  ChartsOverview,
  FavoritesStats,
  ChartTypesDistribution,
  RecentCharts,
} from "@/components/modules/dashboard";

export function DashboardContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-6 pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
          <DashboardHeader />

          <div className="grid grid-cols-12 gap-6">
            <ChartsOverview />
            <FavoritesStats />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <ChartTypesDistribution />
            <RecentCharts />
          </div>
        </div>
      </div>
    </div>
  );
}
