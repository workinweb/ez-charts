# Chart Schemas Reference

Quick reference of all chart data interfaces. Import from `@/components/rosencharts/types` in code.

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
