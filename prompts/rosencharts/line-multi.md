# line-multi

**Use when:** Multiple metrics over the same time range (e.g. revenue vs cost vs profit).

**Schema:** `[{ data: [{ date, value }], color? }, ...]` — one object per series. All series share the same date range.

**Example:**
```json
[
  {
    "data": [
      { "date": "2024-04-30", "value": 4 },
      { "date": "2024-05-01", "value": 5 }
    ],
    "color": { "line": "stroke-violet-400", "point": "text-violet-300" }
  },
  {
    "data": [
      { "date": "2024-04-30", "value": 3 },
      { "date": "2024-05-01", "value": 3.5 }
    ],
    "color": { "line": "stroke-fuchsia-400", "point": "text-fuchsia-300" }
  }
]
```

## Customization

**Colors:** Add `color` per series. Same format as single line: `"stroke-X"` or `{ line: "stroke-X", point: "text-X" }`. Rosencharts only.

**Other props:** Each series must have same date keys for alignment. Do NOT use `_seriesColors` or `fill`.
