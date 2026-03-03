"use client";

import { PlansDialog } from "@/components/modules/plans";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { api } from "@/convex/_generated/api";
import { useChartById } from "@/hooks/use-charts";
import { useFeatureCheck } from "@/hooks/use-feature-check";
import { authClient } from "@/lib/(auth)/auth-client";
import { TIER_LIMITS } from "@/lib/tiers/tier-limits";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useChartsStore } from "@/stores/charts-store";
import { useQuery } from "convex/react";
import {
  ChevronDown,
  Coffee,
  Coins,
  Crown,
  Home,
  LayoutGrid,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const PLAN_ICONS = { free: Coffee, pro: Zap, max: Crown } as const;

const navItems = [
  { label: "Home", href: "/ezcharts", icon: Home },
  { label: "Examples", href: "/ezcharts/examples", icon: LayoutGrid },
  { label: "Contact us", href: "/contact", icon: Mail },
  { label: "Opinions", href: "/opinions", icon: MessageSquare },
] as const;

function AppNavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const [createChartConfirmOpen, setCreateChartConfirmOpen] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);

  const settings = useQuery(api.userSettings.get, session?.user ? {} : "skip");
  const { canUse } = useFeatureCheck();
  const chartAllowed = canUse("createChart");
  const planTier = (settings?.planTier ?? "free") as "free" | "pro" | "max";
  const showUpgradeButton = planTier !== "max";

  const credits = settings?.credits ?? 100;
  const maxCredits = TIER_LIMITS[planTier].credits;

  // Read last-edited chart ID from the Zustand store
  const lastEditedChartId = useChartsStore((s) => s.lastEditedChartId);
  // const setLastEditedChartId = useChartsStore((s) => s.setLastEditedChartId);

  const chartFromUrl =
    pathname === "/ezcharts/edit" ? searchParams.get("chart") : null;

  const editingChartId = chartFromUrl ?? lastEditedChartId;
  const isEditingChart = pathname === "/ezcharts/edit" && !!chartFromUrl;
  const editingChart = useChartById(editingChartId ?? undefined);

  const currentLabel =
    pathname === "/ezcharts/edit" && editingChartId
      ? `Editing: ${editingChart?.title ?? "Chart"}`
      : pathname === "/ezcharts/edit"
        ? "Create chart"
        : (navItems.find(
            (n) =>
              n.href === pathname ||
              (n.href !== "/ezcharts" && pathname?.startsWith(n.href)),
          )?.label ?? "Home page");

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/40 bg-[#E9EEF0] px-3 sm:px-4">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-foreground/5 sm:ml-2">
              <UserAvatar size="sm" />
              <span className="text-[13px] font-semibold text-foreground/80">
                {session?.user?.name ?? "User"}
              </span>
              <ChevronDown className="hidden size-3 text-foreground/40 sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[180px] rounded-xl border-0 bg-white p-1 shadow-xl"
          >
            <DropdownMenuItem asChild>
              <Link
                href="/ezcharts/credits"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5"
              >
                <Coins className="size-3.5 text-[#6C5DD3]/70" />
                <span>
                  {credits}
                  <span className="text-foreground/40">
                    {" "}
                    / {maxCredits}
                  </span>{" "}
                  credits
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild>
              <Link
                href="/ezcharts/user"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5"
              >
                <User className="size-3.5 text-foreground/50" />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onSelect={async () => {
                try {
                  useChatbotStore.getState().clearFiles();
                  await authClient.signOut();
                } finally {
                  router.replace("/");
                }
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50"
            >
              <LogOut className="size-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center — tabs — hide on small mobile */}
      <div className="hidden items-center gap-1 sm:flex">
        <span className="flex items-center gap-1.5 rounded-lg bg-foreground/8 px-3 py-1 text-[12px] font-medium text-foreground/70">
          {(() => {
            const TierIcon = PLAN_ICONS[planTier];
            return <TierIcon className="size-3.5 shrink-0" />;
          })()}
          {planTier.charAt(0).toUpperCase() + planTier.slice(1)}
        </span>

        <div className="mx-2 h-4 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground/80">
              <Home className="size-3.5 text-foreground/40" />
              <span>{currentLabel}</span>
              <ChevronDown className="size-3 text-foreground/30" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="min-w-[180px] rounded-xl border-0 bg-white p-1 shadow-xl"
          >
            {navItems.map(({ label, href, icon: Icon }) => (
              <DropdownMenuItem key={href} asChild>
                <Link
                  href={href}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5"
                >
                  <Icon className="size-3.5 text-foreground/50" />
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            {isEditingChart ? (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  if (!chartAllowed.allowed) return;
                  setCreateChartConfirmOpen(true);
                }}
                disabled={!chartAllowed.allowed}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                title={!chartAllowed.allowed ? chartAllowed.reason : undefined}
              >
                <Plus className="size-3.5 text-foreground/50" />
                Create Chart
              </DropdownMenuItem>
            ) : chartAllowed.allowed ? (
              <DropdownMenuItem asChild>
                <Link
                  href="/ezcharts/edit"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5"
                >
                  <Plus className="size-3.5 text-foreground/50" />
                  Create Chart
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled
                className="flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/50"
                title={chartAllowed.reason}
              >
                <Plus className="size-3.5 text-foreground/40" />
                Create Chart
              </DropdownMenuItem>
            )}
            {editingChartId && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/ezcharts/edit?chart=${editingChartId}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5"
                  >
                    <Pencil className="size-3.5 text-foreground/50" />
                    {editingChart
                      ? `Edit: ${editingChart.title}`
                      : "Edit chart"}
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {showUpgradeButton && (
          <Button
            size="xs"
            onClick={() => setPlansDialogOpen(true)}
            className="rounded-lg bg-[#7c6ee8] px-3 text-[11px] font-semibold text-white hover:bg-[#6b5dd4]"
          >
            Upgrade
          </Button>
        )}
      </div>

      <PlansDialog open={plansDialogOpen} onOpenChange={setPlansDialogOpen} />

      <AlertDialog
        open={createChartConfirmOpen}
        onOpenChange={setCreateChartConfirmOpen}
      >
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Start new chart?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current data will be replaced with the default creation
              template. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                router.push("/ezcharts/edit");
                setCreateChartConfirmOpen(false);
              }}
              className="bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
            >
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}

export function AppNavbar() {
  return (
    <Suspense fallback={null}>
      <AppNavbarInner />
    </Suspense>
  );
}
