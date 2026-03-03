/**
 * Schema for chart display options.
 * Used in AI output and throughout the app for withTooltip, withAnimation, chartSettings.
 */
import { z } from "zod";

/** Per-chart-type display options. Keys vary by chart type. All nullable. */
export const chartSettingsSchema = z
  .object({
    /** Show value on hover. Default true. Omit to keep default. */
    withTooltip: z.boolean().nullable(),
    /** Animate chart on load. Default true. Omit to keep default. */
    withAnimation: z.boolean().nullable(),
    // ── Shadcn bar (bar, bar-stacked, bar-horizontal) ──
    /** Show values on bars */
    withLabels: z.boolean().nullable(),
    /** Show series legend (stacked bar only) */
    withLegend: z.boolean().nullable(),
    /** Category label position: on bar or outside on axis (horizontal bar only) */
    categoryLabelPosition: z.enum(["inside", "outside"]).nullable(),

    // ── Shadcn line ──
    /** Line interpolation: curved, linear, or step */
    lineType: z.enum(["curved", "linear", "step"]).nullable(),

    // ── Shadcn / Rosencharts area ──
    /** Area fill style: gradient, solid, or outlined */
    areaFillStyle: z.enum(["gradient", "full", "outline"]).nullable(),

    // ── Rosencharts area colors (HEX) ──
    /** Solid fill color (when areaFillStyle is "full") */
    areaColor: z.string().nullable(),
    /** Gradient top color (when areaFillStyle is "gradient") */
    areaGradientTop: z.string().nullable(),
    /** Gradient bottom color (when areaFillStyle is "gradient") */
    areaGradientBottom: z.string().nullable(),
    /** Outline/line color (when areaFillStyle is "outline") */
    areaOutlineColor: z.string().nullable(),
  })
  .nullable()
  .describe(
    "Display options. withTooltip and withAnimation default to true; omit or set false to disable. Bar: withLabels, withLegend, categoryLabelPosition. Line: lineType. Area: areaFillStyle, areaColor, areaGradientTop, areaGradientBottom, areaOutlineColor. Omit when not needed.",
  );

export type ChartSettings = z.infer<typeof chartSettingsSchema>;
