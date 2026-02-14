"use client";

import { create } from "zustand";

export type SectionKey =
  | "dashboard"
  | "documents"
  | "layout"
  | "team"
  | "links"
  | "saved"
  | "adjustments"
  | "new";

interface SectionState {
  activeSection: SectionKey;
  setActiveSection: (key: SectionKey) => void;
}

export const useSectionStore = create<SectionState>((set) => ({
  activeSection: "dashboard",
  setActiveSection: (key) => set({ activeSection: key }),
}));
