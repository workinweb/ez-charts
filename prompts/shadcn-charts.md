# Shadcn Charts Reference

Shadcn charts are built on Recharts and use a different data shape than Rosencharts.

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
  { name: "Technology", value: 548 },
  { name: "Utilities", value: 412 },
  { name: "Materials", value: 287 },
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
