/**
 * Per-chart Zod schemas for Shadcn.
 */
import { z } from "zod";

const shadcnCartesianRow = z
  .record(z.string(), z.union([z.string(), z.number()]))
  .describe(
    "Row object: one string category key (e.g. month) + numeric series columns",
  );

const shadcnCartesianData = z.union([
  z.array(shadcnCartesianRow).min(1).describe("Plain rows (no custom colors)"),
  z
    .object({
      _data: z.array(shadcnCartesianRow).min(1).describe("The data rows"),
      _seriesColors: z
        .record(z.string(), z.string())
        .optional()
        .describe(
          "PARTIAL color map — only the series to color. Keys = exact numeric column names from _data rows, values = hex (e.g. #3f2bbf). Unlisted series keep defaults.",
        ),
    })
    .describe("Wrapped format with optional per-series colors"),
]);

const shadcnPieItem = z.object({
  name: z.string().describe("Segment label"),
  value: z.number().describe("Segment value"),
  fill: z
    .string()
    .optional()
    .describe(
      "Hex color for this segment (e.g. #6C5DD3). Omit to keep default.",
    ),
});

export const shadcnBarSchema = shadcnCartesianData;
export const shadcnAreaSchema = shadcnCartesianData;
export const shadcnLineSchema = shadcnCartesianData;
export const shadcnRadarSchema = shadcnCartesianData;
export const shadcnPieSchema = z.array(shadcnPieItem).min(1);
export const shadcnRadialSchema = z.array(shadcnPieItem).min(1);

/** Shadcn chartType → schema map */
export const SHADCN_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  "shadcn:bar": shadcnBarSchema,
  "shadcn:area": shadcnAreaSchema,
  "shadcn:line": shadcnLineSchema,
  "shadcn:radar": shadcnRadarSchema,
  "shadcn:pie": shadcnPieSchema,
  "shadcn:radial": shadcnRadialSchema,
};
