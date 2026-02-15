"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { BenchmarkChart } from "@/components/charts/rosencharts";
import type { BenchmarkChartItem } from "@/components/charts/rosencharts";

const SOURCE_CONFIG: Record<string, { color: string }> = {
  "From prompt": { color: "#6C5DD3" },
  Manual: { color: "#94B49F" },
  "CSV files": { color: "#6CB4EE" },
  "Excel files": { color: "#6CB4EE" },
  "JSON / other": { color: "#e87c5c" },
  Other: { color: "#e87c5c" },
};

const DEFAULT_COLOR = "#8b95a8";

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
      .filter(
        (d) => !ALL_SOURCES.includes(d.name as (typeof ALL_SOURCES)[number]),
      )
      .map((d) => ({ name: d.name, count: d.count })),
  ];

  const benchmarkData: BenchmarkChartItem[] = dataSources.map((d) => {
    const config = SOURCE_CONFIG[d.name] ?? { color: DEFAULT_COLOR };
    return {
      key: d.name,
      value: d.count,
      colorFrom: config.color,
      colorTo: config.color,
    };
  });

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
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                <div className="h-2 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        ) : benchmarkData.length === 0 ? (
          <p className="text-[13px] text-white/50">No data sources yet</p>
        ) : (
          <div className="[&_*]:!text-white/90">
            <BenchmarkChart data={benchmarkData} withTooltip withAnimation />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
