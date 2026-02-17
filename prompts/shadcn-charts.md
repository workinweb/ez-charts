# Shadcn Charts Reference

Shadcn charts are built on Recharts and use a different data shape **and color system** than Rosencharts.

**DO NOT use Rosencharts color syntax for Shadcn:**
- No `color`, `colorFrom`, `colorTo`, or `multipleColors` on data items
- No Tailwind classes (e.g. `bg-purple-400`) — Shadcn requires **hex only**
- Cartesian charts: use `_seriesColors` in a wrapped object, not `color` on items
- Pie/radial: use `fill` (hex) per item, not `colorFrom`/`colorTo`

See [colors-rosencharts-vs-shadcn.md](./colors-rosencharts-vs-shadcn.md) for full rules.

---

## Changing Colors

| Chart Type | How to Set Colors |
|------------|-------------------|
| **shadcn:bar, shadcn:area, shadcn:line, shadcn:radar** | Wrap data with `_seriesColors`. Keys = series names (desktop, mobile, etc.). Values = hex: `"#6C5DD3"`. See below. |
| **shadcn:pie** | Add `fill` to each item: `{ name: "Tech", value: 548, fill: "#6C5DD3" }` |
| **shadcn:radial** | Add `fill` to each item: `{ name: "Tech", value: 548, fill: "#6C5DD3" }` |

**Cartesian (bar, area, line, radar) — wrap data to set series colors:**
```json
{
  "_data": [
    { "month": "January", "desktop": 186, "mobile": 80 },
    { "month": "February", "desktop": 305, "mobile": 200 }
  ],
  "_seriesColors": { "desktop": "#6C5DD3", "mobile": "#2dd4a8" }
}
```

**Pie / Radial — per-item fill:**
```json
[
  { "name": "Technology", "value": 548, "fill": "#6C5DD3" },
  { "name": "Utilities", "value": 412, "fill": "#2dd4a8" }
]
```

**Suggested palette:** `#6C5DD3`, `#BCBDEA`, `#5574e8`, `#2dd4a8`, `#e87c5c`

---

## Chart Types

| Chart Key | Description |
|-----------|-------------|
| shadcn:bar | Vertical bar chart with category axis |
| shadcn:area | Filled area chart |
| shadcn:line | Line chart with multiple series |
| shadcn:pie | Pie chart with labeled segments |
| shadcn:radar | Radar/spider chart for multi-dimensional data |
| shadcn:radial | Radial bar chart |

## Data Schemas

### Bar, Area, Line (Cartesian)

```typescript
// data = array of rows; each row has one category (string) + N numeric series
[
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
]
```

- **Category key**: `month`, `date`, `subject`, or any string field.
- **Series keys**: `desktop`, `mobile`, `tablet`, etc. — any numeric fields.

### Pie, Radial

```typescript
[
  { name: "Technology", value: 548, fill?: string },  // fill = hex to change slice color
  { name: "Utilities", value: 412, fill?: string },
  { name: "Materials", value: 287, fill?: string },
]
```

### Radar

```typescript
[
  { subject: "Math", A: 120, B: 110 },
  { subject: "Chinese", A: 98, B: 130 },
  { subject: "English", A: 86, B: 130 },
]
```

- **Category key**: `subject` (or similar).
- **Dimension keys**: `A`, `B`, etc. — numeric values per dimension.

## Chart Type → Schema Mapping

| Chart Key | Data Type |
|-----------|-----------|
| shadcn:bar | Cartesian (month + series) |
| shadcn:area | Cartesian |
| shadcn:line | Cartesian |
| shadcn:pie | { name, value }[] |
| shadcn:radar | { subject, A, B, ... }[] |
| shadcn:radial | { name, value }[] |
