import { z } from "zod";

const shadcnCartesianData = z
  .object({
    _data: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          series: z.array(
            z.object({
              name: z.string(),
              value: z.number(),
            }),
          ),
        }),
      )
      .min(1)
      .describe(
        "Array of row objects. Each row: key (category name e.g. 'month'), value (category label), series (array of { name, value } for each series). Use key:'month' for bar/area/line, key:'subject' for radar.",
      ),
    _seriesColors: z
      .string()
      .nullable()
      .describe(
        'JSON string of per-series color overrides e.g. \'{"revenue":"#6C5DD3","profit":"#FF0000"}\'. Keys must match series key names in _data rows. Set to null if no colors needed.',
      ),
  })
  .describe(
    "Cartesian chart data. Always use this wrapped format. Set _seriesColors to null when no custom colors are needed.",
  );

/** Pie/Radial: same _data shape. Each row = one segment. key="name", value=segment label, series=[{name:"value", value:number}] */
const shadcnPieWrapped = z
  .object({
    _data: z
      .array(
        z.object({
          key: z.string().describe("Use 'name' for pie/radial segment label"),
          value: z.string().describe("Segment label shown in the chart legend"),
          series: z
            .array(
              z.object({
                name: z.string().describe("Use 'value' for the numeric field"),
                value: z.number().describe("Numeric value for this segment"),
              }),
            )
            .min(1)
            .describe("One item: { name: 'value', value: number }"),
        }),
      )
      .min(1)
      .describe(
        "Array of segment rows. Each row: key:'name', value: label, series:[{name:'value', value}]",
      ),
    _seriesColors: z
      .string()
      .nullable()
      .describe(
        'JSON string of per-segment colors e.g. \'{"Technology":"#6C5DD3"}\'. Keys match segment labels. Set to null if no custom colors.',
      ),
  })
  .describe(
    "Pie/Radial chart data. Same wrapped format as Cartesian. Set _seriesColors to null when no custom colors.",
  );

export const shadcnBarSchema = shadcnCartesianData;
export const shadcnBarHorizontalSchema = shadcnCartesianData;
export const shadcnBarStackedSchema = shadcnCartesianData;
export const shadcnAreaSchema = shadcnCartesianData;
export const shadcnLineSchema = shadcnCartesianData;
export const shadcnRadarSchema = shadcnCartesianData;
export const shadcnPieSchema = shadcnPieWrapped;
export const shadcnDonutSchema = shadcnPieWrapped;
export const shadcnRadialSchema = shadcnPieWrapped;

export const SHADCN_OUTPUT_SCHEMAS: Record<string, z.ZodType<unknown>> = {
  "shadcn:bar": shadcnBarSchema,
  "shadcn:bar-horizontal": shadcnBarHorizontalSchema,
  "shadcn:bar-stacked": shadcnBarStackedSchema,
  "shadcn:area": shadcnAreaSchema,
  "shadcn:line": shadcnLineSchema,
  "shadcn:radar": shadcnRadarSchema,
  "shadcn:pie": shadcnPieSchema,
  "shadcn:donut": shadcnDonutSchema,
  "shadcn:radial": shadcnRadialSchema,
};
