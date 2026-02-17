# shadcn:bar

Vertical bar chart. Cartesian format.

## Data format

Plain array (no colors):
```json
[
  { "month": "Jan", "series3": 45, "dded": 186, "xxa": 80, "ccc": 12 },
  { "month": "Feb", "series3": 120, "dded": 305, "xxa": 200, "ccc": 0 },
  { "month": "Mar", "series3": 85, "dded": 237, "xxa": 120, "ccc": 0 }
]
```

With colors — wrap with `_data` and `_seriesColors`:
```json
{
  "_data": [
    { "month": "Jan", "series3": 45, "dded": 186, "xxa": 80, "ccc": 12 },
    { "month": "Feb", "series3": 120, "dded": 305, "xxa": 200, "ccc": 0 },
    { "month": "Mar", "series3": 85, "dded": 237, "xxa": 120, "ccc": 0 }
  ],
  "_seriesColors": {
    "ccc": "#70f76e",
    "series3": "#3f2bbf"
  }
}
```

## Rules

- First string column = category (e.g. "month"). All other columns are numeric series.
- `_seriesColors` is PARTIAL: only include the series the user wants colored. Unlisted series keep defaults.
- Keys in `_seriesColors` = exact column names from the rows (e.g. "series3", "ccc", "dded").
- HEX only (e.g. "#3f2bbf"). No Tailwind, no CSS vars, no `color` on row items.
- NEVER add `color`, `colorFrom`, or `colorTo` to items — those are Rosencharts only.
- When attached chart is a raw array and user asks to change colors: wrap with `_data` + `_seriesColors`.
