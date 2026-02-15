/**
 * Shadcn chart data types. These follow Recharts/shadcn conventions.
 */

/** Bar, Area, Line: rows with category + multiple numeric series */
export interface ShadcnCartesianDataPoint {
  [categoryKey: string]: string | number;
}

/** Pie: name + value + optional fill */
export interface ShadcnPieDataPoint {
  name: string;
  value: number;
  fill?: string;
}

/** Radar: subject + multiple numeric dimensions */
export interface ShadcnRadarDataPoint {
  subject: string;
  [dimension: string]: string | number;
}

/** Radial: name + value */
export interface ShadcnRadialDataPoint {
  name: string;
  value: number;
}
