"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, FileText, MessageCircle, FileJson } from "lucide-react";

const dataSources = [
  { name: "From prompt", count: 34, icon: MessageCircle, color: "#6C5DD3" },
  { name: "CSV files", count: 18, icon: FileText, color: "#94B49F" },
  { name: "Excel files", count: 12, icon: FileSpreadsheet, color: "#6CB4EE" },
  { name: "JSON / other", count: 8, icon: FileJson, color: "#e87c5c" },
];

const maxCount = Math.max(...dataSources.map((d) => d.count));

export function DataSourcesBreakdown() {
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
          {dataSources.map((source) => {
            const Icon = source.icon;
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
                      backgroundColor: source.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
