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
    /** Show series/segment legend (stacked bar, pie, donut) */
    withLegend: z.boolean().nullable(),
    /** Show total or active value in donut center */
    withCenterText: z.boolean().nullable(),
    /** Donut center: "total" or "active" (active segment value) */
    centerTextMode: z.enum(["total", "active"]).nullable(),
    /** Donut: enable active sector (click legend to highlight segment). When true, segment pops out. */
    withActiveSector: z.boolean().nullable(),
    /** Donut: index of segment to highlight when withActiveSector is true. Set by clicking legend. */
    activeIndex: z.number().nullable(),
    /** Category label position: on bar or outside on axis (horizontal bar only) */
    categoryLabelPosition: z.enum(["inside", "outside"]).nullable(),

    // ── Shadcn radial ──
    /** Radial: show polar grid circles */
    withGrid: z.boolean().nullable(),
    /** Simple Radial: "normal" | "active" | "stacked-half" */
    radialVariant: z.enum(["normal", "active", "stacked-half"]).nullable(),

    // ── Shadcn radar ──
    /** Radar grid: polygon, polygon-no-lines, circle, circle-no-lines, filled, circle-filled, none */
    radarGridType: z
      .enum([
        "polygon",
        "polygon-no-lines",
        "circle",
        "circle-no-lines",
        "filled",
        "circle-filled",
        "none",
      ])
      .nullable(),
    /** Radar: lines only (no fill, stroke only) */
    radarLinesOnly: z.boolean().nullable(),

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
    "Display options. withTooltip and withAnimation default to true; omit or set false to disable. Bar: withLabels, withLegend, categoryLabelPosition. Pie/Donut: withLegend. Donut: withCenterText, withActiveSector (enable clickable legend). Radial: withLabels (segment names in bars), withGrid (polar circles). Simple Radial: radialVariant. Radar: withLegend, radarGridType, radarLinesOnly. Line: lineType. Area: areaFillStyle, areaColor, areaGradientTop, areaGradientBottom, areaOutlineColor. Omit when not needed.",
  );

export type ChartSettings = z.infer<typeof chartSettingsSchema>;
