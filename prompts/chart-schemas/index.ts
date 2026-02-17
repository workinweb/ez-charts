/**
 * Chart data schemas — merged from rosencharts and shadcn.
 */
import { z } from "zod";
import { ROSENCHARTS_SCHEMAS } from "./rosencharts";
import { SHADCN_SCHEMAS } from "./shadcn";

export { ROSENCHARTS_SCHEMAS } from "./rosencharts";
export { SHADCN_SCHEMAS } from "./shadcn";

/** All chartType → schema */
export const CHART_DATA_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  ...ROSENCHARTS_SCHEMAS,
  ...SHADCN_SCHEMAS,
};

/**
 * Validate chart data against the schema for the given chart type.
 */
export function validateChartData(
  chartType: string,
  data: unknown
): { success: true } | { success: false; error: string } {
  const schema = CHART_DATA_SCHEMAS[chartType];
  if (!schema) {
    return { success: true };
  }
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  const msg = result.error.issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
  return { success: false, error: msg };
}
