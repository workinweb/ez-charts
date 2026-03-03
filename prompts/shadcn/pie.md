# shadcn:pie — Pie Chart

Same wrapped format. Each row = one segment. Use `key: "name"` and `series: [{ name: "value", value: number }]`.

## Format

```json
{
  "_data": [
    {
      "key": "name",
      "value": "Technology",
      "series": [{ "name": "value", "value": 548 }]
    },
    {
      "key": "name",
      "value": "Utilities",
      "series": [{ "name": "value", "value": 412 }]
    },
    {
      "key": "name",
      "value": "Materials",
      "series": [{ "name": "value", "value": 287 }]
    }
  ],
  "_seriesColors": null
}
```

## Rules

- `key`: always `"name"` for pie/radial.
- `value`: segment label shown in legend.
- `series`: exactly one item — `{ "name": "value", "value": number }`.
- `_seriesColors`: JSON string mapping segment labels to hex, e.g. `"{\"Technology\":\"#6C5DD3\"}"`. Use `null` when no custom colors.
- Hex colors only.
