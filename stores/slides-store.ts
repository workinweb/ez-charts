"use client";

import { create } from "zustand";
import { userCharts } from "@/lib/charts-data";

export interface Slide {
  id: string;
  name: string;
  /** IDs of charts in this slide deck (order matters) */
  chartIds: string[];
  /** "auto" = one chart = one default slide; "custom" = user-created collection */
  type: "auto" | "custom";
  createdAt: string;
}

interface SlidesState {
  slides: Slide[];
  addSlide: (name: string, chartIds: string[]) => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, data: Partial<Pick<Slide, "name" | "chartIds">>) => void;
}

/** Generate auto-slides from every user chart */
function buildAutoSlides(): Slide[] {
  return userCharts.map((c) => ({
    id: `auto-${c.id}`,
    name: c.title,
    chartIds: [c.id],
    type: "auto" as const,
    createdAt: c.date,
  }));
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
  slides: [...buildAutoSlides(), ...defaultCustomSlides],

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
