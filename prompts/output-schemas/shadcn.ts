import { z } from "zod";

const shadcnCartesianRow = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .describe(
    "One data row. Must contain exactly one string category key (e.g. 'month', 'quarter') and one or more numeric keys for each series (e.g. 'revenue', 'profit'). All numeric key names must be consistent across every row.",
  );

const shadcnCartesianData = z.union([
  z
    .array(shadcnCartesianRow)
    .min(1)
    .describe(
      "Use this format when no custom colors are needed. Array of row objects.",
    ),
  z
    .object({
      _data: z
        .array(shadcnCartesianRow)
        .min(1)
        .describe(
          "Array of row objects. Each row must have one string category key and one or more numeric series keys.",
        ),
      _seriesColors: z
        .record(z.string(), z.string())
        .nullable()
        .describe(
          "Optional per-series color overrides. Keys MUST exactly match numeric series key names that appear in _data rows (e.g. if rows have 'revenue' and 'profit', valid keys are 'revenue' and/or 'profit'). Values are hex colors (e.g. '#6C5DD3'). Only include series you want to override — unlisted series use defaults. Set to null if no color overrides are needed.",
        ),
    })
    .describe(
      "Use this format only when custom per-series colors are required. _seriesColors keys must match series keys in _data.",
    ),
]);

const shadcnPieItem = z.object({
  name: z.string().describe("Segment label shown in the chart legend"),
  value: z.number().describe("Numeric value for this segment"),
  fill: z
    .string()
    .nullable()
    .describe(
      "Hex color for this segment (e.g. '#6C5DD3'). Set to null to use the default color.",
    ),
});

export const shadcnBarSchema = shadcnCartesianData;
export const shadcnAreaSchema = shadcnCartesianData;
export const shadcnLineSchema = shadcnCartesianData;
export const shadcnRadarSchema = shadcnCartesianData;
export const shadcnPieSchema = z.array(shadcnPieItem).min(1);
export const shadcnRadialSchema = z.array(shadcnPieItem).min(1);

export const SHADCN_OUTPUT_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  "shadcn:bar": shadcnBarSchema,
  "shadcn:area": shadcnAreaSchema,
  "shadcn:line": shadcnLineSchema,
  "shadcn:radar": shadcnRadarSchema,
  "shadcn:pie": shadcnPieSchema,
  "shadcn:radial": shadcnRadialSchema,
};
