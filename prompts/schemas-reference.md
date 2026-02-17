# Chart Schemas Reference

Quick reference of all chart data interfaces. Import from `@/components/rosencharts/types` in code.

## Changing Colors

When the user asks to "change colors" or specify a color scheme, add the appropriate color fields to each data item or series.

### Rosencharts — Tailwind classes or hex

| Chart Type | Color Field(s) | Format | Where |
|------------|----------------|--------|-------|
| horizontal-bar, horizontal-bar-thin, vertical-bar | `color` | Tailwind: `"bg-purple-400"` or hex `"#6C5DD3"` | Per item |
| horizontal-bar-gradient | `color` | Tailwind gradient: `"bg-gradient-to-r from-pink-300 to-pink-400"` | Per item |
| horizontal-bar-multi, vertical-bar-multi | `multipleColors` | `["bg-blue-400", "bg-green-400", "bg-amber-400"]` | Per item, one per value |
| horizontal-bar-image | `color` | Tailwind or hex | Per item |
| pie, pie-image, donut, half-donut, fillable, fillable-donut | `colorFrom`, `colorTo` | Tailwind: `"text-pink-400"`, `"text-pink-600"` (gradient) | Per item |
| line (single) | `color` | `"stroke-violet-400"` or `{ line: "stroke-violet-400", point: "text-violet-300" }` | Per series |
| line-multi | `color` | Same as line | Per series |
| breakdown, breakdown-thin | `color` | Tailwind: `"from-fuchsia-300/80 to-fuchsia-400/80"` | Per item |
| benchmark | `colorFrom`, `colorTo` | Tailwind gradient | Per item |
| treemap | `colorFrom`, `colorTo` | Per parent category | Per item |
| scatter | `color` | Tailwind or hex | Per point |

### Shadcn charts — hex, RGB, or CSS variables

| Chart Type | Color Field(s) | Format | Where |
|------------|----------------|--------|-------|
| shadcn:bar, shadcn:area, shadcn:line, shadcn:radar | `_seriesColors` | `{ "desktop": "#6C5DD3", "mobile": "#2dd4a8" }` | Wrapped: `{ _data: [...], _seriesColors: {...} }` |
| shadcn:pie | `fill` | Hex `"#6C5DD3"` or `"var(--chart-1)"` | Per item in data |
| shadcn:radial | `fill` | Same as pie | Per item in data |

**Shadcn Cartesian (bar, area, line, radar)**: Wrap data when setting series colors:
```json
{
  "_data": [{ "month": "Jan", "desktop": 186, "mobile": 80 }],
  "_seriesColors": { "desktop": "#6C5DD3", "mobile": "#2dd4a8" }
}
```

**Brand palette (suggested)**: `#6C5DD3`, `#BCBDEA`, `#5574e8`, `#2dd4a8`, `#e87c5c`, `#8b95a8`, `#7c6ee8`, `#354052`

---

## Bar Charts

```typescript
interface HorizontalBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
}

interface GradientBarData extends HorizontalBarData {}

interface MultiBarData {
  id?: string;
  key: string;
  values: number[];
  multipleColors?: string[];
  image?: string;
}

interface ImageBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
  image: string;
}

interface VerticalBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
}
```

## Line Charts

```typescript
interface LineChartDataPoint {
  date: string | Date;
  value: number;
}

interface LineDataSeries {
  id?: string;
  data: LineChartDataPoint[];
  color?: string | { line: string; point: string };
}

interface LineChartCurvedData {
  date: string | Date;
  value: number;
}
```

## Pie / Donut

```typescript
interface PieChartItem {
  id?: string;
  name: string;
  value: number;
  colorFrom?: string;
  colorTo?: string;
  logo?: string;
}

type DonutChartItem = PieChartItem;
```

## Other

```typescript
interface BreakdownChartItem {
  id?: string;
  key: string;
  value: number;
  color?: string;
}

interface BenchmarkChartItem {
  id?: string;
  key: string;
  value: number;
  colorFrom?: string;
  colorTo?: string;
}

interface TreeMapChartItem {
  id?: string;
  name: string;
  subtopics: [Record<string, number>, ...Record<string, number>[]];
  colorFrom?: string;
  colorTo?: string;
}

interface ScatterChartItem {
  id?: string;
  xValue: number;
  yValue: number;
  name: string;
  color?: string;
}
```

## Chart Type → Schema Mapping

| Chart Key | Data Type |
|-----------|-----------|
| horizontal-bar | HorizontalBarData[] |
| horizontal-bar-gradient | GradientBarData[] |
| horizontal-bar-multi | MultiBarData[] |
| horizontal-bar-image | ImageBarData[] |
| horizontal-bar-thin | HorizontalBarData[] |
| vertical-bar | VerticalBarData[] |
| vertical-bar-multi | MultiBarData[] |
| line | LineDataSeries[] (single series) |
| line-multi | LineDataSeries[] |
| line-curved | LineChartCurvedData[] |
| pie | PieChartItem[] |
| pie-image | PieChartItem[] |
| donut | DonutChartItem[] |
| half-donut | PieChartItem[] |
| fillable | PieChartItem[] |
| fillable-donut | PieChartItem[] |
| breakdown | BreakdownChartItem[] |
| breakdown-thin | BreakdownChartItem[] |
| benchmark | BenchmarkChartItem[] |
| treemap | TreeMapChartItem[] |
| scatter | ScatterChartItem[] |

## Shadcn Charts

See [shadcn-charts.md](./shadcn-charts.md) for full reference.

| Chart Key | Data Type |
|-----------|-----------|
| shadcn:bar | [{ month, desktop, mobile, ... }] |
| shadcn:area | [{ month, desktop, mobile, ... }] |
| shadcn:line | [{ month, desktop, mobile, ... }] |
| shadcn:pie | [{ name, value }] |
| shadcn:radar | [{ subject, A, B, ... }] |
| shadcn:radial | [{ name, value }] |
