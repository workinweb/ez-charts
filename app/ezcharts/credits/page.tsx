"use client";

import {
  BuyCustomCreditsDialog,
  PlansDialog,
} from "@/components/modules/plans";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { TIER_LIMITS } from "@/lib/tiers/tier-limits";
import { authClient } from "@/lib/(auth)/auth-client";
import { usePaginatedQuery, useQuery } from "convex/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Coins,
  Loader2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PAGE_SIZE = 20;
const PREVIEW_LENGTH = 60;

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CreditsPage() {
  const { data: session } = authClient.useSession();
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const settings = useQuery(api.userSettings.get, session?.user ? {} : "skip");
  const planTier = (settings?.planTier ?? "free") as "free" | "pro" | "max";
  const credits = settings?.credits ?? 100;
  const maxCredits = TIER_LIMITS[planTier].credits;

  const {
    results: activityPage,
    status: activityStatus,
    loadMore: loadMoreActivity,
  } = usePaginatedQuery(
    api.credits.creditActivity.listPaginated,
    session?.user ? {} : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  if (!session?.user) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 bg-[#E8E7F5] p-8">
        <p className="text-[15px] text-[#3D4035]/60">
          Sign in to view your credits.
        </p>
        <Button asChild>
          <Link href="/sign-in" className="rounded-xl">
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  const hasMoreActivity = activityStatus === "CanLoadMore";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#E8E7F5]">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6 lg:flex-row lg:gap-8 lg:p-8">
        {/* Left: header + balance card */}
        <div className="flex min-w-0 shrink-0 flex-col gap-6 lg:w-[340px]">
          <div>
            <h1 className="text-[24px] font-semibold text-[#3D4035]">
              Credits
            </h1>
            <p className="mt-1 text-[14px] text-[#3D4035]/60">
              Manage your AI usage and top up when needed.
            </p>
          </div>

          {/* Balance card */}
          <div className="rounded-[24px] bg-white/90 p-6 shadow-sm ring-1 ring-[#6C5DD3]/10 sm:rounded-[28px] sm:p-7">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#BCBDEA]/25">
                  <Coins className="size-6 text-[#6C5DD3]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#3D4035]/60">
                    Current balance
                  </p>
                  <p className="text-[22px] font-bold tabular-nums text-[#3D4035]">
                    {credits}
                    <span className="text-[15px] font-normal text-[#3D4035]/50">
                      {" "}
                      / {maxCredits} credits
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setBuyCreditsOpen(true)}
                  className="w-full gap-2 rounded-xl bg-[#6C5DD3] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#5a4dbf]"
                >
                  <Plus className="size-4" />
                  Buy credits
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPlansDialogOpen(true)}
                  className="w-full rounded-xl border-[#6C5DD3]/30 bg-white/60 px-5 py-2.5 text-[14px] font-medium text-[#6C5DD3] hover:bg-[#6C5DD3]/10"
                >
                  Upgrade plan
                </Button>
              </div>
            </div>
          </div>

          <p className="text-[12px] text-[#3D4035]/45">
            <Link href="/ezcharts" className="hover:underline">
              ← Back to dashboard
            </Link>
          </p>
        </div>

        {/* Right: Activity */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="rounded-[24px] bg-white/90 p-6 shadow-sm ring-1 ring-[#6C5DD3]/10 sm:rounded-[28px] sm:p-8 sm:flex-1 sm:flex sm:flex-col">
            <h2 className="text-[18px] font-semibold text-[#3D4035]">
              Activity
            </h2>
            <p className="mt-1 text-[13px] text-[#3D4035]/55">
              Credits spent on AI chat and added from purchases.
            </p>

            <div className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {activityStatus === "LoadingMore" && activityPage.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[14px] text-[#3D4035]/50">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          ) : activityPage.length === 0 ? (
            <div className="py-12 text-center text-[14px] text-[#3D4035]/50">
              No activity yet. Start a chat or buy credits to see your history.
            </div>
          ) : (
            <>
              {activityPage.map((item) =>
                item.type === "spent" ? (() => {
                  const content = item.content?.trim() || "Chart / response";
                  const isLong = content.length > PREVIEW_LENGTH;
                  const isExpanded = expandedId === item._id;
                  const displayText =
                    isExpanded ? content : content.slice(0, PREVIEW_LENGTH) + (isLong ? "…" : "");
                  return (
                  <div
                    key={item._id}
                    className="rounded-xl px-4 py-3 transition-colors hover:bg-[#6C5DD3]/8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                          <ArrowDown className="size-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium text-[#3D4035]">
                            AI chat
                          </p>
                          <p
                            className={`text-[12px] text-[#3D4035]/50 ${
                              isExpanded
                                ? "whitespace-pre-wrap break-words"
                                : "truncate"
                            }`}
                          >
                            {displayText}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <p className="text-[11px] text-[#3D4035]/40">
                              {formatDate(item.createdAt)}
                            </p>
                            {isLong && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId((id) =>
                                    id === item._id ? null : item._id
                                  )
                                }
                                className="flex items-center gap-0.5 text-[11px] text-[#6C5DD3] hover:underline"
                              >
                                {expandedId === item._id ? (
                                  <>
                                    <ChevronUp className="size-3" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="size-3" />
                                    Show full message
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[14px] font-semibold tabular-nums text-red-600">
                        −{item.creditsCharged}
                      </span>
                    </div>
                  </div>
                  );
                })() : (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-[#6C5DD3]/8"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                        <ArrowUp className="size-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[#3D4035]">
                          Credits added
                        </p>
                        <p className="text-[12px] text-[#3D4035]/50 capitalize">
                          {item.source?.replace("_", " ") ?? "Purchase"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#3D4035]/40">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums text-green-600">
                      +{item.credits}
                    </span>
                  </div>
                ),
              )}

              {hasMoreActivity && (
                <div className="pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => loadMoreActivity(PAGE_SIZE)}
                    className="w-full text-[13px] text-[#6C5DD3] hover:bg-[#6C5DD3]/10"
                  >
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
            </div>
          </div>
        </div>
      </div>

      <BuyCustomCreditsDialog
        open={buyCreditsOpen}
        onOpenChange={setBuyCreditsOpen}
      />
      <PlansDialog open={plansDialogOpen} onOpenChange={setPlansDialogOpen} />
    </div>
  );
}
