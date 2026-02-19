# shadcn:area — Filled Area Chart

Same structure as shadcn:bar. Always use the canonical wrapped format. Use `key: "month"` for the category column.

## Format

```json
{
  "_data": [
    { "key": "month", "value": "Jan", "series": [{ "name": "revenue", "value": 186 }, { "name": "expenses", "value": 80 }] },
    { "key": "month", "value": "Feb", "series": [{ "name": "revenue", "value": 305 }, { "name": "expenses", "value": 200 }] },
    { "key": "month", "value": "Mar", "series": [{ "name": "revenue", "value": 237 }, { "name": "expenses", "value": 120 }] }
  ],
  "_seriesColors": null
}
```

## Rules

- `key`: `"month"` for bar/area/line.
- `value`: category label.
- `series`: array of `{ name, value }`. Same series names across all rows.
- `_seriesColors`: JSON string or `null`. Use only when user requests custom colors.
- Hex colors only.
