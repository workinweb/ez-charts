/**
 * Per-chart Zod schemas for Rosencharts.
 */
import { z } from "zod";

// ─── Building blocks ──────────────────────────────────────────────────────

const keyValueItem = z.object({
  key: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

const multiBarItem = z.object({
  key: z.string(),
  values: z.array(z.number()).min(1),
  multipleColors: z.array(z.string()).optional(),
  image: z.string().optional(),
});

const pieItem = z.object({
  name: z.string(),
  value: z.number(),
  colorFrom: z.string().optional(),
  colorTo: z.string().optional(),
  logo: z.string().optional(),
});

const linePoint = z.object({
  date: z.string(),
  value: z.number(),
});

const lineSeries = z.object({
  data: z.array(linePoint).min(1),
  color: z.union([z.string(), z.object({ line: z.string(), point: z.string() })]).optional(),
});

const scatterPoint = z.object({
  xValue: z.number(),
  yValue: z.number(),
  name: z.string(),
  color: z.string().optional(),
});

const treemapItem = z.object({
  name: z.string(),
  subtopics: z.array(z.record(z.string(), z.number())).min(1),
  colorFrom: z.string().optional(),
  colorTo: z.string().optional(),
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
  .array(z.object({ key: z.string(), value: z.number(), color: z.string().optional() }))
  .min(1);
export const breakdownThinSchema = breakdownSchema;

export const benchmarkSchema = z
  .array(
    z.object({
      key: z.string(),
      value: z.number(),
      colorFrom: z.string().optional(),
      colorTo: z.string().optional(),
    })
  )
  .min(1);

export const treemapSchema = z.array(treemapItem).min(1);
export const scatterSchema = z.array(scatterPoint).min(1);

/** Rosencharts chartType → schema map */
export const ROSENCHARTS_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  "horizontal-bar": horizontalBarSchema,
  "horizontal-bar-gradient": horizontalBarGradientSchema,
  "horizontal-bar-multi": horizontalBarMultiSchema,
  "horizontal-bar-image": horizontalBarImageSchema,
  "horizontal-bar-thin": horizontalBarThinSchema,
  "vertical-bar": verticalBarSchema,
  "vertical-bar-multi": verticalBarMultiSchema,
  "line": lineSchema,
  "line-multi": lineMultiSchema,
  "pie": pieSchema,
  "pie-image": pieImageSchema,
  "donut": donutSchema,
  "half-donut": halfDonutSchema,
  "fillable": fillableSchema,
  "fillable-donut": fillableDonutSchema,
  "breakdown": breakdownSchema,
  "breakdown-thin": breakdownThinSchema,
  "benchmark": benchmarkSchema,
  "treemap": treemapSchema,
  "scatter": scatterSchema,
};
