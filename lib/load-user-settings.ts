import { useDashboardSettingsStore } from "@/stores/dashboard-settings-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import type { DashboardCardId } from "@/stores/dashboard-settings-store";

export interface UserSettingsData {
  dashboardCardOrder?: string[];
  saveDocumentsOnDb?: boolean;
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
  if (settings?.saveDocumentsOnDb !== undefined) {
    setSaveDocumentsOnDb(settings.saveDocumentsOnDb);
  }
  setSettingsReady(true);
}
