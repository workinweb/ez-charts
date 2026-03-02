/**
 * Strict output schemas for the createChart tool.
 * Tool returns chartData matching these schemas.
 */
import { z } from "zod";
import { ROSENCHARTS_OUTPUT_SCHEMAS } from "./rosencharts";
import { SHADCN_OUTPUT_SCHEMAS } from "./shadcn";

export { SHADCN_OUTPUT_SCHEMAS } from "./shadcn";

/** OpenAI-compatible flexible object (avoids z.record propertyNames) */
const flexibleObject = z.object({}).nullable();

/**
 * OpenAI strict mode does not support optional object properties.
 * Use plain array only — avoids _data/_seriesColors wrapped format.
 */
export const GENERIC_OUTPUT_DATA_SCHEMA = z.array(flexibleObject).min(1);

export function buildOutputSchema(selectedChartKey?: string) {
  const dataSchema = selectedChartKey
    ? ((OUTPUT_DATA_SCHEMAS[selectedChartKey] as z.ZodType<unknown>) ??
      GENERIC_OUTPUT_DATA_SCHEMA)
    : GENERIC_OUTPUT_DATA_SCHEMA;

  return z.object({
    chartType: z.string().describe("Chart type key"),
    title: z.string().describe("Chart title"),
    data: dataSchema.describe("The data to create the chart with"),
    message: z.string().describe("The Message to display the user"),
    chartSettings: z
      .object({
        withLabels: z.boolean().optional(),
        withLegend: z.boolean().optional(),
        categoryLabelPosition: z
          .enum(["inside", "outside"])
          .optional(),
      })
      .optional()
      .describe(
        "Optional display options. Bar: withLabels, withLegend (stacked only), categoryLabelPosition (horizontal only). Omit when not needed.",
      ),
  });
}

/** All chartType → strict output data schema */
export const OUTPUT_DATA_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  ...ROSENCHARTS_OUTPUT_SCHEMAS,
  ...SHADCN_OUTPUT_SCHEMAS,
};
