"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { userCharts } from "@/lib/charts-data";
import { useSlidesStore } from "@/stores/slides-store";

interface CreateSlideDialogProps {
  triggerLabel?: string;
}

export function CreateSlideDialog({
  triggerLabel = "New Slide Deck",
}: CreateSlideDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const addSlide = useSlidesStore((s) => s.addSlide);

  function toggleChart(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleCreate() {
    if (!name.trim() || selectedIds.length === 0) return;
    addSlide(name.trim(), selectedIds);
    setName("");
    setSelectedIds([]);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 rounded-xl bg-[#6C5DD3] text-[12px] font-semibold text-white hover:bg-[#5a4dbf]"
        >
          <Plus className="size-3.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[24px] border-0 bg-white p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#3D4035]">
            Create Slide Deck
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#3D4035]/60">
            Choose a name and pick the charts you want to include.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Slide deck name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-border/60 text-[14px]"
          />

          <div className="max-h-[280px] overflow-y-auto rounded-xl border border-border/40 p-1.5">
            {userCharts.map((chart) => {
              const Icon = chart.icon;
              const checked = selectedIds.includes(chart.id);
              return (
                <label
                  key={chart.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-black/[0.02]",
                    checked && "bg-[#BCBDEA]/10",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleChart(chart.id)}
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
                </label>
              );
            })}
          </div>

          {selectedIds.length > 0 && (
            <p className="text-[12px] text-[#3D4035]/50">
              {selectedIds.length} chart{selectedIds.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="rounded-xl text-[13px]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!name.trim() || selectedIds.length === 0}
            onClick={handleCreate}
            className="rounded-xl bg-[#6C5DD3] text-[13px] font-semibold text-white hover:bg-[#5a4dbf] disabled:opacity-50"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
