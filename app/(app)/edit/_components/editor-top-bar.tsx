"use client";

import { ArrowLeft, Save, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorTopBarProps {
  isCreateMode: boolean;
  dirty: boolean;
  saved: boolean;
  saving?: boolean;
  onBack: () => void;
  onReset: () => void;
  onSave: () => void | Promise<void>;
  onSendToAI: () => void;
}

export function EditorTopBar({
  isCreateMode,
  dirty,
  saved,
  saving = false,
  onBack,
  onReset,
  onSave,
  onSendToAI,
}: EditorTopBarProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 text-[#3D4035]/70 hover:text-[#3D4035]"
      >
        <ArrowLeft className="size-4" />
        {isCreateMode ? "Charts" : "All charts"}
      </Button>

      <div className="flex-1" />

      {dirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="gap-2 text-[#3D4035]/60 hover:text-[#3D4035]"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onSendToAI}
        className="gap-2 text-[#6C5DD3]/80 hover:bg-[#6C5DD3]/10 hover:text-[#6C5DD3]"
        title="Load this chart into AI chat for guided editing"
      >
        <Sparkles className="size-3.5" />
        Load on Assistant
      </Button>

      <Button
        size="sm"
        disabled={(!dirty && !isCreateMode) || saving}
        onClick={onSave}
        className={cn(
          "gap-2 rounded-xl text-[12px] font-semibold transition-all",
          dirty
            ? "bg-[#6C5DD3] text-white hover:bg-[#5a4dbf]"
            : saved
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-[#3D4035]/10 text-[#3D4035]/40",
        )}
      >
        <Save className="size-3.5" />
        {saving ? "Saving…" : saved ? "Saved" : isCreateMode ? "Create chart" : "Save changes"}
      </Button>
    </div>
  );
}
