"use client";

import { useRef } from "react";
import { AppNavbar } from "@/components/layout/app-navbar";
import {
  ChatDrawer,
  ChatSidebar,
  ChatProvider,
} from "@/components/modules/chatbot";
import { VerificationBanner } from "@/components/modules/user/verification-banner";
import { IconSidebar } from "@/components/layout/icon-sidebar";
import { hydrateUserSettingsStore, type UserSettingsData } from "@/lib/load-user-settings";

interface AppLayoutClientProps {
  children: React.ReactNode;
  initialSettings: UserSettingsData | null;
}

export function AppLayoutClient({ children, initialSettings }: AppLayoutClientProps) {
  const hydrated = useRef(false);
  if (!hydrated.current) {
    hydrated.current = true;
    hydrateUserSettingsStore(initialSettings);
  }

  return (
    <ChatProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <VerificationBanner />
        <AppNavbar />

        <div className="flex min-h-0 flex-1">
          <ChatSidebar />

          <div className="relative flex flex-1 bg-[#E9EEF0] md:rounded-r-3xl">
            <IconSidebar />
            {children}
          </div>
        </div>

        <ChatDrawer />
      </div>
    </ChatProvider>
  );
}
