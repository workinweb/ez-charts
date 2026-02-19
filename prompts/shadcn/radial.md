# shadcn:radial — Radial Bar Chart

Same format as shadcn:pie. Each row = one segment.

## Format

```json
{
  "_data": [
    { "key": "name", "value": "Tech", "series": [{ "name": "value", "value": 548 }] },
    { "key": "name", "value": "Utils", "series": [{ "name": "value", "value": 412 }] },
    { "key": "name", "value": "Health", "series": [{ "name": "value", "value": 320 }] }
  ],
  "_seriesColors": null
}
```

## Rules

- `key`: always `"name"` for pie/radial.
- `value`: segment label.
- `series`: exactly one item — `{ "name": "value", "value": number }`.
- `_seriesColors`: JSON string or `null`. Use only when user requests custom colors.
- Hex colors only.
