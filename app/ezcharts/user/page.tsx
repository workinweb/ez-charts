"use client";

import { Navbar } from "@/components/layout/navbar";
import {
  BuyCustomCreditsDialog,
  PlansDialog,
} from "@/components/modules/plans";
import { UserSettingsSkeleton } from "@/components/skeletons/user-settings-skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/(auth)/auth-client";
import { TIER_LIMITS } from "@/lib/tiers/tier-limits";
import { cn } from "@/lib/utils";
import { useChatbotStore } from "@/stores/chatbot-store";
import {
  DASHBOARD_CARD_IDS,
  DASHBOARD_CARD_LABELS,
  useDashboardSettingsStore,
  type DashboardCardId,
} from "@/stores/dashboard-settings-store";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  BarChart3,
  Check,
  CheckCircle2,
  Coins,
  CreditCard,
  Crown,
  FileText,
  GripVertical,
  Loader2,
  Presentation,
  RotateCcw,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SecuritySection } from "@/components/modules/user/security-section";

function SortableCardRow({ id }: { id: DashboardCardId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = transform
    ? { transform: CSS.Transform.toString(transform), transition }
    : undefined;

  const toggleCard = useDashboardSettingsStore((s) => s.toggleCard);
  const isVisible = useDashboardSettingsStore((s) => s.isCardVisible(id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/40 bg-white/80 px-4 py-3.5 transition-colors",
        isDragging && "z-10 shadow-lg ring-2 ring-[#6C5DD3]/30",
        !isVisible && "opacity-60",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded-lg p-1.5 text-[#3D4035]/40 transition-colors hover:bg-black/[0.04] hover:text-[#3D4035]/70 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      <Checkbox
        checked={isVisible}
        onCheckedChange={() => toggleCard(id)}
        className="rounded-md"
      />

      <span className="flex-1 text-[15px] font-medium text-[#3D4035]">
        {DASHBOARD_CARD_LABELS[id]}
      </span>
    </div>
  );
}

function StaticCardRow({ id }: { id: DashboardCardId }) {
  const toggleCard = useDashboardSettingsStore((s) => s.toggleCard);
  const isVisible = useDashboardSettingsStore((s) => s.isCardVisible(id));

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border/40 bg-white/80 px-4 py-3.5 transition-colors",
        !isVisible && "opacity-60",
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-lg text-[#3D4035]/20">
        <GripVertical className="size-4" />
      </div>

      <Checkbox
        checked={isVisible}
        onCheckedChange={() => toggleCard(id)}
        className="rounded-md"
      />

      <span className="flex-1 text-[15px] font-medium text-[#3D4035]">
        {DASHBOARD_CARD_LABELS[id]}
      </span>
    </div>
  );
}

export default function UserPage() {
  const { data: session } = authClient.useSession();
  const settingsReady = useDashboardSettingsStore((s) => s.settingsReady);
  const cardOrder = useDashboardSettingsStore((s) => s.cardOrder);
  const setCardOrder = useDashboardSettingsStore((s) => s.setCardOrder);
  const resetToDefault = useDashboardSettingsStore((s) => s.resetToDefault);
  const saveDocumentsOnDb = useChatbotStore((s) => s.saveDocumentsOnDb);
  const setSaveDocumentsOnDb = useChatbotStore((s) => s.setSaveDocumentsOnDb);

  const savedSettings = useQuery(api.userSettings.get);
  const tierUsage = useQuery(api.tiers.planLimits.tierUsage);
  const upsertSettings = useMutation(api.userSettings.upsert);
  const createBillingPortal = useAction(api.stripe.stripe.createBillingPortalSession);
  const [saving, setSaving] = useState(false);
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const [buyCreditsDialogOpen, setBuyCreditsDialogOpen] = useState(false);

  const credits = savedSettings?.credits ?? 100;
  const planTier = (savedSettings?.planTier ?? "free") as
    | "free"
    | "pro"
    | "max";
  const renewDate = savedSettings?.renewDate;

  const dbCardOrder = savedSettings?.dashboardCardOrder ?? null;
  const dbSaveDocuments = savedSettings?.saveDocumentsOnDb ?? false;
  const dbChartDataEditorMode = (savedSettings?.chartDataEditorMode ??
    "table") as "table" | "items";
  const canSaveDocuments = TIER_LIMITS[planTier].canSaveDocuments;

  const [chartDataEditorMode, setChartDataEditorMode] = useState<
    "table" | "items"
  >(dbChartDataEditorMode);

  useEffect(() => {
    if (savedSettings?.chartDataEditorMode) {
      setChartDataEditorMode(
        savedSettings.chartDataEditorMode as "table" | "items",
      );
    }
  }, [savedSettings?.chartDataEditorMode]);

  const hasUnsavedChanges =
    savedSettings !== undefined &&
    (JSON.stringify(dbCardOrder ?? DASHBOARD_CARD_IDS) !==
      JSON.stringify(cardOrder) ||
      (canSaveDocuments && dbSaveDocuments !== saveDocumentsOnDb) ||
      dbChartDataEditorMode !== chartDataEditorMode);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = cardOrder as string[];
    const oldIndex = ids.indexOf(active.id as DashboardCardId);
    const newIndex = ids.indexOf(over.id as DashboardCardId);
    if (oldIndex === -1 || newIndex === -1) return;
    setCardOrder(arrayMove(cardOrder, oldIndex, newIndex));
  }

  const hiddenIds = DASHBOARD_CARD_IDS.filter((id) => !cardOrder.includes(id));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <Navbar />

      <div className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto flex w-full max-w-[800px] flex-col gap-8">
          {/* Profile card */}
          <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
            <div className="flex items-center gap-4">
              <UserAvatar size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold text-[#3D4035]">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-[14px] text-[#3D4035]/60">
                  {session?.user?.email ?? "—"}
                </p>
                {session?.user?.email && (
                  <p className="mt-1.5 flex items-center gap-2 text-[13px]">
                    {(session.user as { emailVerified?: boolean })
                      ?.emailVerified ? (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="size-4" />
                        Email verified
                      </span>
                    ) : (
                      <Link
                        href="/ezcharts/verification"
                        className="inline-flex items-center gap-1.5 font-medium text-[#6C5DD3] hover:underline"
                      >
                        Email not verified — Verify
                      </Link>
                    )}
                  </p>
                )}
              </div>
              <User className="size-5 text-[#3D4035]/30" />
            </div>

            {/* Tier usage summary */}
            {tierUsage && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#3D4035]/8 pt-5">
                <Link
                  href="/ezcharts/charts"
                  className="flex items-center gap-1.5 text-[13px] text-[#3D4035]/70 hover:text-[#6C5DD3]"
                >
                  <BarChart3 className="size-3.5 shrink-0" />
                  <span className="tabular-nums">
                    {tierUsage.chartsUsed}/
                    {tierUsage.chartsLimit === Infinity
                      ? "∞"
                      : tierUsage.chartsLimit}{" "}
                    charts
                  </span>
                </Link>
                <Link
                  href="/ezcharts/slides"
                  className="flex items-center gap-1.5 text-[13px] text-[#3D4035]/70 hover:text-[#6C5DD3]"
                >
                  <Presentation className="size-3.5 shrink-0" />
                  <span className="tabular-nums">
                    {tierUsage.slidesUsed}/
                    {tierUsage.slidesLimit === Infinity
                      ? "∞"
                      : tierUsage.slidesLimit}{" "}
                    slides
                  </span>
                </Link>
                <Link
                  href="/ezcharts"
                  className="flex items-center gap-1.5 text-[13px] text-[#3D4035]/70 hover:text-[#6C5DD3]"
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span className="tabular-nums">
                    {tierUsage.documentsUsed}/
                    {tierUsage.documentsLimit === Infinity
                      ? "∞"
                      : tierUsage.documentsLimit}{" "}
                    docs
                  </span>
                </Link>
                <Link
                  href="/ezcharts/credits"
                  className="flex items-center gap-1.5 text-[13px] text-[#3D4035]/70 hover:text-[#6C5DD3]"
                >
                  <Coins className="size-3.5 shrink-0" />
                  <span className="tabular-nums">
                    {tierUsage.creditsUsed}/{tierUsage.creditsLimit} credits
                  </span>
                </Link>
              </div>
            )}
          </section>

          {/* Security & password */}
          {session?.user?.email && (
            <SecuritySection
              email={session.user.email}
              emailVerified={
                !!(session.user as { emailVerified?: boolean })?.emailVerified
              }
            />
          )}

          {/* Plan & credits */}
          <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#6C5DD3]/20">
                  <CreditCard className="size-5 text-[#6C5DD3]" />
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#3D4035]">
                    Plan & Credits
                  </h2>
                  <p className="text-[13px] text-[#3D4035]/50">
                    {credits} credits
                    {renewDate
                      ? ` · Renews ${new Date(renewDate).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}`
                      : ""}{" "}
                    <span className="capitalize">{planTier}</span> plan
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setPlansDialogOpen(true)}
                  className="rounded-xl bg-[#6C5DD3] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#5a4dbf]"
                >
                  Change plan
                </Button>
                {savedSettings?.stripeCustomerId && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setBillingPortalLoading(true);
                        const base =
                          typeof window !== "undefined"
                            ? window.location.origin
                            : "";
                        const customerId = savedSettings?.stripeCustomerId;
                        if (!customerId) return;
                        const { url } = await createBillingPortal({
                          returnUrl: `${base}/ezcharts/user`,
                          stripeCustomerId: customerId,
                        });
                        if (url) window.location.href = url;
                      } finally {
                        setBillingPortalLoading(false);
                      }
                    }}
                    disabled={billingPortalLoading}
                    className="rounded-xl border-[#3D4035]/25 px-4 py-2 text-[14px] font-semibold text-[#3D4035] hover:bg-[#3D4035]/5"
                  >
                    {billingPortalLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Manage billing"
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setBuyCreditsDialogOpen(true)}
                  className="rounded-xl border-[#3D4035]/25 px-4 py-2 text-[14px] font-semibold text-[#3D4035] hover:bg-[#3D4035]/5"
                >
                  Buy credits
                </Button>
              </div>
            </div>
          </section>

          <PlansDialog
            open={plansDialogOpen}
            onOpenChange={setPlansDialogOpen}
          />
          <BuyCustomCreditsDialog
            open={buyCreditsDialogOpen}
            onOpenChange={setBuyCreditsDialogOpen}
          />

          {/* Dashboard cards */}
          {!settingsReady ? (
            <UserSettingsSkeleton />
          ) : (
            <>
              <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#3D4035]">
                      Dashboard cards
                    </h2>
                    <p className="mt-1 text-[13px] text-[#3D4035]/50">
                      Choose which cards appear on your dashboard and drag to
                      reorder.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefault}
                    className="gap-2 rounded-xl text-[13px] text-[#3D4035]/60 hover:text-[#3D4035]"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={cardOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {cardOrder.map((id) => (
                        <SortableCardRow key={id} id={id} />
                      ))}
                      {hiddenIds.map((id) => (
                        <StaticCardRow key={id} id={id} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </section>

              {/* Chat preferences */}
              <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                <h2 className="text-[18px] font-semibold text-[#3D4035]">
                  Chat preferences
                </h2>
                <p className="mt-1 mb-6 text-[13px] text-[#3D4035]/50">
                  Control how the AI assistant handles your data.
                </p>

                <label
                  htmlFor="save-docs"
                  className={cn(
                    "relative flex cursor-pointer items-center gap-4 rounded-2xl border border-border/40 bg-white/80 px-4 py-3.5 transition-colors",
                    canSaveDocuments && "hover:border-border/60",
                    !canSaveDocuments &&
                      "cursor-not-allowed opacity-70 hover:border-border/40",
                  )}
                >
                  {!canSaveDocuments && (
                    <Crown
                      className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#6C5DD3]"
                      aria-hidden
                    />
                  )}
                  <Checkbox
                    id="save-docs"
                    checked={canSaveDocuments ? saveDocumentsOnDb : false}
                    onCheckedChange={(v) =>
                      canSaveDocuments && setSaveDocumentsOnDb(!!v)
                    }
                    disabled={!canSaveDocuments}
                    className="rounded-md"
                  />
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-[#3D4035]">
                      Save documents on DB
                    </p>
                    <p className="text-[13px] text-[#3D4035]/50">
                      {canSaveDocuments
                        ? "When enabled, attached files from chat will be saved to your account."
                        : "Upgrade to Pro to save documents to your account. Free plan: files can be used in chat but are not stored."}
                    </p>
                  </div>
                </label>
              </section>

              {/* Editor preferences */}
              <section className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-black/[0.02] sm:rounded-[40px] sm:p-8">
                <h2 className="text-[18px] font-semibold text-[#3D4035]">
                  Editor preferences
                </h2>
                <p className="mt-1 mb-6 text-[13px] text-[#3D4035]/50">
                  Choose how chart data is edited across the app.
                </p>

                <div className="space-y-2">
                  <p className="text-[15px] font-medium text-[#3D4035]">
                    Data editor style
                  </p>
                  <p className="text-[13px] text-[#3D4035]/50 mb-3">
                    Spreadsheet shows a table layout; Cards show expandable
                    rows.
                  </p>
                  <div className="flex gap-2 rounded-lg bg-black/[0.03] p-1 w-fit">
                    <button
                      type="button"
                      onClick={() => setChartDataEditorMode("table")}
                      className={cn(
                        "rounded-md px-4 py-2 text-[13px] font-medium transition-colors",
                        chartDataEditorMode === "table"
                          ? "bg-white shadow-sm text-[#6C5DD3]"
                          : "text-[#3D4035]/60 hover:text-[#3D4035]",
                      )}
                    >
                      Spreadsheet
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartDataEditorMode("items")}
                      className={cn(
                        "rounded-md px-4 py-2 text-[13px] font-medium transition-colors",
                        chartDataEditorMode === "items"
                          ? "bg-white shadow-sm text-[#6C5DD3]"
                          : "text-[#3D4035]/60 hover:text-[#3D4035]",
                      )}
                    >
                      Cards
                    </button>
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-3">
                <Button
                  onClick={async () => {
                    setSaving(true);
                    setSaved(false);
                    try {
                      await upsertSettings({
                        dashboardCardOrder: cardOrder,
                        chartDataEditorMode,
                        ...(canSaveDocuments && {
                          saveDocumentsOnDb,
                        }),
                      });
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch {
                      // Error handling - could add toast
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving || !hasUnsavedChanges}
                  className="gap-2 rounded-xl bg-[#6C5DD3] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : saved ? (
                    <Check className="size-4" />
                  ) : null}
                  {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
                </Button>
                <p className="text-[13px] text-[#3D4035]/50">
                  Your preferences are saved locally until you click Save.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
