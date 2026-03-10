"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { convexSlideToSlide } from "@/lib/slide-utils";
import type { Slide } from "@/lib/slide-utils";

/** List all slide decks for the current user from Convex. */
export function useSlidesList(): { slides: Slide[]; isLoading: boolean } {
  const list = useQuery(api.charts.slides.list);
  const slides = list?.map(convexSlideToSlide) ?? [];
  const isLoading = list === undefined;
  return { slides, isLoading };
}

/** Single slide by ID from Convex. */
export function useSlideById(id: Id<"slides"> | string | undefined): Slide | undefined {
  const doc = useQuery(
    api.charts.slides.get,
    id && typeof id === "string" && !id.startsWith("auto-")
      ? { id: id as Id<"slides"> }
      : "skip"
  );
  return doc ? convexSlideToSlide(doc) : undefined;
}

/** Slide by ID with loading and not-found status. */
export function useSlideByIdWithStatus(id: Id<"slides"> | string | undefined): {
  slide: Slide | undefined;
  isLoading: boolean;
  isNotFound: boolean;
} {
  const doc = useQuery(
    api.charts.slides.get,
    id && typeof id === "string" && !id.startsWith("auto-")
      ? { id: id as Id<"slides"> }
      : "skip"
  );
  const isConvexId = !!id && typeof id === "string" && !id.startsWith("auto-");
  const isLoading = isConvexId && doc === undefined;
  const isNotFound = isConvexId && doc === null;
  const slide = doc ? convexSlideToSlide(doc) : undefined;
  return { slide, isLoading, isNotFound };
}

/** Slide for presentation: supports owner (auth) and shared link (no auth). */
export function useSlideForPresent(id: Id<"slides"> | string | undefined): {
  slide: Slide | undefined;
  isOwner: boolean;
  canChangeShare: boolean;
  isLoading: boolean;
  isNotFound: boolean;
} {
  const result = useQuery(
    api.charts.slides.getForPublicOrOwner,
    id && typeof id === "string" && !id.startsWith("auto-")
      ? { id: id as Id<"slides"> }
      : "skip",
  );
  const isConvexId = !!id && typeof id === "string" && !id.startsWith("auto-");
  const isLoading = isConvexId && result === undefined;
  const isNotFound = isConvexId && result === null;
  const slide = result?.slide ? convexSlideToSlide(result.slide) : undefined;
  return {
    slide,
    isOwner: result?.isOwner ?? false,
    canChangeShare: result?.canChangeShare ?? false,
    isLoading,
    isNotFound,
  };
}

/** Slide deck mutations: create, update, remove. */
export function useSlidesMutations() {
  const createMutation = useMutation(api.charts.slides.create);
  const updateMutation = useMutation(api.charts.slides.update);
  const removeMutation = useMutation(api.charts.slides.remove);

  return {
    create: async (input: { name: string; chartIds: string[] }) => {
      return createMutation({
        name: input.name,
        chartIds: input.chartIds,
      });
    },
    update: async (
      id: Id<"slides">,
      patch: { name?: string; chartIds?: string[] }
    ) => {
      await updateMutation({
        id,
        ...patch,
      });
    },
    remove: async (id: Id<"slides">) => {
      await removeMutation({ id });
    },
    updateShareSetting: async (
      id: Id<"slides">,
      shareSetting: "restricted" | "available" | "shared",
    ) => {
      await updateMutation({ id, shareSetting });
    },
  };
}
