/**
 * Shadcn chart data utilities.
 * Data may be stored as raw array or wrapped { _data, _seriesColors } for style overrides.
 */

/** Unwrap shadcn data: may be raw array or { _data, _seriesColors } */
export function unwrapShadcnData(data: unknown): {
  rows: Record<string, string | number>[];
  seriesColors?: Record<string, string>;
} {
  if (Array.isArray(data)) {
    return { rows: data as Record<string, string | number>[] };
  }
  if (data && typeof data === "object" && "_data" in data) {
    const obj = data as {
      _data?: unknown;
      _seriesColors?: Record<string, string>;
    };
    const rows = Array.isArray(obj._data) ? obj._data : [];
    return {
      rows: rows as Record<string, string | number>[],
      seriesColors: obj._seriesColors,
    };
  }
  return { rows: [] };
}
