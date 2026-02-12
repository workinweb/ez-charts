"use client";

import { getChartTypeByName } from "@/components/rosencharts";
import { data } from "@/components/rosencharts/fixture/exampleChartsData";

export default function ExamplesPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-background">
      <div className="px-3 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Chart Examples
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              All available chart types
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => {
              const chart = getChartTypeByName(
                item.data as Parameters<typeof getChartTypeByName>[0],
                item.chartType,
                {
                  withTooltip: item.withTooltip,
                  withAnimation: item.withAnimation,
                  className: "min-h-[200px] w-full",
                },
              );

              if (!chart) return null;

              return (
                <section
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[28px] border border-border/40 bg-white/80 p-5 shadow-sm sm:rounded-[40px] sm:p-8"
                >
                  <h2 className="text-base font-semibold text-foreground sm:text-lg">
                    {item.name}
                  </h2>
                  <div className="min-h-[220px] w-full">{chart}</div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
