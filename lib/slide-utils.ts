import type { Doc, Id } from "@/convex/_generated/dataModel";

export type ShareSetting = "restricted" | "available" | "shared";

export interface Slide {
  id: string;
  name: string;
  chartIds: string[];
  type: "custom";
  createdAt: string;
  shareSetting?: ShareSetting;
}

function formatSlideDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24 && d.getDate() === new Date().getDate()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffHours < 48) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function convexSlideToSlide(doc: Doc<"slides">): Slide {
  return {
    id: doc._id as string,
    name: doc.name,
    chartIds: doc.chartIds,
    type: "custom",
    createdAt: formatSlideDate(doc.updatedAt),
    shareSetting: doc.shareSetting,
  };
}
