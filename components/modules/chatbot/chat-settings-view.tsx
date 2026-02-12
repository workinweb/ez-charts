"use client";

import { Settings, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useChatbotStore } from "@/stores/chatbot-store";

export function ChatSettingsView() {
  const saveDocumentsOnDb = useChatbotStore((s) => s.saveDocumentsOnDb);
  const setSaveDocumentsOnDb = useChatbotStore((s) => s.setSaveDocumentsOnDb);

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

        <div className="flex flex-col gap-4 rounded-2xl border border-sidebar-border/50 bg-white/60 p-4">
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
                  Persist attached files for later use
                </p>
              </div>
            </div>
            <Switch
              checked={saveDocumentsOnDb}
              onCheckedChange={setSaveDocumentsOnDb}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
