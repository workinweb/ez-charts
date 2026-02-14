"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChartsList } from "@/hooks/use-charts";
import { useSlidesStore, type Slide } from "@/stores/slides-store";

interface EditSlideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide: Slide | null;
}

function SortableChartRow({
  id,
  title,
  iconBg,
  Icon,
  iconColor,
  onRemove,
}: {
  id: string;
  title: string;
  iconBg: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconColor: string;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/40 bg-white/80 px-3 py-2.5",
        isDragging && "z-10 shadow-md ring-1 ring-[#6C5DD3]/20",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-[#3D4035]/40 transition-colors hover:text-[#3D4035]/70 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          iconBg,
        )}
      >
        <Icon className={cn("size-4", iconColor)} strokeWidth={2} />
      </div>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#3D4035]">
        {title}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-[#3D4035]/40 transition-colors hover:bg-red-50 hover:text-red-500"
        aria-label="Remove chart"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function EditSlideDialog({
  open,
  onOpenChange,
  slide,
}: EditSlideDialogProps) {
  const [name, setName] = useState("");
  const [chartIds, setChartIds] = useState<string[]>([]);
  const [addChartSearch, setAddChartSearch] = useState("");
  const updateSlide = useSlidesStore((s) => s.updateSlide);
  const allCharts = useChartsList();

  const chartMap = useMemo(
    () => new Map(allCharts.map((c) => [c.id, c])),
    [allCharts],
  );

  const availableToAdd = useMemo(
    () => allCharts.filter((c) => !chartIds.includes(c.id)),
    [allCharts, chartIds],
  );

  const filteredAvailableToAdd = useMemo(() => {
    if (!addChartSearch.trim()) return availableToAdd;
    const q = addChartSearch.toLowerCase().trim();
    return availableToAdd.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.source.toLowerCase().includes(q),
    );
  }, [availableToAdd, addChartSearch]);

  useEffect(() => {
    if (!slide || !open) return;
    setName(slide.name);
    setChartIds(
      slide.chartIds.filter((id) => allCharts.some((c) => c.id === id)),
    );
    setAddChartSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.id, open]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chartIds.indexOf(active.id as string);
    const newIndex = chartIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    setChartIds(arrayMove(chartIds, oldIndex, newIndex));
  }

  function addChart(id: string) {
    setChartIds((prev) => [...prev, id]);
  }

  function removeChart(id: string) {
    setChartIds((prev) => prev.filter((x) => x !== id));
  }

  function handleSave() {
    if (!slide || !name.trim() || chartIds.length === 0) return;
    updateSlide(slide.id, { name: name.trim(), chartIds });
    onOpenChange(false);
  }

  if (!slide) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-[24px] border-0 bg-white p-4 shadow-xl sm:max-w-xl sm:p-6 lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#3D4035] sm:text-xl">
            Edit Slide Deck
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#3D4035]/60">
            Change the name, reorder charts, or add and remove charts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 py-4">
          <Input
            placeholder="Slide deck name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shrink-0 rounded-xl border-border/60 text-[14px]"
          />

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <div className="flex min-h-0 flex-col">
              <p className="mb-2 shrink-0 text-[12px] font-medium text-[#3D4035]/70">
                Charts in deck (drag to reorder)
              </p>
              <div className="min-h-[120px] flex-1 space-y-1.5 overflow-y-auto rounded-xl border border-border/40 p-2 sm:min-h-[160px] lg:min-h-[240px] lg:max-h-[40vh]">
                {chartIds.length === 0 ? (
                  <p className="py-4 text-center text-[12px] text-[#3D4035]/50">
                    No charts yet. Add some from the right →
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={chartIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {chartIds.map((chartId) => {
                        const chart = chartMap.get(chartId);
                        if (!chart) return null;
                        const Icon = chart.icon;
                        return (
                          <SortableChartRow
                            key={chartId}
                            id={chartId}
                            title={chart.title}
                            iconBg={chart.iconBg}
                            Icon={Icon}
                            iconColor={chart.iconColor}
                            onRemove={() => removeChart(chartId)}
                          />
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {availableToAdd.length > 0 && (
              <div className="flex min-h-0 flex-col">
                <p className="mb-2 shrink-0 text-[12px] font-medium text-[#3D4035]/70">
                  Add charts
                </p>
                <div className="relative mb-2 shrink-0">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#3D4035]/40" />
                  <Input
                    type="search"
                    placeholder="Search charts…"
                    value={addChartSearch}
                    onChange={(e) => setAddChartSearch(e.target.value)}
                    className="h-8 rounded-lg border-border/60 pl-8 pr-3 text-[13px]"
                  />
                </div>
                <div className="min-h-[120px] flex-1 overflow-y-auto rounded-xl border border-border/40 p-1.5 sm:min-h-[160px] lg:min-h-[240px] lg:max-h-[40vh]">
                  {filteredAvailableToAdd.length === 0 ? (
                    <p className="py-4 text-center text-[12px] text-[#3D4035]/50">
                      {addChartSearch.trim()
                        ? "No matching charts"
                        : "No charts to add"}
                    </p>
                  ) : (
                    filteredAvailableToAdd.map((chart) => {
                      const Icon = chart.icon;
                      return (
                        <label
                          key={chart.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-black/2"
                        >
                          <Checkbox
                            checked={false}
                            onCheckedChange={(checked) =>
                              checked && addChart(chart.id)
                            }
                          />
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg",
                              chart.iconBg,
                            )}
                          >
                            <Icon
                              className={cn("size-4", chart.iconColor)}
                              strokeWidth={2}
                            />
                          </div>
                          <span className="flex-1 truncate text-[13px] font-medium text-[#3D4035]">
                            {chart.title}
                          </span>
                          <Plus className="size-3.5 shrink-0 text-[#3D4035]/40" />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {availableToAdd.length === 0 && chartIds.length > 0 && (
              <p className="text-[12px] text-[#3D4035]/50 lg:col-span-2">
                {chartIds.length} chart{chartIds.length !== 1 ? "s" : ""} in
                deck. All charts added.
              </p>
            )}
          </div>

          {chartIds.length > 0 && availableToAdd.length > 0 && (
            <p className="shrink-0 text-[12px] text-[#3D4035]/50">
              {chartIds.length} chart{chartIds.length !== 1 ? "s" : ""} in deck
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-[13px]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!name.trim() || chartIds.length === 0}
            onClick={handleSave}
            className="rounded-xl bg-[#6C5DD3] text-[13px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
