"use client";

import { AppNavbar } from "./app-navbar";
import { ChatSidebar, ChatDrawer, ChatProvider } from "@/components/modules/chatbot";
import { IconSidebar } from "./icon-sidebar";
import { DashboardContent } from "./dashboard-layout";

export function AppShell() {
  return (
    <ChatProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <AppNavbar />

        <div className="flex min-h-0 flex-1">
          {/* Desktop chat sidebar — hidden on mobile */}
          <ChatSidebar />

          <div className="flex flex-1 bg-[#E9EEF0] md:rounded-r-3xl">
            {/* Desktop icon rail — hidden on mobile */}
            <IconSidebar />
            <DashboardContent />
          </div>
        </div>

        {/* Mobile chat drawer — hidden on desktop */}
        <ChatDrawer />
      </div>
    </ChatProvider>
  );
}
