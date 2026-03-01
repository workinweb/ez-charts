"use client";

import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ChatSidebarContent } from "./chat-sidebar";

/** Floating chat button + bottom drawer — visible only on mobile */
export function ChatDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon-sm"
          aria-label="Open AI chat"
          title="Open AI chat"
          className="fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full bg-[#6C5DD3] text-white shadow-lg hover:bg-[#5B4DC2] lg:hidden"
        >
          <MessageCircle className="size-5" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[85vh] rounded-t-3xl border-0 bg-[#EDE9FE] p-0">
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-2.5">
          <span className="text-[14px] font-semibold text-sidebar-foreground"></span>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Close chat"
              title="Close chat"
              className="text-sidebar-foreground/50"
            >
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatSidebarContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
