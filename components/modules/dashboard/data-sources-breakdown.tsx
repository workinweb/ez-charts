"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileSpreadsheet,
  FileText,
  MessageCircle,
  FileJson,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

const SOURCE_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  "From prompt": { icon: MessageCircle, color: "#6C5DD3" },
  Manual: { icon: BarChart3, color: "#94B49F" },
  "CSV files": { icon: FileText, color: "#6CB4EE" },
  "Excel files": { icon: FileSpreadsheet, color: "#6CB4EE" },
  "JSON / other": { icon: FileJson, color: "#e87c5c" },
  Other: { icon: FileJson, color: "#e87c5c" },
};

const DEFAULT_CONFIG = { icon: FileJson, color: "#8b95a8" };

const ALL_SOURCES = [
  "From prompt",
  "Manual",
  "CSV files",
  "Excel files",
  "JSON / other",
] as const;

export function DataSourcesBreakdown() {
  const { stats, isLoading } = useDashboardStats();
  const fromApi = new Map(stats.dataSources.map((d) => [d.name, d.count]));
  const dataSources = [
    ...ALL_SOURCES.map((name) => ({
      name,
      count: fromApi.get(name) ?? 0,
    })),
    ...stats.dataSources
      .filter((d) => !ALL_SOURCES.includes(d.name as (typeof ALL_SOURCES)[number]))
      .map((d) => ({ name: d.name, count: d.count })),
  ];
  const maxCount = Math.max(...dataSources.map((d) => d.count), 1);

  return (
    <Card className="col-span-full rounded-[32px] bg-[#354052] text-white ring-0 p-6 md:col-span-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-[18px] font-medium text-white/90">
          Data Sources
        </CardTitle>
        <p className="mt-1 text-[13px] text-white/50">
          Where your charts get their data from
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                  <div className="h-2 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            dataSources.map((source) => {
              const config =
                SOURCE_CONFIG[source.name] ?? DEFAULT_CONFIG;
              const Icon = config.icon;
            const pct = maxCount > 0 ? (source.count / maxCount) * 100 : 0;
            return (
              <div key={source.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-white/60" />
                    <span className="text-[14px] font-medium text-white/90">
                      {source.name}
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-white/70">
                    {source.count} charts
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
