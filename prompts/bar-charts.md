# Bar Charts — Prompts & Schemas

## 1. Horizontal Bar (`horizontal-bar`)

**Use when:** Comparing categories with single values (e.g. sales by region, rankings).

**Prompt guidance:**
> Extract or generate data with category labels and numeric values. Each row: a label (key) and a value. Sort by value descending for best visual. Use for: rankings, regional comparisons, market share by category.

**Schema:**
```typescript
interface HorizontalBarData {
  id?: string;      // Optional unique id
  key: string;     // Category label (e.g. "Technology", "North Region")
  value: number;   // Numeric value
  color?: string;  // Optional: Tailwind "bg-purple-400" or hex "#6C5DD3" — set per bar to change colors
}
```

**Example:**
```json
[
  { "key": "Technology", "value": 38.1 },
  { "key": "Financial Services", "value": 27.8 },
  { "key": "Renewable Energy", "value": 23.1 },
  { "key": "Consumer Cyclical", "value": 19.5 }
]
```

---

## 2. Horizontal Bar Gradient (`horizontal-bar-gradient`)

**Use when:** Same as horizontal bar but with per-bar gradient colors.

**Schema:**
```typescript
interface GradientBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;  // To change colors: Tailwind gradient e.g. "bg-gradient-to-r from-pink-300 to-pink-400"
}
```

**Example:**
```json
[
  { "key": "Technology", "value": 38.1, "color": "bg-gradient-to-r from-pink-300 to-pink-400" },
  { "key": "Banking", "value": 29.6, "color": "bg-gradient-to-r from-purple-300 to-purple-400" }
]
```

---

## 3. Horizontal Bar Multi (`horizontal-bar-multi`)

**Use when:** Comparing multiple values per category (e.g. Q1, Q2, Q3 by region).

**Prompt guidance:**
> Extract categories with multiple numeric series. Each row has one label and an array of values. Example: regions with [revenue, cost, profit] or years with quarterly data.

**Schema:**
```typescript
interface MultiBarData {
  id?: string;
  key: string;           // Category label
  values: number[];      // Array of values (one bar per value)
  multipleColors?: string[];  // To change colors: one per value, e.g. ["bg-blue-400", "bg-green-400", "bg-amber-400"]
  image?: string;        // Optional: URL for leading icon (e.g. flag)
}
```

**Example:**
```json
[
  { "key": "European Union", "values": [15, 25, 33] },
  { "key": "United States", "values": [13, 24, 31] },
  { "key": "Japan", "values": [7, 18, 24] }
]
```

---

## 4. Horizontal Bar Image (`horizontal-bar-image`)

**Use when:** Bars with company logos, flags, or images.

**Schema:**
```typescript
interface ImageBarData {
  id?: string;
  key: string;
  value: number;
  color?: string;  // To change colors: Tailwind or hex per bar
  image: string;  // URL to image (SVG or PNG)
}
```

**Example:**
```json
[
  { "key": "Portugal", "value": 55.8, "image": "https://hatscripts.github.io/circle-flags/flags/pt.svg" },
  { "key": "France", "value": 34.3, "image": "https://hatscripts.github.io/circle-flags/flags/fr.svg" }
]
```

---

## 5. Horizontal Bar Thin (`horizontal-bar-thin`)

**Use when:** Many categories, compact view (e.g. country rankings, long lists).

**Schema:** Same as `HorizontalBarData` — `{ key, value }`.

**Example:**
```json
[
  { "key": "France", "value": 38.1 },
  { "key": "Spain", "value": 25.3 },
  { "key": "Italy", "value": 23.1 }
]
```

---

## 6. Vertical Bar (`vertical-bar`)

**Use when:** Categories on X-axis, values on Y-axis (e.g. months, quarters).

**Schema:**
```typescript
interface VerticalBarData {
  id?: string;
  key: string;    // X-axis label
  value: number;
  color?: string;  // To change colors: Tailwind "bg-purple-400" or hex per bar
}
```

**Example:**
```json
[
  { "key": "Software", "value": 34.7 },
  { "key": "Energy", "value": 17.2 },
  { "key": "Renewable", "value": 39.0 }
]
```

---

## 7. Vertical Bar Multi (`vertical-bar-multi`)

**Use when:** Multiple series per X category (e.g. actual vs projected by month).

**Schema:** Same as `MultiBarData` — `{ key, values }`.

**Example:**
```json
[
  { "key": "Jan 2020", "values": [11.1, 9.5] },
  { "key": "Feb 2020", "values": [18.3, 16.7] },
  { "key": "Mar 2020", "values": [25.1, 19.5] }
]
```
