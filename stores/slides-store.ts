"use client";

import { create } from "zustand";

export interface Slide {
  id: string;
  name: string;
  /** IDs of charts in this slide deck (order matters) */
  chartIds: string[];
  /** "custom" = user-created collection */
  type: "custom";
  createdAt: string;
}

interface SlidesState {
  slides: Slide[];
  addSlide: (name: string, chartIds: string[]) => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, data: Partial<Pick<Slide, "name" | "chartIds">>) => void;
}

/** Pre-built custom slide example */
const defaultCustomSlides: Slide[] = [
  {
    id: "custom-1",
    name: "Q4 Overview",
    chartIds: ["1", "3", "5"],
    type: "custom",
    createdAt: "Jan 10",
  },
];

export const useSlidesStore = create<SlidesState>((set) => ({
  slides: [...defaultCustomSlides],

  addSlide: (name, chartIds) =>
    set((s) => ({
      slides: [
        ...s.slides,
        {
          id: `custom-${Date.now()}`,
          name,
          chartIds,
          type: "custom",
          createdAt: "Just now",
        },
      ],
    })),

  removeSlide: (id) =>
    set((s) => ({
      slides: s.slides.filter((sl) => sl.id !== id),
    })),

  updateSlide: (id, data) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.id === id ? { ...sl, ...data } : sl
      ),
    })),
}));
