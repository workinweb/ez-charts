"use client";

import { User } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { authClient } from "@/lib/(auth)/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DndContext,
  closestCenter,
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
import { GripVertical, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDashboardSettingsStore,
  DASHBOARD_CARD_IDS,
  DASHBOARD_CARD_LABELS,
  type DashboardCardId,
} from "@/stores/dashboard-settings-store";
import { useChatbotStore } from "@/stores/chatbot-store";

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
  const cardOrder = useDashboardSettingsStore((s) => s.cardOrder);
  const setCardOrder = useDashboardSettingsStore((s) => s.setCardOrder);
  const resetToDefault = useDashboardSettingsStore((s) => s.resetToDefault);
  const saveDocumentsOnDb = useChatbotStore((s) => s.saveDocumentsOnDb);
  const setSaveDocumentsOnDb = useChatbotStore((s) => s.setSaveDocumentsOnDb);

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
              </div>
              <User className="size-5 text-[#3D4035]/30" />
            </div>
          </section>

          {/* Dashboard cards */}
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
                  When enabled, attached files from chat will be saved to your
                  account.
                </p>
              </div>
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}
