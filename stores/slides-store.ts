"use client";

import { create } from "zustand";
import type { Slide } from "@/lib/slide-utils";

export type { Slide };

interface SlidesState {
  /** Slide currently being edited (opened in EditSlideDialog) */
  editingSlide: Slide | null;
  /** Search query for the slides page */
  slidesSearch: string;
  setEditingSlide: (slide: Slide | null) => void;
  setSlidesSearch: (value: string) => void;
}

export const useSlidesStore = create<SlidesState>((set) => ({
  editingSlide: null,
  slidesSearch: "",

  setEditingSlide: (slide) => set({ editingSlide: slide }),
  setSlidesSearch: (value) => set({ slidesSearch: value }),
}));
