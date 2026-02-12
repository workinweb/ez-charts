# Pie & Donut Charts — Prompts & Schemas

## 1. Pie Chart (`pie`)

**Use when:** Part-to-whole, proportions, composition (e.g. budget by category, market share).

**Prompt guidance:**
> Extract labeled segments with numeric values. Values represent proportions—they can sum to any total (100, 1000, raw counts). Use for: expense breakdown, market share, category distribution.

**Schema:**
```typescript
interface PieChartItem {
  id?: string;
  name: string;    // Segment label
  value: number;   // Numeric value (proportion)
  colorFrom?: string;  // Optional Tailwind: "text-pink-400"
  colorTo?: string;   // Optional gradient end
  logo?: string;     // Optional image URL (for pie-image)
}
```

**Example:**
```json
[
  { "name": "Healthcare", "value": 548 },
  { "name": "Utilities", "value": 412 },
  { "name": "Materials", "value": 287 },
  { "name": "Real Estate", "value": 193 },
  { "name": "Consumer", "value": 156 }
]
```

---

## 2. Pie Chart Image (`pie-image`)

**Use when:** Pie with logos or icons per segment (e.g. brands, companies).

**Schema:** Same as `PieChartItem` with `logo` URL required.

**Example:**
```json
[
  { "name": "Apple", "value": 731, "logo": "https://example.com/apple.svg" },
  { "name": "Mercedes", "value": 631, "logo": "https://example.com/mercedes.svg" }
]
```

---

## 3. Donut Chart (`donut`)

**Use when:** Same as pie but with hollow center (e.g. portfolio allocation).

**Schema:** Same as `PieChartItem`.

**Example:**
```json
[
  { "name": "NVDA", "value": 25 },
  { "name": "ETH", "value": 18 },
  { "name": "SLVR", "value": 14 }
]
```

---

## 4. Half Donut (`half-donut`)

**Use when:** Gauge-style, showing filled vs empty (e.g. progress, completion rate).

**Prompt guidance:**
> Typically 2 segments: "Filled" (achieved) and "Empty" (remaining). Values can be percentages (e.g. 30/70) or any proportional split.

**Schema:** Same as `PieChartItem`.

**Example:**
```json
[
  { "name": "Empty", "value": 30 },
  { "name": "Filled", "value": 70 }
]
```

---

## 5. Fillable (`fillable`)

**Use when:** Progress gauge (single metric as percentage of total).

**Schema:** Same as `PieChartItem` — typically 2 items: filled + empty.

**Example:**
```json
[
  { "name": "Filled", "value": 30 },
  { "name": "Empty", "value": 70 }
]
```

---

## 6. Fillable Donut (`fillable-donut`)

**Use when:** Donut-style progress gauge.

**Schema:** Same as above.
