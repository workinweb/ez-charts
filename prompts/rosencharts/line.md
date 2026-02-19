# line (single series)

**Use when:** Time series or sequential data with one metric.

**Schema:** `[{ data: [{ date, value }, ...], color? }]` — MUST wrap points in a series. Use ISO dates (`YYYY-MM-DD`).

**Example:**
```json
[
  {
    "data": [
      { "date": "2023-04-30", "value": 4 },
      { "date": "2023-05-01", "value": 6 }
    ]
  }
]
```

## Customization

**Colors:** Add `color` to the series object. Format: HEX only (e.g. `"#8B5CF6"`). Rosencharts only.

**Other props:** `date` must be ISO string. `value` = numeric. Series wrapper is required.
