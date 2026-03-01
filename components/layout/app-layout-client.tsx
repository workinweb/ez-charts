"use client";

import { AppNavbar } from "@/components/layout/app-navbar";
import { IconSidebar } from "@/components/layout/icon-sidebar";
import {
  ChatDrawer,
  ChatProvider,
  ChatSidebar,
} from "@/components/modules/chatbot";
import { VerificationBanner } from "@/components/modules/user/verification-banner";
import {
  hydrateUserSettingsStore,
  type UserSettingsData,
} from "@/lib/load-user-settings";
import { cn } from "@/lib/utils";
import { useChatbotStore } from "@/stores";
import { useRef } from "react";

interface AppLayoutClientProps {
  children: React.ReactNode;
  initialSettings: UserSettingsData | null;
}

export function AppLayoutClient({
  children,
  initialSettings,
}: AppLayoutClientProps) {
  const hydrated = useRef(false);
  if (!hydrated.current) {
    hydrated.current = true;
    hydrateUserSettingsStore(initialSettings);
  }

  const collapsed = useChatbotStore((s) => s.chatSidebarCollapsed);

  return (
    <ChatProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <VerificationBanner />
        <AppNavbar />

        <div className="flex min-h-0 flex-1">
          <ChatSidebar />

          <div
            className={cn(
              "relative flex flex-1 bg-[#E9EEF0] md:rounded-r-3xl ml-5",
              !collapsed ? "ml-0" : "ml-5",
            )}
          >
            <IconSidebar />
            {children}
          </div>
        </div>

        <ChatDrawer />
      </div>
    </ChatProvider>
  );
}
