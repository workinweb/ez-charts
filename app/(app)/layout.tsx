"use client";

import { AppNavbar } from "@/components/layout/app-navbar";
import {
  ChatDrawer,
  ChatSidebar,
  ChatProvider,
} from "@/components/modules/chatbot";
import { IconSidebar } from "@/components/layout/icon-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <AppNavbar />

        <div className="flex min-h-0 flex-1">
          <ChatSidebar />

          <div className="flex flex-1 bg-[#E9EEF0] md:rounded-r-3xl">
            <IconSidebar />
            {children}
          </div>
        </div>

        <ChatDrawer />
      </div>
    </ChatProvider>
  );
}
