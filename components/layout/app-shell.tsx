"use client";

import { AppNavbar } from "./app-navbar";
import { ChatSidebar } from "@/components/modules/chatbot";
import { IconSidebar } from "./icon-sidebar";
import { DashboardContent } from "./dashboard-layout";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <AppNavbar />

      <div className="flex min-h-0 flex-1">
        <ChatSidebar />

        <div className="flex flex-1 bg-[#E9EEF0] rounded-r-3xl">
          <IconSidebar />
          <DashboardContent />
        </div>
      </div>
    </div>
  );
}
