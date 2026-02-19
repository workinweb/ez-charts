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
    "color": "#8B5CF6"
  },
  {
    "data": [
      { "date": "2024-04-30", "value": 3 },
      { "date": "2024-05-01", "value": 3.5 }
    ],
    "color": "#D946EF"
  }
]
```

## Customization

**Colors:** Add `color` per series. Format: HEX only (e.g. `"#8B5CF6"`). Rosencharts only.

**Other props:** Each series must have same date keys for alignment. Do NOT use `_seriesColors` or `fill`.
