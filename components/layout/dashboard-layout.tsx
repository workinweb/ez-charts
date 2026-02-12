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

      <div className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 sm:gap-6">
          <DashboardHeader />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
            <ChartsOverview />
            <FavoritesStats />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-12">
            <ChartTypesDistribution />
            <RecentCharts />
          </div>
        </div>
      </div>
    </div>
  );
}
