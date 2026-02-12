"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BarChart3 } from "lucide-react";

export function FavoritesStats() {
  return (
    <Card className="col-span-full rounded-[32px] bg-[#354052] text-white ring-0 lg:col-span-5 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-[18px] font-medium text-white/90">
          Your Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 p-0">
        <div className="flex flex-col justify-between rounded-[28px] bg-[#6C5DD3] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Heart className="size-4 text-white/80" />
            <p className="text-[13px] font-medium text-white/80">
              Favorites
            </p>
          </div>
          <p className="text-[11px] font-medium text-white/50">
            Saved for later
          </p>
          <div className="mt-8">
            <span className="text-[32px] font-light leading-none tracking-tight text-white lg:text-[48px]">
              9
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[28px] bg-[#94B49F] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-[#1F2128]/80" />
            <p className="text-[13px] font-medium text-[#1F2128]/80">
              This Week
            </p>
          </div>
          <p className="text-[11px] font-medium text-[#1F2128]/50">
            Charts created
          </p>
          <div className="mt-8">
            <div className="flex items-baseline">
              <span className="text-[32px] font-light leading-none tracking-tight text-[#1F2128] lg:text-[48px]">
                12
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
