"use client";

import { Switch } from "@/components/ui/switch";
import { useFeatureCheck } from "@/hooks/use-feature-check";
import { cn } from "@/lib/utils";
import { useChatbotStore } from "@/stores/chatbot-store";
import { Database, Settings } from "lucide-react";

export function ChatSettingsView() {
  const saveDocumentsOnDb = useChatbotStore((s) => s.saveDocumentsOnDb);
  const setSaveDocumentsOnDb = useChatbotStore((s) => s.setSaveDocumentsOnDb);
  const { canUse } = useFeatureCheck();
  const docAllowed = canUse("saveDocument");
  const canSaveDocuments = docAllowed.allowed;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#BCBDEA]/20">
            <Settings className="size-6 text-[#6C5DD3]" />
          </div>
          <h2 className="text-[16px] font-semibold text-sidebar-foreground">
            Chat settings
          </h2>
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 rounded-2xl border border-sidebar-border/50 bg-white/60 p-4",
            !canSaveDocuments && "opacity-70",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#BCBDEA]/15">
                <Database className="size-4 text-[#6C5DD3]" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-sidebar-foreground">
                  Save documents on DB
                </p>
                <p className="text-[12px] text-sidebar-foreground/50">
                  {canSaveDocuments
                    ? "Persist attached files for later use"
                    : (docAllowed.reason ??
                      "Upgrade to Pro to save documents. Free: use in chat only.")}
                </p>
              </div>
            </div>
            <Switch
              checked={canSaveDocuments ? saveDocumentsOnDb : false}
              onCheckedChange={(v) =>
                canSaveDocuments && setSaveDocumentsOnDb(!!v)
              }
              disabled={!canSaveDocuments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
