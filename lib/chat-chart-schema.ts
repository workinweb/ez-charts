import { z } from "zod";

/** Supported chart type keys — matches rosencharts getChartTypeByName */
export const CHART_TYPE_KEYS = [
  "horizontal-bar",
  "horizontal-bar-gradient",
  "horizontal-bar-multi",
  "horizontal-bar-image",
  "horizontal-bar-thin",
  "vertical-bar",
  "vertical-bar-multi",
  "line",
  "line-multi",
  "pie",
  "pie-image",
  "donut",
  "half-donut",
  "fillable",
  "fillable-donut",
  "breakdown",
  "breakdown-thin",
  "benchmark",
  "treemap",
  "scatter",
] as const;

export type ChartTypeKey = (typeof CHART_TYPE_KEYS)[number];

/**
 * Schema for the createChart tool.
 * Data shape varies by chartType — see prompts/ and schemas-reference.md.
 */
export const createChartInputSchema = z.object({
  chartType: z
    .enum(CHART_TYPE_KEYS)
    .describe("Chart type key (e.g. horizontal-bar, pie, line-multi, scatter)"),
  title: z.string().optional().describe("Chart title"),
  data: z
    .array(z.record(z.string(), z.unknown()))
    .min(1)
    .describe(
      "Data array. Bar/pie/breakdown: [{key/name, value}]. Line: [{data:[{date, value}]}] wrapped. Line-multi: [{data:[...], color?}, ...]. Scatter: [{xValue, yValue, name}]. Treemap: [{name, subtopics}]",
    ),
});

export type CreateChartInput = z.infer<typeof createChartInputSchema>;
