import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a series/data key (e.g. "Quarterly Sales (USD)") to a valid CSS custom property identifier.
 * Keys with spaces, parentheses, etc. break var(--color-{key}) — use this for both defining and referencing chart colors.
 */
export function toChartColorVar(key: string): string {
  const sanitized = key
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return sanitized || "series"
}
