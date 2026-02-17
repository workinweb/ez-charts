# Other Charts — Prompts & Schemas

## 1. Breakdown (`breakdown`)

**Use when:** Stacked/segmented bar showing composition (e.g. budget by department, allocation).

**Prompt guidance:**
> Extract categories with numeric values. Each segment gets a portion of a horizontal bar. Use for: cost breakdown, allocation, proportional comparison.

**Schema:**
```typescript
interface BreakdownChartItem {
  id?: string;
  key: string;    // Segment label
  value: number;  // Proportion value
  color?: string; // To change colors: Tailwind gradient e.g. "from-fuchsia-300/80 to-fuchsia-400/80"
}
```

**Example:**
```json
[
  { "key": "Healthcare", "value": 23.8 },
  { "key": "Finance", "value": 31.5 },
  { "key": "Materials", "value": 18.7 },
  { "key": "Commerce", "value": 22.2 }
]
```

---

## 2. Breakdown Thin (`breakdown-thin`)

**Use when:** Same as breakdown, thinner bars.

**Schema:** Same as `BreakdownChartItem`.

---

## 3. Benchmark (`benchmark`)

**Use when:** Comparing items against a baseline or each other (e.g. model scores, benchmarks).

**Schema:**
```typescript
interface BenchmarkChartItem {
  id?: string;
  key: string;
  value: number;
  colorFrom?: string;  // To change colors: Tailwind gradient start
  colorTo?: string;   // To change colors: Tailwind gradient end
}
```

**Example:**
```json
[
  { "key": "Model 0", "value": 85.8 },
  { "key": "Model A", "value": 34.3 },
  { "key": "Model B", "value": 27.1 },
  { "key": "Model C", "value": 22.5 }
]
```

---

## 4. Tree Map (`treemap`)

**Use when:** Hierarchical data — parent categories with sub-items and values.

**Prompt guidance:**
> Extract two-level hierarchy. Each top-level category has a name and subtopics as key-value pairs. Use for: department budgets with line items, market segments with products.

**Schema:**
```typescript
interface TreeMapChartItem {
  id?: string;
  name: string;   // Parent category
  subtopics: [Record<string, number>, ...Record<string, number>[]];  // At least one object
  colorFrom?: string;  // To change colors: gradient start per parent
  colorTo?: string;   // To change colors: gradient end per parent
}
```

**Example:**
```json
[
  {
    "name": "Tech",
    "subtopics": [{ "Windows": 100, "MacOS": 120, "Linux": 110 }]
  },
  {
    "name": "Financials",
    "subtopics": [{ "Loans": 60, "Bonds": 80, "PPRs": 20 }]
  },
  {
    "name": "Energy",
    "subtopics": [{ "Petrol": 70, "Diesel": 50, "Hydrogen": 20 }]
  }
]
```

---

## 5. Scatter Chart (`scatter`)

**Use when:** X vs Y correlation, distribution of points (e.g. price vs volume, risk vs return).

**Prompt guidance:**
> Extract points with xValue, yValue, and name. Use for: correlations, clusters, XY plots.

**Schema:**
```typescript
interface ScatterChartItem {
  id?: string;
  xValue: number;
  yValue: number;
  name: string;   // Point label
  color?: string;  // To change colors: Tailwind or hex per point
}
```

**Example:**
```json
[
  { "xValue": 10, "yValue": 102.8, "name": "Company A" },
  { "xValue": 20, "yValue": 101.9, "name": "Company B" },
  { "xValue": 30, "yValue": 101.5, "name": "Company C" }
]
```
