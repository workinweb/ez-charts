/**
 * Shadcn chart data utilities.
 * Data may be:
 * - Raw array (legacy): [{ month, s1, s2 }] or [{ name, value, fill? }]
 * - Wrapped { _data, _seriesColors }: _data = [{ key, value, series: [{ name, value }] }]
 */

type WrappedRow = {
  key: string;
  value: string | number;
  series?: { name: string; value: number }[];
};

function parseSeriesColors(val: unknown): Record<string, string> | undefined {
  if (val == null) return undefined;
  if (typeof val === "object" && !Array.isArray(val)) return val as Record<string, string>;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, string>)
        : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function isWrappedRow(row: unknown): row is WrappedRow {
  return (
    row != null &&
    typeof row === "object" &&
    "key" in row &&
    "value" in row &&
    "series" in row &&
    Array.isArray((row as WrappedRow).series)
  );
}

/** Transform wrapped row { key, value, series } → flat { [key]: value, [s.name]: s.value } */
function flattenWrappedRow(row: WrappedRow): Record<string, string | number> {
  const flat: Record<string, string | number> = { [row.key]: row.value };
  for (const s of row.series ?? []) flat[s.name] = s.value;
  return flat;
}

/** Unwrap shadcn data: raw array or wrapped { _data, _seriesColors }. Normalizes wrapped format to flat rows. */
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
      _seriesColors?: unknown;
    };
    const rawRows = Array.isArray(obj._data) ? obj._data : [];
    const seriesColors = parseSeriesColors(obj._seriesColors);

    const rows: Record<string, string | number>[] = rawRows.map((row) => {
      if (isWrappedRow(row)) {
        const flat = flattenWrappedRow(row);
        if (seriesColors && "name" in flat && typeof flat.name === "string") {
          const fill = seriesColors[flat.name];
          if (fill) flat.fill = fill;
        }
        return flat;
      }
      return row as Record<string, string | number>;
    });

    return { rows, seriesColors };
  }
  return { rows: [] };
}

/** Convert flat rows to wrapped { _data, _seriesColors } format for persistence. */
export function wrapShadcnData(
  rows: Record<string, string | number>[],
  options: {
    chartType: string;
    seriesColors?: Record<string, string> | string;
    categoryKey?: string;
  },
): { _data: WrappedRow[]; _seriesColors: string | null } {
  const catKey =
    options.categoryKey ??
    (options.chartType === "shadcn:radar" ? "subject" : "month");
  const isPieLike =
    options.chartType === "shadcn:pie" || options.chartType === "shadcn:radial";
  const seriesColors = options.seriesColors ?? null;

  const _data: WrappedRow[] = rows.map((row) => {
    if (isPieLike && "name" in row && "value" in row) {
      return {
        key: "name",
        value: String(row.name),
        series: [{ name: "value", value: Number(row.value) }],
      };
    }
    const value = row[catKey];
    const series = Object.entries(row)
      .filter(([k]) => k !== catKey && typeof row[k] === "number")
      .map(([name, value]) => ({ name, value: Number(value) }));
    return {
      key: catKey,
      value: value != null ? String(value) : "",
      series,
    };
  });

  const parsed =
    seriesColors && typeof seriesColors === "string"
      ? parseSeriesColors(seriesColors)
      : seriesColors;
  const _seriesColors =
    parsed && Object.keys(parsed).length > 0 ? JSON.stringify(parsed) : null;

  return { _data, _seriesColors };
}
