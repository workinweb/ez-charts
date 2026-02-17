import { z } from "zod";

/** Supported chart type keys — rosencharts + shadcn */
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
  "shadcn:bar",
  "shadcn:area",
  "shadcn:line",
  "shadcn:pie",
  "shadcn:radar",
  "shadcn:radial",
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
    .union([
      z.array(z.record(z.string(), z.unknown())).min(1),
      z.object({
        _data: z.array(z.record(z.string(), z.unknown())).min(1),
        _seriesColors: z.record(z.string(), z.string()).optional(),
      }),
    ])
    .describe(
      "Data: array for most charts. Bar/pie/breakdown: [{key/name, value, color?}]. Pie/donut/benchmark: colorFrom, colorTo. Multi-bar: multipleColors[]. Line-multi: [{data:[...], color?}]. Scatter: [{xValue, yValue, name, color?}]. Shadcn bar/area/line/radar with custom colors: {_data:[...], _seriesColors:{desktop:\"#hex\", mobile:\"#hex\"}}. Shadcn pie/radial: [{name, value, fill?}]. See prompts/schemas-reference.md.",
    ),
});

export type CreateChartInput = z.infer<typeof createChartInputSchema>;
