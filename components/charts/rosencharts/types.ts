import type { ReactNode } from "react";

// ── Bar Charts ────────────────────────────────────────────────────────
export interface HorizontalBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
}

export interface GradientBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
}

export interface MultiBarData {
  id?: string;
  key: string;
  values: number[];
  multipleColors?: string[];
  image?: string;
}

export interface SVGBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
  image: ReactNode;
}

export interface ImageBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
  image: string;
}

export interface VerticalBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;
}

export type VerticalMultiBarData = MultiBarData;

// ── Line Charts ───────────────────────────────────────────────────────
export interface LineDataSeries {
  id?: string;
  data: Array<{ date: string | Date; value: number }>;
  color?: string | { line: string; point: string };
}

export interface LineChartData {
  id?: string;
  date: string | Date;
  value: number;
}

export interface LineChartCurvedData {
  date: string | Date;
  value: number;
}

export interface LineChartDataPoint {
  id?: string;
  date: string | Date;
  value: number;
}

// ── Pie / Donut Charts ───────────────────────────────────────────────
export interface PieChartItem {
  id?: string;
  name: string;
  value: number;
  colorFrom?: string;
  colorTo?: string;
  logo?: string;
}

export type DonutChartItem = PieChartItem;

// ── Breakdown ─────────────────────────────────────────────────────────
export interface BreakdownChartItem {
  id?: string;
  key: string;
  value: number;
  color?: string;
}

// ── Benchmark ─────────────────────────────────────────────────────────
export interface BenchmarkChartItem {
  id?: string;
  key: string;
  value: number;
  colorFrom?: string;
  colorTo?: string;
}

// ── TreeMap ───────────────────────────────────────────────────────────
export interface TreeMapChartItem {
  id?: string;
  name: string;
  subtopics: Array<{ key: string; value: number }>;
  colorFrom?: string;
  colorTo?: string;
}

// ── Scatter ───────────────────────────────────────────────────────────
export interface ScatterChartItem {
  id?: string;
  xValue: number;
  yValue: number;
  name: string;
  color?: string;
}
