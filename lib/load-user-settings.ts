import { useDashboardSettingsStore } from "@/stores/dashboard-settings-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import type { DashboardCardId } from "@/stores/dashboard-settings-store";

import { TIER_LIMITS } from "@/lib/tier-limits";

export interface UserSettingsData {
  dashboardCardOrder?: string[];
  saveDocumentsOnDb?: boolean;
  planTier?: "free" | "pro" | "max";
}

/**
 * Hydrates the dashboard and chat stores from server-fetched settings.
 * Call once on the client when initial settings are available.
 */
export function hydrateUserSettingsStore(settings: UserSettingsData | null): void {
  const { setCardOrder, setSettingsReady } = useDashboardSettingsStore.getState();
  const setSaveDocumentsOnDb = useChatbotStore.getState().setSaveDocumentsOnDb;

  if (settings?.dashboardCardOrder?.length) {
    setCardOrder(settings.dashboardCardOrder as DashboardCardId[]);
  }
  const tier = (settings?.planTier ?? "free") as keyof typeof TIER_LIMITS;
  if (TIER_LIMITS[tier].canSaveDocuments && settings?.saveDocumentsOnDb !== undefined) {
    setSaveDocumentsOnDb(settings.saveDocumentsOnDb);
  } else {
    setSaveDocumentsOnDb(false);
  }
  setSettingsReady(true);
}
