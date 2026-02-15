"use client";

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
import { PlansDialog } from "@/components/modules/plans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/(auth)/auth-client";
import { useChartById } from "@/hooks/use-charts";
import { useChartsStore } from "@/stores/charts-store";
import {
  Bookmark,
  ChevronDown,
  Coins,
  Home,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Share,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Examples", href: "/examples", icon: LayoutGrid },
] as const;

function AppNavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const [createChartConfirmOpen, setCreateChartConfirmOpen] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);

  const settings = useQuery(
    api.userSettings.get,
    session?.user ? {} : "skip"
  );
  const planTier = (settings?.planTier ?? "free") as "free" | "pro" | "max";
  const showUpgradeButton = planTier !== "max";

  const credits = settings?.credits ?? 100;
  const maxCredits =
    planTier === "max" ? 1000 : planTier === "pro" ? 500 : 100;

  // Read last-edited chart ID from the Zustand store
  const lastEditedChartId = useChartsStore((s) => s.lastEditedChartId);
  const setLastEditedChartId = useChartsStore((s) => s.setLastEditedChartId);

  const chartFromUrl = pathname === "/edit" ? searchParams.get("chart") : null;

  // Sync URL → store when the URL has a chart param
  useEffect(() => {
    if (chartFromUrl) {
      setLastEditedChartId(chartFromUrl);
    }
  }, [chartFromUrl, setLastEditedChartId]);

  const editingChartId = chartFromUrl ?? lastEditedChartId;
  const isEditingChart = pathname === "/edit" && !!chartFromUrl;
  const editingChart = useChartById(editingChartId ?? undefined);

  const currentLabel =
    pathname === "/edit" && editingChartId
      ? `Editing: ${editingChart?.title ?? "Chart"}`
      : pathname === "/edit"
        ? "Create chart"
        : (navItems.find(
            (n) =>
              n.href === pathname ||
              (n.href !== "/" && pathname?.startsWith(n.href)),
          )?.label ?? "Home page");

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/40 bg-[#E9EEF0] px-3 sm:px-4">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-foreground/5 sm:ml-2">
              <div className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-[#BCBDEA] to-[#6C5DD3]">
                <span className="text-[8px] font-bold text-white">
                  {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>
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
            <div className="flex items-center gap-2 rounded-lg px-3 py-2">
              <Coins className="size-3.5 text-[#6C5DD3]/70" />
              <span className="text-[12px] font-medium text-foreground/70">
                {credits}
                <span className="text-foreground/40"> / {maxCredits}</span>{" "}
                credits
              </span>
            </div>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild>
              <Link
                href="/user"
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5"
              >
                <User className="size-3.5 text-foreground/50" />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onSelect={async () => {
                await authClient.signOut();
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50"
            >
              <LogOut className="size-3.5" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Icon buttons — hide on small mobile */}
        <div className="ml-1 hidden items-center gap-0.5 sm:flex">
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-lg text-foreground/40 hover:text-foreground/70"
          >
            <Share className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-lg text-foreground/40 hover:text-foreground/70"
          >
            <Bookmark className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Center — tabs — hide on small mobile */}
      <div className="hidden items-center gap-1 sm:flex">
        <span className="rounded-lg bg-foreground/8 px-3 py-1 text-[12px] font-medium text-foreground/70">
          Dashboard
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
                  setCreateChartConfirmOpen(true);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5 focus:outline-none"
              >
                <Plus className="size-3.5 text-foreground/50" />
                Create Chart
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link
                  href="/edit"
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5"
                >
                  <Plus className="size-3.5 text-foreground/50" />
                  Create Chart
                </Link>
              </DropdownMenuItem>
            )}
            {editingChartId && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/edit?chart=${editingChartId}`}
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
        <Button
          variant="ghost"
          size="icon-xs"
          className="rounded-lg text-foreground/40"
        >
          <MoreHorizontal className="size-3.5" />
        </Button>

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
                router.push("/edit");
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
