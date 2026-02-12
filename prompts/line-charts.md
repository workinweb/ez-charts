# Line Charts — Prompts & Schemas

## 1. Single Line (`line`)

**Use when:** Time series or sequential data with one metric.

**Prompt guidance:**
> Extract date/value pairs over time. Each data point has a date (ISO string or "YYYY-MM-DD") and a numeric value. Use for: trends, time-series, stock prices over days.

**Schema:**
```typescript
interface LineChartDataPoint {
  date: string | Date;  // "2023-05-01" or Date
  value: number;
}

// Wrapped in series array:
interface LineDataSeries {
  id?: string;
  data: LineChartDataPoint[];
  color?: string | { line: string; point: string };
}
```

**Example:**
```json
[
  {
    "data": [
      { "date": "2023-04-30", "value": 4 },
      { "date": "2023-05-01", "value": 6 },
      { "date": "2023-05-02", "value": 5 },
      { "date": "2023-05-03", "value": 7 }
    ]
  }
]
```

---

## 2. Multi-Line (`line-multi`)

**Use when:** Multiple metrics over the same time range (e.g. revenue vs cost vs profit).

**Prompt guidance:**
> Extract multiple series, each with date/value pairs. All series share the same date range. Use for: comparing trends, multiple KPIs over time.

**Schema:**
```typescript
interface LineDataSeries {
  id?: string;
  data: Array<{ date: string | Date; value: number }>;
  color?: string | { line: string; point: string };  // Tailwind classes
}
```

**Example:**
```json
[
  {
    "id": "series1",
    "data": [
      { "date": "2024-04-30", "value": 4 },
      { "date": "2024-05-01", "value": 5 }
    ],
    "color": { "line": "stroke-violet-400", "point": "text-violet-300" }
  },
  {
    "id": "series2",
    "data": [
      { "date": "2024-04-30", "value": 3 },
      { "date": "2024-05-01", "value": 3.5 }
    ],
    "color": { "line": "stroke-fuchsia-400", "point": "text-fuchsia-300" }
  }
]
```

---

## 3. Line Curved (`line-curved`)

**Use when:** Single series with curved interpolation (legacy format).

**Schema:**
```typescript
interface LineChartCurvedData {
  date: string | Date;
  value: number;
}
```

**Example (flat array, not wrapped):**
```json
[
  { "date": "2023-04-30", "value": 6 },
  { "date": "2023-05-01", "value": 3 },
  { "date": "2023-05-02", "value": 9 }
]
```
