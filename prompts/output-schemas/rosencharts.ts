/**
 * Per-chart Zod schemas for Rosencharts.
 * Optional-style fields use .nullable() so they're required in the schema
 * (OpenAI strict mode) but the model can output null.
 */
import { z } from "zod";

const keyValueItem = z.object({
  key: z.string(),
  value: z.number(),
  color: z.string().nullable(),
});

const multiBarItem = z.object({
  key: z.string(),
  values: z.array(z.number()).min(1),
  multipleColors: z.array(z.string()).nullable(),
  image: z.string().nullable(),
});

const pieItem = z.object({
  name: z.string(),
  value: z.number(),
  colorFrom: z.string().nullable(),
  colorTo: z.string().nullable(),
  logo: z.string().nullable(),
});

const linePoint = z.object({
  date: z.string(),
  value: z.number(),
});

const lineSeries = z.object({
  data: z.array(linePoint).min(1),
  color: z.union([
    z.string(),
    z.object({ line: z.string(), point: z.string() }),
    z.null(),
  ]),
});

const scatterPoint = z.object({
  xValue: z.number(),
  yValue: z.number(),
  name: z.string(),
  color: z.string().nullable(),
});

const treemapSubtopic = z.object({
  key: z.string().describe("Sub-item label"),
  value: z.number().describe("Sub-item size/value"),
});

const treemapItem = z.object({
  name: z.string(),
  subtopics: z.array(treemapSubtopic).min(1),
  colorFrom: z.string().nullable(),
  colorTo: z.string().nullable(),
});

// ─── Chart-specific schemas ───────────────────────────────────────────────

export const horizontalBarSchema = z.array(keyValueItem).min(1);
export const horizontalBarGradientSchema = z.array(keyValueItem).min(1);
export const horizontalBarMultiSchema = z.array(multiBarItem).min(1);
export const horizontalBarImageSchema = z.array(keyValueItem).min(1);
export const horizontalBarThinSchema = z.array(keyValueItem).min(1);
export const verticalBarSchema = z.array(keyValueItem).min(1);
export const verticalBarMultiSchema = z.array(multiBarItem).min(1);

export const lineSchema = z.array(lineSeries).min(1).max(1);
export const lineMultiSchema = z.array(lineSeries).min(1);

export const pieSchema = z.array(pieItem).min(1);
export const pieImageSchema = z.array(pieItem).min(1);
export const donutSchema = z.array(pieItem).min(1);
export const halfDonutSchema = z.array(pieItem).min(1);
export const fillableSchema = z.array(pieItem).min(1);
export const fillableDonutSchema = z.array(pieItem).min(1);

export const breakdownSchema = z
  .array(
    z.object({
      key: z.string(),
      value: z.number(),
      color: z.string().nullable(),
    }),
  )
  .min(1);
export const breakdownThinSchema = breakdownSchema;

export const benchmarkSchema = z
  .array(
    z.object({
      key: z.string(),
      value: z.number(),
      colorFrom: z.string().nullable(),
      colorTo: z.string().nullable(),
    }),
  )
  .min(1);

export const treemapSchema = z.array(treemapItem).min(1);
export const scatterSchema = z.array(scatterPoint).min(1);

const bubblePoint = z.object({
  name: z.string().describe("Item label"),
  sector: z.string().describe("Category/group for color"),
  value: z.number().describe("Size of bubble"),
  color: z.string().nullable(),
});

export const bubbleSchema = z.array(bubblePoint).min(1);

/** Rosencharts chartType → schema map */
export const ROSENCHARTS_OUTPUT_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  "horizontal-bar": horizontalBarSchema,
  "horizontal-bar-gradient": horizontalBarGradientSchema,
  "horizontal-bar-multi": horizontalBarMultiSchema,
  "horizontal-bar-image": horizontalBarImageSchema,
  "horizontal-bar-thin": horizontalBarThinSchema,
  "vertical-bar": verticalBarSchema,
  "vertical-bar-multi": verticalBarMultiSchema,
  line: lineSchema,
  "line-multi": lineMultiSchema,
  pie: pieSchema,
  "pie-image": pieImageSchema,
  donut: donutSchema,
  "half-donut": halfDonutSchema,
  fillable: fillableSchema,
  "fillable-donut": fillableDonutSchema,
  breakdown: breakdownSchema,
  "breakdown-thin": breakdownThinSchema,
  benchmark: benchmarkSchema,
  treemap: treemapSchema,
  scatter: scatterSchema,
  bubble: bubbleSchema,
};
