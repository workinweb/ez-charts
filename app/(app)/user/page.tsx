"use client";

import { Navbar } from "@/components/layout/navbar";
import { UserSettingsSkeleton } from "@/components/skeletons/user-settings-skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/(auth)/auth-client";
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
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  CreditCard,
  GripVertical,
  Loader2,
  RotateCcw,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  BuyCustomCreditsDialog,
  PlansDialog,
} from "@/components/modules/plans";

function ResendVerificationButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        setSent(false);
        await authClient.sendVerificationEmail({ email, callbackURL: "/user" });
        setSent(true);
        setLoading(false);
      }}
      disabled={loading}
      className="mt-2 text-[12px] font-medium text-[#6C5DD3] hover:underline disabled:opacity-50"
    >
      {loading
        ? "Sending…"
        : sent
          ? "Verification email sent"
          : "Resend verification email"}
    </button>
  );
}

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
  const upsertSettings = useMutation(api.userSettings.upsert);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const [buyCreditsDialogOpen, setBuyCreditsDialogOpen] = useState(false);

  const credits = savedSettings?.credits ?? 100;
  const planTier = (savedSettings?.planTier ?? "free") as "free" | "pro" | "max";
  const renewDate = savedSettings?.renewDate;

  const dbCardOrder = savedSettings?.dashboardCardOrder ?? null;
  const dbSaveDocuments = savedSettings?.saveDocumentsOnDb ?? false;
  const hasUnsavedChanges =
    savedSettings !== undefined &&
    (JSON.stringify(dbCardOrder ?? DASHBOARD_CARD_IDS) !==
      JSON.stringify(cardOrder) ||
      dbSaveDocuments !== saveDocumentsOnDb);

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
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600">
                <span className="text-[20px] font-bold text-white">
                  {session?.user?.name?.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold text-[#3D4035]">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-[14px] text-[#3D4035]/60">
                  {session?.user?.email ?? "—"}
                </p>
                {session?.user?.email &&
                  !(session?.user as { emailVerified?: boolean })
                    ?.emailVerified && (
                    <ResendVerificationButton email={session.user.email} />
                  )}
              </div>
              <User className="size-5 text-[#3D4035]/30" />
            </div>
          </section>

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
                      ? ` · Renews ${new Date(renewDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
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

          <PlansDialog open={plansDialogOpen} onOpenChange={setPlansDialogOpen} />
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
                    "flex cursor-pointer items-center gap-4 rounded-2xl border border-border/40 bg-white/80 px-4 py-3.5 transition-colors hover:border-border/60",
                  )}
                >
                  <Checkbox
                    id="save-docs"
                    checked={saveDocumentsOnDb}
                    onCheckedChange={(v) => setSaveDocumentsOnDb(!!v)}
                    className="rounded-md"
                  />
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-[#3D4035]">
                      Save documents on DB
                    </p>
                    <p className="text-[13px] text-[#3D4035]/50">
                      When enabled, attached files from chat will be saved to
                      your account.
                    </p>
                  </div>
                </label>

                {hasUnsavedChanges && (
                  <div className="mt-6 flex items-center gap-3">
                    <Button
                      onClick={async () => {
                        setSaving(true);
                        setSaved(false);
                        try {
                          await upsertSettings({
                            dashboardCardOrder: cardOrder,
                            saveDocumentsOnDb,
                          });
                          setSaved(true);
                          setTimeout(() => setSaved(false), 2000);
                        } catch {
                          // Error handling - could add toast
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
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
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
