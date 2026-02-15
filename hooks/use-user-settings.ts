"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboardSettingsStore } from "@/stores/dashboard-settings-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import type { DashboardCardId } from "@/stores/dashboard-settings-store";
import { authClient } from "@/lib/(auth)/auth-client";
import { TIER_LIMITS } from "@/lib/tier-limits";
import { useEffect, useRef } from "react";

/**
 * Hydrates dashboard and chat settings stores from Convex.
 * Only runs when the user is authenticated. Call once in the app layout.
 * @returns isLoading - true while fetching settings for an authenticated user (one-time load)
 */
export function useUserSettingsHydration(): { isLoadingUserSettings: boolean } {
  const { data: session } = authClient.useSession();
  const settings = useQuery(api.userSettings.get, session?.user ? {} : "skip");
  const hydrated = useRef(false);
  const setCardOrder = useDashboardSettingsStore((s) => s.setCardOrder);
  const setSaveDocumentsOnDb = useChatbotStore((s) => s.setSaveDocumentsOnDb);

  const isAuthenticated = !!session?.user;
  const isLoadingUserSettings = isAuthenticated && settings === undefined;

  useEffect(() => {
    if (!isAuthenticated || settings === undefined || hydrated.current) return;
    hydrated.current = true;

    if (settings && settings.dashboardCardOrder?.length) {
      setCardOrder(settings.dashboardCardOrder as DashboardCardId[]);
    }
    const tier = (settings?.planTier ?? "free") as keyof typeof TIER_LIMITS;
    if (TIER_LIMITS[tier].canSaveDocuments && settings?.saveDocumentsOnDb !== undefined) {
      setSaveDocumentsOnDb(settings.saveDocumentsOnDb);
    } else {
      setSaveDocumentsOnDb(false);
    }
  }, [isAuthenticated, settings, setCardOrder, setSaveDocumentsOnDb]);

  return { isLoadingUserSettings };
}
