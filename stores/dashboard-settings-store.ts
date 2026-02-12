"use client";

import { create } from "zustand";

export type DashboardCardId =
  | "charts-overview"
  | "favorites-stats"
  | "slides-overview"
  | "chart-types-distribution"
  | "data-sources-breakdown"
  | "recent-charts"
  | "recent-slide-decks";

export const DASHBOARD_CARD_IDS: DashboardCardId[] = [
  "charts-overview",
  "favorites-stats",
  "slides-overview",
  "chart-types-distribution",
  "data-sources-breakdown",
  "recent-charts",
  "recent-slide-decks",
];

export const DASHBOARD_CARD_LABELS: Record<DashboardCardId, string> = {
  "charts-overview": "Charts Overview",
  "favorites-stats": "Favorites & Activity",
  "slides-overview": "Slides Overview",
  "chart-types-distribution": "Chart Types",
  "data-sources-breakdown": "Data Sources",
  "recent-charts": "Recent Charts",
  "recent-slide-decks": "Recent Slide Decks",
};

/** Grid column span (out of 12) for dashboard layout */
export const DASHBOARD_CARD_SPAN: Record<DashboardCardId, number> = {
  "charts-overview": 6,
  "favorites-stats": 3,
  "slides-overview": 3,
  "chart-types-distribution": 6,
  "data-sources-breakdown": 6,
  "recent-charts": 6,
  "recent-slide-decks": 6,
};

interface DashboardSettingsState {
  /** Ordered list of card IDs. Only these are shown; order determines layout. */
  cardOrder: DashboardCardId[];
  /** Set a new order (e.g. after drag-end) */
  setCardOrder: (order: DashboardCardId[]) => void;
  /** Move card at index up (swap with index-1) */
  moveCardUp: (index: number) => void;
  /** Move card at index down (swap with index+1) */
  moveCardDown: (index: number) => void;
  /** Toggle visibility - remove from order or add back at end */
  toggleCard: (id: DashboardCardId) => void;
  /** Whether a card is currently visible (in cardOrder) */
  isCardVisible: (id: DashboardCardId) => boolean;
  /** Reset to default order */
  resetToDefault: () => void;
}

const DEFAULT_ORDER: DashboardCardId[] = [...DASHBOARD_CARD_IDS];

export const useDashboardSettingsStore = create<DashboardSettingsState>(
  (set, get) => ({
    cardOrder: DEFAULT_ORDER,

    setCardOrder: (order) => set({ cardOrder: order }),

    moveCardUp: (index) => {
      if (index <= 0) return;
      const order = [...get().cardOrder];
      [order[index - 1], order[index]] = [order[index], order[index - 1]];
      set({ cardOrder: order });
    },

    moveCardDown: (index) => {
      const order = get().cardOrder;
      if (index >= order.length - 1) return;
      const next = [...order];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      set({ cardOrder: next });
    },

    toggleCard: (id) => {
      const { cardOrder } = get();
      const idx = cardOrder.indexOf(id);
      if (idx >= 0) {
        set({ cardOrder: cardOrder.filter((c) => c !== id) });
      } else {
        set({ cardOrder: [...cardOrder, id] });
      }
    },


    isCardVisible: (id) => get().cardOrder.includes(id),

    resetToDefault: () => set({ cardOrder: [...DEFAULT_ORDER] }),
  })
);
