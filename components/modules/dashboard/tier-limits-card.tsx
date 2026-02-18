"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Coffee,
  Coins,
  Crown,
  FileText,
  Presentation,
  Zap,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TIER_ICONS = {
  free: Coffee,
  pro: Zap,
  max: Crown,
} as const;

function formatLimit(value: number): string {
  return value === Infinity ? "unlimited" : String(value);
}

const ITEMS = [
  {
    key: "charts" as const,
    label: "Charts",
    icon: BarChart3,
    href: "/ezcharts/charts",
  },
  {
    key: "slides" as const,
    label: "Slide decks",
    icon: Presentation,
    href: "/ezcharts/slides",
  },
  {
    key: "documents" as const,
    label: "Documents",
    icon: FileText,
    href: "/ezcharts",
  },
  {
    key: "credits" as const,
    label: "Credits",
    icon: Coins,
    href: "/ezcharts/credits",
  },
] as const;

export function TierLimitsCard() {
  const usage = useQuery(api.planLimits.tierUsage);
  const isLoading = usage === undefined;

  const planTier = usage?.planTier ?? "free";
  const tierLabel = planTier.charAt(0).toUpperCase() + planTier.slice(1);
  const TierIcon = TIER_ICONS[planTier];

  const getUsed = (key: (typeof ITEMS)[number]["key"]) => {
    if (!usage) return 0;
    switch (key) {
      case "charts":
        return usage.chartsUsed;
      case "slides":
        return usage.slidesUsed;
      case "documents":
        return usage.documentsUsed;
      case "credits":
        return usage.creditsUsed;
      default:
        return 0;
    }
  };

  const getLimit = (key: (typeof ITEMS)[number]["key"]) => {
    if (!usage) return 0;
    switch (key) {
      case "charts":
        return usage.chartsLimit;
      case "slides":
        return usage.slidesLimit;
      case "documents":
        return usage.documentsLimit;
      case "credits":
        return usage.creditsLimit;
      default:
        return 0;
    }
  };

  return (
    <Card className="col-span-full rounded-[32px] bg-white ring-1 ring-[#3D4035]/6 shadow-sm lg:col-span-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-[18px] font-medium text-[#3D4035]">
          Your plan limits
        </CardTitle>
        <span className="flex items-center gap-1.5 rounded-full bg-[#6C5DD3]/10 px-2.5 py-0.5 text-[12px] font-semibold text-[#6C5DD3]">
          <TierIcon className="size-3 shrink-0" />
          {tierLabel}
        </span>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3 sm:gap-4">
        {ITEMS.map(({ key, label, icon: Icon, href }) => {
          const used = getUsed(key);
          const limit = getLimit(key);
          const limitStr = formatLimit(limit);
          const isNearLimit = limit !== Infinity && used >= limit && limit > 0;
          const isCredits = key === "credits";

          return (
            <Link
              key={key}
              href={href}
              className="flex items-center gap-3 rounded-2xl bg-[#F5F5F4]/80 p-4 transition-colors hover:bg-[#6C5DD3]/8"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6C5DD3]/10">
                <Icon className="size-5 text-[#6C5DD3]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#3D4035]">
                  {label}
                </p>
                <p
                  className={`text-[15px] font-semibold tabular-nums ${
                    isNearLimit ? "text-red-600" : "text-[#3D4035]"
                  }`}
                >
                  {isLoading ? (
                    "—"
                  ) : isCredits ? (
                    <>
                      {used}
                      <span className="font-normal text-[#3D4035]/60">
                        {" "}
                        / {limitStr}
                      </span>
                    </>
                  ) : (
                    <>
                      {used} / {limitStr}
                    </>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </CardContent>

      <div className="border-t border-[#3D4035]/5 px-6 pt-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-auto px-4 text-[13px] py-2 font-medium text-[#6C5DD3] hover:bg-transparent hover:text-[#5a4dbf]"
        >
          <Link href="/ezcharts/user">Upgrade plan →</Link>
        </Button>
      </div>
    </Card>
  );
}
